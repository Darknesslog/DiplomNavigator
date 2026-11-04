"""Смоук-проверка схемы без подключения к БД.

Запускается в CI и локально:
    uv run python scripts/check_schema.py

Проверяет то, что обычно ломается молча:
* все relationship-и разрешаются (configure_mappers);
* DDL компилируется под Postgres;
* имена ограничений уникальны (Postgres не примет дубль в одной таблице).
"""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import configure_mappers
from sqlalchemy.schema import CreateIndex, CreateTable

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.models import Base  # noqa: E402

DIALECT = postgresql.dialect()


def check_mappers() -> None:
    configure_mappers()


def check_ddl() -> list[str]:
    problems: list[str] = []
    for table in Base.metadata.sorted_tables:
        try:
            str(CreateTable(table).compile(dialect=DIALECT))
            for index in table.indexes:
                str(CreateIndex(index).compile(dialect=DIALECT))
        except Exception as exc:
            problems.append(f"{table.name}: {exc}")
    return problems


def check_constraint_names() -> list[str]:
    problems: list[str] = []
    for table in Base.metadata.sorted_tables:
        names = [c.name for c in table.constraints if c.name]
        duplicates = [name for name, count in Counter(names).items() if count > 1]
        if duplicates:
            problems.append(f"{table.name}: повторяются ограничения {duplicates}")
        index_names = [i.name for i in table.indexes]
        dup_indexes = [name for name, count in Counter(index_names).items() if count > 1]
        if dup_indexes:
            problems.append(f"{table.name}: повторяются индексы {dup_indexes}")
    return problems


def main() -> int:
    check_mappers()
    problems = check_ddl() + check_constraint_names()
    if problems:
        print("Схема невалидна:")
        for problem in problems:
            print(f"  - {problem}")
        return 1
    tables = len(Base.metadata.sorted_tables)
    columns = sum(len(t.columns) for t in Base.metadata.sorted_tables)
    print(f"OK: {tables} таблиц, {columns} колонок, relationships разрешены.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
