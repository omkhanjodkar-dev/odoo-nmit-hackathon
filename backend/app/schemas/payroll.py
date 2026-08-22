from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


class SalaryCalculationInput(BaseModel):
    monthly_wage: float = Field(..., ge=0, description="Monthly wage (e.g. 50000.00)")
    basic_pct: float = Field(50.00, ge=0, le=100, description="Basic salary % of wage (Default: 50%)")
    hra_pct: float = Field(50.00, ge=0, le=100, description="HRA % of basic (Default: 50%)")
    standard_allowance: float = Field(4167.00, ge=0, description="Fixed monthly standard allowance")
    bonus_pct: float = Field(8.33, ge=0, le=100, description="Performance bonus % of basic (Default: 8.33%)")
    lta_pct: float = Field(8.33, ge=0, le=100, description="Leave Travel Allowance % of basic (Default: 8.33%)")
    pf_pct: float = Field(12.00, ge=0, le=100, description="Provident fund % of basic (Default: 12.00%)")
    professional_tax: float = Field(200.00, ge=0, description="Fixed professional tax deduction")


class SalaryStructureBreakdown(BaseModel):
    monthly_wage: float
    yearly_wage: float
    basic_pct: float
    basic_salary: float
    hra_pct: float
    hra: float
    standard_allowance: float
    bonus_pct: float
    performance_bonus: float
    lta_pct: float
    lta: float
    fixed_allowance: float
    gross_salary: float
    pf_pct: float
    provident_fund: float
    professional_tax: float
    total_deductions: float
    net_salary: float


class SalaryStructureCreateOrUpdate(SalaryCalculationInput):
    currency: Optional[str] = "INR"
    effective_from: Optional[date] = None


class SalaryStructureResponse(SalaryStructureBreakdown):
    id: Optional[str] = None
    user_id: str
    currency: str = "INR"
    effective_from: Optional[date] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class GeneratePayslipsRequest(BaseModel):
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    year: int = Field(..., ge=2020, description="Year (e.g. 2026)")
    total_working_days: int = Field(default=30, ge=1, le=31, description="Total days in month for LOP calculation")
    user_ids: Optional[List[str]] = Field(None, description="Optional list of specific user IDs (or all if omitted)")


class PayslipResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    month: int
    year: int
    monthly_wage: float
    basic_salary: float
    hra: float
    standard_allowance: float
    performance_bonus: float
    lta: float
    fixed_allowance: float
    gross_salary: float
    unpaid_leave_days: int
    unpaid_leave_deduction: float
    provident_fund: float
    professional_tax: float
    total_deductions: float
    net_pay: float
    status: str = "GENERATED"
    created_at: Optional[str] = None
