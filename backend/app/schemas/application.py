"""API contracts for student topic applications."""

from datetime import datetime

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, computed_field

from backend.app.models.enums import ApplicationStatus
from backend.app.schemas.presentation import APPLICATION_LABELS, StudentSummary, TopicSummary


class ApplicationCreate(BaseModel):
    """Fields submitted by a student when reserving a topic."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    motivation: str | None = Field(
        default=None,
        max_length=2000,
        validation_alias=AliasChoices("motivation", "justification"),
        description="Обоснование заявки; также принимается ключ justification.",
    )


class StudentApplicationResponse(BaseModel):
    """Application representation visible to its student."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    topic_id: int
    status: ApplicationStatus
    motivation: str | None
    expires_at: datetime | None = Field(description="Дедлайн решения; null у старых заявок.")
    cooldown_until: datetime | None = Field(
        description="Запрет повторной заявки для пары студент–тема; не блокировка входа."
    )
    decided_by_user_id: int | None
    decided_at: datetime | None
    decision_comment: str | None
    created_at: datetime
    updated_at: datetime
    student: StudentSummary
    topic: TopicSummary

    @computed_field(description="Учебная группа для строки таблицы заявок.")
    @property
    def group_name(self) -> str:
        """Expose the group on the application card."""
        return self.student.group_name

    @computed_field(description="Обоснование заявки; совпадает с motivation.")
    @property
    def justification(self) -> str | None:
        """Keep the UI term and the existing motivation field in sync."""
        return self.motivation

    @computed_field(description="Русская подпись статуса; status сохраняет значение enum.")
    @property
    def status_label(self) -> str:
        """Localize the label without changing the machine-readable status."""
        return APPLICATION_LABELS[self.status]
