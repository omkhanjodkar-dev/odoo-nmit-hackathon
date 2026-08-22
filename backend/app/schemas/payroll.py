from typing import Optional, List
from pydantic import BaseModel, Field


class SalaryStructureUpdate(BaseModel):
    base_pay: float = Field(..., ge=0, description="Monthly base pay / gross salary (matches public.salary_structures.base_pay)")


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


class SalaryStructureResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    base_pay: float
    breakdown: SalaryStructureBreakdown
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class GeneratePayslipRequest(BaseModel):
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    year: int = Field(..., ge=2020, description="Year (e.g. 2026)")
    total_working_days: int = Field(default=30, ge=1, le=31)
    user_ids: Optional[List[str]] = Field(None, description="Optional list of specific user IDs")


class PayslipResponse(BaseModel):
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
