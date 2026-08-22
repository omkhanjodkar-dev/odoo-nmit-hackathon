import logging
from typing import Optional
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin

logger = logging.getLogger(__name__)


def initialize_user_records(
    user_id: str,
    employee_id: str,
    role: str,
    first_name: str = "",
    last_name: str = "",
    phone_number: Optional[int] = None,
    address: str = "",
    dob: Optional[str] = None,
    blood_group: Optional[str] = None,
    base_pay: float = 50000.00,
) -> None:
    supabase = get_supabase_admin()

    try:
        supabase.table("profiles").upsert(
            {
                "user_id": user_id,
                "employee_id": employee_id,
                "role": role,
                "updated_at": "now()",
            },
            on_conflict="user_id",
        ).execute()
    except Exception as e:
        logger.error(f"Failed to create public.profiles record: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {e}",
        )

    personal_payload = {
        "user_id": user_id,
        "first_name": first_name or "Employee",
        "last_name": last_name or "",
        "phone_number": phone_number,
        "address": address or "",
        "dob": dob,
        "blood_group": blood_group,
    }
    try:
        existing = supabase.table("personal_info").select("id").eq("user_id", user_id).execute()
        if existing.data:
            supabase.table("personal_info").update(personal_payload).eq("user_id", user_id).execute()
        else:
            supabase.table("personal_info").insert(personal_payload).execute()
    except Exception as e:
        logger.warning(f"Personal info initialization warning: {e}")

    try:
        supabase.table("leave_balance").upsert(
            {
                "user_id": user_id,
                "sick_leave": 12.0,
                "paid_leave": 0,
                "unpaid_leave": 0,
            },
            on_conflict="user_id",
        ).execute()
    except Exception as e:
        logger.warning(f"Leave balance initialization warning: {e}")

    try:
        supabase.table("salary_structures").upsert(
            {
                "user_id": user_id,
                "base_pay": base_pay,
                "updated_at": "now()",
            },
            on_conflict="user_id",
        ).execute()
    except Exception as e:
        logger.warning(f"Salary structure initialization warning: {e}")
