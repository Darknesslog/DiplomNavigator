"""Department transfers and occupied-topic moderation preserve workflow state."""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import event, func, select
from sqlalchemy.exc import IntegrityError

from backend.app.models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    Assignment,
    AssignmentStatus,
    DepartmentChangeHistory,
    Notification,
    Student,
    Teacher,
    Topic,
    TopicDeletionRequest,
    TopicStatus,
    User,
    UserRole,
)
from backend.app.schemas.accounts import DepartmentUpdate
from backend.app.services.account_management import assign_department
from backend.app.services.topic_deletion import decide_topic_deletion_request


def counts(db):
    return tuple(
        db.scalar(select(func.count()).select_from(model))
        for model in (
            Application,
            ApplicationStatusHistory,
            Assignment,
            Notification,
            DepartmentChangeHistory,
        )
    )


def add_assignment(db, *, status=AssignmentStatus.ACTIVE):
    db.add(
        Assignment(
            student_id=1,
            supervisor_id=2,
            topic_id=1,
            status=status,
            assigned_at=datetime.now(UTC),
            cancel_reason="Historical cancellation"
            if status == AssignmentStatus.CANCELLED
            else None,
        )
    )


@pytest.mark.parametrize("status", ["archived", "rejected"])
@pytest.mark.parametrize("overdue", [False, True])
def test_pending_blocks_topic_moderation(client, bearer, sessions, status, overdue):
    with sessions() as db:
        if overdue:
            db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(days=1)
            db.commit()
        before = db.get(Topic, 1)
        timestamps = (before.published_at, before.archived_at, before.archive_reason)
        before_counts = counts(db)
    response = client.patch("/topics/1/status", json={"status": status}, headers=bearer(2))
    assert response.status_code == 409, response.text
    with sessions() as db:
        topic = db.get(Topic, 1)
        assert topic.status == "published"
        assert (topic.published_at, topic.archived_at, topic.archive_reason) == timestamps
        assert db.get(Application, 1).status == "pending"
        assert counts(db) == before_counts


@pytest.mark.parametrize("overdue", [False, True])
def test_pending_blocks_deletion_approval(client, bearer, sessions, overdue):
    request = client.post("/topics/1/deletion-requests", json={}, headers=bearer(4))
    assert request.status_code == 201, request.text
    request_id = request.json()["id"]
    with sessions() as db:
        if overdue:
            db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(days=1)
            db.commit()
        before_counts = counts(db)
    response = client.patch(
        f"/topics/deletion-requests/{request_id}/approve", json={}, headers=bearer(2)
    )
    assert response.status_code == 409, response.text
    with sessions() as db:
        assert db.get(TopicDeletionRequest, request_id).status == "pending"
        assert db.get(Topic, 1).status == "published"
        assert db.get(Application, 1).status == "pending"
        assert counts(db) == before_counts


def test_pending_blocks_department_transfer(client, bearer, sessions):
    response = client.patch("/users/3/department", json={"department_id": 2}, headers=bearer(1))
    assert response.status_code == 409, response.text
    assert response.json()["detail"]["reasons"] == ["pending_applications"]
    with sessions() as db:
        assert db.get(Student, 1).department_id == 1


@pytest.mark.parametrize("status", ["archived", "rejected", "deletion"])
def test_active_assignment_blocks_closure_without_partial_request(client, bearer, sessions, status):
    with sessions() as db:
        db.get(Application, 1).status = ApplicationStatus.APPROVED
        add_assignment(db)
        db.commit()
        before_counts = counts(db)
    if status == "deletion":
        response = client.post("/topics/1/deletion-requests", json={}, headers=bearer(4))
        request_id = response.json()["id"]
        # Even a caller which catches the conflict and commits cannot persist
        # a partial decision: all guards must precede the first write.
        with sessions() as db:
            with pytest.raises(HTTPException) as error:
                decide_topic_deletion_request(db, db.get(User, 2), request_id, None, approve=True)
            assert error.value.status_code == 409
            db.commit()
        with sessions() as db:
            request = db.get(TopicDeletionRequest, request_id)
            assert request.status == "pending"
            assert request.decided_at is None and request.decided_by_user_id is None
    else:
        response = client.patch("/topics/1/status", json={"status": status}, headers=bearer(2))
        assert response.status_code == 409, response.text
    with sessions() as db:
        assert db.get(Topic, 1).status == TopicStatus.PUBLISHED
        assert counts(db) == before_counts


@pytest.mark.parametrize("status", ["archived", "rejected", "deletion"])
def test_unoccupied_topic_can_be_closed(client, bearer, sessions, status):
    with sessions() as db:
        db.get(Application, 1).status = ApplicationStatus.WITHDRAWN
        db.commit()
    if status == "deletion":
        response = client.post("/topics/1/deletion-requests", json={}, headers=bearer(4))
        response = client.patch(
            f"/topics/deletion-requests/{response.json()['id']}/approve",
            json={},
            headers=bearer(2),
        )
    else:
        response = client.patch("/topics/1/status", json={"status": status}, headers=bearer(2))
    assert response.status_code == 200, response.text
    with sessions() as db:
        topic = db.get(Topic, 1)
        assert topic.status == (TopicStatus.ARCHIVED if status == "deletion" else status)
        assert topic.published_at is None


@pytest.mark.parametrize("user_id", [3, 4])
@pytest.mark.parametrize("blocker", ["pending_applications", "active_assignments"])
@pytest.mark.parametrize("archived", [False, True])
def test_transfer_checks_pending_and_active_independently(
    client, bearer, sessions, user_id, blocker, archived
):
    with sessions() as db:
        if archived:
            db.get(Topic, 1).status = TopicStatus.ARCHIVED
        if blocker == "active_assignments":
            db.get(Application, 1).status = ApplicationStatus.APPROVED
            add_assignment(db)
        else:
            db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(days=1)
        db.commit()
        before = counts(db)
    response = client.patch(
        f"/users/{user_id}/department", json={"department_id": 2}, headers=bearer(1)
    )
    assert response.status_code == 409, response.text
    reasons = [blocker]
    if user_id == 4 and not archived:
        reasons.append("unclosed_topics")
    assert response.json()["detail"] == {
        "code": "department_transfer_blocked",
        "reason": blocker,
        "reasons": reasons,
    }
    with sessions() as db:
        assert counts(db) == before
        assert (
            db.get(Student if user_id == 3 else Teacher, 1 if user_id == 3 else 2).department_id
            == 1
        )


@pytest.mark.parametrize("user_id", [3, 4])
@pytest.mark.parametrize("status", list(TopicStatus))
@pytest.mark.parametrize("promoted", [False, True])
def test_transfer_checks_retained_profile_topics(
    client, bearer, sessions, user_id, status, promoted
):
    with sessions() as db:
        db.get(Application, 1).status = ApplicationStatus.WITHDRAWN
        topic = db.get(Topic, 1)
        topic.status = status
        topic.proposed_by_student_id = 1
        if promoted:
            db.get(User, user_id).role = UserRole.ADMIN
        db.commit()
    response = client.patch(
        f"/users/{user_id}/department", json={"department_id": 2}, headers=bearer(1)
    )
    if status == TopicStatus.ARCHIVED:
        assert response.status_code == 200, response.text
    else:
        assert response.status_code == 409, response.text
        assert response.json()["detail"]["reasons"] == ["unclosed_topics"]
    with sessions() as db:
        assert db.scalar(select(func.count()).select_from(DepartmentChangeHistory)) == int(
            status == TopicStatus.ARCHIVED
        )
        assert db.get(Topic, 1).department_id == 1


@pytest.mark.parametrize("user_id", [3, 4])
def test_all_reasons_have_stable_priority_and_same_department_is_noop(
    client, bearer, sessions, user_id
):
    with sessions() as db:
        db.get(Topic, 1).proposed_by_student_id = 1
        add_assignment(db)
        db.commit()
    admin = bearer(1)
    with sessions() as db:
        before = counts(db)
        profile = db.get(Student if user_id == 3 else Teacher, 1 if user_id == 3 else 2)
        updated_at = profile.updated_at
    response = client.patch(
        f"/users/{user_id}/department", json={"department_id": 2}, headers=admin
    )
    assert response.status_code == 409
    assert response.json()["detail"] == {
        "code": "department_transfer_blocked",
        "reason": "pending_applications",
        "reasons": ["pending_applications", "active_assignments", "unclosed_topics"],
    }
    for _ in range(2):
        response = client.patch(
            f"/users/{user_id}/department", json={"department_id": 1}, headers=admin
        )
        assert response.status_code == 200, response.text
    with sessions() as db:
        assert counts(db) == before
        assert (
            db.get(Student if user_id == 3 else Teacher, 1 if user_id == 3 else 2).updated_at
            == updated_at
        )


@pytest.mark.parametrize("target,actor", [(3, 7), (4, 7), (3, 3), (2, 2)])
def test_same_department_still_requires_authorization(client, bearer, target, actor):
    response = client.patch(
        f"/users/{target}/department", json={"department_id": 1}, headers=bearer(actor)
    )
    assert response.status_code == 403, response.text


@pytest.mark.parametrize("user_id", [3, 4])
@pytest.mark.parametrize("status", [AssignmentStatus.COMPLETED, AssignmentStatus.CANCELLED])
def test_transfer_preserves_historical_objects_and_records_one_audit(
    client, bearer, sessions, user_id, status
):
    with sessions() as db:
        topic = db.get(Topic, 1)
        topic.status = TopicStatus.ARCHIVED
        topic.proposed_by_student_id = 1
        db.get(Application, 1).status = ApplicationStatus.APPROVED
        add_assignment(db, status=status)
        db.commit()
    admin = bearer(1)
    for _ in range(2):
        response = client.patch(
            f"/users/{user_id}/department", json={"department_id": 2}, headers=admin
        )
        assert response.status_code == 200, response.text
    with sessions() as db:
        audit = db.scalars(select(DepartmentChangeHistory)).one()
        assert (audit.user_id, audit.changed_by_user_id) == (user_id, 1)
        assert (audit.old_department_id, audit.new_department_id) == (1, 2)
        assert audit.changed_at is not None
        topic = db.get(Topic, 1)
        assert (topic.department_id, topic.supervisor_id, topic.proposed_by_student_id) == (1, 2, 1)
        assert db.get(Application, 1).student_id == 1
        assignment = db.scalars(select(Assignment)).one()
        assert (assignment.student_id, assignment.supervisor_id, assignment.topic_id) == (1, 2, 1)
        assert assignment.status == status


def test_first_department_assignment_is_audited(client, bearer, sessions):
    response = client.patch("/users/9/department", json={"department_id": 1}, headers=bearer(1))
    assert response.status_code == 200
    with sessions() as db:
        audit = db.scalars(select(DepartmentChangeHistory)).one()
        assert audit.old_department_id is None and audit.new_department_id == 1


@pytest.mark.parametrize("failure", ["audit", "after_flush"])
def test_transfer_rolls_back_profile_and_audit_together(sessions, failure):
    with sessions() as db:
        actor = db.get(User, 1)

        def fail_audit(*_args):
            raise IntegrityError("injected audit failure", {}, ValueError("injected"))

        def fail_commit(session):
            session.flush()
            assert session.scalar(select(func.count()).select_from(DepartmentChangeHistory)) == 1
            raise ValueError("injected after both writes")

        target, event_name, callback = (
            (DepartmentChangeHistory, "before_insert", fail_audit)
            if failure == "audit"
            else (db, "before_commit", fail_commit)
        )
        event.listen(target, event_name, callback)
        try:
            with pytest.raises(HTTPException if failure == "audit" else ValueError):
                assign_department(5, DepartmentUpdate(department_id=1), db, actor)
        finally:
            event.remove(target, event_name, callback)
        assert db.get(Student, 2).department_id == 2
    with sessions() as db:
        assert db.get(Student, 2).department_id == 2
        assert db.scalar(select(func.count()).select_from(DepartmentChangeHistory)) == 0
