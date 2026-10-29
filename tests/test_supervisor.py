"""Supervisor application decisions and progress behavior."""

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.models import Assignment


def test_supervisor_lists_only_applications_for_own_topics(client: TestClient, bearer):
    response = client.get("/supervisor/applications", headers=bearer(4))

    assert response.status_code == 200
    assert [application["id"] for application in response.json()] == [1]


def test_supervisor_approves_application_and_creates_assignment(client: TestClient, bearer, sessions):
    response = client.patch(
        "/supervisor/applications/1/approve",
        json={"comment": "Approved after review."},
        headers=bearer(4),
    )

    assert response.status_code == 200, response.text
    assert response.json()["status"] == "approved"
    with sessions() as db:
        assignment = db.scalar(select(Assignment))
        assert assignment.student_id == 1
        assert assignment.topic_id == 1
        assert assignment.progress_percent == 0
        assert assignment.current_stage == "in_progress"


def test_supervisor_rejects_application(client: TestClient, bearer):
    response = client.patch(
        "/supervisor/applications/1/reject",
        json={"comment": "Please choose a different topic."},
        headers=bearer(4),
    )

    assert response.status_code == 200, response.text
    assert response.json()["status"] == "rejected"


def test_supervisor_updates_progress_and_completes_defended_work(client: TestClient, bearer, sessions):
    approved = client.patch(
        "/supervisor/applications/1/approve",
        json={},
        headers=bearer(4),
    )
    assert approved.status_code == 200

    response = client.patch(
        "/supervisor/assignments/1/progress",
        json={"progress_percent": 100, "current_stage": "defended"},
        headers=bearer(4),
    )

    assert response.status_code == 200, response.text
    assert response.json()["status"] == "completed"
    assert response.json()["current_stage"] == "defended"


def test_defended_work_requires_full_progress(client: TestClient, bearer):
    approved = client.patch(
        "/supervisor/applications/1/approve",
        json={},
        headers=bearer(4),
    )
    assert approved.status_code == 200

    response = client.patch(
        "/supervisor/assignments/1/progress",
        json={"progress_percent": 99, "current_stage": "defended"},
        headers=bearer(4),
    )

    assert response.status_code == 422
