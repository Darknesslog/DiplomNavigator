"""Agreed period, admission, audit and reservation-release policies."""

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import func, select

from backend.app.models import (
    AcademicPeriod,
    Application,
    ApplicationStatus,
    Assignment,
    AssignmentProgressHistory,
    AssignmentStage,
    Notification,
    PeriodStatus,
    Topic,
    TopicStatus,
)
from backend.app.models.enums import NotificationKind
from backend.app.services import supervisor as supervisor_service
from backend.app.services.application import expire_overdue_applications
from backend.app.services.workflow import commit_workflow


def publish_second_topic(sessions):
    with sessions() as db:
        topic = db.get(Topic, 2)
        topic.status = TopicStatus.PUBLISHED
        topic.supervisor_id = 2
        db.commit()


def approve_work(client, bearer):
    response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
    assert response.status_code == 200, response.text


def admit_work(client, bearer):
    approve_work(client, bearer)
    response = client.patch(
        "/works/1/progress",
        headers=bearer(4),
        json={"current_stage": AssignmentStage.ADMITTED_TO_DEFENSE, "progress_percent": 70},
    )
    assert response.status_code == 200, response.text
    assert response.json()["progress_percent"] == 100


@pytest.mark.parametrize("suffix", ["applications", "bookings"])
def test_closed_period_blocks_both_application_paths(client, bearer, sessions, suffix):
    publish_second_topic(sessions)
    with sessions() as db:
        db.get(AcademicPeriod, 1).status = PeriodStatus.CLOSED
        db.commit()
    response = client.post(f"/topics/2/{suffix}", json={}, headers=bearer(3))
    assert response.status_code == 403
    assert response.json()["detail"] == "Период подачи заявок закрыт"
    with sessions() as db:
        assert db.scalar(select(func.count(Application.id))) == 1


@pytest.mark.parametrize("actor", [1, 2])
def test_manager_can_assign_in_closed_period_and_release_other_reservations(
    client, bearer, sessions, actor
):
    publish_second_topic(sessions)
    with sessions() as db:
        db.get(AcademicPeriod, 1).status = PeriodStatus.CLOSED
        db.commit()
    response = client.post(
        "/assignments",
        headers=bearer(actor),
        json={"student_id": 1, "topic_id": 2, "comment": "Exceptional department decision"},
    )
    assert response.status_code == 201, response.text
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.WITHDRAWN
        assert db.get(Topic, 1).status == TopicStatus.PUBLISHED
        assert db.scalar(select(func.count(AssignmentProgressHistory.id))) == 1


@pytest.mark.parametrize("path", ["/works/1/progress", "/supervisor/assignments/1/progress"])
@pytest.mark.parametrize("stage", [AssignmentStage.IN_PROGRESS, AssignmentStage.UNDER_REVIEW])
def test_admission_cannot_regress_via_progress_aliases(client, bearer, sessions, path, stage):
    admit_work(client, bearer)
    response = client.patch(
        path,
        headers=bearer(4),
        json={"current_stage": stage, "progress_percent": 10},
    )
    assert response.status_code == 409
    with sessions() as db:
        work = db.get(Assignment, 1)
        assert work.current_stage == AssignmentStage.ADMITTED_TO_DEFENSE
        assert work.progress_percent == 100
        assert len(work.progress_history) == 2


@pytest.mark.parametrize("actor", [1, 2])
def test_manager_revocation_records_actor_comment_and_allows_further_review(
    client, bearer, sessions, actor
):
    admit_work(client, bearer)
    response = client.post(
        "/assignments/1/revoke-admission",
        headers=bearer(actor),
        json={"comment": "  Required corrections discovered  "},
    )
    assert response.status_code == 200, response.text
    assert response.json()["current_stage"] == AssignmentStage.UNDER_REVIEW
    assert response.json()["progress_percent"] == 100
    event = response.json()["progress_history"][-1]
    assert event["from_stage"] == AssignmentStage.ADMITTED_TO_DEFENSE
    assert event["current_stage"] == AssignmentStage.UNDER_REVIEW
    assert event["changed_by_user_id"] == actor
    assert event["comment"] == "Required corrections discovered"
    assert event["changed_at"]
    updated = client.patch(
        "/works/1/progress",
        headers=bearer(4),
        json={
            "current_stage": AssignmentStage.UNDER_REVIEW,
            "progress_percent": 80,
            "comment": "Corrections in review",
        },
    )
    assert updated.status_code == 200, updated.text
    with sessions() as db:
        events = db.get(Assignment, 1).progress_history
        assert len(events) == 4
        assert events[-1].from_progress_percent == 100
        assert events[-1].progress_percent == 80
        assert events[-1].changed_by_user_id == 4


@pytest.mark.parametrize("actor", [3, 4, 7])
def test_revocation_rejects_student_supervisor_and_other_department(
    client, bearer, sessions, actor
):
    admit_work(client, bearer)
    response = client.post(
        "/assignments/1/revoke-admission",
        headers=bearer(actor),
        json={"comment": "Invalid actor"},
    )
    assert response.status_code == 403
    with sessions() as db:
        assert db.get(Assignment, 1).current_stage == AssignmentStage.ADMITTED_TO_DEFENSE
        assert db.scalar(select(func.count(AssignmentProgressHistory.id))) == 2


@pytest.mark.parametrize("body", [{}, {"comment": ""}, {"comment": "   "}])
def test_revocation_requires_nonblank_comment(client, bearer, sessions, body):
    admit_work(client, bearer)
    assert (
        client.post("/assignments/1/revoke-admission", headers=bearer(2), json=body).status_code
        == 422
    )
    with sessions() as db:
        assert len(db.get(Assignment, 1).progress_history) == 2


def test_defended_work_is_terminal_for_progress_and_revocation(client, bearer, sessions):
    admit_work(client, bearer)
    assert (
        client.patch(
            "/works/1/progress",
            headers=bearer(4),
            json={"current_stage": AssignmentStage.DEFENDED, "progress_percent": 100},
        ).status_code
        == 200
    )
    assert (
        client.patch(
            "/works/1/progress",
            headers=bearer(4),
            json={"current_stage": AssignmentStage.UNDER_REVIEW, "progress_percent": 80},
        ).status_code
        == 409
    )
    assert (
        client.post(
            "/assignments/1/revoke-admission",
            headers=bearer(1),
            json={"comment": "Too late"},
        ).status_code
        == 409
    )
    with sessions() as db:
        assert len(db.get(Assignment, 1).progress_history) == 3
        assert db.get(Topic, 1).status == TopicStatus.ARCHIVED


@pytest.mark.parametrize(
    "actor,expected", [(1, 200), (2, 200), (3, 200), (4, 200), (5, 404), (6, 404), (7, 404)]
)
def test_progress_history_is_scoped_and_persisted(client, bearer, actor, expected):
    admit_work(client, bearer)
    response = client.get("/assignments/1/progress-history", headers=bearer(actor))
    assert response.status_code == expected
    if expected == 200:
        rows = response.json()
        assert len(rows) == 2
        assert rows[0]["from_stage"] is None
        assert rows[-1]["changed_by_user_id"] == 4
        assert rows[-1]["from_progress_percent"] == 0
        assert rows[-1]["progress_percent"] == 100


def test_withdrawn_reservation_does_not_archive_topic_at_timeout(client, bearer, sessions):
    publish_second_topic(sessions)
    assert client.post("/topics/2/applications", json={}, headers=bearer(3)).status_code == 201
    approve_work(client, bearer)
    with sessions() as db:
        expire_overdue_applications(db, datetime.now(UTC) + timedelta(days=30))
        db.commit()
        other = db.get(Application, 2)
        assert other.status == ApplicationStatus.WITHDRAWN
        assert other.cooldown_until is None
        assert len(other.history) == 2
        assert db.get(Topic, 2).status == TopicStatus.PUBLISHED


def test_failed_approval_rolls_back_withdrawals_and_progress_history(
    client, bearer, sessions, monkeypatch
):
    publish_second_topic(sessions)
    assert client.post("/topics/2/applications", json={}, headers=bearer(3)).status_code == 201

    def conflicting_commit(db):
        db.add(
            Notification(
                user_id=999999,
                kind=NotificationKind.APPLICATION_APPROVED,
                title="Rollback probe",
                created_at=datetime.now(UTC),
                is_read=False,
            )
        )
        commit_workflow(db)

    monkeypatch.setattr(supervisor_service, "commit_workflow", conflicting_commit)
    response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
    assert response.status_code == 409
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.PENDING
        assert db.get(Application, 2).status == ApplicationStatus.PENDING
        assert db.scalar(select(func.count(Assignment.id))) == 0
        assert db.scalar(select(func.count(AssignmentProgressHistory.id))) == 0
        assert len(db.get(Application, 2).history) == 1
