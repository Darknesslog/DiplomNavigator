"""Supervisor workflow: applications, assignments, and progress."""

from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from backend.app import config
from backend.app.models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    Assignment,
    AssignmentProgressHistory,
    AssignmentStage,
    AssignmentStatus,
    Notification,
    Student,
    Teacher,
    Topic,
    TopicArchiveReason,
    TopicStatus,
    User,
    UserRole,
)
from backend.app.models.enums import NotificationKind
from backend.app.schemas.supervisor import ApplicationDecision, AssignmentProgressUpdate
from backend.app.services.accounts import check_department_scope
from backend.app.services.application import expire_overdue_applications
from backend.app.services.workflow import (
    check_workflow_scope,
    commit_workflow,
    lock_assignment_capacity,
    lock_student,
    withdraw_other_applications,
)

PROGRESS_TRANSITIONS: dict[AssignmentStage, frozenset[AssignmentStage]] = {
    AssignmentStage.IN_PROGRESS: frozenset(AssignmentStage),
    AssignmentStage.UNDER_REVIEW: frozenset(AssignmentStage),
    AssignmentStage.ADMITTED_TO_DEFENSE: frozenset(
        (AssignmentStage.ADMITTED_TO_DEFENSE, AssignmentStage.DEFENDED)
    ),
    AssignmentStage.DEFENDED: frozenset(),
}


def require_supervisor_profile(actor: User) -> Teacher:
    """Return the domain profile required by supervisor endpoints."""
    if actor.teacher is None:
        raise HTTPException(status_code=409, detail="Supervisor profile is required")
    return actor.teacher


def supervisor_applications(
    db: Session,
    actor: User,
    status_filter: ApplicationStatus | None = None,
    offset: int = 0,
    limit: int = 50,
) -> list[Application]:
    """List applications for topics owned by the current supervisor."""
    teacher = require_supervisor_profile(actor)
    if expire_overdue_applications(db):
        db.commit()
    statement = (
        select(Application)
        .join(Application.topic)
        .where(Topic.supervisor_id == teacher.id)
        .options(
            selectinload(Application.student).selectinload(Student.user),
            selectinload(Application.student).selectinload(Student.group),
            selectinload(Application.topic),
        )
        .order_by(Application.created_at, Application.id)
    )
    if status_filter is not None:
        statement = statement.where(Application.status == status_filter)
    return list(db.scalars(statement.offset(offset).limit(limit)))


def decide_application(
    db: Session,
    actor: User,
    application_id: int,
    decision: ApplicationDecision,
    *,
    approve: bool,
) -> Application:
    """Approve or reject one pending application atomically."""
    if expire_overdue_applications(db):
        db.commit()
    student_id = db.scalar(select(Application.student_id).where(Application.id == application_id))
    if student_id is None:
        raise HTTPException(status_code=404, detail="Application not found")
    lock_student(db, student_id)
    application = db.scalar(
        select(Application)
        .where(Application.id == application_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    topic = db.scalar(select(Topic).where(Topic.id == application.topic_id).with_for_update())
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    check_workflow_scope(actor, topic)
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(status_code=409, detail="Application has already been decided")

    now = datetime.now(UTC)
    if approve:
        if topic.status != TopicStatus.PUBLISHED:
            raise HTTPException(status_code=409, detail="Only published topics can be assigned")
        locked_teacher = lock_assignment_capacity(db, topic, application.student_id)
        assignment = Assignment(
            student_id=application.student_id,
            topic_id=application.topic_id,
            supervisor_id=locked_teacher.id,
            status=AssignmentStatus.ACTIVE,
            assigned_at=now,
            progress_percent=0,
            current_stage=AssignmentStage.IN_PROGRESS,
        )
        db.add(assignment)
        assignment.progress_history.append(
            AssignmentProgressHistory(
                changed_by_user_id=actor.id,
                changed_at=now,
                current_stage=AssignmentStage.IN_PROGRESS,
                progress_percent=0,
                comment=decision.comment,
            )
        )
        application.status = ApplicationStatus.APPROVED
        withdraw_other_applications(
            db, application.student_id, actor.id, now, keep_application_id=application.id
        )
    else:
        application.status = ApplicationStatus.REJECTED
        application.cooldown_until = now + timedelta(
            minutes=config.APPLICATION_DECISION_TIMEOUT_MINUTES
        )
    application.decided_by_user_id = actor.id
    application.decided_at = now
    application.decision_comment = decision.comment
    application.history.append(
        ApplicationStatusHistory(
            from_status=ApplicationStatus.PENDING,
            to_status=application.status,
            changed_by_user_id=actor.id,
            comment=decision.comment,
            created_at=now,
        )
    )
    db.add(
        Notification(
            user_id=application.student.user_id,
            kind=NotificationKind.APPLICATION_APPROVED
            if approve
            else NotificationKind.APPLICATION_REJECTED,
            title="Заявка одобрена" if approve else "Заявка отклонена",
            body=decision.comment,
            created_at=now,
            payload={"application_id": application.id, "topic_id": topic.id},
            is_read=False,
        )
    )
    commit_workflow(db)
    db.refresh(application)
    return application


def update_assignment_progress(
    db: Session, actor: User, assignment_id: int, data: AssignmentProgressUpdate
) -> Assignment:
    """Update progress only for an assignment owned by the current supervisor."""
    teacher = require_supervisor_profile(actor)
    assignment = db.scalar(
        select(Assignment)
        .where(Assignment.id == assignment_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.supervisor_id != teacher.id:
        raise HTTPException(status_code=403, detail="Assignment belongs to another supervisor")
    if assignment.status != AssignmentStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Only active assignments can be updated")
    if data.current_stage not in PROGRESS_TRANSITIONS[assignment.current_stage]:
        raise HTTPException(status_code=409, detail="Admission cannot be undone through progress")
    if data.current_stage == AssignmentStage.DEFENDED and data.progress_percent != 100:
        raise HTTPException(status_code=422, detail="Defended work must have 100 percent progress")
    now = datetime.now(UTC)
    previous_stage = assignment.current_stage
    previous_percent = assignment.progress_percent
    assignment.progress_percent = (
        100 if data.current_stage == AssignmentStage.ADMITTED_TO_DEFENSE else data.progress_percent
    )
    assignment.current_stage = data.current_stage
    assignment.progress_history.append(
        AssignmentProgressHistory(
            changed_by_user_id=actor.id,
            changed_at=now,
            from_stage=previous_stage,
            from_progress_percent=previous_percent,
            current_stage=assignment.current_stage,
            progress_percent=assignment.progress_percent,
            comment=data.comment,
        )
    )
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
    assignment = db.scalar(
        select(Assignment)
        .where(Assignment.id == assignment_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    check_department_scope(actor, assignment.topic.department_id)
    if (
        assignment.status != AssignmentStatus.ACTIVE
        or assignment.current_stage != AssignmentStage.ADMITTED_TO_DEFENSE
    ):
        raise HTTPException(status_code=409, detail="Only an admitted active work can be revoked")
    now = datetime.now(UTC)
    assignment.progress_history.append(
        AssignmentProgressHistory(
            changed_by_user_id=actor.id,
            changed_at=now,
            from_stage=assignment.current_stage,
            from_progress_percent=assignment.progress_percent,
            current_stage=AssignmentStage.UNDER_REVIEW,
            progress_percent=assignment.progress_percent,
            comment=comment.strip(),
        )
    )
    assignment.current_stage = AssignmentStage.UNDER_REVIEW
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
