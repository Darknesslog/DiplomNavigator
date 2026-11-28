"""Audit department changes atomically with the profile update."""

import sqlalchemy as sa
from alembic import op

revision = "e9a4b5c6d7e8"
down_revision = "d8f3a4b5c6d7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "department_change_history",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True, comment="Первичный ключ"),
        sa.Column(
            "user_id",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "changed_by_user_id",
            sa.BigInteger(),
            sa.ForeignKey("users.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "changed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "old_department_id",
            sa.BigInteger(),
            sa.ForeignKey("departments.id", ondelete="RESTRICT"),
            nullable=True,
        ),
        sa.Column(
            "new_department_id",
            sa.BigInteger(),
            sa.ForeignKey("departments.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "old_department_id IS NULL OR old_department_id <> new_department_id",
            name="actual_change",
        ),
    )
    op.create_index(
        "ix_department_change_history_user_changed",
        "department_change_history",
        ["user_id", "changed_at"],
    )


def downgrade() -> None:
    op.drop_table("department_change_history")
