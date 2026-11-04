"""Supervisor work aliases, department overrides, and recipient notifications."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select

from backend.app.dependencies import CurrentUser, DbSession, require_roles
from backend.app.models import (
    AcademicPeriod,
    AssignmentStatus,
    Notification,
    StudyGroup,
    User,
    UserRole,
)
from backend.app.schemas.application import StudentApplicationResponse
from backend.app.schemas.dashboard import AssignmentDetail
from backend.app.schemas.management import (
    LimitUpdateResponse,
    ManualAssignmentCreate,
    NotificationResponse,
    PeriodResponse,
    StudyGroupResponse,
    SupervisorLimitUpdate,
)
from backend.app.schemas.supervisor import (
    ApplicationDecision,
    AssignmentProgressUpdate,
    AssignmentResponse,
)
from backend.app.services.management import manually_assign, update_limit
from backend.app.services.read_models import supervisor_assignments
from backend.app.services.supervisor import decide_application, update_assignment_progress

router = APIRouter(tags=["workflows"])
Supervisor = Annotated[User, Depends(require_roles(UserRole.NAUCHRUK))]
Manager = Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ZAVKAF))]
DecisionActor = Annotated[
    User, Depends(require_roles(UserRole.NAUCHRUK, UserRole.ZAVKAF, UserRole.ADMIN))
]
Offset = Annotated[int, Query(ge=0)]
Limit = Annotated[int, Query(ge=1, le=100)]


@router.get("/supervisor/works", response_model=list[AssignmentDetail])
def supervisor_works(
    db: DbSession,
    actor: Supervisor,
    work_status: Annotated[AssignmentStatus | None, Query(alias="status")] = None,
    offset: Offset = 0,
    limit: Limit = 50,
) -> list[AssignmentDetail]:
    """Read assigned students, topics, stages and percentages owned by this supervisor."""
    return supervisor_assignments(db, actor, offset, limit, work_status)


@router.patch("/reservations/{application_id}/approve", response_model=StudentApplicationResponse)
def approve_reservation(
    application_id: int,
    data: ApplicationDecision,
    db: DbSession,
    actor: DecisionActor,
) -> StudentApplicationResponse:
    """Approve as owner or department head; capacity checks cannot be bypassed."""
    return StudentApplicationResponse.model_validate(
        decide_application(db, actor, application_id, data, approve=True)
    )


@router.patch("/reservations/{application_id}/reject", response_model=StudentApplicationResponse)
def reject_reservation(
    application_id: int,
    data: ApplicationDecision,
    db: DbSession,
    actor: DecisionActor,
) -> StudentApplicationResponse:
    """Release a pending reservation and persist an in-app notification for its student."""
    return StudentApplicationResponse.model_validate(
        decide_application(db, actor, application_id, data, approve=False)
    )


@router.patch("/works/{assignment_id}/progress", response_model=AssignmentResponse)
def change_work_progress(
    assignment_id: int,
    data: AssignmentProgressUpdate,
    db: DbSession,
    actor: Supervisor,
) -> AssignmentResponse:
    """Update an owned work; admission to defense forces the completion percentage to 100."""
    return AssignmentResponse.model_validate(
        update_assignment_progress(db, actor, assignment_id, data)
    )


@router.patch("/supervisors/{supervisor_id}/limit", response_model=LimitUpdateResponse)
def change_supervisor_limit(
    supervisor_id: int,
    data: SupervisorLimitUpdate,
    db: DbSession,
    actor: Manager,
) -> LimitUpdateResponse:
    """Change a scoped supervisor limit and return recalculated departmental workload."""
    return update_limit(db, actor, supervisor_id, data.max_students)


@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_manual_assignment(
    data: ManualAssignmentCreate,
    db: DbSession,
    actor: Manager,
) -> AssignmentResponse:
    """Manually assign a free topic while preserving Application and Assignment separately."""
    return AssignmentResponse.model_validate(manually_assign(db, actor, data))


@router.get("/notifications", response_model=list[NotificationResponse])
def my_notifications(
    db: DbSession,
    actor: CurrentUser,
    offset: Offset = 0,
    limit: Limit = 50,
) -> list[NotificationResponse]:
    """List only this recipient's persisted notifications."""
    return [
        NotificationResponse.model_validate(row)
        for row in db.scalars(
            select(Notification)
            .where(Notification.user_id == actor.id)
            .order_by(Notification.id.desc())
            .offset(offset)
            .limit(limit)
        )
    ]


@router.get("/study-groups", response_model=list[StudyGroupResponse])
def study_groups(
    db: DbSession,
    actor: CurrentUser,
    offset: Offset = 0,
    limit: Limit = 50,
) -> list[StudyGroupResponse]:
    """Read group IDs used when an administrator creates a student."""
    return [
        StudyGroupResponse.model_validate(row)
        for row in db.scalars(
            select(StudyGroup).order_by(StudyGroup.id).offset(offset).limit(limit)
        )
    ]


@router.get("/academic-periods", response_model=list[PeriodResponse])
def academic_periods(
    db: DbSession,
    actor: CurrentUser,
    offset: Offset = 0,
    limit: Limit = 50,
) -> list[PeriodResponse]:
    """Read period IDs used when a supervisor proposes a topic."""
    return [
        PeriodResponse.model_validate(row)
        for row in db.scalars(
            select(AcademicPeriod).order_by(AcademicPeriod.id).offset(offset).limit(limit)
        )
    ]
