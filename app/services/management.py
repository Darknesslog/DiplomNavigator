"""Atomic department interventions using the same workflow rules as supervisors."""

from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    Assignment,
    AssignmentStage,
    AssignmentStatus,
    Notification,
    Teacher,
    Topic,
    TopicStatus,
    User,
)
from app.models.enums import NotificationKind
from app.schemas.management import LimitUpdateResponse, ManualAssignmentCreate
from app.services.accounts import check_department_scope
from app.services.application import expire_overdue_applications
from app.services.read_models import workload_card, workload_query
from app.services.workflow import commit_workflow, lock_assignment_capacity


def update_limit(db: Session, actor: User, teacher_id: int, maximum: int) -> LimitUpdateResponse:
    """Lock the same teacher row used by approvals and recalculate department workload."""
    teacher = db.scalar(select(Teacher).where(Teacher.id == teacher_id).with_for_update())
    if teacher is None:
        raise HTTPException(status_code=404, detail="Supervisor not found")
    check_department_scope(actor, teacher.department_id)
    rows = list(
        db.execute(
            workload_query()
            .where(Teacher.department_id == teacher.department_id)
            .order_by(Teacher.id)
        )
    )
    own_load = next((load for profile, load in rows if profile.id == teacher.id), None)
    if own_load is None:
        raise HTTPException(status_code=409, detail="Supervisor is unavailable")
    if maximum < own_load:
        raise HTTPException(status_code=409, detail="Limit cannot be below current load")
    teacher.max_students = maximum
    commit_workflow(db)
    # Re-read every profile after the commit; load is derived, never a cached counter.
    cards = [
        workload_card(profile, load)
        for profile, load in db.execute(
            workload_query()
            .where(Teacher.department_id == teacher.department_id)
            .order_by(Teacher.id)
        )
    ]
    return LimitUpdateResponse(
        supervisor=next(card for card in cards if card.supervisor_id == teacher.id),
        department_workload=cards,
    )


def manually_assign(db: Session, actor: User, data: ManualAssignmentCreate) -> Assignment:
    """Create an approved application and assignment together for a free topic."""
    if expire_overdue_applications(db):
        db.commit()
    topic = db.scalar(select(Topic).where(Topic.id == data.topic_id).with_for_update())
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    check_department_scope(actor, topic.department_id)
    if topic.status != TopicStatus.PUBLISHED:
        raise HTTPException(status_code=409, detail="Only published topics can be assigned")
    if (
        db.scalar(
            select(Application.id).where(
                Application.topic_id == topic.id,
                Application.status.in_((ApplicationStatus.PENDING, ApplicationStatus.APPROVED)),
            )
        )
        is not None
    ):
        raise HTTPException(status_code=409, detail="Decide the existing application first")
    teacher = lock_assignment_capacity(db, topic, data.student_id)
    now = datetime.now(UTC)
    application = Application(
        student_id=data.student_id,
        topic_id=topic.id,
        status=ApplicationStatus.APPROVED,
        motivation=data.comment,
        decided_by_user_id=actor.id,
        decided_at=now,
        decision_comment=data.comment,
    )
    application.history.append(
        ApplicationStatusHistory(
            from_status=None,
            to_status=ApplicationStatus.APPROVED,
            changed_by_user_id=actor.id,
            comment=data.comment,
            created_at=now,
        )
    )
    assignment = Assignment(
        student_id=data.student_id,
        topic_id=topic.id,
        supervisor_id=teacher.id,
        status=AssignmentStatus.ACTIVE,
        current_stage=AssignmentStage.IN_PROGRESS,
        progress_percent=0,
        assigned_at=now,
    )
    db.add_all([application, assignment])
    # Flush also assigns the application's identity for the notification.
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Assignment conflicts with existing data"
        ) from None
    db.add(
        Notification(
            user_id=application.student.user_id,
            kind=NotificationKind.APPLICATION_APPROVED,
            title="Тема назначена кафедрой",
            body=data.comment,
            created_at=now,
            payload={"application_id": application.id, "assignment_id": assignment.id},
            is_read=False,
        )
    )
    commit_workflow(db)
    db.refresh(assignment)
    return assignment
