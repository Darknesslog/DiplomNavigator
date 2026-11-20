"""Persist progress changes and administrative admission revocations."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "d8f3a4b5c6d7"
down_revision: str | None = "c7e2f3a4b5c6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Start recording new events without fabricating earlier progress history."""
    stages = ("in_progress", "under_review", "admitted_to_defense", "defended")
    op.create_table(
        "assignment_progress_history",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="Первичный ключ"),
        sa.Column(
            "assignment_id",
            sa.BigInteger(),
            sa.ForeignKey("assignments.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "changed_by_user_id",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "changed_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "from_stage",
            sa.Enum(
                *stages,
                name="progress_history_from_stage",
                length=32,
                native_enum=False,
                create_constraint=True,
            ),
            nullable=True,
        ),
        sa.Column("from_progress_percent", sa.SmallInteger(), nullable=True),
        sa.Column(
            "current_stage",
            sa.Enum(
                *stages,
                name="progress_history_stage",
                length=32,
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("progress_percent", sa.SmallInteger(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "progress_percent BETWEEN 0 AND 100", name="progress_history_percent_range"
        ),
        sa.CheckConstraint(
            "from_progress_percent IS NULL OR from_progress_percent BETWEEN 0 AND 100",
            name="progress_history_from_percent_range",
        ),
        comment="Журнал изменений прогресса и допуска к защите",
    )
    op.create_index(
        "ix_assignment_progress_history_assignment_changed",
        "assignment_progress_history",
        ["assignment_id", "changed_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_assignment_progress_history_assignment_changed", "assignment_progress_history"
    )
    op.drop_table("assignment_progress_history")
