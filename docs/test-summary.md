# Итог тестирования

## Актуальная проверка — 18.11.2026

Backend-код: `95ca12e`, ветка `review/backend-invariants-and-inventory`.
`origin/develop` после pull — `e834771`; содержит не все проверенные изменения.
Ниже фиксируются результаты исполнения в этой среде, без заявления о новом CI-run.

| Проверка | Результат |
|---|---|
| `uv run ruff check` | PASS |
| `uv run pytest --tb=short` | Ошибка `uv trampoline failed to canonicalize script path` до запуска pytest |
| `& ./.venv/Scripts/python.exe -m pytest --tb=short` | **125 passed**, 97 deselected; Python 3.12.15 |
| `./backend/tests/integration/run_postgresql.ps1` | **97 passed**, 125 deselected; PostgreSQL 16, Alembic и конкурентные сценарии |
| Дополнительные диагностические сценарии | **8 passed** вне штатного набора, воспроизводят текущие пробелы контракта |
| `backend.scripts.check_schema` | 15 таблиц, 144 колонки; mapper/DDL без ошибок |
| Сверка документов с генераторами | ER, API, история миграций и SQL совпадают |
| OpenAPI | 48 путей, 51 операция; operationId уникальны |

PostgreSQL-раннер использовал уникальный Compose-проект с временной БД и после
проверки удалил его контейнер и сеть. Прикладная БД не использовалась.
Набор включает конкурентное резервирование/одобрение, лимит, уникальность,
rollback, разграничение прав и цикл downgrade/upgrade истории прогресса.
Это проверка конкретных сценариев, не доказательство отсутствия всех гонок.

Дополнительные пробы на изолированной SQLite подтвердили: перевод кафедры при
pending/active у студента и active у научрука, прямой архив занятой темы,
защиту без предварительного допуска и подачу после даты закрытия при
`draft`/`archived`/`open`. Их успешность означает воспроизведение поведения,
а не правильность продуктового правила. Подробности и предложения исправлений:
[материалы ревью](backend-review-appts.md).

Предупреждения: Starlette о TestClient/httpx; Alembic об отсутствии `path_separator`.
В этой проверке не выполнялись новый ручной Swagger/HTTP-прогон, frontend build
и regression, production deployment, нагрузочные испытания и backup/restore.
Исторические live-результаты ниже и в [technical-demo.md](technical-demo.md)
не следует представлять как повторённые 18.11.2026.

## Исторические результаты

## Исправления B01/B02/B03/B06 — 2026-11-11

- SQLite: **123 passed**, PostgreSQL: **97 passed** (раздельная выборка маркерами).
- PostgreSQL-набор включает конкурентные подачу/одобрение, отзыв остальных резервов,
  защиту лимитов, аудит прогресса, RBAC, административный отзыв допуска и цикл
  downgrade/upgrade журнала с сохранением существующего закрепления.
- Новая вершина миграций: `d8f3a4b5c6d7`. Ruff и проверка ORM/DDL проходят.
- PostgreSQL запускается [изолированным Compose-раннером](../backend/tests/integration/README.md).
- Локальный Windows-launcher `uv run pytest` дал ошибку canonicalize script path
  до запуска тестов; SQLite-набор пройден через настроенный Python с `-m pytest`.
  Стандартная команда проверяется CI в чистом окружении.

## Предыдущий снимок

Команда: `uv run pytest -v` (JUnit XML использован для подсчёта).

- Всего: 87
- Failures: 0
- Errors: 0
- Skipped: 0
- Итог: PASS

Сценарии: JWT/Argon2/bcrypt/кулдаун, роли и кафедры, темы и таймаут,
решения научрука/завкаф/admin, нагрузка, принудительные 100%, уведомления,
ручное назначение, ownership и конфликты занятых тем.

API-тесты изолированы на SQLite. Реальные PostgreSQL и HTTP проверены отдельно:
[technical-demo.md](technical-demo.md).
Один warning Starlette о совместимости TestClient/httpx.
