"""OPSD Data Ingestion, Validation, and Caching Service.

Loads, validates, and serves the real Open Power System Data (OPSD) historical
daily electricity demand observations for Germany (DE_load_actual_entsoe_transparency).
Ensures strict chronological sorting, absence of nulls/duplicates, and provides
cached access for API routes and evaluation pipelines.
"""
import math
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np

from app.config import settings

# In-memory singleton cache
_CACHED_OPSD_DF: Optional[pd.DataFrame] = None
_CACHED_OBSERVATIONS: Optional[List[Dict[str, Any]]] = None


def load_opsd_daily(file_path: Optional[Path] = None, force_reload: bool = False) -> pd.DataFrame:
    """Loads and strictly validates the OPSD daily Germany electricity demand CSV.
    
    Validations:
      - File existence (raises FileNotFoundError, no silent synthetic fallback)
      - Required columns ('ds' for date, 'y' for demand)
      - Date parsing and monotonic chronological order
      - Zero null or missing values
      - Zero duplicate timestamps
      - Valid positive demand figures
    """
    global _CACHED_OPSD_DF
    if _CACHED_OPSD_DF is not None and not force_reload:
        return _CACHED_OPSD_DF

    target_path = Path(file_path) if file_path else settings.OPSD_DAILY_PATH
    if not target_path.exists():
        raise FileNotFoundError(
            f"OPSD daily dataset file not found at: {target_path}. "
            "Please ensure 'backend/data/opsd_daily.csv' is present."
        )

    # 1. Load CSV
    df = pd.read_csv(target_path)

    # 2. Schema check
    required_cols = {"ds", "y"}
    if not required_cols.issubset(set(df.columns)):
        raise ValueError(
            f"Dataset at {target_path} missing required columns. "
            f"Expected {required_cols}, found {set(df.columns)}"
        )

    # 3. Null checks
    null_counts = df[["ds", "y"]].isnull().sum()
    if null_counts["ds"] > 0 or null_counts["y"] > 0:
        raise ValueError(
            f"Corrupted dataset at {target_path}: found null values. "
            f"ds nulls: {null_counts['ds']}, y nulls: {null_counts['y']}"
        )

    # 4. Date parsing & validation
    df["ds"] = pd.to_datetime(df["ds"], format="%Y-%m-%d", errors="coerce")
    if df["ds"].isnull().any():
        raise ValueError("Invalid date format detected in 'ds' column. Expected YYYY-MM-DD.")

    # 5. Duplicate check
    duplicate_count = df["ds"].duplicated().sum()
    if duplicate_count > 0:
        raise ValueError(f"Duplicate date records detected in dataset ({duplicate_count} duplicates).")

    # 6. Chronological sorting
    df = df.sort_values(by="ds").reset_index(drop=True)

    # 7. Value checks (positive demand only)
    if (df["y"] <= 0).any():
        invalid_count = (df["y"] <= 0).sum()
        raise ValueError(f"Invalid non-positive demand values detected ({invalid_count} records).")

    # Cache cleaned DataFrame
    _CACHED_OPSD_DF = df
    return _CACHED_OPSD_DF


def get_opsd_dataframe() -> pd.DataFrame:
    """Returns the cached OPSD DataFrame."""
    return load_opsd_daily()


def get_train_test_split(split_ratio: float = 0.70) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Chronologically partitions the OPSD dataset into train and test sets.
    
    Prevents lookahead bias by ensuring all test observations strictly occur
    after all training observations.
    
    Returns:
        (train_df, test_df) where len(train_df) = int(N * split_ratio)
    """
    df = get_opsd_dataframe()
    split_index = int(len(df) * split_ratio)
    train_df = df.iloc[:split_index].copy().reset_index(drop=True)
    test_df = df.iloc[split_index:].copy().reset_index(drop=True)
    return train_df, test_df


def _build_enriched_observations(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Calculates rolling statistics, baseline estimates, and components for UI presentation."""
    # Compute 7-day rolling mean for weekly baseline expectation
    rolling_7d = df["y"].rolling(window=7, min_periods=1, center=True).mean()
    # Compute 30-day rolling mean for secular trend indication
    rolling_30d = df["y"].rolling(window=30, min_periods=1, center=True).mean()

    # Day of week seasonality factors relative to 7d mean
    dow = df["ds"].dt.dayofweek
    overall_mean = float(df["y"].mean())
    dow_means = df.groupby(dow)["y"].mean()
    dow_seasonality = df["ds"].dt.dayofweek.map(lambda d: dow_means[d] - overall_mean)

    # Day of year seasonality factors relative to overall mean
    doy = df["ds"].dt.dayofyear
    doy_means = df.groupby(doy)["y"].mean()
    doy_seasonality = df["ds"].dt.dayofyear.map(lambda d: doy_means.get(d, overall_mean) - overall_mean)

    observations: List[Dict[str, Any]] = []
    threshold_pct = settings.ANOMALY_DEVIATION_THRESHOLD_PERCENT

    for idx, row in df.iterrows():
        date_str = row["ds"].strftime("%Y-%m-%d")
        actual = float(row["y"])
        expected = float(rolling_7d.iloc[idx])
        trend = float(rolling_30d.iloc[idx])
        weekly = float(dow_seasonality.iloc[idx])
        yearly = float(doy_seasonality.iloc[idx])

        deviation_mw = actual - expected
        pct_deviation = (deviation_mw / expected) * 100.0 if expected > 0 else 0.0
        abs_pct = abs(pct_deviation)

        is_anomaly = abs_pct >= threshold_pct
        anomaly_type = None
        severity = None
        anomaly_desc = None

        if is_anomaly:
            anomaly_type = "Spike" if deviation_mw > 0 else "Drop"
            if abs_pct >= 22.0:
                severity = "High"
            elif abs_pct >= 15.0:
                severity = "Medium"
            else:
                severity = "Low"

            direction = "surge" if anomaly_type == "Spike" else "curtailment"
            anomaly_desc = (
                f"German grid demand {direction} of {abs(round(deviation_mw, 1))} MW "
                f"({round(pct_deviation, 1)}%) relative to 7-day rolling baseline."
            )

        observations.append({
            "date": date_str,
            "day_index": idx,
            "actual_demand": round(actual, 2),
            "expected_demand": round(expected, 2),
            "forecasted_demand": round(expected, 2),
            "trend": round(trend, 2),
            "weekly_seasonality": round(weekly, 2),
            "yearly_seasonality": round(yearly, 2),
            "is_anomaly": is_anomaly,
            "anomaly_type": anomaly_type,
            "severity": severity,
            "anomaly_desc": anomaly_desc,
            "deviation_mw": round(deviation_mw, 2),
            "deviation_pct": round(pct_deviation, 2),
        })

    return observations


def get_opsd_observations() -> List[Dict[str, Any]]:
    """Returns the cached list of historical observations with actual demand."""
    global _CACHED_OBSERVATIONS
    if _CACHED_OBSERVATIONS is None:
        df = get_opsd_dataframe()
        _CACHED_OBSERVATIONS = _build_enriched_observations(df)
    return _CACHED_OBSERVATIONS


def get_opsd_stats(filtered_obs: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """Calculates summary statistics across all or a filtered subset of observations."""
    obs_list = filtered_obs if filtered_obs is not None else get_opsd_observations()
    if not obs_list:
        return {
            "total_observations": 0,
            "start_date": "",
            "end_date": "",
            "average_demand": 0.0,
            "min_demand": 0.0,
            "max_demand": 0.0,
            "std_demand": 0.0,
            "highest_demand_date": "",
            "lowest_demand_date": "",
            "unit": settings.DEMO_UNIT
        }

    demands = [o["actual_demand"] for o in obs_list]
    total_obs = len(demands)
    avg_demand = sum(demands) / total_obs
    variance = sum((x - avg_demand) ** 2 for x in demands) / total_obs
    std_demand = math.sqrt(variance)

    min_val = min(demands)
    max_val = max(demands)

    highest_date = next(o["date"] for o in obs_list if o["actual_demand"] == max_val)
    lowest_date = next(o["date"] for o in obs_list if o["actual_demand"] == min_val)

    return {
        "total_observations": total_obs,
        "start_date": obs_list[0]["date"],
        "end_date": obs_list[-1]["date"],
        "average_demand": round(avg_demand, 2),
        "min_demand": round(min_val, 2),
        "max_demand": round(max_val, 2),
        "std_demand": round(std_demand, 2),
        "highest_demand_date": highest_date,
        "lowest_demand_date": lowest_date,
        "unit": settings.DEMO_UNIT
    }


def get_opsd_metadata() -> Dict[str, Any]:
    """Returns detailed metadata about the real OPSD dataset."""
    df = get_opsd_dataframe()
    return {
        "dataset_name": settings.DATASET_NAME,
        "country": settings.DATASET_COUNTRY,
        "target_column": settings.DATASET_TARGET_COLUMN,
        "frequency": settings.DATASET_FREQUENCY,
        "unit": settings.DEMO_UNIT,
        "total_observations": len(df),
        "start_date": df["ds"].min().strftime("%Y-%m-%d"),
        "end_date": df["ds"].max().strftime("%Y-%m-%d"),
        "min_demand_mw": round(float(df["y"].min()), 2),
        "max_demand_mw": round(float(df["y"].max()), 2),
        "mean_demand_mw": round(float(df["y"].mean()), 2),
        "dataset_mode": settings.DATASET_MODE,
    }
