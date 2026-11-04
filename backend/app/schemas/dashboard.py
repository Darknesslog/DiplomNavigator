"""Read contracts for dashboard, workload, and student detail screens."""

from datetime import datetime

from pydantic import BaseModel, Field

from backend.app.models.enums import AssignmentStage
from backend.app.schemas.application import StudentApplicationResponse
from backend.app.schemas.presentation import StudentSummary
from backend.app.schemas.supervisor import AssignmentResponse


class ProgressHistoryEntry(BaseModel):
    """Reserved contract for the progress timeline; no history is fabricated."""

    changed_at: datetime
    changed_by_user_id: int | None
    progress_percent: int = Field(ge=0, le=100)
    current_stage: AssignmentStage
    comment: str | None


class AssignmentDetail(AssignmentResponse):
    """Assignment card with an explicit nullable progress-history placeholder."""

    progress_history: list[ProgressHistoryEntry] | None = Field(
        default=None,
        description="Заглушка: история прогресса ещё не сохраняется; null означает недоступность.",
    )


class StudentDetail(StudentSummary):
    """Student card containing only assignments owned by the current supervisor."""

    department_name: str | None
    assignments: list[AssignmentDetail]


class SupervisorWorkload(BaseModel):
    """Current active assignments compared with the supervisor's configured limit."""

    supervisor_id: int
    user_id: int
    full_name: str
    email: str
    department_id: int
    department_name: str
    current_load: int = Field(ge=0)
    max_students: int = Field(ge=0)
    available_places: int = Field(ge=0)


class SupervisorDashboard(SupervisorWorkload):
    """Counters and up to five recent cards for the authenticated supervisor."""

    topics_count: int = Field(ge=0)
    students_count: int = Field(ge=0)
    pending_applications: int = Field(ge=0)
    recent_applications: list[StudentApplicationResponse]
    recent_assignments: list[AssignmentDetail]


class TopicCounts(BaseModel):
    """Topic counters retain the actual backend lifecycle names."""

    draft: int = 0
    published: int = 0
    rejected: int = 0
    archived: int = 0


class HeadDashboard(BaseModel):
    """Department-scoped counters for the head dashboard."""

    department_id: int
    department_name: str
    students_count: int = Field(ge=0)
    supervisors_count: int = Field(ge=0)
    active_assignments: int = Field(ge=0)
    pending_applications: int = Field(ge=0)
    topics: TopicCounts
    current_load: int = Field(ge=0)
    max_students: int = Field(ge=0)
    available_places: int = Field(ge=0)
