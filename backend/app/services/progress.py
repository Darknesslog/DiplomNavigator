"""Progress transitions, audited changes and administrative admission revocation."""

from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models import (
    Assignment,
    AssignmentProgressHistory,
    AssignmentStage,
    AssignmentStatus,
    Notification,
    TopicArchiveReason,
    TopicStatus,
    User,
    UserRole,
)
from backend.app.models.enums import NotificationKind
from backend.app.schemas.supervisor import AssignmentProgressUpdate
from backend.app.services.accounts import check_department_scope
from backend.app.services.profiles import require_supervisor_profile
from backend.app.services.workflow import commit_workflow

PROGRESS_TRANSITIONS: dict[AssignmentStage, frozenset[AssignmentStage]] = {
    AssignmentStage.IN_PROGRESS: frozenset(AssignmentStage),
    AssignmentStage.UNDER_REVIEW: frozenset(AssignmentStage),
    AssignmentStage.ADMITTED_TO_DEFENSE: frozenset(
        (AssignmentStage.ADMITTED_TO_DEFENSE, AssignmentStage.DEFENDED)
    ),
    AssignmentStage.DEFENDED: frozenset(),
}


def locked_assignment(db: Session, assignment_id: int) -> Assignment:
    """Lock and refresh an assignment before validating a progress command."""
    assignment = db.scalar(
        select(Assignment)
        .where(Assignment.id == assignment_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


def validated_progress(assignment: Assignment, data: AssignmentProgressUpdate) -> int:
    """Validate a transition without querying or changing persistence state."""
    if assignment.status != AssignmentStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Only active assignments can be updated")
    if data.current_stage not in PROGRESS_TRANSITIONS[assignment.current_stage]:
        raise HTTPException(status_code=409, detail="Admission cannot be undone through progress")
    if data.current_stage == AssignmentStage.DEFENDED and data.progress_percent != 100:
        raise HTTPException(status_code=422, detail="Defended work must have 100 percent progress")
    return (
        100 if data.current_stage == AssignmentStage.ADMITTED_TO_DEFENSE else data.progress_percent
    )


def record_progress_change(
    assignment: Assignment,
    actor_id: int,
    changed_at: datetime,
    stage: AssignmentStage,
    percent: int,
    comment: str | None,
) -> None:
    """Record the same before/after values for normal changes and admission revocation."""
    assignment.progress_history.append(
        AssignmentProgressHistory(
            changed_by_user_id=actor_id,
            changed_at=changed_at,
            from_stage=assignment.current_stage,
            from_progress_percent=assignment.progress_percent,
            current_stage=stage,
            progress_percent=percent,
            comment=comment,
        )
    )
    assignment.current_stage = stage
    assignment.progress_percent = percent


def update_assignment_progress(
    db: Session, actor: User, assignment_id: int, data: AssignmentProgressUpdate
) -> Assignment:
    """Update progress only for an assignment owned by the current supervisor."""
    teacher = require_supervisor_profile(actor)
    assignment = locked_assignment(db, assignment_id)
    if assignment.supervisor_id != teacher.id:
        raise HTTPException(status_code=403, detail="Assignment belongs to another supervisor")
    percent = validated_progress(assignment, data)
    now = datetime.now(UTC)
    record_progress_change(assignment, actor.id, now, data.current_stage, percent, data.comment)
    if data.current_stage == AssignmentStage.DEFENDED:
        assignment.status = AssignmentStatus.COMPLETED
        assignment.topic.status = TopicStatus.ARCHIVED
        assignment.topic.published_at = None
        assignment.topic.archived_at = now
        assignment.topic.archive_reason = TopicArchiveReason.COMPLETED
    db.add(
        Notification(
            user_id=assignment.student.user_id,
            kind=NotificationKind.ASSIGNMENT_PROGRESS_UPDATED,
            title="Обновлён прогресс ВКР",
            body=f"Этап: {data.current_stage.value}; прогресс: {assignment.progress_percent}%.",
            created_at=now,
            payload={
                "assignment_id": assignment.id,
                "topic_id": assignment.topic_id,
                "current_stage": data.current_stage.value,
                "progress_percent": assignment.progress_percent,
                "assignment_status": assignment.status.value,
            },
            is_read=False,
        )
    )
    commit_workflow(db)
    db.refresh(assignment)
    return assignment


def revoke_admission(db: Session, actor: User, assignment_id: int, comment: str) -> Assignment:
    """Allow a scoped manager to return an admitted active work to review, with audit."""
    if actor.role not in (UserRole.ADMIN, UserRole.ZAVKAF):
        raise HTTPException(status_code=403, detail="Only department heads may revoke admission")
    if not comment.strip():
        raise HTTPException(status_code=422, detail="Revocation requires a comment")
    assignment = locked_assignment(db, assignment_id)
    check_department_scope(actor, assignment.topic.department_id)
    if (
        assignment.status != AssignmentStatus.ACTIVE
        or assignment.current_stage != AssignmentStage.ADMITTED_TO_DEFENSE
    ):
        raise HTTPException(status_code=409, detail="Only an admitted active work can be revoked")
    now = datetime.now(UTC)
    record_progress_change(
        assignment,
        actor.id,
        now,
        AssignmentStage.UNDER_REVIEW,
        assignment.progress_percent,
        comment.strip(),
    )
    db.add(
        Notification(
            user_id=assignment.student.user_id,
            kind=NotificationKind.ASSIGNMENT_PROGRESS_UPDATED,
            title="Допуск к защите отозван",
            body=comment.strip(),
            created_at=now,
            payload={
                "assignment_id": assignment.id,
                "current_stage": assignment.current_stage.value,
            },
            is_read=False,
        )
    )
    commit_workflow(db)
    db.refresh(assignment)
    return assignment
