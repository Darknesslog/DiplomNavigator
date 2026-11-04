"""Student applications and expiration rules."""

from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import config
from app.models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    Topic,
    TopicArchiveReason,
    TopicStatus,
    User,
)
from app.schemas.application import ApplicationCreate


def application_deadline(created_at: datetime) -> datetime:
    """Return the configured decision deadline for an application."""
    created_at = created_at.replace(tzinfo=UTC) if created_at.tzinfo is None else created_at
    return created_at + timedelta(minutes=config.APPLICATION_DECISION_TIMEOUT_MINUTES)


def expire_overdue_applications(db: Session, now: datetime | None = None) -> int:
    """Expire pending applications and archive their topics."""
    now = now or datetime.now(UTC)
    applications = list(
        db.scalars(
            select(Application).where(
                Application.status == ApplicationStatus.PENDING,
                Application.expires_at.is_not(None),
                Application.expires_at <= now,
            )
        )
    )
    for application in applications:
        application.status = ApplicationStatus.EXPIRED
        application.decided_at = now
        application.decision_comment = "Application expired before supervisor decision"
        application.history.append(
            ApplicationStatusHistory(
                from_status=ApplicationStatus.PENDING,
                to_status=ApplicationStatus.EXPIRED,
                changed_by_user_id=None,
                comment=application.decision_comment,
                created_at=now,
            )
        )
        topic = db.get(Topic, application.topic_id)
        if topic is not None and topic.status == TopicStatus.PUBLISHED:
            topic.status = TopicStatus.ARCHIVED
            topic.archived_at = now
            topic.archive_reason = TopicArchiveReason.EXPIRED
            topic.published_at = None
    if applications:
        db.flush()
    return len(applications)


def create_application(
    db: Session, actor: User, topic_id: int, data: ApplicationCreate
) -> Application:
    """Create one pending application for the authenticated student."""
    if actor.student is None:
        raise HTTPException(status_code=409, detail="Student profile is required")
    expire_overdue_applications(db)
    student = actor.student
    topic = db.scalar(
        select(Topic).where(Topic.id == topic_id).with_for_update()
    )
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    if topic.status != TopicStatus.PUBLISHED:
        raise HTTPException(status_code=409, detail="Only published topics are available")
    now = datetime.now(UTC)
    if topic.department_id != student.department_id:
        raise HTTPException(status_code=403, detail="Topic is outside student's department")
    if db.scalar(
        select(Application.id).where(
            Application.student_id == student.id,
            Application.topic_id == topic.id,
            Application.status.in_(
                (ApplicationStatus.PENDING, ApplicationStatus.APPROVED)
            ),
        )
    ):
        raise HTTPException(status_code=409, detail="Student already has an active application")
    if db.scalar(
        select(Application.id).where(
            Application.student_id == student.id,
            Application.topic_id == topic.id,
            Application.cooldown_until.is_not(None),
            Application.cooldown_until > now,
        )
    ):
        raise HTTPException(status_code=409, detail="Topic is temporarily unavailable for student")
    if db.scalar(
        select(Application.id).where(
            Application.topic_id == topic.id,
            Application.status == ApplicationStatus.PENDING,
        )
    ):
        raise HTTPException(status_code=409, detail="Topic already has a pending application")
    application = Application(
        student_id=student.id,
        topic_id=topic.id,
        status=ApplicationStatus.PENDING,
        motivation=data.motivation,
        expires_at=now + timedelta(minutes=config.APPLICATION_DECISION_TIMEOUT_MINUTES),
    )
    application.history.append(
        ApplicationStatusHistory(
            from_status=None,
            to_status=ApplicationStatus.PENDING,
            changed_by_user_id=actor.id,
            comment=None,
            created_at=now,
        )
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def student_topic_query(actor: User):
    """Return published topics not blocked by this student's cooldown."""
    if actor.student is None:
        raise HTTPException(status_code=409, detail="Student profile is required")
    now = datetime.now(UTC)
    blocked_topics = select(Application.topic_id).where(
        Application.student_id == actor.student.id,
        Application.cooldown_until.is_not(None),
        Application.cooldown_until > now,
    )
    return select(Topic).where(
        Topic.status == TopicStatus.PUBLISHED,
        Topic.department_id == actor.student.department_id,
        ~Topic.id.in_(blocked_topics),
    )
