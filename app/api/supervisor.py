"""Supervisor application and graduation-work progress endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.dependencies import DbSession, require_roles
from app.models import ApplicationStatus, Assignment, AssignmentStatus, User, UserRole
from app.schemas.dashboard import AssignmentDetail, StudentDetail
from app.schemas.presentation import StudentSummary
from app.schemas.supervisor import (
    ApplicationDecision,
    ApplicationResponse,
    AssignmentProgressUpdate,
    AssignmentResponse,
)
from app.services.read_models import (
    supervisor_assignment,
    supervisor_assignments,
    supervisor_student,
    supervisor_students,
)
from app.services.supervisor import (
    decide_application,
    supervisor_applications,
    update_assignment_progress,
)

router = APIRouter(prefix="/supervisor", tags=["supervisor"])
Supervisor = Annotated[User, Depends(require_roles(UserRole.NAUCHRUK))]


@router.get("/applications", response_model=list[ApplicationResponse])
def list_applications(
    db: DbSession,
    actor: Supervisor,
    application_status: Annotated[ApplicationStatus | None, Query(alias="status")] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[ApplicationResponse]:
    """List applications submitted for the supervisor's topics."""
    return supervisor_applications(db, actor, application_status, offset, limit)


@router.get("/assignments", response_model=list[AssignmentDetail])
def list_assignments(
    db: DbSession,
    actor: Supervisor,
    assignment_status: Annotated[AssignmentStatus | None, Query(alias="status")] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[AssignmentDetail]:
    """List only the current supervisor's assignments."""
    return supervisor_assignments(db, actor, offset, limit, assignment_status)


@router.get("/assignments/{assignment_id}", response_model=AssignmentDetail)
def read_assignment(assignment_id: int, db: DbSession, actor: Supervisor) -> AssignmentDetail:
    """Return an owned assignment or 404 without disclosing another supervisor's data."""
    return supervisor_assignment(db, actor, assignment_id)


@router.get("/students", response_model=list[StudentSummary])
def list_students(
    db: DbSession,
    actor: Supervisor,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[StudentSummary]:
    """List students attached to this supervisor through noncancelled assignments."""
    return supervisor_students(db, actor, offset, limit)


@router.get("/students/{student_id}", response_model=StudentDetail)
def read_student(student_id: int, db: DbSession, actor: Supervisor) -> StudentDetail:
    """Read a student profile and only this supervisor's assignments."""
    return supervisor_student(db, actor, student_id)


@router.patch("/applications/{application_id}/approve", response_model=ApplicationResponse)
def approve_application(
    application_id: int,
    decision: ApplicationDecision,
    db: DbSession,
    actor: Supervisor,
) -> ApplicationResponse:
    """Approve a pending application and create its active assignment."""
    return decide_application(db, actor, application_id, decision, approve=True)


@router.patch("/applications/{application_id}/reject", response_model=ApplicationResponse)
def reject_application(
    application_id: int,
    decision: ApplicationDecision,
    db: DbSession,
    actor: Supervisor,
) -> ApplicationResponse:
    """Reject a pending application and release the topic."""
    return decide_application(db, actor, application_id, decision, approve=False)


@router.patch("/assignments/{assignment_id}/progress", response_model=AssignmentResponse)
def update_progress(
    assignment_id: int,
    data: AssignmentProgressUpdate,
    db: DbSession,
    actor: Supervisor,
) -> Assignment:
    """Update the work stage and completion percentage."""
    return update_assignment_progress(db, actor, assignment_id, data)
