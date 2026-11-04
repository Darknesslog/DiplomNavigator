"""Topic visibility, ownership, and moderation behavior."""

from fastapi.testclient import TestClient


def test_student_sees_only_published_topics(client: TestClient, bearer):
    response = client.get("/topics", headers=bearer(3))

    assert response.status_code == 200
    assert [topic["id"] for topic in response.json()] == [1]


def test_supervisor_creates_topic_for_self(client: TestClient, bearer):
    response = client.post(
        "/topics",
        json={
            "period_id": 1,
            "title": "New supervisor topic",
            "description": "Description",
        },
        headers=bearer(4),
    )

    assert response.status_code == 201, response.text
    assert response.json()["supervisor_id"] == 2
    assert response.json()["department_id"] == 1
    assert response.json()["status"] == "draft"


def test_department_head_can_create_company_topic_for_own_department(
    client: TestClient, bearer
):
    response = client.post(
        "/topics",
        json={
            "period_id": 1,
            "supervisor_id": 2,
            "title": "Partner topic",
            "description": "A topic proposed by a commercial partner.",
            "source": "company",
            "company_name": "Partner LLC",
        },
        headers=bearer(2),
    )

    assert response.status_code == 201, response.text
    assert response.json()["source"] == "company"
    assert response.json()["company_name"] == "Partner LLC"


def test_supervisor_cannot_create_topic_for_another_supervisor(client: TestClient, bearer):
    response = client.post(
        "/topics",
        json={
            "period_id": 1,
            "supervisor_id": 1,
            "title": "Invalid ownership",
            "description": "This request must fail ownership validation.",
        },
        headers=bearer(4),
    )

    assert response.status_code == 403


def test_department_head_publishes_only_own_department_topic(client: TestClient, bearer):
    own = client.patch(
        "/topics/2/status",
        json={"status": "published"},
        headers=bearer(2),
    )
    foreign = client.patch(
        "/topics/2/status",
        json={"status": "published"},
        headers=bearer(7),
    )

    assert own.status_code == 200
    assert own.json()["published_at"] is not None
    assert foreign.status_code == 403
