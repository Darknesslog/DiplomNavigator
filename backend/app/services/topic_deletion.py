"""Supervisor deletion requests and scoped manager decisions."""

from datetime import UTC, datetime

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models import (
    Notification,
    Topic,
    TopicArchiveReason,
    TopicDeletionRequest,
    TopicDeletionRequestStatus,
    TopicStatus,
    User,
    UserRole,
)
from backend.app.models.enums import NotificationKind
from backend.app.services.lifecycle_guards import check_topic_closure
from backend.app.services.locking import lock_participants, lock_topic


def create_topic_deletion_request(
    db: Session, actor: User, topic_id: int, reason: str | None
) -> TopicDeletionRequest:
    """Create one pending deletion request for the supervisor's own topic."""
    if actor.role != UserRole.NAUCHRUK or actor.teacher is None:
        raise HTTPException(status_code=403, detail="Only supervisors may request topic deletion")
    lock_participants(db, actor)
    topic = lock_topic(db, topic_id)
    if topic.supervisor_id != actor.teacher.id:
        raise HTTPException(status_code=403, detail="Topic belongs to another supervisor")
    if topic.status == TopicStatus.ARCHIVED:
        raise HTTPException(status_code=409, detail="Archived topics cannot be deleted")
    if db.scalar(
        select(TopicDeletionRequest.id).where(
            TopicDeletionRequest.topic_id == topic_id,
            TopicDeletionRequest.status == TopicDeletionRequestStatus.PENDING,
        )
    ):
        raise HTTPException(status_code=409, detail="Topic already has a pending deletion request")
    request = TopicDeletionRequest(
        topic_id=topic_id,
        requested_by_user_id=actor.id,
        reason=reason,
        status=TopicDeletionRequestStatus.PENDING,
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def decide_topic_deletion_request(
    db: Session,
    actor: User,
    request_id: int,
    comment: str | None,
    *,
    approve: bool,
) -> TopicDeletionRequest:
    """Approve or reject a deletion request within the actor's scope."""
    request = db.get(TopicDeletionRequest, request_id)
    if request is None:
        raise HTTPException(status_code=404, detail="Topic deletion request not found")
    lock_participants(db, actor, user_ids=[request.requested_by_user_id])
    topic = lock_topic(db, request.topic_id)
    request = db.scalar(
        select(TopicDeletionRequest)
        .where(TopicDeletionRequest.id == request_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    if actor.role == UserRole.ADMIN:
        pass
    elif actor.role == UserRole.ZAVKAF and actor.teacher is not None:
        if actor.teacher.department_id != topic.department_id:
            raise HTTPException(status_code=403, detail="Topic is outside your department")
    else:
        raise HTTPException(
            status_code=403, detail="Only department heads may decide deletion requests"
        )
    if request.status != TopicDeletionRequestStatus.PENDING:
        raise HTTPException(
            status_code=409, detail="Topic deletion request has already been decided"
        )
    if topic.status == TopicStatus.ARCHIVED:
        raise HTTPException(status_code=409, detail="Topic is already archived")
    if approve:
        check_topic_closure(db, topic.id)
    request.status = (
        TopicDeletionRequestStatus.APPROVED if approve else TopicDeletionRequestStatus.REJECTED
    )
    request.decided_by_user_id = actor.id
    request.decided_at = datetime.now(UTC)
    request.decision_comment = comment
    if approve:
        topic.status = TopicStatus.ARCHIVED
        topic.published_at = None
        topic.archived_at = request.decided_at
        topic.archive_reason = TopicArchiveReason.DELETED
    db.add(
        Notification(
            user_id=request.requested_by_user_id,
            kind=NotificationKind.TOPIC_DELETION_APPROVED
            if approve
            else NotificationKind.TOPIC_DELETION_REJECTED,
            title="Удаление темы одобрено" if approve else "Удаление темы отклонено",
            body=comment,
            created_at=request.decided_at,
            payload={"topic_id": topic.id, "request_id": request.id},
            is_read=False,
        )
    )
    db.commit()
    db.refresh(request)
    return request


def topic_deletion_requests(
    db: Session, actor: User, offset: int, limit: int
) -> list[TopicDeletionRequest]:
    """List deletion requests visible to a supervisor, head, or admin."""
    statement = select(TopicDeletionRequest).join(TopicDeletionRequest.topic)
    if actor.role == UserRole.NAUCHRUK and actor.teacher is not None:
        statement = statement.where(Topic.supervisor_id == actor.teacher.id)
    elif actor.role == UserRole.ZAVKAF and actor.teacher is not None:
        statement = statement.where(Topic.department_id == actor.teacher.department_id)
    elif actor.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Insufficient role")
    return list(
        db.scalars(
            statement.order_by(
                TopicDeletionRequest.created_at.desc(), TopicDeletionRequest.id.desc()
            )
            .offset(offset)
            .limit(limit)
        )
    )
