# 07. Statistical Anomaly Detection Engine

This document explains the statistical foundations, mathematical threshold formulation, severity grading, and forensic interpretation of the anomaly detection system in the **Energy Demand Forecasting Tool**.

---

## 1. What Constitutes an Electrical Demand Anomaly?

In an interconnected power system, raw demand fluctuates continuously due to weather and consumer habits. A raw value of $65,000\text{ MW}$ is completely normal on a freezing Wednesday in January, but would represent a catastrophic surge if observed on a mild Sunday in July.

Therefore, an anomaly cannot be detected by simply looking at raw demand magnitude. Instead, an anomaly is defined by **residual divergence from expected demand**:

$$\text{Residual}(t) = y(t) - \hat{y}(t)$$

Where:
- $y(t)$: Actual observed electrical load in Megawatts from the OPSD dataset.
- $\hat{y}(t)$: Expected baseline electrical load produced by the Generalized Additive Model accounting for the day of the week, time of year, and public holidays.

An **electrical demand anomaly** occurs when the residual magnitude exceeds a statistically justified tolerance boundary:

$$|y(t) - \hat{y}(t)| > \tau$$

---

## 2. Statistical Thresholding: Median Absolute Deviation (MAD)

### Why Standard Deviation ($\sigma$) is Flawed for Anomalies
Conventional anomaly detection uses the sample mean ($\mu$) and standard deviation ($\sigma$):

$$\mu = \frac{1}{N}\sum e_t, \quad \sigma = \sqrt{\frac{1}{N}\sum (e_t - \mu)^2}$$

However, standard deviation is **non-robust to outliers**. If extreme anomalies exist in the data (e.g. during a major blackout or pandemic lockdown), those very outliers inflate the calculated standard deviation, artificially pushing the threshold upward and masking smaller true anomalies (known in statistics as the *masking effect*).

### The Robust MAD Solution
To avoid outlier contamination and preserve mathematical objectivity, the engine employs the **Median Absolute Deviation (MAD)** calculated **strictly on the 1,470 training residuals** ($2015\text{-}01\text{-}01$ to $2019\text{-}01\text{-}09$) to prevent future data leakage:

```
Step 1: Compute Median Residual (M)
        M = Median({e_1, e_2, ..., e_1470}) = 255.03 MW

Step 2: Compute Median Absolute Deviation (MAD)
        MAD = Median({|e_1 - M|, |e_2 - M|, ..., |e_1470 - M|}) = 1,031.14 MW

Step 3: Calculate Normal-Consistent Standard Deviation (σ_MAD)
        σ_MAD = 1.4826 × MAD = 1.4826 × 1,031.14 MW = 1,528.76 MW

Step 4: Establish the Empirical 3-Sigma Anomaly Threshold (τ)
        τ = k × σ_MAD = 3.0 × 1,528.76 MW = 4,586.28 MW
```

The scale factor $1.4826$ ensures that $\hat{\sigma}_{\text{MAD}}$ asymptotically equals the standard deviation $\sigma$ if the residuals are normally distributed:

$$\frac{1}{\Phi^{-1}(0.75)} \approx 1.4826$$

---

## 3. Anomaly Classification & Severity Grading

When $|e_t| > 4,586.28\text{ MW}$, the observation is flagged and classified into one of two categories:

### 1. High Demand Anomaly (Spike)
- **Condition:** $e_t > +4,586.28\text{ MW}$ (Actual load was significantly higher than model expectations).
- **Potential Real-World Causes:** Severe unseasonal cold snaps (spurring electric heating), extreme summer heatwaves (heavy air conditioning load), or unexpected industrial manufacturing surges.
- **Dataset Occurrence:** **19 Spikes** ($19.8\%$ of detected anomalies).

### 2. Low Demand Anomaly (Drop)
- **Condition:** $e_t < -4,586.28\text{ MW}$ (Actual load was significantly lower than model expectations).
- **Potential Real-World Causes:** Extended factory holidays, unmodeled bridge holidays (*Brückentage*), major transmission outages, or societal disruptions (e.g. COVID-19 pandemic lockdowns).
- **Dataset Occurrence:** **77 Drops** ($80.2\%$ of detected anomalies).

---

### Severity Tier Formulation

The system grades each detected anomaly into three objective severity tiers based on standard deviation multipliers:

```
         Normal Load Variation
  ├──────────────────────────────────┤  |e| ≤ 4,586.28 MW (95.43% of days)
  
         Low Severity (Advisory)
  ├───┤                                 4,586.28 MW < |e| ≤ 5,350.66 MW (21 Events)
  
         Medium Severity (Moderate)
  ├───────┤                             5,350.66 MW < |e| ≤ 6,879.43 MW (14 Events)
  
         High Severity (Critical)
  ├───────────────►                     |e| > 6,879.43 MW (61 Events)
```

1. **Low Severity (Advisory, 21 Events):**
   $$4,586.28\text{ MW} < |e_t| \le 5,350.66\text{ MW} \quad (3.0\sigma < |e_t| \le 3.5\sigma)$$
   Moderate deviation requiring routine dispatcher awareness.
2. **Medium Severity (Moderate, 14 Events):**
   $$5,350.66\text{ MW} < |e_t| \le 6,879.43\text{ MW} \quad (3.5\sigma < |e_t| \le 4.5\sigma)$$
   Substantial load departure; potential scheduling miscalculation or weather transition.
3. **High Severity (Critical, 61 Events):**
   $$|e_t| > 6,879.43\text{ MW} \quad (|e_t| > 4.5\sigma)$$
   Extreme structural divergence; warrants forensic investigation and reserves audit.

---

## 4. Summary of Detected Anomalies in the OPSD Dataset

Across the **2,100 consecutive days** in Germany's electrical record, the engine flagged **96 total anomalous days** ($4.57\%$ of observations), perfectly satisfying the standard operational target of $< 5\%$:

```
┌────────────────────────────────────────┬────────────────────────────────────────┐
│ Anomaly Registry Metric                │ Verified Count / Value                 │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ Total Historical Observations Evaluated│ 2,100 Days                             │
│ Total Flagged Anomaly Events           │ 96 Events (4.57% Anomaly Rate)         │
│ Positive Anomalies (Demand Spikes)     │ 19 Events (19.8% of anomalies)         │
│ Negative Anomalies (Demand Drops)      │ 77 Events (80.2% of anomalies)         │
│ High Severity (Critical) Count         │ 61 Events                              │
│ Medium Severity (Moderate) Count       │ 14 Events                              │
│ Low Severity (Advisory) Count          │ 21 Events                              │
│ Detection Threshold Applied (τ)        │ 4,586.28 MW                            │
│ Peak Positive Deviation (Max Spike)    │ +10,480.12 MW (Observed on 2018-02-28) │
│ Peak Negative Deviation (Max Drop)     │ -13,697.99 MW (Observed on 2020-04-13) │
│ Persisted Data Files                   │ backend/data/detected_anomalies.csv    │
│                                        │ backend/data/detected_anomalies.json   │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

---

## 5. Statistical Flag vs. Real-World Truth

> [!IMPORTANT]
> **Data Science Governance Principle:**
> - A statistical anomaly indicates that **actual electrical consumption departed significantly from the mathematical model's expected baseline**.
> - It does **NOT** definitively prove what caused the departure in the physical world.
> - Unless auxiliary telemetry (e.g. ambient temperature measurements, industrial production indices, or transmission trip logs) is ingested, the system strictly reports:
>   * Date of event
>   * Actual measured demand
>   * Expected baseline demand
>   * Residual deviation (MW & %)
>   * Threshold applied
>   * Severity tier
> - The application **never invents speculative real-world narratives** (e.g. claiming a drop was caused by a specific local festival or substation fuse trip without corroborating data).
