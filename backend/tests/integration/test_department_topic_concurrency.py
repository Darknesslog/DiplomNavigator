"""Ordered PostgreSQL interleavings: prove actual lock waits, then inspect a third session."""

from concurrent.futures import ThreadPoolExecutor
from threading import Event, get_ident
from time import monotonic

import pytest
from fastapi import HTTPException
from sqlalchemy import event, func, select, text

from backend.app.models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    Assignment,
    AssignmentProgressHistory,
    DepartmentChangeHistory,
    Notification,
    Student,
    Teacher,
    Topic,
    TopicDeletionRequest,
    TopicStatus,
    User,
)
from backend.app.schemas.accounts import DepartmentUpdate
from backend.app.schemas.application import ApplicationCreate
from backend.app.schemas.management import ManualAssignmentCreate
from backend.app.schemas.supervisor import ApplicationDecision
from backend.app.schemas.topic import TopicCreate, TopicStatusUpdate
from backend.app.services.account_management import assign_department
from backend.app.services.application import create_application
from backend.app.services.management import manually_assign
from backend.app.services.supervisor import decide_application
from backend.app.services.topic import create_topic, moderate_topic
from backend.app.services.topic_deletion import decide_topic_deletion_request


def ordered_commands(sessions, engine, first, second, gate):
    """Pause the first command after its row lock, prove the second is blocked.

    Operations own independent sessions. No sleeps determine the interleaving;
    the server's blocking graph is the synchronization condition.
    """
    acquired, release, second_started = Event(), Event(), Event()
    ids = {}

    def pause(_conn, _cursor, statement, _parameters, _context, _many):
        if (
            get_ident() == ids.get("first_thread")
            and f"FROM {gate}" in statement
            and "FOR UPDATE" in statement
            and not acquired.is_set()
        ):
            acquired.set()
            assert release.wait(timeout=10), "First command was not released"

    def run(operation, name):
        with sessions() as db:
            ids[name] = db.scalar(text("SELECT pg_backend_pid()"))
            if name == "first":
                ids["first_thread"] = get_ident()
            else:
                second_started.set()
            try:
                return operation(db), None
            except HTTPException as exc:
                db.rollback()
                return exc.status_code, exc.detail

    event.listen(engine, "after_cursor_execute", pause)
    try:
        with ThreadPoolExecutor(max_workers=2) as pool:
            first_future = pool.submit(run, first, "first")
            try:
                if not acquired.wait(timeout=5):
                    if first_future.done():
                        first_future.result()
                    pytest.fail("First command did not reach the expected row lock")
                second_future = pool.submit(run, second, "second")
                assert second_started.wait(timeout=5)
                deadline = monotonic() + 5
                blocked = False
                with sessions() as observer:
                    while monotonic() < deadline and not second_future.done():
                        blocked = observer.scalar(
                            text("SELECT :blocker = ANY(pg_blocking_pids(:waiter))"),
                            {"blocker": ids["first"], "waiter": ids["second"]},
                        )
                        if blocked:
                            break
                assert blocked, "PostgreSQL did not report the expected blocking edge"
            finally:
                release.set()
            return first_future.result(timeout=15), second_future.result(timeout=15)
    finally:
        event.remove(engine, "after_cursor_execute", pause)


def transfer(db, user_id):
    assign_department(user_id, DepartmentUpdate(department_id=2), db, db.get(User, 1))
    return 200


@pytest.mark.parametrize(
    "profile,kind",
    [
        ("student", "proposal"),
        ("teacher", "proposal"),
        ("teacher", "company_proposal"),
        ("student", "submit"),
        ("teacher", "submit"),
        ("student", "approve"),
        ("teacher", "approve"),
        ("student", "manual"),
        ("teacher", "manual"),
    ],
)
@pytest.mark.parametrize("transfer_first", [False, True])
def test_transfer_serializes_with_link_creation(
    sessions, postgres_engine, kind, profile, transfer_first
):
    user_id = 3 if profile == "student" else 4
    proposing = kind in ("proposal", "company_proposal")
    with sessions() as db:
        if kind != "approve":
            db.get(Application, 1).status = ApplicationStatus.WITHDRAWN
        if proposing:
            db.get(Topic, 1).status = TopicStatus.ARCHIVED
        db.commit()
        assert db.scalar(text("SHOW transaction_isolation")) == "read committed"

    def create_link(db):
        if proposing:
            company = kind == "company_proposal"
            create_topic(
                db,
                TopicCreate(
                    period_id=1,
                    supervisor_id=2,
                    department_id=1,
                    proposed_by_student_id=1 if profile == "student" else None,
                    title="Concurrent proposal",
                    description="Lock-order regression",
                    source="company"
                    if company
                    else "student"
                    if profile == "student"
                    else "teacher",
                    company_name="Partner" if company else None,
                ),
                db.get(User, 2 if company or profile == "student" else 4),
            )
            return 201
        if kind == "submit":
            create_application(db, db.get(User, 3), 1, ApplicationCreate())
            return 201
        if kind == "approve":
            decide_application(db, db.get(User, 4), 1, ApplicationDecision(), approve=True)
            return 200
        manually_assign(
            db,
            db.get(User, 2),
            ManualAssignmentCreate(student_id=1, topic_id=1, comment="Concurrent assignment"),
        )
        return 201

    def move(db):
        return transfer(db, user_id)

    operations = (move, create_link) if transfer_first else (create_link, move)
    first, second = ordered_commands(
        sessions,
        postgres_engine,
        *operations,
        gate="students" if profile == "student" else "teachers",
    )
    moved, linked = (first, second) if transfer_first else (second, first)
    can_move_first = proposing or (profile == "student" and kind != "approve")
    move_wins = transfer_first and can_move_first
    assert moved[0] == (200 if move_wins else 409), (moved, linked)
    expected_link = (
        403
        if move_wins and kind == "submit"
        else 409
        if move_wins
        else 200
        if kind == "approve"
        else 201
    )
    assert linked[0] == expected_link, (moved, linked)
    if not move_wins:
        assert moved[1]["code"] == "department_transfer_blocked"
        expected = (
            "unclosed_topics"
            if proposing
            or (transfer_first and profile == "teacher" and kind in ("submit", "manual"))
            else "pending_applications"
            if kind == "submit" or (transfer_first and kind == "approve")
            else "active_assignments"
        )
        assert moved[1]["reason"] == expected, (moved, linked)
    with sessions() as db:
        profile_row = db.get(
            Student if profile == "student" else Teacher, 1 if profile == "student" else 2
        )
        assert profile_row.department_id == (2 if move_wins else 1)
        audits = list(db.scalars(select(DepartmentChangeHistory)))
        assert len(audits) == int(move_wins)
        if audits:
            assert (
                audits[0].user_id,
                audits[0].changed_by_user_id,
                audits[0].old_department_id,
                audits[0].new_department_id,
            ) == (user_id, 1, 1, 2)
        assert db.get(Topic, 1).department_id == 1
        assignments = db.scalar(select(func.count()).select_from(Assignment))
        assert assignments == int(kind in ("approve", "manual") and not move_wins)
        assert db.scalar(select(func.count()).select_from(AssignmentProgressHistory)) == assignments
        assert db.scalar(select(func.count()).select_from(Notification)) == assignments
        expected_applications = 1 + int(kind in ("submit", "manual") and not move_wins)
        assert db.scalar(select(func.count()).select_from(Application)) == expected_applications
        expected_history = int(kind in ("submit", "approve", "manual") and not move_wins)
        assert (
            db.scalar(select(func.count()).select_from(ApplicationStatusHistory))
            == expected_history
        )
        assert db.scalar(select(func.count()).select_from(Topic)) == 2 + int(
            proposing and not move_wins
        )
        if proposing and not move_wins:
            topic = db.scalar(select(Topic).where(Topic.title == "Concurrent proposal"))
            assert topic.department_id == db.get(Teacher, topic.supervisor_id).department_id
            assert topic.status == (
                TopicStatus.PUBLISHED if kind == "company_proposal" else TopicStatus.DRAFT
            )
            if topic.proposed_by_student_id:
                assert (
                    topic.department_id
                    == db.get(Student, topic.proposed_by_student_id).department_id
                )


@pytest.mark.parametrize("closure", ["archived", "rejected", "deletion"])
@pytest.mark.parametrize("link", ["submit", "manual", "approve"])
@pytest.mark.parametrize("closure_first", [False, True])
def test_topic_closure_serializes_with_links(
    sessions, postgres_engine, closure, link, closure_first
):
    with sessions() as db:
        if link != "approve":
            db.get(Application, 1).status = ApplicationStatus.WITHDRAWN
        request = TopicDeletionRequest(topic_id=1, requested_by_user_id=4, status="pending")
        db.add(request)
        db.commit()
        request_id = request.id

    def close(db):
        if closure == "deletion":
            decide_topic_deletion_request(db, db.get(User, 2), request_id, None, approve=True)
        else:
            moderate_topic(db, db.get(User, 2), 1, TopicStatusUpdate(status=closure))
        return 200

    def create_link(db):
        if link == "submit":
            create_application(db, db.get(User, 3), 1, ApplicationCreate())
            return 201
        if link == "approve":
            decide_application(db, db.get(User, 4), 1, ApplicationDecision(), approve=True)
            return 200
        manually_assign(
            db,
            db.get(User, 2),
            ManualAssignmentCreate(student_id=1, topic_id=1, comment="Closure race"),
        )
        return 201

    operations = (close, create_link) if closure_first else (create_link, close)
    first, second = ordered_commands(sessions, postgres_engine, *operations, gate="topics")
    closed, linked = (first, second) if closure_first else (second, first)
    closes = closure_first and link != "approve"
    assert closed[0] == (200 if closes else 409), (closed, linked)
    assert linked[0] == (409 if closes else 200 if link == "approve" else 201), (closed, linked)
    with sessions() as db:
        topic = db.get(Topic, 1)
        assert topic.status == (
            TopicStatus.ARCHIVED
            if closes and closure == "deletion"
            else closure
            if closes
            else TopicStatus.PUBLISHED
        )
        request = db.get(TopicDeletionRequest, request_id)
        approved_request = closes and closure == "deletion"
        assert request.status == ("approved" if approved_request else "pending")
        assert (request.decided_at is not None) == approved_request
        assignments = int(not closes and link in ("approve", "manual"))
        assert db.scalar(select(func.count()).select_from(Assignment)) == assignments
        assert db.scalar(select(func.count()).select_from(AssignmentProgressHistory)) == assignments
        assert db.scalar(select(func.count()).select_from(Notification)) == (
            assignments + int(approved_request)
        )
        assert db.scalar(select(func.count()).select_from(DepartmentChangeHistory)) == 0
