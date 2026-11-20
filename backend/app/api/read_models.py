"""Role-scoped read endpoints and compatibility paths from the screen specification."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from backend.app.dependencies import DbSession, require_roles
from backend.app.models import ApplicationStatus, User, UserRole
from backend.app.schemas.application import ApplicationCreate, StudentApplicationResponse
from backend.app.schemas.dashboard import HeadDashboard, SupervisorDashboard, SupervisorWorkload
from backend.app.schemas.supervisor import ApplicationDecision
from backend.app.services.application import create_application, refresh_expired_applications
from backend.app.services.read_models import (
    department_workload,
    head_dashboard,
    scoped_department,
    supervisor_dashboard,
    visible_applications,
)
from backend.app.services.supervisor import decide_application

router = APIRouter(tags=["screen contracts"])
Student = Annotated[User, Depends(require_roles(UserRole.STUDENT))]
Supervisor = Annotated[User, Depends(require_roles(UserRole.NAUCHRUK))]
Head = Annotated[User, Depends(require_roles(UserRole.ZAVKAF, UserRole.ADMIN))]
Reviewer = Annotated[
    User, Depends(require_roles(UserRole.NAUCHRUK, UserRole.ZAVKAF, UserRole.ADMIN))
]
Offset = Annotated[int, Query(ge=0)]
Limit = Annotated[int, Query(ge=1, le=100)]
StatusFilter = Annotated[ApplicationStatus | None, Query(alias="status")]
DepartmentFilter = Annotated[int | None, Query(gt=0)]


@router.get("/applications/me", response_model=list[StudentApplicationResponse])
@router.get("/bookings/me", response_model=list[StudentApplicationResponse])
def my_applications(
    db: DbSession,
    actor: Student,
    application_status: StatusFilter = None,
    offset: Offset = 0,
    limit: Limit = 50,
) -> list[StudentApplicationResponse]:
    """Read only the current student's requests, including decisions and deadlines."""
    refresh_expired_applications(db)
    return visible_applications(db, actor, application_status, offset, limit)


@router.get("/booking-requests", response_model=list[StudentApplicationResponse])
def booking_requests(
    db: DbSession,
    actor: Reviewer,
    application_status: StatusFilter = None,
    offset: Offset = 0,
    limit: Limit = 50,
) -> list[StudentApplicationResponse]:
    """Supervisors see owned topics, heads their department, and admins all requests."""
    refresh_expired_applications(db)
    return visible_applications(db, actor, application_status, offset, limit)


@router.post(
    "/topics/{topic_id}/bookings",
    response_model=StudentApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_topic(
    topic_id: int,
    data: ApplicationCreate,
    db: DbSession,
    actor: Student,
) -> StudentApplicationResponse:
    """Compatibility path for submitting an Application; no separate Booking entity."""
    return StudentApplicationResponse.model_validate(create_application(db, actor, topic_id, data))


@router.post(
    "/booking-requests/{application_id}/approve", response_model=StudentApplicationResponse
)
def approve_request(
    application_id: int,
    decision: ApplicationDecision,
    db: DbSession,
    actor: Supervisor,
) -> StudentApplicationResponse:
    """Delegate to the existing transactional ownership and workload checks."""
    return StudentApplicationResponse.model_validate(
        decide_application(db, actor, application_id, decision, approve=True)
    )


@router.post("/booking-requests/{application_id}/reject", response_model=StudentApplicationResponse)
def reject_request(
    application_id: int,
    decision: ApplicationDecision,
    db: DbSession,
    actor: Supervisor,
) -> StudentApplicationResponse:
    """Reject through the existing service, preserving the student-topic cooldown."""
    return StudentApplicationResponse.model_validate(
        decide_application(db, actor, application_id, decision, approve=False)
    )


@router.get("/dashboard/supervisor", response_model=SupervisorDashboard)
@router.get("/supervisor/dashboard", response_model=SupervisorDashboard)
def read_supervisor_dashboard(db: DbSession, actor: Supervisor) -> SupervisorDashboard:
    """Read the supervisor's load, counters, and recent application/assignment cards."""
    refresh_expired_applications(db)
    return supervisor_dashboard(db, actor)


@router.get("/dashboard/head", response_model=HeadDashboard)
def read_head_dashboard(
    db: DbSession,
    actor: Head,
    department_id: DepartmentFilter = None,
) -> HeadDashboard:
    """Read departmental counters; admins must specify department_id."""
    # Validate the department before the legacy maintenance command can write.
    # head_dashboard repeats the authorization so direct query callers stay scoped.
    scoped_department(db, actor, department_id)
    refresh_expired_applications(db)
    return head_dashboard(db, actor, department_id)


@router.get("/workload/supervisors", response_model=list[SupervisorWorkload])
def read_workload(
    db: DbSession,
    actor: Head,
    department_id: DepartmentFilter = None,
    offset: Offset = 0,
    limit: Limit = 50,
) -> list[SupervisorWorkload]:
    """Read real active load and free places for the authorized department."""
    return department_workload(db, actor, department_id, offset, limit)
