from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user, AuthenticatedUser
from app.schemas.auth import (
    SignUpRequest,
    SignUpResponse,
    SignInRequest,
    AuthTokenResponse,
    UserProfileResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication & Authorization"])


@router.post("/signup", response_model=SignUpResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignUpRequest):
    return AuthService.sign_up_user(payload)


@router.post("/signin", response_model=AuthTokenResponse)
async def signin(payload: SignInRequest):
    return AuthService.sign_in_user(payload)


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: AuthenticatedUser = Depends(get_current_user)):
    return AuthService.get_user_profile(current_user.id)


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    return AuthService.change_password(current_user.id, current_user.email, payload)
