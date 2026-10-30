"""Supervisor workflow: applications, assignments, and progress."""

from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import config
from app.models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    Assignment,
    AssignmentStage,
    AssignmentStatus,
    Teacher,
    Topic,
    TopicStatus,
    User,
)
from app.schemas.supervisor import ApplicationDecision, AssignmentProgressUpdate
from app.services.application import expire_overdue_applications


def require_supervisor_profile(actor: User) -> Teacher:
    """Return the domain profile required by supervisor endpoints."""
    if actor.teacher is None:
        raise HTTPException(status_code=409, detail="Supervisor profile is required")
    return actor.teacher


def supervisor_applications(
    db: Session, actor: User, status_filter: ApplicationStatus | None = None
) -> list[Application]:
    """List applications for topics owned by the current supervisor."""
    teacher = require_supervisor_profile(actor)
    if expire_overdue_applications(db):
        db.commit()
    statement = (
        select(Application)
        .join(Application.topic)
        .where(Topic.supervisor_id == teacher.id)
        .order_by(Application.created_at, Application.id)
    )
    if status_filter is not None:
        statement = statement.where(Application.status == status_filter)
    return list(db.scalars(statement))


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
    teacher = require_supervisor_profile(actor)
    application = db.scalar(
        select(Application)
        .where(Application.id == application_id)
        .with_for_update()
    )
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    topic = db.scalar(
        select(Topic).where(Topic.id == application.topic_id).with_for_update()
    )
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    if topic.supervisor_id != teacher.id:
        raise HTTPException(status_code=403, detail="Application belongs to another supervisor")
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(status_code=409, detail="Application has already been decided")

    now = datetime.now(UTC)
    if approve:
        if topic.status != TopicStatus.PUBLISHED:
            raise HTTPException(status_code=409, detail="Only published topics can be assigned")
        locked_teacher = db.scalar(
            select(Teacher).where(Teacher.id == teacher.id).with_for_update()
        )
        if locked_teacher is None:
            raise HTTPException(status_code=409, detail="Supervisor profile is unavailable")
        load = db.scalar(
            select(func.count(Assignment.id)).where(
                Assignment.supervisor_id == locked_teacher.id,
                Assignment.status == AssignmentStatus.ACTIVE,
            )
        )
        if load >= locked_teacher.max_students:
            raise HTTPException(status_code=409, detail="Supervisor student limit reached")
        existing = db.scalar(
            select(Assignment.id).where(
                Assignment.student_id == application.student_id,
                Assignment.status == AssignmentStatus.ACTIVE,
            )
        )
        if existing is not None:
            raise HTTPException(status_code=409, detail="Student already has an active assignment")
        assignment = Assignment(
            student_id=application.student_id,
            topic_id=application.topic_id,
            supervisor_id=teacher.id,
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
    db.commit()
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
    )
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if assignment.supervisor_id != teacher.id:
        raise HTTPException(status_code=403, detail="Assignment belongs to another supervisor")
    if assignment.status != AssignmentStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Only active assignments can be updated")
    if data.current_stage == AssignmentStage.DEFENDED and data.progress_percent != 100:
        raise HTTPException(status_code=422, detail="Defended work must have 100 percent progress")
    assignment.progress_percent = data.progress_percent
    assignment.current_stage = data.current_stage
    if data.current_stage == AssignmentStage.DEFENDED:
        assignment.status = AssignmentStatus.COMPLETED
    db.commit()
    db.refresh(assignment)
    return assignment
