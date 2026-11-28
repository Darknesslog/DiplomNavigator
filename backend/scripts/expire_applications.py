"""Explicit expiration command: uv run python -m backend.scripts.expire_applications."""

from backend.app.db import SessionLocal
from backend.app.services.application import expire_overdue_applications
from backend.app.services.workflow import commit_workflow


def main() -> None:
    with SessionLocal() as db:
        count = expire_overdue_applications(db)
        commit_workflow(db)
    print(f"Expired applications: {count}")


if __name__ == "__main__":
    main()
