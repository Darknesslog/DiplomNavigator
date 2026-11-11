"""Upgrade/downgrade of the audit table must preserve pre-existing assignments."""

import os
from datetime import UTC, datetime
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect

from backend.app import config
from backend.app.models import Assignment


def test_progress_history_migration_preserves_existing_assignments(
    sessions, postgres_engine, monkeypatch
):
    with sessions() as db:
        db.add(Assignment(student_id=1, topic_id=1, supervisor_id=2, assigned_at=datetime.now(UTC)))
        db.commit()
    root = Path(__file__).resolve().parents[3]
    migration_config = Config(str(root / "alembic.ini"))
    monkeypatch.setattr(config, "DATABASE_URL", os.environ["TEST_DATABASE_URL"])
    try:
        command.downgrade(migration_config, "c7e2f3a4b5c6")
        assert "assignment_progress_history" not in inspect(postgres_engine).get_table_names()
    finally:
        command.upgrade(migration_config, "head")
    with sessions() as db:
        work = db.get(Assignment, 1)
        assert work.student_id == 1
        assert work.progress_history == []
