from datetime import date
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class EmployeeCardResponse(BaseModel):
    user_id: str
    employee_id: str
    first_name: str
    last_name: str
    role: str
    profile_image: Optional[str] = None
    phone_number: Optional[int] = None
    work_status: str
    status_badge_color: str


class AdminOnboardRequest(BaseModel):
    company_name: str = Field(..., min_length=2)
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    phone_number: Optional[int] = None
    dob: Optional[date] = None
    blood_group: Optional[str] = None
    base_pay: float = Field(default=50000.00, ge=0)


class AdminOnboardResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    employee_id: str
    email: str
    initial_password: str
    role: str = "employee"


class PersonalInfoUpdateRequest(BaseModel):
    address: Optional[str] = None
    phone_number: Optional[int] = None
    emergency_contact: Optional[int] = None
    blood_group: Optional[str] = None
    dob: Optional[date] = None
    married: Optional[bool] = None
    profile_image: Optional[str] = None


class BankDetailsUpdateRequest(BaseModel):
    account_number: str
    ifsc_code: str


class PersonalInfoResponse(BaseModel):
    user_id: str
    address: Optional[str] = None
    phone_number: Optional[int] = None
    emergency_contact: Optional[int] = None
    blood_group: Optional[str] = None
    dob: Optional[str] = None
    married: Optional[bool] = None
    profile_image: Optional[str] = None


class BankDetailsResponse(BaseModel):
    user_id: str
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
