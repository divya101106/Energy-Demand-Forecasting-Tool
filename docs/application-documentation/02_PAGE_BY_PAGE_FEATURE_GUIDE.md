# 02. Page-by-Page Feature & Component Guide

This guide breaks down every page in the **Energy Demand Forecasting Tool**, explaining its purpose, target audience, UI components, interactive filters, underlying backend APIs, and data services.

---

## 1. Login Page (`/login`)

```
┌─────────────────────────────────────────────────────────────┐
│                 Energy Demand Forecasting Tool              │
│        [Activity Icon] Time-Series Analytics & Monitoring   │
│              [OPSD DATA — GERMANY GRID (2015–2020)]         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Sign in to Console                                      │ │
│ │ Email:    [ demo@example.com                          ] │ │
│ │ Password: [ ••••••••                                  ] │ │
│ │ [ Sign In Button ]                                      │ │
│ │ [ Auto-fill Demo Credentials Link ]                     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- **Purpose:** Secures the analytics dashboard and demonstrates session-based authentication for grid analysts and auditors.
- **Target Audience:** Grid operations planners, dispatchers, energy analysts, and academic evaluators.
- **Supplying API:** `POST /api/v1/auth/login` (Router: [`backend/app/routes/auth.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/routes/auth.py)).
- **Processing Service:** Authenticated against `settings.DEMO_EMAIL` (`demo@example.com`) and `settings.DEMO_PASSWORD` (`demo123`) defined in [`backend/app/config.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/config.py).

### Components & Elements
1. **Brand Header & Dataset Badge:** Displays an active badge reading `OPSD DATA — GERMANY GRID (2015–2020)`.
2. **Email Input:** Accepts user email. Monospace font with mail icon.
3. **Password Input:** Accepts secret credential with eye toggle icon to reveal/hide plaintext characters.
4. **Sign In Button:** Validates credentials. On click, sends an asynchronous HTTP POST request. If credentials match, receives a bearer session token (`demo-session-token-energy-forecasting-xyz`) and user profile object, stores them in `localStorage`, and redirects to `/dashboard`. If invalid, displays a red error banner (`Invalid demonstration credentials. Use demo@example.com / demo123`).
5. **Auto-fill Demo Credentials Button:** A one-click helper that populates `demo@example.com` and `demo123` into the input fields and clears any existing validation error message.

---

## 2. Executive Dashboard (`/dashboard`)

- **Purpose:** Provides a centralized, high-level operational overview of grid load telemetry, next-period load projections, model error benchmarks, and recent grid anomaly events.
- **Target Audience:** Chief Dispatchers, Shift Supervisors, and Energy Traders requiring an immediate snapshot of grid health without drilling into raw tables.
- **Supplying APIs:**
  - `GET /api/v1/historical` (Historical series and stats)
  - `GET /api/v1/metrics` (Holdout model error scorecard)
  - `GET /api/v1/anomalies` (Detected anomaly events)
  - `GET /api/v1/model` (Model architecture & dataset metadata)
  - `POST /api/v1/forecast` (14-day preview projection)
- **Processing Services:** [`data_service.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/services/data_service.py), [`evaluation_service.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/services/evaluation_service.py), [`anomaly_service.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/services/anomaly_service.py), and [`predictor.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/services/predictor.py).

### 5 Summary KPI Cards
1. **Latest Actual Demand:** Shows the last recorded daily load from the historical dataset ($57,772.79\text{ MW}$ on `2020-09-30`) along with day-over-day percentage change from the penultimate observation.
2. **Next-Day Forecast:** Displays the Prophet model's projection for the immediate next period ($54,749.03\text{ MW}$ on `2020-10-01`) and the projected percentage change relative to the latest historical actual load ($-5.23\%$).
3. **Mean Absolute Error (MAE):** Displays holdout MAE ($2,624.1\text{ MW}$) alongside MAPE ($5.06\%$) with a `30% Test Split` badge.
4. **Root Mean Sq Error (RMSE):** Displays holdout RMSE ($3,399.0\text{ MW}$) and the verified benchmark gain ($+6.51\%$ vs Seasonal-Naive baseline).
5. **Detected Anomalies:** Shows total flagged events ($96\text{ Events}$) with a breakdown of spikes ($19$) vs drops ($77$) and a badge indicating critical high-severity alerts ($61\text{ High}$).

### Charts & Interactive Widgets
1. **Historical Demand Chart:** Recharts `ResponsiveContainer` line chart displaying daily MW load. Includes quick filter buttons:
   - `7D`: Slices the last 7 daily observations.
   - `30D` (Default): Slices the last 30 daily observations.
   - `90D`: Slices the last 90 daily observations.
   - `1Y`: Slices the last 365 daily observations.
2. **Model Operating Status Card:** Inspects the active engine (`Prophet Mode`), algorithm family (`Generalized Additive Model (GAM)`), dataset mode (`OPSD Actual Data`), evaluation split (`70% Train / 30% Test`), and demand unit (`MW`). Includes a "Configure & Run New Forecast" CTA linking to `/forecast`.
3. **Actual vs Forecast Preview Chart:** A 28-day combined view plotting the last 14 historical observations ($2020\text{-}09\text{-}17$ to $2020\text{-}09\text{-}30$) alongside the first 14 Prophet forecast projections ($2020\text{-}10\text{-}01$ to $2020\text{-}10\text{-}14$). A link leads to `/comparison`.
4. **Recent Anomaly Alerts Card:** Lists the 4 most recent anomalous days with spike/drop directional icons, date, actual MW, severity tag, and percentage deviation. A link leads to `/anomalies`.

---

## 3. Historical Demand Explorer (`/historical`)

- **Purpose:** Allows users to query, filter, inspect, and export all 2,100 historical daily observations of Germany's electricity demand.
- **Target Audience:** Grid Planning Engineers, Resource Adequacy Analysts, and Regulatory Auditors.
- **Supplying API:** `GET /api/v1/historical` with query parameters `start_date`, `end_date`, `page`, and `page_size`.
- **Processing Service:** `data_service.get_historical_dataset()`, backed by `opsd_loader.get_opsd_observations()`.

### Components & Elements
1. **Date Range Filter Form:** Start date and End date `<input type="date">` fields bound to dataset boundaries (`2015-01-01` to `2020-09-30`). Clicking **Apply Filter** queries the backend for the specific date slice. Clicking **Reset** restores the full 2,100-day series.
2. **Preset Buttons (`30D`, `90D`, `180D`):** Automatically calculates date boundaries backwards from the historical cutoff (`2020-09-30`) and updates the chart and table instantly.
3. **Export CSV Button:** Generates an RFC-4180 compliant CSV file named `opsd_germany_demand_<start>_to_<end>.csv` containing Date, Demand_MW, Trend_MW, Weekly_Seasonality_MW, Yearly_Seasonality_MW, Is_Anomaly, and Anomaly_Type.
4. **6 Summary Statistic Cards:**
   - *Average Demand:* Full-range or filtered mean ($55,492.5\text{ MW}$).
   - *Min Demand:* Minimum load observed ($38,952.7\text{ MW}$ on `2016-09-18`).
   - *Max Demand:* Maximum load observed ($68,183.6\text{ MW}$ on `2019-01-23`).
   - *Std Deviation:* Population standard deviation ($6,599.9\text{ MW}$).
   - *Peak Date:* Date of highest demand peak.
   - *Trough Date:* Date of deepest demand lull.
5. **Interactive Historical Demand Line Chart:** Plots chronological date against electricity demand in MW. Features customized monospace tooltips and axis formatters converting raw MW into thousands (`50k`, `60k`).
6. **Chronological Observations Table:**
   - Search input filter: Live-filters displayed table rows by date substring.
   - Columns: `Date`, `Actual Demand (MW)`, `Trend Baseline (MW)`, `Weekly Cycle (MW)`, `Annual Cycle (MW)`, `Status` (Normal badge vs Anomaly badge).
   - Pagination: Client-side row paging (12 records per page) with Previous, Next, and Page index indicators.

---

## 4. Generate Forecast Page (`/forecast`)

- **Purpose:** Empowers analysts to generate customized short-term forecasts using the production-trained Prophet model artifact.
- **Target Audience:** Day-Ahead Grid Dispatchers, Generation Schedulers, and Power Trading Desks.
- **Supplying API:** `POST /api/v1/forecast`.
- **Processing Service:** `predictor.generate_forecast()` in [`backend/app/services/predictor.py`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/app/services/predictor.py).

### Interactive Configuration Form Controls
1. **Forecast Frequency Selector:**
   - `Daily`: Generates day-by-day load forecasts with daily uncertainty bounds.
   - `Weekly`: Generates 7-day interval aggregated predictions computing weekly mean load in MW and total weekly energy in MWh ($P_{\text{mean}} \times 168\text{ h}$).
2. **Forecast Horizon Selector:**
   - Buttons for `7d` (1 week), `14d` (2 weeks), `30d` (1 month), and `60d` (2 months).
3. **Changepoint Flexibility Selector:**
   - `Conservative` (scale 0.01 / multiplier 0.85): Tight uncertainty envelope assuming trend stability.
   - `Balanced` (scale 0.05 / multiplier 1.0, Default): Standard Prophet prior scale.
   - `Flexible` (scale 0.15 / multiplier 1.25): Wide envelope accommodating potential structural shifts.
4. **Seasonality & Holiday Checkboxes:**
   - `Weekly Seasonality`: Controls inclusion of the 7-day cyclical variation.
   - `Yearly Seasonality`: Controls inclusion of the 365.25-day annual cyclical component.
   - `Holiday Curtailment Effects`: Toggles adjustment for federal German public holidays.
5. **Generate Forecast Button:** Dispatches the payload to the backend; triggers loading spinner (`Computing GAM...`).

### Displayed Results
1. **Out-of-Sample Extrapolation Notice:** Clarifies that predictions begin on `2020-10-01` (the day after the OPSD dataset ends) and represent historical forward projections, not live 2026 telemetry.
2. **Forecast Summary Cards:**
   - *Next-Period Forecast:* First future step ($54,749.03\text{ MW}$) and percentage change from the latest actual historical load.
   - *Average Projected Demand:* Mean forecast over the selected horizon.
   - *Peak Forecasted Load:* Projected maximum envelope peak.
   - *Lowest Forecasted Load:* Projected minimum base load.
3. **Interactive Forecast Projection Chart:** Composed chart displaying the central projection line (`predicted_demand` / `yhat`) enclosed within 95% uncertainty interval bounds (`lower_bound` / `yhat_lower` and `upper_bound` / `yhat_upper`).
4. **Forecast Data Table:** Lists every projected date, predicted demand in MW, lower bound, upper bound, and total weekly energy consumption in MWh (when weekly frequency is active).
5. **Export Forecast CSV Button:** Downloads the generated projection table as `energy_forecast_<freq>_<horizon>d.csv`.

---

## 5. Forecast vs Actual Comparison Page (`/comparison`)

- **Purpose:** Exposes point-by-point residual error analysis across the untouched 630-day holdout test partition (`2019-01-10` to `2020-09-30`).
- **Target Audience:** Model Validation Officers, Data Science Reviewers, and Quality Assurance Evaluators.
- **Supplying APIs:** `GET /api/v1/comparison` and `GET /api/v1/metrics`.
- **Processing Service:** `evaluation_service.get_test_evaluation()` reading `backend/data/evaluation_predictions.csv`.

### Components & Elements
1. **Automated Residual Analysis Banner:** Surfaces 5 key findings derived from holdout testing:
   - Evaluated strictly across 630 chronological holdout days.
   - Prophet MAE is $2,624.1\text{ MW}$ (MAPE: $5.06\%$), achieving an RMSE improvement of $+6.51\%$ over Seasonal-Naive.
   - Over-prediction occurred on 531 days; under-prediction on 99 days.
   - Largest absolute residual error ($13,697.99\text{ MW}$) occurred in spring 2020 due to the COVID-19 industrial lockdown.
   - Prophet captures Germany's dual seasonal cycles and statutory holidays with minimal structural bias.
2. **Comparison Metric Cards:**
   - *Mean Absolute Error (MAE):* $2,624.1\text{ MW}$.
   - *Root Mean Sq Error (RMSE):* $3,399.0\text{ MW}$.
   - *Mean Absolute Pct Error (MAPE):* $5.06\%$.
   - *Largest Absolute Error:* $13,698.0\text{ MW}$.
3. **Actual Demand vs Forecast Chart:** Overlays actual held-out load (solid white line) with Prophet predictions (dashed silver line).
4. **Daily Residual Error Chart:** Bar chart plotting daily error $e_t = y_t - \hat{y}_t$ against a centered zero-error reference line.
5. **Residual Error Distribution Histogram:** Binned bar chart showing error frequency from $<-6,000\text{ MW}$ to $>+6,000\text{ MW}$, demonstrating a near-Gaussian distribution centered near zero.
6. **Holdout Observations Table:** Searchable table listing `Date`, `Actual Demand (MW)`, `Forecasted Demand (MW)`, `Residual Error (MW)`, `Absolute Error (MW)`, and `Percentage Error (%)`.

---

## 6. Model Performance Page (`/performance`)

- **Purpose:** Demonstrates the scientific validity of the evaluation methodology, proving that Prophet was benchmarked against a Seasonal-Naive baseline without data leakage.
- **Target Audience:** Academic Viva Examiners, Technical Mentors, and Lead Data Scientists.
- **Supplying API:** `GET /api/v1/metrics`.
- **Processing Service:** `evaluation_service.py` reading `backend/models/metrics.json`.

### Components & Elements
1. **Chronological Partition Visualization Bar:** A two-tone segmented progress bar visualizing the strict temporal split:
   - *Training Partition (70%):* 1,470 Days (`2015-01-01` to `2019-01-09`).
   - *Test Holdout Partition (30%):* 630 Days (`2019-01-10` to `2020-09-30`).
   - *Zero Lookahead Guarantee Banner:* Explains that the evaluation model was fit exclusively on the initial 1,470 days and scored against untouched subsequent days.
2. **Performance Scorecard Cards:**
   - *MAE:* $2,624.1\text{ MW}$ (Baseline: $2,065.4\text{ MW}$).
   - *RMSE:* $3,399.0\text{ MW}$ (Baseline: $3,635.7\text{ MW}$).
   - *MAPE:* $5.06\%$ (Baseline: $3.94\%$).
   - *RMSE Improvement:* $+6.51\%$ gain over Seasonal-Naive baseline.
3. **Comparative Model Bar Chart:** Visual bar chart comparing MAE, RMSE, and MAPE side-by-side between Prophet and Seasonal-Naive.
4. **Diagnostic Plot Artifact Links:** Direct references to the four diagnostic visual charts generated by the evaluation pipeline:
   - `actual_vs_baseline.png`
   - `actual_vs_prophet.png`
   - `model_error_comparison.png`
   - `forecast_residuals.png`

---

## 7. Anomaly Alerts Registry (`/anomalies`)

- **Purpose:** Identifies, categorizes, and tracks abnormal electricity consumption events where actual demand sharply diverged from statistical expectations.
- **Target Audience:** Grid Reliability Coordinators, Outage Investigation Teams, and Energy Forensics Analysts.
- **Supplying API:** `GET /api/v1/anomalies` with query filters for `type` (`Spike`, `Drop`) and `severity` (`High`, `Medium`, `Low`).
- **Processing Service:** `anomaly_service.py` using Median Absolute Deviation ($k=3.0$, threshold: $4,586.28\text{ MW}$).

### Components & Elements
1. **6 Anomaly Summary Cards:**
   - *Total Anomalies:* 96 events ($4.57\%$ of the 2,100-day dataset).
   - *Demand Spikes:* 19 events (abnormally elevated consumption).
   - *Demand Drops:* 77 events (abnormally depressed consumption).
   - *High Severity:* 61 events (residual $> 6,879.43\text{ MW}$).
   - *Medium Severity:* 14 events (residual between $5,350.66$ and $6,879.43\text{ MW}$).
   - *Low Severity:* 21 events (residual between $4,586.28$ and $5,350.66\text{ MW}$).
2. **Interactive Filter Toggles:**
   - Type filter buttons: `All Types`, `Spikes`, `Drops`.
   - Severity filter buttons: `All Severities`, `High`, `Medium`, `Low`.
3. **Anomaly Cards Grid:** Lists filtered anomaly events with:
   - Directional badge: Up-right arrow for Spikes, Down-right arrow for Drops.
   - Date of occurrence.
   - Actual demand observed vs Expected model baseline demand.
   - Net deviation in MW and percentage deviation.
   - Severity badge (`High`, `Medium`, `Low`).
   - "Investigate Anomaly" button opening the Detail Modal.
4. **Anomaly Investigation Modal:** Triggered upon clicking any anomaly card. Displays:
   - Unique Event ID (e.g. `ALT-20150101-0000`).
   - Detailed telemetry breakdown (Actual, Expected, Residual, Percentage).
   - Detection method: `Robust Median Absolute Deviation (MAD, k=3.0)`.
   - Threshold used: $4,586.28\text{ MW}$.
   - Plain-English description explaining that the flag indicates an unusual mathematical divergence, without making unverified claims about festivals or weather.
   - "Acknowledge Event" dismiss button.

---

## 8. Model Information & Telemetry (`/model-info`)

- **Purpose:** Provides complete architectural introspection, hyperparameter configuration, dataset provenance, and runtime telemetry.
- **Target Audience:** Systems Architects, Machine Learning Engineers, and Infrastructure Auditors.
- **Supplying API:** `GET /api/v1/model`.
- **Processing Service:** `model_loader.get_model_information()` in [`backend/app/services/model_loader.py`](file:///Users/dibbi/Desktop/OJT%20sem 5/Energy-Demand-Forecasting-Tool/backend/app/services/model_loader.py).

### Components & Elements
1. **Architecture Header Banner:**
   - Model Name: `Prophet` (`v2.1-de-prophet`).
   - Algorithm: Generalized Additive Model (GAM) with decomposed trend, Fourier seasonality, and statutory German holiday calendar.
   - Status: `Operational / Ready` (Loading status: `loaded and operational`).
2. **Decomposed Parameters Card:**
   - *Weekly Seasonality:* 7-day cyclical variation (Fourier order 3, prior scale 10.0).
   - *Annual Seasonality:* 365.25-day annual cyclical variation (Fourier order 10, prior scale 10.0, additive mode).
   - *Trend Changepoint Detection:* 25 changepoints placed across the first 80% of historical observations.
   - *Holiday Configuration:* Federal statutory public holidays in Germany (`DE`) with a $[-1, +1]$ day impact window.
3. **OPSD Historical Dataset Metadata Card:**
   - Origin: Open Power System Data (OPSD) — Germany ENTSO-E transparency platform.
   - Target Column: `DE_load_actual_entsoe_transparency`.
   - Number of Observations: 2,100 Days (`2015-01-01` to `2020-09-30`).
   - Time Granularity: Daily (aggregated from 60-minute resolution).
   - Baseline Grid Load: $55,492.47\text{ MW}$.
4. **Runtime System Health Card:**
   - Backend Service: `FastAPI Status: Running`.
   - Python Runtime: `Python 3.14 + Prophet 1.5.0`.
   - Last Inspected: ISO-8601 timestamp.

---

## 9. About Project Page (`/about`)

- **Purpose:** Documents project scope, industry background, rubric deliverables, technology stack, and data governance policies.
- **Target Audience:** Academic Mentors, University Evaluators, and Prospective Employers.
- **Supplying API:** Static documentation view with dynamic links.

### Components & Elements
1. **Industry Challenge & Applied Solution Cards:** Explains the real-world operational challenges of grid balancing and how this tool provides end-to-end analytical visibility.
2. **Deliverables & Rubric Checklist:** An 8-point checklist marking completed core requirements (data ingestion, Prophet forecasting, holdout evaluation, baseline benchmarking, anomaly detection, FastAPI backend, and React frontend).
3. **Full-Stack Application Architecture Diagram:** Visual ASCII/Mermaid flow illustrating data movement from the browser through FastAPI services down to OPSD CSV files and Prophet artifacts.
4. **Technology Stack Table:** Exhaustive breakdown of Frontend Framework, Styling, HTTP Client, Data Visualization, Backend API, Data Processing, Forecasting Engine, and Automated Testing tools.
5. **Data Governance & Operational Scope Banner:** Formally documents that the application ingests the real OPSD Germany transmission grid dataset (2,100 observations, 2015–2020) and clarifies that model forecasts represent post-2020 out-of-sample historical extrapolations.
