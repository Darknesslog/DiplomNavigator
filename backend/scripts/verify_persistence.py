"""Confirm a student created by HTTP exists in a fresh PostgreSQL session."""

import argparse
import json

from sqlalchemy import select

from backend.app.db import SessionLocal, engine
from backend.app.models import Student, User


def main() -> None:
    """Read committed state only; never create a record as part of verification."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    if engine.dialect.name != "postgresql":
        raise SystemExit("Persistence verification requires PostgreSQL")
    with SessionLocal() as db:
        row = (
            db.execute(
                select(
                    User.id,
                    User.email,
                    Student.id.label("student_id"),
                    Student.department_id,
                    Student.group_id,
                )
                .join(Student, Student.user_id == User.id)
                .where(User.email == args.email.strip().lower())
            )
            .mappings()
            .one_or_none()
        )
        if row is None:
            raise SystemExit("Student not found in committed PostgreSQL state")
        print(json.dumps(dict(row), ensure_ascii=False))


if __name__ == "__main__":
    main()
