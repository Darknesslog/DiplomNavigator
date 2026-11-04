"""API contracts for supervisor application and progress workflows."""

from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, computed_field

from app.models.enums import AssignmentStage, AssignmentStatus
from app.schemas.application import StudentApplicationResponse
from app.schemas.presentation import (
    ASSIGNMENT_LABELS,
    STAGE_LABELS,
    StudentSummary,
    TopicSummary,
)


class ApplicationResponse(StudentApplicationResponse):
    """A student application visible to its topic supervisor."""


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
    student: StudentSummary
    topic: TopicSummary

    @computed_field
    @property
    def group_name(self) -> str:
        """Expose the group without requiring another API request."""
        return self.student.group_name

    @computed_field
    @property
    def status_label(self) -> str:
        """Return the display label for the assignment status."""
        return ASSIGNMENT_LABELS[self.status]

    @computed_field
    @property
    def current_stage_label(self) -> str:
        """Return the display label for the current work stage."""
        return STAGE_LABELS[self.current_stage]


class AssignmentProgressUpdate(BaseModel):
    """A validated progress update for an assignment."""

    model_config = ConfigDict(extra="forbid")

    progress_percent: int = Field(ge=0, le=100)
    current_stage: AssignmentStage = Field(
        validation_alias=AliasChoices("current_stage", "status"),
        description="Этап работы. admitted_to_defense принудительно устанавливает 100%.",
    )
