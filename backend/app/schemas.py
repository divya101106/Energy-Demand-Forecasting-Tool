"""Pydantic schemas for Energy Demand Forecasting Tool API.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Health -----------------
class HealthResponse(BaseModel):
    status: str
    service: str
    forecasting_service: str
    forecasting_mode: str  # "Prophet Mode" or "Synthetic Fallback Mode"
    dataset_mode: str
    demo_badge: str
    unit: str
    version: str
    dataset_available: bool = True
    dataset_name: str = "Open Power System Data (OPSD)"
    model_loading_status: str = "operational"
    model_name: str = "Prophet"
    data_source_mode: str = "OPSD Actual Data"

# ----------------- Auth -----------------
class LoginRequest(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    email: str
    name: str
    role: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: UserProfile
    message: str

class LogoutResponse(BaseModel):
    success: bool
    message: str

# ----------------- Historical Data -----------------
class HistoricalObservation(BaseModel):
    date: str
    demand: float
    trend: float
    weekly_seasonality: float
    yearly_seasonality: float
    is_anomaly: bool = False
    anomaly_type: Optional[str] = None
    severity: Optional[str] = None

class HistoricalStats(BaseModel):
    total_observations: int
    start_date: str
    end_date: str
    average_demand: float
    min_demand: float
    max_demand: float
    std_demand: float
    highest_demand_date: str
    lowest_demand_date: str
    unit: str

class HistoricalResponse(BaseModel):
    observations: List[HistoricalObservation]
    stats: HistoricalStats
    dataset_mode: str
    demo_note: str
    pagination: Optional[Dict[str, Any]] = None
    dataset_metadata: Optional[Dict[str, Any]] = None

# ----------------- Forecast -----------------
class ForecastRequest(BaseModel):
    frequency: str = Field(default="daily", description="'daily' or 'weekly'")
    horizon: int = Field(default=30, description="7, 14, 30, or 60")
    weekly_seasonality: bool = Field(default=True)
    yearly_seasonality: bool = Field(default=True)
    holiday_effects: bool = Field(default=True)
    changepoint_flexibility: str = Field(default="balanced", description="'conservative', 'balanced', or 'flexible'")

class ForecastPoint(BaseModel):
    date: str
    predicted_demand: float
    lower_bound: float
    upper_bound: float
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    weekly_total_mwh: Optional[float] = None

class ForecastResponse(BaseModel):
    success: bool
    model_name: str
    model_version: str
    forecasting_mode: str  # "Prophet Mode" or "Synthetic Fallback Mode"
    is_fallback: bool
    fallback_warning: Optional[str] = None
    forecast_frequency: str
    horizon_days: int
    generated_at: str
    unit: str
    forecast_aggregation: Optional[str] = "Daily average demand"
    forecast_cutoff_date: Optional[str] = "2020-09-30"
    data: List[ForecastPoint]
    summary: Dict[str, Any]
    demo_note: str

# ----------------- Model Performance & Metrics -----------------
class MetricScores(BaseModel):
    mae: float
    rmse: float
    mape: float
    unit: str

class BaselineComparison(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape: float
    improvement_vs_naive_rmse_pct: float

class ModelMetricsResponse(BaseModel):
    model_name: str
    model_version: str
    forecasting_mode: str
    evaluation_period: str
    total_evaluated_observations: int
    train_count: int
    test_count: int
    train_split_pct: float
    test_split_pct: float
    metrics: MetricScores
    baseline_metrics: BaselineComparison
    dataset_mode: str
    demo_note: str

# ----------------- Comparison -----------------
class ComparisonPoint(BaseModel):
    date: str
    actual_demand: float
    forecasted_demand: float
    error: float
    absolute_error: float
    percentage_error: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class ErrorDistributionBin(BaseModel):
    bin_range: str
    count: int

class ComparisonResponse(BaseModel):
    observations: List[ComparisonPoint]
    metrics: MetricScores
    error_summary: Dict[str, Any]
    error_distribution: List[ErrorDistributionBin]
    interpretation: List[str]
    forecasting_mode: str
    dataset_mode: str
    demo_note: str

# ----------------- Anomalies -----------------
class AnomalyItem(BaseModel):
    id: str
    date: str
    type: str  # "Spike" (High demand) or "Drop" (Low demand)
    actual_demand: float
    expected_demand: float
    deviation_mw: float
    deviation_pct: float
    severity: str  # "High", "Medium", "Low"
    status: str    # "Active", "Investigated", "Acknowledged"
    detection_method: str
    description: str
    threshold_used: Optional[float] = None

class AnomalySummary(BaseModel):
    total_anomalies: int
    total_spikes: int
    total_drops: int
    high_severity_count: int
    medium_severity_count: int
    low_severity_count: int
    most_recent_anomaly: Optional[AnomalyItem] = None

class AnomaliesResponse(BaseModel):
    anomalies: List[AnomalyItem]
    summary: AnomalySummary
    dataset_mode: str
    demo_note: str
    pagination: Optional[Dict[str, Any]] = None
    detection_metadata: Optional[Dict[str, Any]] = None

# ----------------- Model Info -----------------
class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    model_type: Optional[str] = "Generalized Additive Model (GAM)"
    forecasting_algorithm: str
    forecasting_mode: str
    is_fallback: bool
    status: str
    model_loading_status: Optional[str] = "loaded and operational"
    forecast_frequency: str
    supported_horizons: List[int]
    training_period: Optional[str] = None
    seasonality_configuration: Dict[str, Any]
    changepoint_configuration: Dict[str, Any]
    holiday_configuration: Dict[str, Any]
    dataset_info: Dict[str, Any]
    evaluation_summary: Dict[str, Any]
    baseline_comparison: Optional[Dict[str, Any]] = None
    system_info: Dict[str, Any]
    demo_note: str
