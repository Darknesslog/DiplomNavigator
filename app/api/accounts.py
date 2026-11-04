"""Managed student/supervisor accounts, department links, and role assignment."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.dependencies import CurrentUser, DbSession, require_roles
from app.models import Department, Student, Teacher, User, UserRole
from app.schemas.accounts import (
    AccountCreate,
    DepartmentResponse,
    DepartmentUpdate,
    RoleUpdate,
    StudentCreate,
    SupervisorCreate,
    UserResponse,
)
from app.security import hash_password
from app.services.accounts import (
    check_department_scope,
    check_role_profile,
    check_student_faculty,
    commit_account,
    department_id,
    public_user,
    require_department,
)

router = APIRouter(tags=["accounts"])
Manager = Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ZAVKAF))]
Administrator = Annotated[User, Depends(require_roles(UserRole.ADMIN))]


def new_user(data: AccountCreate, role: UserRole) -> User:
    """Construct an account without accepting client-supplied privileges."""
    return User(
        email=str(data.email),
        password_hash=hash_password(data.password.get_secret_value()),
        first_name=data.first_name,
        last_name=data.last_name,
        middle_name=data.middle_name,
        role=role,
        is_active=True,
        failed_login_attempts=0,
    )


def managed_target(db: Session, user_id: int, actor: User) -> User:
    """Lock the target identity and check department boundaries before modifications."""
    target = db.scalar(
        select(User)
        .where(User.id == user_id)
        .with_for_update()
        .options(selectinload(User.student), selectinload(User.teacher))
        .execution_options(populate_existing=True)
    )
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    check_department_scope(actor, department_id(target))
    if actor.role != UserRole.ADMIN and target.role not in (UserRole.STUDENT, UserRole.NAUCHRUK):
        raise HTTPException(status_code=403, detail="Only admins may manage elevated accounts")
    return target


@router.post("/students", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_student(data: StudentCreate, db: DbSession, actor: Manager) -> UserResponse:
    """Create a student and group/department links atomically within the manager's scope."""
    check_department_scope(actor, data.department_id)
    department = require_department(db, data.department_id)
    check_student_faculty(db, data.group_id, department)
    user = new_user(data, UserRole.STUDENT)
    user.student = Student(
        group_id=data.group_id,
        department_id=data.department_id,
        record_book_number=data.record_book_number,
        admission_year=data.admission_year,
    )
    return commit_account(db, user)


@router.post("/supervisors", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_supervisor(data: SupervisorCreate, db: DbSession, actor: Manager) -> UserResponse:
    """Create a nauchruk account and its teacher-domain profile atomically."""
    check_department_scope(actor, data.department_id)
    require_department(db, data.department_id)
    user = new_user(data, UserRole.NAUCHRUK)
    user.teacher = Teacher(
        department_id=data.department_id,
        position=data.position,
        academic_degree=data.academic_degree,
        max_students=data.max_students,
        is_available=True,
    )
    return commit_account(db, user)


@router.get("/students", response_model=list[UserResponse])
def list_students(
    db: DbSession,
    actor: Manager,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[UserResponse]:
    """List active students; department heads see only their department."""
    statement = (
        select(User)
        .join(Student)
        .where(User.role == UserRole.STUDENT, User.is_active.is_(True))
        .options(selectinload(User.student), selectinload(User.teacher))
    )
    if actor.role != UserRole.ADMIN:
        own_department = department_id(actor)
        check_department_scope(actor, own_department)
        statement = statement.where(Student.department_id == own_department)
    return [
        public_user(user)
        for user in db.scalars(statement.order_by(User.id).offset(offset).limit(limit))
    ]


@router.get("/supervisors", response_model=list[UserResponse])
def list_supervisors(
    db: DbSession,
    user: CurrentUser,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[UserResponse]:
    """List available supervisors in the caller's department; admins see all."""
    statement = (
        select(User)
        .join(Teacher)
        .where(
            User.role.in_((UserRole.NAUCHRUK, UserRole.ZAVKAF)),
            User.is_active.is_(True),
            Teacher.is_available.is_(True),
        )
        .options(selectinload(User.student), selectinload(User.teacher))
    )
    if user.role != UserRole.ADMIN:
        own_department = department_id(user)
        if own_department is None:
            return []
        statement = statement.where(Teacher.department_id == own_department)
    return [
        public_user(account)
        for account in db.scalars(statement.order_by(User.id).offset(offset).limit(limit))
    ]


@router.get("/departments", response_model=list[DepartmentResponse])
def list_departments(
    db: DbSession,
    user: CurrentUser,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[DepartmentResponse]:
    """Return the department directory to authenticated users."""
    return [
        DepartmentResponse.model_validate(department)
        for department in db.scalars(
            select(Department).order_by(Department.id).offset(offset).limit(limit)
        )
    ]


@router.patch("/users/{user_id}/department", response_model=UserResponse)
def assign_department(
    user_id: int,
    data: DepartmentUpdate,
    db: DbSession,
    actor: Manager,
) -> UserResponse:
    """Assign a profile's department; only admins may transfer between departments."""
    target = managed_target(db, user_id, actor)
    check_department_scope(actor, data.department_id)
    department = require_department(db, data.department_id)
    if target.student is not None:
        check_student_faculty(db, target.student.group_id, department)
        target.student.department_id = data.department_id
    elif target.teacher is not None:
        target.teacher.department_id = data.department_id
    else:
        raise HTTPException(status_code=409, detail="User has no student or supervisor profile")
    return commit_account(db, target)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def assign_role(
    user_id: int, data: RoleUpdate, db: DbSession, actor: Administrator
) -> UserResponse:
    """Assign roles as admin, retaining profiles and preventing self-demotion."""
    target = managed_target(db, user_id, actor)
    if target.id == actor.id and data.role != UserRole.ADMIN:
        raise HTTPException(status_code=409, detail="Administrators cannot demote themselves")
    check_role_profile(target, data.role)
    target.role = data.role
    return commit_account(db, target)
