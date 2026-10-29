"""Supervisor application and graduation-work progress endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.dependencies import DbSession, require_roles
from app.models import ApplicationStatus, Assignment, User, UserRole
from app.schemas.supervisor import (
    ApplicationDecision,
    ApplicationResponse,
    AssignmentProgressUpdate,
    AssignmentResponse,
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
) -> list[ApplicationResponse]:
    """List applications submitted for the supervisor's topics."""
    return supervisor_applications(db, actor, application_status)


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
