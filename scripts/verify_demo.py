"""Exercise the real HTTP demo and confirm committed PostgreSQL state.

Creates uniquely named demo accounts and topics; no existing records are deleted.
Set DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD for an existing administrator.
"""

import json
import os
import uuid
from pathlib import Path

import httpx
from sqlalchemy import select

from app.db import SessionLocal, engine
from app.models import Student, User


def main() -> None:
    """Verify Swagger, role denial, approval, progress and department assignment over HTTP."""
    if engine.dialect.name != "postgresql":
        raise SystemExit("The live demo requires PostgreSQL")
    email = os.environ.get("DEMO_ADMIN_EMAIL", "")
    password = os.environ.get("DEMO_ADMIN_PASSWORD", "")
    if not email or not password:
        raise SystemExit("Set DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD for an existing admin")
    base_url = os.getenv("DEMO_BASE_URL", "http://127.0.0.1:8000")
    cases: list[str] = []
    run_id = uuid.uuid4().hex[:10]
    with httpx.Client(base_url=base_url, timeout=15) as client:

        def request(
            method: str, path: str, token: str | None = None, expected: int = 200, **kwargs
        ) -> httpx.Response:
            response = client.request(
                method,
                path,
                headers={"Authorization": f"Bearer {token}"} if token else {},
                **kwargs,
            )
            if response.status_code != expected:
                # Do not log request bodies or tokens when a step fails.
                raise RuntimeError(
                    f"{method} {path}: expected {expected}, got {response.status_code}"
                )
            return response

        def login(address: str) -> str:
            return request(
                "POST", "/auth/login", data={"username": address, "password": password}
            ).json()["access_token"]

        assert "swagger-ui" in request("GET", "/docs").text.lower()
        specification = request("GET", "/openapi.json").json()
        for path in [
            "/supervisor/works",
            "/reservations/{application_id}/approve",
            "/works/{assignment_id}/progress",
            "/assignments",
        ]:
            assert path in specification["paths"]
        cases.append("Swagger HTML and OpenAPI: 200, new endpoints present")
        admin = login(email)
        department = request("GET", "/departments", admin).json()[0]
        group = next(
            row
            for row in request("GET", "/study-groups", admin).json()
            if row["faculty_id"] == department["faculty_id"]
        )
        period = request("GET", "/academic-periods", admin).json()[0]

        def create_account(kind: str, suffix: str) -> dict:
            payload = dict(
                email=f"demo.{run_id}.{suffix}@example.com",
                password=password,
                first_name="Demo",
                last_name=suffix,
                department_id=department["id"],
            )
            if kind == "students":
                payload["group_id"] = group["id"]
            return request("POST", f"/{kind}", admin, 201, json=payload).json()

        supervisor = create_account("supervisors", "supervisor")
        supervisor_token = login(supervisor["email"])
        supervisor_id = request("GET", "/supervisor/dashboard", supervisor_token).json()[
            "supervisor_id"
        ]
        head = create_account("supervisors", "head")
        request("PATCH", f"/users/{head['id']}/role", admin, json={"role": "zavkaf"})
        head_token = login(head["email"])
        student = create_account("students", "student")
        student_token = login(student["email"])
        cases.append("Admin creates supervisor, head and student via HTTP: 201")

        def create_topic(title: str) -> dict:
            topic = request(
                "POST",
                "/topics",
                supervisor_token,
                201,
                json={
                    "period_id": period["id"],
                    "title": title,
                    "description": "HTTP demo verification",
                },
            ).json()
            return request(
                "PATCH", f"/topics/{topic['id']}/status", head_token, json={"status": "published"}
            ).json()

        topic = create_topic(f"Demo approval {run_id}")
        application = request(
            "POST",
            f"/topics/{topic['id']}/applications",
            student_token,
            201,
            json={"justification": "Demo application"},
        ).json()
        request("PATCH", f"/reservations/{application['id']}/approve", supervisor_token, json={})
        work = request("GET", "/supervisor/works", supervisor_token).json()[0]
        progress = request(
            "PATCH",
            f"/works/{work['id']}/progress",
            supervisor_token,
            json={"status": "admitted_to_defense", "progress_percent": 10},
        ).json()
        assert progress["progress_percent"] == 100
        cases.append("Student application -> supervisor approval -> assignment: success")
        cases.append("Admission to defense forces progress to 100%")
        request("GET", "/supervisor/works", student_token, 403)
        assert request("GET", "/notifications", student_token).json()
        cases.append("Student -> supervisor endpoint: 403; decision notification persisted")
        result = request(
            "PATCH", f"/supervisors/{supervisor_id}/limit", head_token, json={"max_students": 2}
        ).json()
        assert result["supervisor"]["current_load"] == 1
        second = create_account("students", "manual-student")
        second_topic = create_topic(f"Demo manual {run_id}")
        second_token = login(second["email"])
        second_profile = request("GET", "/applications/me", second_token).json()
        assert second_profile == []
        # Managed account responses distinguish the Student identity from User.id.
        second_student_id = second["student_id"]
        request(
            "POST",
            "/assignments",
            head_token,
            201,
            json={
                "student_id": second_student_id,
                "topic_id": second_topic["id"],
                "comment": "Demo manual assignment",
            },
        )
        dashboard = request("GET", "/supervisor/dashboard", supervisor_token).json()
        assert dashboard["current_load"] == 2 and dashboard["available_places"] == 0
        cases.append("Head changes limit, manually assigns a free topic; derived load = 2")
        with SessionLocal() as db:
            persisted = db.scalar(select(Student.id).where(Student.user_id == student["id"]))
            assert persisted is not None
            assert db.scalar(select(User.email).where(User.id == student["id"])) == student["email"]
        cases.append("Independent PostgreSQL session sees student created by HTTP")
    report = "# Проверка живого демо\n\n"
    report += "\n".join(f"- PASS: {case}" for case in cases)
    report += f"\n\nПроверенный студент: `{student['email']}`; User ID: `{student['id']}`.\n"
    report += "\nПароли и JWT в отчёт не записываются. Демо создаёт новые тестовые записи.\n"
    (Path(__file__).resolve().parents[1] / "docs" / "demo-verification.md").write_text(
        report, encoding="utf-8"
    )
    print(
        json.dumps(
            {"result": "PASS", "checks": len(cases), "student_email": student["email"]},
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
