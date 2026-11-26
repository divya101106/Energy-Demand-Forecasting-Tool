# Energy Demand Forecasting Tool — Architecture Specification

## 1. System Overview

The **Energy Demand Forecasting Tool** is an end-to-end decision-support web application engineered for electric utility planners and grid operations teams. It predicts short-term electricity load (daily/weekly horizons), evaluates forecast quality using strict temporal partitioning (70/30 chronological split), detects demand spikes and drops via residual thresholding, and provides interactive telemetry exploration.

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|   React 19 SPA (Vite + Tailwind CSS v4 + Recharts + Lucide Icons)       |
|   Dark Theme Monochrome UI | Client-Side Routing | Session Persistence  |
+-------------------------------------------------------------------------+
                                    |
                            HTTP / REST (Axios)
                          Authorization: Bearer <token>
                                    v
+-------------------------------------------------------------------------+
|                             API GATEWAY                                 |
|   FastAPI Application (/api/v1) | CORS Middleware                       |
|   Pydantic V2 Request & Response Validation | Error Handling Middleware  |
+-------------------------------------------------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                         |                         |
          v                         v                         v
+--------------------+    +--------------------+    +--------------------+
|  HISTORICAL DATA   |    |    FORECASTING     |    | ANOMALY DETECTION  |
|  & METRICS SERVICE |    |      SERVICE       |    |      SERVICE       |
|--------------------|    |--------------------|    |--------------------|
| - Date filtering   |    | - Prophet GAM fit  |    | - Rolling variance |
| - Summary stats    |    | - 95% uncertainty  |    | - Spikes & Drops   |
| - 70/30 split      |    | - Synthetic Engine |    | - Severity grading |
| - MAE/RMSE/MAPE    |    |   (Auto-Fallback)  |    | - Incident context |
+--------------------+    +--------------------+    +--------------------+
          |                         |                         |
          +-------------------------+-------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                            SYNTHETIC DATA                               |
|   Deterministic Mathematical Ingestion (365 Days, seed=42)              |
|   Baseline: 32,500 MW | Trend: +1.5%/yr | Weekly & Annual Cycles       |
|   Injected Anomaly Events (Spikes & Curtailments)                       |
+-------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### 2.1 Synthetic Time-Series Ingestion Engine
- **Module**: `backend/app/data/synthetic_data.py`
- **Design Philosophy**: For demonstration purposes, real-world data dependencies (such as large external OPSD dumps) are replaced by a 100% reproducible, deterministic 365-day time series.
- **Components**:
  1. **Base Load**: $32,500 \text{ MW}$ representative of a regional transmission grid.
  2. **Secular Trend**: Gradual growth of $+1.5\%$ across the year.
  3. **Weekly Seasonality**: Explicit weekday load elevations ($+5\%$ to $+8\%$) and weekend reductions (Saturday $-12\%$, Sunday $-18\%$).
  4. **Annual Seasonality**: Dual-harmonic composition reflecting winter heating peaks (Jan/Feb) and summer cooling peaks (Jul/Aug).
  5. **Stochastic Variation**: Bounded pseudo-random Gaussian noise ($\pm 1.8\%$).
  6. **Deliberate Anomalies**: Ground-truth injected demand surges (cold snaps, heatwaves) and curtailment drops (maintenance, holidays).

### 2.2 Model Training & Evaluation Engine
- **Module**: `backend/app/services/evaluation_service.py`
- **Chronological Split**:
  - **Training Partition**: First $70\%$ ($255$ observations, Jan 01 to Sep 12).
  - **Holdout Test Partition**: Final $30\%$ ($110$ observations, Sep 13 to Dec 31).
  - **Temporal Integrity**: Guarantees zero lookahead bias. The model never trains on future evaluation dates.
- **Evaluation Metrics**:
  - **Mean Absolute Error (MAE)**:
    $$\text{MAE} = \frac{1}{N}\sum_{t=1}^N |y_t - \hat{y}_t|$$
  - **Root Mean Squared Error (RMSE)**:
    $$\text{RMSE} = \sqrt{\frac{1}{N}\sum_{t=1}^N (y_t - \hat{y}_t)^2}$$
  - **Mean Absolute Percentage Error (MAPE)**:
    $$\text{MAPE} = \frac{100\%}{N}\sum_{t=1}^N \frac{|y_t - \hat{y}_t|}{y_t}$$
- **Baseline Benchmark**:
  - Benchmarked against a 7-day seasonal persistence naive model ($y_t = y_{t-7}$).
  - Achieves over $11.7\%$ RMSE improvement over the persistence baseline.

### 2.3 Forecasting Engine with Dual-Mode Architecture
- **Module**: `backend/app/services/predictor.py`
- **Prophet Mode (Primary)**:
  - Fits Facebook Prophet GAM on the synthetic history.
  - Generates point forecasts ($\hat{y}$) and $95\%$ confidence bounds ($\hat{y}_{\text{lower}}, \hat{y}_{\text{upper}}$).
  - Supports configurable changepoint flexibility (`conservative` $0.01$, `balanced` $0.05$, `flexible` $0.15$), weekly seasonality, annual seasonality, and holiday curtailments.
  - In-memory model caching prevents redundant refitting when hyperparameters remain identical.
- **Synthetic Fallback Mode**:
  - Automatically activates if the Prophet/Stan C++ compilation toolchain is unavailable in the execution environment.
  - Explicitly surfaces an in-app fallback badge and warning without misrepresenting synthetic projections as fitted Prophet outputs.

### 2.4 Anomaly Detection Engine
- **Module**: `backend/app/services/anomaly_service.py`
- **Method**: Evaluates residuals $e_t = y_t - \hat{y}_{t,\text{base}}$ against rolling variance bounds ($k = 2.8\sigma$).
- **Classification**:
  - $e_t > 0 \rightarrow$ **Demand Spike** (surge events).
  - $e_t < 0 \rightarrow$ **Demand Drop** (curtailment/outage events).
- **Severity Grading**:
  - $|\Delta\%| \ge 22\% \rightarrow$ **High Severity**
  - $15\% \le |\Delta\%| < 22\% \rightarrow$ **Medium Severity**
  - $10\% \le |\Delta\%| < 15\% \rightarrow$ **Low Severity**

---

## 3. Security & Session Management

- **Protocol**: RESTful JSON over HTTP with Bearer Token header authorization.
- **Demo Credentials**:
  - Email: `demo@example.com`
  - Password: `demo123`
- **Storage**: Client session cached in browser `localStorage` with route guards (`ProtectedRoute.jsx`) preventing unauthenticated access to dashboard views.

---

## 4. UI/UX Design System

- **Color Palette**: Dark theme with monochromatic tones:
  - Deep Base: `#09090b` (zinc-950)
  - Elevated Cards: `#121316` / `#18191e`
  - Subtle Borders: `#24262d` / `#2e303a`
  - Text Hierarchy: `#f4f4f5` (headings), `#a1a1aa` (subtitles), `#71717a` (muted metadata)
- **Charts**: Recharts with high-contrast curves:
  - Solid white (`#ffffff`): Actual historical observations
  - Dashed silver (`#a1a1aa`): Forecast trajectories
  - Dotted muted (`#52525b`): 95% Confidence envelope bounds
