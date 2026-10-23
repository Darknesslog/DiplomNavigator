"""Генерация чистого SQL из ORM-моделей.

Модели — единственный источник правды: DDL собирается из `Base.metadata`,
поэтому не может разойтись с кодом. Скрипт нужен, чтобы отдать аналитику
и техлиду читаемый `.sql`, а не заставлять их запускать Python.

Запуск:
    uv run python scripts/dump_ddl.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateIndex, CreateTable

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.models import Base  # noqa: E402

SQL_DIR = PROJECT_ROOT / "sql"
DIALECT = postgresql.dialect()


def _quote(text: str) -> str:
    return "'" + text.replace("'", "''") + "'"


def build_schema_sql() -> str:
    lines: list[str] = [
        "-- Сгенерировано scripts/dump_ddl.py из app/models.",
        "-- НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ: правки делаются в моделях и пересобираются.",
        "-- Для накатывания в рабочую БД используйте Alembic, а не этот файл.",
        "",
        "BEGIN;",
        "",
    ]
    for table in Base.metadata.sorted_tables:
        ddl = str(CreateTable(table).compile(dialect=DIALECT)).strip()
        lines.append(f"{ddl};")
        lines.append("")

        for index in sorted(table.indexes, key=lambda i: i.name or ""):
            lines.append(f"{str(CreateIndex(index).compile(dialect=DIALECT)).strip()};")
        if table.indexes:
            lines.append("")

        if table.comment:
            lines.append(f"COMMENT ON TABLE {table.name} IS {_quote(table.comment)};")
        column_comments = [c for c in table.columns if c.comment]
        for column in column_comments:
            lines.append(
                f"COMMENT ON COLUMN {table.name}.{column.name} IS {_quote(column.comment)};"
            )
        if table.comment or column_comments:
            lines.append("")

    lines.append("COMMIT;")
    lines.append("")
    return "\n".join(lines)


def build_drop_sql() -> str:
    lines = [
        "-- Полная очистка схемы. Только для локальной разработки!",
        "-- Удалит все данные без возможности восстановления.",
        "",
    ]
    for table in reversed(Base.metadata.sorted_tables):
        lines.append(f"DROP TABLE IF EXISTS {table.name} CASCADE;")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    SQL_DIR.mkdir(parents=True, exist_ok=True)
    (SQL_DIR / "schema.sql").write_text(build_schema_sql(), encoding="utf-8")
    (SQL_DIR / "drop_all.sql").write_text(build_drop_sql(), encoding="utf-8")
    print(f"Готово: {SQL_DIR / 'schema.sql'}")
    print(f"Готово: {SQL_DIR / 'drop_all.sql'}")


if __name__ == "__main__":
    main()
