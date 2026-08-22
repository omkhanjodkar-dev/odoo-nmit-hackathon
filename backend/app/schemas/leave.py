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
    duration: float = Field(default=1.0, gt=0)
    uploads: Optional[str] = Field(None, description="Path/URL in uploads storage bucket")


class LeaveLogResponse(BaseModel):
    id: str
    user_id: str
    leave_type: str
    reason: str
    approval_status: str
    remarks: Optional[str] = None
    uploads: Optional[str] = None
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
    uploads: Optional[str] = None
    created_at: Optional[str] = None


class LeaveApproveRequest(BaseModel):
    duration: float = Field(..., gt=0)


class LeaveRejectRequest(BaseModel):
    remarks: str = Field(..., min_length=1)


class LeaveActionResponse(BaseModel):
    success: bool
    message: str
    leave: Optional[LeaveLogResponse] = None
    balance: Optional[LeaveBalanceResponse] = None
