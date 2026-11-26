"""Test suite for Phase 2: Baseline vs Prophet Model Evaluation Pipeline.

Verifies:
  - Strict 70/30 chronological splitting without lookahead bias
  - Disjoint train and test partitions
  - Seasonal-naive baseline calculation using identical test dates
  - Prophet evaluation without data leakage
  - Generation and persistence of evaluation_predictions.csv and evaluation_comparison.json
  - Generation and validity of all 4 diagnostic plot images
  - Backend integration via /api/v1/metrics and /api/v1/comparison
"""
import pytest
from pathlib import Path
import pandas as pd
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.data.opsd_loader import (
    load_opsd_daily,
    get_train_test_split,
    get_opsd_dataframe,
    get_opsd_metadata
)
from app.services.evaluation_service import (
    calculate_metrics,
    run_full_evaluation,
    get_test_evaluation,
    get_detailed_comparison
)

client = TestClient(app)


# ----------------- 1. Dataset & Chronological Splitting -----------------

def test_opsd_daily_dataset_properties():
    """Verify OPSD dataset integrity: 2,100 consecutive calendar days, no nulls, no duplicates."""
    df = get_opsd_dataframe()
    assert len(df) == 2100
    assert "ds" in df.columns and "y" in df.columns
    assert df["ds"].isnull().sum() == 0
    assert df["y"].isnull().sum() == 0
    assert df["ds"].duplicated().sum() == 0
    assert (df["y"] <= 0).sum() == 0
    assert df["ds"].is_monotonic_increasing


def test_chronological_70_30_split():
    """Verify strict chronological splitting with 1,470 train and 630 test days."""
    train_df, test_df = get_train_test_split(split_ratio=0.70)
    
    assert len(train_df) == 1470
    assert len(test_df) == 630
    assert len(train_df) + len(test_df) == 2100

    # Strict temporal boundary check (no temporal overlap / lookahead bias)
    train_end = train_df["ds"].max()
    test_start = test_df["ds"].min()
    assert train_end < test_start, f"Train end {train_end} must be strictly before test start {test_start}"

    # Verify set disjointness
    train_dates = set(train_df["ds"].dt.strftime("%Y-%m-%d"))
    test_dates = set(test_df["ds"].dt.strftime("%Y-%m-%d"))
    assert train_dates.isdisjoint(test_dates)


# ----------------- 2. Baseline Model & Data Leakage -----------------

def test_baseline_uses_identical_test_dates():
    """Verify that both Baseline and Prophet evaluate on exactly the same 630 dates."""
    eval_data = run_full_evaluation()
    pred_df = eval_data["predictions_df"]

    assert len(pred_df) == 630
    assert "date" in pred_df.columns
    assert "actual_demand" in pred_df.columns
    assert "baseline_prediction" in pred_df.columns
    assert "prophet_prediction" in pred_df.columns

    # Verify baseline is 7-day lookback from full dataset
    full_df = get_opsd_dataframe()
    for i in range(10):  # spot-check first 10 rows
        expected_naive = float(full_df.iloc[1470 + i - 7]["y"])
        actual_naive = float(pred_df.iloc[i]["baseline_prediction"])
        assert round(expected_naive, 2) == round(actual_naive, 2)


def test_data_leakage_audit_flag():
    """Verify that the evaluation pipeline explicitly documents the data leakage audit."""
    eval_data = run_full_evaluation()
    meta = eval_data["metadata"]
    audit = meta["data_leakage_audit"]

    assert audit["original_artifact_had_leakage"] is True
    assert audit["evaluation_model_leakage_free"] is True
    assert "trained on all 2,100" in audit["original_artifact_explanation"].lower()


# ----------------- 3. Metrics Calculation Accuracy -----------------

def test_metrics_calculation_formula():
    """Verify mathematical correctness of MAE, RMSE, and MAPE calculations."""
    actuals = [50000.0, 60000.0, 55000.0]
    preds = [52000.0, 58000.0, 56000.0]
    # abs err: 2000, 2000, 1000 -> MAE = 5000 / 3 = 1666.67
    # sq err: 4e6, 4e6, 1e6 -> MSE = 9e6 / 3 = 3e6 -> RMSE = 1732.05
    res = calculate_metrics(actuals, preds)
    assert res["mae"] == 1666.67
    assert res["rmse"] == 1732.05
    assert res["mape"] > 0


# ----------------- 4. Persistence of Evaluation Outputs -----------------

def test_evaluation_files_persisted():
    """Verify that prediction CSV and comparison JSON exist on disk and are non-empty."""
    eval_data = run_full_evaluation()
    csv_path = settings.EVALUATION_PREDICTIONS_PATH
    json_path = settings.EVALUATION_METRICS_PATH

    assert csv_path.exists()
    assert json_path.exists()

    df_disk = pd.read_csv(csv_path)
    assert len(df_disk) == 630
    assert set(["date", "actual_demand", "baseline_prediction", "prophet_prediction",
                "prophet_lower_bound", "prophet_upper_bound",
                "baseline_absolute_error", "prophet_absolute_error"]).issubset(set(df_disk.columns))


def test_diagnostic_plots_generated():
    """Verify that all 4 diagnostic plots exist in both static and docs folders."""
    plot_names = [
        "actual_vs_baseline.png",
        "actual_vs_prophet.png",
        "model_error_comparison.png",
        "forecast_residuals.png"
    ]
    for folder in [settings.BACKEND_DIR / "static" / "plots", settings.PROJECT_ROOT / "docs" / "plots"]:
        for name in plot_names:
            p = folder / name
            assert p.exists(), f"Plot {name} missing in {folder}"
            assert p.stat().st_size > 5000, f"Plot {name} in {folder} is too small"


# ----------------- 5. API Route Integration -----------------

def test_api_metrics_route():
    """Verify /api/v1/metrics returns both models and the 70/30 split."""
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()

    assert data["train_count"] == 1470
    assert data["test_count"] == 630
    assert data["metrics"]["mae"] > 0
    assert data["metrics"]["rmse"] > 0
    assert data["baseline_metrics"]["mae"] > 0
    assert data["baseline_metrics"]["rmse"] > 0
    assert data["baseline_metrics"]["improvement_vs_naive_rmse_pct"] is not None


def test_api_comparison_route():
    """Verify /api/v1/comparison returns 630 observations and error distributions."""
    response = client.get("/api/v1/comparison")
    assert response.status_code == 200
    data = response.json()

    assert len(data["observations"]) == 630
    assert len(data["error_distribution"]) > 0
    assert len(data["interpretation"]) >= 3
    assert data["dataset_mode"] == settings.DATASET_MODE
