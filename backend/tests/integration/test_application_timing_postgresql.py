"""Real row-lock waits and post-response persistence for Q3/Q4/Q6."""

from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from datetime import timedelta
from threading import Barrier, Event
from time import monotonic

import pytest
from sqlalchemy import event, func, select, text

from backend.app.models import (
    AcademicPeriod,
    Application,
    ApplicationStatus,
    Assignment,
    AssignmentProgressHistory,
    Notification,
    Student,
    Teacher,
    Topic,
    TopicStatus,
)
from backend.app.services import supervisor
from backend.app.services.application import expire_overdue_applications
from backend.app.services.workflow import workflow_now
from backend.tests.test_application_timing import (  # noqa: F401
    test_all_get_paths_leave_overdue_rows_untouched,
    test_commands_do_not_run_unrelated_expiration,
    test_decision_exact_deadline_boundary,
    test_expiration_error_rolls_back_transition_and_events,
    test_expiration_ignores_terminal_applications,
    test_expiration_preserves_topic_and_is_idempotent,
    test_expired_decision_persists_before_conflict,
    test_submission_half_open_window,
    test_submission_requires_open,
)


@contextmanager
def observe_lock(engine, table):
    """Capture the requesting backend PID before its potentially blocking query."""
    reached = Event()
    backend = []

    def observe(connection, _cursor, statement, _parameters, _context, _many):
        if f"FROM {table}" in statement and ("FOR UPDATE" in statement or "FOR SHARE" in statement):
            backend.append(connection.connection.driver_connection.info.backend_pid)
            reached.set()

    event.listen(engine, "before_cursor_execute", observe)
    try:
        yield reached, backend
    finally:
        event.remove(engine, "before_cursor_execute", observe)


def confirm_blocked(sessions, backend, blocker_pid):
    """Prove a real database wait, rather than relying on a pre-execute event alone."""
    deadline = monotonic() + 4
    with sessions() as monitor:
        while monotonic() < deadline:
            blockers = monitor.scalar(text("SELECT pg_blocking_pids(:pid)"), {"pid": backend[-1]})
            if blocker_pid in blockers:
                return
            Event().wait(0.005)
    pytest.fail("Request never entered the expected PostgreSQL row-lock wait")


def wait_until_database_time(sessions, deadline):
    limit = monotonic() + 4
    with sessions() as monitor:
        while monotonic() < limit:
            if workflow_now(monitor) >= deadline:
                return
            Event().wait(0.005)
    pytest.fail("PostgreSQL wall clock did not reach the test deadline")


def assert_expired_after_response(sessions):
    """Use a third session, after HTTP completion, for all durable-state assertions."""
    with sessions() as db:
        application = db.get(Application, 1)
        assert application.status == ApplicationStatus.EXPIRED
        assert application.decided_at >= application.expires_at
        assert application.decided_by_user_id is None
        assert application.cooldown_until is None
        assert len(application.history) == 1
        assert application.history[0].to_status == ApplicationStatus.EXPIRED
        notices = list(db.scalars(select(Notification)))
        assert len(notices) == 1
        assert notices[0].kind == "application_expired"
        assert notices[0].user_id == 3
        assert notices[0].payload == {"application_id": 1, "topic_id": 1}
        assert db.get(Topic, 1).status == TopicStatus.PUBLISHED
        assert db.get(Topic, 1).archived_at is None
        assert db.get(Topic, 1).archive_reason is None
        assert db.scalar(select(func.count(Assignment.id))) == 0
        assert db.scalar(select(func.count(AssignmentProgressHistory.id))) == 0


@pytest.mark.parametrize("locked", ["student", "teacher", "topic", "other_application"])
@pytest.mark.parametrize("action", ["approve", "reject"])
def test_decision_deadline_crossed_during_real_wait(
    client, bearer, sessions, postgres_engine, locked, action
):
    headers = bearer(4)
    with sessions() as db:
        deadline = workflow_now(db) + timedelta(seconds=0.7)
        db.get(Application, 1).expires_at = deadline
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.add(
            Application(
                student_id=1,
                topic_id=2,
                status=ApplicationStatus.PENDING,
                expires_at=deadline + timedelta(days=1),
            )
        )
        db.commit()
    model, identity = {
        "student": (Student, 1),
        "teacher": (Teacher, 2),
        "topic": (Topic, 1),
        "other_application": (Application, 2),
    }[locked]
    with sessions() as blocker:
        blocker.scalar(select(model).where(model.id == identity).with_for_update())
        blocker_pid = blocker.scalar(select(func.pg_backend_pid()))
        with (
            observe_lock(postgres_engine, model.__tablename__) as (reached, backend),
            ThreadPoolExecutor(max_workers=1) as pool,
        ):
            future = pool.submit(
                client.patch, f"/reservations/1/{action}", json={}, headers=headers
            )
            try:
                assert reached.wait(4)
                confirm_blocked(sessions, backend, blocker_pid)
                wait_until_database_time(sessions, deadline)
            finally:
                blocker.rollback()
            response = future.result(timeout=12)
    assert response.status_code == 409, response.text
    assert_expired_after_response(sessions)
    with sessions() as db:
        assert db.get(Application, 2).status == ApplicationStatus.PENDING
        assert db.get(Application, 2).history == []
    retry = client.patch(f"/reservations/1/{action}", json={}, headers=headers)
    assert retry.status_code == 409
    assert_expired_after_response(sessions)


@pytest.mark.parametrize("route", ["applications", "bookings"])
@pytest.mark.parametrize("locked", ["student", "teacher", "period", "topic", "application"])
def test_submission_checks_wall_clock_after_every_lock(
    client, bearer, sessions, postgres_engine, route, locked
):
    headers = bearer(3)
    with sessions() as db:
        now = workflow_now(db)
        deadline = now + timedelta(seconds=0.7)
        period = db.get(AcademicPeriod, 1)
        period.application_opens_at = now - timedelta(days=1)
        period.application_closes_at = deadline
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.commit()
    model, identity = {
        "student": (Student, 1),
        "teacher": (Teacher, 1),
        "period": (AcademicPeriod, 1),
        "topic": (Topic, 2),
        "application": (Application, 1),
    }[locked]
    with sessions() as blocker:
        blocker.scalar(select(model).where(model.id == identity).with_for_update())
        blocker_pid = blocker.scalar(select(func.pg_backend_pid()))
        with (
            observe_lock(postgres_engine, model.__tablename__) as (reached, backend),
            ThreadPoolExecutor(max_workers=1) as pool,
        ):
            future = pool.submit(client.post, f"/topics/2/{route}", json={}, headers=headers)
            try:
                assert reached.wait(4)
                confirm_blocked(sessions, backend, blocker_pid)
                wait_until_database_time(sessions, deadline)
            finally:
                blocker.rollback()
            response = future.result(timeout=12)
    assert response.status_code == 403, response.text
    with sessions() as db:
        assert db.scalar(select(func.count(Application.id))) == 1
        assert db.scalar(select(func.count(Notification.id))) == 0
        assert db.scalar(select(func.count(Assignment.id))) == 0
        assert db.get(Application, 1).status == ApplicationStatus.PENDING


@pytest.mark.parametrize("new_status", [ApplicationStatus.PENDING, ApplicationStatus.WITHDRAWN])
def test_decision_rereads_status_and_deadline_after_wait(
    client, bearer, sessions, postgres_engine, new_status
):
    headers = bearer(4)
    with sessions() as blocker:
        row = blocker.scalar(select(Application).where(Application.id == 1).with_for_update())
        blocker_pid = blocker.scalar(select(func.pg_backend_pid()))
        with (
            observe_lock(postgres_engine, "applications") as (reached, backend),
            ThreadPoolExecutor(max_workers=1) as pool,
        ):
            future = pool.submit(client.patch, "/reservations/1/approve", json={}, headers=headers)
            try:
                assert reached.wait(4)
                confirm_blocked(sessions, backend, blocker_pid)
                row.status = new_status
                row.expires_at = workflow_now(blocker) - timedelta(days=1)
                blocker.commit()
            finally:
                blocker.rollback()
            response = future.result(timeout=12)
    assert response.status_code == 409, response.text
    if new_status == ApplicationStatus.PENDING:
        assert_expired_after_response(sessions)
        return
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.WITHDRAWN
        assert db.get(Application, 1).history == []
        assert db.scalar(select(func.count(Notification.id))) == 0
        assert db.scalar(select(func.count(Assignment.id))) == 0


def test_two_expiration_workers_and_retry_have_single_effect(sessions):
    with sessions() as db:
        db.get(Application, 1).expires_at = workflow_now(db) - timedelta(seconds=1)
        db.commit()
    start = Barrier(2)

    def run():
        with sessions() as db:
            start.wait(timeout=4)
            count = expire_overdue_applications(db)
            db.commit()
            return count

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(run) for _ in range(2)]
        assert sum(future.result(timeout=12) for future in futures) == 1
    with sessions() as db:
        assert expire_overdue_applications(db) == 0
        db.commit()
    assert_expired_after_response(sessions)


def test_expiration_wins_before_waiting_decision(client, bearer, sessions, postgres_engine):
    headers = bearer(4)
    with sessions() as db:
        db.get(Application, 1).expires_at = workflow_now(db) - timedelta(days=1)
        db.commit()
    with sessions() as worker:
        assert expire_overdue_applications(worker) == 1
        blocker_pid = worker.scalar(select(func.pg_backend_pid()))
        with (
            observe_lock(postgres_engine, "students") as (reached, backend),
            ThreadPoolExecutor(max_workers=1) as pool,
        ):
            future = pool.submit(client.patch, "/reservations/1/approve", json={}, headers=headers)
            try:
                assert reached.wait(4)
                confirm_blocked(sessions, backend, blocker_pid)
                worker.commit()
            finally:
                worker.rollback()
            response = future.result(timeout=12)
    assert response.status_code == 409, response.text
    assert_expired_after_response(sessions)


def test_other_lower_id_application_is_locked_before_target(
    client, bearer, sessions, postgres_engine
):
    headers = bearer(4)
    with sessions() as db:
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.get(Topic, 2).supervisor_id = 2
        db.get(Application, 1).expires_at = workflow_now(db) - timedelta(days=1)
        db.add(
            Application(
                student_id=1,
                topic_id=2,
                status=ApplicationStatus.PENDING,
                expires_at=workflow_now(db) + timedelta(days=1),
            )
        )
        db.commit()
    with sessions() as blocker:
        blocker.scalar(select(Application).where(Application.id == 1).with_for_update())
        blocker_pid = blocker.scalar(select(func.pg_backend_pid()))
        with (
            observe_lock(postgres_engine, "applications") as (reached, backend),
            ThreadPoolExecutor(max_workers=1) as pool,
        ):
            future = pool.submit(client.patch, "/reservations/2/approve", json={}, headers=headers)
            try:
                assert reached.wait(4)
                confirm_blocked(sessions, backend, blocker_pid)
                # If target 2 had been locked first, NOWAIT would fail here.
                with sessions() as monitor:
                    assert (
                        monitor.scalar(
                            select(Application)
                            .where(Application.id == 2)
                            .with_for_update(nowait=True)
                        )
                        is not None
                    )
                    monitor.rollback()
            finally:
                blocker.rollback()
            response = future.result(timeout=12)
    assert response.status_code == 200, response.text
    with sessions() as db:
        assert db.get(Application, 2).status == ApplicationStatus.APPROVED
        other = db.get(Application, 1)
        assert other.status == ApplicationStatus.WITHDRAWN
        assert other.cooldown_until is None
        assert len(other.history) == 1
        assert other.history[0].to_status == ApplicationStatus.WITHDRAWN
        assert db.get(Topic, 1).status == TopicStatus.PUBLISHED
        assert db.scalar(select(func.count(Notification.id))) == 1
        assert db.scalar(select(func.count(Assignment.id))) == 1


def test_valid_decision_can_commit_after_deadline(client, bearer, sessions, monkeypatch):
    headers = bearer(4)
    with sessions() as db:
        deadline = workflow_now(db) + timedelta(seconds=0.7)
        db.get(Application, 1).expires_at = deadline
        db.commit()
    checked, release = Event(), Event()
    real_commit = supervisor.commit_workflow

    def pause_before_commit(db):
        checked.set()
        assert release.wait(4)
        real_commit(db)

    monkeypatch.setattr(supervisor, "commit_workflow", pause_before_commit)
    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(client.patch, "/reservations/1/approve", json={}, headers=headers)
        try:
            assert checked.wait(4)
            wait_until_database_time(sessions, deadline)
            # The independent expiration transaction skips the locked parent.
            with sessions() as worker:
                assert expire_overdue_applications(worker) == 0
                worker.commit()
        finally:
            release.set()
        response = future.result(timeout=12)
    assert response.status_code == 200, response.text
    with sessions() as db:
        row = db.get(Application, 1)
        assert row.status == ApplicationStatus.APPROVED
        assert row.decided_at < row.expires_at < workflow_now(db)
        assert db.scalar(select(func.count(Assignment.id))) == 1
        assert db.scalar(select(func.count(AssignmentProgressHistory.id))) == 1
        assert len(row.history) == 1
        assert db.scalar(select(Notification.kind)) == "application_approved"
        assert expire_overdue_applications(db) == 0
        db.commit()
