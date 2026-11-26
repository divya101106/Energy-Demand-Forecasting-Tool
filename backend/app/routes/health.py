"""Health check route.
"""
from fastapi import APIRouter
from app.config import settings
from app.schemas import HealthResponse
from app.services.predictor import get_active_forecasting_mode, is_prophet_available

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def check_health():
    """Health check endpoint to verify backend service, OPSD dataset, and Prophet model status."""
    mode = get_active_forecasting_mode()
    has_prophet = is_prophet_available()
    has_dataset = settings.OPSD_DAILY_PATH.exists()

    overall_status = "healthy" if has_dataset and has_prophet else "degraded"

    return HealthResponse(
        status=overall_status,
        service=settings.PROJECT_NAME,
        forecasting_service="operational" if has_prophet else "unavailable",
        forecasting_mode=mode,
        dataset_mode=settings.DATASET_MODE,
        demo_badge=settings.DEMO_BADGE,
        unit=settings.DEMO_UNIT,
        version="v2.1-de-prophet",
        dataset_available=has_dataset,
        dataset_name=settings.DATASET_NAME,
        model_loading_status="loaded and ready" if has_prophet else "not loaded",
        model_name="Prophet",
        data_source_mode=settings.DATASET_MODE
    )
