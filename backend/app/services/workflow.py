"""Shared transaction rules for supervisor decisions and department overrides."""

from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    Assignment,
    AssignmentStatus,
    Student,
    Teacher,
    Topic,
    User,
    UserRole,
)


def check_workflow_scope(actor: User, topic: Topic) -> None:
    """Authorize a supervisor's own topic or a head's department."""
    if actor.role == UserRole.ADMIN:
        return
    if actor.teacher is None:
        raise HTTPException(status_code=409, detail="Supervisor profile is required")
    if actor.role == UserRole.ZAVKAF and actor.teacher.department_id == topic.department_id:
        return
    if actor.role == UserRole.NAUCHRUK and topic.supervisor_id == actor.teacher.id:
        return
    raise HTTPException(status_code=403, detail="Topic is outside your scope")


def lock_student(db: Session, student_id: int) -> Student:
    """Lock the student before topics/applications to serialize their commands."""
    student = db.scalar(
        select(Student)
        .where(Student.id == student_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


def withdraw_other_applications(
    db: Session,
    student_id: int,
    actor_id: int,
    now: datetime,
    *,
    keep_application_id: int | None = None,
) -> None:
    """Release other reservations under the student's lock; caller commits atomically."""
    statement = select(Application).where(
        Application.student_id == student_id, Application.status == ApplicationStatus.PENDING
    )
    if keep_application_id is not None:
        statement = statement.where(Application.id != keep_application_id)
    for application in db.scalars(
        statement.order_by(Application.id)
        .with_for_update()
        .execution_options(populate_existing=True)
    ):
        application.status = ApplicationStatus.WITHDRAWN
        application.cooldown_until = None
        application.decided_at = now
        application.decided_by_user_id = actor_id
        application.decision_comment = "Автоматический отзыв после закрепления другой темы"
        application.history.append(
            ApplicationStatusHistory(
                from_status=ApplicationStatus.PENDING,
                to_status=ApplicationStatus.WITHDRAWN,
                changed_by_user_id=actor_id,
                created_at=now,
                comment=application.decision_comment,
            )
        )


def require_available_supervisor(teacher: Teacher | None) -> Teacher:
    """Reject a missing, inactive or non-supervising identity."""
    if (
        teacher is None
        or not teacher.user.is_active
        or teacher.user.role
        not in (
            UserRole.NAUCHRUK,
            UserRole.ZAVKAF,
        )
    ):
        raise HTTPException(status_code=409, detail="Supervisor is unavailable")
    return teacher


def check_assignment_student(student: Student, topic: Topic) -> None:
    """Only an active student of the topic's department may be assigned."""
    if not student.user.is_active or student.user.role != UserRole.STUDENT:
        raise HTTPException(status_code=409, detail="Student is unavailable")
    if student.department_id is None or student.department_id != topic.department_id:
        raise HTTPException(status_code=409, detail="Student and topic departments differ")


def check_assignment_availability(db: Session, student_id: int, topic_id: int) -> None:
    """Check the two assignment conflicts shared by reservation and final assignment."""
    if (
        db.scalar(
            select(Assignment.id).where(
                Assignment.student_id == student_id,
                Assignment.status == AssignmentStatus.ACTIVE,
            )
        )
        is not None
    ):
        raise HTTPException(status_code=409, detail="Student already has an active assignment")
    if (
        db.scalar(
            select(Assignment.id).where(
                Assignment.topic_id == topic_id,
                Assignment.status != AssignmentStatus.CANCELLED,
            )
        )
        is not None
    ):
        raise HTTPException(status_code=409, detail="Topic already has an assignment")


def lock_assignment_capacity(db: Session, topic: Topic, student_id: int) -> Teacher:
    """Check capacity with student and topic already locked by the caller."""
    student = lock_student(db, student_id)
    teacher = require_available_supervisor(
        db.scalar(
            select(Teacher)
            .where(Teacher.id == topic.supervisor_id)
            .with_for_update()
            # Refresh the identity map only after the row lock has been acquired.
            .execution_options(populate_existing=True)
        )
    )
    check_assignment_student(student, topic)
    load = (
        db.scalar(
            select(func.count(Assignment.id)).where(
                Assignment.supervisor_id == teacher.id, Assignment.status == AssignmentStatus.ACTIVE
            )
        )
        or 0
    )
    if load >= teacher.max_students:
        raise HTTPException(status_code=409, detail="Supervisor student limit reached")
    check_assignment_availability(db, student.id, topic.id)
    return teacher


def commit_workflow(db: Session) -> None:
    """Translate uniqueness races into an API conflict and roll back all changes."""
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Workflow conflicts with existing data"
        ) from None
