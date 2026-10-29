# Seed data

Фиктивные данные для локальной разработки и ручного тестирования API.

Файлы в `data/` не содержат паролей. По умолчанию загрузчик использует
`SeedPassword123!`; пароль можно переопределить переменной окружения
`SEED_PASSWORD`.

Запуск против PostgreSQL в Docker:

```powershell
docker compose -f docker-compose.db.yml up -d
python -m alembic upgrade head
python -m scripts.seed
```

Для запуска внутри полного app-контейнера:

```powershell
docker compose up -d --build
docker compose exec app alembic upgrade head
docker compose exec app python -m scripts.seed
```

Загрузчик идемпотентен: повторный запуск находит записи по стабильным
уникальным полям и не создает дубликаты. Существующие записи не удаляются и
не перезаписываются.
