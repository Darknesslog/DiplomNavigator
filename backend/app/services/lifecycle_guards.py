"""Stable blockers read under the profile or topic creation barrier."""

from enum import StrEnum

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models import (
    Application,
    ApplicationStatus,
    Assignment,
    AssignmentStatus,
    Student,
    Teacher,
    Topic,
    TopicStatus,
)


class LifecycleBlockReason(StrEnum):
    PENDING_APPLICATIONS = "pending_applications"
    ACTIVE_ASSIGNMENTS = "active_assignments"
    UNCLOSED_TOPICS = "unclosed_topics"


def reject_blocked(code: str, reasons: list[LifecycleBlockReason]) -> None:
    """Return all blockers in priority order and the first as the primary reason."""
    if reasons:
        raise HTTPException(
            status_code=409,
            detail={"code": code, "reason": reasons[0], "reasons": reasons},
        )


def check_topic_closure(db: Session, topic_id: int) -> None:
    """Any pending (including overdue) or active assignment prevents closure."""
    reasons = []
    if (
        db.scalar(
            select(Application.id)
            .where(
                Application.topic_id == topic_id, Application.status == ApplicationStatus.PENDING
            )
            .limit(1)
        )
        is not None
    ):
        reasons.append(LifecycleBlockReason.PENDING_APPLICATIONS)
    if (
        db.scalar(
            select(Assignment.id)
            .where(Assignment.topic_id == topic_id, Assignment.status == AssignmentStatus.ACTIVE)
            .limit(1)
        )
        is not None
    ):
        reasons.append(LifecycleBlockReason.ACTIVE_ASSIGNMENTS)
    reject_blocked("topic_moderation_blocked", reasons)


def check_department_transfer(
    db: Session, student: Student | None, teacher: Teacher | None
) -> None:
    """Use retained profiles, irrespective of the account's present role."""
    pending = select(Application.id).join(Topic, Topic.id == Application.topic_id)
    active = select(Assignment.id)
    unclosed = select(Topic.id).where(Topic.status != TopicStatus.ARCHIVED)
    if student is not None:
        pending = pending.where(Application.student_id == student.id)
        active = active.where(Assignment.student_id == student.id)
        unclosed = unclosed.where(Topic.proposed_by_student_id == student.id)
    elif teacher is not None:
        pending = pending.where(Topic.supervisor_id == teacher.id)
        active = active.where(Assignment.supervisor_id == teacher.id)
        unclosed = unclosed.where(Topic.supervisor_id == teacher.id)
    else:
        raise HTTPException(status_code=409, detail="User has no student or supervisor profile")
    reasons = []
    for query, reason in (
        (
            pending.where(Application.status == ApplicationStatus.PENDING),
            LifecycleBlockReason.PENDING_APPLICATIONS,
        ),
        (
            active.where(Assignment.status == AssignmentStatus.ACTIVE),
            LifecycleBlockReason.ACTIVE_ASSIGNMENTS,
        ),
        (unclosed, LifecycleBlockReason.UNCLOSED_TOPICS),
    ):
        if db.scalar(query.limit(1)) is not None:
            reasons.append(reason)
    reject_blocked("department_transfer_blocked", reasons)
