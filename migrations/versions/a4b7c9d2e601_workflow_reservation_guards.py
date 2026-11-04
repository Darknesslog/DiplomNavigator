"""Enforce exclusive topic reservation and assignment.

Revision ID: a4b7c9d2e601
Revises: 9f2a7c6d4e10
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a4b7c9d2e601"
down_revision: str | None = "9f2a7c6d4e10"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Fail explicitly on conflicting legacy data instead of silently deleting it."""
    op.create_index(
        "uq_assignments_topic_not_cancelled",
        "assignments",
        ["topic_id"],
        unique=True,
        postgresql_where=sa.text("status <> 'cancelled'"),
        sqlite_where=sa.text("status <> 'cancelled'"),
    )
    op.drop_index("uq_assignments_topic_id_active", table_name="assignments")


def downgrade() -> None:
    """Remove topic exclusivity guards, retaining the existing student guard."""
    op.create_index(
        "uq_assignments_topic_id_active",
        "assignments",
        ["topic_id"],
        unique=True,
        postgresql_where=sa.text("status = 'active'"),
    )
    op.drop_index("uq_assignments_topic_not_cancelled", table_name="assignments")
