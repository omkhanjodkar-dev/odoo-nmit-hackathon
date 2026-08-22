from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
import re


class UserRole(str, Enum):
    EMPLOYEE = "employee"
    ADMIN = "admin"


class SignUpRequest(BaseModel):
    company_name: str = Field(..., min_length=2, description="Company name for Login ID generation")
    first_name: str = Field(..., min_length=1, description="First name")
    last_name: str = Field(..., min_length=1, description="Last name")
    email: EmailStr = Field(..., description="Work email address")
    phone_number: Optional[int] = Field(None, description="Contact phone number")
    password: str = Field(..., min_length=8, description="Password meeting security policy")
    confirm_password: str = Field(..., description="Password confirmation")
    role: UserRole = Field(default=UserRole.ADMIN, description="User role: 'employee' or 'admin'")

    @field_validator("password")
    @classmethod
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

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Password and confirm_password do not match")
        return self


class SignInRequest(BaseModel):
    login_identifier: str = Field(..., description="Registered email or Login ID / Employee ID")
    password: str = Field(..., description="Account password")


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., description="Current account password")
    new_password: str = Field(..., min_length=8, description="New password")
    confirm_password: str = Field(..., description="New password confirmation")

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[@$!%*?&#^()_+=\-\[\]{}|;:,.<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirm_password do not match")
        return self


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


class BankDetailsNested(BaseModel):
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None


class UserProfileResponse(BaseModel):
    user_id: str
    employee_id: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[int] = None
    emergency_contact: Optional[int] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    dob: Optional[str] = None
    married: Optional[bool] = None
    profile_image: Optional[str] = None
    bank_details: Optional[BankDetailsNested] = None


class ChangePasswordResponse(BaseModel):
    success: bool
    message: str
