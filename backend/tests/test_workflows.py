"""Role boundaries, workload invariants, notifications and supervisor work aliases."""

import pytest
from sqlalchemy import select

from backend.app.models import (
    Application,
    Assignment,
    Notification,
    Student,
    Topic,
    TopicDeletionRequest,
    TopicDeletionRequestStatus,
)


def approve(client, bearer, user_id=4):
    """Approve the fixture request through the common reservation route."""
    return client.patch("/reservations/1/approve", json={}, headers=bearer(user_id))


@pytest.mark.parametrize("actor", [1, 2, 4])
def test_admin_head_and_owner_can_approve(client, bearer, sessions, actor):
    response = approve(client, bearer, actor)
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "approved"
    with sessions() as db:
        assignment = db.scalar(select(Assignment))
        assert assignment.supervisor_id == 2
        assert db.get(Application, 1).decided_by_user_id == actor
    notification = client.get("/notifications", headers=bearer(3)).json()
    assert notification[0]["kind"] == "application_approved"
    assert client.get("/notifications", headers=bearer(5)).json() == []


@pytest.mark.parametrize("actor", [3, 6, 7])
def test_other_department_and_student_cannot_approve(client, bearer, actor):
    assert approve(client, bearer, actor).status_code == 403


def test_approval_updates_derived_load_and_supervisor_works(client, bearer):
    assert approve(client, bearer).status_code == 200
    works = client.get("/supervisor/works", headers=bearer(4)).json()
    assert works[0]["student"]["group_name"] == "G1"
    assert works[0]["progress_percent"] == 0
    assert client.get("/supervisor/works", headers=bearer(6)).json() == []
    dashboard = client.get("/supervisor/dashboard", headers=bearer(4)).json()
    assert dashboard["current_load"] == 1
    assert dashboard["available_places"] == 4
    assert approve(client, bearer).status_code == 409


def test_rejection_notifies_and_releases_topic(client, bearer, sessions):
    response = client.patch(
        "/reservations/1/reject", json={"comment": "Please revise"}, headers=bearer(2)
    )
    assert response.status_code == 200
    assert response.json()["status"] == "rejected"
    with sessions() as db:
        assert db.get(Topic, 1).status == "published"
        other_student = db.get(Student, 2)
        other_student.department_id = 1
        db.commit()
    retry = client.post("/topics/1/applications", json={}, headers=bearer(3))
    assert retry.status_code == 409
    other = client.post("/topics/1/applications", json={}, headers=bearer(5))
    assert other.status_code == 201, other.text
    notifications = client.get("/notifications", headers=bearer(3)).json()
    assert notifications[0]["kind"] == "application_rejected"
    assert notifications[0]["body"] == "Please revise"


def test_admission_forces_100_and_checks_ownership(client, bearer):
    assert approve(client, bearer).status_code == 200
    response = client.patch(
        "/works/1/progress",
        json={
            "status": "admitted_to_defense",
            "progress_percent": 12,
        },
        headers=bearer(4),
    )
    assert response.status_code == 200, response.text
    assert response.json()["progress_percent"] == 100
    assert response.json()["status"] == "active"
    assert response.json()["current_stage"] == "admitted_to_defense"
    assert (
        client.patch(
            "/works/1/progress",
            json={
                "current_stage": "in_progress",
                "progress_percent": 10,
            },
            headers=bearer(6),
        ).status_code
        == 403
    )
    assert (
        client.patch(
            "/works/1/progress",
            json={
                "current_stage": "in_progress",
                "progress_percent": 101,
            },
            headers=bearer(4),
        ).status_code
        == 422
    )


def test_limit_change_recalculates_department_and_prevents_overcommit(client, bearer, sessions):
    response = client.patch("/supervisors/2/limit", json={"max_students": 1}, headers=bearer(2))
    assert response.status_code == 200, response.text
    assert response.json()["supervisor"]["available_places"] == 1
    assert len(response.json()["department_workload"]) == 2
    assert approve(client, bearer).status_code == 200
    with sessions() as db:
        db.add(
            Topic(
                id=3,
                period_id=1,
                supervisor_id=2,
                department_id=1,
                created_by_user_id=4,
                title="Another topic",
                description="Description",
                status="published",
            )
        )
        db.add(Application(id=2, student_id=4, topic_id=3, status="pending"))
        db.get(Student, 4).department_id = 1
        db.commit()
    response = client.patch("/reservations/2/approve", json={}, headers=bearer(2))
    assert response.status_code == 409
    assert (
        client.patch(
            "/supervisors/2/limit", json={"max_students": 2}, headers=bearer(2)
        ).status_code
        == 200
    )
    assert client.patch("/reservations/2/approve", json={}, headers=bearer(2)).status_code == 200
    assert (
        client.patch(
            "/supervisors/2/limit", json={"max_students": 1}, headers=bearer(2)
        ).status_code
        == 409
    )


@pytest.mark.parametrize("actor", [3, 4, 7])
def test_limit_change_forbidden_outside_manager_scope(client, bearer, actor):
    assert (
        client.patch(
            "/supervisors/2/limit", json={"max_students": 8}, headers=bearer(actor)
        ).status_code
        == 403
    )


def test_manual_assignment_preserves_three_entities_and_notifies(client, bearer, sessions):
    with sessions() as db:
        topic = db.get(Topic, 2)
        topic.status = "published"
        db.get(Student, 4).department_id = 1
        db.commit()
    response = client.post(
        "/assignments",
        json={
            "student_id": 4,
            "topic_id": 2,
            "comment": "Department decision",
        },
        headers=bearer(2),
    )
    assert response.status_code == 201, response.text
    with sessions() as db:
        application = db.scalar(select(Application).where(Application.topic_id == 2))
        assert application.status == "approved"
        assert application.history[0].changed_by_user_id == 2
        assert db.scalar(select(Notification).where(Notification.user_id == 9)) is not None
    repeated = client.post(
        "/assignments",
        json={
            "student_id": 4,
            "topic_id": 2,
            "comment": "Repeat",
        },
        headers=bearer(2),
    )
    assert repeated.status_code == 409


@pytest.mark.parametrize("actor,code", [(3, 403), (4, 403), (7, 403), (2, 409)])
def test_manual_assignment_cannot_steal_pending_topic(client, bearer, actor, code):
    assert (
        client.post(
            "/assignments",
            json={
                "student_id": 1,
                "topic_id": 1,
                "comment": "Department decision",
            },
            headers=bearer(actor),
        ).status_code
        == code
    )


def test_head_dashboard_and_lists_do_not_leak_other_department(client, bearer):
    assert client.get("/dashboard/head?department_id=2", headers=bearer(2)).status_code == 403
    assert client.get("/dashboard/head", headers=bearer(3)).status_code == 403
    assert client.get("/dashboard/head", headers=bearer(1)).status_code == 422
    response = client.get("/booking-requests", headers=bearer(7))
    assert response.status_code == 200
    assert response.json() == []
    assert client.get("/study-groups", headers=bearer(1)).json()[0]["name"] == "G1"
    assert client.get("/academic-periods", headers=bearer(1)).json()[0]["id"] == 1


def test_assigned_topic_cannot_be_reserved_by_another_student(client, bearer, sessions):
    assert approve(client, bearer).status_code == 200
    with sessions() as db:
        db.get(Student, 2).department_id = 1
        db.commit()
    assert client.post("/topics/1/applications", json={}, headers=bearer(5)).status_code == 409
    topics = client.get("/topics", headers=bearer(5)).json()
    topic = next(topic for topic in topics if topic["id"] == 1)
    assert topic["status"] == "published"
    assert topic["is_reserved"] is True
    assert topic["status_label"] == "Занята"


def test_supervisor_requests_topic_deletion_and_head_rejects(client, bearer, sessions):
    response = client.post(
        "/topics/1/deletion-requests",
        json={"reason": "Тема больше не соответствует плану кафедры."},
        headers=bearer(4),
    )
    assert response.status_code == 201, response.text
    request_id = response.json()["id"]

    listed = client.get("/topics/deletion-requests", headers=bearer(2))
    assert listed.status_code == 200
    assert listed.json()[0]["id"] == request_id

    decision = client.patch(
        f"/topics/deletion-requests/{request_id}/reject",
        json={"comment": "Оставить тему в банке тем."},
        headers=bearer(2),
    )
    assert decision.status_code == 200
    assert decision.json()["status"] == "rejected"
    assert client.get("/topics/1", headers=bearer(3)).json()["status"] == "published"

    with sessions() as db:
        request = db.get(TopicDeletionRequest, request_id)
        assert request.status == TopicDeletionRequestStatus.REJECTED


def test_head_approves_topic_deletion_and_archives_topic(client, bearer):
    response = client.post(
        "/topics/1/deletion-requests",
        json={"reason": "Тема больше не нужна."},
        headers=bearer(4),
    )
    assert response.status_code == 201
    request_id = response.json()["id"]

    decision = client.patch(
        f"/topics/deletion-requests/{request_id}/approve",
        json={"comment": "Архивировано по решению кафедры."},
        headers=bearer(2),
    )
    assert decision.status_code == 200
    assert decision.json()["status"] == "approved"
    topic = client.get("/topics/1", headers=bearer(2))
    assert topic.status_code == 200
    assert topic.json()["status"] == "archived"
    assert topic.json()["archive_reason"] == "deleted"


def test_supervisor_cannot_request_another_supervisors_topic_deletion(client, bearer):
    response = client.post(
        "/topics/1/deletion-requests",
        json={},
        headers=bearer(6),
    )
    assert response.status_code == 403
