"""Read-only directory and recipient queries used by lightweight HTTP routes."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models import AcademicPeriod, Notification, StudyGroup


def recipient_notifications(
    db: Session, user_id: int, offset: int, limit: int
) -> list[Notification]:
    return list(
        db.scalars(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.id.desc())
            .offset(offset)
            .limit(limit)
        )
    )


def study_groups(db: Session, offset: int, limit: int) -> list[StudyGroup]:
    return list(db.scalars(select(StudyGroup).order_by(StudyGroup.id).offset(offset).limit(limit)))


def academic_periods(db: Session, offset: int, limit: int) -> list[AcademicPeriod]:
    return list(
        db.scalars(select(AcademicPeriod).order_by(AcademicPeriod.id).offset(offset).limit(limit))
    )
