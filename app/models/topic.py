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
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin
from app.models.enums import TopicSource, TopicStatus, db_enum

if TYPE_CHECKING:
    from app.models.accounts import Student, Teacher, User
    from app.models.misc import Attachment
    from app.models.period import AcademicPeriod
    from app.models.refs import Department
    from app.models.workflow import Application, Assignment

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

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Topic id={self.id} {self.title[:40]!r}>"
