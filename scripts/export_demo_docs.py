"""Regenerate the ER diagram, migration chain and complete endpoint inventory."""

import inspect
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory
from fastapi.dependencies.models import Dependant
from fastapi.routing import APIRoute

from app.api import accounts, auth, read_models, supervisor, topics, workflows
from app.main import app
from app.models import Base

ROOT = Path(__file__).resolve().parents[1]


def dependency_roles(dependant: Dependant) -> tuple[set[str], bool]:
    """Read require_roles closures; record authenticated routes without a role restriction."""
    roles: set[str] = set()
    authenticated = False
    for dependency in dependant.dependencies:
        call = dependency.call
        if getattr(call, "__name__", "") == "get_current_user":
            authenticated = True
        if inspect.isfunction(call):
            roles.update(
                str(role) for role in inspect.getclosurevars(call).nonlocals.get("roles", ())
            )
        child_roles, child_authenticated = dependency_roles(dependency)
        roles.update(child_roles)
        authenticated |= child_authenticated
    return roles, authenticated


def build_diagram() -> str:
    """Render table identities and foreign-key cardinalities as Mermaid."""
    lines = [
        "# ER-диаграмма",
        "",
        "Сгенерировано: `uv run python -m scripts.export_demo_docs`.",
        "",
        "```mermaid",
        "erDiagram",
    ]
    for table in Base.metadata.sorted_tables:
        lines.append(f"    {table.name} {{")
        for column in table.columns:
            flags = " PK" if column.primary_key else (" FK" if column.foreign_keys else "")
            lines.append(f"        {type(column.type).__name__.lower()} {column.name}{flags}")
        lines.append("    }")
    for table in Base.metadata.sorted_tables:
        for column in table.columns:
            for key in column.foreign_keys:
                cardinality = "|o" if column.nullable else "||"
                lines.append(
                    f'    {key.column.table.name} {cardinality}--o{{ {table.name} : "{column.name}"'
                )
    lines += [
        "```",
        "",
        "Частичные уникальные индексы обеспечивают одно активное закрепление",
        "на студента, одну активную заявку на тему и одно неотменённое закрепление на тему.",
        "",
    ]
    return "\n".join(lines)


def build_history() -> str:
    """Render Alembic's actual ordered revision chain."""
    scripts = ScriptDirectory.from_config(Config(str(ROOT / "alembic.ini")))
    history = [
        "# История миграций",
        "",
        "| Revision | Родитель | Назначение |",
        "| --- | --- | --- |",
    ]
    for revision in reversed(list(scripts.walk_revisions())):
        history.append(
            f"| `{revision.revision}` | `{revision.down_revision or 'base'}` | {revision.doc} |"
        )
    history += [
        "",
        f"Единственная вершина: `{scripts.get_current_head()}`.",
        "Применение: `uv run alembic upgrade head`; проверка: `uv run alembic current`.",
        "",
    ]
    return "\n".join(history)


def source_routes() -> dict[tuple[str, str], APIRoute]:
    """Index concrete source routes despite deferred FastAPI include_router handling."""
    routes = {}
    for module in (accounts, auth, read_models, supervisor, topics, workflows):
        for route in module.router.routes:
            if isinstance(route, APIRoute):
                for method in route.methods:
                    routes[(method.lower(), route.path)] = route
    return routes


def build_endpoints() -> str:
    """Render every public operation and its authentication/role dependency."""
    endpoints = [
        "# API: действия и роли",
        "",
        "Сгенерировано из зарегистрированных маршрутов. Ownership и кафедра проверяются сервисами.",
        "Списки ограничены limit/offset. Завкаф принимает решения через `/reservations`.",
        "",
        "| Метод | Endpoint | Роли | Действие |",
        "| --- | --- | --- | --- |",
    ]
    # FastAPI may defer included routers; enumerate the public OpenAPI inventory,
    # then recover role dependencies from the source routers rather than app.routes.
    routes = source_routes()
    for path, operations in app.openapi()["paths"].items():
        for method, operation in operations.items():
            route = routes.get((method, path)) or routes.get((method, path.removeprefix("/auth")))
            roles, authenticated = dependency_roles(route.dependant) if route else (set(), False)
            role_text = (
                ", ".join(sorted(roles))
                if roles
                else ("Все авторизованные" if authenticated else "Публичный")
            )
            action = (operation.get("description") or operation.get("summary", "")).splitlines()[0]
            endpoints.append(f"| {method.upper()} | `{path}` | {role_text} | {action} |")
    return "\n".join(endpoints) + "\n"


def main() -> None:
    """Build documentation from application metadata, never database credentials."""
    docs = ROOT / "docs"
    docs.mkdir(exist_ok=True)
    for name, render in (
        ("er.md", build_diagram),
        ("migration-history.md", build_history),
        ("api-endpoints.md", build_endpoints),
    ):
        (docs / name).write_text(render(), encoding="utf-8")
    print("Generated docs/er.md, docs/migration-history.md, docs/api-endpoints.md")


if __name__ == "__main__":
    main()
