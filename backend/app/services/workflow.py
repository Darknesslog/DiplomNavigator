"""Shared transaction rules for supervisor decisions and department overrides."""

from dataclasses import dataclass
from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.models import (
    AcademicPeriod,
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
from backend.app.services.locking import lock_participants, lock_student_applications, lock_topic


def workflow_now(db: Session) -> datetime:
    """Read wall-clock time, never PostgreSQL's transaction-start timestamp."""
    if db.get_bind().dialect.name == "postgresql":
        return db.scalar(select(func.clock_timestamp()))
    return datetime.now(UTC)


def as_utc(value: datetime) -> datetime:
    """SQLite returns naive timestamps; PostgreSQL timestamps are timezone aware."""
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


@dataclass
class WorkflowRows:
    student: Student
    teacher: Teacher | None
    period: AcademicPeriod
    topic: Topic
    applications: list[Application]


def lock_workflow_rows(
    db: Session,
    actor: User,
    student_id: int,
    topic_id: int,
    *,
    application_id: int | None = None,
) -> WorkflowRows:
    """Lock U -> S -> H -> P -> T -> all student's A, sorted within each level.

    Discovery takes no locks. If a relationship changed before its lock, restart
    from U rather than acquire a previously skipped parent after a child.
    """
    for _attempt in range(3):
        student_owner = db.scalar(select(Student.user_id).where(Student.id == student_id))
        if student_owner is None:
            raise HTTPException(status_code=404, detail="Student not found")
        discovered = db.execute(
            select(Topic.supervisor_id, Topic.period_id).where(Topic.id == topic_id)
        ).one_or_none()
        if discovered is None:
            raise HTTPException(status_code=404, detail="Topic not found")
        supervisor_id, period_id = discovered
        actor_teacher_id = db.scalar(select(Teacher.id).where(Teacher.user_id == actor.id))
        teacher_ids = {supervisor_id}
        if actor_teacher_id is not None:
            teacher_ids.add(actor_teacher_id)
        teacher_owners = dict(
            db.execute(select(Teacher.id, Teacher.user_id).where(Teacher.id.in_(teacher_ids))).all()
        )
        lock_participants(db, actor, student_ids=[student_id], teacher_ids=teacher_ids)
        student = db.get(Student, student_id)
        teachers = [db.get(Teacher, identity) for identity in sorted(teacher_owners)]
        period = db.scalar(
            select(AcademicPeriod)
            .where(AcademicPeriod.id == period_id)
            .with_for_update(read=True)
            .execution_options(populate_existing=True)
        )
        topic = lock_topic(db, topic_id)
        if (
            topic is None
            or topic.supervisor_id != supervisor_id
            or topic.period_id != period_id
            or student.user_id != student_owner
            or any(teacher.user_id != teacher_owners[teacher.id] for teacher in teachers)
        ):
            db.rollback()
            continue
        if period is None:
            raise HTTPException(status_code=409, detail="Academic period not found")
        applications = lock_student_applications(db, student_id, application_id=application_id)
        return WorkflowRows(
            student,
            next((row for row in teachers if row.id == supervisor_id), None),
            period,
            topic,
            applications,
        )
    raise HTTPException(status_code=409, detail="Workflow participants changed; retry command")


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


def withdraw_other_applications(
    applications: list[Application],
    actor_id: int,
    now: datetime,
    *,
    keep_application_id: int | None = None,
) -> None:
    """Withdraw the already locked group; no new locks after the final time check.

    Other pending rows are withdrawn even if overdue: only a separately completed
    expiration command takes precedence over this assignment transition.
    """
    for application in applications:
        if application.id == keep_application_id or application.status != ApplicationStatus.PENDING:
            continue
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


def check_locked_assignment_capacity(db: Session, rows: WorkflowRows) -> Teacher:
    """Validate using already locked parents; never go back from A/T to S/H."""
    teacher = require_available_supervisor(rows.teacher)
    check_assignment_student(rows.student, rows.topic)
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
    check_assignment_availability(db, rows.student.id, rows.topic.id)
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
