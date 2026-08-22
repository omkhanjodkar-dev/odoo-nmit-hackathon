import logging
from typing import List, Optional
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
REJECTION_REMARK_SEPARATOR = "\n\n--- Admin rejection remark ---\n"


def _get_approval_status(row: dict) -> str:
    return row.get("approval_status") or row.get("approved") or "Waiting for approval"


def _split_reason_and_remark(reason: str) -> tuple[str, Optional[str]]:
    if REJECTION_REMARK_SEPARATOR in reason:
        employee_reason, remark = reason.split(REJECTION_REMARK_SEPARATOR, 1)
        return employee_reason.strip(), remark.strip()
    return reason, None


def _attach_rejection_remark(reason: str, remarks: str) -> str:
    base_reason, _ = _split_reason_and_remark(reason)
    return f"{base_reason}{REJECTION_REMARK_SEPARATOR}{remarks.strip()}"


def _to_leave_log_response(row: dict) -> LeaveLogResponse:
    raw_reason = row.get("reason") or ""
    employee_reason, parsed_remark = _split_reason_and_remark(raw_reason)
    approval_status = _get_approval_status(row)

    return LeaveLogResponse(
        id=str(row["id"]),
        user_id=str(row["user_id"]),
        leave_type=row.get("leave_type") or "",
        reason=employee_reason,
        approval_status=approval_status,
        remarks=parsed_remark if approval_status == "Rejected" else None,
        uploads=row.get("uploads"),
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

        supabase = get_supabase_admin()
        record = {
            "user_id": user_id,
            "leave_type": leave_type,
            "reason": payload.reason,
            "approval_status": "Waiting for approval",
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
                employee_reason, _ = _split_reason_and_remark(row.get("reason") or "")
                pending.append(
                    LeavePendingResponse(
                        id=str(row["id"]),
                        user_id=str(uid),
                        employee_name=name or "Unknown",
                        employee_id=prof.get("employee_id") or "",
                        leave_type=row.get("leave_type") or "",
                        reason=employee_reason,
                        approval_status=_get_approval_status(row),
                        uploads=row.get("uploads"),
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
        Approves a pending leave via `approve_leave_request` RPC, which sets
        approval_status to Approved and approved_at to now().
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

        try:
            supabase.rpc(
                "approve_leave_request",
                {"p_leave_id": leave_id, "p_duration": payload.duration},
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
                        "reason": _attach_rejection_remark(leave_row.get("reason") or "", remarks),
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
