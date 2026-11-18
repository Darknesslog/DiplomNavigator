"""Isolated diagnostic probes; passing records behavior, not desired policy."""

from datetime import UTC, datetime, timedelta

import pytest

from backend.app.models import (
    AcademicPeriod,
    Application,
    Assignment,
    Student,
    Teacher,
    Topic,
)
from backend.app.services import supervisor


@pytest.mark.parametrize("with_assignment", [False, True])
def test_transfer_retains_student_links(client, bearer, sessions, with_assignment):
    if with_assignment:
        assert (
            client.patch(
                "/reservations/1/approve", json={}, headers=bearer(4)
            ).status_code
            == 200
        )
    response = client.patch(
        "/users/3/department", json={"department_id": 2}, headers=bearer(1)
    )
    assert response.status_code == 200, response.text
    with sessions() as db:
        assert db.get(Student, 1).department_id == 2
        assert db.get(Topic, 1).department_id == 1
        if with_assignment:
            assert db.get(Assignment, 1).status == "active"


def test_transferred_supervisor_can_approve_old_department_topic(
    client, bearer, sessions
):
    response = client.patch(
        "/users/4/department", json={"department_id": 2}, headers=bearer(1)
    )
    assert response.status_code == 200, response.text
    response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
    assert response.status_code == 200, response.text
    with sessions() as db:
        assert db.get(Teacher, 2).department_id == 2
        assert db.get(Topic, 1).department_id == 1
        assert db.get(Assignment, 1).status == "active"


@pytest.mark.parametrize("status", ["archived", "rejected"])
def test_direct_moderation_retains_active_assignment(client, bearer, sessions, status):
    assert (
        client.patch("/reservations/1/approve", json={}, headers=bearer(4)).status_code
        == 200
    )
    response = client.patch(
        "/topics/1/status", json={"status": status}, headers=bearer(2)
    )
    assert response.status_code == 200, response.text
    with sessions() as db:
        assert db.get(Topic, 1).status == status
        assert db.get(Assignment, 1).status == "active"


@pytest.mark.parametrize("period_status", ["draft", "archived", "open"])
def test_submission_after_window(client, bearer, sessions, period_status):
    with sessions() as db:
        period = db.get(AcademicPeriod, 1)
        period.status = period_status
        period.application_opens_at = datetime.now(UTC) - timedelta(days=4)
        period.application_closes_at = datetime.now(UTC) - timedelta(days=2)
        db.get(Topic, 2).status = "published"
        db.commit()
    response = client.post("/topics/2/applications", json={}, headers=bearer(3))
    assert response.status_code == 201, response.text


def test_defense_without_admission(client, bearer):
    assert (
        client.patch("/reservations/1/approve", json={}, headers=bearer(4)).status_code
        == 200
    )
    response = client.patch(
        "/works/1/progress",
        json={"current_stage": "defended", "progress_percent": 100},
        headers=bearer(4),
    )
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "completed"


def test_deadline_crossed_after_cleanup_before_decision(
    client, bearer, sessions, monkeypatch
):
    """Simulate time passing while acquiring locks; no actual PostgreSQL race claim."""
    real_cleanup = supervisor.expire_overdue_applications
    later = datetime.now(UTC) + timedelta(minutes=10)
    with sessions() as db:
        db.get(Application, 1).expires_at = later - timedelta(minutes=5)
        db.commit()

    class DecisionClock:
        @staticmethod
        def now(_timezone):
            return later

    def cleanup_then_advance_clock(db):
        count = real_cleanup(db)
        monkeypatch.setattr(supervisor, "datetime", DecisionClock)
        return count

    monkeypatch.setattr(
        supervisor, "expire_overdue_applications", cleanup_then_advance_clock
    )
    response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
    assert response.status_code == 200, response.text
    with sessions() as db:
        application = db.get(Application, 1)
        assert application.status == "approved"
        assert application.decided_at.replace(
            tzinfo=UTC
        ) > application.expires_at.replace(tzinfo=UTC)
