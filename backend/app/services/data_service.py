"""Data service for querying and calculating historical demand statistics.
"""
import math
from typing import List, Dict, Any, Optional
from app.data.opsd_loader import get_opsd_observations, get_opsd_metadata
from app.config import settings
from app.schemas import HistoricalStats

def get_historical_data(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: Optional[int] = None,
    page_size: Optional[int] = None
) -> Dict[str, Any]:
    """Retrieves real OPSD historical energy demand observations with date filtering,
    optional pagination, summary statistics, and dataset metadata.
    """
    all_data = get_opsd_observations()

    filtered = []
    for obs in all_data:
        obs_date = obs["date"]
        if start_date and obs_date < start_date:
            continue
        if end_date and obs_date > end_date:
            continue
        filtered.append({
            "date": obs["date"],
            "demand": obs["actual_demand"],
            "trend": obs["trend"],
            "weekly_seasonality": obs["weekly_seasonality"],
            "yearly_seasonality": obs["yearly_seasonality"],
            "is_anomaly": obs["is_anomaly"],
            "anomaly_type": obs["anomaly_type"],
            "severity": obs["severity"],
        })

    metadata = get_opsd_metadata()

    if not filtered:
        stats = HistoricalStats(
            total_observations=0,
            start_date=start_date or "",
            end_date=end_date or "",
            average_demand=0.0,
            min_demand=0.0,
            max_demand=0.0,
            std_demand=0.0,
            highest_demand_date="",
            lowest_demand_date="",
            unit=settings.DEMO_UNIT
        )
        return {
            "observations": [],
            "stats": stats,
            "pagination": None,
            "dataset_metadata": metadata
        }

    demands = [o["demand"] for o in filtered]
    total_obs = len(demands)
    avg_demand = sum(demands) / total_obs
    variance = sum((x - avg_demand) ** 2 for x in demands) / total_obs
    std_demand = math.sqrt(variance)

    min_val = min(demands)
    max_val = max(demands)

    highest_date = next(o["date"] for o in filtered if o["demand"] == max_val)
    lowest_date = next(o["date"] for o in filtered if o["demand"] == min_val)

    stats = HistoricalStats(
        total_observations=total_obs,
        start_date=filtered[0]["date"],
        end_date=filtered[-1]["date"],
        average_demand=round(avg_demand, 2),
        min_demand=round(min_val, 2),
        max_demand=round(max_val, 2),
        std_demand=round(std_demand, 2),
        highest_demand_date=highest_date,
        lowest_demand_date=lowest_date,
        unit=settings.DEMO_UNIT
    )

    # Apply pagination if requested
    pagination_info = None
    returned_obs = filtered
    if page is not None and page_size is not None and page_size > 0:
        total_pages = math.ceil(total_obs / page_size)
        start_idx = (page - 1) * page_size
        returned_obs = filtered[start_idx : start_idx + page_size]
        pagination_info = {
            "page": page,
            "page_size": page_size,
            "total_records": total_obs,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }

    return {
        "observations": returned_obs,
        "stats": stats,
        "pagination": pagination_info,
        "dataset_metadata": metadata
    }
