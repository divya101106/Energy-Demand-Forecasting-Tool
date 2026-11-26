"""Forecasting generation route.
"""
from fastapi import APIRouter, HTTPException, status
from app.schemas import ForecastRequest, ForecastResponse
from app.services.predictor import generate_forecast

router = APIRouter(tags=["Forecast"])

@router.post("/forecast", response_model=ForecastResponse)
async def create_forecast(request: ForecastRequest):
    """Generates short-term energy demand forecasts based on requested horizon and seasonality parameters."""
    if request.frequency.lower() not in ["daily", "weekly"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Frequency must be either 'daily' or 'weekly'"
        )

    if request.horizon not in [7, 14, 30, 60]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Forecast horizon must be 7, 14, 30, or 60 days"
        )

    if request.changepoint_flexibility.lower() not in ["conservative", "balanced", "flexible"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Changepoint flexibility must be 'conservative', 'balanced', or 'flexible'"
        )

    result = generate_forecast(request)
    return result
