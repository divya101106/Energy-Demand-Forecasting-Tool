# Energy Demand Forecasting Tool — Comprehensive Technical Explanation & Viva Study Guide

> **Document Purpose:** This document provides an exhaustive, beginner-friendly, and technically precise explanation of the entire **Energy Demand Forecasting Tool** codebase. It is specifically designed to prepare you for college project evaluations, technical viva voce examinations, and faculty demonstrations.
>
> **Project Scope:** Academic Semester OJT Project — Advanced Data Science + Full-Stack Web Application.
> **Demonstration Mode:** Synthetic Test Data (100% Deterministic & Reproducible).

---

# Table of Contents
1. [Section 1: Project Overview & Core Mission](#section-1-project-overview--core-mission)
2. [Section 2: Technology Stack Deep Dive](#section-2-technology-stack-deep-dive)
3. [Section 3: Project Folder Structure & File-by-File Analysis](#section-3-project-folder-structure--file-by-file-analysis)
4. [Section 4: Detailed Breakdown of Every Webpage & User Interface](#section-4-detailed-breakdown-of-every-webpage--user-interface)
5. [Section 5: Exhaustive Analysis of Every Dashboard Card](#section-5-exhaustive-analysis-of-every-dashboard-card)
6. [Section 6: Comprehensive Chart & Visualization Guide](#section-6-comprehensive-chart--visualization-guide)
7. [Section 7: Synthetic Data Generation Engine Explained](#section-7-synthetic-data-generation-engine-explained)
8. [Section 8: Time-Series Forecasting & Prophet GAM Architecture](#section-8-time-series-forecasting--prophet-gam-architecture)
9. [Section 9: Chronological 70/30 Training, Testing & Evaluation Methodology](#section-9-chronological-7030-training-testing--evaluation-methodology)
10. [Section 10: Algorithmic Anomaly Detection (Spikes & Drops)](#section-10-algorithmic-anomaly-detection-spikes--drops)
11. [Section 11: Frontend & React Architecture Explained](#section-11-frontend--react-architecture-explained)
12. [Section 12: Axios, REST APIs & Client-Server Communication](#section-12-axios-rest-apis--client-server-communication)
13. [Section 13: FastAPI Backend Architecture & Route Handling](#section-13-fastapi-backend-architecture--route-handling)
14. [Section 14: Authentication, Session Management & Security](#section-14-authentication-session-management--security)
15. [Section 15: Data Processing, Mathematical Aggregations & pandas](#section-15-data-processing-mathematical-aggregations--pandas)
16. [Section 16: Client-Side CSV Export & Interactive Controls](#section-16-client-side-csv-export--interactive-controls)
17. [Section 17: Complete End-to-End Execution Workflows (A through F)](#section-17-complete-end-to-end-execution-workflows-a-through-f)
18. [Section 18: Complete Algorithms & Formulas Reference](#section-18-complete-algorithms--formulas-reference)
19. [Section 19: Implementation Classification Matrix (Real vs Synthetic vs Hardcoded)](#section-19-implementation-classification-matrix-real-vs-synthetic-vs-hardcoded)
20. [Section 20: Limitations & Future Production Roadmap](#section-20-limitations--future-production-roadmap)
21. [Section 21: Comprehensive Viva Preparation (45+ Questions & Model Answers)](#section-21-comprehensive-viva-preparation-45-questions--model-answers)
22. [Section 22: Viva Presentation Script & Demonstration Walkthrough](#section-22-viva-presentation-script--demonstration-walkthrough)
23. [Section 23: Key Code Snippets with Line-by-Line Explanations](#section-23-key-code-snippets-with-line-by-line-explanations)
24. [Section 24: Quick Revision & Viva Cheat Sheet](#section-24-quick-revision--viva-cheat-sheet)

---

# Section 1: Project Overview & Core Mission

### 1.1 What is the Energy Demand Forecasting Tool?
The **Energy Demand Forecasting Tool** is a full-stack decision-support web application that enables power grid operators, utility dispatchers, and energy resource planners to:
1. Visualize and filter historical electricity demand over time.
2. Generate probabilistic short-term forecasts (7, 14, 30, and 60 days ahead) with 95% uncertainty confidence intervals using machine learning.
3. Compare actual historical consumption against model forecasts to calculate predictive accuracy without lookahead bias.
4. Detect abnormal grid load behavior (demand spikes and demand drops) using statistical residual thresholding.
5. Inspect model hyperparameters, changepoints, dataset schemas, and backend runtime health.

### 1.2 The Real-World Engineering Problem
Electricity cannot be easily stored in massive quantities at power grid scale without costly battery infrastructure. Therefore, electric utilities must match electrical generation to electrical consumption second-by-second:
- **If generation < demand**: The power grid suffers frequency drops, voltage sags, equipment damage, or catastrophic blackouts.
- **If generation > demand**: Generators spin too fast, energy is wasted, fuel costs surge, and expensive thermal power plants must be curtailed.

Anticipating electricity demand is difficult because real power demand is a composite of several overlapping signals:
- **Long-term growth trends**: Driven by population growth, economic expansion, and electric vehicle adoption.
- **Weekly cycles**: Factories, offices, and schools operate Monday through Friday (high demand), but shut down or reduce activity on Saturday and Sunday (lower demand).
- **Seasonal weather cycles**: Summer heat waves require air conditioning; winter cold snaps require electrical heating.
- **Unexpected anomalies**: Sudden industrial equipment trips, transmission line maintenance, or severe weather storms.

### 1.3 How the Application Solves This Problem
The application gives energy planners a single unified platform. Instead of inspecting raw CSV files or unformatted spreadsheets, operators log into an interactive dashboard, run machine learning models on demand, adjust forecast parameters (such as holiday effects and changepoint flexibility), inspect error distributions, and receive automated diagnostic alerts when grid demand deviates abnormally from baseline expectations.

### 1.4 Primary Objectives of the Semester Project
1. **Full-Stack Architecture**: Connect a modern single-page application (React 19) to an asynchronous Python API (FastAPI) via HTTP/REST using Axios.
2. **Machine Learning Pipeline**: Train and serve Facebook Prophet models that decompose time series into trend, weekly seasonality, yearly seasonality, and holiday terms.
3. **Rigorous Temporal Evaluation**: Enforce a strict **70/30 chronological train/test split** (first 70% of days for training, last 30% for evaluation) to ensure that future data never leaks into the past.
4. **Quantified Benchmarking**: Calculate Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Mean Absolute Percentage Error (MAPE), benchmarking model performance against a seasonal-naive persistence model.
5. **Statistical Anomaly Detection**: Implement residual variance bounds ($k = 2.8\sigma$) to flag sudden load surges and curtailments.
6. **Aesthetic Excellence**: Provide a dark theme with a sleek monochromatic palette suitable for an executive control room.

### 1.5 Synthetic vs. Real Data: Honest Academic Disclosure
- **Current Mode**: This application operates in **`DEMO MODE — SYNTHETIC DATA`**.
- **Why Synthetic Data?** For a semester demonstration, depending on live external APIs (like Open Power System Data — OPSD) introduces external risks: network timeouts, API rate limits, schema changes, or multi-gigabyte downloads on presentation day.
- **How It Works**: The application generates **365 days of deterministic synthetic daily observations** (Jan 01, 2025 to Dec 31, 2025) using a fixed mathematical seed (`seed=42`).
- **Demonstration Units**: All demand figures are reported in **`MW (DEMO UNIT)`**.
- **Viva Note**: In your viva, state honestly: *"The project demonstrates the complete end-to-end data science and engineering architecture using reproducible synthetic data. The backend services are modular so that real OPSD or utility SCADA data can be ingested in the future without modifying the frontend."*

### 1.6 Complete User Journey
```
1. Access URL (http://localhost:5173/)
   ↓
2. Protected Route Redirects to Login Screen (/login)
   ↓
3. Enter Credentials (or click "Auto-fill Demo Credentials") → Sign In
   ↓
4. Dashboard (/dashboard): Executive KPIs, historical chart with 7d/30d/90d/1y filters, preview forecast, anomaly alerts
   ↓
5. Historical Demand (/historical): Filter custom date ranges, review min/max/avg stats, search table, download CSV
   ↓
6. Generate Forecast (/forecast): Select frequency & horizon, toggle seasonality/holidays, generate Prophet forecast, export CSV
   ↓
7. Forecast vs Actual (/comparison): View actual vs forecast curves on holdout period, inspect residual errors
   ↓
8. Model Performance (/performance): Verify 70/30 split timeline, benchmark against seasonal-naive baseline, view error histogram
   ↓
9. Anomaly Alerts (/anomalies): Filter spikes/drops, inspect detailed diagnostic modal with root-cause context
   ↓
10. Model Information (/model-info): Review hyperparameters and live system health
    ↓
11. About Project (/about): Read architecture documentation and future roadmap
    ↓
12. Sign Out: Clears session token and returns to login screen
```

---

# Section 2: Technology Stack Deep Dive

### 2.1 What is Frontend?
The **frontend** is the client-side graphical user interface (GUI) that runs directly inside the user's web browser. It is responsible for rendering visual elements (buttons, cards, inputs, charts), capturing mouse clicks and keyboard inputs, managing page navigation, and displaying feedback to the user.

### 2.2 What is Backend?
The **backend** is the server-side software that runs on the host machine or cloud server. It handles business logic, security authentication, mathematical calculations, time-series data processing, machine learning model fitting, and serving data to the frontend over a network connection.

### 2.3 What is an API & REST?
- **API (Application Programming Interface)**: A formal contract and communication protocol that allows two separate programs (the React frontend and the FastAPI backend) to exchange data.
- **REST (Representational State Transfer)**: An architectural style that uses standard HTTP request verbs (`GET`, `POST`, `PUT`, `DELETE`) to perform operations against specific web addresses (endpoints) and return data in a standard format (JSON).

### 2.4 What is JSON?
**JSON (JavaScript Object Notation)** is a lightweight, text-based data interchange format. Both JavaScript and Python can parse and serialize JSON effortlessly. Example from our project:
```json
{
  "date": "2025-06-15",
  "actual_demand": 34210.5,
  "unit": "MW"
}
```

### 2.5 Detailed Technology Table

| Technology | Category | Role in this Project | Why It Was Chosen | What Happens if Removed |
|---|---|---|---|---|
| **React 19** | Frontend Framework | Renders UI components, manages application state, updates charts reactively. | Declarative component model, high performance with Virtual DOM, industry standard. | Would require writing thousands of lines of manual vanilla JavaScript DOM manipulation (`document.getElementById`). |
| **Vite 8** | Build Tool & Dev Server | Bundles JavaScript and CSS, powers hot-module replacement (HMR), proxies `/api` calls. | Starts dev server in < 150ms, builds production bundles in < 300ms using native ES modules. | Slow build times, manual Webpack configuration required. |
| **Tailwind CSS v4** | CSS Utility Framework | Implements the dark monochrome theme (`#09090b`, `#121316`, `#24262d`). | Enables rapid, responsive styling using atomic utility classes directly in JSX without separate bloated CSS files. | Would require writing custom CSS rules and media queries by hand for every component. |
| **Axios 1.20** | HTTP Client | Centralized client (`frontend/src/services/api.js`) that sends requests to FastAPI. | Supports request/response interceptors, automatic JSON transformation, and clean promise-based error handling. | Would require using native `fetch()` which lacks interceptors and requires manual `res.json()` calls and manual error checks. |
| **React Router v7** | Routing Engine | Enables multi-page navigation (`/dashboard`, `/forecast`, etc.) without full browser reloads. | Fast client-side routing, URL synchronization, and route protection guards. | The app would become a single monolithic screen or reload the entire web page on every menu click. |
| **Recharts 3.10** | Charting Library | Renders responsive SVG charts (historical line, forecast envelopes, residual error bars). | Native React component integration, responsive containers, customizable tooltips, and animated SVG elements. | Would require writing low-level canvas code or configuring heavy external chart engines like D3 or Chart.js manually. |
| **Lucide React** | Iconography | Provides icons (`Activity`, `TrendingUp`, `AlertTriangle`, `Cpu`, `History`). | Lightweight SVG icons matching the monochrome aesthetic. | UI would look plain without visual indicators for metrics and navigation. |
| **Python 3.14** | Programming Language | Powers the backend API, data generation, and machine learning services. | Rich ecosystem for scientific computing, data science (pandas, numpy), and ML (Prophet). | Would require rewriting ML models in another language like C++ or Node.js. |
| **FastAPI 0.146** | Backend Framework | Serves RESTful endpoints (`/api/v1/*`), validates schemas with Pydantic, generates OpenAPI docs. | Extremely fast asynchronous execution, automatic interactive Swagger UI (`/docs`), type hints. | Would have to use Flask (slower, manual validation) or Django (too heavy for a microservice). |
| **Pydantic v2** | Data Validation | Defines request and response schemas in `backend/app/schemas.py`. | Validates incoming payloads and serializes responses, throwing readable 422 errors for malformed requests. | Invalid user inputs could crash the server or corrupt calculations. |
| **Uvicorn** | ASGI Web Server | Production-ready asynchronous web server running FastAPI on `http://127.0.0.1:8000`. | Implements the ASGI specification, handling asynchronous requests with high concurrency. | FastAPI cannot run standalone without an ASGI server. |
| **pandas 3.0** | Data Manipulation | Manages tabular time-series data and converts observations into Prophet `ds` and `y` format. | High-performance DataFrames, date-time indexing, and statistical operations. | Manual Python dictionary slicing would be slower and harder to maintain. |
| **NumPy 2.5** | Scientific Computing | Powers numerical calculations, array transformations, and variance formulas. | Fast C-level mathematical operations. | Math operations would run on slower native Python loops. |
| **Prophet 1.5.0** | Machine Learning | Fits Generalized Additive Models (GAM) to forecast daily and weekly energy demand with 95% bounds. | Specifically engineered for business and utility time-series with strong seasonality and holiday patterns. | Would require manual ARIMA, SARIMA, or LSTM architectures requiring weeks of tuning. |
| **pytest 9.1** | Automated Testing | Executes 19 unit and integration tests across data generation, metrics, and API routes. | Standard testing framework in Python with concise assertion syntax and test discovery. | Would require manual verification of endpoints using Postman on every code change. |

---

# Section 3: Project Folder Structure & File-by-File Analysis

### 3.1 Architectural Directory Tree

```
Energy-Demand-Forecasting-Tool/
│
├── backend/                             # Python FastAPI Backend Subsystem
│   ├── app/                             # Application Core Package
│   │   ├── main.py                      # FastAPI App initialization, CORS, and route mounting
│   │   ├── config.py                    # Global constants, demo credentials, and data parameters
│   │   ├── schemas.py                   # Pydantic v2 request and response models
│   │   │
│   │   ├── routes/                      # API Route Controllers (Endpoints)
│   │   │   ├── health.py                # GET /api/v1/health (Health check & engine mode)
│   │   │   ├── auth.py                  # POST /api/v1/auth/login and logout
│   │   │   ├── historical.py            # GET /api/v1/historical (Filtered load data)
│   │   │   ├── forecast.py              # POST /api/v1/forecast (Run forecasting engine)
│   │   │   ├── comparison.py            # GET /api/v1/comparison (Actual vs forecast holdout)
│   │   │   ├── metrics.py               # GET /api/v1/metrics (MAE, RMSE, MAPE benchmarks)
│   │   │   ├── anomalies.py             # GET /api/v1/anomalies (Spikes, drops, and filters)
│   │   │   └── model.py                 # GET /api/v1/model (Model parameters & telemetry)
│   │   │
│   │   ├── services/                    # Business Logic & Machine Learning Services
│   │   │   ├── data_service.py          # Date filtering & statistical aggregations
│   │   │   ├── predictor.py             # Prophet fitting, model caching & synthetic fallback
│   │   │   ├── evaluation_service.py    # 70/30 chronological split & baseline comparison
│   │   │   ├── anomaly_service.py       # Residual thresholding & anomaly classification
│   │   │   └── model_loader.py          # Telemetry and metadata construction
│   │   │
│   │   ├── data/                        # Time-Series Data Management
│   │   │   └── synthetic_data.py        # Deterministic 365-day generator (seed=42)
│   │   │
│   │   └── middleware/                  # HTTP Interceptors & Exception Filters
│   │       └── error_handler.py         # Global structured JSON error handlers
│   │
│   ├── tests/                           # Automated Pytest Suite
│   │   └── test_backend.py              # 19 comprehensive unit & integration tests
│   ├── pytest.ini                       # Pytest path and runner configuration
│   └── requirements.txt                 # Backend Python package manifest
│
├── frontend/                            # React 19 Client Subsystem
│   ├── src/                             # Source Code
│   │   ├── components/                  # Reusable UI Components
│   │   │   ├── Navbar.jsx               # Top header with date, breadcrumb & demo badge
│   │   │   ├── Sidebar.jsx              # Left navigation sidebar with active route highlighting
│   │   │   ├── MetricCard.jsx           # Monochrome KPI summary card
│   │   │   ├── StateFeedback.jsx        # Loading, Error, and Empty state feedback views
│   │   │   ├── DemoDisclaimerBanner.jsx # Top disclaimer regarding synthetic data
│   │   │   └── ProtectedRoute.jsx       # Route guard redirecting unauthenticated users
│   │   │
│   │   ├── context/                     # Global State Contexts
│   │   │   └── AuthContext.jsx          # Session state, login/logout, and localStorage
│   │   │
│   │   ├── layouts/                     # Page Shells & Layout Wrappers
│   │   │   └── DashboardLayout.jsx      # Persistent sidebar, navbar, and container layout
│   │   │
│   │   ├── pages/                       # 8 Primary Application Views + Login
│   │   │   ├── LoginPage.jsx            # Dark monochrome login view with demo autofill
│   │   │   ├── DashboardPage.jsx        # Executive overview dashboard
│   │   │   ├── HistoricalPage.jsx       # Historical demand explorer with date range & CSV export
│   │   │   ├── ForecastPage.jsx         # Interactive forecast generator with confidence bounds
│   │   │   ├── ComparisonPage.jsx       # Forecast vs actual residual comparison
│   │   │   ├── PerformancePage.jsx      # 70/30 split visualizer & benchmark table
│   │   │   ├── AnomaliesPage.jsx        # Anomaly registry with diagnostic inspection modal
│   │   │   ├── ModelInfoPage.jsx        # Model hyperparameters & system health telemetry
│   │   │   └── AboutPage.jsx            # Architecture, methodology, and future roadmap
│   │   │
│   │   ├── services/                    # API Services
│   │   │   └── api.js                   # Centralized Axios instance with interceptors
│   │   │
│   │   ├── App.jsx                      # React Router route registry
│   │   ├── index.css                    # Tailwind CSS v4 setup & dark monochrome theme
│   │   └── main.jsx                     # Application entry point and DOM root mount
│   │
│   ├── index.html                       # HTML document template with SEO metadata
│   ├── vite.config.js                   # Vite configuration with Tailwind v4 & backend proxy
│   └── package.json                     # Frontend npm dependencies and scripts
│
├── docs/                                # Project Documentation
│   ├── ARCHITECTURE.md                  # System architecture specifications
│   └── PROJECT_EXPLANATION.md           # This comprehensive study & viva guide
├── PRD.md                               # Original Product Requirements Document
├── README.md                            # Quickstart and local execution guide
└── .gitignore                           # Git ignore rules for node_modules, venv, and cache
```

---

# Section 4: Detailed Breakdown of Every Webpage & User Interface

The application consists of **9 distinct pages** (1 public authentication page + 8 protected analytics views).

```
+--------------------------------------------------------------------------+
| TOP NAVBAR: Current Page Title | Current Date | DEMO DATA Badge | User   |
+-------------------+------------------------------------------------------+
| LEFT SIDEBAR      | MAIN CONTENT AREA                                    |
| - Dashboard       | [Demo Disclaimer Banner]                             |
| - Historical      |                                                      |
| - Forecast        | [Page-specific KPI Metric Cards]                     |
| - Comparison      |                                                      |
| - Performance     | [Interactive Recharts Line / Bar Charts]             |
| - Anomalies       |                                                      |
| - Model Info      | [Interactive Filter Forms / Data Tables / Modals]    |
| - About Project   |                                                      |
|                   |                                                      |
| [Demo Badge]      |                                                      |
| [User Profile]    |                                                      |
| [Logout Button]   |                                                      |
+-------------------+------------------------------------------------------+
```

---

### 4.1 Login Page (`/login`)
- **File**: `frontend/src/pages/LoginPage.jsx`
- **Purpose**: Authenticates the user into the platform and guards against unauthorized access.
- **Visual Elements**:
  - Geometric lightning/activity icon with "Energy Demand Forecasting Tool" title.
  - Email and Password input fields with Lucide icons (`Mail`, `Lock`).
  - Eye icon button to toggle password visibility (`Eye`, `EyeOff`).
  - Dark monochrome card container with subtle borders (`#121316`, `#24262d`).
  - "Sign In" button with loading spinner state.
  - "Auto-fill Demo Credentials" one-click button for viva presentations.
- **Data Flow & Implementation**:
  - The component stores input values in local state (`email`, `password`, `loading`, `error`).
  - When the user clicks "Sign In", `handleSubmit()` invokes `login(email, password)` from `AuthContext.jsx`.
  - Axios sends a `POST /api/v1/auth/login` request.
  - On HTTP 200, the returned session token is stored in `localStorage`, and React Router redirects to `/dashboard`.
  - On HTTP 401, an error alert banner is rendered: *"Invalid demonstration credentials."*

---

### 4.2 Executive Overview Dashboard (`/dashboard`)
- **File**: `frontend/src/pages/DashboardPage.jsx`
- **Purpose**: Provides a high-level executive summary of grid demand, next-day projections, active model errors, and urgent anomaly alerts on a single screen.
- **Visual Elements**:
  1. **Top 5 KPI Metric Cards**:
     - *Latest Actual Demand* ($38,226.49\text{ MW}$)
     - *Next-Day Forecast* ($37,988.19\text{ MW}$, $-0.62\%$)
     - *Mean Absolute Error (MAE)* ($486.6\text{ MW}$, $1.46\%$ MAPE)
     - *Root Mean Squared Error (RMSE)* ($1286.4\text{ MW}$, $+11.73\%$ vs Naive)
     - *Detected Anomalies* ($6\text{ Events}$, $3\text{ Spikes}$, $3\text{ Drops}$, $5\text{ High}$)
  2. **Historical Electricity Demand Chart**:
     - Large interactive line chart with quick filters: `7D`, `30D`, `90D`, `1Y`.
     - Plotted using Recharts with dark monochrome styling and custom tooltips.
  3. **Model Operating Status Panel**:
     - Displays algorithm name (Prophet), version (`v2.1-demo`), dataset mode (`Synthetic`), 70/30 split, and active forecasting mode badge (`Prophet Mode`).
     - Includes an automated text-based **Demand Trend Summary**.
  4. **Actual vs Forecast Preview (14-Day Horizon)**:
     - Side-by-side curve showing the last 14 historical days followed by the next 14 forecast days.
  5. **Recent Anomaly Events List**:
     - Mini cards showing the 4 most recent spikes and drops with severity tags and deviation percentages.
- **Data Flow**:
  - On mount, `fetchDashboardData()` uses `Promise.all` to fetch data from 5 endpoints concurrently:
    - `dataAPI.getHistorical()`
    - `modelAPI.getMetrics()`
    - `anomalyAPI.getAnomalies()`
    - `modelAPI.getModelInfo()`
    - `forecastAPI.generate(...)`
  - Results are saved into React state variables (`historicalData`, `metrics`, `anomalies`, `modelInfo`, `forecastPreview`).

---

### 4.3 Historical Demand Explorer (`/historical`)
- **File**: `frontend/src/pages/HistoricalPage.jsx`
- **Purpose**: Dedicated page for deep analytical exploration of past electricity load observations.
- **Visual Elements**:
  - **Date Filter Form**: Start Date (`from`) and End Date (`to`) inputs, "Apply Range" button, "Full Year" button, and quick preset buttons (`30D`, `90D`, `180D`).
  - **Export CSV Button**: Triggers client-side CSV compilation and downloads a file named `synthetic_historical_demand_<start>_to_<end>.csv`.
  - **6 Statistical KPI Cards**:
    - Average Demand ($\mu$)
    - Minimum Demand ($\min$)
    - Maximum Demand ($\max$)
    - Standard Deviation ($\sigma$)
    - Peak Demand Date
    - Trough Demand Date
  - **Interactive Historical Chart**: Full-width line chart plotting demand over the selected timeframe.
  - **Observations Registry Table**:
    - Search bar to filter observations by date.
    - Columns: Date, Demand (MW), Trend Component, Weekly Seasonality, Yearly Seasonality, Anomaly Status badge.
    - Client-side pagination (12 rows per page) with Previous and Next controls.
- **Data Flow**:
  - Invokes `dataAPI.getHistorical(startDate, endDate)`.
  - The backend queries `backend/app/services/data_service.py`, filters observations, calculates summary statistics on the fly, and returns structured JSON.

---

### 4.4 Generate Forecast Page (`/forecast`)
- **File**: `frontend/src/pages/ForecastPage.jsx`
- **Purpose**: Interactive laboratory allowing grid analysts to customize forecasting parameters and generate real-time predictive demand curves.
- **Visual Elements**:
  - **Forecast Configuration Form**:
    - *Frequency*: `Daily` vs `Weekly` toggle buttons.
    - *Horizon*: `7d`, `14d`, `30d`, `60d` selector buttons.
    - *Changepoint Flexibility*: `Conservative` ($0.01$), `Balanced` ($0.05$), `Flexible` ($0.15$).
    - *Seasonality Checkboxes*: Weekly Seasonality (7-day), Yearly Seasonality (Annual), Holiday Curtailment Effects.
    - *Generate Forecast Button*: Primary action button with spinning loader state.
  - **Active Engine Badge**: Displays `Prophet Mode` (or `Synthetic Fallback Mode` if Prophet is missing).
  - **Summary Cards**: Next-Day Projected Load, Average Demand over horizon, Peak Forecasted Load, Lowest Forecasted Load.
  - **Forecast Chart**:
    - Central solid white line: Expected demand prediction ($\hat{y}$ or `predicted_demand`).
    - Upper & Lower dashed bounds: 95% Confidence Interval envelope (`upper_bound` and `lower_bound`).
  - **Forecast Projections Table**: Shows exact numbers for every future day with confidence spread ($\pm \text{MW}$).
  - **Export Forecast CSV Button**: Downloads the forecast table to disk.
- **Data Flow**:
  - User selects settings and clicks "Generate Forecast".
  - Frontend triggers `forecastAPI.generate(payload)`.
  - Backend executes `backend/app/services/predictor.py`. Prophet fits the GAM on synthetic history and predicts future timestamps.
  - Response is stored in `forecastResult` state and immediately updates the chart and table.

---

### 4.5 Forecast vs Actual Evaluation (`/comparison`)
- **File**: `frontend/src/pages/ComparisonPage.jsx`
- **Purpose**: Evaluates how well the model predicts reality by comparing forecasts against actual observations on the holdout test partition.
- **Visual Elements**:
  - **Automated Residual Analysis Box**: Bulleted qualitative summary explaining model bias, MAE magnitude, and over/under-prediction counts.
  - **4 Scorecard Metric Cards**: MAE ($486.6\text{ MW}$), RMSE ($1286.4\text{ MW}$), MAPE ($1.46\%$), Largest Absolute Error ($7,895.69\text{ MW}$).
  - **Actual vs Forecast Chart**: Overlaid time series of actual load (solid line) vs. forecasted load (dashed line) for all 110 test holdout days.
  - **Residual Error Bar Chart**:
    - Plots daily residual error: $e_t = \text{Actual} - \text{Forecast}$.
    - Bars above zero indicate under-prediction (grid needed more power than anticipated).
    - Bars below zero indicate over-prediction (grid produced excess power).
- **Data Flow**:
  - Fetches data from `modelAPI.getComparison()` (`/api/v1/comparison`).
  - Backend `evaluation_service.py` computes errors across the test set and returns observation-by-observation residual vectors.

---

### 4.6 Model Performance & Benchmarking (`/performance`)
- **File**: `frontend/src/pages/PerformancePage.jsx`
- **Purpose**: Provides academic and statistical proof that the model performs well without data leakage.
- **Visual Elements**:
  - **Chronological Train/Test Partition Bar**:
    - Visual timeline bar showing **70% Training Partition** ($255$ days, Jan 01 to Sep 12) in dark zinc, and **30% Test Holdout** ($110$ days, Sep 13 to Dec 31) in bright white.
    - Zero lookahead guarantee note.
  - **4 Scorecard Metric Cards**: MAE, RMSE, MAPE, and RMSE Improvement percentage ($+11.73\%$).
  - **Holdout Accuracy Tracking Curve**: High-resolution view of actual vs. predicted curves across the evaluation partition.
  - **Residual Error Distribution Histogram**:
    - Frequency bar chart showing how errors are distributed across ranges ($<-1500\text{ MW}$, $-1500\text{ to }-1000$, $\dots$, $>1500\text{ MW}$).
    - Demonstrates that residuals center symmetrically near zero.
  - **Benchmark Comparison Table**:
    - Compares our model side-by-side against the **Seasonal-Naive (7-day lag)** persistence benchmark.
    - Proves Prophet outperforms naive persistence.
- **Data Flow**:
  - Concurrently queries `modelAPI.getMetrics()` and `modelAPI.getComparison()`.

---

### 4.7 Demand Anomaly Detection (`/anomalies`)
- **File**: `frontend/src/pages/AnomaliesPage.jsx`
- **Purpose**: Alerts operators to extreme, unexpected grid demand surges (spikes) or curtailments (drops) that exceed the expected seasonal baseline.
- **Visual Elements**:
  - **Summary Metric Cards**: Total Anomalies ($6$), Spikes ($3$), Drops ($3$), High Severity ($5$), Medium Severity ($1$), Low Severity ($0$).
  - **Interactive Filter Bar**:
    - Type: `All Types`, `Spikes`, `Drops`.
    - Severity: `All Severities`, `High`, `Medium`, `Low`.
  - **Anomaly Registry Table**:
    - Lists Alert ID (e.g., `ALT-20250215-045`), Date, Type badge with arrow icon, Actual Demand, Expected Baseline, Deviation (MW), Percentage Shift, Severity badge, Status (`Investigated` / `Active`), and an `Inspect` button.
  - **Diagnostic Modal**:
    - Clicking `Inspect` opens a focused modal displaying actual load, baseline, deviation, detection algorithm name, and a detailed operational incident description (e.g., *"Extreme cold wave surge; residential & commercial heating peak"*).
- **Data Flow**:
  - Calls `anomalyAPI.getAnomalies(typeFilter, severityFilter)`.
  - Backend `anomaly_service.py` evaluates all observations against threshold rules and returns filtered alerts.

---

### 4.8 Model Information & Architecture (`/model-info`)
- **File**: `frontend/src/pages/ModelInfoPage.jsx`
- **Purpose**: Provides full transparency into model hyperparameters, dataset properties, and server runtime health.
- **Visual Elements**:
  - **Model Architecture Card**: Algorithm name, release version, and GAM mathematical description.
  - **Model Decomposed Parameters Card**: Explains Fourier orders for weekly (order 3) and annual (order 10) seasonality, changepoint flexibility options, and holiday impact windows.
  - **Synthetic Dataset Metadata Card**: Reports total observations ($365$), date range, demonstration unit (`MW`), baseline demand ($32,500\text{ MW}$), and deterministic random seed ($42$).
  - **Runtime System Health Grid**: 4 status cards confirming Backend Service (Healthy), API Health (Operational), Prophet Engine (Installed & Operational), and Active Engine (`Prophet Mode`).
- **Data Flow**:
  - Fetches system telemetry from `modelAPI.getModelInfo()` (`/api/v1/model`).

---

### 4.9 About Project & Methodology (`/about`)
- **File**: `frontend/src/pages/AboutPage.jsx`
- **Purpose**: Provides project documentation, motivation, technical deliverables, and future roadmap.
- **Visual Elements**:
  - Problem Statement and Applied Solution narratives.
  - Key Functional Deliverables checklist with checkmark icons.
  - Full-stack ASCII architectural flow diagram.
  - Complete technology stack table with role definitions.
  - Synthetic data disclaimer and roadmap explaining future migration to real-world Open Power System Data (OPSD).

---

# Section 5: Exhaustive Analysis of Every Dashboard Card

The Executive Dashboard displays **5 primary KPI cards**:

| Card Name | Display Value | Unit | Subtitle / Indicator | Where Calculated in Backend | Exact Formula / Source | How to Explain in Viva |
|---|---|---|---|---|---|---|
| **Latest Actual Demand** | `38,226.49` | MW | `-0.46%` vs previous day | `backend/app/routes/historical.py` via `data_service.py` | Most recent synthetic observation: `historicalData[len - 1].actual_demand`. Percentage change is $((y_t - y_{t-1}) / y_{t-1}) \times 100$. | *"This represents the most recent electricity consumption recorded in our dataset (December 31, 2025). The $-0.46\%$ badge indicates that demand softened slightly compared to the day before."* |
| **Next-Day Forecast** | `37,988.19` | MW | `-0.62%` vs latest actual | `backend/app/services/predictor.py` | First prediction point generated by Prophet for $t+1$: `summary.next_day_predicted`. Change is $((\hat{y}_{t+1} - y_t) / y_t) \times 100$. | *"This is the Prophet model's prediction for the upcoming day (January 1, 2026). It projects a $-0.62\%$ drop, which aligns with typical holiday shutdown patterns on New Year's Day."* |
| **Mean Absolute Error (MAE)** | `486.6` | MW | `MAPE: 1.46% • 30% Test Split` | `backend/app/services/evaluation_service.py` | $\text{MAE} = \frac{1}{N}\sum \|y_t - \hat{y}_t\|$ computed strictly across the 110 holdout test days. | *"MAE measures the average magnitude of forecasting error in megawatts. On average, our model's predictions deviated from the actual test demand by only $486.6\text{ MW}$, which is an average error rate of just $1.46\%$."* |
| **Root Mean Squared Error (RMSE)** | `1286.4` | MW | `+11.73% vs Naive Baseline` | `backend/app/services/evaluation_service.py` | $\text{RMSE} = \sqrt{\frac{1}{N}\sum (y_t - \hat{y}_t)^2}$. Improvement is $[(\text{RMSE}_{\text{naive}} - \text{RMSE}_{\text{prophet}}) / \text{RMSE}_{\text{naive}}] \times 100$. | *"RMSE penalizes large outlier errors more heavily than MAE because errors are squared before averaging. Our model achieves an RMSE of $1286.4\text{ MW}$, outperforming a standard 7-day persistence baseline by $+11.73\%$."* |
| **Detected Anomalies** | `6` | Events | `3 Spikes • 3 Drops • 5 High` | `backend/app/services/anomaly_service.py` | Counts observations where residual deviation exceeded the statistical threshold ($>12\%$ or deliberate injection). | *"This card reports grid events where load deviated severely from expectations. Out of 365 days, our algorithm detected exactly 6 anomalies: 3 positive demand spikes and 3 demand drops, with 5 classified as high severity."* |

---

# Section 6: Comprehensive Chart & Visualization Guide

The application features **6 interactive Recharts visualizations**:

### 6.1 Historical Electricity Demand Chart
- **Location**: `DashboardPage.jsx` and `HistoricalPage.jsx`
- **Chart Type**: Smooth Line Chart (`<LineChart>`, `<Line>`)
- **X-Axis**: Observation Date (`YYYY-MM-DD`, formatted as `MM-DD`)
- **Y-Axis**: Electric Demand in Megawatts (`MW`, formatted in thousands: `26k`, `30k`, `38k`)
- **Visual Styling**: Solid high-contrast white curve (`#ffffff`, strokeWidth: 2). Dark grid lines (`#24262d`).
- **Interactive Features**:
  - Filter buttons (`7D`, `30D`, `90D`, `1Y`) slice the dataset reactively without reloading.
  - Hovering over any point displays a custom tooltip showing exact date and demand value.
- **Why a Line Chart?** Electricity demand is continuous time-series data. Connecting points chronologically helps operators see daily cycles, weekly dips, and seasonal swings.

### 6.2 Actual vs. Forecast Preview Chart
- **Location**: `DashboardPage.jsx`
- **Chart Type**: Multi-Line Comparison Chart
- **Visual Elements**:
  - Solid white line: Actual historical demand for the past 14 days.
  - Dashed silver line (`#a1a1aa`, strokeDasharray: `4 4`): Model forecast trajectory for the next 14 days.
- **What Operators Learn**: Provides immediate continuity showing whether future demand is expected to climb above or drop below current operating levels.

### 6.3 Projected Demand Curve with 95% Confidence Bounds
- **Location**: `ForecastPage.jsx`
- **Chart Type**: Composed Chart (`<ComposedChart>`)
- **Visual Elements**:
  - Central solid white line: Point forecast ($\hat{y}$ or `predicted_demand`).
  - Top dotted line (`#52525b`): Upper 95% confidence bound (`yhat_upper`).
  - Bottom dotted line (`#52525b`): Lower 95% confidence bound (`yhat_lower`).
- **Meaning of Confidence Bounds**: In grid operations, giving a single point forecast is risky. The confidence envelope tells operators: *"There is a 95% probability that actual demand will fall between these upper and lower bounds."* The bounds widen further into the future to reflect increasing uncertainty.

### 6.4 Holdout Evaluation Accuracy Curve
- **Location**: `ComparisonPage.jsx` and `PerformancePage.jsx`
- **Chart Type**: Dual-Line Time-Series Chart
- **Visual Elements**:
  - Solid white line: Actual demand on the 110 holdout test days.
  - Dashed silver line: Model forecast for those exact same days.
- **What Operators Learn**: Shows how closely the model tracks both regular weekly rhythms and seasonal shifts on unseen data. Where the curves diverge, prediction errors occurred.

### 6.5 Residual Error Over Time Bar Chart
- **Location**: `ComparisonPage.jsx`
- **Chart Type**: Bi-directional Bar Chart (`<BarChart>`, `<Bar>`)
- **X-Axis**: Date across the test set.
- **Y-Axis**: Residual Error in Megawatts ($e_t = y_t - \hat{y}_t$).
- **Visual Elements**:
  - Center horizontal line at $0\text{ MW}$ (`<ReferenceLine y={0}>`).
  - Light silver vertical bars (`#d4d4d8`).
  - **Positive Bars ($>0$)**: Under-prediction (Actual was higher than forecasted).
  - **Negative Bars ($<0$)**: Over-prediction (Actual was lower than forecasted).
- **What Operators Learn**: Helps grid operators identify whether the model has systematic bias (e.g., consistently under-predicting during winter months).

### 6.6 Residual Error Distribution Histogram
- **Location**: `PerformancePage.jsx`
- **Chart Type**: Column Histogram (`<BarChart>`)
- **X-Axis**: Error magnitude bins (`<-1500 MW`, `-1500 to -1000`, `-1000 to -500`, `-500 to 0`, `0 to 500`, `500 to 1000`, `1000 to 1500`, `>1500 MW`).
- **Y-Axis**: Frequency count (number of test holdout days falling into that bin).
- **Visual Elements**: Solid white columns (`#f4f4f5`).
- **What Operators Learn**: A well-trained forecasting model should produce a bell-shaped normal distribution centered around $0\text{ MW}$. Our histogram proves that most errors fall in the central $\pm 500\text{ MW}$ range, with rare errors in the tails corresponding to anomaly events.

---

# Section 7: Synthetic Data Generation Engine Explained

- **File**: `backend/app/data/synthetic_data.py`
- **Function**: `generate_synthetic_energy_dataset()`

### 7.1 Why Synthetic Data?
In machine learning and software engineering education, developing against clean, deterministic synthetic data allows students to verify that algorithms, boundary conditions, metric calculations, and UI components work correctly before introducing messy real-world data feeds.

### 7.2 The Exact Mathematical Formula
For each day $t \in [0, 364]$, the actual demand $y_t$ is synthesized as:

$$y_t = \text{Base} + T(t) + W(t) + S(t) + \epsilon_t + A(t)$$

Where:

1. **Base Load ($\text{Base}$)**:
   - Fixed baseline of $32,500.0\text{ MW}$ (`settings.BASELINE_DEMAND_MW`), representing typical regional grid consumption.

2. **Long-Term Trend ($T(t)$)**:
   $$T(t) = \text{Base} \times \left(0.015 \times \frac{t}{365}\right)$$
   - Adds a $+1.5\%$ secular annual growth trend over the 365-day year.

3. **Weekly Seasonality ($W(t)$)**:
   - Look-up table based on the day of the week ($0 = \text{Monday}, \dots, 6 = \text{Sunday}$):
     - Monday: $+5\%$ ($+1,625\text{ MW}$)
     - Tuesday & Wednesday: $+8\%$ ($+2,600\text{ MW}$)
     - Thursday: $+7\%$ ($+2,275\text{ MW}$)
     - Friday: $+4\%$ ($+1,300\text{ MW}$)
     - Saturday: $-12\%$ ($-3,900\text{ MW}$)
     - Sunday: $-18\%$ ($-5,850\text{ MW}$)

4. **Annual Harmonic Seasonality ($S(t)$)**:
   - Modeled using dual harmonic Fourier terms to capture winter heating and summer cooling peaks:
     $$\theta_1 = 2\pi \frac{t}{365}, \quad \theta_2 = 4\pi \frac{t}{365}$$
     $$S(t) = \text{Base} \times [0.12 \cos(\theta_1) + 0.06 \sin(\theta_2 - 0.5)]$$
   - $\cos(\theta_1)$ creates a high peak in January/February (winter heating).
   - $\sin(\theta_2 - 0.5)$ creates a secondary peak in July/August (summer air conditioning).

5. **Stochastic Noise ($\epsilon_t$)**:
   $$\epsilon_t = \text{Base} \times 0.035 \times \text{rand}_{[-0.5, 0.5]}$$
   - Adds pseudo-random variation of approximately $\pm 1.75\%$ using a Linear Congruential Generator (LCG) initialized with `seed = 42`.

6. **Deliberate Anomaly Injections ($A(t)$)**:
   To test anomaly detection, exactly 6 realistic grid events were injected at specific indices:
   - **Day 45 (Feb 15)**: $+23\%$ spike (Winter polar vortex cold snap; high heating demand).
   - **Day 105 (Apr 16)**: $-22\%$ drop (Spring transmission interconnector outage & factory curtailment).
   - **Day 198 (Jul 18)**: $+26\%$ spike (Severe summer heatwave; peak HVAC cooling).
   - **Day 240 (Aug 29)**: $-25\%$ drop (Late summer manufacturing shutdown & mild weather lull).
   - **Day 315 (Nov 12)**: $+20\%$ spike (Early winter cold front).
   - **Day 358 (Dec 25)**: $-28\%$ drop (Christmas holiday commercial/industrial shutdown).

### 7.3 Reproducibility Guarantee
The Linear Congruential Generator formula used in lines 27–30:
```python
state = (state * 1664525 + 1013904223) % (2**32)
```
Because `state` starts at `42` every time the server boots, **the exact same numbers are generated on every computer**. There is zero variation between runs.

---

# Section 8: Time-Series Forecasting & Prophet GAM Architecture

- **File**: `backend/app/services/predictor.py`
- **Functions**: `generate_forecast()`, `_generate_prophet_forecast()`, `_generate_fallback_forecast()`

### 8.1 What is Time-Series Forecasting?
A **time series** is a chronological sequence of data points recorded at regular time intervals (in our case, daily at midnight). Time-series forecasting uses past patterns to project future values.

### 8.2 What is Prophet?
**Prophet** is an open-source time-series forecasting library developed by Meta (Facebook) Core Data Science team. It uses a **Generalized Additive Model (GAM)** formulation:

$$y(t) = g(t) + s(t) + h(t) + \epsilon_t$$

Where:
- $g(t)$: **Trend model** representing non-periodic long-term growth or decline (linear or logistic).
- $s(t)$: **Seasonality model** representing recurring weekly and annual cycles using Fourier series.
- $h(t)$: **Holiday effects** representing irregular calendar disruptions (e.g., Christmas, Thanksgiving).
- $\epsilon_t$: Error term representing idiosyncratic noise.

### 8.3 How Prophet is Implemented in Our Backend
1. **Data Preparation (lines 151–155)**:
   Prophet requires a pandas DataFrame with two specifically named columns:
   - `ds`: The datestamp column (converted via `pd.to_datetime`).
   - `y`: The numeric measurement column (energy demand in MW).
2. **Model Instantiation (lines 172–179)**:
   ```python
   m = Prophet(
       weekly_seasonality=request.weekly_seasonality,
       yearly_seasonality=request.yearly_seasonality,
       changepoint_prior_scale=changepoint_scale,
       interval_width=0.95
   )
   if request.holiday_effects:
       m.add_country_holidays(country_name='US')
   ```
3. **Training via `fit()` (line 180)**:
   `m.fit(df)` fits the parameters using Stan C++ routines to find optimal Fourier weights and changepoints.
4. **Future Dataframe Generation via `make_future_dataframe()` (line 189)**:
   ```python
   future = m.make_future_dataframe(periods=periods, freq=freq, include_history=False)
   ```
   Generates a DataFrame of future dates extending 7, 14, 30, or 60 days ahead.
5. **Prediction via `predict()` (line 190)**:
   `forecast_df = m.predict(future)` returns predicted values:
   - `yhat`: Central point prediction.
   - `yhat_lower`: Lower bound of the 95% uncertainty interval.
   - `yhat_upper`: Upper bound of the 95% uncertainty interval.
6. **Model Caching (lines 171–184)**:
   Fitting a Prophet model takes 1–3 seconds. To keep the API fast (< 100ms), `predictor.py` caches the fitted model in memory (`_CACHED_PROPHET_MODEL`). If a user requests a new horizon with the same hyperparameter settings, the model reuses the cached instance rather than refitting from scratch.

### 8.4 The Dual-Mode Architecture & Deterministic Fallback
If Prophet or its Stan compiler is missing in a runtime environment:
- `PROPHET_AVAILABLE` evaluates to `False`.
- The application automatically calls `_generate_fallback_forecast(request)`.
- It calculates harmonic projections extending the synthetic mathematical trend, widening confidence intervals realistically over time ($\pm 2.5\%$ to $\pm 8\%$).
- It sets `is_fallback = True`, `forecasting_mode = "Synthetic Fallback Mode"`, and returns a clear warning message.
- **Viva Note**: In our current environment, Prophet 1.5.0 is successfully installed and `Prophet Mode` is active.

---

# Section 9: Chronological 70/30 Training, Testing & Evaluation Methodology

- **File**: `backend/app/services/evaluation_service.py`
- **Functions**: `get_train_test_split()`, `calculate_metrics()`, `get_test_evaluation()`

### 9.1 The Golden Rule of Time-Series Evaluation: No Random Shuffling
In standard machine learning (e.g., image classification), data rows are shuffled randomly before splitting. **In time-series data, random shuffling is strictly forbidden** because it causes **data leakage** (lookahead bias). If the model trains on Wednesday, tests on Tuesday, and trains on Thursday, it is cheating by using the future to predict the past.

### 9.2 Our Exact Split Implementation
```
0                               254  255                             364
[-------- 70% TRAINING SET --------] [------- 30% TEST HOLDOUT --------]
255 Days (Jan 01, 2025 to Sep 12, 2025) 110 Days (Sep 13, 2025 to Dec 31, 2025)
```
- Total observations: $N = 365$.
- `split_idx = int(365 * 0.70) = 255`.
- **Training partition**: Days 0 to 254 (255 observations).
- **Test partition**: Days 255 to 364 (110 observations).
- All evaluation metrics (MAE, RMSE, MAPE) are calculated **only** on the 110 test days.

### 9.3 Evaluation Formulas & Mathematical Definitions

#### A. Mean Absolute Error (MAE)
$$\text{MAE} = \frac{1}{N}\sum_{t=1}^N |y_t - \hat{y}_t|$$
- **What it measures**: The average absolute error in megawatts (MW).
- **Project Value**: **$486.60\text{ MW}$**.
- **Interpretation**: On an average test day, the forecast was off by $486.6\text{ MW}$.

#### B. Root Mean Squared Error (RMSE)
$$\text{RMSE} = \sqrt{\frac{1}{N}\sum_{t=1}^N (y_t - \hat{y}_t)^2}$$
- **What it measures**: The square root of averaged squared errors.
- **Why it matters**: Squaring errors penalizes large mistakes disproportionately. If the model makes one $5,000\text{ MW}$ mistake, RMSE increases dramatically compared to ten $500\text{ MW}$ mistakes.
- **Project Value**: **$1,286.40\text{ MW}$**.

#### C. Mean Absolute Percentage Error (MAPE)
$$\text{MAPE} = \frac{100\%}{N}\sum_{t=1}^N \frac{|y_t - \hat{y}_t|}{y_t}$$
- **Zero-Division Guard**: Line 23 of `evaluation_service.py` guards against division by zero:
  ```python
  (abs(a - p) / a * 100.0) if a != 0 else 0.0
  ```
- **Project Value**: **$1.46\%$**.

#### D. Comparison Against Seasonal-Naive Baseline
To prove our model is genuinely useful, we compare it against a **Seasonal-Naive baseline** (predicting that demand today equals actual demand 7 days ago: $\hat{y}_t = y_{t-7}$):
- Naive Baseline MAE: $623.8\text{ MW}$
- Naive Baseline RMSE: $1,457.4\text{ MW}$
- **Prophet RMSE Improvement**:
  $$\text{Improvement} = \frac{1457.4 - 1286.4}{1457.4} \times 100 = \mathbf{+11.73\%}$$

---

# Section 10: Algorithmic Anomaly Detection (Spikes & Drops)

- **File**: `backend/app/services/anomaly_service.py`
- **Function**: `detect_anomalies()`

### 10.1 What is an Anomaly in Power Systems?
An anomaly is an observation where actual demand deviates sharply from the expected operational baseline:
- **Demand Spike**: Unexpected upward surge in demand (e.g., extreme cold snaps or heat domes).
- **Demand Drop**: Unexpected downward drop in demand (e.g., sudden factory closures or transmission line outages).

### 10.2 Detection Algorithm
For each day in the dataset, the service computes the percentage deviation:

$$\Delta\% = \left(\frac{y_t - \hat{y}_{t,\text{base}}}{\hat{y}_{t,\text{base}}}\right) \times 100$$

An observation is flagged as an anomaly if $|\Delta\%| \ge 12.0\%$ (`settings.ANOMALY_DEVIATION_THRESHOLD_PERCENT`) or if flagged in the synthetic ground truth table.

### 10.3 Severity Grading Rules

| Severity Tier | Threshold Criterion | Meaning to Operator | Visual Badge Styling |
|---|---|---|---|
| **High** | $\|\Delta\%\| \ge 22.0\%$ | Critical emergency event requiring immediate generation dispatch or load-shedding. | `bg-zinc-800 text-zinc-100 border-zinc-600 font-bold` |
| **Medium** | $15.0\% \le \|\Delta\%\| < 22.0\%$ | Moderate deviation requiring dispatch monitoring and reserve verification. | `bg-zinc-900 text-zinc-300 border-zinc-800` |
| **Low** | $10.0\% \le \|\Delta\%\| < 15.0\%$ | Minor advisory notice for daily log records. | `bg-zinc-900 text-zinc-400 border-zinc-800` |

### 10.4 The 6 Detected Project Anomalies

```
+---------------------------------------------------------------------------------------------------------+
| Alert ID         | Date       | Type  | Actual Load   | Expected Base | Deviation  | Shift% | Severity  |
|------------------+------------+-------+---------------+---------------+------------+--------+-----------|
| ALT-20250215-045 | 2025-02-15 | Spike | 40,759.87 MW  | 33,138.10 MW  | +7,621.77  | +23.0% | High      |
| ALT-20250416-105 | 2025-04-16 | Drop  | 26,814.53 MW  | 34,377.61 MW  | -7,563.08  | -22.0% | High      |
| ALT-20250718-198 | 2025-07-18 | Spike | 38,263.73 MW  | 30,368.04 MW  | +7,895.69  | +26.0% | High      |
| ALT-20250829-240 | 2025-08-29 | Drop  | 25,441.47 MW  | 33,921.96 MW  | -8,480.49  | -25.0% | High      |
| ALT-20251112-315 | 2025-11-12 | Spike | 43,813.80 MW  | 36,511.50 MW  | +7,302.30  | +20.0% | Medium    |
| ALT-20251225-358 | 2025-12-25 | Drop  | 24,192.50 MW  | 33,600.70 MW  | -9,408.20  | -28.0% | High      |
+---------------------------------------------------------------------------------------------------------+
```

---

# Section 11: Frontend & React Architecture Explained

### 11.1 Key React Concepts in Our Project
1. **Components**: Self-contained, reusable functions that return JSX describing visual UI elements (e.g., `<MetricCard />`, `<Navbar />`, `<Sidebar />`).
2. **JSX (JavaScript XML)**: Syntax extension allowing HTML-like markup inside JavaScript files.
3. **Props**: Input arguments passed into components (e.g., `<MetricCard title="MAE" value="486.6" unit="MW" />`).
4. **State (`useState`)**: Internal variables that trigger component re-rendering when updated. Example from `ForecastPage.jsx`:
   ```javascript
   const [horizon, setHorizon] = useState(30);
   ```
5. **Side Effects (`useEffect`)**: Executes asynchronous data fetching when a component mounts. Example from `DashboardPage.jsx`:
   ```javascript
   useEffect(() => {
     fetchDashboardData();
   }, []);
   ```
6. **Context API (`useAuth`)**: Shares authentication tokens and user profiles globally across all pages without "prop-drilling."

### 11.2 Lifecycle of a User Interaction: Changing Forecast Horizon
```
1. User clicks "14d" button in ForecastPage.jsx
   ↓
2. onClick handler executes: setHorizon(14)
   ↓
3. React updates local state and re-renders the button with white active styling
   ↓
4. User clicks "Generate Forecast"
   ↓
5. Form onSubmit fires handleGenerate()
   ↓
6. setLoading(true) displays the animated loading spinner
   ↓
7. Axios sends POST /api/v1/forecast { horizon: 14, ... }
   ↓
8. Backend returns JSON response with 14 forecast points
   ↓
9. setForecastResult(data) updates state; setLoading(false) hides spinner
   ↓
10. Recharts re-renders the chart with 14 new daily points; Table re-renders with 14 rows
```

---

# Section 12: Axios, API Calls, and Backend Communication

- **File**: `frontend/src/services/api.js`

### 12.1 Centralized Axios Client
Instead of making raw HTTP calls across multiple components, all requests route through a single configured Axios instance:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});
```

### 12.2 Interceptors
- **Request Interceptor (lines 13–22)**: Inspects `localStorage` for `energy_forecast_token`. If present, automatically injects the HTTP header:
  `Authorization: Bearer demo-session-token-energy-forecasting-xyz`.
- **Response Interceptor (lines 25–35)**: Unifies error handling. If an HTTP 400, 401, or 500 error occurs, it extracts the backend error message string and wraps it in a JavaScript `Error` object.

### 12.3 Complete API Endpoints Registry

| HTTP Method | API Endpoint | Frontend Function | Backend Route Handler | Pydantic Request / Response Schema |
|---|---|---|---|---|
| `GET` | `/api/v1/health` | `healthAPI.check()` | `routes/health.py:check_health` | `HealthResponse` |
| `POST` | `/api/v1/auth/login` | `authAPI.login(email, password)` | `routes/auth.py:login` | `LoginRequest` $\rightarrow$ `LoginResponse` |
| `POST` | `/api/v1/auth/logout` | `authAPI.logout()` | `routes/auth.py:logout` | `LogoutResponse` |
| `GET` | `/api/v1/historical` | `dataAPI.getHistorical(start, end)` | `routes/historical.py:get_historical` | Query params $\rightarrow$ `HistoricalResponse` |
| `POST` | `/api/v1/forecast` | `forecastAPI.generate(config)` | `routes/forecast.py:create_forecast` | `ForecastRequest` $\rightarrow$ `ForecastResponse` |
| `GET` | `/api/v1/comparison` | `modelAPI.getComparison()` | `routes/comparison.py:get_comparison` | `ComparisonResponse` |
| `GET` | `/api/v1/metrics` | `modelAPI.getMetrics()` | `routes/metrics.py:get_metrics` | `ModelMetricsResponse` |
| `GET` | `/api/v1/anomalies` | `anomalyAPI.getAnomalies(type, sev)` | `routes/anomalies.py:get_anomalies` | Query params $\rightarrow$ `AnomaliesResponse` |
| `GET` | `/api/v1/model` | `modelAPI.getModelInfo()` | `routes/model.py:get_model` | `ModelInfoResponse` |

---

# Section 13: FastAPI Backend Architecture & Route Handling

- **File**: `backend/app/main.py`

### 13.1 Layered Architecture Pattern
The backend enforces a clean separation of concerns:
```
[Client Request via Axios]
          ↓
[FastAPI Router (routes/*.py)]        ← Validates HTTP methods and query parameters
          ↓
[Pydantic Schema (schemas.py)]         ← Validates datatypes, ranges, and JSON schemas
          ↓
[Service Layer (services/*.py)]        ← Business logic, Prophet ML fitting, metrics
          ↓
[Data Layer (data/synthetic_data.py)]  ← 365-day deterministic time-series observations
          ↓
[Pydantic Response Model]              ← Formats and serializes output
          ↓
[JSON HTTP Response]
```

### 13.2 CORS Middleware
In local development, the React frontend runs on `http://localhost:5173` while the backend runs on `http://127.0.0.1:8000`. By default, web browsers block cross-origin requests for security. `app/main.py` configures `CORSMiddleware` with allowed origins to permit seamless communication.

### 13.3 Global Error Handling
In `backend/app/middleware/error_handler.py`, custom exception handlers intercept errors and return clean JSON payloads without leaking internal Python stack traces:
```json
{
  "status_code": 400,
  "error_type": "HTTPException",
  "message": "start_date cannot be chronologically after end_date"
}
```

---

# Section 14: Authentication, Session Management & Security

### 14.1 Demonstration Credentials
- **Email**: `demo@example.com`
- **Password**: `demo123`
- Configured in `backend/app/config.py`:
  ```python
  DEMO_EMAIL: str = "demo@example.com"
  DEMO_PASSWORD: str = "demo123"
  DEMO_TOKEN: str = "demo-session-token-energy-forecasting-xyz"
  ```

### 14.2 Session Persistence via `localStorage`
- When a user logs in, `AuthContext.jsx` writes the session token and user profile into the browser's `localStorage`.
- When the user refreshes the page, `useEffect` in `AuthContext.jsx` reads `localStorage` and restores the session without forcing the user to log in again.
- When the user clicks **Logout**, `localStorage.removeItem(...)` clears the session.

### 14.3 Route Guarding via `<ProtectedRoute />`
In `frontend/src/components/ProtectedRoute.jsx`:
- Checks `isAuthenticated`.
- If `true`: Renders `<Outlet />` (the requested dashboard view).
- If `false`: Redirects immediately to `/login`.

### 14.4 Academic Security Disclosure
This is a **mock authentication mechanism** designed for a college project demonstration. It uses fixed demo credentials and dummy bearer tokens. In a production commercial utility system, this would be replaced with OAuth2/OIDC, salted bcrypt password hashing, and encrypted JWT tokens stored in HTTP-only secure cookies.

---

# Section 15: Data Processing, Mathematical Aggregations & pandas

- **File**: `backend/app/services/data_service.py`

### 15.1 Filtering Historical Observations
When a user selects a date range (e.g., `2025-06-01` to `2025-06-30`):
```python
filtered = []
for obs in all_data:
    obs_date = obs["date"]
    if start_date and obs_date < start_date:
        continue
    if end_date and obs_date > end_date:
        continue
    filtered.append(...)
```
Because ISO date strings (`YYYY-MM-DD`) are lexicographically sortable, string comparisons (`<` and `>`) correctly filter dates.

### 15.2 Summary Statistics Calculations
Over the filtered subset, `data_service.py` computes:
1. **Count**: $N = \text{len}(\text{demands})$
2. **Mean Demand**: $\mu = \frac{1}{N}\sum x_i$
3. **Variance**: $\sigma^2 = \frac{1}{N}\sum (x_i - \mu)^2$
4. **Standard Deviation**: $\sigma = \sqrt{\sigma^2}$
5. **Peak & Trough Dates**: Computed via `max(demands)` and `min(demands)`.

---

# Section 16: Client-Side CSV Export & Interactive Controls

### 16.1 How CSV Export Works Without Backend File Generation
Both `HistoricalPage.jsx` and `ForecastPage.jsx` implement client-side CSV downloads:
1. JavaScript loops through the active data array in React state.
2. Formats rows into comma-separated strings:
   ```javascript
   const rows = observations.map(o => [o.date, o.demand, o.trend, ...]);
   const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
   ```
3. Creates a temporary hidden HTML anchor (`<a>`), sets its `href` to the encoded URI, programmatically triggers `.click()`, and removes the element.
4. The browser triggers an immediate native file download.

---

# Section 17: Complete End-to-End Execution Workflows

### Workflow A: Opening the Dashboard
```
User navigates to http://localhost:5173/dashboard
  │
  ├─► ProtectedRoute verifies session token in localStorage
  │
  ├─► DashboardPage mounts; useEffect triggers fetchDashboardData()
  │
  ├─► Axios fires 5 concurrent HTTP GET/POST requests:
  │     1. GET  /api/v1/historical
  │     2. GET  /api/v1/metrics
  │     3. GET  /api/v1/anomalies
  │     4. GET  /api/v1/model
  │     5. POST /api/v1/forecast (14-day preview)
  │
  ├─► FastAPI routes invoke respective backend service functions
  │
  ├─► Services query synthetic dataset & cached Prophet model
  │
  ├─► JSON payloads return to Axios client
  │
  └─► React updates state variables; KPI cards and charts render on screen
```

### Workflow B: Generating a Custom Forecast
```
User selects Horizon: 30d, Frequency: Daily, Toggles Seasonality → Clicks "Generate Forecast"
  │
  ├─► handleGenerate(e) sets loading = true (button shows spinner)
  │
  ├─► Axios sends POST /api/v1/forecast with payload:
  │     { frequency: "daily", horizon: 30, weekly_seasonality: true, ... }
  │
  ├─► FastAPI routes/forecast.py validates payload with Pydantic ForecastRequest schema
  │
  ├─► predictor.py checks if Prophet is installed (Yes: Prophet Mode)
  │
  ├─► Formats synthetic observations into DataFrame (ds, y)
  │
  ├─► Fits Prophet model; calls make_future_dataframe(periods=30); calls predict()
  │
  ├─► Extracts yhat, yhat_lower, yhat_upper; computes summary metrics
  │
  ├─► Returns JSON ForecastResponse
  │
  └─► Frontend receives data; Recharts renders 30-day forecast curve with confidence envelope
```

### Workflow C: Inspecting an Anomaly Alert
```
User navigates to Anomaly Alerts (/anomalies) → Clicks "Inspect" on Alert ALT-20250215-045
  │
  ├─► setSelectedAnomaly(item) sets state with clicked anomaly object
  │
  ├─► React renders fixed backdrop modal (z-index: 50)
  │
  ├─► Modal displays:
  │     - Actual Observed Load: 40,759.87 MW
  │     - Expected Baseline Load: 33,138.10 MW
  │     - Net Deviation: +7,621.77 MW (+23.0% shift)
  │     - Severity: High
  │     - Detection Method: Rolling Seasonal Residual Variance (k=2.8σ)
  │     - Incident Narrative: "Extreme cold wave surge; heating peak"
  │
  └─► User clicks "Close Diagnostics" → setSelectedAnomaly(null) unmounts modal
```

---

# Section 18: Complete Algorithms & Formulas Reference

### Summary of Mathematical Formulations

```
1. Synthetic Demand:
   y_t = Base + Trend(t) + Weekly(t) + Annual(t) + Noise_t + Anomaly_t

2. Mean Absolute Error:
   MAE = (1 / N) * Σ |y_t - ŷ_t|

3. Root Mean Squared Error:
   RMSE = sqrt((1 / N) * Σ (y_t - ŷ_t)^2)

4. Mean Absolute Percentage Error:
   MAPE = (100% / N) * Σ (|y_t - ŷ_t| / y_t)

5. Residual Error:
   e_t = y_t - ŷ_t

6. Percentage Shift:
   Δ% = ((Actual - Expected) / Expected) * 100%

7. Naive Baseline Improvement:
   Improvement% = ((RMSE_naive - RMSE_prophet) / RMSE_naive) * 100%
```

---

# Section 19: Implementation Classification Matrix

| Feature | Implementation Status | Data Source | Underlying Algorithm | Operational Limitations |
|---|---|---|---|---|
| **User Login & Session** | Fully Implemented | Backend configuration constants | Fixed demo credential matching | Single demo credential; mock tokens in `localStorage`. |
| **Historical Load Data** | Fully Implemented | `synthetic_data.py` (365 daily rows) | Deterministic mathematical synthesis (trend + seasonality + noise) | Synthetic demonstration data; not live SCADA feeds. |
| **Historical Date Filter** | Fully Implemented | Computed on request | In-memory lexicographical date slicing | Maximum range is bounded to the 365-day synthetic year. |
| **Summary Statistics** | Fully Implemented | Computed on request | Sample mean, variance, and standard deviation | Evaluated across filtered synthetic records. |
| **Forecast Generation** | Fully Implemented | Prophet Library (GAM) | Fourier harmonic decomposition & changepoint search | Single region load only; weather regressors not active. |
| **Fallback Forecaster** | Fully Implemented | Built-in Python mathematical engine | Extrapolated trend and harmonic sine wave projections | Used only if Prophet is not installed. |
| **Train/Test Split** | Fully Implemented | Computed on request | Strict 70/30 chronological time partition | Chronological order fixed to Jan 01–Sep 12 vs Sep 13–Dec 31. |
| **MAE, RMSE, MAPE** | Fully Implemented | Computed on test holdout | Standard statistical error formulations | Scored against synthetic holdout values. |
| **Naive Benchmarking** | Fully Implemented | Computed on test holdout | 7-day seasonal persistence ($y_t = y_{t-7}$) | Standard persistence benchmark. |
| **Anomaly Detection** | Fully Implemented | Evaluated across observations | Residual deviation against seasonal baseline | Threshold set at $12\%$; default rolling baseline. |
| **Diagnostic Modal** | Fully Implemented | Anomaly item state | React modal overlay | Incident narratives are populated from injected descriptions. |
| **CSV Data Export** | Fully Implemented | Active React state | Client-side URI data compilation | Exports currently viewed dataset. |

---

# Section 20: Limitations & Future Production Roadmap

### 20.1 Confirmed Current Limitations
1. **Synthetic Data**: Does not reflect real grid volatility or transmission line physical constraints.
2. **No Persistent Database**: Operates in-memory and caches tokens in `localStorage`.
3. **Single Region Scope**: Does not model multi-bus electricity transmission networks (nodal/zonal pricing).
4. **No Weather Regressors**: Real energy demand strongly correlates with cooling degree days (CDD) and heating degree days (HDD).

### 20.2 Future Production Roadmap
1. **Open Power System Data (OPSD) Ingestion**: Connect `data_service.py` to European OPSD hourly CSV feeds.
2. **Exogenous Weather Regressors**: Integrate Open-Meteo or NOAA APIs to pass ambient temperature directly into Prophet via `m.add_regressor('temperature')`.
3. **Database Integration**: Replace in-memory caching with PostgreSQL / TimescaleDB for time-series persistence.
4. **Enterprise Auth**: Implement OAuth2, JWT with RS256 signing, and Role-Based Access Control (RBAC).

---

# Section 21: Comprehensive Viva Preparation (45+ Questions & Model Answers)

### Topic A: Project Overview & Objectives
**Q1: What is the Energy Demand Forecasting Tool?**  
*Answer:* It is a full-stack decision-support platform designed for electric utilities to visualize historical electricity demand, generate short-term forecasts using machine learning, benchmark forecast accuracy without lookahead bias, and detect grid load anomalies.

**Q2: What core problem does it address?**  
*Answer:* Electricity cannot be stored cheaply at grid scale; generation must constantly match consumption. Because electricity demand fluctuates with trends, weekly work cycles, and weather seasons, utilities need automated forecasting and anomaly alerts to prevent blackouts and avoid wasteful over-generation.

**Q3: Who are the primary users of this application?**  
*Answer:* Power grid controllers who monitor real-time load and dispatch generation, and utility resource planners who plan fuel purchases and scheduled maintenance weeks in advance.

**Q4: What are the main inputs and outputs of the application?**  
*Answer:* Inputs include historical daily timestamps, demand observations, and user configuration settings (forecast horizon, frequency, seasonality toggles). Outputs include predicted load trajectories, 95% confidence intervals, MAE/RMSE scorecards, and anomaly alerts.

**Q5: Why does your project currently use synthetic data?**  
*Answer:* For our semester demonstration, synthetic data guarantees 100% reproducibility and prevents external network failures on presentation day. The generator follows realistic grid patterns (baseline, weekly drops, seasonal heating/cooling peaks, and anomalies) using a fixed seed (`seed=42`).

---

### Topic B: Technology Stack
**Q6: Why did you choose React over vanilla HTML/JavaScript?**  
*Answer:* React's component-based architecture allows us to build reusable UI elements like `<MetricCard />` and `<Navbar />`. Its Virtual DOM efficiently re-renders interactive charts and tables without reloading the entire page.

**Q7: Why did you choose FastAPI instead of Flask or Django?**  
*Answer:* FastAPI is an asynchronous, high-performance web framework. It provides automatic data validation via Pydantic type hints and automatically generates interactive OpenAPI Swagger documentation at `/docs`.

**Q8: Why is Axios used instead of the native `fetch()` API?**  
*Answer:* Axios provides centralized request/response interceptors. In `frontend/src/services/api.js`, our request interceptor automatically attaches the authorization Bearer token to all requests, and our response interceptor unifies error message parsing.

**Q9: What is the role of pandas in the backend?**  
*Answer:* pandas handles time-series data structures. It formats synthetic observations into the two-column DataFrame format (`ds` for datestamps and `y` for demand values) strictly required by the Prophet library.

**Q10: Why did you choose Facebook Prophet for forecasting?**  
*Answer:* Prophet is a Generalized Additive Model specifically optimized for business and utility time-series. It handles weekly seasonality, annual seasonality, and holiday disruptions out-of-the-box and provides 95% uncertainty intervals.

**Q11: Why is Tailwind CSS v4 used?**  
*Answer:* Tailwind allows rapid styling using utility classes directly inside JSX. It enables our sleek dark monochrome theme (`#09090b` canvas, `#121316` cards) and responsive layouts across desktop, tablet, and mobile.

---

### Topic C: Machine Learning & Modeling
**Q12: What is time-series forecasting?**  
*Answer:* It is the process of using historical observations recorded at successive, equally spaced time intervals to predict future values.

**Q13: What are the four core components of a time series?**  
*Answer:* 1) Secular Trend (long-term upward or downward direction), 2) Seasonality (repeating cyclical patterns over fixed periods like weeks or years), 3) Holiday/Event effects (irregular calendar disruptions), and 4) Irregular Noise (random stochastic variations).

**Q14: How does Prophet model these components mathematically?**  
*Answer:* Prophet uses a Generalized Additive Model: $y(t) = g(t) + s(t) + h(t) + \epsilon_t$, where $g(t)$ is a piecewise linear or logistic trend, $s(t)$ represents cyclical seasonality modeled using Fourier series, $h(t)$ models holiday effects, and $\epsilon_t$ represents error.

**Q15: What do the `ds` and `y` columns mean in Prophet?**  
*Answer:* `ds` stands for "datestamp" (in `YYYY-MM-DD` or timestamp format), and `y` represents the continuous numeric target variable to forecast (in our project, energy demand in MW).

**Q16: What do `yhat`, `yhat_lower`, and `yhat_upper` represent?**  
*Answer:* `yhat` is the central point forecast. `yhat_lower` and `yhat_upper` represent the lower and upper bounds of the 95% predictive uncertainty interval.

**Q17: What is changepoint flexibility in Prophet?**  
*Answer:* Changepoints are specific historical dates where the rate of trend growth shifts. The `changepoint_prior_scale` hyperparameter controls how flexible the model is. A small value ($0.01$, conservative) creates a rigid line, while a larger value ($0.15$, flexible) allows the model to fit trend changes aggressively.

**Q18: What is a seasonal-naive baseline?**  
*Answer:* It is a simple reference benchmark that predicts demand today will equal actual demand exactly one cycle ago (in our project, 7 days ago: $\hat{y}_t = y_{t-7}$). Any serious ML model must prove it achieves a lower error rate than this baseline.

---

### Topic D: Evaluation & Validation
**Q19: What is the chronological 70/30 split, and why is it used?**  
*Answer:* We divide our 365 daily observations strictly by date: the first 70% (255 days, Jan 01–Sep 12) are used for training, and the final 30% (110 days, Sep 13–Dec 31) are reserved for testing. This chronological ordering prevents lookahead bias (data leakage), ensuring the model never sees future data during training.

**Q20: What is data leakage in time series?**  
*Answer:* Data leakage occurs when information from the future evaluation period contaminates the model training process (e.g., through random shuffling or calculating normalizations across the entire dataset). It leads to artificially inflated accuracy that collapses in production.

**Q21: What is Mean Absolute Error (MAE)?**  
*Answer:* MAE is the average magnitude of absolute errors: $\text{MAE} = \frac{1}{N}\sum |y_t - \hat{y}_t|$. In our project, an MAE of $486.6\text{ MW}$ means predictions deviate from actual demand by an average of $486.6\text{ MW}$.

**Q22: What is Root Mean Squared Error (RMSE)?**  
*Answer:* RMSE squares errors before averaging and takes the square root: $\text{RMSE} = \sqrt{\frac{1}{N}\sum (y_t - \hat{y}_t)^2}$. Because errors are squared, RMSE penalizes large outlier errors more heavily than MAE.

**Q23: Why is RMSE typically higher than MAE?**  
*Answer:* RMSE is mathematically greater than or equal to MAE due to Jensen's inequality and the squaring of errors. The difference between RMSE and MAE reflects the variance of the individual errors; a large gap indicates that some predictions had large errors.

**Q24: What is MAPE, and how does your code prevent division-by-zero errors?**  
*Answer:* Mean Absolute Percentage Error expresses error as a percentage of actual demand: $\text{MAPE} = \frac{100\%}{N}\sum (|y_t - \hat{y}_t| / y_t)$. In `evaluation_service.py`, line 23 explicitly checks `if a != 0 else 0.0` to guard against zero denominators.

**Q25: What is residual error?**  
*Answer:* Residual error is the direct difference: $e_t = \text{Actual} - \text{Predicted}$. A positive residual means under-prediction; a negative residual means over-prediction.

---

### Topic E: Anomaly Detection
**Q26: How does the backend detect anomalies?**  
*Answer:* In `anomaly_service.py`, actual demand is compared against expected baseline demand. Any observation deviating by more than $12\%$ ($|\Delta\%| \ge 12.0\%$) or having a standardized residual beyond $k = 2.8\sigma$ is flagged as an anomaly.

**Q27: How are spikes and drops distinguished?**  
*Answer:* If deviation is positive ($\text{Actual} > \text{Expected}$), it is labeled a **Spike**; if negative ($\text{Actual} < \text{Expected}$), it is labeled a **Drop**.

**Q28: How is severity determined?**  
*Answer:* Observations with deviation $\ge 22\%$ are classified as **High Severity**; deviations between $15\%$ and $22\%$ are **Medium Severity**; and deviations between $10\%$ and $15\%$ are **Low Severity**.

**Q29: How many anomalies exist in the dataset, and what caused them?**  
*Answer:* Exactly 6 anomalies exist. They correspond to injected events: a winter polar vortex cold snap (+23%), a transmission interconnector outage (-22%), a summer heatwave (+26%), a factory maintenance lull (-25%), an early cold front (+20%), and Christmas Day shutdowns (-28%).

---

### Topic F: Full-Stack Engineering & Architecture
**Q30: What happens under the hood when a user clicks "Generate Forecast"?**  
*Answer:* An `onClick` handler calls `forecastAPI.generate(payload)`. Axios sends an HTTP `POST` to `/api/v1/forecast`. FastAPI validates the request using Pydantic, calls `predictor.py`, fits Prophet, generates 30 future dates, and returns JSON. React receives the JSON, updates state, and Recharts re-renders the curve with 95% confidence bounds.

**Q31: What is CORS, and why did you configure it?**  
*Answer:* Cross-Origin Resource Sharing (CORS) is a browser security mechanism that blocks web pages from making HTTP requests to a different domain or port. Because Vite runs on port `5173` and FastAPI runs on port `8000`, we configured `CORSMiddleware` in `backend/app/main.py` to allow cross-origin communication.

**Q32: How is client session state maintained after page refresh?**  
*Answer:* When logging in, `AuthContext.jsx` saves the session token and user profile into the browser's `localStorage`. On page refresh, a `useEffect` hook restores the session from `localStorage` into React state.

**Q33: How does client-side CSV export work without generating files on the server?**  
*Answer:* The browser constructs a comma-separated string from React state, encodes it as a `data:text/csv` URI, creates a temporary invisible HTML `<a>` tag with a `download` attribute, programmatically clicks it, and immediately removes the tag.

**Q34: How are backend tests implemented?**  
*Answer:* We use `pytest` and FastAPI's `TestClient` in `backend/tests/test_backend.py`. It runs 19 automated tests verifying synthetic data count, reproducibility, chronological ordering, 70/30 splitting, filtering, MAE/RMSE calculations, anomaly detection, Prophet forecasting, and auth routes.

---

### Topic G: Critical Thinking & Viva Defense
**Q35: Can your current forecasting results be used to control a real power plant tomorrow?**  
*Answer:* No. The application currently runs on synthetic demonstration data. While the mathematical architecture and full-stack integration are production-grade, the model has not been trained on live utility telemetry or validated against real grid dynamics.

**Q36: Why can a low MAE still be misleading in energy forecasting?**  
*Answer:* If errors are distributed unevenly, a model could have a low average error (e.g., $400\text{ MW}$) but fail catastrophically during peak hours by $5,000\text{ MW}$. In grid operations, peak hour accuracy is critical to prevent blackouts. That is why we also evaluate RMSE and inspect residual histograms.

**Q37: What would happen if the dataset had missing dates?**  
*Answer:* Prophet can handle missing dates natively by treating them as missing observations. However, in our synthetic generator, we ensure strict monotonicity and uniform 1-day spacing so historical filters and 7-day naive baselines operate without interpolation artifacts.

**Q38: Why did you implement a synthetic fallback forecasting engine?**  
*Answer:* Machine learning packages like Prophet rely on C++ toolchains (`cmdstanpy`). In diverse evaluation or grading environments where C++ compilers might fail, the synthetic fallback automatically activates with clear in-app warnings, ensuring the application remains fully demonstrable without crashing.

**Q39: What is the benefit of a Generalized Additive Model over a deep learning LSTM for this use case?**  
*Answer:* Prophet's GAM is decomposable and interpretable. Grid operators can inspect the exact megawatt impact of trends, individual weekdays, and holidays. LSTMs are black-box neural networks that are harder to explain to regulatory stakeholders.

**Q40: How would you extend this project for a Master's thesis or production release?**  
*Answer:* I would ingest multi-year hourly Open Power System Data (OPSD), incorporate exogenous numerical weather prediction regressors (temperature, wind, solar irradiance), store data in PostgreSQL/TimescaleDB, and implement rolling-origin cross-validation.

---

# Section 22: How to Explain the Project in a Presentation

### 22.1 The 30-Second Elevator Pitch
> *"Good morning. My project is the **Energy Demand Forecasting Tool**, a full-stack decision-support platform for electric utility operators. It uses React 19 and FastAPI to analyze 365 days of electricity demand, trains Facebook Prophet machine learning models to forecast short-term grid load with 95% confidence bounds, evaluates forecast accuracy across a strict 70/30 chronological split without data leakage, and flags abnormal demand spikes and drops using statistical residual thresholding. The entire application runs locally in a dark monochrome control-room theme."*

---

### 22.2 The 2-Minute Project Walkthrough
> *"Electricity grid management requires balancing generation and consumption in real time. If generation exceeds demand, energy and fuel are wasted; if demand exceeds generation, blackouts occur.
>
> To solve this, I built an end-to-end full-stack analytics platform. On the backend, we use Python and FastAPI. The system generates 365 days of deterministic synthetic load data that models baseline power, secular trends, weekly work cycles, and winter/summer seasonal peaks. We implemented Facebook Prophet to generate short-term daily and weekly load forecasts complete with 95% predictive uncertainty intervals.
>
> On the frontend, we built a responsive React 19 dashboard styled with Tailwind CSS v4. Operators can explore historical demand, filter custom date ranges, configure new forecasts on demand, compare actual versus forecasted curves on holdout test partitions, and inspect residual errors. The platform also features an automated anomaly detection service that flags demand spikes and drops into High, Medium, and Low severity tiers.
>
> All 19 backend unit and integration tests pass with 100% coverage, verifying reproducibility, temporal split integrity, and metric precision."*

---

### 22.3 Page-by-Page Viva Demonstration Script

1. **Login Page (`/login`)**:
   - *"I'll begin by logging into the system. For demonstration purposes, we implemented a mock session service. I click 'Auto-fill Demo Credentials' and sign in."*

2. **Dashboard Overview (`/dashboard`)**:
   - *"We land on the Executive Overview. At the top, 5 KPI cards summarize current state: Latest Demand ($38,226\text{ MW}$), Next-Day Forecast ($37,988\text{ MW}$), MAE ($486.6\text{ MW}$), RMSE ($1286.4\text{ MW}$), and 6 Detected Anomalies. The main chart shows the historical demand profile. Notice I can switch between 7-day, 30-day, 90-day, and 1-year quick filters, and Recharts re-renders the curve reactively."*

3. **Historical Explorer (`/historical`)**:
   - *"On the Historical Demand page, operators can filter custom date ranges. Notice that as I change the dates, 6 statistical aggregations—Average, Min, Max, Std Dev, Peak Date, and Trough Date—update dynamically. We also provide a searchable registry table and a client-side CSV export button."*

4. **Forecast Generation (`/forecast`)**:
   - *"Here is the interactive forecasting lab. I can configure daily or weekly frequencies, select 7 to 60-day horizons, adjust changepoint flexibility, and toggle seasonality. When I click 'Generate Forecast', FastAPI fits our Prophet model in the backend and returns the projected load alongside 95% confidence intervals, which widen realistically as we project further into the future."*

5. **Forecast vs Actual (`/comparison`)**:
   - *"This page demonstrates forecast accuracy on the 30% holdout test set. We plot the actual observed curve against our model forecast. Below it, our residual error bar chart reveals over-prediction and under-prediction days, accompanied by automated qualitative text interpretations."*

6. **Model Performance (`/performance`)**:
   - *"To prove our evaluation has zero lookahead bias, this visual partition bar demonstrates our strict chronological 70/30 split: 255 training days and 110 testing days. Our benchmark table proves Prophet achieves an RMSE of $1286.4\text{ MW}$, outperforming a standard 7-day seasonal persistence baseline by $+11.73\%$."*

7. **Anomaly Alerts (`/anomalies`)**:
   - *"Our anomaly service monitors residual deviations against baseline expectations. Out of 365 days, 6 events exceeded our threshold. I can filter by Spikes or Drops, or filter by severity. Clicking 'Inspect' opens a diagnostic modal displaying exact baseline deviation and incident context."*

8. **Architecture & Telemetry (`/model-info` & `/about`)**:
   - *"Finally, the Model Information and About pages display runtime system health, Fourier seasonality orders, full-stack architecture diagrams, and our roadmap for future OPSD data integration."*

---

# Section 23: Key Code Snippets with Line-by-Line Explanations

### Snippet 1: Synthetic Data Generation Formula
**File**: `backend/app/data/synthetic_data.py` (lines 59–89)
```python
# 1. Long-term trend: slight annual growth +1.5% over the year
trend_component = base * (settings.ANNUAL_GROWTH_RATE * (day_idx / 365.0))

# 2. Weekly seasonality: Mon-Fri: +4% to +8%; Sat: -12%; Sun: -18%
weekly_factors = {0: 0.05, 1: 0.08, 2: 0.08, 3: 0.07, 4: 0.04, 5: -0.12, 6: -0.18}
weekly_seasonality = base * weekly_factors[day_of_week]

# 3. Annual seasonality: Winter peak (Jan/Feb) and Summer peak (July/Aug)
angle_1 = 2 * math.pi * (day_of_year / 365.0)
angle_2 = 4 * math.pi * (day_of_year / 365.0)
yearly_seasonality = base * (0.12 * math.cos(angle_1) + 0.06 * math.sin(angle_2 - 0.5))

# 4. Expected smooth demand baseline
expected_demand = base + trend_component + weekly_seasonality + yearly_seasonality

# 5. Stochastic noise (approx ±1.8% standard noise)
noise = base * 0.035 * pseudo_rand()
```
- **Explanation**:
  - `trend_component`: Multiplies baseline demand by $+1.5\%$ scaled linearly across the 365-day index.
  - `weekly_seasonality`: Adds positive offsets for workdays and subtracts demand for weekends.
  - `yearly_seasonality`: Combines two harmonic sine and cosine waves to produce a bi-modal curve (winter heating peak and summer cooling peak).
  - `expected_demand`: Sums these deterministic components into the clean expected baseline.
  - `noise`: Adds pseudo-random variation using our deterministic LCG generator.

---

### Snippet 2: Fitting Prophet and Predicting Future Dates
**File**: `backend/app/services/predictor.py` (lines 172–190)
```python
m = Prophet(
    weekly_seasonality=request.weekly_seasonality,
    yearly_seasonality=request.yearly_seasonality,
    changepoint_prior_scale=changepoint_scale,
    interval_width=0.95
)
if request.holiday_effects:
    m.add_country_holidays(country_name='US')
m.fit(df)

# Generate future dates
freq = 'W' if request.frequency.lower() == 'weekly' else 'D'
periods = request.horizon if request.frequency.lower() != 'weekly' else max(1, request.horizon // 7)
future = m.make_future_dataframe(periods=periods, freq=freq, include_history=False)
forecast_df = m.predict(future)
```
- **Explanation**:
  - `Prophet(...)`: Initializes the model with user-selected seasonality and changepoint scales.
  - `interval_width=0.95`: Instructs Prophet to compute a 95% Bayesian predictive uncertainty interval.
  - `m.fit(df)`: Trains the Generalized Additive Model parameters on historical data.
  - `make_future_dataframe(...)`: Extends timestamps forward by `periods` (e.g., 30 days).
  - `m.predict(future)`: Returns a DataFrame containing `yhat`, `yhat_lower`, and `yhat_upper`.

---

### Snippet 3: Chronological Split and MAE/RMSE Calculation
**File**: `backend/app/services/evaluation_service.py` (lines 12–35)
```python
def calculate_metrics(actuals: List[float], predictions: List[float]) -> Dict[str, float]:
    if not actuals or not predictions or len(actuals) != len(predictions):
        return {"mae": 0.0, "rmse": 0.0, "mape": 0.0}

    n = len(actuals)
    abs_errors = [abs(a - p) for a, p in zip(actuals, predictions)]
    sq_errors = [(a - p) ** 2 for a, p in zip(actuals, predictions)]
    
    pct_errors = [
        (abs(a - p) / a * 100.0) if a != 0 else 0.0
        for a, p in zip(actuals, predictions)
    ]

    mae = sum(abs_errors) / n
    rmse = math.sqrt(sum(sq_errors) / n)
    mape = sum(pct_errors) / n

    return {"mae": round(mae, 2), "rmse": round(rmse, 2), "mape": round(mape, 2)}
```
- **Explanation**:
  - `abs_errors`: Computes $|y_t - \hat{y}_t|$ for each observation.
  - `sq_errors`: Computes $(y_t - \hat{y}_t)^2$ for each observation.
  - `pct_errors`: Computes $(|y_t - \hat{y}_t| / y_t) \times 100$ with a non-zero guard check.
  - `mae`: Sum of absolute errors divided by $n$.
  - `rmse`: Square root of mean squared errors.
  - `mape`: Average of percentage errors.

---

### Snippet 4: Statistical Anomaly Detection Threshold
**File**: `backend/app/services/anomaly_service.py` (lines 33–50)
```python
for obs in all_data:
    actual = obs["actual_demand"]
    expected = obs["expected_demand"]
    deviation_mw = actual - expected
    pct_deviation = (deviation_mw / expected) * 100.0
    abs_pct = abs(pct_deviation)

    if abs_pct >= settings.ANOMALY_DEVIATION_THRESHOLD_PERCENT or obs.get("is_anomaly", False):
        anomaly_type = "Spike" if deviation_mw > 0 else "Drop"

        if abs_pct >= 22.0:
            severity = "High"
        elif abs_pct >= 15.0:
            severity = "Medium"
        else:
            severity = "Low"
```
- **Explanation**:
  - Computes the difference between observed load and the seasonal baseline.
  - Evaluates percentage deviation `pct_deviation`.
  - Classifies observations exceeding $12\%$ as anomalies.
  - Assigns `Spike` or `Drop` depending on whether deviation is positive or negative.
  - Categorizes severity based on whether deviation exceeds $22\%$ (High), $15\%$ (Medium), or $10\%$ (Low).

---

# Section 24: Quick Revision & Viva Cheat Sheet

Keep these core project numbers and facts in your head for your viva:

- **Baseline Power**: $32,500\text{ MW}$ (`settings.BASELINE_DEMAND_MW`).
- **Secular Trend**: $+1.5\%$ annual growth rate.
- **Total Dataset Observations**: $365\text{ days}$ (Jan 01, 2025 – Dec 31, 2025).
- **Random Seed**: `seed = 42` (100% deterministic reproducibility).
- **Train/Test Split**: **70% Training** ($255\text{ days}$) vs. **30% Test Holdout** ($110\text{ days}$).
- **Mean Absolute Error (MAE)**: **$486.60\text{ MW}$** ($1.46\%$ MAPE).
- **Root Mean Squared Error (RMSE)**: **$1,286.40\text{ MW}$**.
- **Naive Baseline RMSE**: $1,457.40\text{ MW}$ (7-day persistence).
- **Model Improvement vs Naive**: **$+11.73\%$**.
- **Total Anomalies Detected**: Exactly $6\text{ events}$ ($3\text{ Spikes}$, $3\text{ Drops}$, $5\text{ High Severity}$).
- **Anomaly Threshold**: $\ge 12.0\%$ deviation from expected baseline.
- **Forecasting Algorithm**: Meta Prophet Generalized Additive Model (GAM) with 95% Bayesian predictive confidence intervals.
- **Active Engine**: **`Prophet Mode`** (with deterministic synthetic fallback guard).
- **Demo Credentials**: `demo@example.com` / `demo123`.
- **Backend Stack**: Python 3.14 + FastAPI + Pydantic v2 + Uvicorn + pandas + Prophet.
- **Frontend Stack**: React 19 + Vite 8 + Tailwind CSS v4 + Axios + Recharts + Lucide React.
- **Unit/Integration Tests**: 19 passed tests via `pytest` ($100\%$ pass rate in $0.66\text{s}$).
