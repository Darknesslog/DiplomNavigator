"""Export source-level callable definitions and registered HTTP contracts for review."""

from __future__ import annotations

import argparse
import ast
import os
from pathlib import Path

from backend.app.main import app

ROOT = Path(__file__).resolve().parents[2]
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}


def cell(value: str) -> str:
    """Keep signatures with unions and multiline text inside Markdown table cells."""
    return value.replace("|", r"\|").replace("\n", " ")


def definitions(tree: ast.AST, prefix: str = "") -> list[tuple[str, ast.AST]]:
    """Include methods and nested functions; omit generated/inherited methods."""
    result = []
    for child in ast.iter_child_nodes(tree):
        if isinstance(child, ast.ClassDef | ast.FunctionDef | ast.AsyncFunctionDef):
            name = f"{prefix}{child.name}"
            result.append((name, child))
            result.extend(definitions(child, f"{name}."))
        else:
            result.extend(definitions(child, prefix))
    return result


def build_inventory(output: Path | None = None) -> str:
    """Use AST for all app callables and OpenAPI for the paths actually registered."""
    modules = []
    output_directory = output.resolve().parent if output else ROOT / ".tmp/reviews"
    callable_count = 0
    class_count = 0
    for path in sorted((ROOT / "backend/app").rglob("*.py")):
        entries = definitions(ast.parse(path.read_text(encoding="utf-8-sig")))
        if not entries:
            continue
        relative = path.relative_to(ROOT).as_posix()
        rows = []
        for name, node in entries:
            if isinstance(node, ast.ClassDef):
                class_count += 1
                signature = f"class {name}"
            else:
                callable_count += 1
                signature = f"{name}({ast.unparse(node.args)})"
                if node.returns is not None:
                    signature += f" -> {ast.unparse(node.returns)}"
            summary = (ast.get_docstring(node) or "—").splitlines()[0]
            target = Path(os.path.relpath(path, output_directory)).as_posix()
            link = f"[{name}](<{target}#L{node.lineno}>)"
            rows.append(f"| {link} | `{cell(signature)}` | {cell(summary)} |")
        modules.append(
            f"## {relative}\n\n"
            "| Определение | Сигнатура | Назначение из docstring |\n"
            "|---|---|---|\n" + "\n".join(rows)
        )
    routes = []
    for path, operations in sorted(app.openapi()["paths"].items()):
        for method, operation in sorted(operations.items()):
            if method not in HTTP_METHODS:
                continue
            responses = ", ".join(sorted(operation["responses"]))
            routes.append(
                f"| `{method.upper()} {path}` | `{operation['operationId']}` | {responses} |"
            )
    return (
        "# Каталог существующих методов и HTTP-контрактов\n\n"
        "Сгенерировано из рабочей копии: AST определений и зарегистрированная OpenAPI. "
        "Унаследованные и автоматически созданные методы не перечислены. "
        "Docstring описывает намерение автора, а не доказывает поведение. "
        "Тесты, CLI и frontend не входят в область backend/app.\n\n"
        f"Функций/методов: **{callable_count}**; классов: **{class_count}**; "
        f"HTTP-операций с учётом алиасов: **{len(routes)}**.\n\n"
        "Пересоздать: `uv run python -m backend.scripts.export_method_inventory "
        "--output .tmp/reviews/03-method-catalog.md`.\n\n"
        "## Зарегистрированные HTTP-операции\n\n"
        "| Метод и путь | Operation ID | Документированные HTTP-ответы |\n"
        "|---|---|---|\n" + "\n".join(routes) + "\n\n" + "\n\n".join(modules) + "\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    arguments = parser.parse_args()
    arguments.output.parent.mkdir(parents=True, exist_ok=True)
    arguments.output.write_text(build_inventory(arguments.output), encoding="utf-8")


if __name__ == "__main__":
    main()
