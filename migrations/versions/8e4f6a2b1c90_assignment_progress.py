"""Add assignment progress tracking.

Revision ID: 8e4f6a2b1c90
Revises: 7c3d2e1f4a5b
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "8e4f6a2b1c90"
down_revision: str | None = "7c3d2e1f4a5b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add validated progress fields to assignments."""
    op.add_column(
        "assignments",
        sa.Column(
            "progress_percent",
            sa.SmallInteger(),
            nullable=False,
            server_default=sa.text("0"),
            comment="Процент выполнения от 0 до 100",
        ),
    )
    op.add_column(
        "assignments",
        sa.Column(
            "current_stage",
            sa.Enum(
                "in_progress",
                "under_review",
                "admitted_to_defense",
                "defended",
                name="assignment_stage",
                native_enum=False,
                create_constraint=True,
                length=32,
            ),
            nullable=False,
            server_default="in_progress",
            comment="Текущий этап работы",
        ),
    )
    op.create_check_constraint(
        "assignment_progress_percent_range",
        "assignments",
        "progress_percent BETWEEN 0 AND 100",
    )


def downgrade() -> None:
    """Remove assignment progress tracking."""
    op.drop_constraint("assignment_progress_percent_range", "assignments", type_="check")
    op.drop_column("assignments", "current_stage")
    op.drop_column("assignments", "progress_percent")
