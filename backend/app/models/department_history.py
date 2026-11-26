"""Audit of actual department changes; historic workflow rows are never moved."""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.models.base import Base, IdMixin


class DepartmentChangeHistory(IdMixin, Base):
    __tablename__ = "department_change_history"
    __table_args__ = (
        CheckConstraint(
            "old_department_id IS NULL OR old_department_id <> new_department_id",
            name="actual_change",
        ),
        Index("ix_department_change_history_user_changed", "user_id", "changed_at"),
    )

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    changed_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"))
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    old_department_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id", ondelete="RESTRICT"), nullable=True
    )
    new_department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id", ondelete="RESTRICT")
    )
