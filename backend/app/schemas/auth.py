from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class UserRole(str, Enum):
    EMPLOYEE = "employee"
    ADMIN_HR = "admin"


class SignUpRequest(BaseModel):
    employee_id: str = Field(..., description="Unique Employee ID (matches public.profiles.employee_id)")
    email: EmailStr = Field(..., description="Work email address")
    password: str = Field(..., min_length=8, description="Password meeting security policy")
    role: UserRole = Field(default=UserRole.EMPLOYEE, description="User role: 'employee' or 'admin'")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    phone: Optional[str] = Field(None, description="Contact phone (numeric)")

    @field_validator("password")
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[@$!%*?&#^()_+=\-\[\]{}|;:,.<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class SignInRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")


class AuthTokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: Optional[int] = None
    user_id: str
    email: str
    role: str
    employee_id: Optional[str] = None
    redirect_url: str


class SignUpResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    email: str
    role: str
    employee_id: str
    email_confirmed: bool = False


class UserProfileResponse(BaseModel):
    id: str
    user_id: str
    employee_id: str
    email: Optional[str] = ""
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    blood_group: Optional[str] = None
    dob: Optional[str] = None
    married: Optional[bool] = None
    emergency_contact: Optional[str] = None
