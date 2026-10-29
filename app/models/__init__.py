"""Все ORM-модели проекта.

Модуль импортирует каждую модель, чтобы `Base.metadata` содержал полную схему.
Alembic и скрипты генерации SQL/документации работают именно через него.
"""

from __future__ import annotations

from app.models.accounts import Student, Teacher, User
from app.models.base import Base, IdMixin, TimestampMixin
from app.models.enums import (
    ApplicationStatus,
    AssignmentStage,
    AssignmentStatus,
    PeriodStatus,
    Semester,
    TopicSource,
    TopicStatus,
    UserRole,
)
from app.models.misc import Attachment, Notification
from app.models.period import AcademicPeriod
from app.models.refs import Department, Faculty, StudyGroup
from app.models.topic import Topic
from app.models.workflow import Application, ApplicationStatusHistory, Assignment

__all__ = [
    "AcademicPeriod",
    "Application",
    "ApplicationStatus",
    "ApplicationStatusHistory",
    "Assignment",
    "AssignmentStage",
    "AssignmentStatus",
    "Attachment",
    "Base",
    "Department",
    "Faculty",
    "IdMixin",
    "Notification",
    "PeriodStatus",
    "Semester",
    "Student",
    "StudyGroup",
    "Teacher",
    "TimestampMixin",
    "Topic",
    "TopicSource",
    "TopicStatus",
    "User",
    "UserRole",
]
