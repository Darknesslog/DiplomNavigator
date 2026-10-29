"""Make topic descriptions required and enforce one active reservation per topic.

Revision ID: 7c3d2e1f4a5b
Revises: 2b88c9a7d104
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "7c3d2e1f4a5b"
down_revision: str | None = "2b88c9a7d104"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Apply the single-student topic rules."""
    op.drop_constraint("max_students_positive", "topics", type_="check")
    op.drop_column("topics", "max_students")
    op.alter_column(
        "topics",
        "description",
        existing_type=sa.Text(),
        nullable=False,
        comment="Описание, задачи, ожидаемый результат",
    )
    op.create_index(
        "uq_applications_topic_id_active",
        "applications",
        ["topic_id"],
        unique=True,
        postgresql_where=sa.text("status IN ('pending', 'approved')"),
    )
    op.create_index(
        "uq_assignments_topic_id_active",
        "assignments",
        ["topic_id"],
        unique=True,
        postgresql_where=sa.text("status = 'active'"),
    )


def downgrade() -> None:
    """Restore the previous multi-student topic schema."""
    op.drop_index(
        "uq_assignments_topic_id_active",
        table_name="assignments",
        postgresql_where=sa.text("status = 'active'"),
    )
    op.drop_index(
        "uq_applications_topic_id_active",
        table_name="applications",
        postgresql_where=sa.text("status IN ('pending', 'approved')"),
    )
    op.alter_column(
        "topics",
        "description",
        existing_type=sa.Text(),
        nullable=True,
        comment="Описание, задачи, ожидаемый результат",
    )
    op.add_column(
        "topics",
        sa.Column(
            "max_students",
            sa.SmallInteger(),
            nullable=False,
            server_default=sa.text("1"),
            comment="Сколько студентов можно закрепить на тему",
        ),
    )
    op.create_check_constraint(
        "max_students_positive", "topics", "max_students > 0"
    )
