"""Add application expiration, cooldown, and topic archive metadata.

Revision ID: 9f2a7c6d4e10
Revises: 8e4f6a2b1c90
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "9f2a7c6d4e10"
down_revision: str | None = "8e4f6a2b1c90"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add the fields required by the demo and production timeout workflow."""
    op.add_column(
        "applications",
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "applications",
        sa.Column("cooldown_until", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_applications_expires_at_pending",
        "applications",
        ["expires_at"],
        postgresql_where=sa.text("status = 'pending'"),
    )
    op.drop_constraint("application_status", "applications", type_="check")
    op.create_check_constraint(
        "application_status",
        "applications",
        "status IN ('pending', 'approved', 'rejected', 'withdrawn', 'expired')",
    )
    op.drop_constraint(
        "application_status_from",
        "application_status_history",
        type_="check",
    )
    op.create_check_constraint(
        "application_status_from",
        "application_status_history",
        "from_status IS NULL OR from_status IN "
        "('pending', 'approved', 'rejected', 'withdrawn', 'expired')",
    )
    op.drop_constraint(
        "application_status_to",
        "application_status_history",
        type_="check",
    )
    op.create_check_constraint(
        "application_status_to",
        "application_status_history",
        "to_status IN ('pending', 'approved', 'rejected', 'withdrawn', 'expired')",
    )
    op.add_column(
        "topics",
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "topics",
        sa.Column(
            "archive_reason",
            sa.Enum(
                "deleted",
                "completed",
                "expired",
                name="topic_archive_reason",
                native_enum=False,
                create_constraint=True,
                length=32,
            ),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Remove timeout and archive metadata."""
    op.drop_column("topics", "archive_reason")
    op.drop_column("topics", "archived_at")
    op.drop_constraint("application_status_to", "application_status_history", type_="check")
    op.create_check_constraint(
        "application_status_to",
        "application_status_history",
        "to_status IN ('pending', 'approved', 'rejected', 'withdrawn')",
    )
    op.drop_constraint("application_status_from", "application_status_history", type_="check")
    op.create_check_constraint(
        "application_status_from",
        "application_status_history",
        "from_status IS NULL OR from_status IN "
        "('pending', 'approved', 'rejected', 'withdrawn')",
    )
    op.drop_constraint("application_status", "applications", type_="check")
    op.create_check_constraint(
        "application_status",
        "applications",
        "status IN ('pending', 'approved', 'rejected', 'withdrawn')",
    )
    op.drop_index(
        "ix_applications_expires_at_pending",
        table_name="applications",
        postgresql_where=sa.text("status = 'pending'"),
    )
    op.drop_column("applications", "cooldown_until")
    op.drop_column("applications", "expires_at")
