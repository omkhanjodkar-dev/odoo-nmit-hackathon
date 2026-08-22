from typing import List, Optional
from pydantic import BaseModel, Field


class LeaveBalanceResponse(BaseModel):
    user_id: str
    sick_leave: float
    paid_leave: int
    unpaid_leave: int


class LeaveApplyRequest(BaseModel):
    leave_type: str = Field(..., description="sick | paid | unpaid")
    reason: str = Field(..., min_length=1)
    start_date: Optional[str] = Field(None, description="Start date (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End date (YYYY-MM-DD)")
    is_half_day: bool = Field(default=False, description="Flag for half-day leave")
    half_day_period: Optional[str] = Field(None, description="first_half | second_half | custom")
    start_time: Optional[str] = Field(None, description="Start time for half-day/custom timing (HH:MM)")
    end_time: Optional[str] = Field(None, description="End time for half-day/custom timing (HH:MM)")
    duration: Optional[float] = Field(None, gt=0, description="Leave duration in days/fractions")
    uploads: Optional[str] = Field(None, description="Path/URL in uploads storage bucket")


class LeaveLogResponse(BaseModel):
    id: str
    user_id: str
    leave_type: str
    reason: str
    approval_status: str
    approved: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[float] = None
    is_half_day: Optional[bool] = False
    half_day_period: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    uploads: Optional[str] = None
    admin_comments: Optional[str] = None
    created_at: Optional[str] = None
    approved_at: Optional[str] = None


class LeavePendingResponse(BaseModel):
    id: str
    user_id: str
    employee_name: str
    employee_id: str
    leave_type: str
    reason: str
    approval_status: str
    approved: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[float] = None
    is_half_day: Optional[bool] = False
    half_day_period: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    uploads: Optional[str] = None
    admin_comments: Optional[str] = None
    created_at: Optional[str] = None


class LeaveApproveRequest(BaseModel):
    duration: Optional[float] = Field(None, gt=0, description="Optional override duration")
    admin_comments: Optional[str] = Field(None, description="Optional admin remarks")


class LeaveRejectRequest(BaseModel):
    remarks: str = Field(..., min_length=1, description="Required rejection reason")


class LeaveActionResponse(BaseModel):
    success: bool
    message: str
    leave: Optional[LeaveLogResponse] = None
    balance: Optional[LeaveBalanceResponse] = None

