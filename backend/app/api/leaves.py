from typing import List
from fastapi import APIRouter, Depends, status
from app.core.auth import get_current_user, require_role, AuthenticatedUser
from app.schemas.leave import (
    LeaveBalanceResponse,
    LeaveApplyRequest,
    LeaveLogResponse,
    LeavePendingResponse,
    LeaveApproveRequest,
    LeaveRejectRequest,
    LeaveActionResponse,
)
from app.services.leave_service import LeaveService

router = APIRouter(prefix="/leaves", tags=["Time-Off & Leave Management"])


@router.get("/my-balance", response_model=LeaveBalanceResponse)
async def my_leave_balance(current_user: AuthenticatedUser = Depends(get_current_user)):
    return LeaveService.get_my_balance(current_user.id)


@router.post("/apply", response_model=LeaveLogResponse, status_code=status.HTTP_201_CREATED)
async def apply_leave(
    payload: LeaveApplyRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    return LeaveService.apply_leave(current_user.id, payload)


@router.get("/pending", response_model=List[LeavePendingResponse])
async def pending_leaves(admin_user: AuthenticatedUser = Depends(require_role("admin"))):
    return LeaveService.get_pending_requests()


@router.post("/{leave_id}/approve", response_model=LeaveActionResponse)
async def approve_leave(
    leave_id: str,
    payload: LeaveApproveRequest = LeaveApproveRequest(),
    admin_user: AuthenticatedUser = Depends(require_role("admin")),
):
    return LeaveService.approve_leave(leave_id, payload)


@router.post("/{leave_id}/reject", response_model=LeaveActionResponse)
async def reject_leave(
    leave_id: str,
    payload: LeaveRejectRequest,
    admin_user: AuthenticatedUser = Depends(require_role("admin")),
):
    return LeaveService.reject_leave(leave_id, payload)
