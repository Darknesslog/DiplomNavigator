"""Independent API checks for partner-topic changes in 8365508."""

import pytest

from backend.app.models import Topic, TopicSource, TopicStatus


@pytest.mark.parametrize(
    "actor,source,expected,status",
    [
        (2, TopicSource.COMPANY, 201, TopicStatus.PUBLISHED),
        (1, TopicSource.COMPANY, 201, TopicStatus.DRAFT),
        (2, TopicSource.TEACHER, 201, TopicStatus.DRAFT),
        (4, TopicSource.COMPANY, 403, None),
        (3, TopicSource.COMPANY, 403, None),
        (7, TopicSource.COMPANY, 403, None),
    ],
)
def test_partner_publication_role_boundary(
    client, bearer, sessions, actor, source, expected, status
):
    payload = {
        "period_id": 1,
        "supervisor_id": 2,
        "title": "Partner audit topic",
        "description": "Publication and department boundary audit",
        "source": source,
    }
    if source == TopicSource.COMPANY:
        payload["company_name"] = "Audit partner"
    response = client.post("/topics", headers=bearer(actor), json=payload)
    assert response.status_code == expected, response.text
    if expected != 201:
        return
    body = response.json()
    assert body["status"] == status
    assert (body["published_at"] is not None) == (status == TopicStatus.PUBLISHED)
    with sessions() as db:
        assert db.get(Topic, body["id"]).status == status
    own_catalog = client.get("/topics", headers=bearer(3)).json()
    foreign_catalog = client.get("/topics", headers=bearer(5)).json()
    assert any(row["id"] == body["id"] for row in own_catalog) == (status == TopicStatus.PUBLISHED)
    assert all(row["id"] != body["id"] for row in foreign_catalog)
    if status == TopicStatus.PUBLISHED:
        assert body["source_label"] == "Тема от партнера"
        assert body["is_reserved"] is False
        applied = client.post(f"/topics/{body['id']}/applications", headers=bearer(3), json={})
        assert applied.status_code == 201, applied.text


def test_student_source_label_preserves_draft_workflow(client, bearer):
    response = client.post(
        "/topics",
        headers=bearer(2),
        json={
            "period_id": 1,
            "supervisor_id": 2,
            "title": "Student audit topic",
            "description": "Student-origin label audit",
            "source": TopicSource.STUDENT,
            "proposed_by_student_id": 1,
        },
    )
    assert response.status_code == 201, response.text
    assert response.json()["status"] == TopicStatus.DRAFT
    assert response.json()["source_label"] == "Тема от студента"


@pytest.mark.parametrize("company_name", [None, "", "   "])
def test_partner_requires_nonempty_company_name(client, bearer, company_name):
    response = client.post(
        "/topics",
        headers=bearer(2),
        json={
            "period_id": 1,
            "supervisor_id": 2,
            "title": "Invalid partner topic",
            "description": "Company identity validation",
            "source": TopicSource.COMPANY,
            "company_name": company_name,
        },
    )
    assert response.status_code == 422, response.text
