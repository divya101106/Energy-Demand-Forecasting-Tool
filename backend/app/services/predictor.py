"""Forecasting service utilizing the pre-trained Prophet model artifact.

Loads the serialized Prophet model trained on 2,100 days of German electricity demand
(OPSD dataset, DE_load_actual_entsoe_transparency). Generates short-term daily and
weekly-aggregated forecasts with empirical uncertainty intervals.
"""
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
from prophet.serialize import model_from_json

from app.config import settings
from app.data.opsd_loader import get_opsd_observations
from app.schemas import ForecastRequest, ForecastPoint

# In-memory singleton for the loaded Prophet model artifact
_CACHED_PROPHET_MODEL = None


def load_trained_prophet_model(model_path: Optional[Path] = None, force_reload: bool = False):
    """Loads the serialized Prophet model from disk into memory.
    
    Raises:
        FileNotFoundError: If the model file is not present (no silent synthetic fallback).
        RuntimeError: If model deserialization fails.
    """
    global _CACHED_PROPHET_MODEL
    if _CACHED_PROPHET_MODEL is not None and not force_reload:
        return _CACHED_PROPHET_MODEL

    target_path = Path(model_path) if model_path else settings.PROPHET_MODEL_PATH
    if not target_path.exists():
        raise FileNotFoundError(
            f"Prophet model artifact not found at: {target_path}. "
            "Please ensure 'backend/models/prophet_model.json' is present."
        )

    try:
        with open(target_path, "r", encoding="utf-8") as f:
            model_json = f.read()
        model = model_from_json(model_json)
        _CACHED_PROPHET_MODEL = model
        return _CACHED_PROPHET_MODEL
    except Exception as e:
        raise RuntimeError(f"Failed to deserialize Prophet model artifact from {target_path}: {e}")


def get_active_forecasting_mode() -> str:
    """Returns the name of the currently active forecasting engine."""
    return "Prophet Mode"


def is_prophet_available() -> bool:
    """Checks if Prophet is operational."""
    try:
        load_trained_prophet_model()
        return True
    except Exception:
        return False


def generate_forecast(request: ForecastRequest) -> Dict[str, Any]:
    """Generates short-term energy demand forecasts using the pre-trained Prophet model.
    
    Forecast Cutoff:
        Historical observations end at 2020-09-30. Forecasts project out-of-sample forward
        starting from 2020-10-01. (These reflect post-2020 historical extrapolation, not
        current 2026 demand).
        
    Weekly Aggregation:
        Because the underlying model was trained on daily observations, weekly forecasts
        generate daily predictions and strictly aggregate them across 7-day calendar intervals
        into weekly mean demand (MW) and weekly total energy consumption (MWh).
    """
    m = load_trained_prophet_model()
    history = get_opsd_observations()
    last_obs = history[-1]

    is_weekly = request.frequency.lower() == "weekly"

    # Number of daily steps required
    if is_weekly:
        num_weeks = max(1, request.horizon // 7)
        daily_periods = num_weeks * 7
    else:
        daily_periods = request.horizon

    # Generate daily predictions starting on 2020-10-01
    future = m.make_future_dataframe(periods=daily_periods, freq="D", include_history=False)
    forecast_df = m.predict(future)

    # Uncertainty flexibility scaling
    flexibility_multiplier = {
        "conservative": 0.85,
        "balanced": 1.0,
        "flexible": 1.25
    }.get(request.changepoint_flexibility.lower(), 1.0)

    forecast_points: List[ForecastPoint] = []
    predicted_values: List[float] = []

    if is_weekly:
        # Group into 7-day weekly aggregates
        for w in range(num_weeks):
            chunk = forecast_df.iloc[w * 7 : (w + 1) * 7]
            week_start_str = chunk.iloc[0]["ds"].strftime("%Y-%m-%d")
            week_end_str = chunk.iloc[-1]["ds"].strftime("%Y-%m-%d")

            mean_yhat = round(float(chunk["yhat"].mean()), 2)
            base_lower = float(chunk["yhat_lower"].mean())
            base_upper = float(chunk["yhat_upper"].mean())
            half_width = (base_upper - base_lower) / 2.0 * flexibility_multiplier

            lower_bound = round(mean_yhat - half_width, 2)
            upper_bound = round(mean_yhat + half_width, 2)
            # Energy (MWh) = Average Load (MW) * 168 hours in a week
            weekly_mwh = round(float(chunk["yhat"].sum() * 24.0), 2)

            predicted_values.append(mean_yhat)
            forecast_points.append(
                ForecastPoint(
                    date=f"{week_start_str} to {week_end_str}",
                    start_date=week_start_str,
                    end_date=week_end_str,
                    predicted_demand=mean_yhat,
                    lower_bound=lower_bound,
                    upper_bound=upper_bound,
                    weekly_total_mwh=weekly_mwh
                )
            )
        aggregation_desc = "Weekly mean power demand (MW) with total energy consumption (MWh) aggregated across 7 daily steps"
    else:
        # Daily forecast points
        for _, row in forecast_df.iterrows():
            pred = round(float(row["yhat"]), 2)
            base_lower = float(row["yhat_lower"])
            base_upper = float(row["yhat_upper"])
            half_width = (base_upper - base_lower) / 2.0 * flexibility_multiplier

            lower = round(pred - half_width, 2)
            upper = round(pred + half_width, 2)
            date_str = row["ds"].strftime("%Y-%m-%d")

            predicted_values.append(pred)
            forecast_points.append(
                ForecastPoint(
                    date=date_str,
                    start_date=date_str,
                    end_date=date_str,
                    predicted_demand=pred,
                    lower_bound=lower,
                    upper_bound=upper
                )
            )
        aggregation_desc = "Daily mean power demand (MW)"

    avg_pred = sum(predicted_values) / len(predicted_values) if predicted_values else 0.0
    latest_actual = last_obs["actual_demand"]
    first_pred = predicted_values[0] if predicted_values else latest_actual
    pct_change = ((first_pred - latest_actual) / latest_actual) * 100.0

    summary: Dict[str, Any] = {
        "average_predicted_demand": round(avg_pred, 2),
        "peak_forecast_demand": round(max(predicted_values), 2) if predicted_values else 0.0,
        "lowest_forecast_demand": round(min(predicted_values), 2) if predicted_values else 0.0,
        "next_period_predicted": round(first_pred, 2),
        "latest_historical_demand": latest_actual,
        "percent_change_next_period": round(pct_change, 2),
        "forecast_origin_cutoff": "2020-09-30",
        "aggregation_mode": aggregation_desc
    }

    if is_weekly:
        summary["total_projected_energy_mwh"] = round(sum(p.weekly_total_mwh or 0.0 for p in forecast_points), 2)

    return {
        "success": True,
        "model_name": "Prophet",
        "model_version": "v2.1-de-prophet",
        "forecasting_mode": "Prophet Mode",
        "is_fallback": False,
        "fallback_warning": None,
        "forecast_frequency": request.frequency,
        "horizon_days": request.horizon,
        "generated_at": datetime.now().isoformat(),
        "unit": settings.DEMO_UNIT,
        "forecast_aggregation": aggregation_desc,
        "forecast_cutoff_date": "2020-09-30",
        "data": forecast_points,
        "summary": summary,
        "demo_note": settings.DATASET_NOTE
    }
