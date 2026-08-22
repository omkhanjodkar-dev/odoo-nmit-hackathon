from typing import List, Optional
from pydantic import BaseModel, Field


class AttendanceCheckInResponse(BaseModel):
    success: bool
    message: str
    check_in_time: str
    status_color: str = "GREEN"


class AttendanceCheckOutResponse(BaseModel):
    success: bool
    message: str
    check_out_time: str
    work_hours: float
    regular_hours: float
    extra_hours: float
    status_color: str = "RED"


class AttendanceStatusResponse(BaseModel):
    is_checked_in: bool
    check_in_time: Optional[str] = None
    elapsed_seconds: int = 0
    display_text: str
    status_color: str


class AttendanceDailyLog(BaseModel):
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    work_hours: float = 0.0
    regular_hours: float = 0.0
    extra_hours: float = 0.0


class AttendanceMyLogsResponse(BaseModel):
    days_present: int
    leaves_count: int
    total_working_days: int
    logs: List[AttendanceDailyLog]


class AttendanceAdminRow(BaseModel):
    user_id: str
    employee_name: str
    employee_id: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    work_hours: float = 0.0
    extra_hours: float = 0.0
