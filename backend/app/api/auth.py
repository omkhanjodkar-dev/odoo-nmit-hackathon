from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user, AuthenticatedUser
from app.schemas.auth import (
    SignUpRequest,
    SignUpResponse,
    SignInRequest,
    AuthTokenResponse,
    UserProfileResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Authorization"])


@router.post("/signup", response_model=SignUpResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignUpRequest):
    """
    3.1.1 Sign Up:
    Registers a new employee or HR admin user with email, employee_id, password, and role in Supabase Auth.
    """
    return AuthService.sign_up_user(payload)


@router.post("/signin", response_model=AuthTokenResponse)
async def signin(payload: SignInRequest):
    """
    3.1.2 Sign In:
    Authenticates user with email and password via Supabase.
    Returns access_token, refresh_token, and role-based redirect URL (/admin/dashboard or /employee/dashboard).
    """
    return AuthService.sign_in_user(payload)


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Retrieves the currently authenticated user's profile and RBAC role.
    """
    return AuthService.get_user_profile(current_user.id)
