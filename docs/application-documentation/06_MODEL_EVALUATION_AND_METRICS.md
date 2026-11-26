# 06. Model Evaluation, Benchmarking & Metrics

This document explains the evaluation pipeline, the mathematical metrics (MAE, RMSE, MAPE), the 70/30 chronological holdout methodology, and the verified performance comparison between the **Seasonal-Naive baseline** and **Facebook Prophet**.

---

## 1. The 70/30 Chronological Train/Test Split

```
0                                 1,470                           2,100 Days
├───────────────────────────────────┼───────────────────────────────┤
│    Training Partition (70%)       │      Test Partition (30%)     │
│   2015-01-01 to 2019-01-09        │    2019-01-10 to 2020-09-30   │
│       (1,470 Observations)        │       (630 Observations)      │
└───────────────────────────────────┴───────────────────────────────┘
                                    ▲
                           Forecast Origin Cutoff
```

### Why Time-Series Data Must NEVER Be Randomly Shuffled
In standard cross-sectional machine learning (e.g. image classification or tabular credit scoring), data observations are assumed to be independent and identically distributed ($i.i.d.$), making $k$-fold cross-validation with random shuffling valid.

In electricity demand forecasting, observations exhibit strong **temporal autocorrelation**:

$$\text{Corr}(y_t, y_{t-1}) \gg 0$$

Randomly shuffling time-series data creates **Lookahead Bias (Data Leakage)**:
- The model trains on observations from Tuesday and Thursday, then predicts Wednesday.
- In reality, a power grid dispatcher on Tuesday cannot see Wednesday or Thursday.
- **Rule:** The test dataset must strictly contain observations that occur *after* the training dataset in chronological order.

---

## 2. Models Compared: Seasonal-Naive vs. Prophet

### Model 1: The Seasonal-Naive Baseline ($\hat{y}_t^{\text{naive}}$)
- **Mathematical Definition:** A seasonal lag forecaster using the same weekday from the previous week ($P = 7$ days):
  $$\hat{y}_t^{\text{naive}} = y_{t-7}$$
  *Example:* To predict demand for Monday, June 10, 2019, take the actual observed demand from Monday, June 3, 2019.
- **Purpose:** Establishes the minimum defensible benchmark that any machine learning or statistical model must beat to justify its computational complexity.
- **Strengths:** Zero training cost, highly responsive during stable uninterrupted work weeks.
- **Limitations:** Completely blind to annual seasonal shifts, weather transitions, public holidays, and macro trends.

### Model 2: Facebook Prophet ($\hat{y}_t^{\text{prophet}}$)
- **Mathematical Definition:** Decomposable Generalized Additive Model:
  $$\hat{y}_t = g(t) + s_w(t) + s_y(t) + h(t)$$
- **Purpose:** Produces continuous multi-step ahead projections while modeling trend shifts, dual Fourier seasonal harmonics, and holiday calendar disruptions.
- **Strengths:** Robust to missing observations, captures smooth non-linear annual trends, provides empirical 95% uncertainty bounds, incorporates German public holidays.
- **Limitations:** Slower training time, tends to smooth out high-frequency daily residual spikes.

---

## 3. Mathematical Evaluation Metrics

Both models are evaluated on the identical 630 held-out test days ($t = 1, \dots, 630$):

### 1. Mean Absolute Error (MAE)
$$\text{MAE} = \frac{1}{N} \sum_{t=1}^N |y_t - \hat{y}_t|$$
- **Interpretation:** The average absolute magnitude of forecasting error in Megawatts. It weights all deviations linearly.

### 2. Root Mean Squared Error (RMSE)
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{t=1}^N (y_t - \hat{y}_t)^2}$$
- **Interpretation:** Measures the standard deviation of residuals. Because errors are squared before averaging, large errors are penalized exponentially more than small errors.

### 3. Mean Absolute Percentage Error (MAPE)
$$\text{MAPE} = \frac{1}{N} \sum_{t=1}^N \left| \frac{y_t - \hat{y}_t}{y_t} \right| \times 100\%$$
- **Interpretation:** Relative percentage accuracy. Safe for electricity load because grid demand never approaches zero (minimum observed: $38,952.67\text{ MW}$).

---

## 4. Verified Holdout Evaluation Scorecard

The table below reflects the verified evaluation results stored in [`backend/models/metrics.json`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/models/metrics.json) and [`backend/data/evaluation_predictions.csv`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/data/evaluation_predictions.csv):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         Verified Holdout Performance Scorecard                   │
│                (Evaluated on 630 Test Days: 2019-01-10 to 2020-09-30)            │
├───────────────────────────────┬───────────────────┬──────────────────┬───────────┤
│ Evaluation Metric             │ Seasonal-Naive    │ Facebook Prophet │ Delta     │
├───────────────────────────────┼───────────────────┼──────────────────┼───────────┤
│ Mean Absolute Error (MAE)     │ 2,065.40 MW       │ 2,624.10 MW      │ +558.70 MW│
│ Root Mean Squared Error (RMSE)│ 3,635.66 MW       │ 3,399.04 MW      │ -236.62 MW│
│ Mean Absolute Pct Error (MAPE)│ 3.94%             │ 5.06%            │ +1.12%    │
│ Relative RMSE Improvement     │ Reference (0.00%) │ +6.51% Better    │ +6.51%    │
│ Largest Absolute Error (Max)  │ 18,787.77 MW      │ 13,697.99 MW     │ -5,089.78 │
│ Outlier Penalty Resilience    │ Poor (High Peaks) │ Superior         │ Verified  │
└───────────────────────────────┴───────────────────┴──────────────────┴───────────┘
```

---

## 5. Technical Analysis: Why Does Prophet Win on RMSE While Baseline Wins on MAE?

This counter-intuitive finding is a classic hallmark of real-world energy time-series and is a prime discussion point for technical interviews:

### 1. The Seasonal-Naive Behavior
- During stable, ordinary weeks (e.g. standard October workdays without holidays), electricity demand repeats itself almost identically from Monday to Monday.
- On those regular days, the Seasonal-Naive model makes very small errors ($< 1,000\text{ MW}$), driving its linear average error (MAE) down to $2,065.40\text{ MW}$.
- **However, when a holiday or weather shock hits:**
  - If Monday was Easter Monday ($45,000\text{ MW}$) and next Monday is a full industrial workday ($65,000\text{ MW}$), the naive model commits an enormous error of $20,000\text{ MW}$.
  - The naive model makes another $20,000\text{ MW}$ error the week after when predicting the holiday itself.
  - When squared ($20,000^2 = 400,000,000$), these extreme misses inflate its RMSE to **$3,635.66\text{ MW}$**.

### 2. The Prophet Behavior
- Prophet fits a smooth mathematical representation. It does not perfectly memorize last week's exact numbers, so its day-to-day linear MAE is slightly higher ($2,624.10\text{ MW}$).
- **Crucially, Prophet knows the German public holiday calendar:**
  - It knows when Easter, Christmas, and Whit Monday occur.
  - It adjusts load downward in advance using the $h(t)$ holiday vector.
  - As a result, Prophet avoids catastrophic $18,000+\text{ MW}$ forecasting blunders (Prophet's max error is $13,697.99\text{ MW}$ vs Naive's $18,787.77\text{ MW}$).
- Because RMSE heavily penalizes large errors, **Prophet outperforms the baseline by $+6.51\%$ on RMSE (a reduction of $236.62\text{ MW}$)**.

---

## 6. Pre-Generated Diagnostic Plots

The evaluation pipeline automatically generates 4 high-resolution diagnostic plots located at [`docs/plots/`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/docs/plots/) and [`backend/static/plots/`](file:///Users/dibbi/Desktop/OJT%20sem%205/Energy-Demand-Forecasting-Tool/backend/static/plots/):

1. **`actual_vs_baseline.png`:** Plots actual demand against the 7-day Seasonal-Naive baseline across the 630 test days.
2. **`actual_vs_prophet.png`:** Plots actual demand against Prophet predictions across the 630 test days.
3. **`model_error_comparison.png`:** Side-by-side grouped bar chart comparing MAE, RMSE, and MAPE between both models.
4. **`forecast_residuals.png`:** Dual-panel diagnostic chart showing the residual time-series trajectory (top) and the residual error distribution histogram (bottom).
