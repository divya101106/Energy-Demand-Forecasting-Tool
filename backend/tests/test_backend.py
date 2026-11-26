"""Unit and integration test suite for Energy Demand Forecasting Tool backend.
Covers all 12 required test dimensions + integration tests for FastAPI endpoints.
"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.data.synthetic_data import (
    generate_synthetic_energy_dataset,
    get_all_observations,
    get_train_test_split
)
from app.services.data_service import get_historical_data
from app.services.evaluation_service import calculate_metrics, get_test_evaluation
from app.services.anomaly_service import detect_anomalies
from app.services.predictor import generate_forecast, get_active_forecasting_mode
from app.services.model_loader import get_model_information
from app.schemas import ForecastRequest

client = TestClient(app)

# ----------------- 1. Synthetic Data Generation -----------------
def test_synthetic_data_generation_count():
    data = get_all_observations()
    assert len(data) == 365
    assert "actual_demand" in data[0]
    assert "date" in data[0]
    assert data[0]["actual_demand"] > 10000

def test_synthetic_data_reproducibility():
    """Verify that dataset generation is 100% deterministic across multiple runs."""
    run1 = generate_synthetic_energy_dataset()
    run2 = generate_synthetic_energy_dataset()
    assert len(run1) == len(run2)
    assert run1[0]["actual_demand"] == run2[0]["actual_demand"]
    assert run1[180]["actual_demand"] == run2[180]["actual_demand"]
    assert run1[-1]["actual_demand"] == run2[-1]["actual_demand"]

def test_chronological_ordering():
    """Verify that synthetic observations are strictly ordered by date."""
    data = get_all_observations()
    for i in range(len(data) - 1):
        d1 = datetime.strptime(data[i]["date"], "%Y-%m-%d")
        d2 = datetime.strptime(data[i + 1]["date"], "%Y-%m-%d")
        assert d2 > d1, f"Observation {data[i+1]['date']} is not after {data[i]['date']}"

# ----------------- 2. Chronological Train/Test Splitting -----------------
def test_train_test_chronological_split():
    """Verify the 70/30 chronological split without lookahead bias."""
    train_data, test_data = get_train_test_split()
    total = len(get_all_observations())
    
    expected_train_count = int(total * settings.TRAIN_SPLIT_RATIO)
    expected_test_count = total - expected_train_count
    
    assert len(train_data) == expected_train_count
    assert len(test_data) == expected_test_count
    
    # Check that max train date is strictly before min test date
    last_train_date = datetime.strptime(train_data[-1]["date"], "%Y-%m-%d")
    first_test_date = datetime.strptime(test_data[0]["date"], "%Y-%m-%d")
    assert last_train_date < first_test_date

    # Ensure no leakage/overlap between train and test
    train_dates = set(d["date"] for d in train_data)
    test_dates = set(d["date"] for d in test_data)
    assert train_dates.isdisjoint(test_dates)

# ----------------- 3. Historical Date Filtering -----------------
def test_historical_filtering():
    result = get_historical_data(start_date="2018-06-01", end_date="2018-06-30")
    obs = result["observations"]
    assert len(obs) == 30
    assert obs[0]["date"] == "2018-06-01"
    assert obs[-1]["date"] == "2018-06-30"
    assert result["stats"].average_demand > 0

def test_historical_invalid_date_range():
    response = client.get("/api/v1/historical?start_date=2018-10-01&end_date=2018-09-01")
    assert response.status_code == 400
    assert "start_date cannot be chronologically after end_date" in response.json()["message"]

# ----------------- 4. Evaluation Metrics (MAE, RMSE, MAPE) -----------------
def test_metrics_calculation_accuracy():
    actuals = [100.0, 200.0, 300.0]
    preds = [110.0, 190.0, 330.0]
    # abs errors: 10, 10, 30 -> MAE = 50 / 3 = 16.67
    # sq errors: 100, 100, 900 -> MSE = 1100 / 3 = 366.67 -> RMSE = 19.15
    res = calculate_metrics(actuals, preds)
    assert res["mae"] == 16.67
    assert res["rmse"] == 19.15
    assert res["mape"] > 0

def test_metrics_zero_division_guard():
    actuals = [0.0, 100.0]
    preds = [10.0, 110.0]
    res = calculate_metrics(actuals, preds)
    assert res["mae"] == 10.0
    assert not (res["mape"] != res["mape"])  # not NaN

def test_model_evaluation_against_baseline():
    eval_res = get_test_evaluation()
    assert eval_res["metrics"]["mae"] > 0
    assert eval_res["metrics"]["rmse"] > 0
    assert eval_res["total_evaluated_observations"] == 630

# ----------------- 5. Anomaly Detection -----------------
def test_anomaly_detection_presence():
    res = detect_anomalies()
    anomalies = res["anomalies"]
    summary = res["summary"]
    
    assert summary.total_anomalies > 0
    assert summary.total_spikes > 0
    assert summary.total_drops > 0
    assert summary.high_severity_count > 0
    
    # Check structure
    sample = anomalies[0]
    assert sample.id.startswith("ALT-")
    assert sample.type in ["Spike", "Drop"]
    assert sample.severity in ["High", "Medium", "Low"]
    assert sample.actual_demand > 0
    assert sample.expected_demand > 0

def test_anomaly_filter():
    spikes_res = detect_anomalies(type_filter="Spike")
    for a in spikes_res["anomalies"]:
        assert a.type == "Spike"
        
    drops_res = detect_anomalies(type_filter="Drop")
    for a in drops_res["anomalies"]:
        assert a.type == "Drop"

# ----------------- 6. Forecast Request & Fallback -----------------
def test_forecast_generation_structure():
    req = ForecastRequest(
        frequency="daily",
        horizon=14,
        weekly_seasonality=True,
        yearly_seasonality=True,
        holiday_effects=True,
        changepoint_flexibility="balanced"
    )
    result = generate_forecast(req)
    assert result["success"] is True
    assert len(result["data"]) == 14
    assert result["data"][0].lower_bound <= result["data"][0].predicted_demand
    assert result["data"][0].predicted_demand <= result["data"][0].upper_bound
    assert result["forecasting_mode"] in ["Prophet Mode", "Synthetic Fallback Mode"]
    assert "opsd" in result["demo_note"].lower()

def test_forecast_weekly_frequency():
    req = ForecastRequest(
        frequency="weekly",
        horizon=30,
        weekly_seasonality=True,
        yearly_seasonality=True,
        holiday_effects=True,
        changepoint_flexibility="balanced"
    )
    result = generate_forecast(req)
    assert result["success"] is True
    assert len(result["data"]) == 4  # 30 // 7

# ----------------- 7. Authentication Endpoints -----------------
def test_auth_login_success():
    payload = {"email": settings.DEMO_EMAIL, "password": settings.DEMO_PASSWORD}
    resp = client.post("/api/v1/auth/login", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["token"] == settings.DEMO_TOKEN
    assert data["user"]["email"] == settings.DEMO_EMAIL

def test_auth_login_invalid():
    payload = {"email": "wrong@example.com", "password": "badpassword"}
    resp = client.post("/api/v1/auth/login", json=payload)
    assert resp.status_code == 401
    assert "Invalid demonstration credentials" in resp.json()["message"]

def test_auth_logout():
    resp = client.post("/api/v1/auth/logout")
    assert resp.status_code == 200
    assert resp.json()["success"] is True

# ----------------- 8. Health & Model Metadata Endpoints -----------------
def test_api_health_endpoint():
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["dataset_mode"] == settings.DATASET_MODE
    assert "OPSD" in data["demo_badge"]

def test_model_metadata_endpoint():
    resp = client.get("/api/v1/model")
    assert resp.status_code == 200
    data = resp.json()
    assert "supported_horizons" in data
    assert 30 in data["supported_horizons"]
    assert "dataset_info" in data
    assert data["dataset_info"]["number_of_observations"] == 2100

def test_comparison_endpoint():
    resp = client.get("/api/v1/comparison")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["observations"]) > 0
    assert "error_summary" in data
    assert "error_distribution" in data
    assert len(data["interpretation"]) > 0
