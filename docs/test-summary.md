# Итог тестирования

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
