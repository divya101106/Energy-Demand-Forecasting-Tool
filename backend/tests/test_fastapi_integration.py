"""Comprehensive FastAPI Integration Test Suite for Phase 4.

Validates all HTTP API endpoints under /api/v1:
  - GET / (Root health & documentation)
  - GET /api/v1/health (Accurate operational and dataset state)
  - GET /api/v1/historical (OPSD data, date filtering, pagination, metadata)
  - POST /api/v1/forecast (Daily horizons, weekly aggregations, uncertainty bounds)
  - GET /api/v1/model (Architecture, hyperparameters, baseline comparison)
  - GET /api/v1/anomalies (Real statistical anomalies, filtering, pagination)
  - GET /api/v1/metrics (Verified 70/30 holdout evaluation metrics)
  - GET /api/v1/comparison (Test partition actual vs forecast residuals)
  - Validation error handling for invalid horizons, dates, and frequencies
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings

client = TestClient(app)


# ----------------- 1. Root & Health Endpoints -----------------

def test_root_endpoint():
    """Verify GET / returns project metadata, badge, and documentation link."""
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "Backend API is running" in data["message"]
    assert data["badge"] == settings.DEMO_BADGE
    assert data["dataset"] == settings.DATASET_NAME
    assert data["target_column"] == settings.DATASET_TARGET_COLUMN
    assert data["docs"] == "/docs"


def test_health_endpoint():
    """Verify GET /api/v1/health reports actual dataset and model status."""
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["dataset_available"] is True
    assert data["dataset_name"] == "Open Power System Data (OPSD)"
    assert data["model_loading_status"] == "loaded and ready"
    assert data["model_name"] == "Prophet"
    assert data["data_source_mode"] == settings.DATASET_MODE


# ----------------- 2. Historical Demand Endpoint -----------------

def test_historical_full_dataset():
    """Verify GET /api/v1/historical returns all 2,100 OPSD German observations."""
    resp = client.get("/api/v1/historical")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["observations"]) == 2100
    assert data["stats"]["total_observations"] == 2100
    assert data["stats"]["start_date"] == "2015-01-01"
    assert data["stats"]["end_date"] == "2020-09-30"
    assert data["dataset_metadata"]["country"] == "Germany"
    assert data["dataset_metadata"]["target_column"] == "DE_load_actual_entsoe_transparency"


def test_historical_date_filtering():
    """Verify date filtering returns exact number of days."""
    resp = client.get("/api/v1/historical?start_date=2018-01-01&end_date=2018-12-31")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["observations"]) == 365
    assert data["stats"]["total_observations"] == 365
    assert data["observations"][0]["date"] == "2018-01-01"
    assert data["observations"][-1]["date"] == "2018-12-31"


def test_historical_pagination():
    """Verify pagination slices observations and provides accurate metadata."""
    resp = client.get("/api/v1/historical?page=2&page_size=50")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["observations"]) == 50
    assert data["pagination"] is not None
    assert data["pagination"]["page"] == 2
    assert data["pagination"]["page_size"] == 50
    assert data["pagination"]["total_records"] == 2100
    assert data["pagination"]["total_pages"] == 42
    assert data["pagination"]["has_next"] is True
    assert data["pagination"]["has_prev"] is True
    # Verify page 2 starts at index 50 (day 51)
    assert data["observations"][0]["date"] == "2015-02-20"


def test_historical_invalid_date_range():
    """Verify invalid chronological range is rejected with 400 Bad Request."""
    resp = client.get("/api/v1/historical?start_date=2020-01-01&end_date=2019-01-01")
    assert resp.status_code == 400
    assert "start_date cannot be chronologically after end_date" in resp.json()["message"]


# ----------------- 3. Forecasting Endpoint -----------------

@pytest.mark.parametrize("horizon", [7, 14, 30, 60])
def test_forecast_daily_horizons(horizon):
    """Verify daily forecasting projects out-of-sample forward starting on 2020-10-01."""
    payload = {
        "frequency": "daily",
        "horizon": horizon,
        "weekly_seasonality": True,
        "yearly_seasonality": True,
        "holiday_effects": True,
        "changepoint_flexibility": "balanced"
    }
    resp = client.post("/api/v1/forecast", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["success"] is True
    assert data["model_name"] == "Prophet"
    assert data["horizon_days"] == horizon
    assert len(data["data"]) == horizon
    # Verify starting date immediately follows historical cutoff (2020-09-30)
    assert data["data"][0]["date"] == "2020-10-01"
    assert data["forecast_cutoff_date"] == "2020-09-30"

    # Verify uncertainty bounds
    for pt in data["data"]:
        assert pt["lower_bound"] <= pt["predicted_demand"] <= pt["upper_bound"]
        assert pt["predicted_demand"] > 20000.0  # realistic German grid demand in MW


def test_forecast_weekly_aggregation():
    """Verify weekly forecasting aggregates daily predictions into weekly mean MW and total MWh."""
    payload = {
        "frequency": "weekly",
        "horizon": 14,  # 14 days = 2 weeks
        "weekly_seasonality": True,
        "yearly_seasonality": True,
        "holiday_effects": True,
        "changepoint_flexibility": "balanced"
    }
    resp = client.post("/api/v1/forecast", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["success"] is True
    assert len(data["data"]) == 2  # 2 aggregated weeks
    assert "Weekly mean power demand" in data["forecast_aggregation"]
    assert "total_projected_energy_mwh" in data["summary"]
    assert data["summary"]["total_projected_energy_mwh"] > 0

    first_week = data["data"][0]
    assert first_week["start_date"] == "2020-10-01"
    assert first_week["end_date"] == "2020-10-07"
    assert first_week["weekly_total_mwh"] > 0
    assert first_week["lower_bound"] <= first_week["predicted_demand"] <= first_week["upper_bound"]


def test_forecast_invalid_parameters_rejected():
    """Verify validation guards for invalid frequencies, horizons, and flexibility."""
    # Invalid frequency
    resp = client.post("/api/v1/forecast", json={"frequency": "hourly", "horizon": 14})
    assert resp.status_code == 400
    assert "Frequency must be either 'daily' or 'weekly'" in resp.json()["message"]

    # Invalid horizon
    resp = client.post("/api/v1/forecast", json={"frequency": "daily", "horizon": 45})
    assert resp.status_code == 400
    assert "Forecast horizon must be 7, 14, 30, or 60 days" in resp.json()["message"]

    # Invalid flexibility
    resp = client.post("/api/v1/forecast", json={"frequency": "daily", "horizon": 14, "changepoint_flexibility": "extreme"})
    assert resp.status_code == 400
    assert "Changepoint flexibility must be" in resp.json()["message"]


# ----------------- 4. Model Metadata & Evaluation Endpoints -----------------

def test_model_metadata_endpoint():
    """Verify GET /api/v1/model returns complete architecture, telemetry, and baseline comparison."""
    resp = client.get("/api/v1/model")
    assert resp.status_code == 200
    data = resp.json()

    assert data["model_name"] == "Prophet"
    assert data["model_type"] == "Generalized Additive Model (GAM)"
    assert data["status"] == "Operational / Ready"
    assert data["model_loading_status"] == "loaded and operational"
    assert "2015-01-01 to 2019-01-09" in data["training_period"]
    assert data["dataset_info"]["number_of_observations"] == 2100
    assert "baseline_comparison" in data
    assert data["baseline_comparison"]["better_model"] == "Prophet"


def test_metrics_endpoint():
    """Verify GET /api/v1/metrics returns holdout evaluation metrics benchmarked against baseline."""
    resp = client.get("/api/v1/metrics")
    assert resp.status_code == 200
    data = resp.json()

    assert data["train_count"] == 1470
    assert data["test_count"] == 630
    assert data["metrics"]["mae"] == 2624.1
    assert data["metrics"]["rmse"] == 3399.04
    assert data["baseline_metrics"]["mae"] == 2065.4
    assert data["baseline_metrics"]["rmse"] == 3635.66
    assert data["baseline_metrics"]["improvement_vs_naive_rmse_pct"] == 6.51


def test_comparison_endpoint():
    """Verify GET /api/v1/comparison returns 630 evaluation points with residual distributions."""
    resp = client.get("/api/v1/comparison")
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["observations"]) == 630
    assert data["error_summary"]["total_evaluated"] == 630
    assert len(data["error_distribution"]) > 0
    assert len(data["interpretation"]) >= 3


# ----------------- 5. Anomalies Endpoint -----------------

def test_anomalies_endpoint_all():
    """Verify GET /api/v1/anomalies returns the 96 real detected anomalies."""
    resp = client.get("/api/v1/anomalies")
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["anomalies"]) == 96
    assert data["summary"]["total_anomalies"] == 96
    assert data["summary"]["total_spikes"] == 19
    assert data["summary"]["total_drops"] == 77


def test_anomalies_pagination():
    """Verify pagination on anomalies."""
    resp = client.get("/api/v1/anomalies?page=1&page_size=15")
    assert resp.status_code == 200
    data = resp.json()

    assert len(data["anomalies"]) == 15
    assert data["pagination"] is not None
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["page_size"] == 15
    assert data["pagination"]["total_records"] == 96
    assert data["pagination"]["total_pages"] == 7
    # Summary still reports total matching across entire dataset
    assert data["summary"]["total_anomalies"] == 96


def test_anomalies_filters():
    """Verify type, severity, and date filtering on anomalies."""
    # Type filter: Spike
    resp = client.get("/api/v1/anomalies?type=Spike")
    assert resp.status_code == 200
    assert len(resp.json()["anomalies"]) == 19
    assert all(a["type"] == "Spike" for a in resp.json()["anomalies"])

    # Severity filter: High
    resp = client.get("/api/v1/anomalies?severity=High")
    assert resp.status_code == 200
    assert len(resp.json()["anomalies"]) == 61
    assert all(a["severity"] == "High" for a in resp.json()["anomalies"])

    # Date filter: 2020
    resp = client.get("/api/v1/anomalies?start_date=2020-01-01&end_date=2020-09-30")
    assert resp.status_code == 200
    anoms_2020 = resp.json()["anomalies"]
    assert len(anoms_2020) > 0
    assert all("2020-01-01" <= a["date"] <= "2020-09-30" for a in anoms_2020)
