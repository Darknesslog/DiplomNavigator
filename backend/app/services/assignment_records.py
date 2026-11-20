"""Build the assignment and its initial audit event as one in-memory record."""

from datetime import datetime

from backend.app.models import (
    Assignment,
    AssignmentProgressHistory,
    AssignmentStage,
    AssignmentStatus,
)


def new_assignment(
    student_id: int,
    topic_id: int,
    supervisor_id: int,
    actor_id: int,
    assigned_at: datetime,
    comment: str | None,
) -> Assignment:
    """Share initial state between approval and manual assignment; caller owns commit."""
    assignment = Assignment(
        student_id=student_id,
        topic_id=topic_id,
        supervisor_id=supervisor_id,
        status=AssignmentStatus.ACTIVE,
        assigned_at=assigned_at,
        progress_percent=0,
        current_stage=AssignmentStage.IN_PROGRESS,
    )
    assignment.progress_history.append(
        AssignmentProgressHistory(
            changed_by_user_id=actor_id,
            changed_at=assigned_at,
            current_stage=AssignmentStage.IN_PROGRESS,
            progress_percent=0,
            comment=comment,
        )
    )
    return assignment
