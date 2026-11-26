"""Global error handling middleware for FastAPI application.
Ensures no internal stack traces or implementation details leak to clients.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status_code": exc.status_code,
            "error_type": "HTTPException",
            "message": exc.detail
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "error_type": "ValidationError",
            "message": "Input validation failed. Please verify submitted request parameters.",
            "details": exc.errors()
        }
    )

async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "error_type": "InternalServerError",
            "message": "An unexpected error occurred while processing the forecasting request."
        }
    )
