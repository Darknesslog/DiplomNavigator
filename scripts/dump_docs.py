"""Генерация документации по схеме: словарь данных и DBML для dbdiagram.io.

Оба файла собираются из тех же моделей, что и SQL, поэтому описание полей
не может разойтись с реальной схемой. Комментарии к колонкам берутся из
`comment=` в моделях и одновременно попадают в БД как COMMENT ON.

Запуск:
    uv run python scripts/dump_docs.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Enum,
    Integer,
    SmallInteger,
    Text,
)
from sqlalchemy import String as SAString
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import JSONB, JSON

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.models import Base  # noqa: E402

DOCS_DIR = PROJECT_ROOT / "docs"
DIALECT = postgresql.dialect()


def pg_type(column) -> str:
    """Тип так, как его понимает Postgres."""
    return column.type.compile(dialect=DIALECT)


def dbml_type(column) -> str:
    """Тип в нотации DBML (dbdiagram не знает длинных имён типов Postgres)."""
    t = column.type
    if isinstance(t, Enum):
        return f"varchar({t.length})"
    if isinstance(t, JSONB):
        return "jsonb"
    if isinstance(t, JSON):
        return "json"
    if isinstance(t, BigInteger):
        return "bigint"
    if isinstance(t, SmallInteger):
        return "smallint"
    if isinstance(t, Integer):
        return "integer"
    if isinstance(t, Boolean):
        return "boolean"
    if isinstance(t, DateTime):
        return "timestamptz" if t.timezone else "timestamp"
    if isinstance(t, Date):
        return "date"
    if isinstance(t, Text):
        return "text"
    if isinstance(t, SAString):
        return f"varchar({t.length})" if t.length else "varchar"
    return "text"


def render_default(column) -> str:
    if column.identity is not None:
        return "identity"
    if column.server_default is None:
        return ""
    arg = getattr(column.server_default, "arg", column.server_default)
    return " ".join(str(arg).split())


def fk_target(column) -> str:
    for fk in column.foreign_keys:
        return f"{fk.column.table.name}.{fk.column.name}"
    return ""


def build_dictionary() -> str:
    lines = [
        "# Словарь данных DiplomNavigator",
        "",
        "Документ сгенерирован из `app/models` командой `uv run python scripts/dump_docs.py`.",
        "Правки в этот файл не вносятся — меняйте модели и пересобирайте.",
        "",
        f"Всего таблиц: **{len(Base.metadata.sorted_tables)}**. "
        "Типы указаны в нотации PostgreSQL.",
        "",
        "## Содержание",
        "",
    ]
    for table in Base.metadata.sorted_tables:
        lines.append(f"- [{table.name}](#{table.name}) — {table.comment or ''}".rstrip())
    lines.append("")

    for table in Base.metadata.sorted_tables:
        lines.append(f"## {table.name}")
        lines.append("")
        if table.comment:
            lines.append(f"*{table.comment}*")
            lines.append("")
        lines.append("| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |")
        lines.append("| --- | --- | --- | --- | --- | --- |")
        for column in table.columns:
            nullable = "да" if column.nullable else "нет"
            default = render_default(column) or "—"
            fk = fk_target(column) or "—"
            comment = (column.comment or "").replace("|", "\\|")
            flags = []
            if column.primary_key:
                flags.append("PK")
            if column.unique:
                flags.append("UNIQUE")
            name = f"**{column.name}**" if flags else column.name
            if flags:
                comment = f"{' '.join(flags)}. {comment}".strip()
            lines.append(
                f"| {name} | `{pg_type(column)}` | {nullable} | {default} | {fk} | {comment} |"
            )
        lines.append("")

        checks = [c for c in table.constraints if c.__class__.__name__ == "CheckConstraint"]
        if checks:
            lines.append("Проверки:")
            lines.append("")
            for check in checks:
                # CHECK из Enum содержит bind-параметр; literal_binds разворачивает
                # его в реальный список значений, иначе в документе видно
                # __[POSTCOMPILE_param_1].
                try:
                    sql_text = str(
                        check.sqltext.compile(
                            dialect=DIALECT, compile_kwargs={"literal_binds": True}
                        )
                    )
                except Exception:  # noqa: BLE001 - fallback на текстовый вид
                    sql_text = str(check.sqltext)
                lines.append(f"- `{check.name}`: `{sql_text}`")
            lines.append("")

        indexes = sorted(table.indexes, key=lambda i: i.name or "")
        if indexes:
            lines.append("Индексы:")
            lines.append("")
            for index in indexes:
                cols = ", ".join(c.name for c in index.columns)
                extra = " UNIQUE" if index.unique else ""
                where = getattr(index.dialect_options["postgresql"].get("where"), "text", "")
                suffix = f" WHERE {where}" if where else ""
                lines.append(f"- `{index.name}`{extra} ({cols}){suffix}")
            lines.append("")

    return "\n".join(lines)


def build_dbml() -> str:
    lines = [
        "// Схема DiplomNavigator для dbdiagram.io",
        "// Сгенерировано scripts/dump_docs.py из app/models — правьте модели.",
        "",
    ]
    for table in Base.metadata.sorted_tables:
        note = f" [note: '{table.comment}']" if table.comment else ""
        lines.append(f"Table {table.name}{note} {{")
        for column in table.columns:
            parts = [f"  {column.name} {dbml_type(column)}"]
            settings = []
            if column.primary_key:
                settings.append("pk")
            if column.unique:
                settings.append("unique")
            if column.nullable:
                settings.append("null")
            if column.comment:
                settings.append(f"note: '{column.comment.replace(chr(39), chr(39) * 2)}'")
            if settings:
                parts.append(f" [{', '.join(settings)}]")
            lines.append("".join(parts))
        lines.append("}")
        lines.append("")

    for table in Base.metadata.sorted_tables:
        for column in table.columns:
            for fk in column.foreign_keys:
                target = fk.column
                lines.append(
                    f"Ref: {table.name}.{column.name} > {target.table.name}.{target.name}"
                )
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    (DOCS_DIR / "data-dictionary.md").write_text(build_dictionary(), encoding="utf-8")
    (DOCS_DIR / "schema.dbml").write_text(build_dbml(), encoding="utf-8")
    print(f"Готово: {DOCS_DIR / 'data-dictionary.md'}")
    print(f"Готово: {DOCS_DIR / 'schema.dbml'}")


if __name__ == "__main__":
    main()
