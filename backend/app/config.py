"""Configuration and constants for Energy Demand Forecasting Tool.
"""
from pathlib import Path
from pydantic import BaseModel
from typing import List

# Base directory paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "Energy Demand Forecasting Tool"
    API_V1_STR: str = "/api/v1"
    
    # Directory Paths
    BACKEND_DIR: Path = BACKEND_DIR
    PROJECT_ROOT: Path = PROJECT_ROOT
    
    # Dataset Metadata
    DATASET_NAME: str = "Open Power System Data (OPSD)"
    DATASET_COUNTRY: str = "Germany"
    DATASET_TARGET_COLUMN: str = "DE_load_actual_entsoe_transparency"
    DATASET_FREQUENCY: str = "daily"
    DATASET_MODE: str = "OPSD Actual Data"
    DEMO_UNIT: str = "MW"
    DEMO_BADGE: str = "OPSD DATA — GERMANY GRID (2015–2020)"
    DATASET_NOTE: str = (
        "Historical electricity demand from Open Power System Data (OPSD) for Germany "
        "(DE_load_actual_entsoe_transparency, 2015-01-01 to 2020-09-30, 2,100 daily observations)."
    )
    
    # Artifact File Paths
    OPSD_DAILY_PATH: Path = BACKEND_DIR / "data" / "opsd_daily.csv"
    OPSD_RAW_PATH: Path = PROJECT_ROOT / "data" / "raw" / "time_series_60min_singleindex.csv"
    PROPHET_MODEL_PATH: Path = BACKEND_DIR / "models" / "prophet_model.json"
    METRICS_PATH: Path = BACKEND_DIR / "models" / "metrics.json"
    EVALUATION_PREDICTIONS_PATH: Path = BACKEND_DIR / "data" / "evaluation_predictions.csv"
    EVALUATION_METRICS_PATH: Path = BACKEND_DIR / "models" / "evaluation_comparison.json"
    ANOMALIES_CSV_PATH: Path = BACKEND_DIR / "data" / "detected_anomalies.csv"
    ANOMALIES_JSON_PATH: Path = BACKEND_DIR / "data" / "detected_anomalies.json"
    
    # Demonstration Auth Credentials
    DEMO_EMAIL: str = "demo@example.com"
    DEMO_PASSWORD: str = "demo123"
    DEMO_TOKEN: str = "demo-session-token-energy-forecasting-xyz"
    DEMO_USER_NAME: str = "Energy Operations Planner"
    DEMO_USER_ROLE: str = "Lead Grid Analyst"
    
    # Train/Test Split (70% training, 30% testing)
    TRAIN_SPLIT_RATIO: float = 0.70
    
    # Anomaly Detection Settings
    ANOMALY_ROLLING_WINDOW: int = 14
    ANOMALY_DEVIATION_THRESHOLD_PERCENT: float = 12.0
    
    # Historical Bounds
    START_DATE: str = "2015-01-01"
    END_DATE: str = "2020-09-30"
    TOTAL_OBSERVATIONS: int = 2100
    
    # Legacy / Archived Synthetic Demonstration Parameters
    SYNTHETIC_DAYS: int = 365
    RANDOM_SEED: int = 42
    BASELINE_DEMAND_MW: float = 32500.0
    ANNUAL_GROWTH_RATE: float = 0.015
    DEMO_MODE: bool = True
    DEMO_NOTE: str = (
        "Historical electricity demand from Open Power System Data (OPSD) for Germany "
        "(DE_load_actual_entsoe_transparency, 2015-01-01 to 2020-09-30, 2,100 daily observations)."
    )

settings = Settings()
