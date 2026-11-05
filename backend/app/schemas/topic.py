"""Pydantic contracts for graduation-work topics."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator

from backend.app.models.enums import TopicArchiveReason, TopicSource, TopicStatus
from backend.app.schemas.presentation import TOPIC_LABELS


class TopicCreate(BaseModel):
    """Fields used to create a topic; ownership is checked by the service."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    period_id: int = Field(gt=0)
    supervisor_id: int | None = Field(default=None, gt=0)
    department_id: int | None = Field(default=None, gt=0)
    title: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1, max_length=2000)
    source: TopicSource = TopicSource.TEACHER
    company_name: str | None = Field(default=None, max_length=200)
    proposed_by_student_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_company_source(self) -> "TopicCreate":
        """A company name is meaningful only for company-proposed topics."""
        if self.source == TopicSource.COMPANY and not self.company_name:
            raise ValueError("company_name is required for company topics")
        if self.source != TopicSource.COMPANY and self.company_name is not None:
            raise ValueError("company_name is allowed only for company topics")
        if self.source == TopicSource.STUDENT and self.proposed_by_student_id is None:
            raise ValueError("proposed_by_student_id is required for student topics")
        if self.source != TopicSource.STUDENT and self.proposed_by_student_id is not None:
            raise ValueError("proposed_by_student_id is allowed only for student topics")
        return self


class TopicStatusUpdate(BaseModel):
    """A moderation status transition."""

    model_config = ConfigDict(extra="forbid")

    status: TopicStatus


class TopicResponse(BaseModel):
    """Public topic representation."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    period_id: int
    supervisor_id: int
    department_id: int | None
    created_by_user_id: int
    proposed_by_student_id: int | None
    title: str
    description: str
    status: TopicStatus
    source: TopicSource
    company_name: str | None
    published_at: datetime | None
    archived_at: datetime | None
    archive_reason: TopicArchiveReason | None
    created_at: datetime
    updated_at: datetime
    is_reserved: bool = Field(
        description="Тема уже закреплена за студентом и недоступна для новой заявки."
    )

    @computed_field
    @property
    def status_label(self) -> str:
        """Display a localized label while preserving the existing status enum."""
        if self.status == TopicStatus.ARCHIVED and self.archive_reason == TopicArchiveReason.COMPLETED:
            return "В архиве (завершена)"
        if self.status == TopicStatus.PUBLISHED and self.is_reserved:
            return "Занята"
        return TOPIC_LABELS[self.status]
