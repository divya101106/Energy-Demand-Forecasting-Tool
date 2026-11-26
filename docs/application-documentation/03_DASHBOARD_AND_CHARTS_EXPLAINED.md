# 03. Dashboard Components & Charts Explained

This document provides a component-by-component, mathematical, and operational breakdown of every metric card and chart in the **Energy Demand Forecasting Tool**.

---

## Part 1: Dashboard Metric Cards & KPIs

### 1. Latest Actual Demand Card
- **Exact Displayed Name:** `Latest Actual Demand`
- **Current Displayed Value:** `57,772 MW` (with change indicator `-3.51%`)
- **Unit of Measurement:** Megawatts (MW)
- **Time Period:** Single daily observation on `2020-09-30`
- **Data Source & API:** `GET /api/v1/historical` $\rightarrow$ `observations[-1]`
- **How It Is Calculated:**
  The backend retrieves chronological observations from `backend/data/opsd_daily.csv`. The card extracts the final row in the array:
  $$\text{Value} = \text{observations}[N-1].\text{demand} = 57,772.79\text{ MW}$$
  The percentage change is calculated against the previous day ($2020\text{-}09\text{-}29$, $59,876.10\text{ MW}$):
  $$\Delta\% = \frac{57,772.79 - 59,876.10}{59,876.10} \times 100 = -3.51\%$$
- **Operational Significance:** Gives dispatchers the most recent confirmed electrical load baseline across Germany's four transmission zones before reviewing forward projections.

---

### 2. Next-Day / Next-Period Forecast Card
- **Exact Displayed Name:** `Next-Day Forecast` (or `Next-Period Forecast` in weekly mode)
- **Current Displayed Value:** `54,749 MW` (with change indicator `-5.23%`)
- **Unit of Measurement:** Megawatts (MW)
- **Time Period:** Immediate next forecast step (`2020-10-01` in daily mode; `2020-10-01 to 2020-10-07` in weekly mode)
- **Data Source & API:** `POST /api/v1/forecast` $\rightarrow$ `summary.next_period_predicted`
- **How It Is Calculated:**
  The Prophet model predicts the expected load $\hat{y}_{N+1}$ on the first day following the historical dataset cutoff:
  $$\hat{y}_{2020-10-01} = 54,749.03\text{ MW}$$
  The percentage shift relative to the latest historical actual load is:
  $$\text{Shift}\% = \frac{\hat{y}_{2020-10-01} - y_{2020-09-30}}{y_{2020-09-30}} \times 100 = \frac{54,749.03 - 57,772.79}{57,772.79} \times 100 = -5.23\%$$
- **Operational Significance:** Schedulers use this figure to set day-ahead thermal and hydro dispatch quotas, anticipating whether demand will rise or decline.

---

### 3. Mean Absolute Error (MAE) Card
- **Exact Displayed Name:** `Mean Absolute Error (MAE)`
- **Current Displayed Value:** `2,624.1 MW` (Subtitle: `MAPE: 5.06%`, Badge: `30% Test Split`)
- **Unit of Measurement:** Megawatts (MW)
- **Time Period:** 630-day chronological holdout test period (`2019-01-10` to `2020-09-30`)
- **Data Source & API:** `GET /api/v1/metrics` $\rightarrow$ `metrics.mae`
- **How It Is Calculated:**
  Evaluated strictly across the untouched test partition ($N_{\text{test}} = 630$ days):
  $$\text{MAE} = \frac{1}{630} \sum_{t=1}^{630} |y_t - \hat{y}_t| = 2,624.10\text{ MW}$$
  The Mean Absolute Percentage Error (MAPE) is:
  $$\text{MAPE} = \frac{1}{630} \sum_{t=1}^{630} \left|\frac{y_t - \hat{y}_t}{y_t}\right| \times 100 = 5.06\%$$
- **Operational Significance:** MAE reflects the expected magnitude of daily forecasting error. An average error of $2,624\text{ MW}$ against a $55,492\text{ MW}$ grid mean ($\sim 5\%$) indicates high predictive stability.

---

### 4. Root Mean Squared Error (RMSE) Card
- **Exact Displayed Name:** `Root Mean Sq Error (RMSE)`
- **Current Displayed Value:** `3,399.0 MW` (Subtitle: `+6.51% vs Naive`, Badge: `Baseline Benchmark`)
- **Unit of Measurement:** Megawatts (MW)
- **Time Period:** 630-day chronological holdout test period (`2019-01-10` to `2020-09-30`)
- **Data Source & API:** `GET /api/v1/metrics` $\rightarrow$ `metrics.rmse` & `baseline_metrics.improvement_vs_naive_rmse_pct`
- **How It Is Calculated:**
  $$\text{RMSE} = \sqrt{\frac{1}{630} \sum_{t=1}^{630} (y_t - \hat{y}_t)^2} = 3,399.04\text{ MW}$$
  The Seasonal-Naive baseline (7-day lag: $\hat{y}_t^{\text{naive}} = y_{t-7}$) achieves $\text{RMSE}_{\text{naive}} = 3,635.66\text{ MW}$.
  The improvement is:
  $$\text{Improvement}\% = \frac{3,635.66 - 3,399.04}{3,635.66} \times 100 = +6.51\%$$
- **Operational Significance:** Because RMSE squares individual errors before averaging, it heavily penalizes large outlier errors. Beating the naive baseline on RMSE proves Prophet protects the grid against catastrophic forecasting misses.

---

### 5. Detected Anomalies Card
- **Exact Displayed Name:** `Detected Anomalies`
- **Current Displayed Value:** `96 Events` (Subtitle: `19 Spikes • 77 Drops`, Badge: `61 High`)
- **Unit of Measurement:** Count of discrete calendar days
- **Time Period:** Entire 2,100-day OPSD historical dataset (`2015-01-01` to `2020-09-30`)
- **Data Source & API:** `GET /api/v1/anomalies` $\rightarrow$ `summary.total_anomalies`
- **How It Is Calculated:**
  An observation is flagged if its residual magnitude exceeds the training Median Absolute Deviation threshold:
  $$|y_t - \hat{y}_t| > \tau = 4,586.28\text{ MW}$$
  - **Spikes (19):** Residual $y_t - \hat{y}_t > +4,586.28\text{ MW}$ (unusually high consumption).
  - **Drops (77):** Residual $y_t - \hat{y}_t < -4,586.28\text{ MW}$ (unusually depressed consumption).
  - **High Severity (61):** Residual $> 1.5 \times \tau = 6,879.43\text{ MW}$.
- **Operational Significance:** Alerts grid managers to historical instances where weather anomalies, industrial shutdowns, or unexpected events distorted demand.

---

## Part 2: Charts and Visualizations Explained

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Dashboard Charts Overview                       │
├────────────────────────────┬─────────────────────────────┬─────────────┤
│ Chart Name                 │ Library & Chart Type        │ Page        │
├────────────────────────────┼─────────────────────────────┼─────────────┤
│ Historical Demand Trend    │ Recharts LineChart          │ Dashboard   │
│ Actual vs Forecast Preview │ Recharts LineChart          │ Dashboard   │
│ Full Historical Explorer   │ Recharts LineChart          │ Historical  │
│ Forecast Projection Envelope│ Recharts ComposedChart     │ Forecast    │
│ Actual vs Forecast (Holdout│ Recharts LineChart          │ Comparison  │
│ Daily Forecast Residuals   │ Recharts BarChart           │ Comparison  │
│ Error Distribution Bins    │ Recharts BarChart           │ Comparison  │
│ Model Error Comparison     │ Recharts BarChart           │ Performance │
└────────────────────────────┴─────────────────────────────┴─────────────┘
```

---

### 1. Dashboard: Historical Electricity Demand Chart
- **Chart Title:** Historical Electricity Demand
- **Chart Type:** Responsive SVG Line Chart (`<LineChart>`)
- **X-Axis:** Date (`MM-DD` formatted, monospace)
- **Y-Axis:** Electrical load in thousands of Megawatts (`k MW`, range dynamically scaled: `dataMin - 1500` to `dataMax + 1500`)
- **Units:** Megawatts (MW)
- **Data Source:** `GET /api/v1/historical` sliced by quick filter states (`7d`, `30d`, `90d`, `1y`)
- **Visual Elements:**
  - Solid white line (`#f4f4f5`): Historical daily average demand.
  - Active hover dot: Highlights the exact coordinate on cursor hover with a monospace tooltip.
- **Patterns to Look For:**
  - Clear 7-day cyclical oscillations (5 high weekday peaks followed by a 2-day weekend trough).
  - Seasonal amplitude differences (higher demand in January/February, lower demand in June/July).
- **Conclusions Allowed:** Confirms weekly and seasonal regularities; reveals baseline volatility.
- **Conclusions NOT Allowed:** Cannot reveal intra-hour transmission bottlenecks or substation-level constraints.

---

### 2. Dashboard: Actual vs Forecast Preview Chart (14-Day Horizon)
- **Chart Title:** Actual vs Forecast Preview (14-Day Horizon)
- **Chart Type:** Dual-series Line Chart (`<LineChart>`)
- **X-Axis:** Calendar Date (`YYYY-MM-DD`)
- **Y-Axis:** Load in Megawatts (MW)
- **Data Source:** Concatenation of the last 14 historical observations ($2020\text{-}09\text{-}17$ to $2020\text{-}09\text{-}30$) with the first 14 Prophet forecast steps ($2020\text{-}10\text{-}01$ to $2020\text{-}10\text{-}14$)
- **Visual Elements:**
  - **Solid White Line:** Actual observed load ending at the dataset boundary (`2020-09-30`).
  - **Dashed Silver Line:** Prophet forecast projections continuing into the future starting on `2020-10-01`.
- **Patterns to Look For:**
  - Smooth continuity at the boundary line (`2020-09-30` $\rightarrow$ `2020-10-01`).
  - Maintenance of the 7-day cycle in the projected curve.
- **Conclusions Allowed:** Demonstrates that the forward model naturally captures upcoming weekday peaks and weekend troughs.
- **Conclusions NOT Allowed:** Must not be interpreted as predictions of current year 2026 demand; it is a historical forward extrapolation from late 2020.

---

### 3. Forecast Page: Projected Demand Curve with 95% Confidence Bounds
- **Chart Title:** Projected Demand Curve with 95% Confidence Bounds
- **Chart Type:** Recharts `<ComposedChart>`
- **X-Axis:** Forecast Date or Date Interval (`YYYY-MM-DD` or `YYYY-MM-DD to YYYY-MM-DD`)
- **Y-Axis:** Electrical Load in Megawatts (MW)
- **Data Source:** `POST /api/v1/forecast` $\rightarrow$ `data[]`
- **Visual Elements:**
  - **Central Projection Line (`predicted_demand` / `yhat`):** Expected daily/weekly demand.
  - **Upper Uncertainty Line (`upper_bound` / `yhat_upper`):** 95% statistical upper bound.
  - **Lower Uncertainty Line (`lower_bound` / `yhat_lower`):** 95% statistical lower bound.
- **Interpretation:**
  - If changepoint flexibility is set to `Conservative`, the boundary lines hug closely to the center.
  - If set to `Flexible`, the boundary widens over longer horizons (30d, 60d), illustrating increasing uncertainty over time.

---

### 4. Comparison Page: Actual Demand vs Model Forecast (Holdout Period)
- **Chart Title:** Actual Demand vs Model Forecast (Holdout Period)
- **Chart Type:** Dual-series Overlay Line Chart
- **X-Axis:** Test Dates (`2019-01-10` to `2020-09-30`, 630 observations)
- **Y-Axis:** Load in Megawatts (MW)
- **Data Source:** `GET /api/v1/comparison` $\rightarrow$ `observations[]`
- **Visual Elements:**
  - **Solid White Line:** Ground-truth actual load $y_t$.
  - **Dashed Silver Line:** Held-out Prophet prediction $\hat{y}_t$.
- **Patterns to Look For:**
  - Strong alignment throughout 2019 across both winter peaks and summer lulls.
  - Visible divergence in March–May 2020 where actual load drops significantly below the predicted baseline due to the COVID-19 pandemic.
- **Conclusions Allowed:** Proves the model generalizes well during normal societal conditions and accurately exposes macroeconomic anomalies.

---

### 5. Comparison Page: Daily Forecast Residual Errors
- **Chart Title:** Daily Forecast Residual Errors
- **Chart Type:** Centered Bar Chart (`<BarChart>`)
- **X-Axis:** Test Dates
- **Y-Axis:** Residual Error in Megawatts ($e_t = y_t - \hat{y}_t$)
- **Data Source:** `GET /api/v1/comparison` $\rightarrow$ `observations[].error`
- **Visual Elements:**
  - **Positive Bars ($e_t > 0$):** Model under-predicted (actual demand was higher than expected).
  - **Negative Bars ($e_t < 0$):** Model over-predicted (actual demand was lower than expected).
  - **Reference Line ($0\text{ MW}$):** Indicates perfect prediction.
- **Patterns to Look For:**
  - Symmetrical distribution around the zero line during 2019.
  - Pronounced cluster of negative residual bars in spring 2020 reflecting the pandemic lockdown lull.

---

### 6. Comparison Page: Residual Error Distribution Histogram
- **Chart Title:** Residual Error Distribution
- **Chart Type:** Binned Frequency Bar Chart (`<BarChart>`)
- **X-Axis:** Error Bins (`<-6000`, `-6000 to -4000`, `-4000 to -2000`, `-2000 to 0`, `0 to 2000`, `2000 to 4000`, `4000 to 6000`, `>6000`)
- **Y-Axis:** Number of held-out days falling within each bin
- **Data Source:** `GET /api/v1/comparison` $\rightarrow$ `error_distribution[]`
- **Patterns to Look For:**
  - Classic bell-shaped Gaussian distribution peaking in the `[-2000, 0]` and `[0, 2000]` bins.
  - Slight negative skew attributable to the 2020 lockdown shock.
- **Conclusions Allowed:** Confirms residuals are predominantly normally distributed, fulfilling the core assumptions of linear regression error theory.
