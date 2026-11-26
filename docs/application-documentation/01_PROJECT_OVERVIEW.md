# 01. Project Overview & Executive Summary

## 1. Executive Summary & Purpose

The **Energy Demand Forecasting Tool** is an interactive, full-stack decision-support platform designed for electrical transmission system operators (TSOs), grid dispatchers, and energy market analysts. It provides chronological time-series visualization, statistical anomaly detection, baseline model benchmarking, and short-term load forecasting for Germany's national power grid.

The application couples a high-performance **FastAPI (Python 3.14)** backend with a modern, responsive **React 19** Single-Page Application (SPA) styled with **Tailwind CSS v4** in a high-contrast monochrome dark aesthetic.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Energy Demand Forecasting Tool                       │
├────────────────────────────────┬───────────────────────────────────────┤
│ Historical Ingestion           │ Open Power System Data (OPSD) Germany │
│ Target Transmission Variable   │ DE_load_actual_entsoe_transparency    │
│ Historical Period              │ 2015-01-01 to 2020-09-30 (2,100 Days) │
│ Primary Forecasting Engine     │ Facebook Prophet (Additive GAM)       │
│ Benchmark Baseline Model       │ Seasonal-Naive (7-day lag)            │
│ Anomaly Detection Engine       │ Robust Median Absolute Deviation(MAD) │
│ Backend Architecture           │ FastAPI REST API with In-Memory Cache │
│ Frontend Architecture          │ React 19 SPA + Recharts + Axios       │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. The Power Industry Problem & Core Mission

### The Grid Balancing Dilemma
In modern power networks, electricity cannot be cost-effectively stored at grid scale in massive quantities. As a result, transmission system operators must maintain a second-by-second equilibrium between electrical generation and electrical demand:

$$\sum \text{Generation}(t) = \sum \text{Demand}(t) \pm \Delta \text{Grid Losses}$$

When generation and demand diverge:
- **Over-generation ($G > D$):** System frequency exceeds 50.0 Hz. Operators must curtail generators or pay neighboring grids to absorb surplus power, incurring financial penalties.
- **Under-generation ($G < D$):** System frequency drops below 49.8 Hz. This risks brownouts, localized grid tripping, and catastrophic cascading blackouts.

### The Complexity of Electrical Load
National electricity demand exhibits overlapping cyclical patterns across multiple time horizons:
1. **Intraday / Daily Patterns:** Morning surges, midday plateaus, evening cooking/lighting peaks, and nighttime baseline lulls.
2. **Weekly Cycles:** Distinct weekday industrial loads versus lower weekend and public holiday consumption.
3. **Annual / Seasonal Cycles:** High winter demand in Germany (due to electric heating and short daylight hours) versus summer load profiles with air conditioning and solar shifts.
4. **Unprecedented Shocks & Anomalies:** Weather extremes (sub-zero Siberian cold snaps, summer heatwaves), sudden plant outages, and societal disruptions (such as the spring 2020 COVID-19 industrial lockdown).

### The Tool's Mission
To replace crude manual estimates with an automated, statistically grounded platform that:
1. Surfaces **2,100 verified historical days** of German electrical telemetry from the official ENTSO-E transparency platform.
2. Trains and executes **Facebook Prophet Generalized Additive Models (GAM)** decomposing trend, multi-frequency Fourier seasonality, and statutory German holiday schedules.
3. Rigorously evaluates model accuracy on a **strict chronological 70/30 holdout split** (1,470 training days vs. 630 test days) without lookahead bias.
4. Benchmarks performance against a **Seasonal-Naive baseline** to ensure mathematical defensibility ($RMSE$ improvement: $+6.51\%$).
5. Identifies real historical demand anomalies using **Median Absolute Deviation (MAD)** on model residuals ($k=3.0$, threshold: $4,586.28\text{ MW}$).

---

## 3. High-Level Project Directory Structure

```text
Energy-Demand-Forecasting-Tool/
├── backend/
│   ├── app/
│   │   ├── config.py                  # Pydantic Settings & environment variables
│   │   ├── main.py                    # FastAPI application initialization & lifespan context
│   │   ├── schemas.py                 # Pydantic v2 validation models & response contracts
│   │   ├── data/
│   │   │   ├── opsd_loader.py         # OPSD CSV parsing, validation, and caching singleton
│   │   │   └── synthetic_data.py      # Legacy synthetic generator (archived for unit test regression)
│   │   ├── routes/
│   │   │   ├── auth.py                # POST /api/v1/auth/login & /logout
│   │   │   ├── health.py              # GET /api/v1/health
│   │   │   ├── historical.py          # GET /api/v1/historical
│   │   │   ├── forecast.py            # POST /api/v1/forecast
│   │   │   ├── model.py               # GET /api/v1/model
│   │   │   ├── metrics.py             # GET /api/v1/metrics
│   │   │   ├── comparison.py          # GET /api/v1/comparison
│   │   │   └── anomalies.py           # GET /api/v1/anomalies
│   │   └── services/
│   │       ├── data_service.py        # Historical query filtering & statistics calculation
│   │       ├── predictor.py           # Prophet inference & weekly aggregation engine
│   │       ├── model_loader.py        # Prophet JSON deserialization & system metadata inspection
│   │       ├── evaluation_service.py  # 70/30 chronological holdout splitting & baseline benchmark
│   │       └── anomaly_service.py     # MAD residual anomaly detection & classification
│   ├── data/
│   │   ├── opsd_daily.csv             # 2,100 daily OPSD German load records (2015-01-01 to 2020-09-30)
│   │   ├── evaluation_predictions.csv # 630 held-out test predictions (Actual vs Baseline vs Prophet)
│   │   ├── detected_anomalies.csv     # 96 detected anomaly events with residuals and classifications
│   │   └── detected_anomalies.json    # JSON representation of detected anomalies
│   ├── models/
│   │   ├── prophet_model.json         # Serialized production Prophet model (2,100 training days)
│   │   ├── metrics.json               # 70/30 holdout metrics scorecard
│   │   └── evaluation_comparison.json # Detailed baseline comparison telemetry
│   ├── static/plots/                  # Pre-rendered diagnostic evaluation plots
│   └── tests/
│       ├── test_backend.py            # Backend route & contract regression tests (19 tests)
│       ├── test_evaluation_pipeline.py# 70/30 chronological split & baseline benchmark tests (9 tests)
│       ├── test_anomaly_detection.py  # MAD thresholding & zero-demand guard tests (13 tests)
│       └── test_fastapi_integration.py# End-to-end FastAPI endpoint integration tests (18 tests)
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Modular UI widgets (Navbar, Sidebar, MetricCard, etc.)
│   │   ├── context/                   # React Context (AuthContext)
│   │   ├── layouts/                   # DashboardLayout master shell
│   │   ├── pages/                     # 9 application view pages
│   │   └── services/                  # Centralized Axios client (api.js)
│   ├── .env                           # VITE_API_BASE_URL=/api/v1
│   ├── package.json                   # Dependencies (React 19, Vite, Recharts, Axios, Tailwind v4)
│   └── vite.config.js                 # Proxy config forwarding /api to http://127.0.0.1:8000
│
├── data/raw/
│   └── time_series_60min_singleindex.csv # Original 130MB 60-min OPSD archive (50,401 raw records)
└── docs/
    ├── application-documentation/     # Complete feature and data documentation suite
    └── plots/                         # Evaluation diagnostic plots
```

---

## 4. Key Accomplishments Across Implementation Phases

1. **Phase 1 (OPSD Real Data Ingestion):** Replaced synthetic mock generation with actual historical observations from Germany's electricity grid (`opsd_daily.csv`, 2,100 daily records from 2015-01-01 to 2020-09-30, mean demand: 55,492.47 MW).
2. **Phase 2 (Baseline vs Prophet Holdout Evaluation):** Eliminated data leakage in model testing by training a dedicated evaluation model strictly on the first 70% of chronological observations (1,470 days) and evaluating against the untouched final 30% holdout test partition (630 days). Established a 7-day Seasonal-Naive benchmark, showing Prophet improves RMSE by $+6.51\%$.
3. **Phase 3 (Statistical Anomaly Detection):** Implemented Median Absolute Deviation (MAD) on training residuals to establish an empirical anomaly boundary ($\tau = 4,586.28\text{ MW}$), detecting 96 real grid anomalies (19 spikes, 77 drops) without future data leakage.
4. **Phase 4 (FastAPI Backend Integration):** Enriched Pydantic schemas, introduced slice-based pagination, implemented proper 7-day weekly forecast aggregation ($P_{\text{mean}} \times 168\text{ h}$ total energy in MWh), added lifespan startup pre-warming, and validated all 59 backend tests.
5. **Phase 5 (React Frontend Integration & Cleanup):** Connected all 9 frontend pages via a centralized Axios client with `.env` configuration, eliminated all legacy synthetic claims across UI banners and copy, and validated clean production compilation.
