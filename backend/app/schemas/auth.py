from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class UserRole(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    ADMIN_HR = "ADMIN_HR"


class SignUpRequest(BaseModel):
    employee_id: str = Field(..., description="Unique Employee ID (e.g. EMP-101)")
    email: EmailStr = Field(..., description="Work email address")
    password: str = Field(..., min_length=8, description="Password meeting security policy")
    role: UserRole = Field(default=UserRole.EMPLOYEE, description="User role: EMPLOYEE or ADMIN_HR")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    phone: Optional[str] = Field(None, description="Contact phone")
    department: Optional[str] = Field(None, description="Department")
    designation: Optional[str] = Field(None, description="Job title / Position")

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
    email: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    avatar_url: Optional[str] = None
    joining_date: Optional[str] = None
