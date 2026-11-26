"""Q3/Q4/Q6 behavior shared with the migrated PostgreSQL suite."""

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import func, select

from backend.app.models import (
    AcademicPeriod,
    Application,
    ApplicationStatus,
    Assignment,
    Notification,
    Topic,
    TopicStatus,
)
from backend.app.services import application as application_service
from backend.app.services import supervisor as supervisor_service
from backend.app.services.application import expire_overdue_applications
from backend.app.services.workflow import commit_workflow


@pytest.mark.parametrize("route", ["applications", "bookings"])
@pytest.mark.parametrize("state", ["draft", "open", "closed", "archived"])
def test_submission_requires_open(client, bearer, sessions, monkeypatch, route, state):
    now = datetime(2026, 11, 26, 12, tzinfo=UTC)
    monkeypatch.setattr(application_service, "workflow_now", lambda _db: now)
    with sessions() as db:
        period = db.get(AcademicPeriod, 1)
        period.status = state
        period.application_opens_at = now - timedelta(days=1)
        period.application_closes_at = now + timedelta(days=1)
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.commit()
    response = client.post(f"/topics/2/{route}", json={}, headers=bearer(3))
    assert response.status_code == (201 if state == "open" else 403), response.text
    with sessions() as db:
        assert db.scalar(select(func.count(Application.id))) == (2 if state == "open" else 1)
        assert db.scalar(select(func.count(Notification.id))) == 0
        assert db.scalar(select(func.count(Assignment.id))) == 0


@pytest.mark.parametrize("route", ["applications", "bookings"])
@pytest.mark.parametrize("offset,expected", [(-1, 403), (0, 201), (1, 201), (10, 403), (11, 403)])
def test_submission_half_open_window(
    client, bearer, sessions, monkeypatch, route, offset, expected
):
    opens = datetime(2026, 11, 26, 12, tzinfo=UTC)
    now = opens + timedelta(seconds=offset)
    monkeypatch.setattr(application_service, "workflow_now", lambda _db: now)
    with sessions() as db:
        period = db.get(AcademicPeriod, 1)
        period.application_opens_at = opens
        period.application_closes_at = opens + timedelta(seconds=10)
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.commit()
    response = client.post(f"/topics/2/{route}", json={}, headers=bearer(3))
    assert response.status_code == expected, response.text
    with sessions() as db:
        created = db.scalar(select(Application).where(Application.topic_id == 2))
        assert (created is not None) == (expected == 201)
        if created:
            assert created.expires_at.replace(tzinfo=UTC) > now
            assert len(created.history) == 1


@pytest.mark.parametrize("topic_status", list(TopicStatus))
def test_expiration_preserves_topic_and_is_idempotent(sessions, topic_status):
    now = datetime.now(UTC)
    with sessions() as db:
        db.get(Application, 1).expires_at = now - timedelta(seconds=1)
        topic = db.get(Topic, 1)
        topic.status = topic_status
        topic.published_at = now - timedelta(days=1)
        db.commit()
        db.refresh(topic)
        before = (topic.status, topic.published_at, topic.archived_at, topic.archive_reason)
    for expected in [1, 0]:
        with sessions() as db:
            assert expire_overdue_applications(db) == expected
            db.commit()
    with sessions() as db:
        row = db.get(Application, 1)
        assert row.status == ApplicationStatus.EXPIRED
        assert len(row.history) == 1
        assert row.history[0].from_status == ApplicationStatus.PENDING
        assert row.history[0].to_status == ApplicationStatus.EXPIRED
        notice = db.scalar(select(Notification))
        assert notice.kind == "application_expired"
        assert notice.user_id == 3
        assert notice.payload == {"application_id": 1, "topic_id": 1}
        assert db.scalar(select(func.count(Notification.id))) == 1
        topic = db.get(Topic, 1)
        assert (topic.status, topic.published_at, topic.archived_at, topic.archive_reason) == before


@pytest.mark.parametrize("state", ["approved", "rejected", "withdrawn", "expired"])
def test_expiration_ignores_terminal_applications(sessions, state):
    with sessions() as db:
        row = db.get(Application, 1)
        row.status = state
        row.expires_at = datetime.now(UTC) - timedelta(days=1)
        db.commit()
    with sessions() as db:
        assert expire_overdue_applications(db) == 0
        db.commit()
    with sessions() as db:
        assert db.get(Application, 1).status == state
        assert db.get(Application, 1).history == []
        assert db.scalar(select(func.count(Notification.id))) == 0


@pytest.mark.parametrize(
    "path,actor",
    [
        ("/topics", 3),
        ("/topics/1", 3),
        ("/supervisor/applications", 4),
        ("/applications/me", 3),
        ("/bookings/me", 3),
        ("/booking-requests", 4),
        ("/supervisor/dashboard", 4),
        ("/dashboard/supervisor", 4),
        ("/dashboard/head", 2),
    ],
)
def test_all_get_paths_leave_overdue_rows_untouched(client, bearer, sessions, path, actor):
    with sessions() as db:
        db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(days=1)
        db.commit()
    response = client.get(path, headers=bearer(actor))
    assert response.status_code == 200, response.text
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.PENDING
        assert db.get(Application, 1).history == []
        assert db.get(Topic, 1).status == TopicStatus.PUBLISHED
        assert db.scalar(select(func.count(Notification.id))) == 0


@pytest.mark.parametrize("action", ["approve", "reject"])
def test_expired_decision_persists_before_conflict(client, bearer, sessions, action):
    with sessions() as db:
        db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(days=1)
        db.commit()
    headers = bearer(4)
    for _ in range(2):
        response = client.patch(f"/reservations/1/{action}", json={}, headers=headers)
        assert response.status_code == 409, response.text
        with sessions() as db:
            row = db.get(Application, 1)
            assert row.status == ApplicationStatus.EXPIRED
            assert len(row.history) == 1
            assert db.scalar(select(func.count(Notification.id))) == 1
            assert db.scalar(select(func.count(Assignment.id))) == 0
            assert db.get(Topic, 1).status == TopicStatus.PUBLISHED


@pytest.mark.parametrize("offset,expected", [(-1, 200), (0, 409), (1, 409)])
def test_decision_exact_deadline_boundary(client, bearer, sessions, monkeypatch, offset, expected):
    deadline = datetime(2026, 11, 26, 12, tzinfo=UTC)
    monkeypatch.setattr(
        supervisor_service, "workflow_now", lambda _db: deadline + timedelta(microseconds=offset)
    )
    with sessions() as db:
        db.get(Application, 1).expires_at = deadline
        db.commit()
    response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
    assert response.status_code == expected, response.text
    with sessions() as db:
        row = db.get(Application, 1)
        assert row.status == (
            ApplicationStatus.APPROVED if expected == 200 else ApplicationStatus.EXPIRED
        )
        assert len(row.history) == 1
        assert db.scalar(select(func.count(Notification.id))) == 1
        assert db.scalar(select(func.count(Assignment.id))) == int(expected == 200)


def test_expiration_error_rolls_back_transition_and_events(client, bearer, sessions, monkeypatch):
    with sessions() as db:
        db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(days=1)
        db.commit()

    def failing_commit(db):
        db.add(
            Notification(
                user_id=999999,
                kind="probe",
                title="Invalid recipient",
                is_read=False,
                created_at=datetime.now(UTC),
            )
        )
        commit_workflow(db)

    monkeypatch.setattr(supervisor_service, "commit_workflow", failing_commit)
    response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
    assert response.status_code == 409
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.PENDING
        assert db.get(Application, 1).history == []
        assert db.scalar(select(func.count(Notification.id))) == 0
        assert db.scalar(select(func.count(Assignment.id))) == 0


@pytest.mark.parametrize("command", ["submit", "manual"])
def test_commands_do_not_run_unrelated_expiration(client, bearer, sessions, command):
    with sessions() as db:
        db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(days=1)
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.commit()
    if command == "submit":
        response = client.post("/topics/2/applications", json={}, headers=bearer(3))
    else:
        # A failed management command cannot commit unrelated expiration events.
        response = client.post(
            "/assignments",
            json={"student_id": 2, "topic_id": 2, "comment": "Department mismatch probe"},
            headers=bearer(2),
        )
    assert response.status_code == (201 if command == "submit" else 409), response.text
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.PENDING
        assert db.get(Application, 1).history == []
        assert db.scalar(select(func.count(Notification.id))) == 0
