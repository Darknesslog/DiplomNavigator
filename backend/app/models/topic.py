"""Темы выпускных работ."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import Base, IdMixin, TimestampMixin
from backend.app.models.enums import (
    AssignmentStatus,
    TopicArchiveReason,
    TopicDeletionRequestStatus,
    TopicSource,
    TopicStatus,
    db_enum,
)

if TYPE_CHECKING:
    from backend.app.models.accounts import Student, Teacher, User
    from backend.app.models.misc import Attachment
    from backend.app.models.period import AcademicPeriod
    from backend.app.models.refs import Department
    from backend.app.models.workflow import Application, Assignment

class Topic(IdMixin, TimestampMixin, Base):
    """Тема диплома, которую можно взять.

    Тема всегда принадлежит периоду: один и тот же текст в следующем семестре —
    это уже новая тема, иначе статистика по годам смешивается.
    """

    __tablename__ = "topics"
    __table_args__ = (
        Index("ix_topics_period_id_status", "period_id", "status"),
        {"comment": "Темы выпускных квалификационных работ"},
    )

    period_id: Mapped[int] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="RESTRICT"),
        nullable=False,
        comment="Период, в котором тема доступна",
    )
    supervisor_id: Mapped[int] = mapped_column(
        ForeignKey("teachers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Научный руководитель",
    )
    department_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
        comment="Кафедра, за которой закреплена тема",
    )
    created_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Кто создал карточку темы",
    )
    proposed_by_student_id: Mapped[int | None] = mapped_column(
        ForeignKey("students.id", ondelete="SET NULL"),
        nullable=True,
        comment="Студент, если тему предложил он сам",
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False, comment="Формулировка темы")
    description: Mapped[str] = mapped_column(
        Text, nullable=False, comment="Описание, задачи, ожидаемый результат"
    )
    status: Mapped[TopicStatus] = mapped_column(
        db_enum(TopicStatus, "topic_status"),
        nullable=False,
        server_default="draft",
        comment="draft / published / rejected / archived",
    )
    source: Mapped[TopicSource] = mapped_column(
        db_enum(TopicSource, "topic_source"),
        nullable=False,
        server_default="teacher",
        comment="Кто предложил: преподаватель, студент или компания",
    )
    company_name: Mapped[str | None] = mapped_column(
        String(200), nullable=True, comment="Организация, если тема от предприятия"
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Когда тема стала видна студентам"
    )
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Когда тема попала в архив"
    )
    archive_reason: Mapped[TopicArchiveReason | None] = mapped_column(
        db_enum(TopicArchiveReason, "topic_archive_reason"),
        nullable=True,
        comment="Причина архивации: deleted / completed / expired",
    )

    period: Mapped[AcademicPeriod] = relationship(back_populates="topics")
    supervisor: Mapped[Teacher] = relationship(back_populates="topics")
    department: Mapped[Department | None] = relationship(back_populates="topics")
    created_by: Mapped[User] = relationship(foreign_keys=[created_by_user_id])
    proposed_by_student: Mapped[Student | None] = relationship(back_populates="proposed_topics")
    applications: Mapped[list[Application]] = relationship(
        back_populates="topic", cascade="all, delete-orphan"
    )
    assignments: Mapped[list[Assignment]] = relationship(back_populates="topic")
    attachments: Mapped[list[Attachment]] = relationship(back_populates="topic")
    deletion_requests: Mapped[list[TopicDeletionRequest]] = relationship(
        back_populates="topic", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Topic id={self.id} {self.title[:40]!r}>"

    @property
    def is_reserved(self) -> bool:
        """Return whether the topic has an active or completed assignment."""
        return any(
            assignment.status != AssignmentStatus.CANCELLED for assignment in self.assignments
        )


class TopicDeletionRequest(IdMixin, TimestampMixin, Base):
    """Request from a supervisor to archive one of their topics."""

    __tablename__ = "topic_deletion_requests"
    __table_args__ = (
        Index(
            "uq_topic_deletion_requests_topic_pending",
            "topic_id",
            unique=True,
            postgresql_where=text("status = 'pending'"),
            sqlite_where=text("status = 'pending'"),
        ),
        Index("ix_topic_deletion_requests_status", "status"),
    )

    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requested_by_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[TopicDeletionRequestStatus] = mapped_column(
        db_enum(TopicDeletionRequestStatus, "topic_deletion_request_status"),
        nullable=False,
        server_default="pending",
    )
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    decided_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    decision_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    topic: Mapped[Topic] = relationship(back_populates="deletion_requests")
    requested_by: Mapped[User] = relationship(foreign_keys=[requested_by_user_id])
    decided_by: Mapped[User | None] = relationship(foreign_keys=[decided_by_user_id])
