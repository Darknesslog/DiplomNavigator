"""Fifty independent API/invariant cases, including observed policy limitations."""

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from backend.app.models import (
    AcademicPeriod,
    Application,
    ApplicationStatus,
    Assignment,
    AssignmentStage,
    AssignmentStatus,
    Notification,
    Student,
    Teacher,
    Topic,
    TopicStatus,
    User,
    UserRole,
)
from backend.app.models.enums import PeriodStatus


def approve(client, bearer):
    response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
    assert response.status_code == 200, response.text
    return response


def free_topic(sessions):
    with sessions() as db:
        db.get(Topic, 2).status = TopicStatus.PUBLISHED
        db.get(Student, 4).department_id = 1
        db.commit()


@pytest.mark.parametrize("action", ["approve", "reject"])
@pytest.mark.parametrize(
    "actor,expected", [(1, 200), (2, 200), (4, 200), (3, 403), (6, 403), (7, 403)]
)
def test_decision_role_scope_and_atomic_effects(client, bearer, sessions, action, actor, expected):
    response = client.patch(
        f"/reservations/1/{action}", json={"comment": "Audit decision"}, headers=bearer(actor)
    )
    assert response.status_code == expected, response.text
    with sessions() as db:
        application = db.get(Application, 1)
        assignments = db.scalar(select(func.count()).select_from(Assignment))
        notices = list(db.scalars(select(Notification)))
        if expected == 403:
            assert application.status == ApplicationStatus.PENDING
            assert assignments == 0
            assert notices == []
            assert application.history == []
        else:
            target = (
                ApplicationStatus.APPROVED if action == "approve" else ApplicationStatus.REJECTED
            )
            assert application.status == target
            assert application.decided_by_user_id == actor
            assert application.history[-1].to_status == target
            assert application.history[-1].comment == "Audit decision"
            assert assignments == (1 if action == "approve" else 0)
            assert len(notices) == 1
            assert notices[0].user_id == 3
            assert notices[0].kind == f"application_{target.value}"
            assert notices[0].payload["application_id"] == 1


@pytest.mark.parametrize(
    "guard",
    [
        "teacher_inactive",
        "teacher_wrong_role",
        "student_inactive",
        "student_wrong_role",
        "department_missing",
        "department_other",
        "capacity",
    ],
)
def test_approval_guards_preserve_pending_application(client, bearer, sessions, guard):
    headers = bearer(2)
    with sessions() as db:
        if guard == "teacher_inactive":
            db.get(User, 4).is_active = False
        elif guard == "teacher_wrong_role":
            db.get(User, 4).role = UserRole.STUDENT
        elif guard == "student_inactive":
            db.get(User, 3).is_active = False
        elif guard == "student_wrong_role":
            db.get(User, 3).role = UserRole.ADMIN
        elif guard == "department_missing":
            db.get(Student, 1).department_id = None
        elif guard == "department_other":
            db.get(Student, 1).department_id = 2
        else:
            free = db.get(Topic, 2)
            free.supervisor_id = 2
            db.get(Teacher, 2).max_students = 1
            db.add(
                Assignment(student_id=3, topic_id=2, supervisor_id=2, assigned_at=datetime.now(UTC))
            )
        db.commit()
    response = client.patch("/reservations/1/approve", json={}, headers=headers)
    assert response.status_code == 409, response.text
    with sessions() as db:
        assert db.get(Application, 1).status == ApplicationStatus.PENDING
        assert db.get(Application, 1).history == []
        assert db.scalar(select(func.count()).select_from(Notification)) == 0
        assert db.scalar(select(Assignment).where(Assignment.topic_id == 1)) is None


@pytest.mark.parametrize(
    "case,actor,expected",
    [
        ("admin", 1, 201),
        ("head", 2, 201),
        ("student", 3, 403),
        ("supervisor", 4, 403),
        ("foreign_head", 7, 403),
        ("draft", 2, 409),
        ("pending", 2, 409),
        ("student_missing", 2, 404),
    ],
)
def test_manual_assignment_rules(client, bearer, sessions, case, actor, expected):
    free_topic(sessions)
    topic_id = 1 if case == "pending" else 2
    student_id = 999 if case == "student_missing" else 4
    if case == "draft":
        with sessions() as db:
            db.get(Topic, 2).status = TopicStatus.DRAFT
            db.commit()
    response = client.post(
        "/assignments",
        headers=bearer(actor),
        json={"student_id": student_id, "topic_id": topic_id, "comment": "Manual audit"},
    )
    assert response.status_code == expected, response.text
    with sessions() as db:
        assignments = list(db.scalars(select(Assignment)))
        if expected == 201:
            assert len(assignments) == 1
            application = db.scalar(select(Application).where(Application.topic_id == 2))
            assert application.status == ApplicationStatus.APPROVED
            assert application.decided_by_user_id == actor
            assert application.history[0].to_status == ApplicationStatus.APPROVED
            assert assignments[0].topic_id == application.topic_id
            assert assignments[0].student_id == application.student_id
            assert db.get(Topic, 2) is not None
            notification = db.scalar(select(Notification))
            assert notification.user_id == 9
            assert notification.payload["assignment_id"] == assignments[0].id
        else:
            assert assignments == []
            assert db.scalar(select(func.count()).select_from(Notification)) == 0


@pytest.mark.parametrize(
    "stage,percent,expected,result_percent,result_status",
    [
        (AssignmentStage.IN_PROGRESS, 0, 200, 0, AssignmentStatus.ACTIVE),
        (AssignmentStage.UNDER_REVIEW, 80, 200, 80, AssignmentStatus.ACTIVE),
        (AssignmentStage.ADMITTED_TO_DEFENSE, 12, 200, 100, AssignmentStatus.ACTIVE),
        (AssignmentStage.DEFENDED, 100, 200, 100, AssignmentStatus.COMPLETED),
        (AssignmentStage.DEFENDED, 99, 422, 0, AssignmentStatus.ACTIVE),
        (AssignmentStage.IN_PROGRESS, -1, 422, 0, AssignmentStatus.ACTIVE),
        (AssignmentStage.IN_PROGRESS, 101, 422, 0, AssignmentStatus.ACTIVE),
        ("unknown", 50, 422, 0, AssignmentStatus.ACTIVE),
    ],
)
def test_progress_contract_and_persistence(
    client, bearer, sessions, stage, percent, expected, result_percent, result_status
):
    approve(client, bearer)
    response = client.patch(
        "/works/1/progress",
        json={"current_stage": stage, "progress_percent": percent},
        headers=bearer(4),
    )
    assert response.status_code == expected, response.text
    with sessions() as db:
        assignment = db.get(Assignment, 1)
        assert assignment.progress_percent == result_percent
        assert assignment.status == result_status
    if result_status == AssignmentStatus.COMPLETED:
        dashboard = client.get("/supervisor/dashboard", headers=bearer(4)).json()
        assert dashboard["current_load"] == 0
        retry = client.patch(
            "/works/1/progress",
            headers=bearer(4),
            json={"current_stage": AssignmentStage.IN_PROGRESS, "progress_percent": 10},
        )
        assert retry.status_code == 409


@pytest.mark.parametrize("change,expected", [("inactive", 401), ("role", 403)])
def test_existing_jwt_obeys_current_database_state(client, bearer, sessions, change, expected):
    headers = bearer(4)
    with sessions() as db:
        if change == "inactive":
            db.get(User, 4).is_active = False
        else:
            db.get(User, 4).role = UserRole.STUDENT
        db.commit()
    response = client.patch("/reservations/1/approve", json={}, headers=headers)
    assert response.status_code == expected, response.text


@pytest.mark.parametrize("trigger", ["list", "decision"])
def test_expiration_is_persisted_even_when_decision_fails(client, bearer, sessions, trigger):
    with sessions() as db:
        db.get(Application, 1).expires_at = datetime.now(UTC) - timedelta(seconds=5)
        db.commit()
    if trigger == "list":
        response = client.get("/topics", headers=bearer(3))
        assert response.status_code == 200
        assert all(row["id"] != 1 for row in response.json())
    else:
        response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
        assert response.status_code == 409
    with sessions() as db:
        application = db.get(Application, 1)
        assert application.status == ApplicationStatus.EXPIRED
        assert application.history[-1].to_status == ApplicationStatus.EXPIRED
        assert db.get(Topic, 1).status == TopicStatus.ARCHIVED
        assert db.scalar(select(func.count()).select_from(Assignment)) == 0


@pytest.mark.parametrize(
    "constraint", ["student_active", "topic_completed", "reservation_exclusive", "progress_range"]
)
def test_database_guards_rollback_conflicting_writes(sessions, constraint):
    with sessions() as db:
        if constraint == "reservation_exclusive":
            db.add(Application(student_id=3, topic_id=1, status=ApplicationStatus.PENDING))
        elif constraint == "progress_range":
            db.add(
                Assignment(
                    student_id=1,
                    topic_id=1,
                    supervisor_id=2,
                    progress_percent=101,
                    assigned_at=datetime.now(UTC),
                )
            )
        else:
            first_status = (
                AssignmentStatus.ACTIVE
                if constraint == "student_active"
                else AssignmentStatus.COMPLETED
            )
            db.add(
                Assignment(
                    student_id=1,
                    topic_id=1,
                    supervisor_id=2,
                    status=first_status,
                    assigned_at=datetime.now(UTC),
                )
            )
            db.commit()
            db.add(
                Assignment(
                    student_id=1 if constraint == "student_active" else 3,
                    topic_id=2 if constraint == "student_active" else 1,
                    supervisor_id=2,
                    assigned_at=datetime.now(UTC),
                )
            )
        error_fragment = {
            "student_active": "assignments.student_id",
            "topic_completed": "assignments.topic_id",
            "reservation_exclusive": "applications.topic_id",
            "progress_range": "assignment_progress_percent_range",
        }[constraint]
        if db.get_bind().dialect.name == "postgresql":
            error_fragment = {
                "student_active": "uq_assignments_student_id_active",
                "topic_completed": "uq_assignments_topic_not_cancelled",
                "reservation_exclusive": "uq_applications_topic_id_active",
                "progress_range": "assignment_progress_percent_range",
            }[constraint]
        with pytest.raises(IntegrityError, match=error_fragment):
            db.commit()
        db.rollback()
        expected = 1 if constraint in ("student_active", "topic_completed") else 0
        assert db.scalar(select(func.count()).select_from(Assignment)) == expected


def test_completed_topic_stays_unavailable_to_other_students(client, bearer, sessions):
    approve(client, bearer)
    response = client.patch(
        "/works/1/progress",
        headers=bearer(4),
        json={"current_stage": AssignmentStage.DEFENDED, "progress_percent": 100},
    )
    assert response.status_code == 200
    with sessions() as db:
        db.get(Student, 2).department_id = 1
        db.commit()
    response = client.post("/topics/1/applications", json={}, headers=bearer(5))
    assert response.status_code == 409
    assert client.get("/topics/1", headers=bearer(5)).status_code == 404


def test_other_pending_application_survives_but_cannot_be_approved(client, bearer, sessions):
    free_topic(sessions)
    response = client.post("/topics/2/applications", json={}, headers=bearer(3))
    assert response.status_code == 201
    second_id = response.json()["id"]
    approve(client, bearer)
    response = client.patch(f"/reservations/{second_id}/approve", json={}, headers=bearer(2))
    assert response.status_code == 409
    with sessions() as db:
        assert db.get(Application, second_id).status == ApplicationStatus.PENDING


def test_notification_recipient_scope_and_pagination(client, bearer):
    approve(client, bearer)
    rows = client.get("/notifications?limit=1", headers=bearer(3)).json()
    assert len(rows) == 1
    assert rows[0]["is_read"] is False
    assert client.get("/notifications?offset=1", headers=bearer(3)).json() == []
    assert client.get("/notifications", headers=bearer(5)).json() == []
    assert client.get("/notifications").status_code == 401


def test_current_policy_allows_regression_after_admission(client, bearer):
    """Characterization: no monotonic-stage rule exists in the current service."""
    approve(client, bearer)
    for stage, percent in [
        (AssignmentStage.ADMITTED_TO_DEFENSE, 50),
        (AssignmentStage.IN_PROGRESS, 10),
    ]:
        response = client.patch(
            "/works/1/progress",
            headers=bearer(4),
            json={"current_stage": stage, "progress_percent": percent},
        )
        assert response.status_code == 200, response.text
    assert response.json()["progress_percent"] == 10
    assert response.json()["current_stage"] == AssignmentStage.IN_PROGRESS


def test_current_policy_does_not_enforce_closed_period(client, bearer, sessions):
    """Characterization: published topics accept applications even in a closed period."""
    free_topic(sessions)
    with sessions() as db:
        db.get(AcademicPeriod, 1).status = PeriodStatus.CLOSED
        db.commit()
    response = client.post("/topics/2/applications", json={}, headers=bearer(3))
    assert response.status_code == 201, response.text


@pytest.mark.parametrize("alias", ["decision", "progress"])
def test_aliases_share_state_and_do_not_duplicate_effects(client, bearer, sessions, alias):
    if alias == "decision":
        response = client.patch("/supervisor/applications/1/approve", json={}, headers=bearer(4))
        assert response.status_code == 200
        response = client.patch("/reservations/1/approve", json={}, headers=bearer(4))
        assert response.status_code == 409
        with sessions() as db:
            assert db.scalar(select(func.count()).select_from(Assignment)) == 1
            assert db.scalar(select(func.count()).select_from(Notification)) == 1
    else:
        approve(client, bearer)
        response = client.patch(
            "/supervisor/assignments/1/progress",
            headers=bearer(4),
            json={"status": AssignmentStage.UNDER_REVIEW, "progress_percent": 80},
        )
        assert response.status_code == 200
        rows = client.get("/supervisor/works", headers=bearer(4)).json()
        assert rows[0]["progress_percent"] == 80
        assert rows[0]["current_stage"] == AssignmentStage.UNDER_REVIEW
