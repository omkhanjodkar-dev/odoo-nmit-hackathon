import logging
from typing import Dict, Any
from app.schemas.payroll import SalaryCalculationInput, SalaryStructureBreakdown

logger = logging.getLogger(__name__)


def compute_salary_breakdown(input_data: SalaryCalculationInput) -> SalaryStructureBreakdown:
    """
    Computes all salary components and deductions in exact compliance with the Excalidraw reference rules:
    - Monthly Wage & Yearly Wage (= Monthly Wage * 12)
    - Basic Salary = basic_pct % of monthly wage (Default 50%)
    - HRA = hra_pct % of basic salary (Default 50%)
    - Standard Allowance = Fixed amount (Default ₹4,167)
    - Performance Bonus = bonus_pct % of basic salary (Default 8.33%)
    - LTA = lta_pct % of basic salary (Default 8.33%)
    - Fixed Allowance = Monthly Wage - (Basic + HRA + Standard Allowance + Bonus + LTA)
    - PF = pf_pct % of basic salary (Default 12%)
    - Professional Tax = Fixed amount (Default ₹200)
    - Gross = Monthly Wage
    - Net = Gross - Total Deductions
    """
    monthly_wage = round(float(input_data.monthly_wage), 2)
    yearly_wage = round(monthly_wage * 12, 2)

    # 1. Basic Salary
    basic_salary = round(monthly_wage * (input_data.basic_pct / 100.0), 2)

    # 2. Component allowances relative to Basic
    hra = round(basic_salary * (input_data.hra_pct / 100.0), 2)
    standard_allowance = round(float(input_data.standard_allowance), 2)
    performance_bonus = round(basic_salary * (input_data.bonus_pct / 100.0), 2)
    lta = round(basic_salary * (input_data.lta_pct / 100.0), 2)

    # 3. Fixed Allowance is remainder
    subtotal_components = basic_salary + hra + standard_allowance + performance_bonus + lta
    fixed_allowance = round(monthly_wage - subtotal_components, 2)
    if fixed_allowance < 0:
        fixed_allowance = 0.0

    gross_salary = monthly_wage

    # 4. Deductions
    provident_fund = round(basic_salary * (input_data.pf_pct / 100.0), 2)
    professional_tax = round(float(input_data.professional_tax), 2)
    total_deductions = round(provident_fund + professional_tax, 2)

    # 5. Net Salary
    net_salary = round(gross_salary - total_deductions, 2)
    if net_salary < 0:
        net_salary = 0.0

    return SalaryStructureBreakdown(
        monthly_wage=monthly_wage,
        yearly_wage=yearly_wage,
        basic_pct=input_data.basic_pct,
        basic_salary=basic_salary,
        hra_pct=input_data.hra_pct,
        hra=hra,
        standard_allowance=standard_allowance,
        bonus_pct=input_data.bonus_pct,
        performance_bonus=performance_bonus,
        lta_pct=input_data.lta_pct,
        lta=lta,
        fixed_allowance=fixed_allowance,
        gross_salary=gross_salary,
        pf_pct=input_data.pf_pct,
        provident_fund=provident_fund,
        professional_tax=professional_tax,
        total_deductions=total_deductions,
        net_salary=net_salary,
    )


def calculate_monthly_payslip(
    salary_breakdown: SalaryStructureBreakdown,
    unpaid_leave_days: int = 0,
    total_working_days: int = 30
) -> Dict[str, Any]:
    """
    Calculates a monthly payslip including proportional Loss of Pay (LOP) for unpaid leave days.
    """
    daily_rate = round(salary_breakdown.monthly_wage / total_working_days, 2) if total_working_days > 0 else 0.0
    lop_deduction = round(daily_rate * unpaid_leave_days, 2)

    total_deductions = round(
        salary_breakdown.provident_fund + salary_breakdown.professional_tax + lop_deduction, 2
    )
    net_pay = round(salary_breakdown.gross_salary - total_deductions, 2)
    if net_pay < 0:
        net_pay = 0.0

    return {
        "monthly_wage": salary_breakdown.monthly_wage,
        "basic_salary": salary_breakdown.basic_salary,
        "hra": salary_breakdown.hra,
        "standard_allowance": salary_breakdown.standard_allowance,
        "performance_bonus": salary_breakdown.performance_bonus,
        "lta": salary_breakdown.lta,
        "fixed_allowance": salary_breakdown.fixed_allowance,
        "gross_salary": salary_breakdown.gross_salary,
        "unpaid_leave_days": unpaid_leave_days,
        "unpaid_leave_deduction": lop_deduction,
        "provident_fund": salary_breakdown.provident_fund,
        "professional_tax": salary_breakdown.professional_tax,
        "total_deductions": total_deductions,
        "net_pay": net_pay,
    }
