"""Department scope, public identities, and atomic account persistence."""

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Department, StudyGroup, User, UserRole
from app.schemas.accounts import UserResponse


def department_id(user: User) -> int | None:
    """Resolve the department from the account's domain profile."""
    if user.student is not None:
        return user.student.department_id
    if user.teacher is not None:
        return user.teacher.department_id
    return None


def public_user(user: User) -> UserResponse:
    """Build the API allowlist without exposing password hashes or cooldown state."""
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        middle_name=user.middle_name,
        role=user.role,
        is_active=user.is_active,
        department_id=department_id(user),
        last_login_at=user.last_login_at,
    )


def check_department_scope(actor: User, target_department_id: int | None) -> None:
    """Permit admins globally and department heads only inside their own department."""
    if actor.role == UserRole.ADMIN:
        return
    own_department = department_id(actor)
    if actor.role != UserRole.ZAVKAF or own_department is None:
        raise HTTPException(status_code=403, detail="Insufficient role")
    if own_department != target_department_id:
        raise HTTPException(status_code=403, detail="Account is outside your department")


def require_department(db: Session, target_id: int) -> Department:
    """Load an existing department before assigning a domain profile to it."""
    department = db.get(Department, target_id)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


def check_student_faculty(db: Session, group_id: int, department: Department) -> None:
    """Ensure the student's group and department belong to the same faculty."""
    group = db.get(StudyGroup, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Study group not found")
    if group.faculty_id != department.faculty_id:
        raise HTTPException(status_code=409, detail="Group and department faculties differ")


def commit_account(db: Session, user: User) -> UserResponse:
    """Commit user/profile writes together; turn uniqueness races into a conflict."""
    try:
        db.add(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Account or profile conflicts with existing data"
        ) from None
    return public_user(user)


def check_role_profile(user: User, role: UserRole) -> None:
    """Keep role changes consistent with existing, retained domain profiles."""
    if role == UserRole.STUDENT and (user.student is None or user.teacher is not None):
        raise HTTPException(status_code=409, detail="A student profile is required")
    if role in (UserRole.NAUCHRUK, UserRole.ZAVKAF) and (
        user.teacher is None or user.student is not None
    ):
        raise HTTPException(status_code=409, detail="A supervisor profile is required")
    if role == UserRole.ZAVKAF and department_id(user) is None:
        raise HTTPException(
            status_code=409, detail="A department is required for a department head"
        )
