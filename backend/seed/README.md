# Seed data

Фиктивные данные для локальной разработки и ручного тестирования API.

Файлы в `data/` не содержат паролей. До запуска задайте `SEED_PASSWORD`
длиной 12–128 символов в локальной `.env` или окружении. Пароля по умолчанию нет.
У существующих аккаунтов пароль при повторном seed не меняется.

Тестовые логины: `seed.supervisor.pi@example.com`,
`seed.supervisor.is@example.com`, `seed.student.1@example.com` и последующие
студенты из `data/students.json`. Admin и завкаф создаются отдельно:
[USER.md](../../USER.md).

Запуск против PostgreSQL в Docker:

```powershell
docker compose up -d db
uv run alembic upgrade head
uv run python -m backend.scripts.seed
```

Для запуска внутри полного app-контейнера:

```powershell
docker compose up -d --build
docker compose exec app alembic upgrade head
docker compose exec app python -m backend.scripts.seed
```

Загрузчик идемпотентен: повторный запуск находит записи по стабильным
уникальным полям и не создает дубликаты. Существующие записи не удаляются и
не перезаписываются.
