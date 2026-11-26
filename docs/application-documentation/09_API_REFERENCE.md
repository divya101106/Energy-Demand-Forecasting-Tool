# 09. RESTful API Reference Manual

This manual provides complete documentation for all REST API endpoints implemented in the **Energy Demand Forecasting Tool** backend under `/api/v1`.

---

## Endpoint Directory

| Method | Endpoint Path | Summary | Target Router File |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Application Root & Health Check | [`main.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/main.py) |
| `GET` | `/api/v1/health` | Comprehensive Health & Status | [`routes/health.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/health.py) |
| `POST` | `/api/v1/auth/login` | Session Authentication | [`routes/auth.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/auth.py) |
| `POST` | `/api/v1/auth/logout` | Session Invalidation | [`routes/auth.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/auth.py) |
| `GET` | `/api/v1/historical` | Historical Observations & Stats | [`routes/historical.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/historical.py) |
| `POST` | `/api/v1/forecast` | Out-of-Sample Forecasting | [`routes/forecast.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/forecast.py) |
| `GET` | `/api/v1/model` | Model Architecture & Specs | [`routes/model.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/model.py) |
| `GET` | `/api/v1/metrics` | 70/30 Holdout Scorecard | [`routes/metrics.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/metrics.py) |
| `GET` | `/api/v1/comparison` | Residual Observations & Errors | [`routes/comparison.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/comparison.py) |
| `GET` | `/api/v1/anomalies` | Statistical Anomaly Events | [`routes/anomalies.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/anomalies.py) |

---

## 1. `GET /api/v1/health`

### Description
Returns operational telemetry, confirming dataset ingestion status, active data mode (`OPSD Actual Data`), and Prophet model readiness.

- **Router:** [`backend/app/routes/health.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/health.py)
- **Service Function:** Direct evaluation of `opsd_loader` cache and `predictor.is_prophet_available()`.
- **Query Parameters:** None.
- **Request Body:** None.

#### Example Request
```http
GET /api/v1/health HTTP/1.1
Host: 127.0.0.1:8000
```

#### Example Response (`200 OK`)
```json
{
  "status": "healthy",
  "service": "Energy Demand Forecasting Tool",
  "forecasting_service": "operational",
  "forecasting_mode": "Prophet Mode",
  "dataset_mode": "OPSD Actual Data",
  "demo_badge": "OPSD DATA — GERMANY GRID (2015–2020)",
  "unit": "MW",
  "version": "v2.1-de-prophet",
  "dataset_available": true,
  "dataset_name": "Open Power System Data (OPSD)",
  "model_loading_status": "loaded and ready",
  "model_name": "Prophet",
  "data_source_mode": "OPSD Actual Data"
}
```

---

## 2. `POST /api/v1/auth/login`

### Description
Validates demonstration user credentials and returns a session bearer token.

- **Router:** [`backend/app/routes/auth.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/auth.py)
- **Service Function:** Internal verification against `settings.DEMO_EMAIL` / `settings.DEMO_PASSWORD`.
- **Request Body (`application/json`):**
  - `email` (string, required): Demonstration user email (`demo@example.com`).
  - `password` (string, required): Demonstration user password (`demo123`).

#### Example Request
```http
POST /api/v1/auth/login HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "demo123"
}
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "token": "demo-session-token-energy-forecasting-xyz",
  "user": {
    "email": "demo@example.com",
    "name": "Energy Operations Planner",
    "role": "Lead Grid Analyst"
  },
  "message": "Demonstration login successful. Welcome to Energy Demand Forecasting Tool."
}
```

#### Possible Errors
- `401 Unauthorized`: When invalid credentials are supplied.
  ```json
  {
    "status_code": 401,
    "error_type": "HTTPException",
    "message": "Invalid demonstration credentials. Use demo@example.com / demo123"
  }
  ```

---

## 3. `GET /api/v1/historical`

### Description
Returns chronological daily electricity demand observations from Germany's OPSD dataset, supporting date range boundaries and pagination.

- **Router:** [`backend/app/routes/historical.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/historical.py)
- **Service Function:** `data_service.get_historical_dataset()`.
- **Query Parameters:**
  - `start_date` (string, optional): Format `YYYY-MM-DD` (defaults to dataset start: `2015-01-01`).
  - `end_date` (string, optional): Format `YYYY-MM-DD` (defaults to dataset cutoff: `2020-09-30`).
  - `page` (integer, optional): Page index starting at 1.
  - `page_size` (integer, optional): Number of records per page (default: 50, maximum: 500).

#### Example Request
```http
GET /api/v1/historical?start_date=2015-01-01&end_date=2015-01-02&page=1&page_size=2 HTTP/1.1
Host: 127.0.0.1:8000
```

#### Example Response (`200 OK`)
```json
{
  "observations": [
    {
      "date": "2015-01-01",
      "demand": 45346.54,
      "trend": 55181.21,
      "weekly_seasonality": 3471.97,
      "yearly_seasonality": -11531.57,
      "is_anomaly": false,
      "anomaly_type": null,
      "severity": null
    },
    {
      "date": "2015-01-02",
      "demand": 51941.17,
      "trend": 55460.02,
      "weekly_seasonality": 2249.95,
      "yearly_seasonality": -1372.20,
      "is_anomaly": false,
      "anomaly_type": null,
      "severity": null
    }
  ],
  "stats": {
    "total_observations": 2100,
    "start_date": "2015-01-01",
    "end_date": "2020-09-30",
    "average_demand": 55492.47,
    "min_demand": 38952.67,
    "max_demand": 68183.58,
    "std_demand": 6599.90,
    "highest_demand_date": "2019-01-23",
    "lowest_demand_date": "2016-09-18",
    "unit": "MW"
  },
  "dataset_mode": "OPSD Actual Data",
  "demo_note": "Historical electricity demand from Open Power System Data (OPSD) for Germany (DE_load_actual_entsoe_transparency, 2015-01-01 to 2020-09-30, 2,100 daily observations).",
  "pagination": {
    "page": 1,
    "page_size": 2,
    "total_records": 2,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  },
  "dataset_metadata": {
    "dataset_name": "Open Power System Data (OPSD)",
    "country": "Germany",
    "target_column": "DE_load_actual_entsoe_transparency",
    "frequency": "daily",
    "unit": "MW"
  }
}
```

#### Possible Errors
- `400 Bad Request`: When `start_date > end_date` or dates are outside valid bounds.
  ```json
  {
    "status_code": 400,
    "error_type": "HTTPException",
    "message": "start_date (2020-01-01) cannot be after end_date (2019-01-01)"
  }
  ```

---

## 4. `POST /api/v1/forecast`

### Description
Executes inference using the production-trained Prophet model artifact to generate out-of-sample forward projections beginning on `2020-10-01`.

- **Router:** [`backend/app/routes/forecast.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/forecast.py)
- **Service Function:** `predictor.generate_forecast()`.
- **Request Body (`application/json`):**
  - `frequency` (string, required): `"daily"` or `"weekly"`.
  - `horizon` (integer, required): Permitted values are `7`, `14`, `30`, or `60`.
  - `weekly_seasonality` (boolean, optional): Defaults to `true`.
  - `yearly_seasonality` (boolean, optional): Defaults to `true`.
  - `holiday_effects` (boolean, optional): Defaults to `true`.
  - `changepoint_flexibility` (string, optional): `"conservative"`, `"balanced"`, or `"flexible"`.

#### Example Request
```http
POST /api/v1/forecast HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json

{
  "frequency": "weekly",
  "horizon": 14,
  "weekly_seasonality": true,
  "yearly_seasonality": true,
  "holiday_effects": true,
  "changepoint_flexibility": "balanced"
}
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "model_name": "Prophet",
  "model_version": "v2.1-de-prophet",
  "forecasting_mode": "Prophet Mode",
  "is_fallback": false,
  "forecast_frequency": "weekly",
  "horizon_days": 14,
  "generated_at": "2026-11-18T16:47:03.252689",
  "unit": "MW",
  "forecast_aggregation": "Weekly mean power demand (MW) with total energy consumption (MWh) aggregated across 7 daily steps",
  "forecast_cutoff_date": "2020-09-30",
  "data": [
    {
      "date": "2020-10-01 to 2020-10-07",
      "predicted_demand": 51323.53,
      "lower_bound": 48122.14,
      "upper_bound": 54524.92,
      "start_date": "2020-10-01",
      "end_date": "2020-10-07",
      "weekly_total_mwh": 8622353.54
    },
    {
      "date": "2020-10-08 to 2020-10-14",
      "predicted_demand": 51757.06,
      "lower_bound": 48557.05,
      "upper_bound": 54957.07,
      "start_date": "2020-10-08",
      "end_date": "2020-10-14",
      "weekly_total_mwh": 8695186.63
    }
  ],
  "summary": {
    "average_predicted_demand": 51540.29,
    "peak_forecast_demand": 51757.06,
    "lowest_forecast_demand": 51323.53,
    "next_period_predicted": 51323.53,
    "latest_historical_demand": 57772.79,
    "percent_change_next_period": -11.16,
    "forecast_origin_cutoff": "2020-09-30",
    "total_projected_energy_mwh": 17317540.17
  }
}
```

#### Possible Errors
- `400 Bad Request`: When horizon is not in `[7, 14, 30, 60]`.
  ```json
  {
    "status_code": 400,
    "error_type": "HTTPException",
    "message": "Forecast horizon must be 7, 14, 30, or 60 days"
  }
  ```

---

## 5. `GET /api/v1/model`

### Description
Returns comprehensive model specifications, decomposed hyperparameter configurations, dataset information, and runtime health.

- **Router:** [`backend/app/routes/model.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/model.py)
- **Service Function:** `model_loader.get_model_information()`.

#### Example Response (`200 OK`)
```json
{
  "model_name": "Prophet",
  "model_version": "v2.1-de-prophet",
  "model_type": "Generalized Additive Model (GAM)",
  "forecasting_algorithm": "Generalized Additive Model (GAM) with decomposed trend, Fourier seasonality, and German holiday effects",
  "forecasting_mode": "Prophet Mode",
  "is_fallback": false,
  "status": "Operational / Ready",
  "model_loading_status": "loaded and operational",
  "forecast_frequency": "Daily / Weekly (Aggregated)",
  "supported_horizons": [7, 14, 30, 60],
  "training_period": "2015-01-01 to 2019-01-09 (70% holdout training partition)",
  "dataset_info": {
    "dataset_mode": "OPSD Actual Data",
    "dataset_origin": "Open Power System Data (OPSD) — Germany",
    "target_column": "DE_load_actual_entsoe_transparency",
    "number_of_observations": 2100,
    "start_date": "2015-01-01",
    "end_date": "2020-09-30",
    "baseline_demand_mw": 55492.47
  },
  "baseline_comparison": {
    "baseline_model": "Seasonal-Naive (7-day lag)",
    "baseline_mae": 2065.40,
    "baseline_rmse": 3635.66,
    "baseline_mape": 3.94,
    "prophet_mae": 2624.10,
    "prophet_rmse": 3399.04,
    "prophet_mape": 5.06,
    "rmse_improvement_pct": 6.51,
    "better_model": "Prophet"
  }
}
```

---

## 6. `GET /api/v1/metrics`

### Description
Returns verified evaluation metrics scored against the untouched 630-day holdout test partition (`2019-01-10` to `2020-09-30`) benchmarked directly against the Seasonal-Naive baseline.

- **Router:** [`backend/app/routes/metrics.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/metrics.py)
- **Service Function:** `evaluation_service.get_test_evaluation()`.

#### Example Response (`200 OK`)
```json
{
  "model_name": "Prophet (Evaluated on Held-Out Split)",
  "model_version": "v2.1-de-prophet",
  "forecasting_mode": "Prophet Mode",
  "evaluation_period": "2019-01-10 to 2020-09-30",
  "total_evaluated_observations": 630,
  "train_count": 1470,
  "test_count": 630,
  "train_split_pct": 70.0,
  "test_split_pct": 30.0,
  "metrics": {
    "mae": 2624.10,
    "rmse": 3399.04,
    "mape": 5.06,
    "unit": "MW"
  },
  "baseline_metrics": {
    "model_name": "Seasonal-Naive (7-day lag)",
    "mae": 2065.40,
    "rmse": 3635.66,
    "mape": 3.94,
    "improvement_vs_naive_rmse_pct": 6.51
  },
  "dataset_mode": "OPSD Actual Data"
}
```

---

## 7. `GET /api/v1/comparison`

### Description
Returns point-by-point holdout actual vs. predicted values, daily residual errors, error distribution histogram bins, and automated qualitative interpretations.

- **Router:** [`backend/app/routes/comparison.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/comparison.py)
- **Service Function:** `evaluation_service.get_comparison_data()`.

#### Example Response (`200 OK`)
```json
{
  "observations": [
    {
      "date": "2019-01-10",
      "actual_demand": 64320.12,
      "forecasted_demand": 62890.45,
      "error": 1429.67,
      "absolute_error": 1429.67,
      "percentage_error": 2.22
    }
  ],
  "metrics": {
    "mae": 2624.10,
    "rmse": 3399.04,
    "mape": 5.06,
    "unit": "MW"
  },
  "error_summary": {
    "largest_absolute_error": 13697.99,
    "average_error": -2369.97,
    "over_prediction_days": 531,
    "under_prediction_days": 99,
    "total_evaluated": 630,
    "unit": "MW"
  },
  "error_distribution": [
    { "bin_range": "<-6000", "count": 28 },
    { "bin_range": "-6000 to -4000", "count": 68 },
    { "bin_range": "-4000 to -2000", "count": 184 },
    { "bin_range": "-2000 to 0", "count": 251 },
    { "bin_range": "0 to 2000", "count": 82 },
    { "bin_range": "2000 to 4000", "count": 14 },
    { "bin_range": ">4000", "count": 3 }
  ],
  "interpretation": [
    "Evaluated on 630 chronological holdout days (2019-01-10 to 2020-09-30).",
    "Prophet MAE is 2624.1 MW (MAPE: 5.06%), achieving an RMSE improvement of 6.51% over the Seasonal-Naive baseline."
  ]
}
```

---

## 8. `GET /api/v1/anomalies`

### Description
Returns statistical anomalies detected across the 2,100-day OPSD dataset using Median Absolute Deviation ($k=3.0$, threshold: $4,586.28\text{ MW}$). Supports filtering by anomaly type (`Spike`, `Drop`) and severity tier (`High`, `Medium`, `Low`).

- **Router:** [`backend/app/routes/anomalies.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/anomalies.py)
- **Service Function:** `anomaly_service.get_detected_anomalies()`.
- **Query Parameters:**
  - `type` (string, optional): `"Spike"` or `"Drop"`.
  - `severity` (string, optional): `"High"`, `"Medium"`, or `"Low"`.
  - `page` (integer, optional): Page index starting at 1.
  - `page_size` (integer, optional): Records per page.

#### Example Request
```http
GET /api/v1/anomalies?type=Drop&severity=High&page=1&page_size=2 HTTP/1.1
Host: 127.0.0.1:8000
```

#### Example Response (`200 OK`)
```json
{
  "anomalies": [
    {
      "id": "ALT-20150101-0000",
      "date": "2015-01-01",
      "type": "Drop",
      "actual_demand": 45346.54,
      "expected_demand": 54434.83,
      "deviation_mw": -9088.29,
      "deviation_pct": -16.70,
      "severity": "High",
      "status": "Active",
      "detection_method": "Robust Median Absolute Deviation (MAD, k=3.0)",
      "description": "Low Demand Anomaly: actual demand of 45,346.5 MW deviated from model baseline of 54,434.8 MW by -9,088.3 MW (-16.7%), exceeding the 4,586.3 MW threshold.",
      "threshold_used": 4586.28
    }
  ],
  "summary": {
    "total_anomalies": 96,
    "total_spikes": 19,
    "total_drops": 77,
    "high_severity_count": 61,
    "medium_severity_count": 14,
    "low_severity_count": 21
  },
  "pagination": {
    "page": 1,
    "page_size": 2,
    "total_records": 51,
    "total_pages": 26,
    "has_next": true,
    "has_prev": false
  },
  "detection_metadata": {
    "method": "Robust Median Absolute Deviation (MAD)",
    "multiplier_k": 3.0,
    "training_observations_used": 1470,
    "anomaly_threshold_mw": 4586.28
  }
}
```
