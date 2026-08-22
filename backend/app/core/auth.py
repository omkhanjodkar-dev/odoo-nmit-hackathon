from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel
from app.core.config import get_settings

settings = get_settings()
security = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: str = "EMPLOYEE"
    employee_id: Optional[str] = None
    app_metadata: dict = {}
    user_metadata: dict = {}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthenticatedUser:
    """
    Validates Supabase JWT from Authorization header and extracts user details.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # If SUPABASE_JWT_SECRET is configured, verify signature
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid JWT Token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
    else:
        # Fallback decode unverified for development / if secret not set yet
        try:
            payload = jwt.get_unverified_claims(token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unable to parse token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing 'sub' claim",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_metadata = payload.get("user_metadata", {})
    role = user_metadata.get("role") or payload.get("role") or "EMPLOYEE"
    employee_id = user_metadata.get("employee_id")

    return AuthenticatedUser(
        id=user_id,
        email=payload.get("email"),
        role=role,
        employee_id=employee_id,
        app_metadata=payload.get("app_metadata", {}),
        user_metadata=user_metadata,
    )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthenticatedUser]:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def require_role(required_role: str):
    """
    Dependency generator to restrict endpoint to specific user role.
    """
    async def role_checker(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires role '{required_role}', but current role is '{current_user.role}'."
            )
        return current_user
    return role_checker
