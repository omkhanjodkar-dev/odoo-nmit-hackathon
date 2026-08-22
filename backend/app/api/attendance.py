from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.core.auth import get_current_user, require_role, AuthenticatedUser
from app.schemas.attendance import (
    AttendanceCheckInResponse,
    AttendanceCheckOutResponse,
    AttendanceStatusResponse,
    AttendanceMyLogsResponse,
    AttendanceAdminRow,
)
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/check-in", response_model=AttendanceCheckInResponse)
async def check_in(current_user: AuthenticatedUser = Depends(get_current_user)):
    return AttendanceService.check_in(current_user.id)


@router.post("/check-out", response_model=AttendanceCheckOutResponse)
async def check_out(current_user: AuthenticatedUser = Depends(get_current_user)):
    return AttendanceService.check_out(current_user.id)


@router.get("/status", response_model=AttendanceStatusResponse)
async def attendance_status(current_user: AuthenticatedUser = Depends(get_current_user)):
    return AttendanceService.get_status(current_user.id)


@router.get("/my-logs", response_model=AttendanceMyLogsResponse)
async def my_attendance_logs(current_user: AuthenticatedUser = Depends(get_current_user)):
    return AttendanceService.get_my_logs(current_user.id)


@router.get("/all", response_model=List[AttendanceAdminRow])
async def all_attendance(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    search: str = Query("", description="Search by employee name or ID"),
    admin_user: AuthenticatedUser = Depends(require_role("admin")),
):
    return AttendanceService.get_all_attendance(target_date=date, search=search)
