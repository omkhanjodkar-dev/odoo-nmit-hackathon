import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user, require_role, AuthenticatedUser
from app.core.supabase import get_supabase_admin
from app.schemas.payroll import (
    SalaryStructureUpdate,
    SalaryStructureResponse,
    SalaryStructureBreakdown,
    GeneratePayslipRequest,
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
    3.6.1 Employee View: Read-only breakdown of the currently logged-in employee's salary.
    Queries public.salary_structures and computes breakdown components.
    """
    supabase = get_supabase_admin()
    try:
        res = supabase.table("salary_structures").select("*").eq("user_id", current_user.id).single().execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Salary structure not found for current user"
            )
        data = res.data
        base_pay = float(data.get("base_pay", 0.0))
        breakdown = compute_salary_breakdown(base_pay)

        return SalaryStructureResponse(
            id=str(data.get("id")),
            user_id=str(data.get("user_id")),
            base_pay=base_pay,
            breakdown=breakdown,
            created_at=str(data.get("created_at")),
            updated_at=str(data.get("updated_at")),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching salary for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error fetching salary structure: {str(e)}"
        )


# ==========================================
# 3.6.2 Admin Payroll Control
# ==========================================

@router.get("/all", response_model=List[SalaryStructureResponse])
async def get_all_salaries(admin_user: AuthenticatedUser = Depends(require_role("ADMIN_HR"))):
    """
    3.6.2 Admin Control: View salary structures of all employees across the organization.
    """
    supabase = get_supabase_admin()
    try:
        res = supabase.table("salary_structures").select("*").execute()
        items = []
        for row in (res.data or []):
            base_pay = float(row.get("base_pay", 0.0))
            items.append(
                SalaryStructureResponse(
                    id=str(row.get("id")),
                    user_id=str(row.get("user_id")),
                    base_pay=base_pay,
                    breakdown=compute_salary_breakdown(base_pay),
                    created_at=str(row.get("created_at")),
                    updated_at=str(row.get("updated_at")),
                )
            )
        return items
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
        data = res.data
        base_pay = float(data.get("base_pay", 0.0))
        return SalaryStructureResponse(
            id=str(data.get("id")),
            user_id=str(data.get("user_id")),
            base_pay=base_pay,
            breakdown=compute_salary_breakdown(base_pay),
            created_at=str(data.get("created_at")),
            updated_at=str(data.get("updated_at")),
        )
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
    payload: SalaryStructureUpdate,
    admin_user: AuthenticatedUser = Depends(require_role("ADMIN_HR")),
):
    """
    3.6.2 Admin Control: Updates base_pay in public.salary_structures for an employee.
    """
    supabase = get_supabase_admin()
    record_data = {
        "user_id": user_id,
        "base_pay": payload.base_pay,
        "updated_at": "now()",
    }
    try:
        res = supabase.table("salary_structures").upsert(record_data, on_conflict="user_id").execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update salary structure in database"
            )
        data = res.data[0]
        base_pay = float(data.get("base_pay", 0.0))
        return SalaryStructureResponse(
            id=str(data.get("id")),
            user_id=str(data.get("user_id")),
            base_pay=base_pay,
            breakdown=compute_salary_breakdown(base_pay),
            created_at=str(data.get("created_at")),
            updated_at=str(data.get("updated_at")),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating salary structure for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error updating salary structure: {str(e)}"
        )


@router.post("/generate-payslips", response_model=List[PayslipResponse])
async def generate_payslips(
    payload: GeneratePayslipRequest,
    admin_user: AuthenticatedUser = Depends(require_role("ADMIN_HR")),
):
    """
    3.6.2 Admin Control: Computes monthly payslips for employees factoring in unpaid leaves from public.leave_log.
    """
    supabase = get_supabase_admin()

    try:
        query = supabase.table("salary_structures").select("*")
        if payload.user_ids:
            query = query.in_("user_id", payload.user_ids)
        res = query.execute()
        salary_records = res.data or []
    except Exception as e:
        logger.error(f"Error querying salary structures: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query error: {str(e)}"
        )

    results = []
    for rec in salary_records:
        u_id = rec["user_id"]
        base_pay = float(rec.get("base_pay", 0.0))

        # Count approved unpaid leaves for this user from public.leave_log
        unpaid_count = 0
        try:
            leave_res = (
                supabase.table("leave_log")
                .select("id")
                .eq("user_id", u_id)
                .eq("approval_status", "Approved")
                .ilike("leave_type", "%unpaid%")
                .execute()
            )
            if leave_res.data:
                unpaid_count = len(leave_res.data)
        except Exception:
            unpaid_count = 0

        slip = calculate_monthly_payslip(
            base_pay=base_pay,
            unpaid_leave_days=unpaid_count,
            total_working_days=payload.total_working_days
        )
        results.append(
            PayslipResponse(
                user_id=u_id,
                month=payload.month,
                year=payload.year,
                **slip
            )
        )

    return results
