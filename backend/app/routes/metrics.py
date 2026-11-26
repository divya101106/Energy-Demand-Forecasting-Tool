"""Model evaluation metrics route.
"""
from fastapi import APIRouter
from app.schemas import ModelMetricsResponse
from app.services.evaluation_service import get_test_evaluation
from app.services.predictor import get_active_forecasting_mode

router = APIRouter(tags=["Metrics"])

@router.get("/metrics", response_model=ModelMetricsResponse)
async def get_metrics():
    """Returns evaluation metrics (MAE, RMSE, MAPE) computed on the 30% chronological test partition,
    benchmarked against the seasonal-naive baseline.
    """
    mode = get_active_forecasting_mode()
    return get_test_evaluation(forecasting_mode=mode)
