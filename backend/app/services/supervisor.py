"""Supervisor workflow: applications, assignments, and progress."""

from datetime import timedelta

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
    UserRole,
)
from backend.app.models.enums import NotificationKind
from backend.app.schemas.supervisor import ApplicationDecision
from backend.app.services.application import expire_locked_application
from backend.app.services.assignment_records import new_assignment
from backend.app.services.profiles import require_supervisor_profile
from backend.app.services.workflow import (
    check_locked_assignment_capacity,
    check_workflow_scope,
    commit_workflow,
    lock_workflow_rows,
    withdraw_other_applications,
    workflow_now,
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
    reference = db.execute(
        select(Application.student_id, Application.topic_id).where(Application.id == application_id)
    ).one_or_none()
    if reference is None:
        raise HTTPException(status_code=404, detail="Application not found")
    rows = lock_workflow_rows(
        db, actor, reference.student_id, reference.topic_id, application_id=application_id
    )
    if actor.role not in (UserRole.NAUCHRUK, UserRole.ZAVKAF, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Decision role is required")
    application = next((row for row in rows.applications if row.id == application_id), None)
    if application is None or application.topic_id != rows.topic.id:
        raise HTTPException(status_code=409, detail="Application participants changed")
    topic = rows.topic
    check_workflow_scope(actor, topic)
    # All parents AND other applications are locked before the final state/time read.
    db.refresh(application, attribute_names=["status", "expires_at"], with_for_update=True)
    now = workflow_now(db)
    if expire_locked_application(db, application, now):
        # This is a successful expiration command even though the requested decision conflicts.
        commit_workflow(db)
        raise HTTPException(status_code=409, detail="Application has expired")
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(status_code=409, detail="Application has already been decided")
    if approve:
        if topic.status != TopicStatus.PUBLISHED:
            raise HTTPException(status_code=409, detail="Only published topics can be assigned")
        locked_teacher = check_locked_assignment_capacity(db, rows)
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
            rows.applications, actor.id, now, keep_application_id=application.id
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
