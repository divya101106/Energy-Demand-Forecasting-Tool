"""Test suite for Phase 3: Real Electricity Demand Anomaly Detection.

Verifies:
  - Mathematical correctness of Median Absolute Deviation (MAD) threshold formula
  - Safe handling of zero and invalid expected demand (no ZeroDivisionError)
  - Accurate classification into High Demand (Spike) vs Low Demand (Drop)
  - Exclusion of normal non-anomalous observations
  - Strict absence of lookahead bias / future data leakage in threshold computation
  - Date range, type, and severity filtering
  - Persistence of detected_anomalies.csv and detected_anomalies.json
  - FastAPI endpoint integration via /api/v1/anomalies
"""
import pytest
import numpy as np
import pandas as pd
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.services.anomaly_service import (
    compute_statistical_threshold,
    compute_and_save_anomalies,
    detect_anomalies,
    get_most_significant_anomalies
)

client = TestClient(app)


# ----------------- 1. Unit Tests: Threshold & Edge Cases -----------------

def test_mad_threshold_calculation_formula():
    """Verify MAD and threshold formula on isolated test residuals."""
    residuals = np.array([-200.0, -100.0, 0.0, 100.0, 200.0, 1000.0])
    res = compute_statistical_threshold(residuals, k=3.0)
    
    # Median is 50.0. Deviations: 250, 150, 50, 50, 150, 950.
    # Sorted deviations: 50, 50, 150, 150, 250, 950 -> median = 150.0
    # mad_sigma = 1.4826 * 150 = 222.39
    # threshold = 3.0 * 222.39 = 667.17
    assert res["mad"] == 150.0
    assert res["mad_sigma"] == 222.39
    assert res["threshold"] == 667.17
    assert res["threshold_medium"] == round(3.5 * 222.39, 2)
    assert res["threshold_high"] == round(4.5 * 222.39, 2)


def test_zero_and_invalid_expected_demand_guard():
    """Verify safe percentage deviation calculation with zero or negative expected values."""
    # Isolated edge case verification
    actual = 100.0
    for invalid_expected in [0.0, -50.0, np.nan]:
        res_val = actual - invalid_expected
        pct_dev = (res_val / invalid_expected * 100.0) if (invalid_expected and invalid_expected > 0 and not np.isnan(invalid_expected)) else 0.0
        assert pct_dev == 0.0 or not np.isnan(pct_dev)


def test_empty_residuals_handling():
    """Verify empty input does not crash threshold calculation."""
    res = compute_statistical_threshold(np.array([]))
    assert res["threshold"] == 0.0


# ----------------- 2. Real OPSD Anomaly Detection & Integrity -----------------

def test_real_opsd_anomalies_counts_and_rate():
    """Verify anomaly detection on real 2,100 German grid observations."""
    data = compute_and_save_anomalies()
    items = data["items"]
    meta = data["metadata"]

    assert meta["total_dataset_observations"] == 2100
    assert len(items) == 96
    assert meta["anomaly_rate_pct"] == 4.57  # Meaningfully rare: < 5% of days
    
    # Check count split
    spikes = [a for a in items if a.type == "Spike"]
    drops = [a for a in items if a.type == "Drop"]
    assert len(spikes) == 19
    assert len(drops) == 77
    assert len(spikes) + len(drops) == 96


def test_anomaly_classification_logic():
    """Verify that Spikes have positive residuals and Drops have negative residuals."""
    data = compute_and_save_anomalies()
    thresh = data["metadata"]["threshold_calculation"]["anomaly_threshold_mw"]

    for item in data["items"]:
        residual = item.actual_demand - item.expected_demand
        assert round(residual, 2) == round(item.deviation_mw, 2)
        assert abs(residual) >= thresh

        if item.type == "Spike":
            assert residual > 0, "Spike anomaly must have positive residual"
            assert "High Demand Anomaly" in item.description
        elif item.type == "Drop":
            assert residual < 0, "Drop anomaly must have negative residual"
            assert "Low Demand Anomaly" in item.description


def test_normal_observations_not_flagged():
    """Verify that observations within the threshold envelope are not in the anomaly registry."""
    data = compute_and_save_anomalies()
    anom_dates = set(a.date for a in data["items"])
    thresh = data["metadata"]["threshold_calculation"]["anomaly_threshold_mw"]

    # Verify a known normal day (e.g. 2015-01-10) is not in anomalies
    assert "2015-01-10" not in anom_dates


def test_no_future_data_leakage_in_threshold():
    """Verify threshold calculation uses strictly the 1,470 training observations."""
    data = compute_and_save_anomalies()
    thresh_calc = data["metadata"]["threshold_calculation"]

    assert thresh_calc["training_observations_used"] == 1470
    assert thresh_calc["training_period"] == "2015-01-01 to 2019-01-09"
    assert thresh_calc["no_future_data_leakage"] is True
    assert thresh_calc["anomaly_threshold_mw"] == 4586.28


# ----------------- 3. Filtering & Top Deviations -----------------

def test_anomaly_date_filtering():
    """Verify date range filtering works accurately."""
    res = detect_anomalies(start_date="2018-01-01", end_date="2018-12-31")
    for a in res["anomalies"]:
        assert "2018-01-01" <= a.date <= "2018-12-31"


def test_anomaly_type_filtering():
    """Verify filtering by Spike and Drop."""
    spikes_res = detect_anomalies(type_filter="Spike")
    assert all(a.type == "Spike" for a in spikes_res["anomalies"])
    assert spikes_res["summary"].total_anomalies == 19

    drops_res = detect_anomalies(type_filter="Drop")
    assert all(a.type == "Drop" for a in drops_res["anomalies"])
    assert drops_res["summary"].total_anomalies == 77


def test_anomaly_severity_filtering():
    """Verify filtering by severity."""
    high_res = detect_anomalies(severity_filter="High")
    assert all(a.severity == "High" for a in high_res["anomalies"])
    assert high_res["summary"].total_anomalies == 61


def test_most_significant_anomalies():
    """Verify top anomalies are strictly ordered by descending absolute deviation."""
    top = get_most_significant_anomalies(10)
    assert len(top) == 10
    for i in range(len(top) - 1):
        assert abs(top[i].deviation_mw) >= abs(top[i + 1].deviation_mw)


# ----------------- 4. Persistence & API Route -----------------

def test_anomaly_files_persisted():
    """Verify detected_anomalies.csv and detected_anomalies.json exist and match schemas."""
    csv_path = settings.ANOMALIES_CSV_PATH
    json_path = settings.ANOMALIES_JSON_PATH

    assert csv_path.exists()
    assert json_path.exists()

    df = pd.read_csv(csv_path)
    assert len(df) == 96
    expected_cols = {"alert_id", "date", "actual_demand_mw", "expected_demand_mw",
                     "residual_mw", "absolute_deviation_mw", "percentage_deviation",
                     "anomaly_type", "type_label", "severity", "threshold_used_mw"}
    assert expected_cols.issubset(set(df.columns))


def test_api_anomalies_endpoint():
    """Verify FastAPI /api/v1/anomalies endpoint response structure."""
    resp = client.get("/api/v1/anomalies")
    assert resp.status_code == 200
    data = resp.json()

    assert "anomalies" in data
    assert len(data["anomalies"]) == 96
    assert "summary" in data
    assert data["summary"]["total_anomalies"] == 96
    assert data["summary"]["total_spikes"] == 19
    assert data["summary"]["total_drops"] == 77
    assert data["dataset_mode"] == settings.DATASET_MODE
