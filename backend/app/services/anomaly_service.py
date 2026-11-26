"""Real Electricity Demand Anomaly Detection Service.

Implements robust statistical anomaly detection on actual German grid electricity demand
using residuals between actual demand observations and model-expected baseline values.
Thresholds are derived strictly from training residuals using Median Absolute Deviation (MAD),
guaranteeing zero lookahead bias and preventing outlier distortion.
"""
import math
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

from app.config import settings
from app.data.opsd_loader import get_opsd_dataframe
from app.services.predictor import load_trained_prophet_model
from app.schemas import AnomalyItem, AnomalySummary

# In-memory cached anomalies
_CACHED_ANOMALIES_DATA: Optional[Dict[str, Any]] = None


def compute_statistical_threshold(train_residuals: np.ndarray, k: float = 3.0) -> Dict[str, float]:
    """Computes robust statistical thresholds using Median Absolute Deviation (MAD).
    
    Formula:
        MAD = median(|e_i - median(e)|)
        hat{sigma}_MAD = 1.4826 * MAD
        Threshold = k * hat{sigma}_MAD
        
    Strictly calibrated on training residuals to avoid lookahead bias.
    """
    if len(train_residuals) == 0:
        return {
            "median_residual": 0.0,
            "mad": 0.0,
            "mad_sigma": 0.0,
            "threshold": 0.0,
            "threshold_low": 0.0,
            "threshold_medium": 0.0,
            "threshold_high": 0.0
        }

    clean_res = train_residuals[~np.isnan(train_residuals)]
    median_res = float(np.median(clean_res))
    mad = float(np.median(np.abs(clean_res - median_res)))
    mad_sigma = 1.4826 * mad
    base_threshold = k * mad_sigma

    return {
        "median_residual": round(median_res, 2),
        "mad": round(mad, 2),
        "mad_sigma": round(mad_sigma, 2),
        "threshold": round(base_threshold, 2),
        "threshold_low": round(base_threshold, 2),
        "threshold_medium": round(3.5 * mad_sigma, 2),
        "threshold_high": round(4.5 * mad_sigma, 2)
    }


def compute_and_save_anomalies(force_recompute: bool = False) -> Dict[str, Any]:
    """Detects, classifies, and saves anomalies across the actual OPSD German demand dataset."""
    global _CACHED_ANOMALIES_DATA
    if _CACHED_ANOMALIES_DATA is not None and not force_recompute:
        return _CACHED_ANOMALIES_DATA

    csv_out_path = settings.ANOMALIES_CSV_PATH
    json_out_path = settings.ANOMALIES_JSON_PATH

    # 1. Load actual observations
    df = get_opsd_dataframe().copy()

    # 2. Compute expected demand using the pre-trained Prophet model
    m = load_trained_prophet_model()
    future = df[["ds"]].copy()
    fc = m.predict(future)

    actuals = df["y"].values
    expected = fc["yhat"].values

    # 3. Calculate residuals, absolute deviations, and percentage deviations safely
    residuals = actuals - expected
    abs_deviations = np.abs(residuals)
    
    # Safe percentage deviation (guard against zero or negative expected values)
    pct_deviations = np.zeros(len(actuals))
    for i in range(len(actuals)):
        exp_val = expected[i]
        if exp_val > 0 and not np.isnan(exp_val):
            pct_deviations[i] = (residuals[i] / exp_val) * 100.0
        else:
            pct_deviations[i] = 0.0

    # 4. Derive threshold STRICTLY from training partition (first 1,470 days)
    # This prevents any lookahead bias or future leakage
    train_split_idx = int(len(df) * settings.TRAIN_SPLIT_RATIO)
    train_res = residuals[:train_split_idx]
    thresh_stats = compute_statistical_threshold(train_res, k=3.0)
    thresh_val = thresh_stats["threshold"]
    thresh_med = thresh_stats["threshold_medium"]
    thresh_high = thresh_stats["threshold_high"]

    # 5. Classify anomalies
    all_anomaly_items: List[AnomalyItem] = []
    records_for_csv: List[Dict[str, Any]] = []

    for i in range(len(df)):
        abs_dev = abs_deviations[i]
        if abs_dev >= thresh_val:
            res_val = residuals[i]
            act_val = actuals[i]
            exp_val = expected[i]
            pct_val = pct_deviations[i]
            date_str = df.iloc[i]["ds"].strftime("%Y-%m-%d")

            # Classification: High demand anomaly (Spike) vs Low demand anomaly (Drop)
            if res_val > 0:
                anom_type = "Spike"
                type_label = "High Demand Anomaly"
                direction_label = "surge"
            else:
                anom_type = "Drop"
                type_label = "Low Demand Anomaly"
                direction_label = "curtailment"

            # Severity rule based on robust scale multiples
            if abs_dev >= thresh_high:
                severity = "High"
            elif abs_dev >= thresh_med:
                severity = "Medium"
            else:
                severity = "Low"

            alert_id = f"ALT-{date_str.replace('-', '')}-{i:04d}"

            # Strictly factual, data-driven description (no invented external causes)
            description = (
                f"{type_label}: actual demand of {act_val:,.1f} MW deviated from model baseline "
                f"of {exp_val:,.1f} MW by {res_val:+,.1f} MW ({pct_val:+.1f}%), "
                f"exceeding the {thresh_val:,.1f} MW threshold."
            )

            act_rounded = round(float(act_val), 2)
            exp_rounded = round(float(exp_val), 2)
            dev_rounded = round(act_rounded - exp_rounded, 2)

            item = AnomalyItem(
                id=alert_id,
                date=date_str,
                type=anom_type,
                actual_demand=act_rounded,
                expected_demand=exp_rounded,
                deviation_mw=dev_rounded,
                deviation_pct=round(float(pct_val), 2),
                severity=severity,
                status="Active",
                detection_method="Robust Median Absolute Deviation (MAD, k=3.0)",
                description=description,
                threshold_used=thresh_val
            )
            all_anomaly_items.append(item)

            records_for_csv.append({
                "alert_id": alert_id,
                "date": date_str,
                "actual_demand_mw": act_rounded,
                "expected_demand_mw": exp_rounded,
                "residual_mw": dev_rounded,
                "absolute_deviation_mw": round(abs(dev_rounded), 2),
                "percentage_deviation": round(float(pct_val), 2),
                "anomaly_type": anom_type,
                "type_label": type_label,
                "severity": severity,
                "threshold_used_mw": thresh_val
            })

    # 6. Save structured outputs to disk
    anom_df = pd.DataFrame(records_for_csv)
    anom_df.to_csv(csv_out_path, index=False)

    metadata = {
        "dataset_name": settings.DATASET_NAME,
        "country": settings.DATASET_COUNTRY,
        "target_column": settings.DATASET_TARGET_COLUMN,
        "unit": settings.DEMO_UNIT,
        "detection_date": datetime.now().isoformat(),
        "total_dataset_observations": len(df),
        "total_anomalies_detected": len(all_anomaly_items),
        "anomaly_rate_pct": round(len(all_anomaly_items) / len(df) * 100.0, 2),
        "threshold_calculation": {
            "method": "Robust Median Absolute Deviation (MAD)",
            "multiplier_k": 3.0,
            "training_observations_used": train_split_idx,
            "training_period": f"{df.iloc[0]['ds'].strftime('%Y-%m-%d')} to {df.iloc[train_split_idx - 1]['ds'].strftime('%Y-%m-%d')}",
            "median_residual_mw": thresh_stats["median_residual"],
            "mad_mw": thresh_stats["mad"],
            "mad_sigma_mw": thresh_stats["mad_sigma"],
            "anomaly_threshold_mw": thresh_val,
            "severity_thresholds_mw": {
                "low": thresh_val,
                "medium": thresh_med,
                "high": thresh_high
            },
            "no_future_data_leakage": True
        },
        "counts": {
            "high_demand_spikes": sum(1 for a in all_anomaly_items if a.type == "Spike"),
            "low_demand_drops": sum(1 for a in all_anomaly_items if a.type == "Drop"),
            "high_severity": sum(1 for a in all_anomaly_items if a.severity == "High"),
            "medium_severity": sum(1 for a in all_anomaly_items if a.severity == "Medium"),
            "low_severity": sum(1 for a in all_anomaly_items if a.severity == "Low")
        }
    }

    with open(json_out_path, "w") as f:
        json.dump(metadata, f, indent=2)

    _CACHED_ANOMALIES_DATA = {
        "items": all_anomaly_items,
        "metadata": metadata
    }
    return _CACHED_ANOMALIES_DATA


def detect_anomalies(
    type_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: Optional[int] = None,
    page_size: Optional[int] = None,
    limit: Optional[int] = None
) -> Dict[str, Any]:
    """Retrieves detected anomalies with multi-dimensional filtering, pagination, and summary statistics."""
    data = compute_and_save_anomalies()
    items = data["items"]
    metadata = data["metadata"]

    filtered: List[AnomalyItem] = []
    for item in items:
        # Date range filtering
        if start_date and item.date < start_date:
            continue
        if end_date and item.date > end_date:
            continue

        # Type filter (supports 'all', 'spike', 'drop', 'high', 'low')
        if type_filter and type_filter.lower() != "all":
            tf = type_filter.lower()
            if tf in ["spike", "high", "high demand"] and item.type != "Spike":
                continue
            elif tf in ["drop", "low", "low demand"] and item.type != "Drop":
                continue

        # Severity filter
        if severity_filter and severity_filter.lower() != "all":
            if item.severity.lower() != severity_filter.lower():
                continue

        filtered.append(item)

    total_matching = len(filtered)
    pagination_info = None
    returned_items = filtered

    if page is not None and page_size is not None and page_size > 0:
        total_pages = math.ceil(total_matching / page_size)
        start_idx = (page - 1) * page_size
        returned_items = filtered[start_idx : start_idx + page_size]
        pagination_info = {
            "page": page,
            "page_size": page_size,
            "total_records": total_matching,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }
    elif limit is not None and limit > 0:
        returned_items = filtered[:limit]

    # Calculate summary over all matching filtered records
    total_spikes = sum(1 for a in filtered if a.type == "Spike")
    total_drops = sum(1 for a in filtered if a.type == "Drop")
    high_count = sum(1 for a in filtered if a.severity == "High")
    med_count = sum(1 for a in filtered if a.severity == "Medium")
    low_count = sum(1 for a in filtered if a.severity == "Low")
    most_recent = filtered[-1] if filtered else None

    summary = AnomalySummary(
        total_anomalies=total_matching,
        total_spikes=total_spikes,
        total_drops=total_drops,
        high_severity_count=high_count,
        medium_severity_count=med_count,
        low_severity_count=low_count,
        most_recent_anomaly=most_recent
    )

    return {
        "anomalies": returned_items,
        "summary": summary,
        "dataset_mode": settings.DATASET_MODE,
        "demo_note": settings.DATASET_NOTE,
        "pagination": pagination_info,
        "detection_metadata": metadata["threshold_calculation"]
    }


def get_most_significant_anomalies(top_n: int = 10) -> List[AnomalyItem]:
    """Returns the top N most extreme anomalies sorted by absolute deviation."""
    data = compute_and_save_anomalies()
    items = sorted(data["items"], key=lambda a: abs(a.deviation_mw), reverse=True)
    return items[:top_n]
