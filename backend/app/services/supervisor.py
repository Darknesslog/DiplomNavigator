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
    AssignmentStage,
    AssignmentStatus,
    Notification,
    Student,
    Teacher,
    Topic,
    TopicStatus,
    User,
)
from backend.app.models.enums import NotificationKind
from backend.app.schemas.supervisor import ApplicationDecision, AssignmentProgressUpdate
from backend.app.services.application import expire_overdue_applications
from backend.app.services.workflow import (
    check_workflow_scope,
    commit_workflow,
    lock_assignment_capacity,
)


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
    application = db.scalar(
        select(Application).where(Application.id == application_id).with_for_update()
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
        application.status = ApplicationStatus.APPROVED
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
        select(Assignment).where(Assignment.id == assignment_id).with_for_update()
    )
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.supervisor_id != teacher.id:
        raise HTTPException(status_code=403, detail="Assignment belongs to another supervisor")
    if assignment.status != AssignmentStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Only active assignments can be updated")
    if data.current_stage == AssignmentStage.DEFENDED and data.progress_percent != 100:
        raise HTTPException(status_code=422, detail="Defended work must have 100 percent progress")
    assignment.progress_percent = (
        100 if data.current_stage == AssignmentStage.ADMITTED_TO_DEFENSE else data.progress_percent
    )
    assignment.current_stage = data.current_stage
    if data.current_stage == AssignmentStage.DEFENDED:
        assignment.status = AssignmentStatus.COMPLETED
    db.commit()
    db.refresh(assignment)
    return assignment
