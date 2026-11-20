"""Managed student/supervisor accounts, department links, and role assignment."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from backend.app.dependencies import CurrentUser, DbSession, require_roles
from backend.app.models import User, UserRole
from backend.app.schemas.accounts import (
    DepartmentResponse,
    DepartmentUpdate,
    RoleUpdate,
    StudentCreate,
    SupervisorCreate,
    UserResponse,
)
from backend.app.services import account_management

router = APIRouter(tags=["accounts"])
Manager = Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ZAVKAF))]
Administrator = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


@router.post("/students", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_student(data: StudentCreate, db: DbSession, actor: Manager) -> UserResponse:
    """Create a student and group/department links atomically within the manager's scope."""
    return account_management.create_student(data=data, db=db, actor=actor)


@router.post("/supervisors", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_supervisor(data: SupervisorCreate, db: DbSession, actor: Manager) -> UserResponse:
    """Create a nauchruk account and its teacher-domain profile atomically."""
    return account_management.create_supervisor(data=data, db=db, actor=actor)


@router.get("/students", response_model=list[UserResponse])
def list_students(
    db: DbSession,
    actor: Manager,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[UserResponse]:
    """List active students; department heads see only their department."""
    return account_management.list_students(db=db, actor=actor, offset=offset, limit=limit)


@router.get("/supervisors", response_model=list[UserResponse])
def list_supervisors(
    db: DbSession,
    user: CurrentUser,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[UserResponse]:
    """List available supervisors in the caller's department; admins see all."""
    return account_management.list_supervisors(db=db, user=user, offset=offset, limit=limit)


@router.get("/departments", response_model=list[DepartmentResponse])
def list_departments(
    db: DbSession,
    user: CurrentUser,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[DepartmentResponse]:
    """Return the department directory to authenticated users."""
    return account_management.list_departments(db=db, user=user, offset=offset, limit=limit)


@router.patch("/users/{user_id}/department", response_model=UserResponse)
def assign_department(
    user_id: int,
    data: DepartmentUpdate,
    db: DbSession,
    actor: Manager,
) -> UserResponse:
    """Assign a profile's department; only admins may transfer between departments."""
    return account_management.assign_department(user_id=user_id, data=data, db=db, actor=actor)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def assign_role(
    user_id: int, data: RoleUpdate, db: DbSession, actor: Administrator
) -> UserResponse:
    """Assign roles as admin, retaining profiles and preventing self-demotion."""
    return account_management.assign_role(user_id=user_id, data=data, db=db, actor=actor)
