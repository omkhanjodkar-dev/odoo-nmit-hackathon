import logging
from typing import Dict, Any
from app.schemas.payroll import SalaryStructureBreakdown

logger = logging.getLogger(__name__)


def compute_salary_breakdown(base_pay: float) -> SalaryStructureBreakdown:
    """
    Computes all salary components and deductions from base_pay in exact compliance with the Excalidraw reference:
    - Monthly Wage = base_pay
    - Yearly Wage = base_pay * 12
    - Basic Salary = 50% of base_pay
    - HRA = 50% of Basic Salary
    - Standard Allowance = Fixed ₹4,167
    - Performance Bonus = 8.33% of Basic Salary
    - LTA = 8.33% of Basic Salary
    - Fixed Allowance = base_pay - (Basic + HRA + Standard Allowance + Bonus + LTA)
    - PF = 12% of Basic Salary
    - Professional Tax = Fixed ₹200
    - Gross = base_pay
    - Total Deductions = PF + PT
    - Net Salary = Gross - Total Deductions
    """
    monthly_wage = round(float(base_pay), 2)
    yearly_wage = round(monthly_wage * 12, 2)

    # 1. Basic Salary (50% of monthly wage)
    basic_salary = round(monthly_wage * 0.50, 2)

    # 2. Allowances
    hra = round(basic_salary * 0.50, 2)
    standard_allowance = 4167.00
    performance_bonus = round(basic_salary * 0.0833, 2)
    lta = round(basic_salary * 0.0833, 2)

    # 3. Fixed Allowance (remainder)
    subtotal_components = basic_salary + hra + standard_allowance + performance_bonus + lta
    fixed_allowance = round(monthly_wage - subtotal_components, 2)
    if fixed_allowance < 0:
        fixed_allowance = 0.0

    gross_salary = monthly_wage

    # 4. Deductions
    provident_fund = round(basic_salary * 0.12, 2)
    professional_tax = 200.00
    total_deductions = round(provident_fund + professional_tax, 2)

    # 5. Net Salary
    net_salary = round(gross_salary - total_deductions, 2)
    if net_salary < 0:
        net_salary = 0.0

    return SalaryStructureBreakdown(
        monthly_wage=monthly_wage,
        yearly_wage=yearly_wage,
        basic_pct=50.00,
        basic_salary=basic_salary,
        hra_pct=50.00,
        hra=hra,
        standard_allowance=standard_allowance,
        bonus_pct=8.33,
        performance_bonus=performance_bonus,
        lta_pct=8.33,
        lta=lta,
        fixed_allowance=fixed_allowance,
        gross_salary=gross_salary,
        pf_pct=12.00,
        provident_fund=provident_fund,
        professional_tax=professional_tax,
        total_deductions=total_deductions,
        net_salary=net_salary,
    )


def calculate_monthly_payslip(
    base_pay: float,
    unpaid_leave_days: int = 0,
    total_working_days: int = 30
) -> Dict[str, Any]:
    """
    Calculates payslip dynamically from base_pay and unpaid leave count from leave_log.
    """
    breakdown = compute_salary_breakdown(base_pay)
    daily_rate = round(breakdown.monthly_wage / total_working_days, 2) if total_working_days > 0 else 0.0
    lop_deduction = round(daily_rate * unpaid_leave_days, 2)

    total_deductions = round(
        breakdown.provident_fund + breakdown.professional_tax + lop_deduction, 2
    )
    net_pay = round(breakdown.gross_salary - total_deductions, 2)
    if net_pay < 0:
        net_pay = 0.0

    return {
        "monthly_wage": breakdown.monthly_wage,
        "basic_salary": breakdown.basic_salary,
        "hra": breakdown.hra,
        "standard_allowance": breakdown.standard_allowance,
        "performance_bonus": breakdown.performance_bonus,
        "lta": breakdown.lta,
        "fixed_allowance": breakdown.fixed_allowance,
        "gross_salary": breakdown.gross_salary,
        "unpaid_leave_days": unpaid_leave_days,
        "unpaid_leave_deduction": lop_deduction,
        "provident_fund": breakdown.provident_fund,
        "professional_tax": breakdown.professional_tax,
        "total_deductions": total_deductions,
        "net_pay": net_pay,
    }
