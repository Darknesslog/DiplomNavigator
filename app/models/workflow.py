"""Процесс выбора темы: заявки, история статусов, итоговые закрепления."""

from __future__ import annotations

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin
from app.models.enums import ApplicationStatus, AssignmentStage, AssignmentStatus, db_enum

if TYPE_CHECKING:
    from app.models.accounts import Student, Teacher, User
    from app.models.misc import Attachment
    from app.models.topic import Topic

class Application(IdMixin, TimestampMixin, Base):
    """Заявка студента на тему.

    Заявка — это намерение, а не факт. Факт закрепления живёт в assignments,
    потому что у заявки бывает отказ или отзыв, а закрепление остаётся.
    """

    __tablename__ = "applications"
    __table_args__ = (
        # Один студент не может иметь две активные заявки на одну тему.
        # Частичный индекс вместо обычного UNIQUE: после отказа или отзыва
        # студент вправе подать заявку снова.
        Index(
            "uq_applications_student_id_topic_id_active",
            "student_id",
            "topic_id",
            unique=True,
            postgresql_where=text("status IN ('pending', 'approved')"),
        ),
        Index("ix_applications_status", "status"),
        {"comment": "Заявки студентов на темы"},
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Кто подал заявку",
    )
    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="На какую тему",
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        db_enum(ApplicationStatus, "application_status"),
        nullable=False,
        server_default="pending",
        comment="pending / approved / rejected / withdrawn",
    )
    motivation: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="Почему студент хочет эту тему"
    )
    decided_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Кто принял решение по заявке",
    )
    decided_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Когда принято решение"
    )
    decision_comment: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="Комментарий к решению"
    )
    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Дедлайн решения по заявке"
    )
    cooldown_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="До какого момента запрещена повторная заявка"
    )

    student: Mapped[Student] = relationship(back_populates="applications")
    topic: Mapped[Topic] = relationship(back_populates="applications")
    decided_by: Mapped[User | None] = relationship(foreign_keys=[decided_by_user_id])
    history: Mapped[list[ApplicationStatusHistory]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    attachments: Mapped[list[Attachment]] = relationship(back_populates="application")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Application id={self.id} status={self.status}>"


class ApplicationStatusHistory(IdMixin, Base):
    """История переходов заявки между статусами.

    Отдельная таблица, а не поля updated_at/updated_by: на разборе «кто отклонил
    и почему» нужен весь путь, а не последний шаг.
    """

    __tablename__ = "application_status_history"
    __table_args__ = (
        Index("ix_application_status_history_application_id_created_at", "application_id", "created_at"),
        {"comment": "История изменения статусов заявок"},
    )

    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        comment="Заявка",
    )
    # Имена enum-ов разные, хотя тип один: CHECK-ограничения получают имя
    # из этого параметра, и два одинаковых имени в одной таблице Postgres
    # не разрешит.
    from_status: Mapped[ApplicationStatus | None] = mapped_column(
        db_enum(ApplicationStatus, "application_status_from"),
        nullable=True,
        comment="Предыдущий статус, NULL для создания заявки",
    )
    to_status: Mapped[ApplicationStatus] = mapped_column(
        db_enum(ApplicationStatus, "application_status_to"),
        nullable=False,
        comment="Новый статус",
    )
    changed_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="Кто изменил статус",
    )
    comment: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Причина перехода")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
        comment="Когда произошёл переход",
    )

    application: Mapped[Application] = relationship(back_populates="history")
    changed_by: Mapped[User | None] = relationship(foreign_keys=[changed_by_user_id])


class Assignment(IdMixin, TimestampMixin, Base):
    """Закрепление темы за студентом — итоговый факт.

    Два ограничения держат бизнес-правило на уровне БД:
    * у студента не больше одного активного закрепления (частичный UNIQUE);
    * одну и ту же тему нельзя закрепить за одним студентом дважды.
    """

    __tablename__ = "assignments"
    __table_args__ = (
        Index(
            "uq_assignments_student_id_active",
            "student_id",
            unique=True,
            postgresql_where=text("status = 'active'"),
        ),
        CheckConstraint(
            "status <> 'cancelled' OR cancel_reason IS NOT NULL",
            name="cancelled_requires_reason",
        ),
        {"comment": "Итоговые закрепления тем за студентами"},
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Студент",
    )
    topic_id: Mapped[int] = mapped_column(
        ForeignKey("topics.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Тема",
    )
    supervisor_id: Mapped[int] = mapped_column(
        ForeignKey("teachers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Научный руководитель на момент закрепления",
    )
    status: Mapped[AssignmentStatus] = mapped_column(
        db_enum(AssignmentStatus, "assignment_status"),
        nullable=False,
        server_default="active",
        comment="active / completed / cancelled",
    )
    progress_percent: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        server_default=text("0"),
        comment="Процент выполнения от 0 до 100",
    )
    current_stage: Mapped[AssignmentStage] = mapped_column(
        db_enum(AssignmentStage, "assignment_stage"),
        nullable=False,
        server_default="in_progress",
        comment="Текущий этап работы",
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
        comment="Когда тема закреплена",
    )
    order_number: Mapped[str | None] = mapped_column(
        String(50), nullable=True, comment="Номер приказа о закреплении тем"
    )
    order_date: Mapped[date | None] = mapped_column(
        Date, nullable=True, comment="Дата приказа"
    )
    cancel_reason: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="Причина отмены закрепления"
    )

    student: Mapped[Student] = relationship(back_populates="assignments")
    topic: Mapped[Topic] = relationship(back_populates="assignments")
    supervisor: Mapped[Teacher] = relationship(back_populates="assignments")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Assignment student={self.student_id} topic={self.topic_id}>"
