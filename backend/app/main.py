"""FastAPI application entry point for Energy Demand Forecasting Tool.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    global_exception_handler
)
from app.routes import (
    health,
    auth,
    historical,
    forecast,
    model,
    anomalies,
    metrics,
    comparison
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: pre-warms dataset and model artifacts on startup."""
    # Pre-load OPSD dataset, pre-trained Prophet model, evaluation results, and anomalies
    try:
        from app.data.opsd_loader import load_opsd_daily
        from app.services.predictor import load_trained_prophet_model
        from app.services.evaluation_service import run_full_evaluation
        from app.services.anomaly_service import compute_and_save_anomalies

        load_opsd_daily()
        load_trained_prophet_model()
        run_full_evaluation()
        compute_and_save_anomalies()
    except Exception as e:
        print(f"Startup warning during warm-up: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.1.0",
    description=(
        "Decision-support API for electric utility planners and grid operations teams. "
        "Powered by real Open Power System Data (OPSD) for Germany (DE_load_actual_entsoe_transparency, "
        "2015-01-01 to 2020-09-30), Facebook Prophet GAM forecasting, strict 70/30 holdout benchmarking, "
        "and robust MAD statistical anomaly detection."
    ),
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"  # Flexible for local project demo
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom error handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Include API v1 routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(historical.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(model.router, prefix=settings.API_V1_STR)
app.include_router(anomalies.router, prefix=settings.API_V1_STR)
app.include_router(metrics.router, prefix=settings.API_V1_STR)
app.include_router(comparison.router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"{settings.PROJECT_NAME} Backend API is running.",
        "badge": settings.DEMO_BADGE,
        "dataset": settings.DATASET_NAME,
        "target_column": settings.DATASET_TARGET_COLUMN,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
