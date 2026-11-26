"""Model information route.
"""
from fastapi import APIRouter
from app.schemas import ModelInfoResponse
from app.services.model_loader import get_model_information

router = APIRouter(tags=["Model"])

@router.get("/model", response_model=ModelInfoResponse)
async def get_model():
    """Returns detailed architecture, dataset properties, hyperparameter settings, and system status."""
    return get_model_information()
