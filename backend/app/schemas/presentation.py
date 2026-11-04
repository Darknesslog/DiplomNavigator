"""Shared public identities and Russian labels for the UI contracts."""

from pydantic import AliasChoices, AliasPath, BaseModel, ConfigDict, Field, computed_field

from backend.app.models.enums import (
    ApplicationStatus,
    AssignmentStage,
    AssignmentStatus,
    TopicStatus,
)

APPLICATION_LABELS = {
    ApplicationStatus.PENDING: "На рассмотрении",
    ApplicationStatus.APPROVED: "Одобрена",
    ApplicationStatus.REJECTED: "Отклонена",
    ApplicationStatus.WITHDRAWN: "Отозвана",
    ApplicationStatus.EXPIRED: "Просрочена",
}
ASSIGNMENT_LABELS = {
    AssignmentStatus.ACTIVE: "В работе",
    AssignmentStatus.COMPLETED: "Завершена",
    AssignmentStatus.CANCELLED: "Отменена",
}
STAGE_LABELS = {
    AssignmentStage.IN_PROGRESS: "Выполнение работы",
    AssignmentStage.UNDER_REVIEW: "На проверке",
    AssignmentStage.ADMITTED_TO_DEFENSE: "Допущена к защите",
    AssignmentStage.DEFENDED: "Защищена",
}
TOPIC_LABELS = {
    TopicStatus.DRAFT: "Предложена",
    TopicStatus.PUBLISHED: "Открыта для заявок",
    TopicStatus.REJECTED: "Отклонена",
    TopicStatus.ARCHIVED: "В архиве",
}


class StudentSummary(BaseModel):
    """Student profile allowlist; id identifies a Student, not a User."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    user_id: int
    first_name: str = Field(
        validation_alias=AliasChoices("first_name", AliasPath("user", "first_name"))
    )
    last_name: str = Field(
        validation_alias=AliasChoices("last_name", AliasPath("user", "last_name"))
    )
    middle_name: str | None = Field(
        validation_alias=AliasChoices("middle_name", AliasPath("user", "middle_name"))
    )
    email: str = Field(validation_alias=AliasChoices("email", AliasPath("user", "email")))
    group_id: int
    group_name: str = Field(
        validation_alias=AliasChoices("group_name", AliasPath("group", "name")),
        description="Название учебной группы студента.",
        examples=["ИВТ-41"],
    )
    department_id: int | None
    record_book_number: str | None
    admission_year: int | None

    @computed_field
    @property
    def full_name(self) -> str:
        """Return a display name without inventing a missing middle name."""
        return " ".join(
            part for part in (self.last_name, self.first_name, self.middle_name) if part
        )


class TopicSummary(BaseModel):
    """Topic identity embedded in application and assignment cards."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    department_id: int | None
    supervisor_id: int
