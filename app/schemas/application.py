"""API contracts for student topic applications."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ApplicationStatus


class ApplicationCreate(BaseModel):
    """Fields submitted by a student when reserving a topic."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    motivation: str | None = Field(default=None, max_length=2000)


class StudentApplicationResponse(BaseModel):
    """Application representation visible to its student."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    topic_id: int
    status: ApplicationStatus
    motivation: str | None
    expires_at: datetime | None
    cooldown_until: datetime | None
    decided_by_user_id: int | None
    decided_at: datetime | None
    decision_comment: str | None
    created_at: datetime
    updated_at: datetime
