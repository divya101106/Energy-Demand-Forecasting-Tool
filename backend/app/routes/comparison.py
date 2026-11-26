"""Forecast vs Actual evaluation comparison route.
"""
from fastapi import APIRouter
from app.schemas import ComparisonResponse
from app.services.evaluation_service import get_detailed_comparison
from app.services.predictor import get_active_forecasting_mode

router = APIRouter(tags=["Comparison"])

@router.get("/comparison", response_model=ComparisonResponse)
async def get_comparison():
    """Returns actual vs forecasted demand points, residual errors, distribution histogram bins,
    and qualitative automated interpretations.
    """
    mode = get_active_forecasting_mode()
    return get_detailed_comparison(forecasting_mode=mode)
