"""Authentication routes for demonstration session management.
"""
from fastapi import APIRouter, HTTPException, status
from app.config import settings
from app.schemas import LoginRequest, LoginResponse, LogoutResponse, UserProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Demonstration login endpoint validating fixed demo credentials.
    
    Demo credentials:
      Email: demo@example.com
      Password: demo123
    """
    if credentials.email == settings.DEMO_EMAIL and credentials.password == settings.DEMO_PASSWORD:
        return LoginResponse(
            success=True,
            token=settings.DEMO_TOKEN,
            user=UserProfile(
                email=settings.DEMO_EMAIL,
                name=settings.DEMO_USER_NAME,
                role=settings.DEMO_USER_ROLE
            ),
            message="Demonstration login successful. Welcome to Energy Demand Forecasting Tool."
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid demonstration credentials. Use demo@example.com / demo123"
    )

@router.post("/logout", response_model=LogoutResponse)
async def logout():
    """Ends the demonstration session."""
    return LogoutResponse(
        success=True,
        message="Session successfully terminated."
    )
