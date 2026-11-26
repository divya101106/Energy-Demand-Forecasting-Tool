# Energy Demand Forecasting Tool — Complete Feature & Technical Documentation Suite

Welcome to the comprehensive, code-verified documentation suite for the **Energy Demand Forecasting Tool**. 

This documentation covers every feature, component, API endpoint, mathematical formula, dataset variable, and operational workflow implemented across the platform.

---

## Documentation Navigation Index

```
docs/application-documentation/
├── INDEX.md                                # Master documentation portal (this file)
├── 01_PROJECT_OVERVIEW.md                  # Executive summary, mission & directory hierarchy
├── 02_PAGE_BY_PAGE_FEATURE_GUIDE.md        # Detailed breakdown of all 9 frontend pages & controls
├── 03_DASHBOARD_AND_CHARTS_EXPLAINED.md    # Component-by-component explanation of cards & charts
├── 04_DATASET_AND_DATA_DICTIONARY.md       # OPSD Germany dataset specs & comprehensive field dictionary
├── 05_FORECASTING_AND_MODEL_EXPLANATION.md # Prophet GAM architecture, uncertainty & weekly aggregation
├── 06_MODEL_EVALUATION_AND_METRICS.md      # 70/30 chronological split, MAE/RMSE & baseline scorecard
├── 07_ANOMALY_DETECTION_EXPLAINED.md       # Robust MAD residual formulation & severity classification
├── 08_SYSTEM_ARCHITECTURE_HLD_LLD.md       # High-Level & Low-Level Design diagrams & workflows
├── 09_API_REFERENCE.md                     # Complete REST API reference for all /api/v1 endpoints
├── 10_USER_GUIDE.md                        # Step-by-step operator walkthrough with practical examples
├── 11_MENTOR_VIVA_PREPARATION.md           # 28 technical viva & defense questions with verified answers
└── 12_IMPLEMENTATION_GAPS_AND_LIMITATIONS.md # Code audit of boundaries, limitations & future scope
```

---

## Quick Reference Summary

| Document | Primary Audience | Key Contents Covered |
| :--- | :--- | :--- |
| [**01. Project Overview**](01_PROJECT_OVERVIEW.md) | All Evaluators | Mission statement, real-world industry problem, architecture summary, and accomplishments. |
| [**02. Page-by-Page Feature Guide**](02_PAGE_BY_PAGE_FEATURE_GUIDE.md) | Analysts & Mentors | In-depth breakdown of all 9 UI pages: cards, forms, tables, filters, and supplying APIs. |
| [**03. Dashboard & Charts Explained**](03_DASHBOARD_AND_CHARTS_EXPLAINED.md) | Schedulers & Dispatchers | Mathematical explanation of every KPI card, chart axis, confidence bound, and tooltip. |
| [**04. Dataset & Data Dictionary**](04_DATASET_AND_DATA_DICTIONARY.md) | Data Engineers | OPSD Germany dataset provenance, 2,100 daily records, pipeline flow, and field dictionary. |
| [**05. Forecasting Engine**](05_FORECASTING_AND_MODEL_EXPLANATION.md) | ML Engineers | Facebook Prophet additive decomposition, Fourier terms, German holidays, and weekly energy. |
| [**06. Model Evaluation & Benchmarking**](06_MODEL_EVALUATION_AND_METRICS.md) | Evaluators & QA | Chronological 70/30 split, Seasonal-Naive baseline comparison (+6.51% RMSE improvement). |
| [**07. Anomaly Detection Engine**](07_ANOMALY_DETECTION_EXPLAINED.md) | Grid Reliability Officers | Median Absolute Deviation (MAD), threshold formulation ($\tau = 4,586.28\text{ MW}$), 96 events. |
| [**08. System Architecture (HLD & LLD)**](08_SYSTEM_ARCHITECTURE_HLD_LLD.md) | Systems Architects | Mermaid HLD/LLD diagrams, frontend-to-backend request flows, and data lifecycle pipelines. |
| [**09. RESTful API Reference**](09_API_REFERENCE.md) | Backend Developers | Exhaustive API reference: endpoints, parameters, request/response JSON, and HTTP status codes. |
| [**10. Operational User Guide**](10_USER_GUIDE.md) | End Users & Reviewers | Step-by-step user journey from login to forecasting, residual analysis, and anomaly review. |
| [**11. Mentor & Viva Preparation**](11_MENTOR_VIVA_PREPARATION.md) | Viva Candidates | 28 likely technical viva/mentor evaluation questions with clear, code-grounded answers. |
| [**12. Gaps & Operating Boundaries**](12_IMPLEMENTATION_GAPS_AND_LIMITATIONS.md) | Technical Auditors | Honest disclosure of historical 2020 cutoff, mock credentials, and future expansion scope. |

---

## Key Verified System Parameters

```
┌──────────────────────────────────────┬────────────────────────────────────────────┐
│ Parameter Name                       │ Verified Value                             │
├──────────────────────────────────────┼────────────────────────────────────────────┤
│ Historical Dataset Origin            │ Open Power System Data (OPSD) — Germany    │
│ Target Electrical Variable           │ DE_load_actual_entsoe_transparency (MW)    │
│ Total Historical Days                │ 2,100 Days (2015-01-01 to 2020-09-30)      │
│ Historical Mean Grid Load            │ 55,492.47 MW                               │
│ Historical Peak Load                 │ 68,183.58 MW (Recorded on 2019-01-23)      │
│ Historical Minimum Load              │ 38,952.67 MW (Recorded on 2016-09-18)      │
│ Holdout Split Structure              │ 70% Train (1,470 Days) / 30% Test (630 Days│
│ Seasonal-Naive Baseline Accuracy     │ MAE: 2,065.40 MW | RMSE: 3,635.66 MW       │
│ Facebook Prophet Accuracy            │ MAE: 2,624.10 MW | RMSE: 3,399.04 MW       │
│ Prophet Relative RMSE Gain           │ +6.51% Improvement (-236.62 MW RMSE)      │
│ Anomaly Detection Threshold (τ)      │ 4,586.28 MW (k = 3.0 × σ_MAD)              │
│ Total Detected Anomalies             │ 96 Events (19 Spikes, 77 Drops, 4.57% Rate)│
│ Automated Backend Test Suite         │ 59 Tests across 4 files (100% Passing)     │
└──────────────────────────────────────┴────────────────────────────────────────────┘
```
