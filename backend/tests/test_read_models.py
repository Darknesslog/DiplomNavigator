"""Read projections must not perform lifecycle commands or commit transactions."""

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import event

from backend.app.models import Application, ApplicationStatus, Topic, TopicStatus, User
from backend.app.services.read_models import (
    head_dashboard,
    supervisor_dashboard,
    visible_applications,
)


@pytest.mark.parametrize("projection", ["applications", "supervisor", "head"])
def test_projections_only_select_even_with_overdue_applications(sessions, projection):
    with sessions() as db:
        db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(seconds=1)
        db.commit()
    with sessions() as db:
        actor = db.get(User, 2 if projection == "head" else 4)
        statements = []
        commits = []
        engine = db.get_bind()

        def observe_sql(_connection, _cursor, statement, _parameters, _context, _many):
            statements.append(statement.lstrip().split()[0].upper())

        def observe_commit(_session):
            commits.append(True)

        event.listen(engine, "before_cursor_execute", observe_sql)
        event.listen(db, "after_commit", observe_commit)
        try:
            if projection == "applications":
                visible_applications(db, actor, None, 0, 10)
            elif projection == "supervisor":
                supervisor_dashboard(db, actor)
            else:
                head_dashboard(db, actor, None)
        finally:
            event.remove(engine, "before_cursor_execute", observe_sql)
            event.remove(db, "after_commit", observe_commit)
        assert statements and set(statements) == {"SELECT"}
        assert not commits
        assert db.get(Application, 1).status == ApplicationStatus.PENDING
        assert db.get(Topic, 1).status == TopicStatus.PUBLISHED


@pytest.mark.parametrize(
    "path,actor",
    [("/applications/me", 3), ("/dashboard/supervisor", 4), ("/dashboard/head", 2)],
)
def test_api_keeps_lazy_expiration_outside_projection(client, bearer, sessions, path, actor):
    with sessions() as db:
        db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(seconds=1)
        db.commit()
    response = client.get(path, headers=bearer(actor))
    assert response.status_code == 200, response.text
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.EXPIRED
        assert db.get(Topic, 1).status == TopicStatus.ARCHIVED


def test_out_of_scope_dashboard_does_not_run_expiration(client, bearer, sessions):
    with sessions() as db:
        db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(seconds=1)
        db.commit()
    response = client.get("/dashboard/head?department_id=2", headers=bearer(2))
    assert response.status_code == 403
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.PENDING
