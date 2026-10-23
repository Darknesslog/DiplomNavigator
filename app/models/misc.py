"""Вложения и уведомления."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    JSON,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin


class Attachment(IdMixin, TimestampMixin, Base):
    """Файл, прикреплённый к теме или к заявке.

    Одна таблица вместо двух: у вложения ровно один владелец, это проверяется
    CHECK-ограничением. Полиморфная пара (owner_type, owner_id) не подошла —
    с ней нельзя поставить внешний ключ и БД перестаёт следить за целостностью.
    """

    __tablename__ = "attachments"
    __table_args__ = (
        CheckConstraint(
            "num_nonnulls(topic_id, application_id) = 1",
            name="exactly_one_owner",
        ),
        Index("ix_attachments_topic_id", "topic_id"),
        Index("ix_attachments_application_id", "application_id"),
        {"comment": "Файлы, прикреплённые к темам и заявкам"},
    )

    topic_id: Mapped[int | None] = mapped_column(
        ForeignKey("topics.id", ondelete="CASCADE"), nullable=True, comment="Тема-владелец файла"
    )
    application_id: Mapped[int | None] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=True,
        comment="Заявка-владелец файла",
    )
    original_name: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Имя файла, которое видел пользователь"
    )
    storage_key: Mapped[str] = mapped_column(
        String(500), nullable=False, unique=True, comment="Путь/ключ в хранилище (S3, диск)"
    )
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True, comment="MIME-тип")
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False, comment="Размер в байтах")
    uploaded_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, comment="Кто загрузил"
    )

    topic: Mapped[Topic | None] = relationship(back_populates="attachments")
    application: Mapped[Application | None] = relationship(back_populates="attachments")


class Notification(IdMixin, Base):
    """Уведомление пользователя.

    payload — произвольный JSON: ссылки и контекст, которые не хочется
    превращать в отдельные колонки на каждое событие.
    """

    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_user_id_is_read", "user_id", "is_read"),
        {"comment": "Уведомления пользователей"},
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, comment="Получатель"
    )
    kind: Mapped[str] = mapped_column(
        String(50), nullable=False, comment="Тип события, например application_approved"
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False, comment="Заголовок")
    body: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Текст уведомления")
    payload: Mapped[dict[str, Any] | None] = mapped_column(
        JSON().with_variant(JSONB(), "postgresql"), nullable=True, comment="Служебные данные события"
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false", comment="Прочитано ли"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
        comment="Когда создано",
    )
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, comment="Когда прочитано"
    )

    user: Mapped[User] = relationship(back_populates="notifications")
