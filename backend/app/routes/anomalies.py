"""Anomaly detection route.
"""
from typing import Optional
from fastapi import APIRouter, Query
from app.schemas import AnomaliesResponse
from app.services.anomaly_service import detect_anomalies

router = APIRouter(tags=["Anomalies"])

@router.get("/anomalies", response_model=AnomaliesResponse)
async def get_anomalies(
    type: Optional[str] = Query(None, description="Filter by 'Spike' or 'Drop'"),
    severity: Optional[str] = Query(None, description="Filter by 'High', 'Medium', or 'Low'"),
    start_date: Optional[str] = Query(None, description="Filter start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Filter end date YYYY-MM-DD"),
    page: Optional[int] = Query(None, ge=1, description="Page number for pagination"),
    page_size: Optional[int] = Query(None, ge=1, le=500, description="Records per page (1 to 500)"),
    limit: Optional[int] = Query(None, description="Maximum number of anomalies to return")
):
    """Returns detected energy demand spikes and drops with severity classifications and summary metrics.
    Supports filtering by anomaly type, severity level, date range, pagination, and count limit.
    """
    return detect_anomalies(
        type_filter=type,
        severity_filter=severity,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
        limit=limit
    )
