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
    Notification,
    Student,
    Topic,
    TopicStatus,
    User,
)
from backend.app.models.enums import NotificationKind
from backend.app.schemas.supervisor import ApplicationDecision
from backend.app.services.application import expire_overdue_applications
from backend.app.services.assignment_records import new_assignment
from backend.app.services.profiles import require_supervisor_profile
from backend.app.services.workflow import (
    check_workflow_scope,
    commit_workflow,
    lock_assignment_capacity,
    lock_student,
    withdraw_other_applications,
)


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


def locked_pending_application(
    db: Session, actor: User, application_id: int
) -> tuple[Application, Topic]:
    """Acquire student/application/topic locks and validate ownership before a decision."""
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

    return application, topic


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
    application, topic = locked_pending_application(db, actor, application_id)

    now = datetime.now(UTC)
    if approve:
        if topic.status != TopicStatus.PUBLISHED:
            raise HTTPException(status_code=409, detail="Only published topics can be assigned")
        locked_teacher = lock_assignment_capacity(db, topic, application.student_id)
        assignment = new_assignment(
            application.student_id,
            application.topic_id,
            locked_teacher.id,
            actor.id,
            now,
            decision.comment,
        )
        db.add(assignment)
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
