"""Real PostgreSQL transactions, row locks, and workflow contention."""

from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime
from threading import Barrier, Event

import pytest
from fastapi import HTTPException
from sqlalchemy import event, func, select, text

from backend.app.models import (
    Application,
    ApplicationStatus,
    Assignment,
    AssignmentStatus,
    Notification,
    Student,
    Teacher,
    Topic,
    TopicStatus,
    User,
)
from backend.app.services.management import update_limit
from backend.app.services.workflow import commit_workflow


def race(client, operations):
    """Release two independent HTTP requests together; each uses its own DB session."""
    ready = Barrier(2)

    def request(operation):
        method, path, headers, payload = operation
        ready.wait(timeout=5)
        return client.request(method, path, headers=headers, json=payload)

    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(request, operation) for operation in operations]
        return [future.result(timeout=20) for future in futures]


def second_application(sessions, *, same_student=False):
    with sessions() as db:
        topic = db.get(Topic, 2)
        topic.status = TopicStatus.PUBLISHED
        topic.supervisor_id = 2
        db.get(Student, 4).department_id = 1
        db.add(
            Application(
                id=2,
                student_id=1 if same_student else 4,
                topic_id=2,
                status=ApplicationStatus.PENDING,
            )
        )
        db.commit()


def test_parallel_applications_reserve_topic_once(client, bearer, sessions):
    with sessions() as db:
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.get(Student, 4).department_id = 1
        db.commit()
    responses = race(
        client,
        [
            ("POST", "/topics/2/applications", bearer(3), {}),
            ("POST", "/topics/2/bookings", bearer(9), {}),
        ],
    )
    assert sorted(row.status_code for row in responses) == [201, 409]
    with sessions() as db:
        assert db.scalar(
            select(func.count(Application.id)).where(
                Application.topic_id == 2, Application.status == ApplicationStatus.PENDING
            )
        ) == 1


def test_parallel_duplicate_approval_has_single_effect(client, bearer, sessions):
    headers = bearer(4)
    responses = race(
        client,
        [
            ("PATCH", "/reservations/1/approve", headers, {}),
            ("PATCH", "/reservations/1/approve", headers, {}),
        ],
    )
    assert sorted(row.status_code for row in responses) == [200, 409]
    with sessions() as db:
        assert db.scalar(select(func.count()).select_from(Assignment)) == 1
        assert db.scalar(select(func.count()).select_from(Notification)) == 1
        assert len(db.get(Application, 1).history) == 1


def test_parallel_approve_and_reject_have_one_winner(client, bearer, sessions):
    headers = bearer(4)
    responses = race(
        client,
        [
            ("PATCH", "/reservations/1/approve", headers, {}),
            ("PATCH", "/reservations/1/reject", headers, {}),
        ],
    )
    assert sorted(row.status_code for row in responses) == [200, 409]
    with sessions() as db:
        application = db.get(Application, 1)
        expected = int(application.status == ApplicationStatus.APPROVED)
        assert db.scalar(select(func.count()).select_from(Assignment)) == expected
        assert db.scalar(select(func.count()).select_from(Notification)) == 1
        assert len(application.history) == 1


def test_parallel_approvals_cannot_take_same_last_slot(client, bearer, sessions):
    second_application(sessions)
    with sessions() as db:
        db.get(Teacher, 2).max_students = 1
        db.commit()
    headers = bearer(4)
    responses = race(
        client,
        [
            ("PATCH", "/reservations/1/approve", headers, {}),
            ("PATCH", "/reservations/2/approve", headers, {}),
        ],
    )
    assert sorted(row.status_code for row in responses) == [200, 409]
    with sessions() as db:
        assert db.scalar(select(func.count()).select_from(Assignment)) == 1
        assert db.scalar(select(func.count()).select_from(Notification)) == 1


def test_parallel_approvals_cannot_assign_student_twice(client, bearer, sessions):
    second_application(sessions, same_student=True)
    headers = bearer(4)
    responses = race(
        client,
        [
            ("PATCH", "/reservations/1/approve", headers, {}),
            ("PATCH", "/reservations/2/approve", headers, {}),
        ],
    )
    assert sorted(row.status_code for row in responses) == [200, 409]
    with sessions() as db:
        assert db.scalar(select(func.count()).select_from(Assignment)) == 1


def test_manual_assignment_and_approval_share_capacity_lock(client, bearer, sessions):
    with sessions() as db:
        db.get(Teacher, 2).max_students = 1
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.get(Topic, 2).supervisor_id = 2
        db.get(Student, 4).department_id = 1
        db.commit()
    responses = race(
        client,
        [
            ("PATCH", "/reservations/1/approve", bearer(4), {}),
            (
                "POST",
                "/assignments",
                bearer(2),
                {
                    "student_id": 4,
                    "topic_id": 2,
                    "comment": "Concurrent manual assignment",
                },
            ),
        ],
    )
    codes = sorted(row.status_code for row in responses)
    assert codes in ([200, 409], [201, 409]), [row.text for row in responses]
    with sessions() as db:
        assert db.scalar(select(func.count()).select_from(Assignment)) == 1


def test_conflict_helper_rolls_back_pending_side_effects(sessions):
    with sessions() as db:
        db.add(Notification(user_id=3, kind="audit", title="Must roll back", is_read=False))
        db.add(Application(student_id=4, topic_id=1, status=ApplicationStatus.PENDING))
        with pytest.raises(HTTPException) as error:
            commit_workflow(db)
        assert error.value.status_code == 409
        assert db.scalar(select(func.count()).select_from(Notification)) == 0
        assert db.get(Application, 1).status == ApplicationStatus.PENDING


def test_migrated_database_has_expected_partial_indexes(sessions):
    with sessions() as db:
        assert db.scalar(text("SELECT version_num FROM alembic_version")) == "c7e2f3a4b5c6"
        definitions = dict(
            db.execute(
                text("SELECT indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'")
            ).all()
        )
        assert "WHERE" in definitions["uq_assignments_student_id_active"]
        assert "cancelled" in definitions["uq_assignments_topic_not_cancelled"]
        assert "approved" in definitions["uq_applications_topic_id_active"]


def test_approval_rechecks_limit_changed_while_waiting_for_lock(
    client, bearer, sessions, postgres_engine
):
    """Regression: identity-map Teacher must not retain the pre-lock capacity limit."""
    headers = bearer(4)
    with sessions() as db:
        db.get(Teacher, 2).max_students = 2
        db.add(
            Assignment(
                student_id=3,
                topic_id=2,
                supervisor_id=2,
                status=AssignmentStatus.ACTIVE,
                assigned_at=datetime.now(UTC),
            )
        )
        db.commit()
    reached_lock = Event()

    def observe_teacher_lock(_conn, _cursor, statement, _parameters, _context, _many):
        if "FROM teachers" in statement and "FOR UPDATE" in statement:
            reached_lock.set()

    with sessions() as manager:
        manager.scalar(select(Teacher).where(Teacher.id == 2).with_for_update())
        event.listen(postgres_engine, "before_cursor_execute", observe_teacher_lock)
        try:
            with ThreadPoolExecutor(max_workers=1) as pool:
                pending = pool.submit(
                    client.patch, "/reservations/1/approve", json={}, headers=headers
                )
                try:
                    assert reached_lock.wait(timeout=5), "Approval did not reach teacher row lock"
                    assert not pending.done(), "Approval did not wait for the teacher lock"
                    result = update_limit(manager, manager.get(User, 2), 2, 1)
                    assert result.supervisor.max_students == 1
                finally:
                    manager.rollback()
                response = pending.result(timeout=15)
        finally:
            event.remove(postgres_engine, "before_cursor_execute", observe_teacher_lock)
    with sessions() as db:
        maximum = db.get(Teacher, 2).max_students
        load = db.scalar(
            select(func.count())
            .select_from(Assignment)
            .where(
                Assignment.supervisor_id == 2,
                Assignment.status == AssignmentStatus.ACTIVE,
            )
        )
    assert response.status_code == 409 and load <= maximum, (
        f"approval returned {response.status_code}; actual load={load}, committed limit={maximum}"
    )
