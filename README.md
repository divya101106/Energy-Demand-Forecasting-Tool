# Energy Demand Forecasting Tool

> **Semester Project Demonstration — Advanced Data Science & Full-Stack Web Application**  
> **UI Theme:** Sleek Dark Theme with Monochromatic Contrast Palette  
> **Demonstration Mode:** Synthetic Test Data (100% Deterministic & Reproducible)

---

## 1. Project Overview

The **Energy Demand Forecasting Tool** is an end-to-end decision-support web platform engineered for electric utility planners and grid operations teams. The tool delivers:
- **Historical Load Analysis:** 365 days of synthetic daily load observations with interactive date filtering and statistical aggregations.
- **Short-Term Demand Forecasting:** Configurable daily and weekly forecasts with 95% uncertainty intervals powered by **Facebook Prophet** (with automatic synthetic fallback).
- **Forecast vs. Actual Evaluation:** Direct comparison of actual demand against model forecasts across a strict **70/30 chronological holdout split**.
- **Model Performance & Benchmarking:** Quantified MAE, RMSE, and MAPE scores benchmarked against a seasonal-naive baseline model.
- **Grid Anomaly Detection:** Automated detection of demand spikes and drops with severity grading and diagnostic inspection modals.
- **Model & System Telemetry:** In-depth hyperparameter inspection and runtime health monitoring.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Language:** JavaScript (ESNext)
- **Styling:** Tailwind CSS v4 (Sleek dark theme with monochrome tones)
- **HTTP Client:** Axios (Centralized instance with interceptors)
- **Data Visualization:** Recharts
- **Iconography:** Lucide React
- **Routing:** React Router v7

### Backend & ML
- **API Framework:** Python 3.14 + FastAPI
- **Web Server:** Uvicorn
- **Validation:** Pydantic v2
- **Data Processing:** pandas, NumPy
- **Forecasting:** Prophet (v1.5.0 with cmdstanpy) + Deterministic Synthetic Fallback
- **Visualization Utilities:** Matplotlib
- **Testing:** pytest (19 unit and integration tests)

---

## 3. Project Structure

```
Energy-Demand-Forecasting-Tool/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry & CORS
│   │   ├── config.py                # Configuration & demo constants
│   │   ├── schemas.py               # Pydantic v2 request/response models
│   │   │
│   │   ├── routes/
│   │   │   ├── health.py            # GET /api/v1/health
│   │   │   ├── auth.py              # POST /api/v1/auth/login, logout
│   │   │   ├── historical.py        # GET /api/v1/historical
│   │   │   ├── forecast.py          # POST /api/v1/forecast
│   │   │   ├── model.py             # GET /api/v1/model
│   │   │   ├── anomalies.py         # GET /api/v1/anomalies
│   │   │   ├── metrics.py           # GET /api/v1/metrics
│   │   │   └── comparison.py        # GET /api/v1/comparison
│   │   │
│   │   ├── services/
│   │   │   ├── data_service.py      # Date filtering & summary statistics
│   │   │   ├── predictor.py         # Prophet fitting & fallback engine
│   │   │   ├── evaluation_service.py # 70/30 split & MAE/RMSE calculation
│   │   │   ├── anomaly_service.py   # Statistical residual thresholding
│   │   │   └── model_loader.py      # Architecture & dataset telemetry
│   │   │
│   │   ├── data/
│   │   │   └── synthetic_data.py    # 365-day deterministic generator
│   │   │
│   │   └── middleware/
│   │       └── error_handler.py     # Global structured JSON exception filters
│   │
│   ├── tests/
│   │   └── test_backend.py          # 19 comprehensive test cases
│   ├── pytest.ini                   # Pytest configuration
│   └── requirements.txt             # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top header with date & demo pill
│   │   │   ├── Sidebar.jsx          # Persistent navigation & profile
│   │   │   ├── MetricCard.jsx       # Monochrome statistic cards
│   │   │   ├── StateFeedback.jsx    # Loading, Error, Empty states
│   │   │   ├── DemoDisclaimerBanner.jsx # Top notification banner
│   │   │   └── ProtectedRoute.jsx   # Auth guard for dashboard routes
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Session state & localStorage persistence
│   │   │
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx  # Main container layout
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login screen with demo autofill
│   │   │   ├── DashboardPage.jsx    # Executive overview dashboard
│   │   │   ├── HistoricalPage.jsx   # Historical load explorer & CSV export
│   │   │   ├── ForecastPage.jsx     # Interactive forecast generator
│   │   │   ├── ComparisonPage.jsx   # Forecast vs actual residual analysis
│   │   │   ├── PerformancePage.jsx  # 70/30 split & baseline benchmarking
│   │   │   ├── AnomaliesPage.jsx    # Anomaly registry & diagnostic modal
│   │   │   ├── ModelInfoPage.jsx    # Decomposed parameters & system health
│   │   │   └── AboutPage.jsx        # Architecture, objectives, and roadmap
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Centralized Axios client
│   │   │
│   │   ├── App.jsx                  # React Router configuration
│   │   ├── index.css                # Dark monochrome Tailwind styling
│   │   └── main.jsx                 # React root mount
│   │
│   ├── index.html                   # HTML entry with dark mode meta
│   ├── vite.config.js               # Vite config + proxy + Tailwind v4
│   └── package.json                 # Node.js dependencies
│
├── docs/
│   └── ARCHITECTURE.md              # Detailed architecture documentation
├── PRD.md                           # Original Product Requirements Document
└── README.md                        # Project documentation & run guide
```

---

## 4. Demonstration Credentials

For academic presentation and grading:

| Role | Email | Password |
|---|---|---|
| **Demo Lead Analyst** | `demo@example.com` | `demo123` |

> *Tip:* A one-click **"Auto-fill Demo Credentials"** button is provided directly on the Login screen for viva presentations.

---

## 5. Prerequisites

- **Python:** 3.10 to 3.14
- **Node.js:** v18+ (tested on Node v25)
- **npm:** v9+

---

## 6. How to Run Locally

### Step 1: Clone Repository & Enter Directory
```bash
git clone https://github.com/divya101106/Energy-Demand-Forecasting-Tool.git
cd Energy-Demand-Forecasting-Tool
```

### Step 2: Backend Setup
Create a virtual environment and install backend requirements:
```bash
python3 -m venv venv
./venv/bin/pip install -r backend/requirements.txt
```

Start the FastAPI backend server:
```bash
PYTHONPATH=backend ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API will be active at:* `http://127.0.0.1:8000`  
*Swagger API Documentation:* `http://127.0.0.1:8000/docs`

### Step 3: Frontend Setup
Open a separate terminal window and enter the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
*Frontend Application will be active at:* `http://localhost:5173`

---

## 7. Running Backend Tests

The project includes an extensive test suite verifying data reproducibility, temporal integrity, metric calculations, anomaly detection, forecasting, and API endpoints.

To run the pytest suite:
```bash
PYTHONPATH=backend ./venv/bin/pytest backend/tests/test_backend.py -v
```

**Results:**
```
19 passed, 1 warning in 0.66s (100% pass rate)
```

---

## 8. API Endpoints (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Backend and forecasting service health check |
| `POST` | `/api/v1/auth/login` | Validates demo credentials and returns session token |
| `POST` | `/api/v1/auth/logout` | Terminates demonstration session |
| `GET` | `/api/v1/historical` | Returns observations with `start_date` and `end_date` filters |
| `POST` | `/api/v1/forecast` | Generates demand forecast with 95% uncertainty intervals |
| `GET` | `/api/v1/comparison` | Evaluates holdout test partition with residual error vectors |
| `GET` | `/api/v1/metrics` | Computes MAE, RMSE, MAPE and benchmarks vs seasonal-naive |
| `GET` | `/api/v1/anomalies` | Returns demand spikes and drops with severity filters |
| `GET` | `/api/v1/model` | Returns architecture parameters, dataset dictionary, and status |

---

## 9. Synthetic Data & Forecasting Architecture

### Synthetic Data Generator
- Generates 365 daily observations (Jan 01, 2025 – Dec 31, 2025).
- Deterministic random seed (`seed=42`) ensures 100% reproducibility.
- Synthesizes trend ($+1.5\%$/yr), weekly cycles (weekend drops), bi-modal annual seasonality (winter heating and summer cooling peaks), and deliberate anomaly events.
- Unit: **MW (DEMO UNIT)**.

### Forecasting Dual-Mode Engine
- **Prophet Mode (Active):** Uses Facebook Prophet Generalized Additive Models (GAM) fitted on historical data to generate point forecasts and $95\%$ confidence bounds.
- **Synthetic Fallback Mode:** Provides a clean deterministic trigonometric fallback with clear visual warnings if Prophet is not installed.
- **Active Mode Indicator:** Displayed prominently in the top header and forecast panels.

---

## 10. Known Limitations & Roadmap

- **Demonstration Scope:** All demand observations, forecasts, and anomaly alerts are generated from synthetic data and are not validated against live power grid telemetry.
- **No Database:** Operates in-memory for ease of local evaluation and zero cloud configuration.
- **Future Roadmap:** Future releases will support direct ingestion of Open Power System Data (OPSD) hourly CSV feeds, temperature weather regressors, and multi-region grid topologies.
