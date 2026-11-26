"""Student applications and expiration rules."""

from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from backend.app import config
from backend.app.models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    Notification,
    PeriodStatus,
    Student,
    Topic,
    TopicStatus,
    User,
    UserRole,
)
from backend.app.models.enums import NotificationKind
from backend.app.schemas.application import ApplicationCreate
from backend.app.services.workflow import (
    as_utc,
    check_assignment_availability,
    commit_workflow,
    lock_workflow_rows,
    workflow_now,
)


def application_deadline(created_at: datetime) -> datetime:
    """Return the configured decision deadline for an application."""
    created_at = created_at.replace(tzinfo=UTC) if created_at.tzinfo is None else created_at
    return created_at + timedelta(minutes=config.APPLICATION_DECISION_TIMEOUT_MINUTES)


def expire_locked_application(db: Session, application: Application, now: datetime) -> bool:
    """Transition one locked pending row and enqueue its events; caller owns commit."""
    if (
        application.status != ApplicationStatus.PENDING
        or application.expires_at is None
        or as_utc(application.expires_at) > now
    ):
        return False
    application.status = ApplicationStatus.EXPIRED
    application.decided_at = now
    application.decided_by_user_id = None
    application.cooldown_until = None
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
    db.add(
        Notification(
            user_id=application.student.user_id,
            kind=NotificationKind.APPLICATION_EXPIRED,
            title="Срок рассмотрения заявки истёк",
            body=application.decision_comment,
            created_at=now,
            payload={"application_id": application.id, "topic_id": application.topic_id},
            is_read=False,
        )
    )
    return True


def expire_overdue_applications(db: Session, now: datetime | None = None) -> int:
    """Explicit maintenance transaction: sorted U -> S -> A, never lock/change T.

    Caller supplies a fresh session and commits even a zero-result batch to release
    parent locks. SKIP LOCKED at each level lets concurrent workers make progress.
    An explicit now is reserved for deterministic maintenance/tests.
    """
    candidates = list(
        db.execute(
            select(Application.id, Application.student_id, Student.user_id)
            .join(Student, Application.student_id == Student.id)
            .where(
                Application.status == ApplicationStatus.PENDING,
                Application.expires_at <= (now or workflow_now(db)),
            )
            .order_by(Application.id)
        )
    )
    if not candidates:
        return 0
    user_ids = set(
        db.scalars(
            select(User.id)
            .where(User.id.in_({row.user_id for row in candidates}))
            .order_by(User.id)
            .with_for_update(read=True, skip_locked=True)
        )
    )
    students = list(
        db.scalars(
            select(Student)
            .where(
                Student.id.in_({row.student_id for row in candidates if row.user_id in user_ids}),
                Student.user_id.in_(user_ids),
            )
            .order_by(Student.id)
            .with_for_update(skip_locked=True)
            .execution_options(populate_existing=True)
        )
    )
    student_ids = {row.id for row in students}
    applications = list(
        db.scalars(
            select(Application)
            .where(
                Application.id.in_({row.id for row in candidates}),
                Application.student_id.in_(student_ids),
            )
            .order_by(Application.id)
            .with_for_update(skip_locked=True)
            .execution_options(populate_existing=True)
        )
    )
    final_now = as_utc(now) if now is not None else workflow_now(db)
    count = sum(expire_locked_application(db, row, final_now) for row in applications)
    if count:
        db.flush()
    return count


def check_application_reservation(
    db: Session, student_id: int, topic_id: int, now: datetime
) -> None:
    """Validate pair uniqueness, cooldown and the topic reservation in that order."""
    if db.scalar(
        select(Application.id).where(
            Application.student_id == student_id,
            Application.topic_id == topic_id,
            Application.status.in_((ApplicationStatus.PENDING, ApplicationStatus.APPROVED)),
        )
    ):
        raise HTTPException(status_code=409, detail="Student already has an active application")
    if db.scalar(
        select(Application.id).where(
            Application.student_id == student_id,
            Application.topic_id == topic_id,
            Application.cooldown_until.is_not(None),
            Application.cooldown_until > now,
        )
    ):
        raise HTTPException(status_code=409, detail="Topic is temporarily unavailable for student")
    if db.scalar(
        select(Application.id).where(
            Application.topic_id == topic_id,
            Application.status == ApplicationStatus.PENDING,
        )
    ):
        raise HTTPException(status_code=409, detail="Topic already has a pending application")


def create_application(
    db: Session, actor: User, topic_id: int, data: ApplicationCreate
) -> Application:
    """Create one pending application for the authenticated student."""
    if actor.student is None:
        raise HTTPException(status_code=409, detail="Student profile is required")
    rows = lock_workflow_rows(db, actor, actor.student.id, topic_id)
    student, topic, period = rows.student, rows.topic, rows.period
    if actor.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Student role is required")
    if topic.status != TopicStatus.PUBLISHED:
        raise HTTPException(status_code=409, detail="Only published topics are available")
    if topic.department_id != student.department_id:
        raise HTTPException(status_code=403, detail="Topic is outside student's department")
    now = workflow_now(db)
    if (
        period.status != PeriodStatus.OPEN
        or now < as_utc(period.application_opens_at)
        or now >= as_utc(period.application_closes_at)
    ):
        raise HTTPException(status_code=403, detail="Период подачи заявок закрыт")
    check_assignment_availability(db, student.id, topic.id)
    check_application_reservation(db, student.id, topic.id, now)
    application = Application(
        student_id=student.id,
        topic_id=topic.id,
        status=ApplicationStatus.PENDING,
        motivation=data.motivation,
        expires_at=application_deadline(now),
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
    commit_workflow(db)
    db.refresh(application)
    return application


def student_topic_query(actor: User) -> Select[tuple[Topic]]:
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
