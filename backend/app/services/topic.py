"""Authorization and persistence helpers for graduation-work topics."""

from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from backend.app.models import (
    AcademicPeriod,
    Student,
    Teacher,
    Topic,
    TopicArchiveReason,
    TopicSource,
    TopicStatus,
    User,
    UserRole,
)
from backend.app.schemas.topic import TopicCreate, TopicStatusUpdate
from backend.app.services.accounts import department_id, require_department
from backend.app.services.application import expire_overdue_applications, student_topic_query


def require_period(db: Session, period_id: int) -> AcademicPeriod:
    """Load the period referenced by a topic."""
    period = db.get(AcademicPeriod, period_id)
    if period is None:
        raise HTTPException(status_code=404, detail="Academic period not found")
    return period


def require_teacher(db: Session, teacher_id: int) -> Teacher:
    """Load a supervisor profile."""
    teacher = db.get(Teacher, teacher_id)
    if teacher is None:
        raise HTTPException(status_code=404, detail="Supervisor not found")
    return teacher


def check_topic_scope(actor: User, topic: Topic) -> None:
    """Ensure an actor can see or moderate a topic."""
    if actor.role == UserRole.ADMIN:
        return
    own_department = department_id(actor)
    if own_department is None or topic.department_id != own_department:
        raise HTTPException(status_code=403, detail="Topic is outside your department")
    if actor.role == UserRole.NAUCHRUK and topic.supervisor.user_id != actor.id:
        raise HTTPException(status_code=403, detail="Topic belongs to another supervisor")


def topic_supervisor_id(actor: User, data: TopicCreate) -> int:
    """Resolve the proposed owner and enforce supervisor source/ownership rules."""
    supervisor_id = data.supervisor_id
    if actor.role == UserRole.NAUCHRUK:
        if actor.teacher is None:
            raise HTTPException(status_code=409, detail="Supervisor profile is required")
        if supervisor_id is not None and supervisor_id != actor.teacher.id:
            raise HTTPException(
                status_code=403, detail="Cannot create a topic for another supervisor"
            )
        supervisor_id = actor.teacher.id
    elif supervisor_id is None:
        raise HTTPException(status_code=422, detail="supervisor_id is required")
    if actor.role == UserRole.NAUCHRUK and data.source != TopicSource.TEACHER:
        raise HTTPException(status_code=403, detail="Supervisors may create only their own topics")

    return supervisor_id


def check_proposing_student(db: Session, student_id: int | None, topic_department_id: int) -> None:
    """Validate the optional student proposal without coupling it to topic construction."""
    if student_id is not None:
        student = db.get(Student, student_id)
        if student is None:
            raise HTTPException(status_code=404, detail="Proposing student not found")
        if student.department_id != topic_department_id:
            raise HTTPException(
                status_code=409, detail="Proposing student is outside the topic department"
            )


def create_topic(db: Session, data: TopicCreate, actor: User) -> Topic:
    """Validate a proposal and apply the agreed topic publication rule."""
    require_period(db, data.period_id)

    supervisor_id = topic_supervisor_id(actor, data)
    supervisor = require_teacher(db, supervisor_id)
    topic_department_id = data.department_id or supervisor.department_id
    if topic_department_id != supervisor.department_id:
        raise HTTPException(status_code=409, detail="Supervisor and topic departments must match")
    if actor.role == UserRole.ZAVKAF and topic_department_id != department_id(actor):
        raise HTTPException(status_code=403, detail="Topic is outside your department")
    require_department(db, topic_department_id)
    check_proposing_student(db, data.proposed_by_student_id, topic_department_id)

    is_published_company_topic = (
        actor.role == UserRole.ZAVKAF and data.source == TopicSource.COMPANY
    )
    now = datetime.now(UTC) if is_published_company_topic else None
    topic = Topic(
        period_id=data.period_id,
        supervisor_id=supervisor.id,
        department_id=topic_department_id,
        created_by_user_id=actor.id,
        title=data.title,
        description=data.description,
        source=data.source,
        company_name=data.company_name,
        proposed_by_student_id=data.proposed_by_student_id,
        status=TopicStatus.PUBLISHED if is_published_company_topic else TopicStatus.DRAFT,
        published_at=now,
    )
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


def topic_query(actor: User, *, status_filter: TopicStatus | None = None) -> Select[tuple[Topic]]:
    """Build the visibility query shared by list and detail endpoints."""
    statement = select(Topic)
    if status_filter is not None:
        statement = statement.where(Topic.status == status_filter)
    if actor.role == UserRole.STUDENT:
        return statement.where(Topic.status == TopicStatus.PUBLISHED)
    if actor.role == UserRole.ADMIN:
        return statement
    own_department = department_id(actor)
    if own_department is None:
        return statement.where(Topic.id == -1)
    statement = statement.where(Topic.department_id == own_department)
    if actor.role == UserRole.NAUCHRUK:
        statement = statement.where(Topic.supervisor.has(Teacher.user_id == actor.id))
    return statement


def get_topic(db: Session, actor: User, topic_id: int) -> Topic:
    """Load a topic only when it is visible to the caller."""
    if expire_overdue_applications(db):
        db.commit()
    statement = student_topic_query(actor) if actor.role == UserRole.STUDENT else topic_query(actor)
    topic = db.scalar(statement.where(Topic.id == topic_id))
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


def list_visible_topics(
    db: Session,
    actor: User,
    topic_status: TopicStatus | None,
    period_id: int | None,
    department_id: int | None,
    supervisor_id: int | None,
    offset: int,
    limit: int,
) -> list[Topic]:
    """Read scoped topics with the HTTP filters, without mutating their lifecycle."""
    statement = (
        student_topic_query(actor)
        if actor.role == UserRole.STUDENT
        else topic_query(actor, status_filter=topic_status)
    )
    filters = (
        (Topic.status, topic_status),
        (Topic.period_id, period_id),
        (Topic.department_id, department_id),
        (Topic.supervisor_id, supervisor_id),
    )
    for column, value in filters:
        if value is not None:
            statement = statement.where(column == value)
    return list(db.scalars(statement.order_by(Topic.id).offset(offset).limit(limit)))


def moderate_topic(db: Session, actor: User, topic_id: int, data: TopicStatusUpdate) -> Topic:
    """Publish, reject, or archive a topic inside the moderator's department."""
    topic = db.get(Topic, topic_id)
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    check_topic_scope(actor, topic)
    if actor.role not in (UserRole.ADMIN, UserRole.ZAVKAF):
        raise HTTPException(status_code=403, detail="Only department heads may moderate topics")
    if data.status == TopicStatus.DRAFT:
        raise HTTPException(status_code=422, detail="A topic cannot be returned to draft")
    if topic.status == TopicStatus.ARCHIVED:
        raise HTTPException(status_code=409, detail="Archived topics cannot be moderated")
    topic.status = data.status
    topic.published_at = datetime.now(UTC) if data.status == TopicStatus.PUBLISHED else None
    if data.status == TopicStatus.ARCHIVED:
        topic.archived_at = datetime.now(UTC)
        topic.archive_reason = TopicArchiveReason.DELETED
    else:
        topic.archived_at = None
        topic.archive_reason = None
    db.commit()
    db.refresh(topic)
    return topic
