"""Department management inputs and notification output contracts."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.dashboard import SupervisorWorkload


class SupervisorLimitUpdate(BaseModel):
    """New per-supervisor limit; existing active assignments cannot be invalidated."""

    model_config = ConfigDict(extra="forbid")
    max_students: int = Field(ge=1, le=32767)


class LimitUpdateResponse(BaseModel):
    """Updated supervisor and freshly calculated workload of the entire department."""

    supervisor: SupervisorWorkload
    department_workload: list[SupervisorWorkload]


class ManualAssignmentCreate(BaseModel):
    """Assign a free published topic without bypassing capacity or department checks."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    student_id: int = Field(gt=0)
    topic_id: int = Field(gt=0)
    comment: str = Field(min_length=1, max_length=2000)


class NotificationResponse(BaseModel):
    """Persisted in-app notification belonging to the authenticated recipient."""

    model_config = ConfigDict(from_attributes=True)
    id: int
    kind: str
    title: str
    body: str | None
    payload: dict[str, Any] | None
    is_read: bool
    created_at: datetime


class StudyGroupResponse(BaseModel):
    """Study-group directory for managed student creation."""

    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    faculty_id: int
    enrollment_year: int


class PeriodResponse(BaseModel):
    """Academic period identity needed when proposing a topic."""

    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    academic_year: int
