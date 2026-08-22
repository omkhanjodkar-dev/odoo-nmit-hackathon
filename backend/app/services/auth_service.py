import logging
from typing import Dict, Any
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin
from app.schemas.auth import SignUpRequest, SignInRequest, AuthTokenResponse, SignUpResponse, UserProfileResponse

logger = logging.getLogger(__name__)


class AuthService:

    @staticmethod
    def sign_up_user(payload: SignUpRequest) -> SignUpResponse:
        supabase = get_supabase_admin()

        # 1. Check duplicate employee_id or email in profiles
        try:
            emp_check = supabase.table("profiles").select("id").eq("employee_id", payload.employee_id).execute()
            if emp_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Employee ID '{payload.employee_id}' is already registered."
                )

            email_check = supabase.table("profiles").select("id").eq("email", payload.email).execute()
            if email_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{payload.email}' is already registered."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Profile uniqueness check skipped or warning: {e}")

        # 2. Register user with Supabase Auth
        try:
            auth_response = supabase.auth.sign_up({
                "email": payload.email,
                "password": payload.password,
                "options": {
                    "data": {
                        "role": payload.role.value,
                        "employee_id": payload.employee_id,
                        "first_name": payload.first_name or "",
                        "last_name": payload.last_name or "",
                    }
                }
            })
        except Exception as e:
            logger.error(f"Supabase Auth sign_up error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Authentication registration failed: {str(e)}"
            )

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User creation failed on authentication provider."
            )

        user_id = auth_response.user.id
        email_confirmed = bool(auth_response.user.email_confirmed_at)

        # 3. Create or upsert profile in public.profiles table
        try:
            profile_payload = {
                "user_id": user_id,
                "employee_id": payload.employee_id,
                "email": payload.email,
                "role": payload.role.value,
                "first_name": payload.first_name,
                "last_name": payload.last_name,
                "phone": payload.phone,
                "department": payload.department,
                "designation": payload.designation,
                "updated_at": "now()",
            }
            supabase.table("profiles").upsert(profile_payload, on_conflict="user_id").execute()
        except Exception as e:
            logger.error(f"Failed to create public.profiles record: {e}")

        # 4. Initialize default salary structure template
        try:
            default_salary = {
                "user_id": user_id,
                "monthly_wage": 50000.00,
                "yearly_wage": 600000.00,
                "basic_pct": 50.00,
                "basic_salary": 25000.00,
                "hra_pct": 50.00,
                "hra": 12500.00,
                "standard_allowance": 4167.00,
                "bonus_pct": 8.33,
                "performance_bonus": 2082.50,
                "lta_pct": 8.33,
                "lta": 2082.50,
                "fixed_allowance": 2918.00,
                "pf_pct": 12.00,
                "provident_fund": 3000.00,
                "professional_tax": 200.00,
                "gross_salary": 50000.00,
                "total_deductions": 3200.00,
                "net_salary": 46800.00,
                "currency": "INR",
            }
            supabase.table("salary_structures").upsert(default_salary, on_conflict="user_id").execute()
        except Exception as e:
            logger.warning(f"Default salary structure init warning: {e}")

        return SignUpResponse(
            success=True,
            message="Sign up successful! Please check your email to verify your account.",
            user_id=user_id,
            email=payload.email,
            role=payload.role.value,
            employee_id=payload.employee_id,
            email_confirmed=email_confirmed,
        )

    @staticmethod
    def sign_in_user(payload: SignInRequest) -> AuthTokenResponse:
        supabase = get_supabase_admin()

        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": payload.email,
                "password": payload.password
            })
        except Exception as e:
            err_msg = str(e)
            logger.error(f"Sign in failed for {payload.email}: {err_msg}")
            if "Invalid login credentials" in err_msg or "invalid_grant" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            if "Email not confirmed" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email not verified. Please verify your email before logging in."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Login failed: {err_msg}"
            )

        if not auth_response.session or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed. No active session created."
            )

        # Check email confirmation
        if not auth_response.user.email_confirmed_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please check your inbox and verify your email."
            )

        user_id = auth_response.user.id
        user_metadata = auth_response.user.user_metadata or {}
        role = user_metadata.get("role", "EMPLOYEE")
        employee_id = user_metadata.get("employee_id")

        # Determine redirect destination based on PRD requirements
        redirect_url = "/admin/dashboard" if role == "ADMIN_HR" else "/employee/dashboard"

        return AuthTokenResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            token_type="bearer",
            expires_in=auth_response.session.expires_in,
            user_id=user_id,
            email=payload.email,
            role=role,
            employee_id=employee_id,
            redirect_url=redirect_url,
        )

    @staticmethod
    def get_user_profile(user_id: str) -> UserProfileResponse:
        supabase = get_supabase_admin()
        try:
            res = supabase.table("profiles").select("*").eq("user_id", user_id).single().execute()
            if not res.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Profile not found"
                )
            data = res.data
            return UserProfileResponse(
                id=str(data.get("id")),
                user_id=str(data.get("user_id")),
                employee_id=data.get("employee_id", ""),
                email=data.get("email", ""),
                role=data.get("role", "EMPLOYEE"),
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                phone=data.get("phone"),
                address=data.get("address"),
                department=data.get("department"),
                designation=data.get("designation"),
                avatar_url=data.get("avatar_url"),
                joining_date=str(data.get("joining_date")) if data.get("joining_date") else None,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching profile for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error fetching profile: {str(e)}"
            )
