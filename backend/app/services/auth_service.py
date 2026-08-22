import logging
from typing import Optional
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin
from app.schemas.auth import (
    SignUpRequest,
    SignInRequest,
    AuthTokenResponse,
    SignUpResponse,
    UserProfileResponse,
    BankDetailsNested,
    ChangePasswordRequest,
    ChangePasswordResponse,
)
from app.utils.login_id import generate_login_id
from app.services.user_provisioning import initialize_user_records

logger = logging.getLogger(__name__)


class AuthService:

    @staticmethod
    def _resolve_email(login_identifier: str) -> str:
        if "@" in login_identifier:
            return login_identifier.strip()

        supabase = get_supabase_admin()
        try:
            prof = (
                supabase.table("profiles")
                .select("user_id")
                .eq("employee_id", login_identifier.strip())
                .single()
                .execute()
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login identifier or password",
            )

        if not prof.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login identifier or password",
            )

        user_id = prof.data["user_id"]
        try:
            user_resp = supabase.auth.admin.get_user_by_id(user_id)
            if user_resp and user_resp.user and user_resp.user.email:
                return user_resp.user.email
        except Exception as e:
            logger.error(f"Failed to resolve email for employee_id {login_identifier}: {e}")

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid login identifier or password",
        )

    @staticmethod
    def _get_redirect_url(role: str) -> str:
        normalized = role.lower()
        if normalized in ["admin", "admin_hr", "hr"]:
            return "/employees"
        return "/employee/dashboard"

    @staticmethod
    def sign_up_user(payload: SignUpRequest) -> SignUpResponse:
        supabase = get_supabase_admin()
        employee_id = generate_login_id(
            supabase,
            payload.company_name,
            payload.first_name,
            payload.last_name,
        )

        try:
            auth_response = supabase.auth.sign_up(
                {
                    "email": payload.email,
                    "password": payload.password,
                    "options": {
                        "data": {
                            "role": payload.role.value,
                            "employee_id": employee_id,
                            "first_name": payload.first_name,
                            "last_name": payload.last_name,
                        }
                    },
                }
            )
        except Exception as e:
            logger.error(f"Supabase Auth sign_up error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Authentication registration failed: {str(e)}",
            )

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User creation failed on authentication provider.",
            )

        user_id = auth_response.user.id
        email_confirmed = bool(auth_response.user.email_confirmed_at)

        initialize_user_records(
            user_id=user_id,
            employee_id=employee_id,
            role=payload.role.value,
            first_name=payload.first_name,
            last_name=payload.last_name,
            phone_number=payload.phone_number,
        )

        return SignUpResponse(
            success=True,
            message="Registration successful. Please verify your email.",
            user_id=user_id,
            email=payload.email,
            role=payload.role.value,
            employee_id=employee_id,
            email_confirmed=email_confirmed,
        )

    @staticmethod
    def sign_in_user(payload: SignInRequest) -> AuthTokenResponse:
        supabase = get_supabase_admin()
        email = AuthService._resolve_email(payload.login_identifier)

        try:
            auth_response = supabase.auth.sign_in_with_password(
                {"email": email, "password": payload.password}
            )
        except Exception as e:
            err_msg = str(e)
            logger.error(f"Sign in failed for {payload.login_identifier}: {err_msg}")
            if "Invalid login credentials" in err_msg or "invalid_grant" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid login identifier or password",
                )
            if "Email not confirmed" in err_msg:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email not verified. Please verify your email before logging in.",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Login failed: {err_msg}",
            )

        if not auth_response.session or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed. No active session created.",
            )

        if not auth_response.user.email_confirmed_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please check your inbox and verify your email.",
            )

        user_id = auth_response.user.id
        role = "employee"
        employee_id = None
        try:
            prof = (
                supabase.table("profiles")
                .select("role, employee_id")
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            if prof.data:
                role = (prof.data.get("role") or "employee").lower()
                employee_id = prof.data.get("employee_id")
        except Exception:
            user_metadata = auth_response.user.user_metadata or {}
            role = (user_metadata.get("role") or "employee").lower()
            employee_id = user_metadata.get("employee_id")

        return AuthTokenResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            token_type="bearer",
            expires_in=auth_response.session.expires_in,
            user_id=user_id,
            email=email,
            role=role,
            employee_id=employee_id,
            redirect_url=AuthService._get_redirect_url(role),
        )

    @staticmethod
    def change_password(user_id: str, email: Optional[str], payload: ChangePasswordRequest) -> ChangePasswordResponse:
        supabase = get_supabase_admin()

        resolved_email = email
        if not resolved_email:
            try:
                user_resp = supabase.auth.admin.get_user_by_id(user_id)
                resolved_email = user_resp.user.email if user_resp and user_resp.user else None
            except Exception as e:
                logger.error(f"Failed to resolve email for password change: {e}")

        if not resolved_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to resolve user email for password verification",
            )

        try:
            supabase.auth.sign_in_with_password(
                {"email": resolved_email, "password": payload.current_password}
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        try:
            supabase.auth.admin.update_user_by_id(
                user_id,
                {"password": payload.new_password},
            )
        except Exception as e:
            logger.error(f"Password update failed for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update password: {str(e)}",
            )

        return ChangePasswordResponse(success=True, message="Password updated successfully")

    @staticmethod
    def get_user_profile(user_id: str) -> UserProfileResponse:
        supabase = get_supabase_admin()
        try:
            prof = supabase.table("profiles").select("*").eq("user_id", user_id).single().execute()
            prof_data = prof.data or {}

            personal_res = supabase.table("personal_info").select("*").eq("user_id", user_id).execute()
            personal_data = personal_res.data[0] if personal_res.data else {}

            bank_res = supabase.table("bank_details").select("*").eq("user_id", user_id).execute()
            bank_data = bank_res.data[0] if bank_res.data else None

            bank_details = None
            if bank_data:
                bank_details = BankDetailsNested(
                    account_number=bank_data.get("account_number"),
                    ifsc_code=bank_data.get("ifsc_code"),
                )

            return UserProfileResponse(
                user_id=str(prof_data.get("user_id")),
                employee_id=str(prof_data.get("employee_id", "")),
                role=str(prof_data.get("role", "employee")),
                first_name=personal_data.get("first_name"),
                last_name=personal_data.get("last_name"),
                phone_number=personal_data.get("phone_number"),
                emergency_contact=personal_data.get("emergency_contact"),
                address=personal_data.get("address"),
                blood_group=personal_data.get("blood_group"),
                dob=str(personal_data.get("dob")) if personal_data.get("dob") else None,
                married=personal_data.get("married"),
                profile_image=personal_data.get("profile_image"),
                bank_details=bank_details,
            )
        except Exception as e:
            logger.error(f"Error fetching profile for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error fetching profile: {str(e)}",
            )
