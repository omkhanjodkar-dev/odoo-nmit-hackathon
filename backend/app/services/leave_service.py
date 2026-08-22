import logging
from datetime import date, datetime, time
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from app.core.supabase import get_supabase_admin
from app.schemas.leave import (
    LeaveBalanceResponse,
    LeaveApplyRequest,
    LeaveLogResponse,
    LeavePendingResponse,
    LeaveApproveRequest,
    LeaveRejectRequest,
    LeaveActionResponse,
)
from app.services.fcm_service import send_multicast_fcm_notification, send_fcm_notification

logger = logging.getLogger(__name__)

VALID_LEAVE_TYPES = {"sick", "paid", "unpaid"}
MAX_HALF_DAY_HOURS = 4.5
FULL_DAY_HOURS = 8.0


def _parse_time(time_str: Optional[str]) -> Optional[time]:
    if not time_str:
        return None
    cleaned = time_str.strip()
    for fmt in ("%H:%M", "%H:%M:%S", "%I:%M %p", "%I:%M%p"):
        try:
            return datetime.strptime(cleaned, fmt).time()
        except ValueError:
            pass
    return None


def _validate_and_compute_leave(
    payload: LeaveApplyRequest,
) -> Tuple[str, str, float, bool, Optional[str], Optional[str], Optional[str]]:
    """
    Validates leave dates, half-day timings, and enforces operational limits:
    - Half-day leaves cannot span multiple dates.
    - Half-day timing cannot exceed MAX_HALF_DAY_HOURS (4.5 hours) or a full workday (8.0 hours).
    - Multi-day leaves must have end_date >= start_date.
    Returns: (start_date, end_date, duration, is_half_day, half_day_period, start_time, end_time)
    """
    today_str = date.today().isoformat()
    start_date_str = (payload.start_date or today_str).strip()
    end_date_str = (payload.end_date or start_date_str).strip()

    try:
        d_start = date.fromisoformat(start_date_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid start_date format '{start_date_str}'. Expected YYYY-MM-DD.",
        )

    try:
        d_end = date.fromisoformat(end_date_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid end_date format '{end_date_str}'. Expected YYYY-MM-DD.",
        )

    if payload.is_half_day:
        if d_start != d_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A half-day leave cannot span multiple dates. start_date and end_date must be identical.",
            )

        duration = 0.5
        start_time_val = None
        end_time_val = None

        if payload.start_time and payload.end_time:
            t_start = _parse_time(payload.start_time)
            t_end = _parse_time(payload.end_time)

            if not t_start:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid start_time format '{payload.start_time}'. Expected HH:MM (e.g. 09:30).",
                )
            if not t_end:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid end_time format '{payload.end_time}'. Expected HH:MM (e.g. 13:30).",
                )

            dt_start = datetime.combine(d_start, t_start)
            dt_end = datetime.combine(d_start, t_end)

            if dt_end <= dt_start:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="end_time must be later than start_time.",
                )

            hours = (dt_end - dt_start).total_seconds() / 3600.0

            if hours > MAX_HALF_DAY_HOURS or hours >= FULL_DAY_HOURS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Half-day leave duration ({hours:.1f} hours) exceeds the half-day limit "
                        f"(maximum {MAX_HALF_DAY_HOURS} hours). For a full working day (8 hours), "
                        f"please submit a standard full-day leave request."
                    ),
                )

            start_time_val = t_start.strftime("%H:%M")
            end_time_val = t_end.strftime("%H:%M")
            duration = 0.5

        elif payload.duration is not None:
            if payload.duration > 0.5 or payload.duration <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Half-day duration cannot exceed 0.5 days (4 hours). For longer duration, submit a full-day leave.",
                )
            duration = float(payload.duration)

        half_day_period = payload.half_day_period or (
            "first_half" if (start_time_val and start_time_val < "13:00") else "second_half"
        )

        return (
            d_start.isoformat(),
            d_end.isoformat(),
            duration,
            True,
            half_day_period,
            start_time_val,
            end_time_val,
        )

    else:
        if d_end < d_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date cannot be earlier than start_date.",
            )

        days_count = (d_end - d_start).days + 1
        duration = float(payload.duration) if (payload.duration and payload.duration > 0) else float(days_count)

        return (
            d_start.isoformat(),
            d_end.isoformat(),
            duration,
            False,
            None,
            None,
            None,
        )


def _get_approval_status(row: dict) -> str:
    return row.get("approval_status") or row.get("approved") or "Waiting for approval"


def _to_leave_log_response(row: dict) -> LeaveLogResponse:
    approval_status = _get_approval_status(row)
    admin_comments = row.get("admin_comments") or row.get("remark")

    return LeaveLogResponse(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        leave_type=row.get("leave_type") or "",
        reason=row.get("reason") or "",
        approval_status=approval_status,
        approved=approval_status,
        start_date=str(row.get("start_date")) if row.get("start_date") else None,
        end_date=str(row.get("end_date")) if row.get("end_date") else None,
        duration=float(row["duration"]) if row.get("duration") is not None else 1.0,
        is_half_day=bool(row.get("is_half_day")),
        half_day_period=row.get("half_day_period"),
        start_time=row.get("start_time"),
        end_time=row.get("end_time"),
        uploads=row.get("uploads"),
        admin_comments=admin_comments,
        created_at=str(row.get("created_at")) if row.get("created_at") else None,
        approved_at=str(row.get("approved_at")) if row.get("approved_at") else None,
    )


class LeaveService:

    @staticmethod
    def _notify_user(user_id: str, title: str, body: str) -> None:
        supabase = get_supabase_admin()
        try:
            res = supabase.table("fcm_tokens").select("fcm_token").eq("user_id", user_id).execute()
            tokens = [row["fcm_token"] for row in (res.data or []) if row.get("fcm_token")]
            if not tokens:
                return
            if len(tokens) == 1:
                send_fcm_notification(tokens[0], title, body)
            else:
                send_multicast_fcm_notification(tokens, title, body)
        except Exception as e:
            logger.warning(f"FCM notification failed for user {user_id}: {e}")

    @staticmethod
    def get_my_balance(user_id: str) -> LeaveBalanceResponse:
        supabase = get_supabase_admin()
        try:
            res = supabase.table("leave_balance").select("*").eq("user_id", user_id).single().execute()
            if not res.data:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave balance not found")
            data = res.data
            return LeaveBalanceResponse(
                user_id=user_id,
                sick_leave=float(data.get("sick_leave") or 0),
                paid_leave=int(data.get("paid_leave") or 0),
                unpaid_leave=int(data.get("unpaid_leave") or 0),
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching leave balance for {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch leave balance: {str(e)}",
            )

    @staticmethod
    def apply_leave(user_id: str, payload: LeaveApplyRequest) -> LeaveLogResponse:
        leave_type = payload.leave_type.lower().strip()
        if leave_type not in VALID_LEAVE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid leave_type. Must be one of: {', '.join(sorted(VALID_LEAVE_TYPES))}",
            )

        start_date_val, end_date_val, duration_val, is_half_day_val, half_day_period_val, start_time_val, end_time_val = (
            _validate_and_compute_leave(payload)
        )

        supabase = get_supabase_admin()
        record = {
            "user_id": user_id,
            "leave_type": leave_type,
            "reason": payload.reason,
            "approval_status": "Waiting for approval",
            "start_date": start_date_val,
            "end_date": end_date_val,
            "duration": duration_val,
            "is_half_day": is_half_day_val,
            "half_day_period": half_day_period_val,
            "start_time": start_time_val,
            "end_time": end_time_val,
        }
        if payload.uploads:
            record["uploads"] = payload.uploads

        try:
            res = supabase.table("leave_log").insert(record).execute()
            row = (res.data or [None])[0]
            if not row:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create leave request")
            return _to_leave_log_response(row)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to apply leave for {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to apply leave: {str(e)}",
            )

    @staticmethod
    def get_pending_requests() -> List[LeavePendingResponse]:
        supabase = get_supabase_admin()
        try:
            res = (
                supabase.table("leave_log")
                .select("*")
                .eq("approval_status", "Waiting for approval")
                .order("created_at", desc=False)
                .execute()
            )
            leaves = res.data or []
            if not leaves:
                return []

            user_ids = list({row["user_id"] for row in leaves if row.get("user_id")})
            profiles_res = supabase.table("profiles").select("user_id, employee_id").in_("user_id", user_ids).execute()
            personal_res = supabase.table("personal_info").select("user_id, first_name, last_name").in_("user_id", user_ids).execute()

            profile_map = {p["user_id"]: p for p in (profiles_res.data or [])}
            personal_map = {p["user_id"]: p for p in (personal_res.data or [])}

            pending: List[LeavePendingResponse] = []
            for row in leaves:
                uid = row["user_id"]
                prof = profile_map.get(uid, {})
                personal = personal_map.get(uid, {})
                name = f"{personal.get('first_name', '')} {personal.get('last_name', '')}".strip()
                approval_status = _get_approval_status(row)

                pending.append(
                    LeavePendingResponse(
                        id=str(row["id"]),
                        user_id=str(uid),
                        employee_name=name or "Unknown",
                        employee_id=prof.get("employee_id") or "",
                        leave_type=row.get("leave_type") or "",
                        reason=row.get("reason") or "",
                        approval_status=approval_status,
                        approved=approval_status,
                        start_date=str(row.get("start_date")) if row.get("start_date") else None,
                        end_date=str(row.get("end_date")) if row.get("end_date") else None,
                        duration=float(row["duration"]) if row.get("duration") is not None else 1.0,
                        is_half_day=bool(row.get("is_half_day")),
                        half_day_period=row.get("half_day_period"),
                        start_time=row.get("start_time"),
                        end_time=row.get("end_time"),
                        uploads=row.get("uploads"),
                        admin_comments=row.get("admin_comments") or row.get("remark"),
                        created_at=str(row.get("created_at")) if row.get("created_at") else None,
                    )
                )
            return pending
        except Exception as e:
            logger.error(f"Failed to fetch pending leaves: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch pending leaves: {str(e)}",
            )

    @staticmethod
    def approve_leave(leave_id: str, payload: LeaveApproveRequest) -> LeaveActionResponse:
        """
        Approves a pending leave via `approve_leave_request` RPC, setting
        approval_status to Approved, recording approved_at, and updating leave balance.
        """
        supabase = get_supabase_admin()

        leave_res = supabase.table("leave_log").select("*").eq("id", leave_id).single().execute()
        if not leave_res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

        leave_row = leave_res.data
        user_id = leave_row["user_id"]
        leave_type = leave_row.get("leave_type") or ""

        if _get_approval_status(leave_row) == "Approved":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Leave request is already approved")

        rpc_duration = payload.duration or leave_row.get("duration") or 1.0

        try:
            supabase.rpc(
                "approve_leave_request",
                {
                    "p_leave_id": leave_id,
                    "p_duration": rpc_duration,
                    "p_admin_comments": payload.admin_comments,
                },
            ).execute()
        except Exception as e:
            err = str(e)
            logger.error(f"RPC approve_leave_request failed for {leave_id}: {err}")
            if "already approved" in err.lower():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Leave request is already approved")
            if "not found" in err.lower():
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to approve leave: {err}",
            )

        updated = supabase.table("leave_log").select("*").eq("id", leave_id).single().execute()
        balance = LeaveService.get_my_balance(str(user_id))

        LeaveService._notify_user(
            str(user_id),
            "Leave Request Approved",
            f"Your leave request for {leave_type} has been approved.",
        )

        row = updated.data or leave_row
        return LeaveActionResponse(
            success=True,
            message="Leave request approved successfully",
            leave=_to_leave_log_response(row),
            balance=balance,
        )

    @staticmethod
    def reject_leave(leave_id: str, payload: LeaveRejectRequest) -> LeaveActionResponse:
        supabase = get_supabase_admin()

        leave_res = supabase.table("leave_log").select("*").eq("id", leave_id).single().execute()
        if not leave_res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

        leave_row = leave_res.data
        current_status = _get_approval_status(leave_row)
        if current_status == "Approved":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reject an approved leave")
        if current_status == "Rejected":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Leave request is already rejected")

        user_id = leave_row["user_id"]
        leave_type = leave_row.get("leave_type") or ""
        remarks = payload.remarks.strip()

        try:
            res = (
                supabase.table("leave_log")
                .update(
                    {
                        "approval_status": "Rejected",
                        "admin_comments": remarks,
                        "remark": remarks,
                    }
                )
                .eq("id", leave_id)
                .execute()
            )
            row = (res.data or [leave_row])[0]
        except Exception as e:
            logger.error(f"Failed to reject leave {leave_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to reject leave: {str(e)}",
            )

        LeaveService._notify_user(
            str(user_id),
            "Leave Request Rejected",
            f"Your leave request for {leave_type} was rejected. Remarks: {remarks}",
        )

        return LeaveActionResponse(
            success=True,
            message=f"Leave request rejected. Remarks: {remarks}",
            leave=_to_leave_log_response(row),
        )
