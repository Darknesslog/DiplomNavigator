"""Migrate and reset only an explicitly selected disposable PostgreSQL database."""

import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from backend.app import config
from backend.app.models import Base


def pytest_collection_modifyitems(items):
    """Mark this whole subtree, including API audit cases, as PostgreSQL tests."""
    directory = Path(__file__).parent
    for item in items:
        if item.path.is_relative_to(directory):
            item.add_marker(pytest.mark.postgres)


@pytest.fixture(scope="session")
def postgres_engine():
    """Migrate only the explicitly named disposable test database through Alembic."""
    address = os.getenv("TEST_DATABASE_URL")
    if not address:
        raise pytest.UsageError("PostgreSQL tests require TEST_DATABASE_URL; see integration/README.md")
    url = make_url(address)
    if (
        url.get_backend_name() != "postgresql"
        or url.database != "diplom_test"
        or url.host not in ("127.0.0.1", "localhost")
    ):
        raise pytest.UsageError("Only localhost PostgreSQL database diplom_test is permitted")
    engine = create_engine(
        url,
        connect_args={"options": "-c timezone=UTC -c lock_timeout=5000 -c statement_timeout=15000"},
        pool_size=8,
    )
    original_url = config.DATABASE_URL
    try:
        try:
            config.DATABASE_URL = address
            root = Path(__file__).resolve().parents[3]
            command.upgrade(Config(str(root / "alembic.ini")), "head")
        finally:
            config.DATABASE_URL = original_url
        yield engine
    finally:
        engine.dispose()


@pytest.fixture()
def sessions(sqlite_sessions, postgres_engine):
    """Copy the standard seed into a freshly reset, migrated PostgreSQL schema."""
    with sqlite_sessions() as source_db:
        source_tables = set(inspect(source_db.get_bind()).get_table_names())
        records = [
            (table, [dict(row) for row in source_db.execute(select(table)).mappings()])
            for table in Base.metadata.sorted_tables
            if table.name in source_tables
        ]
    with postgres_engine.begin() as connection:
        names = ", ".join(
            postgres_engine.dialect.identifier_preparer.quote(table.name)
            for table in Base.metadata.sorted_tables
        )
        connection.execute(text(f"TRUNCATE {names} RESTART IDENTITY CASCADE"))
        for table, rows in records:
            if rows:
                connection.execute(table.insert(), rows)
                connection.execute(
                    text("SELECT setval(pg_get_serial_sequence(:table_name, 'id'), :last_id, true)"),
                    {"table_name": table.name, "last_id": max(row["id"] for row in rows)},
                )
    # Match production: pending ORM changes are not automatically flushed.
    yield sessionmaker(bind=postgres_engine, expire_on_commit=False, autoflush=False)
