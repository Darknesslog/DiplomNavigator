"""Isolated API tests: SQLite for behavior, never the application's configured database."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import BigInteger, create_engine, event
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import config
from app.db import get_db
from app.main import app
from app.models import (
    Base,
    Department,
    Faculty,
    Student,
    StudyGroup,
    Teacher,
    User,
    UserRole,
)
from app.security import hash_password

PASSWORD = "test-password-123!"
TEST_SECRET = "test-only-secret-never-use-in-production-" * 2


@compiles(BigInteger, "sqlite")
def sqlite_bigint(_type, _compiler, **_kwargs):
    """Use SQLite's identity-compatible INTEGER only inside this test process."""
    return "INTEGER"


@pytest.fixture(scope="session")
def encoded_password() -> str:
    """Reuse a real password hash across fixtures to avoid needless hashing."""
    return hash_password(PASSWORD)


@pytest.fixture()
def sessions(encoded_password: str, monkeypatch) -> Iterator[sessionmaker[Session]]:
    """Build only account-related tables and seed both sides of department boundaries."""
    monkeypatch.setattr(config, "SECRET_KEY", TEST_SECRET)
    monkeypatch.setattr(config, "LOGIN_COOLDOWN_MINUTES", 15)
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")

    tables = [
        Faculty.__table__,
        User.__table__,
        Department.__table__,
        StudyGroup.__table__,
        Student.__table__,
        Teacher.__table__,
    ]
    Base.metadata.create_all(engine, tables=tables)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    with factory() as db:
        db.add_all(
            [
                Faculty(id=1, name="Faculty One", short_name="F1"),
                Faculty(id=2, name="Faculty Two", short_name="F2"),
            ]
        )
        db.flush()
        db.add_all(
            [
                Department(id=1, faculty_id=1, name="Department One", short_name="D1"),
                Department(id=2, faculty_id=1, name="Department Two", short_name="D2"),
                Department(id=3, faculty_id=2, name="Department Three", short_name="D3"),
                StudyGroup(id=1, faculty_id=1, name="G1", enrollment_year=2024),
                StudyGroup(id=2, faculty_id=2, name="G2", enrollment_year=2024),
            ]
        )
        roles = {
            1: UserRole.ADMIN,
            2: UserRole.ZAVKAF,
            3: UserRole.STUDENT,
            4: UserRole.NAUCHRUK,
            5: UserRole.STUDENT,
            6: UserRole.NAUCHRUK,
            7: UserRole.ZAVKAF,
            8: UserRole.STUDENT,
            9: UserRole.STUDENT,
        }
        for user_id, role in roles.items():
            db.add(
                User(
                    id=user_id,
                    email=f"user{user_id}@example.com",
                    first_name="First",
                    last_name="Last",
                    password_hash=encoded_password,
                    role=role,
                    is_active=user_id != 8,
                    failed_login_attempts=0,
                )
            )
        db.flush()
        for profile_id, user_id, dept in [(1, 2, 1), (2, 4, 1), (3, 6, 2), (4, 7, 2)]:
            db.add(
                Teacher(
                    id=profile_id,
                    user_id=user_id,
                    department_id=dept,
                    max_students=5,
                    is_available=True,
                )
            )
        for profile_id, user_id, dept in [(1, 3, 1), (2, 5, 2), (3, 8, 1), (4, 9, None)]:
            db.add(Student(id=profile_id, user_id=user_id, group_id=1, department_id=dept))
        db.commit()
    yield factory
    engine.dispose()


@pytest.fixture()
def client(sessions: sessionmaker[Session]) -> Iterator[TestClient]:
    """Override only the database dependency, exercising real JWT and role dependencies."""

    def override_db() -> Iterator[Session]:
        with sessions() as db:
            yield db

    app.dependency_overrides[get_db] = override_db
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture()
def bearer(client: TestClient):
    """Obtain a real signed bearer token for a seeded active account."""

    def headers(user_id: int) -> dict[str, str]:
        response = client.post(
            "/login",
            data={
                "username": f"user{user_id}@example.com",
                "password": PASSWORD,
            },
        )
        assert response.status_code == 200, response.text
        return {"Authorization": "Bearer " + response.json()["access_token"]}

    return headers
