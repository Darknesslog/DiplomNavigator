"""Перечисления предметной области.

Осознанно используется `Enum(..., native_enum=False)`: в БД это VARCHAR + CHECK,
а не нативный enum Postgres. Причины:

* добавить значение в нативный enum в миграции можно, а удалить/переименовать —
  только пересоздав тип и переписав все зависимые колонки;
* нативные enum плохо переносятся между окружениями (dev/test/prod) и ломают
  autogenerate, если тип создан вручную;
* для студенческого проекта цена «правильного» enum'а выше выгоды.

В Python при этом остаются полноценные StrEnum — типизация и автодополнение
никуда не исчезают.
"""

from __future__ import annotations

from enum import StrEnum

from sqlalchemy import Enum


class UserRole(StrEnum):
    """Роль пользователя в системе."""

    STUDENT = "student"
    NAUCHRUK = "nauchruk"
    ZAVKAF = "zavkaf"
    ADMIN = "admin"


class PeriodStatus(StrEnum):
    """Состояние периода выбора тем."""

    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    ARCHIVED = "archived"


class Semester(StrEnum):
    """Семестр учебного года."""

    AUTUMN = "autumn"
    SPRING = "spring"


class TopicStatus(StrEnum):
    """Жизненный цикл темы."""

    DRAFT = "draft"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class TopicArchiveReason(StrEnum):
    """Why a topic was moved to the archive."""

    DELETED = "deleted"
    COMPLETED = "completed"
    EXPIRED = "expired"


class TopicSource(StrEnum):
    """Кто предложил тему."""

    TEACHER = "teacher"
    STUDENT = "student"
    COMPANY = "company"


class ApplicationStatus(StrEnum):
    """Статус заявки студента на тему."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    EXPIRED = "expired"


class AssignmentStatus(StrEnum):
    """Статус итогового закрепления темы за студентом."""

    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AssignmentStage(StrEnum):
    """Current stage of the graduation work."""

    IN_PROGRESS = "in_progress"
    UNDER_REVIEW = "under_review"
    ADMITTED_TO_DEFENSE = "admitted_to_defense"
    DEFENDED = "defended"


def db_enum(enum_cls: type[StrEnum], name: str, length: int = 32) -> Enum:
    """Собирает VARCHAR + CHECK колонку из Python-перечисления.

    `values_callable` важен: без него SQLAlchemy пишет в БД имена членов
    (STUDENT), а не значения (student), и в SQL-отчётах появляется неожиданный
    регистр.
    """
    return Enum(
        enum_cls,
        name=name,
        native_enum=False,
        create_constraint=True,
        length=length,
        validate_strings=True,
        values_callable=lambda cls: [member.value for member in cls],
    )
