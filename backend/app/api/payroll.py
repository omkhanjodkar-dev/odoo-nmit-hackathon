import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user, require_role, AuthenticatedUser
from app.core.supabase import get_supabase_admin
from app.schemas.payroll import (
    SalaryCalculationInput,
    SalaryStructureBreakdown,
    SalaryStructureCreateOrUpdate,
    SalaryStructureResponse,
    GeneratePayslipsRequest,
    PayslipResponse,
)
from app.services.payroll_service import compute_salary_breakdown, calculate_monthly_payslip

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/payroll", tags=["Payroll & Salary Management"])


# ==========================================
# 3.6.1 Employee Payroll View (Read-Only)
# ==========================================

@router.get("/my-salary", response_model=SalaryStructureResponse)
async def get_my_salary(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    3.6.1 Employee View: Read-only breakdown of the currently logged-in employee's salary structure.
    """
    supabase = get_supabase_admin()
    try:
        res = supabase.table("salary_structures").select("*").eq("user_id", current_user.id).single().execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Salary structure not found for current user"
            )
        return SalaryStructureResponse(**res.data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching salary for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error fetching salary structure: {str(e)}"
        )


@router.get("/my-payslips", response_model=List[PayslipResponse])
async def get_my_payslips(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    3.6.1 Employee View: View history of generated monthly payslips for current employee.
    """
    supabase = get_supabase_admin()
    try:
        res = (
            supabase.table("payslips")
            .select("*")
            .eq("user_id", current_user.id)
            .order("year", desc=True)
            .order("month", desc=True)
            .execute()
        )
        return [PayslipResponse(**row) for row in (res.data or [])]
    except Exception as e:
        logger.error(f"Error fetching payslips for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error fetching payslips: {str(e)}"
        )


# ==========================================
# 3.6.2 Admin Payroll Control
# ==========================================

@router.post("/calculate-preview", response_model=SalaryStructureBreakdown)
async def preview_salary_calculation(
    payload: SalaryCalculationInput,
    admin_user: AuthenticatedUser = Depends(require_role("ADMIN_HR")),
):
    """
    Admin tool to preview dynamic auto-calculation of salary components and deductions before saving.
    """
    return compute_salary_breakdown(payload)


@router.get("/all", response_model=List[SalaryStructureResponse])
async def get_all_salaries(admin_user: AuthenticatedUser = Depends(require_role("ADMIN_HR"))):
    """
    3.6.2 Admin Control: View salary structures of all employees across the organization.
    """
    supabase = get_supabase_admin()
    try:
        res = supabase.table("salary_structures").select("*").execute()
        return [SalaryStructureResponse(**row) for row in (res.data or [])]
    except Exception as e:
        logger.error(f"Error fetching all salary structures: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/employee/{user_id}", response_model=SalaryStructureResponse)
async def get_employee_salary(
    user_id: str,
    admin_user: AuthenticatedUser = Depends(require_role("ADMIN_HR")),
):
    """
    3.6.2 Admin Control: View salary structure for a specific employee.
    """
    supabase = get_supabase_admin()
    try:
        res = supabase.table("salary_structures").select("*").eq("user_id", user_id).single().execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Salary structure not found for user {user_id}"
            )
        return SalaryStructureResponse(**res.data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching salary for employee {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.put("/employee/{user_id}", response_model=SalaryStructureResponse)
async def update_employee_salary(
    user_id: str,
    payload: SalaryStructureCreateOrUpdate,
    admin_user: AuthenticatedUser = Depends(require_role("ADMIN_HR")),
):
    """
    3.6.2 Admin Control: Update an employee's salary structure.
    Automatically recalculates Basic, HRA, Fixed Allowance, PF, PT, and Net Pay ensuring payroll accuracy.
    """
    # 1. Compute exact mathematical breakdown
    breakdown = compute_salary_breakdown(payload)

    # 2. Prepare payload
    record_data = {
        "user_id": user_id,
        "monthly_wage": breakdown.monthly_wage,
        "yearly_wage": breakdown.yearly_wage,
        "basic_pct": breakdown.basic_pct,
        "basic_salary": breakdown.basic_salary,
        "hra_pct": breakdown.hra_pct,
        "hra": breakdown.hra,
        "standard_allowance": breakdown.standard_allowance,
        "bonus_pct": breakdown.bonus_pct,
        "performance_bonus": breakdown.performance_bonus,
        "lta_pct": breakdown.lta_pct,
        "lta": breakdown.lta,
        "fixed_allowance": breakdown.fixed_allowance,
        "pf_pct": breakdown.pf_pct,
        "provident_fund": breakdown.provident_fund,
        "professional_tax": breakdown.professional_tax,
        "gross_salary": breakdown.gross_salary,
        "total_deductions": breakdown.total_deductions,
        "net_salary": breakdown.net_salary,
        "currency": payload.currency or "INR",
        "updated_at": "now()",
    }
    if payload.effective_from:
        record_data["effective_from"] = str(payload.effective_from)

    # 3. Upsert to Supabase
    supabase = get_supabase_admin()
    try:
        res = supabase.table("salary_structures").upsert(record_data, on_conflict="user_id").execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update salary structure in database"
            )
        return SalaryStructureResponse(**res.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating salary structure for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error updating salary structure: {str(e)}"
        )


@router.post("/generate-payslips", response_model=List[PayslipResponse])
async def generate_monthly_payslips(
    payload: GeneratePayslipsRequest,
    admin_user: AuthenticatedUser = Depends(require_role("ADMIN_HR")),
):
    """
    3.6.2 Admin Control: Batch generates finalized monthly payslips for employees factoring in unpaid leave days.
    """
    supabase = get_supabase_admin()

    # 1. Fetch target salary structures
    try:
        query = supabase.table("salary_structures").select("*")
        if payload.user_ids:
            query = query.in_("user_id", payload.user_ids)
        res = query.execute()
        salary_records = res.data or []
    except Exception as e:
        logger.error(f"Error fetching salary records for payslip generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error querying salary structures: {str(e)}"
        )

    if not salary_records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No salary structure records found to generate payslips."
        )

    generated_payslips = []

    for rec in salary_records:
        u_id = rec["user_id"]

        # 2. Check unpaid leave days from leave_requests if available
        unpaid_days = 0
        try:
            leave_res = (
                supabase.table("leave_requests")
                .select("total_days")
                .eq("user_id", u_id)
                .eq("leave_type", "UNPAID")
                .eq("status", "APPROVED")
                .execute()
            )
            if leave_res.data:
                unpaid_days = sum(item.get("total_days", 0) for item in leave_res.data)
        except Exception:
            # Leave table may not have records yet
            unpaid_days = 0

        # 3. Calculate payslip with deduction
        breakdown = compute_salary_breakdown(
            SalaryCalculationInput(
                monthly_wage=rec.get("monthly_wage", 0.0),
                basic_pct=rec.get("basic_pct", 50.0),
                hra_pct=rec.get("hra_pct", 50.0),
                standard_allowance=rec.get("standard_allowance", 4167.0),
                bonus_pct=rec.get("bonus_pct", 8.33),
                lta_pct=rec.get("lta_pct", 8.33),
                pf_pct=rec.get("pf_pct", 12.0),
                professional_tax=rec.get("professional_tax", 200.0),
            )
        )

        slip_data = calculate_monthly_payslip(
            salary_breakdown=breakdown,
            unpaid_leave_days=unpaid_days,
            total_working_days=payload.total_working_days,
        )

        payslip_record = {
            "user_id": u_id,
            "month": payload.month,
            "year": payload.year,
            "monthly_wage": slip_data["monthly_wage"],
            "basic_salary": slip_data["basic_salary"],
            "hra": slip_data["hra"],
            "standard_allowance": slip_data["standard_allowance"],
            "performance_bonus": slip_data["performance_bonus"],
            "lta": slip_data["lta"],
            "fixed_allowance": slip_data["fixed_allowance"],
            "gross_salary": slip_data["gross_salary"],
            "unpaid_leave_days": slip_data["unpaid_leave_days"],
            "unpaid_leave_deduction": slip_data["unpaid_leave_deduction"],
            "provident_fund": slip_data["provident_fund"],
            "professional_tax": slip_data["professional_tax"],
            "total_deductions": slip_data["total_deductions"],
            "net_pay": slip_data["net_pay"],
            "status": "GENERATED",
            "generated_by": admin_user.id,
            "updated_at": "now()",
        }

        # 4. Upsert payslip for this user/month/year
        try:
            insert_res = supabase.table("payslips").upsert(
                payslip_record,
                on_conflict="user_id,month,year"
            ).execute()
            if insert_res.data:
                generated_payslips.append(PayslipResponse(**insert_res.data[0]))
        except Exception as e:
            logger.error(f"Error saving payslip for user {u_id}: {e}")

    return generated_payslips
