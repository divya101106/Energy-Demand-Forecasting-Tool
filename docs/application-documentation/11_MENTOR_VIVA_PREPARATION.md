# 11. Mentor & Viva Evaluation Preparation Guide

This guide is specifically authored to prepare students for technical defense, mentor evaluations, viva examinations, and software engineering interviews regarding the **Energy Demand Forecasting Tool**.

---

## Part 1: Core Conceptual Foundations

### 1. What does this application do?
It is an end-to-end full-stack analytics platform that ingests real-world historical electricity demand observations for Germany from the Open Power System Data (OPSD) platform (2015–2020), executes short-term forecasting using Facebook Prophet, performs rigorous held-out 70/30 chronological evaluation against a Seasonal-Naive baseline, and identifies grid anomalies using Median Absolute Deviation (MAD).

### 2. What real-world problem does it solve?
Grid dispatchers must continuously balance power generation with consumer demand to maintain grid frequency at 50.0 Hz. Over-generation leads to expensive negative power pricing and generator curtailment; under-generation triggers brownouts and blackouts. Accurate short-term load forecasting minimizes reserve procurement costs and stabilizes the grid.

### 3. Why was OPSD selected instead of synthetic data?
Synthetic data generators rely on artificial sinusoids and Gaussian noise that cannot replicate the true structural irregularities of a modern industrialized economy (e.g. Easter holiday lulls, heatwaves, or COVID-19 industrial shutdowns). OPSD provides verified, open-access transmission data directly from European transmission operators (ENTSO-E).

### 4. Why aggregate to daily data instead of using 60-minute or 15-minute data?
Daily aggregation ($24\text{-hour mean load in MW}$) captures primary macro-level grid dynamics—specifically 7-day work cycles, seasonal shifts, and statutory holidays—without the extreme high-frequency intra-hour volatility of individual generator switching, making it optimal for multi-day and multi-week operational scheduling.

### 5. Why choose Facebook Prophet over classical ARIMA or deep learning (LSTM)?
- **ARIMA** requires continuous stationary data and struggles with dual non-integer seasonalities (e.g. 7-day weekly plus 365.25-day annual cycles) and holiday spikes without complex exogenous regressors.
- **LSTMs / Transformers** require massive hyperparameter tuning, lack built-in decomposability, and operate as uninterpretable black boxes.
- **Prophet** explicitly decomposes the series into interpretable trend, Fourier seasonality, and holiday matrices, provides analytical uncertainty intervals, and handles missing observations natively.

### 6. Why is a Seasonal-Naive baseline mandatory?
A complex machine learning model cannot be justified simply by reporting a low error number. A Seasonal-Naive model ($y_t = y_{t-7}$) costs zero compute to create. Benchmarking Prophet against this baseline proves scientifically whether the model's added complexity delivers genuine performance gains.

---

## Part 2: 28 Likely Mentor & Technical Viva Questions

#### Q1: Which exact column from the OPSD dataset is used, and what does it represent?
**Answer:** The column is `DE_load_actual_entsoe_transparency`. It represents the actual aggregate electrical load in Megawatts (MW) measured across Germany's four transmission system operator (TSO) grid control zones (50Hertz, Amprion, TenneT, and TransnetBW) as reported to the ENTSO-E transparency platform.

#### Q2: How many observations are in the dataset, and what are the exact start and end dates?
**Answer:** The dataset contains exactly 2,100 consecutive daily observations starting on January 1, 2015 (`2015-01-01`) and ending on September 30, 2020 (`2020-09-30`).

#### Q3: Why is random k-fold cross-validation prohibited for this project?
**Answer:** In time-series forecasting, observations are strongly autocorrelated. Shuffling records randomly allows future observations into the training set, causing lookahead bias (data leakage). Testing must always be performed on data strictly *after* the training period in chronological order.

#### Q4: How is the train/test split structured in your project?
**Answer:** A strict 70/30 chronological split:
- **Training partition (70%):** The first 1,470 consecutive days (`2015-01-01` to `2019-01-09`).
- **Test partition (30%):** The remaining 630 consecutive days (`2019-01-10` to `2020-09-30`).

#### Q5: What is your Seasonal-Naive baseline formula?
**Answer:** It predicts demand for day $t$ using the observed demand from exactly 7 days prior:
$$\hat{y}_t^{\text{naive}} = y_{t-7}$$
For example, Monday's predicted demand is equal to the previous Monday's actual demand.

#### Q6: What are the verified holdout evaluation results for Prophet vs. Baseline?
**Answer:** Evaluated across the identical 630 held-out test days:
- **Seasonal-Naive:** $\text{MAE} = 2,065.40\text{ MW}$, $\text{RMSE} = 3,635.66\text{ MW}$, $\text{MAPE} = 3.94\%$.
- **Prophet:** $\text{MAE} = 2,624.10\text{ MW}$, $\text{RMSE} = 3,399.04\text{ MW}$, $\text{MAPE} = 5.06\%$.
- **Outcome:** Prophet outperforms the baseline on RMSE by **$+6.51\%$** (reducing RMSE by $236.62\text{ MW}$).

#### Q7: Why does Seasonal-Naive have a lower MAE, but Prophet has a lower RMSE?
**Answer:** Seasonal-Naive predicts standard workdays with high precision during stable, uninterrupted periods, keeping its linear absolute error (MAE) low. However, when public holidays or weather transitions occur, the naive model commits massive $15,000+\text{ MW}$ errors. Because RMSE squares each error, it heavily penalizes these extreme misses. Prophet accounts for German public holidays and smooth seasonal trends, avoiding extreme misses and achieving a lower RMSE ($3,399.04\text{ MW}$ vs $3,635.66\text{ MW}$).

#### Q8: How does the application prevent data leakage when training the production model versus the evaluation model?
**Answer:** Two distinct models are maintained:
1. An **evaluation model** fit strictly on the initial 1,470 training days to benchmark valid out-of-sample performance on the remaining 630 days.
2. A **production model** ([`prophet_model.json`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/models/prophet_model.json)) fit on all 2,100 days exclusively used to generate future forecasts extending forward past `2020-09-30`.

#### Q9: What statistical method is used for anomaly detection?
**Answer:** Robust Median Absolute Deviation (MAD) calculated on model training residuals ($e_t = y_t - \hat{y}_t$).

#### Q10: Why was MAD used instead of standard deviation ($\sigma$)?
**Answer:** Standard deviation is non-robust to outliers. Extreme anomalies inflate the standard deviation, artificially expanding the threshold and masking true anomalous events. MAD uses median operations that remain stable even in the presence of extreme outliers.

#### Q11: What is the exact anomaly threshold formula and value in your project?
**Answer:**
$$\tau = k \times \hat{\sigma}_{\text{MAD}} = 3.0 \times (1.4826 \times \text{MAD}) = 4,586.28\text{ MW}$$
Derived strictly from the 1,470 training residuals ($\text{Median} = 255.03\text{ MW}$, $\text{MAD} = 1,031.14\text{ MW}$, $\hat{\sigma}_{\text{MAD}} = 1,528.76\text{ MW}$).

#### Q12: How many anomalies were detected, and what is the breakdown?
**Answer:** Exactly **96 anomalies** ($4.57\%$ of the 2,100 days):
- **Spikes (Positive):** 19 events ($y_t - \hat{y}_t > +4,586.28\text{ MW}$).
- **Drops (Negative):** 77 events ($y_t - \hat{y}_t < -4,586.28\text{ MW}$).

#### Q13: How are anomaly severity tiers defined?
**Answer:**
- **Low (Advisory, 21 events):** $4,586.28\text{ MW} < |e_t| \le 5,350.66\text{ MW}$ ($3.0\sigma$ to $3.5\sigma$).
- **Medium (Moderate, 14 events):** $5,350.66\text{ MW} < |e_t| \le 6,879.43\text{ MW}$ ($3.5\sigma$ to $4.5\sigma$).
- **High (Critical, 61 events):** $|e_t| > 6,879.43\text{ MW}$ ($> 4.5\sigma$).

#### Q14: Does your tool train the Prophet model every time a user requests a forecast?
**Answer:** No. Retraining during an API request would take 5–10 seconds and fail under concurrent traffic. The model is pre-trained and serialized as JSON on disk. During FastAPI startup (`lifespan`), it is deserialized into an in-memory singleton. Inference executes in approximately 30 ms.

#### Q15: What date do forecasts begin from?
**Answer:** All forward forecasts begin on **October 1, 2020** (`2020-10-01`), the day immediately following the end of the 2015–2020 historical dataset.

#### Q16: Can this tool forecast live demand for today in 2026?
**Answer:** No. The historical OPSD dataset concludes on September 30, 2020. Projections from this model represent out-of-sample forward extrapolations from late 2020. Describing them as live 2026 demand would be scientifically incorrect because Germany's grid structure has evolved significantly since 2020.

#### Q17: How are weekly forecasts calculated from daily Prophet predictions?
**Answer:** Prophet generates daily steps. The backend engine groups the forward days into 7-day calendar intervals and calculates:
1. **Weekly Mean Load (MW):** Average of the 7 daily predicted MW values.
2. **Total Weekly Energy (MWh):** Sum of daily load multiplied by 24 hours ($\text{Mean MW} \times 168\text{ hours}$).

#### Q18: What do `yhat_lower` and `yhat_upper` represent?
**Answer:** They represent the 95% statistical predictive uncertainty interval generated by Prophet's posterior simulation. Grid operators use the upper bound to ensure adequate spinning reserve capacity.

#### Q19: What changepoint flexibility options are available?
**Answer:** The user can select Conservative (prior scale 0.01 / multiplier 0.85), Balanced (0.05 / 1.0), or Flexible (0.15 / 1.25), adjusting how responsive the model's uncertainty envelope is to potential trend shifts.

#### Q20: Which holidays are incorporated into Prophet?
**Answer:** Federal statutory public holidays in Germany (`DE`) from the `holidays` Python package, including New Year's Day, Easter Monday, Labour Day, Ascension Day, Whit Monday, German Unity Day, and Christmas Day/Boxing Day, configured with a $[-1, +1]$ day impact window.

#### Q21: What database is used by the backend?
**Answer:** In accordance with the academic rubric and lightweight architecture specifications, no relational or external database (e.g. PostgreSQL or MongoDB) is used. Data persistence relies on validated CSV and JSON artifacts loaded into fast in-memory singletons during application startup.

#### Q22: What happens if the backend server restarts?
**Answer:** The FastAPI `@asynccontextmanager` `lifespan` handler executes on startup: it re-validates `opsd_daily.csv`, reloads `prophet_model.json`, and pre-caches the anomaly registry in memory within 1–2 seconds.

#### Q23: How does the frontend communicate with the backend?
**Answer:** The React 19 SPA uses a centralized Axios client configured via `VITE_API_BASE_URL`. In development, Vite's reverse proxy forwards `/api` requests to `http://127.0.0.1:8000`.

#### Q24: How is session authentication handled?
**Answer:** When the user logs in with `demo@example.com` / `demo123`, the backend validates credentials and returns a demo bearer session token. The frontend stores this in `localStorage` and attaches it via Axios request interceptors.

#### Q25: How many automated tests exist, and how are they divided?
**Answer:** Exactly **59 tests** across 4 test suites:
- `test_backend.py` (19 tests)
- `test_evaluation_pipeline.py` (9 tests)
- `test_anomaly_detection.py` (13 tests)
- `test_fastapi_integration.py` (18 tests)

#### Q26: What was the largest single residual error observed in holdout evaluation?
**Answer:** An absolute error of $13,697.99\text{ MW}$ observed on April 13, 2020 (Easter Monday during the height of Germany's nationwide COVID-19 manufacturing shutdown).

#### Q27: What is the primary limitation of Prophet in this application?
**Answer:** It does not currently incorporate exogenous hourly weather regressors (e.g. ambient surface temperature, wind speed, solar irradiance) or real-time wholesale electricity market prices.

#### Q28: If you had another semester to expand this tool, what would you add?
**Answer:**
1. Connect live API feeds from ENTSO-E to stream real-time 15-minute load observations.
2. Incorporate German Weather Service (DWD) temperature and cloud-cover regressors.
3. Implement an ensemble model pairing Prophet with XGBoost or LightGBM to improve short-term intra-day residual tracking.
