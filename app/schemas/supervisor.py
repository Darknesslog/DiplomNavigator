"""API contracts for supervisor application and progress workflows."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ApplicationStatus, AssignmentStage, AssignmentStatus


class ApplicationResponse(BaseModel):
    """A student application visible to its topic supervisor."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    topic_id: int
    status: ApplicationStatus
    motivation: str | None
    decided_by_user_id: int | None
    decided_at: datetime | None
    decision_comment: str | None
    expires_at: datetime | None
    cooldown_until: datetime | None
    created_at: datetime
    updated_at: datetime


class ApplicationDecision(BaseModel):
    """Optional explanation attached to an approval or rejection."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    comment: str | None = Field(default=None, max_length=2000)


class AssignmentResponse(BaseModel):
    """A supervisor's active or completed student assignment."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    topic_id: int
    supervisor_id: int
    status: AssignmentStatus
    progress_percent: int
    current_stage: AssignmentStage
    assigned_at: datetime
    created_at: datetime
    updated_at: datetime


class AssignmentProgressUpdate(BaseModel):
    """A validated progress update for an assignment."""

    model_config = ConfigDict(extra="forbid")

    progress_percent: int = Field(ge=0, le=100)
    current_stage: AssignmentStage
