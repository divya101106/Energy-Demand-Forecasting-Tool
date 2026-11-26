# 10. Operational User Guide & Walkthrough

This guide provides an end-to-end operational walkthrough for power grid operators, energy analysts, and evaluators using the **Energy Demand Forecasting Tool**.

---

## 1. Accessing & Authenticating into the Platform

```
Step 1: Open Browser at http://localhost:5173/login
Step 2: Review the Login Page
Step 3: Click "Auto-fill Demo Credentials" (or enter demo@example.com / demo123)
Step 4: Click "Sign in to Console" -> Auto-redirects to /dashboard
```

- When the application opens at `http://localhost:5173`, the user arrives at the **Login Portal**.
- The portal displays the badge `OPSD DATA — GERMANY GRID (2015–2020)`.
- Clicking **Auto-fill Demo Credentials** automatically populates `demo@example.com` and `demo123`.
- Clicking **Sign In** authenticates via `POST /api/v1/auth/login`, stores the session token in the browser's `localStorage`, and transitions directly to the main **Executive Dashboard**.

---

## 2. Navigating the Executive Dashboard

Upon login, the user lands on `/dashboard`. Here is how to interpret the dashboard:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Latest Actual: 57,772 MW] [Next-Day Fc: 54,749 MW] [MAE: 2,624.1 MW] │
│ [RMSE: 3,399.0 MW (+6.5%)] [Anomalies: 96 Events (61 High Severity)]   │
├───────────────────────────────────────┬────────────────────────────────┤
│ Historical Electricity Demand Chart   │ Model Operating Status Card    │
│ (Quick filters: 7D, 30D, 90D, 1Y)     │ (Prophet GAM, 70/30 Holdout)   │
├───────────────────────────────────────┼────────────────────────────────┤
│ Actual vs Forecast Preview (14d)      │ Recent Anomaly Alerts Card     │
│ (Boundary: 2020-09-30 -> 2020-10-01)  │ (Top 4 recent events)          │
└───────────────────────────────────────┴────────────────────────────────┘
```

1. **Check Top KPIs:**
   - Verify the most recent actual grid load ($57,772\text{ MW}$ on `2020-09-30`).
   - Note the predicted load for the immediate next period ($54,749\text{ MW}$, $-5.23\%$).
   - Review holdout model precision ($\text{MAE} = 2,624.1\text{ MW}$, $\text{MAPE} = 5.06\%$).
2. **Interact with Historical Load Filters:**
   - Click `7D` to inspect the immediate preceding 7-day pattern (5 weekdays, 2 weekend days).
   - Click `30D` for a monthly view.
   - Click `1Y` to see full seasonal annual wave dynamics.
3. **Inspect the Forecast Preview:**
   - Notice the transition: solid white line (actual historical load) meets the dashed silver line (Prophet projection) exactly at `2020-09-30`.

---

## 3. Deep-Dive into Historical Observations (`/historical`)

1. Click **Historical Demand** in the left sidebar navigation.
2. **Review Summary Statistics:** Note that Germany's mean load over the 2,100 days was $55,492.47\text{ MW}$, reaching a peak of $68,183.58\text{ MW}$ in deep winter (`2019-01-23`) and dropping to a trough of $38,952.67\text{ MW}$ in late summer (`2016-09-18`).
3. **Use Quick Presets:**
   - Click `90D` to isolate the final quarter of historical data. The chart and table automatically bound to `2020-07-02` through `2020-09-30`.
4. **Search and Filter Specific Dates:**
   - Type `2018-02-28` into the table search box to observe the historic Siberian cold snap ("Beast from the East") where demand surged to $67,000+\text{ MW}$.
5. **Export Filtered Data:**
   - Click **Export CSV** in the top right to download the active observation slice as `opsd_germany_demand_2015-01-01_to_2020-09-30.csv`.

---

## 4. Generating Short-Term Forecasts (`/forecast`)

1. Click **Generate Forecast** in the sidebar.
2. **Select Forecast Frequency:**
   - Select **Daily** for standard day-by-day load planning.
   - Select **Weekly** if you need weekly energy dispatch in Megawatt-hours (MWh).
3. **Choose Horizon:**
   - Click `14d` (2 weeks) or `30d` (1 month).
4. **Configure Changepoint Flexibility & Components:**
   - Choose `Balanced` (prior scale 0.05).
   - Ensure `Weekly Seasonality`, `Yearly Seasonality`, and `Holiday Curtailment` are all checked.
5. **Execute Forecast:**
   - Click **Generate Forecast**.
   - Within milliseconds, the backend executes inference against the cached Prophet model.
6. **Interpret the Projected Curve:**
   - Look at the central prediction line. Notice how upcoming weekends are automatically suppressed.
   - Look at the 95% uncertainty interval envelope. Notice how the bounds expand slightly further into the future, reflecting increased variance.
7. **Export Projections:**
   - Click **Export Forecast CSV** to save `energy_forecast_daily_14d.csv` for downstream market analysis.

---

## 5. Validating Model Accuracy (`/comparison` & `/performance`)

1. Navigate to **Forecast vs Actual** (`/comparison`).
   - Review the holdout test period spanning 630 days from `2019-01-10` to `2020-09-30`.
   - Scroll down to the **Daily Forecast Residual Errors** chart. Notice how the residuals are symmetrically clustered around zero throughout 2019, but show a downward dip during April–May 2020 (when nationwide COVID-19 lockdowns shut down manufacturing plants).
   - Inspect the **Residual Error Distribution** histogram to verify that errors follow a classical normal curve.
2. Navigate to **Model Performance** (`/performance`).
   - Review the **Chronological Train/Test Split** diagram confirming that the first 1,470 days (70%) were used for training and the remaining 630 days (30%) were kept isolated for testing.
   - Compare Prophet vs. the Seasonal-Naive baseline: note that while the naive model has lower linear MAE during stable weeks, Prophet achieves a **$+6.51\%$ improvement on RMSE** by preventing catastrophic holiday and weather blunders.

---

## 6. Investigating Grid Anomalies (`/anomalies`)

1. Navigate to **Anomaly Alerts** in the sidebar.
2. **Review High-Level Event Metrics:**
   - Total Anomalies: 96 events.
   - Spikes: 19 events.
   - Drops: 77 events.
3. **Filter by Severity:**
   - Click **High** in the severity filter to isolate the 61 critical events where residual deviation exceeded $6,879.43\text{ MW}$ ($> 4.5\sigma$).
4. **Drill Down into an Event:**
   - Locate the card for `2015-01-01` (New Year's Day).
   - Actual demand was $45,346.54\text{ MW}$, while expected regular weekday load was $54,434.83\text{ MW}$, yielding a negative deviation of $-9,088.29\text{ MW}$ ($-16.70\%$).
   - Click **Investigate Anomaly** to open the modal dialogue. Review the detection method (`Robust Median Absolute Deviation, k=3.0`) and threshold applied ($4,586.28\text{ MW}$).
   - Click **Acknowledge Event** to dismiss the dialog.

---

## 7. Reviewing System & Model Architecture (`/model-info` & `/about`)

1. Visit **Model Information** (`/model-info`) to audit the Prophet model hyperparameters, Fourier terms, German holiday configuration, and server uptime.
2. Visit **About Project** (`/about`) to review the complete technology stack, data governance principles, and rubric deliverable accomplishments.
