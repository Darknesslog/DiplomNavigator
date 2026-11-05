"""Align topic deletion request comments with ORM metadata."""

from collections.abc import Sequence

from alembic import op

revision: str = "c7e2f3a4b5c6"
down_revision: str | None = "c6d1e2f3a4b5"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add standard comments to shared mixin columns."""
    op.alter_column("topic_deletion_requests", "id", comment="Первичный ключ")
    op.alter_column("topic_deletion_requests", "created_at", comment="Когда запись создана")
    op.alter_column(
        "topic_deletion_requests",
        "updated_at",
        comment="Когда запись последний раз менялась",
    )


def downgrade() -> None:
    """Remove comments added for the new table."""
    op.alter_column("topic_deletion_requests", "updated_at", comment=None)
    op.alter_column("topic_deletion_requests", "created_at", comment=None)
    op.alter_column("topic_deletion_requests", "id", comment=None)
