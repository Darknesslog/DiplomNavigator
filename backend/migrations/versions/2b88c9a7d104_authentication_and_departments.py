"""Add login cooldown state, student departments and four application roles.

Revision ID: 2b88c9a7d104
Revises: 11df49dcefbc
"""

import sqlalchemy as sa
from alembic import op

revision = "2b88c9a7d104"
down_revision = "11df49dcefbc"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Preserve accounts and profiles while renaming teacher to nauchruk."""
    op.add_column(
        "users",
        sa.Column(
            "failed_login_attempts",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
            comment="Неудачные попытки входа",
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "locked_until",
            sa.DateTime(timezone=True),
            nullable=True,
            comment="Вход заблокирован до (UTC)",
        ),
    )
    op.drop_constraint(op.f("ck_users_user_role"), "users", type_="check")
    users = sa.table("users", sa.column("role", sa.String(32)))
    op.execute(users.update().where(users.c.role == "teacher").values(role="nauchruk"))
    op.create_check_constraint(
        op.f("ck_users_user_role"),
        "users",
        "role IN ('student', 'nauchruk', 'zavkaf', 'admin')",
    )
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(32),
        comment="Роль: student / nauchruk / zavkaf / admin",
    )
    # Faculty alone cannot identify a department: existing students stay unassigned.
    op.add_column(
        "students",
        sa.Column(
            "department_id",
            sa.BigInteger(),
            nullable=True,
            comment="Кафедра; NULL для ещё не распределённых студентов",
        ),
    )
    op.create_foreign_key(
        op.f("fk_students_department_id_departments"),
        "students",
        "departments",
        ["department_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_students_department_id", "students", ["department_id"])


def downgrade() -> None:
    """Restore legacy roles; nauchruk and zavkaf both become teacher."""
    op.drop_index("ix_students_department_id", table_name="students")
    op.drop_constraint(
        op.f("fk_students_department_id_departments"), "students", type_="foreignkey"
    )
    op.drop_column("students", "department_id")
    op.drop_constraint(op.f("ck_users_user_role"), "users", type_="check")
    users = sa.table("users", sa.column("role", sa.String(32)))
    op.execute(
        users.update().where(users.c.role.in_(("nauchruk", "zavkaf"))).values(role="teacher")
    )
    op.create_check_constraint(
        op.f("ck_users_user_role"),
        "users",
        "role IN ('student', 'teacher', 'admin')",
    )
    op.alter_column(
        "users",
        "role",
        existing_type=sa.String(32),
        comment="Роль: student / teacher / admin",
    )
    op.drop_column("users", "locked_until")
    op.drop_column("users", "failed_login_attempts")
