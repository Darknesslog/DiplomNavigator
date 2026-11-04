"""Load deterministic development data into the configured database."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import select

from app.db import SessionLocal
from app.models import (
    AcademicPeriod,
    Department,
    Faculty,
    Student,
    StudyGroup,
    Teacher,
    Topic,
    User,
    UserRole,
)
from app.security import hash_password

DATA_DIR = Path(__file__).resolve().parents[1] / "seed" / "data"
DEFAULT_PASSWORD = "SeedPassword123!"


@dataclass
class SeedStats:
    """Counters printed after a successful seed run."""

    created: int = 0
    skipped: int = 0


def load_json(filename: str) -> Any:
    """Read one seed fixture from the repository."""
    with (DATA_DIR / filename).open(encoding="utf-8") as file:
        return json.load(file)


def get_or_create(
    db, model: type[Any], statement, factory: Any, stats: SeedStats
) -> tuple[Any, bool]:
    """Find an entity by its stable key or add it once."""
    entity = db.scalar(statement)
    if entity is not None:
        stats.skipped += 1
        return entity, False
    entity = factory()
    db.add(entity)
    db.flush()
    stats.created += 1
    return entity, True


def seed_reference_data(
    db, stats: SeedStats
) -> tuple[Faculty, dict[str, Department], dict[str, StudyGroup]]:
    """Create the faculty, departments, groups, and academic period."""
    faculty_data = load_json("faculty.json")
    faculty, _ = get_or_create(
        db,
        Faculty,
        select(Faculty).where(Faculty.short_name == faculty_data["short_name"]),
        lambda: Faculty(**faculty_data),
        stats,
    )
    departments: dict[str, Department] = {}
    for data in load_json("departments.json"):
        department, _ = get_or_create(
            db,
            Department,
            select(Department).where(Department.short_name == data["short_name"]),
            lambda data=data: Department(
                faculty_id=faculty.id,
                name=data["name"],
                short_name=data["short_name"],
            ),
            stats,
        )
        departments[data["short_name"]] = department

    groups: dict[str, StudyGroup] = {}
    for data in load_json("study_groups.json"):
        group, _ = get_or_create(
            db,
            StudyGroup,
            select(StudyGroup).where(StudyGroup.name == data["name"]),
            lambda data=data: StudyGroup(
                faculty_id=faculty.id,
                name=data["name"],
                enrollment_year=data["enrollment_year"],
            ),
            stats,
        )
        groups[data["name"]] = group

    period_data = load_json("academic_period.json")
    get_or_create(
        db,
        AcademicPeriod,
        select(AcademicPeriod).where(AcademicPeriod.name == period_data["name"]),
        lambda: AcademicPeriod(
            name=period_data["name"],
            academic_year=period_data["academic_year"],
            semester=period_data["semester"],
            starts_on=date.fromisoformat(period_data["starts_on"]),
            ends_on=date.fromisoformat(period_data["ends_on"]),
            application_opens_at=datetime.fromisoformat(period_data["application_opens_at"]),
            application_closes_at=datetime.fromisoformat(period_data["application_closes_at"]),
            status=period_data["status"],
        ),
        stats,
    )
    return faculty, departments, groups


def get_or_create_user(
    db, data: dict[str, Any], role: UserRole, stats: SeedStats
) -> User:
    """Create or reuse a seed user without changing existing credentials."""
    user, created = get_or_create(
        db,
        User,
        select(User).where(User.email == data["email"].lower()),
        lambda: User(
            email=data["email"].lower(),
            first_name=data["first_name"],
            last_name=data["last_name"],
            middle_name=data.get("middle_name"),
            password_hash=hash_password(os.getenv("SEED_PASSWORD", DEFAULT_PASSWORD)),
            role=role,
            is_active=True,
            failed_login_attempts=0,
        ),
        stats,
    )
    if user.role != role:
        raise RuntimeError(f"{user.email} already exists with role {user.role}, expected {role}")
    if created:
        db.flush()
    return user


def seed_supervisors(
    db, departments: dict[str, Department], stats: SeedStats
) -> dict[str, Teacher]:
    """Create supervisor accounts and return them indexed by email."""
    result: dict[str, Teacher] = {}
    for data in load_json("supervisors.json"):
        user = get_or_create_user(db, data, UserRole.NAUCHRUK, stats)
        teacher, _ = get_or_create(
            db,
            Teacher,
            select(Teacher).where(Teacher.user_id == user.id),
            lambda data=data, user=user: Teacher(
                user_id=user.id,
                department_id=departments[data["department_short_name"]].id,
                position=data.get("position"),
                academic_degree=data.get("academic_degree"),
                max_students=data["max_students"],
                is_available=True,
            ),
            stats,
        )
        result[data["email"].lower()] = teacher
    return result


def seed_students(
    db, departments: dict[str, Department], groups: dict[str, StudyGroup], stats: SeedStats
) -> dict[str, Student]:
    """Create student accounts and return them indexed by email."""
    result: dict[str, Student] = {}
    for data in load_json("students.json"):
        user = get_or_create_user(db, data, UserRole.STUDENT, stats)
        student, _ = get_or_create(
            db,
            Student,
            select(Student).where(Student.user_id == user.id),
            lambda data=data, user=user: Student(
                user_id=user.id,
                group_id=groups[data["group_name"]].id,
                department_id=departments[data["department_short_name"]].id,
                record_book_number=data["record_book_number"],
                admission_year=data["admission_year"],
            ),
            stats,
        )
        result[data["email"].lower()] = student
    return result


def seed_topics(
    db,
    period: AcademicPeriod,
    supervisors: dict[str, Teacher],
    students: dict[str, Student],
    stats: SeedStats,
) -> int:
    """Create the ten topic fixtures without duplicating existing topics."""
    created_count = 0
    for data in load_json("topics.json"):
        supervisor = supervisors[data["supervisor_email"].lower()]
        proposed_by_student = (
            students[data["proposed_by_student_email"].lower()]
            if data.get("proposed_by_student_email")
            else None
        )
        existing = db.scalar(
            select(Topic).where(
                Topic.period_id == period.id,
                Topic.title == data["title"],
            )
        )
        if existing is not None:
            stats.skipped += 1
            continue
        topic = Topic(
            period_id=period.id,
            supervisor_id=supervisor.id,
            department_id=supervisor.department_id,
            created_by_user_id=supervisor.user_id,
            proposed_by_student_id=proposed_by_student.id if proposed_by_student else None,
            title=data["title"],
            description=data["description"],
            status=data["status"],
            source=data["source"],
            company_name=data.get("company_name"),
            published_at=(
                datetime.now(UTC) if data["status"] == "published" else None
            ),
        )
        db.add(topic)
        stats.created += 1
        created_count += 1
    db.flush()
    return created_count


def main() -> None:
    """Load all development fixtures in foreign-key order."""
    stats = SeedStats()
    with SessionLocal() as db:
        try:
            _, departments, groups = seed_reference_data(db, stats)
            period = db.scalar(
                select(AcademicPeriod).where(AcademicPeriod.name == load_json("academic_period.json")["name"])
            )
            if period is None:
                raise RuntimeError("Seed academic period was not created")
            supervisors = seed_supervisors(db, departments, stats)
            students = seed_students(db, departments, groups, stats)
            seed_topics(db, period, supervisors, students, stats)
            db.commit()
        except Exception as exc:
            db.rollback()
            print(f"Seed failed: {exc}")
            raise

    print("Seed completed.")
    print(f"Records created: {stats.created}")
    print(f"Records skipped (already exist): {stats.skipped}")
    print("Seed user password: value of SEED_PASSWORD (or the documented default)")


if __name__ == "__main__":
    main()
