"""Все ORM-модели проекта.

Модуль импортирует каждую модель, чтобы `Base.metadata` содержал полную схему.
Alembic и скрипты генерации SQL/документации работают именно через него.
"""

from __future__ import annotations

from backend.app.models.accounts import Student, Teacher, User
from backend.app.models.base import Base, IdMixin, TimestampMixin
from backend.app.models.enums import (
    ApplicationStatus,
    AssignmentStage,
    AssignmentStatus,
    PeriodStatus,
    Semester,
    TopicArchiveReason,
    TopicDeletionRequestStatus,
    TopicSource,
    TopicStatus,
    UserRole,
)
from backend.app.models.misc import Attachment, Notification
from backend.app.models.period import AcademicPeriod
from backend.app.models.refs import Department, Faculty, StudyGroup
from backend.app.models.topic import Topic, TopicDeletionRequest
from backend.app.models.workflow import Application, ApplicationStatusHistory, Assignment

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
    "TopicArchiveReason",
    "TopicDeletionRequest",
    "TopicDeletionRequestStatus",
    "TopicSource",
    "TopicStatus",
    "User",
    "UserRole",
]
