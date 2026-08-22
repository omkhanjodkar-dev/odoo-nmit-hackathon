from typing import List
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user, require_role, AuthenticatedUser
from app.schemas.employee import (
    EmployeeCardResponse,
    AdminOnboardRequest,
    AdminOnboardResponse,
    PersonalInfoUpdateRequest,
    BankDetailsUpdateRequest,
    PersonalInfoResponse,
    BankDetailsResponse,
)
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["Employee Profiles"])


@router.get("", response_model=List[EmployeeCardResponse])
async def list_employees(current_user: AuthenticatedUser = Depends(get_current_user)):
    return EmployeeService.list_employees()


@router.post("", response_model=AdminOnboardResponse, status_code=201)
async def onboard_employee(
    payload: AdminOnboardRequest,
    admin_user: AuthenticatedUser = Depends(require_role("admin")),
):
    return EmployeeService.onboard_employee(payload)


@router.put("/{user_id}/personal-info", response_model=PersonalInfoResponse)
async def update_personal_info(
    user_id: str,
    payload: PersonalInfoUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    EmployeeService.assert_self_or_admin(current_user.id, user_id, current_user.role)
    return EmployeeService.update_personal_info(user_id, payload)


@router.put("/{user_id}/bank-details", response_model=BankDetailsResponse)
async def update_bank_details(
    user_id: str,
    payload: BankDetailsUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    EmployeeService.assert_self_or_admin(current_user.id, user_id, current_user.role)
    return EmployeeService.update_bank_details(user_id, payload)
