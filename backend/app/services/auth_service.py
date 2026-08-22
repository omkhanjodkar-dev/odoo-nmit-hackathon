import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin
from app.schemas.auth import SignUpRequest, SignInRequest, AuthTokenResponse, SignUpResponse, UserProfileResponse

logger = logging.getLogger(__name__)


class AuthService:

    @staticmethod
    def sign_up_user(payload: SignUpRequest) -> SignUpResponse:
        supabase = get_supabase_admin()

        # 1. Check duplicate employee_id in public.profiles
        try:
            emp_check = supabase.table("profiles").select("user_id").eq("employee_id", payload.employee_id).execute()
            if emp_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Employee ID '{payload.employee_id}' is already registered."
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

        # 3. Create record in public.profiles (user_id PK, employee_id, role)
        try:
            profile_payload = {
                "user_id": user_id,
                "employee_id": payload.employee_id,
                "role": payload.role.value,
                "updated_at": "now()",
            }
            supabase.table("profiles").upsert(profile_payload, on_conflict="user_id").execute()
        except Exception as e:
            logger.error(f"Failed to create public.profiles record: {e}")

        # 4. Initialize public.personal_info record
        try:
            personal_payload = {
                "user_id": user_id,
                "phone_number": int(payload.phone) if payload.phone and payload.phone.isdigit() else None,
                "address": "",
            }
            supabase.table("personal_info").upsert(personal_payload, on_conflict="user_id").execute()
        except Exception as e:
            logger.warning(f"Personal info initialization warning: {e}")

        # 5. Initialize public.leave_balance (12 sick leaves, 0 paid, 0 unpaid)
        try:
            leave_balance_payload = {
                "user_id": user_id,
                "sick_leave": 12.0,
                "paid_leave": 0,
                "unpaid_leave": 0,
            }
            supabase.table("leave_balance").upsert(leave_balance_payload, on_conflict="user_id").execute()
        except Exception as e:
            logger.warning(f"Leave balance initialization warning: {e}")

        # 6. Initialize default public.salary_structures (base_pay=50000.00)
        try:
            default_salary = {
                "user_id": user_id,
                "base_pay": 50000.00,
                "updated_at": "now()",
            }
            supabase.table("salary_structures").upsert(default_salary, on_conflict="user_id").execute()
        except Exception as e:
            logger.warning(f"Salary structure initialization warning: {e}")

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

        if not auth_response.user.email_confirmed_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please check your inbox and verify your email."
            )

        user_id = auth_response.user.id
        
        # Fetch profile for exact role & employee_id
        role = "EMPLOYEE"
        employee_id = None
        try:
            prof = supabase.table("profiles").select("role, employee_id").eq("user_id", user_id).single().execute()
            if prof.data:
                role = (prof.data.get("role") or "EMPLOYEE").upper()
                employee_id = prof.data.get("employee_id")
        except Exception:
            user_metadata = auth_response.user.user_metadata or {}
            role = (user_metadata.get("role") or "EMPLOYEE").upper()
            employee_id = user_metadata.get("employee_id")

        redirect_url = "/admin/dashboard" if role in ["ADMIN", "ADMIN_HR", "HR"] else "/employee/dashboard"

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
            # Query public.profiles
            prof = supabase.table("profiles").select("*").eq("user_id", user_id).single().execute()
            prof_data = prof.data or {}

            # Query public.personal_info
            personal_res = supabase.table("personal_info").select("*").eq("user_id", user_id).execute()
            personal_data = personal_res.data[0] if personal_res.data else {}

            phone_val = str(personal_data.get("phone_number")) if personal_data.get("phone_number") else None

            return UserProfileResponse(
                id=str(prof_data.get("user_id")),
                user_id=str(prof_data.get("user_id")),
                employee_id=str(prof_data.get("employee_id", "")),
                email="",
                role=str(prof_data.get("role", "EMPLOYEE")),
                phone=phone_val,
                address=personal_data.get("address"),
                avatar_url=personal_data.get("profile_image"),
                blood_group=personal_data.get("blood_group"),
                dob=str(personal_data.get("dob")) if personal_data.get("dob") else None,
                married=personal_data.get("married"),
                emergency_contact=str(personal_data.get("emergency_contact")) if personal_data.get("emergency_contact") else None,
            )
        except Exception as e:
            logger.error(f"Error fetching profile for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error fetching profile: {str(e)}"
            )
