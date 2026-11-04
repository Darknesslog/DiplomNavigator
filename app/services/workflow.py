"""Shared transaction rules for supervisor decisions and department overrides."""

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Assignment, AssignmentStatus, Student, Teacher, Topic, User, UserRole


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


def lock_assignment_capacity(db: Session, topic: Topic, student_id: int) -> Teacher:
    """Serialize capacity and student checks with the topic already locked."""
    teacher = db.scalar(select(Teacher).where(Teacher.id == topic.supervisor_id).with_for_update())
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
    student = db.scalar(select(Student).where(Student.id == student_id).with_for_update())
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    if not student.user.is_active or student.user.role != UserRole.STUDENT:
        raise HTTPException(status_code=409, detail="Student is unavailable")
    if student.department_id is None or student.department_id != topic.department_id:
        raise HTTPException(status_code=409, detail="Student and topic departments differ")
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
    if (
        db.scalar(
            select(Assignment.id).where(
                Assignment.student_id == student.id,
                Assignment.status == AssignmentStatus.ACTIVE,
            )
        )
        is not None
    ):
        raise HTTPException(status_code=409, detail="Student already has an active assignment")
    if (
        db.scalar(
            select(Assignment.id).where(
                Assignment.topic_id == topic.id,
                Assignment.status != AssignmentStatus.CANCELLED,
            )
        )
        is not None
    ):
        raise HTTPException(status_code=409, detail="Topic already has an assignment")
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
