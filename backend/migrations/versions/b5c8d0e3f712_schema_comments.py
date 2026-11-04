"""Align timeout/archive comments with the ORM metadata.

Revision ID: b5c8d0e3f712
Revises: a4b7c9d2e601
"""

from collections.abc import Sequence

from alembic import op

revision: str = "b5c8d0e3f712"
down_revision: str | None = "a4b7c9d2e601"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

COMMENTS = (
    ("applications", "expires_at", "Дедлайн решения по заявке"),
    ("applications", "cooldown_until", "До какого момента запрещена повторная заявка"),
    ("topics", "archived_at", "Когда тема попала в архив"),
    ("topics", "archive_reason", "Причина архивации: deleted / completed / expired"),
)


def upgrade() -> None:
    """Record comments missing from the original timeout migration."""
    for table, column, comment in COMMENTS:
        op.alter_column(table, column, comment=comment)


def downgrade() -> None:
    """Restore the original uncommented columns without changing their data."""
    for table, column, _comment in COMMENTS:
        op.alter_column(table, column, comment=None)
