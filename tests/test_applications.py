"""Student application and timeout behavior."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from app.models import Application, ApplicationStatus, Topic, TopicStatus


def test_student_creates_application_for_published_topic(client: TestClient, bearer, sessions):
    with sessions() as db:
        topic = db.get(Topic, 2)
        topic.status = TopicStatus.PUBLISHED
        db.commit()

    response = client.post(
        "/topics/2/applications",
        json={"motivation": "This topic matches my interests."},
        headers=bearer(3),
    )

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["status"] == "pending"
    assert body["topic_id"] == 2
    assert body["expires_at"] is not None


def test_student_cannot_apply_to_topic_with_pending_application(
    client: TestClient, bearer, sessions
):
    with sessions() as db:
        topic = db.get(Topic, 2)
        topic.status = TopicStatus.PUBLISHED
        db.add(Application(student_id=1, topic_id=2, status=ApplicationStatus.PENDING))
        db.commit()

    response = client.post(
        "/topics/2/applications",
        json={},
        headers=bearer(3),
    )

    assert response.status_code == 409
    assert response.json()["detail"] in {
        "Student already has an active application",
        "Topic already has a pending application",
    }


def test_rejection_blocks_only_same_student_during_cooldown(client: TestClient, bearer):
    response = client.patch(
        "/supervisor/applications/1/reject",
        json={"comment": "Please choose another topic."},
        headers=bearer(4),
    )
    assert response.status_code == 200

    retry = client.post(
        "/topics/1/applications",
        json={},
        headers=bearer(3),
    )
    assert retry.status_code == 409
    assert "temporarily unavailable" in retry.json()["detail"]


def test_expired_application_archives_topic(client: TestClient, bearer, sessions):
    with sessions() as db:
        application = db.get(Application, 1)
        application.expires_at = datetime.now(UTC) - timedelta(seconds=1)
        db.commit()

    response = client.get("/topics", headers=bearer(5))

    assert response.status_code == 200
    assert all(topic["id"] != 1 for topic in response.json())
    with sessions() as db:
        application = db.get(Application, 1)
        topic = db.get(Topic, 1)
        assert application.status == ApplicationStatus.EXPIRED
        assert topic.status == TopicStatus.ARCHIVED
        assert topic.archive_reason == "expired"


def test_student_cannot_apply_to_archived_topic(client: TestClient, bearer, sessions):
    with sessions() as db:
        topic = db.get(Topic, 1)
        topic.status = TopicStatus.ARCHIVED
        db.commit()

    response = client.post(
        "/topics/1/applications",
        json={},
        headers=bearer(5),
    )

    assert response.status_code == 409
