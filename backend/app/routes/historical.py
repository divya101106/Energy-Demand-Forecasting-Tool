"""Historical demand observations and summary statistics route.
"""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from app.schemas import HistoricalResponse
from app.services.data_service import get_historical_data
from app.config import settings

router = APIRouter(tags=["Historical Demand"])

@router.get("/historical", response_model=HistoricalResponse)
async def get_historical(
    start_date: Optional[str] = Query(None, description="Filter start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Filter end date YYYY-MM-DD"),
    page: Optional[int] = Query(None, ge=1, description="Page number (1-indexed) for pagination"),
    page_size: Optional[int] = Query(None, ge=1, le=1000, description="Records per page (1 to 1000)")
):
    """Returns real OPSD historical energy demand observations and computed statistics.
    Supports flexible date range filtering, pagination, summary stats, and dataset metadata.
    """
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date cannot be chronologically after end_date"
        )

    result = get_historical_data(
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )

    return HistoricalResponse(
        observations=result["observations"],
        stats=result["stats"],
        dataset_mode=settings.DATASET_MODE,
        demo_note=settings.DATASET_NOTE,
        pagination=result.get("pagination"),
        dataset_metadata=result.get("dataset_metadata")
    )
