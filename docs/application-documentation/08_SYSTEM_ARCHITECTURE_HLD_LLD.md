# 08. System Architecture: High-Level & Low-Level Design (HLD & LLD)

This document details the architectural blueprints of the **Energy Demand Forecasting Tool**, documenting the relationship between the React frontend, FastAPI backend, in-memory caching layers, and persistent storage artifacts.

---

## 1. High-Level Design (HLD) Diagram

The system follows a decoupled Client-Server architecture. The React SPA communicates with the asynchronous FastAPI backend exclusively via JSON-over-HTTP REST APIs:

```mermaid
graph TB
    subgraph ClientLayer["Frontend Client Layer (Browser)"]
        UI["React 19 Single Page Application<br/>(Tailwind CSS v4 + Recharts)"]
        Router["React Router DOM (v7)<br/>Declarative Protected Routes"]
        Axios["Centralized Axios HTTP Client<br/>(Request/Response Interceptors)"]
        UI --> Router
        Router --> Axios
    end

    subgraph NetworkProxy["Network & Security Boundary"]
        ViteProxy["Vite Dev Reverse Proxy (:5173)<br/>/api -> http://127.0.0.1:8000"]
        Axios --> ViteProxy
    end

    subgraph BackendLayer["FastAPI Application Server (:8000)"]
        FastAPI["FastAPI REST Application (main.py)<br/>CORS Middleware + Lifespan Handler"]
        Routers["REST API Routers<br/>/health, /historical, /forecast, /model, /anomalies, /metrics, /comparison, /auth"]
        Schemas["Pydantic v2 Schemas<br/>Request Validation & Response Serialization"]
        
        FastAPI --> Routers
        Routers --> Schemas
    end

    subgraph ServiceLayer["Business Logic & Service Layer"]
        DataSvc["data_service.py<br/>Date Filtering & Stats"]
        PredictSvc["predictor.py<br/>Prophet Inference & Aggregation"]
        EvalSvc["evaluation_service.py<br/>70/30 Split & Baseline Benchmark"]
        AnomalySvc["anomaly_service.py<br/>MAD Residual Thresholding"]
        ModelLoader["model_loader.py<br/>Artifact Deserialization & Metadata"]
    end

    subgraph IngestAndCache["In-Memory Singleton Caches"]
        OPSDCache["_CACHED_OPSD_DF<br/>(2,100 Daily Records in Memory)"]
        ProphetCache["_CACHED_PROPHET_MODEL<br/>(Pre-compiled Stan Binary)"]
        AnomalyCache["_CACHED_ANOMALIES<br/>(96 Flagged Events in Memory)"]
    end

    subgraph StorageLayer["Persistent Disk Storage Layer"]
        CSVData["opsd_daily.csv<br/>(2,100 Rows)"]
        ModelJSON["prophet_model.json<br/>(Trained Model Artifact)"]
        EvalCSV["evaluation_predictions.csv<br/>(630 Test Rows)"]
        AnomalyCSV["detected_anomalies.csv<br/>(96 Events)"]
    end

    ViteProxy --> FastAPI
    Routers --> ServiceLayer
    ServiceLayer --> IngestAndCache
    IngestAndCache --> StorageLayer
```

---

## 2. Low-Level Design (LLD) Diagram

The LLD illustrates internal class hierarchies, Pydantic data contracts, and Python module interactions:

```mermaid
classDiagram
    class Settings {
        +Path PROJECT_ROOT
        +Path BACKEND_DIR
        +Path OPSD_DAILY_PATH
        +Path PROPHET_MODEL_PATH
        +str DATASET_MODE
        +str DEMO_EMAIL
        +str DEMO_PASSWORD
    }

    class OPSDLoader {
        -_CACHED_OPSD_DF: DataFrame
        -_CACHED_OPSD_RECORDS: List[dict]
        +load_opsd_daily(path, force_reload) DataFrame
        +get_opsd_observations() List[dict]
        +get_opsd_metadata() dict
    }

    class PredictorService {
        -_CACHED_PROPHET_MODEL: Prophet
        +load_trained_prophet_model(path, force_reload) Prophet
        +generate_forecast(request: ForecastRequest) dict
        +is_prophet_available() bool
    }

    class EvaluationService {
        +get_test_evaluation(mode) dict
        +train_evaluation_prophet_model(train_df) Prophet
        +calculate_metrics(actual, predicted) dict
    }

    class AnomalyService {
        -_CACHED_ANOMALIES: List[dict]
        +detect_opsd_anomalies() List[dict]
        +get_detected_anomalies(type, severity, page, page_size) dict
        +calculate_mad_threshold(residuals, k) float
    }

    class Schemas {
        +HealthResponse
        +HistoricalResponse
        +ForecastRequest
        +ForecastResponse
        +ModelInfoResponse
        +AnomaliesResponse
        +ModelMetricsResponse
        +ComparisonResponse
    }

    Settings <-- OPSDLoader
    Settings <-- PredictorService
    Settings <-- EvaluationService
    Settings <-- AnomalyService
    OPSDLoader --> DataService
    OPSDLoader --> EvaluationService
    OPSDLoader --> AnomalyService
    PredictorService --> Schemas
    AnomalyService --> Schemas
    EvaluationService --> Schemas
```

---

## 3. Frontend-to-Backend Request Flow

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser (React 19)
    participant Interceptor as Axios Interceptor (api.js)
    participant ViteProxy as Vite Dev Proxy (:5173)
    participant FastAPI as FastAPI Engine (:8000)
    participant Router as API Router
    participant Service as Domain Service
    
    Browser->>Interceptor: Calls dataAPI.getHistorical(start, end)
    Interceptor->>Interceptor: Attaches Authorization Bearer Token (if present)
    Interceptor->>ViteProxy: GET /api/v1/historical?start_date=...
    ViteProxy->>FastAPI: Forwards HTTP request to http://127.0.0.1:8000
    FastAPI->>Router: Routes to historical.py:get_historical()
    Router->>Service: data_service.get_historical_dataset()
    Service->>Service: Slices cached observations DataFrame
    Service-->>Router: Returns serialized observation dict & stats
    Router-->>FastAPI: Validates via HistoricalResponse schema
    FastAPI-->>ViteProxy: HTTP 200 OK + JSON
    ViteProxy-->>Interceptor: HTTP 200 OK
    Interceptor->>Interceptor: Response interceptor unpacks response.data
    Interceptor-->>Browser: Resolves Promise with data
```

---

## 4. Detailed Data Processing Flow

```mermaid
flowchart LR
    A["Raw ENTSO-E 60-min Archive<br/>50,401 Rows"] -->|Hourly Mean<br/>Pandas Resample| B["Daily OPSD CSV<br/>2,100 Rows"]
    B -->|FastAPI Lifespan Startup| C["opsd_loader.py Validation"]
    C -->|Check Monotonicity<br/>No Duplicates, Demand > 0| D["In-Memory DataFrame Cache"]
    D -->|Slice: 2015-01-01 to 2019-01-09| E["70% Train Partition<br/>(1,470 Days)"]
    D -->|Slice: 2019-01-10 to 2020-09-30| F["30% Test Partition<br/>(630 Days)"]
    E -->|Prophet Fit| G["Evaluation Prophet Model"]
    F -->|Inference| H["Test Predictions (yhat)"]
    F -->|Lag y(t-7)| I["Seasonal-Naive Baseline"]
    H & I -->|Compute Residuals| J["Metrics Engine<br/>MAE, RMSE, MAPE"]
    E -->|Training Residuals| K["MAD Formulation<br/>τ = 4,586.28 MW"]
    K & D -->|Scan 2,100 Days| L["Anomaly Registry<br/>(96 Events)"]
```

---

## 5. Forecast Generation Flow

```mermaid
flowchart TD
    Req["Incoming ForecastRequest<br/>(Frequency, Horizon, Changepoint, Seasonality)"] --> Val{"Validation Checks"}
    Val -->|Horizon not in [7,14,30,60]| Err1["HTTP 400 Bad Request<br/>Invalid Horizon"]
    Val -->|Frequency not in [daily, weekly]| Err2["HTTP 400 Bad Request<br/>Invalid Frequency"]
    Val -->|Valid Parameters| Cache["Retrieve Cached Prophet Model Artifact"]
    Cache --> Frame["make_future_dataframe(periods=H, freq='D', include_history=False)"]
    Frame --> Cutoff["Generate Dates starting 2020-10-01<br/>(Post-Historical Extrapolation)"]
    Cutoff --> Infer["model.predict(future)<br/>Compute yhat, yhat_lower, yhat_upper"]
    Infer --> Scale["Apply Changepoint Flexibility Multiplier<br/>(Conservative: 0.85, Balanced: 1.0, Flexible: 1.25)"]
    Scale --> ModeCheck{"Frequency Mode?"}
    ModeCheck -->|Daily| DailyRes["Format Daily ForecastPoint Objects"]
    ModeCheck -->|Weekly| WeekAgg["Segment into 7-Day Calendar Intervals<br/>Mean MW = sum(yhat)/7<br/>Total Energy MWh = Mean MW × 168h"]
    DailyRes & WeekAgg --> Summary["Calculate Peak, Base, and % Shift vs Latest Actual"]
    Summary --> Resp["Return ForecastResponse JSON Object"]
```

---

## 6. Model Evaluation Flow

```mermaid
flowchart TD
    EvalStart["Initiate Held-Out 70/30 Evaluation"] --> Data["Load Cleaned OPSD Observations (2,100 Days)"]
    Data --> Chrono["Strict Chronological Split<br/>No Random Shuffling (Zero Data Leakage)"]
    Chrono --> TrainSet["Training Set: 1,470 Days<br/>(2015-01-01 to 2019-01-09)"]
    Chrono --> TestSet["Test Set: 630 Days<br/>(2019-01-10 to 2020-09-30)"]
    TrainSet --> FitProphet["Fit Evaluation Prophet GAM<br/>Decomposed Trend + Fourier Seasonality + DE Holidays"]
    TestSet --> PredProphet["Generate Held-Out Prophet Predictions (yhat)"]
    TestSet --> PredNaive["Generate Seasonal-Naive Predictions (y_t = y_{t-7})"]
    PredProphet & PredNaive --> Compare["Align Ground Truth y_t with yhat_prophet and yhat_naive"]
    Compare --> Resids["Calculate Error Residuals: e_t = y_t - yhat_t"]
    Resids --> CalcMAE["Compute MAE: mean(|e_t|)"]
    Resids --> CalcRMSE["Compute RMSE: sqrt(mean(e_t^2))"]
    Resids --> CalcMAPE["Compute MAPE: mean(|e_t| / y_t) × 100"]
    CalcRMSE --> CalcGain["Compute Gain: (RMSE_naive - RMSE_prophet) / RMSE_naive = +6.51%"]
    CalcGain --> Persist["Persist evaluation_predictions.csv & metrics.json"]
```

---

## 7. Anomaly Detection Flow

```mermaid
flowchart TD
    ScanInit["Initiate Anomaly Detection Pipeline"] --> TrRes["Extract 1,470 Training Residuals (e_train)"]
    TrRes --> Med["Calculate Median Residual (M = 255.03 MW)"]
    Med --> MAD["Calculate MAD: median(|e_train - M|) = 1,031.14 MW"]
    MAD --> Sigma["Calculate Normal Consistency: σ_MAD = 1.4826 × MAD = 1,528.76 MW"]
    Sigma --> Thresh["Establish Threshold: τ = 3.0 × σ_MAD = 4,586.28 MW"]
    Thresh --> Loop["Iterate Over All 2,100 Days (t = 1 to 2,100)"]
    Loop --> Diff["Calculate Daily Residual: e_t = y_t - yhat_t"]
    Diff --> Check{"|e_t| > 4,586.28 MW?"}
    Check -->|No| Normal["Mark as Normal Observation (2,004 Days)"]
    Check -->|Yes| Flag["Flag as Anomaly Event (96 Days)"]
    Flag --> TypeCheck{"e_t > 0?"}
    TypeCheck -->|Yes| Spike["Classify as Spike (19 Events)"]
    TypeCheck -->|No| Drop["Classify as Drop (77 Events)"]
    Spike & Drop --> SevCheck{"Assign Severity Tier"}
    SevCheck -->|4,586 < |e| ≤ 5,350 MW| Low["Low Severity (21 Events)"]
    SevCheck -->|5,350 < |e| ≤ 6,879 MW| Med["Medium Severity (14 Events)"]
    SevCheck -->|> 6,879 MW| High["High Severity (61 Events)"]
    Low & Med & High --> JSON["Serialize detected_anomalies.csv & .json"]
```
