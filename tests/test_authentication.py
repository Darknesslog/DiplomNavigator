"""Authentication, privilege boundaries, cooldown persistence and input validation."""

from datetime import UTC, datetime, timedelta

import jwt
import pytest
from conftest import PASSWORD, TEST_SECRET
from pwdlib.hashers.bcrypt import BcryptHasher
from sqlalchemy import func, select

from app import config
from app.models import Student, User
from app.security import ALGORITHM, create_access_token


def login(client, user_id=3, password=PASSWORD):
    return client.post(
        "/login",
        data={
            "username": f"user{user_id}@example.com",
            "password": password,
        },
    )


@pytest.mark.parametrize(
    ("user_id", "role"),
    [
        (1, "admin"),
        (2, "zavkaf"),
        (3, "student"),
        (4, "nauchruk"),
    ],
)
def test_login_and_me_for_every_role(client, bearer, user_id, role):
    headers = bearer(user_id)
    response = client.get("/me", headers=headers)
    assert response.status_code == 200
    identity = response.json()
    assert identity["role"] == role
    assert identity["id"] == user_id
    assert "password_hash" not in identity
    assert "password" not in identity
    assert "failed_login_attempts" not in identity
    assert "locked_until" not in identity


def test_email_is_case_insensitive_and_tokens_are_not_cached(client):
    response = client.post(
        "/login",
        data={
            "username": "  USER3@EXAMPLE.COM  ",
            "password": PASSWORD,
        },
    )
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert response.json()["token_type"] == "bearer"
    assert response.json()["expires_in"] == 1800


def test_third_failure_persists_cooldown_and_correct_password_cannot_bypass(client, sessions):
    assert login(client, password="wrong").status_code == 401
    assert login(client, password="wrong").status_code == 401
    third = login(client, password="wrong")
    assert third.status_code == 429
    assert third.headers["retry-after"] == "900"
    with sessions() as db:
        account = db.get(User, 3)
        assert account.failed_login_attempts == 3
        locked_until = account.locked_until
    assert login(client).status_code == 429
    assert login(client, password="wrong").status_code == 429
    with sessions() as db:
        assert db.get(User, 3).locked_until == locked_until


def test_cooldown_expiry_allows_login_and_clears_failure_state(client, sessions):
    with sessions() as db:
        user = db.get(User, 3)
        user.failed_login_attempts = 3
        user.locked_until = datetime.now(UTC) - timedelta(seconds=1)
        db.commit()
    assert login(client).status_code == 200
    with sessions() as db:
        user = db.get(User, 3)
        assert user.failed_login_attempts == 0
        assert user.locked_until is None
        assert user.last_login_at is not None


def test_first_failure_after_cooldown_starts_new_count(client, sessions):
    with sessions() as db:
        user = db.get(User, 3)
        user.failed_login_attempts = 3
        user.locked_until = datetime.now(UTC) - timedelta(seconds=1)
        db.commit()
    assert login(client, password="wrong").status_code == 401
    with sessions() as db:
        assert db.get(User, 3).failed_login_attempts == 1


def test_success_resets_consecutive_failures(client, sessions):
    assert login(client, password="wrong").status_code == 401
    assert login(client, password="wrong").status_code == 401
    assert login(client).status_code == 200
    assert login(client, password="wrong").status_code == 401
    with sessions() as db:
        assert db.get(User, 3).failed_login_attempts == 1


def test_unknown_email_and_disabled_account_use_generic_error(client):
    unknown = login(client, user_id=1234)
    disabled = login(client, user_id=8)
    wrong = login(client, password="wrong")
    assert unknown.status_code == disabled.status_code == wrong.status_code == 401
    assert unknown.json() == disabled.json() == wrong.json()
    assert "Bearer" in unknown.headers["www-authenticate"]


@pytest.mark.parametrize("encoded", ["not-a-hash", "$argon2id$invalid", "$2b$invalid"])
def test_malformed_password_hash_never_authenticates_or_crashes(client, sessions, encoded):
    with sessions() as db:
        db.get(User, 3).password_hash = encoded
        db.commit()
    assert login(client).status_code == 401


def test_existing_bcrypt_password_remains_usable(client, sessions):
    with sessions() as db:
        db.get(User, 3).password_hash = BcryptHasher().hash(PASSWORD)
        db.commit()
    assert login(client).status_code == 200


def test_me_requires_bearer_token(client):
    assert client.get("/me").status_code == 401
    assert client.get("/me", headers={"Authorization": "Bearer nonsense"}).status_code == 401


@pytest.mark.parametrize(
    "case",
    [
        "expired",
        "no_exp",
        "no_iat",
        "wrong_issuer",
        "wrong_audience",
        "bad_subject",
        "oversized_subject",
        "wrong_signature",
        "wrong_algorithm",
        "future_iat",
    ],
)
def test_invalid_tokens_are_rejected(client, case):
    now = datetime.now(UTC)
    claims = {
        "sub": "3",
        "iat": now,
        "exp": now + timedelta(minutes=30),
        "iss": config.JWT_ISSUER,
        "aud": config.JWT_AUDIENCE,
    }
    secret, algorithm = TEST_SECRET, ALGORITHM
    if case == "expired":
        claims["exp"] = now - timedelta(seconds=1)
    elif case == "no_exp":
        claims.pop("exp")
    elif case == "no_iat":
        claims.pop("iat")
    elif case == "wrong_issuer":
        claims["iss"] = "another-app"
    elif case == "wrong_audience":
        claims["aud"] = "another-api"
    elif case == "bad_subject":
        claims["sub"] = "abc"
    elif case == "oversized_subject":
        claims["sub"] = "9" * 100
    elif case == "wrong_signature":
        secret = "another-test-signing-secret-at-least-32-bytes"
    elif case == "wrong_algorithm":
        algorithm = "HS384"
    elif case == "future_iat":
        claims["iat"] = now + timedelta(hours=1)
    token = jwt.encode(claims, secret, algorithm=algorithm)
    assert client.get("/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_disabling_account_invalidates_existing_token(client, bearer, sessions):
    headers = bearer(3)
    with sessions() as db:
        db.get(User, 3).is_active = False
        db.commit()
    assert client.get("/me", headers=headers).status_code == 401


def test_deleted_subject_cannot_authenticate(client):
    token = create_access_token(999)
    assert client.get("/me", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_missing_signing_secret_fails_closed(client, monkeypatch):
    monkeypatch.setattr(config, "SECRET_KEY", "")
    assert login(client).status_code == 503


def student_payload(**overrides):
    return {
        "email": "new.student@example.com",
        "password": PASSWORD,
        "first_name": "New",
        "last_name": "Student",
        "department_id": 1,
        "group_id": 1,
        **overrides,
    }


def supervisor_payload(**overrides):
    return {
        "email": "new.supervisor@example.com",
        "password": PASSWORD,
        "first_name": "New",
        "last_name": "Supervisor",
        "department_id": 1,
        **overrides,
    }


def test_admin_creates_student_with_profile_and_login(client, bearer, sessions):
    response = client.post("/students", json=student_payload(), headers=bearer(1))
    assert response.status_code == 201, response.text
    assert response.json()["role"] == "student"
    assert response.json()["department_id"] == 1
    assert "password_hash" not in response.json()
    with sessions() as db:
        user = db.get(User, response.json()["id"])
        assert user.password_hash.startswith("$argon2id$")
        assert user.student.group_id == 1
    assert (
        client.post(
            "/login",
            data={
                "username": "new.student@example.com",
                "password": PASSWORD,
            },
        ).status_code
        == 200
    )


def test_admin_creates_supervisor_then_assigns_head_role(client, bearer):
    admin = bearer(1)
    response = client.post("/supervisors", json=supervisor_payload(), headers=admin)
    assert response.status_code == 201, response.text
    assert response.json()["role"] == "nauchruk"
    user_id = response.json()["id"]
    response = client.patch(f"/users/{user_id}/role", json={"role": "zavkaf"}, headers=admin)
    assert response.status_code == 200
    assert response.json()["role"] == "zavkaf"


@pytest.mark.parametrize("user_id", [3, 4])
def test_students_and_supervisors_cannot_manage_accounts(client, bearer, user_id):
    headers = bearer(user_id)
    assert client.post("/students", json=student_payload(), headers=headers).status_code == 403
    assert (
        client.post("/supervisors", json=supervisor_payload(), headers=headers).status_code == 403
    )
    assert client.get("/students", headers=headers).status_code == 403
    assert client.patch("/users/3/role", json={"role": "admin"}, headers=headers).status_code == 403
    assert (
        client.patch(
            "/users/3/department",
            json={"department_id": 2},
            headers=headers,
        ).status_code
        == 403
    )


def test_head_can_create_only_in_own_department(client, bearer):
    headers = bearer(2)
    assert client.post("/students", json=student_payload(), headers=headers).status_code == 201
    assert (
        client.post("/supervisors", json=supervisor_payload(), headers=headers).status_code == 201
    )
    assert (
        client.post(
            "/students",
            json=student_payload(
                email="other@example.com",
                department_id=2,
            ),
            headers=headers,
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/supervisors",
            json=supervisor_payload(
                email="other@example.com",
                department_id=2,
            ),
            headers=headers,
        ).status_code
        == 403
    )
    assert client.patch("/users/4/role", json={"role": "admin"}, headers=headers).status_code == 403


def test_department_boundaries_and_admin_transfer(client, bearer):
    head = bearer(2)
    assert (
        client.patch("/users/5/department", json={"department_id": 1}, headers=head).status_code
        == 403
    )
    assert (
        client.patch("/users/3/department", json={"department_id": 2}, headers=head).status_code
        == 403
    )
    assert (
        client.patch("/users/3/department", json={"department_id": 1}, headers=head).status_code
        == 200
    )
    response = client.patch("/users/3/department", json={"department_id": 2}, headers=bearer(1))
    assert response.status_code == 200
    assert response.json()["department_id"] == 2


def test_head_cannot_modify_elevated_accounts(client, bearer):
    assert (
        client.patch(
            "/users/2/department", json={"department_id": 1}, headers=bearer(2)
        ).status_code
        == 403
    )


def test_students_list_is_scoped_and_hides_inactive_users(client, bearer):
    rows = client.get("/students", headers=bearer(2)).json()
    assert [row["id"] for row in rows] == [3]
    assert client.get("/students", headers=bearer(1), params={"limit": 1}).status_code == 200


def test_supervisor_discovery_is_scoped_to_current_department(client, bearer):
    assert {u["id"] for u in client.get("/supervisors", headers=bearer(3)).json()} == {2, 4}
    assert {u["id"] for u in client.get("/supervisors", headers=bearer(5)).json()} == {6, 7}
    assert client.get("/supervisors", headers=bearer(9)).json() == []


def test_role_demotion_takes_effect_for_existing_token(client, bearer):
    head = bearer(2)
    response = client.patch("/users/2/role", json={"role": "nauchruk"}, headers=bearer(1))
    assert response.status_code == 200
    assert client.get("/me", headers=head).json()["role"] == "nauchruk"
    assert client.get("/students", headers=head).status_code == 403


def test_incompatible_role_and_self_demotion_are_rejected(client, bearer):
    admin = bearer(1)
    assert client.patch("/users/3/role", json={"role": "zavkaf"}, headers=admin).status_code == 409
    assert client.patch("/users/4/role", json={"role": "student"}, headers=admin).status_code == 409
    assert client.patch("/users/1/role", json={"role": "student"}, headers=admin).status_code == 409
    assert client.patch("/users/3/role", json={"role": "teacher"}, headers=admin).status_code == 422


def test_admin_may_assign_unallocated_student_department(client, bearer):
    response = client.patch("/users/9/department", json={"department_id": 1}, headers=bearer(1))
    assert response.status_code == 200
    assert response.json()["department_id"] == 1


def test_duplicate_email_returns_conflict_without_orphan_profile(client, bearer, sessions):
    admin = bearer(1)
    assert client.post("/students", json=student_payload(), headers=admin).status_code == 201
    response = client.post(
        "/students", json=student_payload(email="NEW.STUDENT@example.com"), headers=admin
    )
    assert response.status_code == 409
    with sessions() as db:
        assert db.scalar(select(func.count()).select_from(Student)) == 5
        assert db.scalar(select(func.count()).select_from(User)) == 10


def test_group_department_faculty_consistency_and_missing_references(client, bearer):
    admin = bearer(1)
    assert (
        client.post("/students", json=student_payload(group_id=2), headers=admin).status_code == 409
    )
    assert (
        client.post("/students", json=student_payload(group_id=999), headers=admin).status_code
        == 404
    )
    assert (
        client.post("/students", json=student_payload(department_id=999), headers=admin).status_code
        == 404
    )
    assert (
        client.patch("/users/3/department", json={"department_id": 3}, headers=admin).status_code
        == 409
    )
    assert client.patch("/users/999/role", json={"role": "admin"}, headers=admin).status_code == 404


@pytest.mark.parametrize(
    "overrides",
    [
        {"password": "short"},
        {"email": "invalid"},
        {"department_id": 0},
        {"role": "admin"},
        {"first_name": " "},
        {"is_active": False},
    ],
)
def test_creation_rejects_invalid_inputs_and_privilege_injection(client, bearer, overrides):
    assert (
        client.post("/students", json=student_payload(**overrides), headers=bearer(1)).status_code
        == 422
    )


def test_departments_require_authentication_and_lists_are_bounded(client, bearer):
    assert client.get("/departments").status_code == 401
    headers = bearer(3)
    assert len(client.get("/departments", headers=headers).json()) == 3
    assert client.get("/departments?limit=101", headers=headers).status_code == 422


def test_cooldown_does_not_revoke_existing_tokens(client, bearer):
    headers = bearer(3)
    for _ in range(3):
        login(client, password="wrong")
    assert client.get("/me", headers=headers).status_code == 200


def test_oversized_wrong_password_still_counts_toward_cooldown(client):
    for _ in range(2):
        assert login(client, password="x" * 129).status_code == 401
    assert login(client, password="x" * 129).status_code == 429


def test_inactive_account_does_not_disclose_existing_cooldown(client, sessions):
    with sessions() as db:
        account = db.get(User, 8)
        account.failed_login_attempts = 3
        account.locked_until = datetime.now(UTC) + timedelta(minutes=15)
        db.commit()
    response = login(client, user_id=8)
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect email or password"}
