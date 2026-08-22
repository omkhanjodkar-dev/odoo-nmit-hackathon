import logging
import secrets
import string
from datetime import date
from typing import List, Optional
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin
from app.schemas.employee import (
    EmployeeCardResponse,
    AdminOnboardRequest,
    AdminOnboardResponse,
    PersonalInfoUpdateRequest,
    BankDetailsUpdateRequest,
    PersonalInfoResponse,
    BankDetailsResponse,
)
from app.utils.login_id import generate_login_id
from app.services.user_provisioning import initialize_user_records
from app.services.attendance_service import AttendanceService

logger = logging.getLogger(__name__)

WORK_STATUS_PRESENT = "PRESENT"
WORK_STATUS_ON_LEAVE = "ON_LEAVE"
WORK_STATUS_ABSENT = "ABSENT"


def _generate_initial_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "@$!%*?&#"
    while True:
        password = "".join(secrets.choice(alphabet) for _ in range(length))
        if (
            any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
            and any(c in "@$!%*?&#" for c in password)
        ):
            return password


class EmployeeService:

    @staticmethod
    def _today_iso() -> str:
        return date.today().isoformat()

    @staticmethod
    def _resolve_work_status(
        supabase,
        user_id: str,
        checked_in_user_ids: set,
        on_leave_user_ids: set,
    ) -> tuple[str, str]:
        if user_id in on_leave_user_ids:
            return WORK_STATUS_ON_LEAVE, "BLUE_PLANE"
        if user_id in checked_in_user_ids:
            return WORK_STATUS_PRESENT, "GREEN"
        return WORK_STATUS_ABSENT, "YELLOW"

    @staticmethod
    def list_employees() -> List[EmployeeCardResponse]:
        supabase = get_supabase_admin()
        today = EmployeeService._today_iso()

        profiles_res = supabase.table("profiles").select("user_id, employee_id, role").execute()
        profiles = profiles_res.data or []

        personal_res = supabase.table("personal_info").select(
            "user_id, first_name, last_name, profile_image, phone_number"
        ).execute()
        personal_map = {row["user_id"]: row for row in (personal_res.data or [])}

        checked_in_user_ids = AttendanceService.get_users_present_today()

        on_leave_user_ids: set = set()
        try:
            leave_res = (
                supabase.table("leave_log")
                .select("user_id")
                .eq("approval_status", "Approved")
                .gte("created_at", f"{today}T00:00:00")
                .lte("created_at", f"{today}T23:59:59")
                .execute()
            )
            on_leave_user_ids = {row["user_id"] for row in (leave_res.data or [])}
        except Exception as e:
            logger.warning(f"Leave lookup warning: {e}")

        cards: List[EmployeeCardResponse] = []
        for prof in profiles:
            user_id = prof["user_id"]
            personal = personal_map.get(user_id, {})
            work_status, badge_color = EmployeeService._resolve_work_status(
                supabase, user_id, checked_in_user_ids, on_leave_user_ids
            )
            cards.append(
                EmployeeCardResponse(
                    user_id=str(user_id),
                    employee_id=prof.get("employee_id", ""),
                    first_name=personal.get("first_name") or "Unknown",
                    last_name=personal.get("last_name") or "",
                    role=(prof.get("role") or "employee").lower(),
                    profile_image=personal.get("profile_image"),
                    phone_number=personal.get("phone_number"),
                    work_status=work_status,
                    status_badge_color=badge_color,
                )
            )
        return cards

    @staticmethod
    def onboard_employee(payload: AdminOnboardRequest) -> AdminOnboardResponse:
        supabase = get_supabase_admin()
        employee_id = generate_login_id(
            supabase,
            payload.company_name,
            payload.first_name,
            payload.last_name,
        )
        initial_password = _generate_initial_password()

        try:
            auth_response = supabase.auth.admin.create_user(
                {
                    "email": payload.email,
                    "password": initial_password,
                    "email_confirm": True,
                    "user_metadata": {
                        "role": "employee",
                        "employee_id": employee_id,
                        "first_name": payload.first_name,
                        "last_name": payload.last_name,
                    },
                }
            )
        except Exception as e:
            logger.error(f"Employee onboarding auth error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create employee account: {str(e)}",
            )

        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee account creation failed.",
            )

        user_id = auth_response.user.id
        initialize_user_records(
            user_id=user_id,
            employee_id=employee_id,
            role="employee",
            first_name=payload.first_name,
            last_name=payload.last_name,
            phone_number=payload.phone_number,
            dob=str(payload.dob) if payload.dob else None,
            blood_group=payload.blood_group,
            base_pay=payload.base_pay,
        )

        return AdminOnboardResponse(
            success=True,
            message="Employee onboarded successfully",
            user_id=user_id,
            employee_id=employee_id,
            email=payload.email,
            initial_password=initial_password,
            role="employee",
        )

    @staticmethod
    def update_personal_info(user_id: str, payload: PersonalInfoUpdateRequest) -> PersonalInfoResponse:
        supabase = get_supabase_admin()
        update_data = payload.model_dump(exclude_unset=True)
        if "dob" in update_data and update_data["dob"] is not None:
            update_data["dob"] = str(update_data["dob"])

        if not update_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

        try:
            existing = supabase.table("personal_info").select("id").eq("user_id", user_id).execute()
            if existing.data:
                res = supabase.table("personal_info").update(update_data).eq("user_id", user_id).execute()
            else:
                update_data["user_id"] = user_id
                res = supabase.table("personal_info").insert(update_data).execute()

            row = (res.data or [{}])[0]
            return PersonalInfoResponse(
                user_id=user_id,
                address=row.get("address"),
                phone_number=row.get("phone_number"),
                emergency_contact=row.get("emergency_contact"),
                blood_group=row.get("blood_group"),
                dob=str(row.get("dob")) if row.get("dob") else None,
                married=row.get("married"),
                profile_image=row.get("profile_image"),
            )
        except Exception as e:
            logger.error(f"Failed to update personal info for {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update personal info: {str(e)}",
            )

    @staticmethod
    def update_bank_details(user_id: str, payload: BankDetailsUpdateRequest) -> BankDetailsResponse:
        supabase = get_supabase_admin()
        record = {
            "user_id": user_id,
            "account_number": payload.account_number,
            "ifsc_code": payload.ifsc_code,
        }
        try:
            res = supabase.table("bank_details").upsert(record, on_conflict="user_id").execute()
            row = (res.data or [record])[0]
            return BankDetailsResponse(
                user_id=user_id,
                account_number=row.get("account_number"),
                ifsc_code=row.get("ifsc_code"),
            )
        except Exception as e:
            logger.error(f"Failed to update bank details for {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update bank details: {str(e)}",
            )

    @staticmethod
    def assert_self_or_admin(current_user_id: str, target_user_id: str, current_role: str) -> None:
        if current_user_id == target_user_id:
            return
        if current_role.lower() in ["admin", "admin_hr", "hr"]:
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
