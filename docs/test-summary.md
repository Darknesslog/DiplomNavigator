# Итог тестирования

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
