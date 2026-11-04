"""Topic creation, listing, and department moderation endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.dependencies import CurrentUser, DbSession, require_roles
from app.models import Topic, TopicStatus, User, UserRole
from app.schemas.application import ApplicationCreate, StudentApplicationResponse
from app.schemas.topic import TopicCreate, TopicResponse, TopicStatusUpdate
from app.services.application import (
    create_application,
    expire_overdue_applications,
    student_topic_query,
)
from app.services.topic import create_topic, get_topic, moderate_topic, topic_query

router = APIRouter(prefix="/topics", tags=["topics"])
TopicManager = Annotated[
    User, Depends(require_roles(UserRole.ADMIN, UserRole.NAUCHRUK, UserRole.ZAVKAF))
]
Student = Annotated[User, Depends(require_roles(UserRole.STUDENT))]
Moderator = Annotated[User, Depends(require_roles(UserRole.ADMIN, UserRole.ZAVKAF))]


@router.post("", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create(data: TopicCreate, db: DbSession, actor: TopicManager) -> Topic:
    """Create a draft topic owned by the authenticated supervisor or department."""
    return create_topic(db, data, actor)


@router.get("", response_model=list[TopicResponse])
def list_topics(
    db: DbSession,
    actor: CurrentUser,
    topic_status: Annotated[TopicStatus | None, Query(alias="status")] = None,
    period_id: Annotated[int | None, Query(gt=0)] = None,
    department_id: Annotated[int | None, Query(gt=0)] = None,
    supervisor_id: Annotated[int | None, Query(gt=0)] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[TopicResponse]:
    """List only topics visible to the authenticated role."""
    if expire_overdue_applications(db):
        db.commit()
    if actor.role == UserRole.STUDENT:
        statement = student_topic_query(actor)
    else:
        statement = topic_query(actor, status_filter=topic_status)
    if topic_status is not None:
        statement = statement.where(Topic.status == topic_status)
    if period_id is not None:
        statement = statement.where(Topic.period_id == period_id)
    if department_id is not None:
        statement = statement.where(Topic.department_id == department_id)
    if supervisor_id is not None:
        statement = statement.where(Topic.supervisor_id == supervisor_id)
    return list(db.scalars(statement.order_by(Topic.id).offset(offset).limit(limit)))


@router.post(
    "/{topic_id}/applications",
    response_model=StudentApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_for_topic(
    topic_id: int, data: ApplicationCreate, db: DbSession, actor: Student
) -> StudentApplicationResponse:
    """Submit a pending topic application for the authenticated student."""
    return create_application(db, actor, topic_id, data)


@router.get("/{topic_id}", response_model=TopicResponse)
def read_topic(topic_id: int, db: DbSession, actor: CurrentUser) -> TopicResponse:
    """Return one visible topic."""
    return get_topic(db, actor, topic_id)


@router.patch("/{topic_id}/status", response_model=TopicResponse)
def update_status(
    topic_id: int, data: TopicStatusUpdate, db: DbSession, actor: Moderator
) -> TopicResponse:
    """Moderate a topic in the moderator's department."""
    return moderate_topic(db, actor, topic_id, data)
