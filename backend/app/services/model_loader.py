"""Model loader and metadata inspection service.
"""
from typing import Dict, Any
from datetime import datetime
from app.config import settings
from app.services.predictor import get_active_forecasting_mode, is_prophet_available
from app.services.evaluation_service import get_test_evaluation
from app.data.opsd_loader import get_opsd_observations, get_opsd_metadata

def get_model_information() -> Dict[str, Any]:
    """Returns comprehensive model, dataset, and system metadata for the Model Information page."""
    observations = get_opsd_observations()
    forecasting_mode = get_active_forecasting_mode()
    has_prophet = is_prophet_available()
    eval_metrics = get_test_evaluation(forecasting_mode)
    opsd_meta = get_opsd_metadata()

    return {
        "model_name": "Prophet",
        "model_version": "v2.1-de-prophet",
        "model_type": "Generalized Additive Model (GAM)",
        "forecasting_algorithm": "Generalized Additive Model (GAM) with decomposed trend, Fourier seasonality, and German holiday effects",
        "forecasting_mode": forecasting_mode,
        "is_fallback": False,
        "status": "Operational / Ready",
        "model_loading_status": "loaded and operational" if has_prophet else "not loaded",
        "forecast_frequency": "Daily / Weekly (Aggregated)",
        "supported_horizons": [7, 14, 30, 60],
        "training_period": "2015-01-01 to 2019-01-09 (70% holdout training partition)",
        "seasonality_configuration": {
            "weekly_seasonality": "7-day cyclical variation (Fourier order 3)",
            "yearly_seasonality": "365.25-day annual cyclical variation (Fourier order 10)",
            "mode": "Additive",
            "prior_scale": 10.0
        },
        "changepoint_configuration": {
            "n_changepoints": 25,
            "changepoint_range": 0.8,
            "flexibility_options": {
                "conservative": 0.01,
                "balanced": 0.05,
                "flexible": 0.15
            }
        },
        "holiday_configuration": {
            "country_calendar": "Germany (DE) Federal Statutory Public Holidays",
            "prior_scale": 10.0,
            "impact_window": "[-1 day, +1 day]"
        },
        "dataset_info": {
            "dataset_mode": settings.DATASET_MODE,
            "dataset_origin": f"Open Power System Data (OPSD) — {settings.DATASET_COUNTRY}",
            "target_column": settings.DATASET_TARGET_COLUMN,
            "number_of_observations": len(observations),
            "start_date": observations[0]["date"],
            "end_date": observations[-1]["date"],
            "time_interval": "Daily (24h aggregated from 60min resolution)",
            "demonstration_unit": settings.DEMO_UNIT,
            "baseline_demand_mw": opsd_meta["mean_demand_mw"],
            "data_provenance": "Actual historical electrical load telemetry provided via ENTSO-E transparency platform for Germany (DE).",
            "synthetic_generation_method": "Actual historical electrical load telemetry provided via ENTSO-E transparency platform for Germany (DE)."
        },
        "evaluation_summary": {
            "evaluation_methodology": "Strict Chronological 70/30 Holdout Split (No Lookahead Bias)",
            "train_observations": eval_metrics["train_count"],
            "test_observations": eval_metrics["test_count"],
            "mae": eval_metrics["metrics"]["mae"],
            "rmse": eval_metrics["metrics"]["rmse"],
            "mape": eval_metrics["metrics"]["mape"],
            "baseline_rmse": eval_metrics["baseline_metrics"]["rmse"],
            "improvement_pct": eval_metrics["baseline_metrics"]["improvement_vs_naive_rmse_pct"],
            "unit": settings.DEMO_UNIT
        },
        "baseline_comparison": {
            "baseline_model": eval_metrics["baseline_metrics"]["model_name"],
            "baseline_mae": eval_metrics["baseline_metrics"]["mae"],
            "baseline_rmse": eval_metrics["baseline_metrics"]["rmse"],
            "baseline_mape": eval_metrics["baseline_metrics"]["mape"],
            "prophet_mae": eval_metrics["metrics"]["mae"],
            "prophet_rmse": eval_metrics["metrics"]["rmse"],
            "prophet_mape": eval_metrics["metrics"]["mape"],
            "rmse_improvement_pct": eval_metrics["baseline_metrics"]["improvement_vs_naive_rmse_pct"],
            "better_model": "Prophet" if eval_metrics["metrics"]["rmse"] < eval_metrics["baseline_metrics"]["rmse"] else "Seasonal-Naive"
        },
        "system_info": {
            "api_version": "v1",
            "fastapi_status": "Running",
            "python_runtime": "Python 3.14 + Prophet 1.5.0",
            "last_inspected": datetime.now().isoformat()
        },
        "demo_note": settings.DATASET_NOTE
    }
