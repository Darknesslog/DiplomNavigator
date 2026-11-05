"""Add supervisor topic deletion requests."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c6d1e2f3a4b5"
down_revision: str | None = "b5c8d0e3f712"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the topic deletion approval workflow."""
    op.create_table(
        "topic_deletion_requests",
        sa.Column(
            "id",
            sa.BigInteger(),
            sa.Identity(),
            nullable=False,
            comment="Первичный ключ",
        ),
        sa.Column("topic_id", sa.BigInteger(), nullable=False),
        sa.Column("requested_by_user_id", sa.BigInteger(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "approved",
                "rejected",
                name="topic_deletion_request_status",
                native_enum=False,
                create_constraint=True,
                length=32,
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("decided_by_user_id", sa.BigInteger(), nullable=True),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("decision_comment", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
            comment="Когда запись создана",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
            comment="Когда запись последний раз менялась",
        ),
        sa.ForeignKeyConstraint(["topic_id"], ["topics.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["requested_by_user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["decided_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_topic_deletion_requests_topic_id", "topic_deletion_requests", ["topic_id"])
    op.create_index(
        "ix_topic_deletion_requests_requested_by_user_id",
        "topic_deletion_requests",
        ["requested_by_user_id"],
    )
    op.create_index(
        "ix_topic_deletion_requests_decided_by_user_id",
        "topic_deletion_requests",
        ["decided_by_user_id"],
    )
    op.create_index(
        "ix_topic_deletion_requests_status", "topic_deletion_requests", ["status"]
    )
    op.create_index(
        "uq_topic_deletion_requests_topic_pending",
        "topic_deletion_requests",
        ["topic_id"],
        unique=True,
        postgresql_where=sa.text("status = 'pending'"),
        sqlite_where=sa.text("status = 'pending'"),
    )
    op.alter_column("topic_deletion_requests", "id", comment="Первичный ключ")
    op.alter_column("topic_deletion_requests", "created_at", comment="Когда запись создана")
    op.alter_column(
        "topic_deletion_requests",
        "updated_at",
        comment="Когда запись последний раз менялась",
    )


def downgrade() -> None:
    """Remove the topic deletion approval workflow."""
    op.drop_index("uq_topic_deletion_requests_topic_pending", table_name="topic_deletion_requests")
    op.drop_index("ix_topic_deletion_requests_status", table_name="topic_deletion_requests")
    op.drop_index(
        "ix_topic_deletion_requests_decided_by_user_id", table_name="topic_deletion_requests"
    )
    op.drop_index(
        "ix_topic_deletion_requests_requested_by_user_id",
        table_name="topic_deletion_requests",
    )
    op.drop_index("ix_topic_deletion_requests_topic_id", table_name="topic_deletion_requests")
    op.drop_table("topic_deletion_requests")
