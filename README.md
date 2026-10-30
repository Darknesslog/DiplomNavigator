# DiplomNavigator

Backend MVP для выбора тем выпускных работ на FastAPI, SQLAlchemy,
Alembic и PostgreSQL.

## Структура проекта

```text
app/
├── main.py              # создание FastAPI-приложения и подключение роутеров
├── config.py            # настройки из .env и переменных окружения
├── db.py                # SQLAlchemy engine, SessionLocal и get_db
├── dependencies.py      # JWT-аутентификация и проверки ролей
├── security.py          # хеширование паролей и JWT
├── api/                 # HTTP endpoints и роутеры
├── schemas/             # Pydantic-схемы входных и выходных данных API
├── services/            # бизнес-логика и проверки доступа
└── models/              # SQLAlchemy-модели и перечисления

migrations/              # версии Alembic для изменения БД
scripts/                 # CLI и служебные скрипты (seed, admin, DDL)
seed/data/               # JSON-файлы фиктивных данных
tests/                   # API- и интеграционные тесты
docs/                    # ER, DBML, словарь данных и вопросы аналитику
sql/                     # сгенерированная SQL-схема
```

### Как размещать новый код

- Новый HTTP endpoint добавляется в `app/api/`.
- Новая бизнес-операция — в соответствующий модуль `app/services/`.
- Входные и выходные контракты — в `app/schemas/`.
- Новая таблица или поле — в `app/models/`, затем отдельной миграцией
  в `migrations/versions/`.
- Общие модели и перечисления экспортируются через `app/models/__init__.py`.
- Тесты для новой функции добавляются в `tests/`.
- Изменения схемы отражаются также в `docs/`, а при необходимости
  обновляется `sql/schema.sql`.
- Разовые команды и загрузчики данных размещаются в `scripts/`, а исходные
  JSON-фикстуры — в `seed/data/`.

Не следует помещать бизнес-логику в роутеры: роутер должен разобрать запрос,
передать управление сервису и вернуть результат.

## Как работает логика выбора темы студентом

- `student` видит опубликованные темы своей кафедры и может подать заявку.
- Заявка получает статус `pending` и временно резервирует тему.
- В demo-режиме научрук должен принять решение за 2 минуты.
- При одобрении создается активное закрепление (`Assignment`).
- При отклонении заявка получает cooldown только для этого студента и темы.
- При просрочке заявка получает `expired`, а тема переводится в архив с
  причиной `expired` и исчезает у всех студентов.
- `nauchruk` просматривает заявки по своим темам, одобряет/отклоняет их и
  обновляет прогресс работы.
- `zavkaf` и `admin` создают и модерируют темы; завкафедра ограничен своей
  кафедрой.

Таймаут задается переменной `APPLICATION_DECISION_TIMEOUT_MINUTES`.
Для production его можно заменить с `2` на `20160` минут (14 дней).

## User Flow научного руководителя

Научный руководитель работает только со своими темами и заявками:

1. Получает список заявок через `GET /supervisor/applications`.
2. Может отфильтровать заявки по статусу, например `?status=pending`.
3. Одобряет заявку через:

   ```text
   PATCH /supervisor/applications/{application_id}/approve
   ```

   При одобрении:
   - заявка получает статус `approved`;
   - создается активное закрепление (`Assignment`);
   - проверяется лимит студентов научного руководителя;
   - проверяется, что у студента еще нет активного закрепления;
   - сохраняется комментарий и история изменения статуса.

4. Отклоняет заявку через:

   ```text
   PATCH /supervisor/applications/{application_id}/reject
   ```

   При отклонении:
   - заявка получает статус `rejected`;
   - сохраняются причина и автор решения;
   - для этой пары «студент — тема» устанавливается cooldown;
   - сама опубликованная тема остается доступной другим студентам.

5. После одобрения обновляет прогресс работы:

   ```text
   PATCH /supervisor/assignments/{assignment_id}/progress
   ```

   Поддерживаемые этапы:

   - `in_progress`;
   - `under_review`;
   - `admitted_to_defense`;
   - `defended`.

   Процент выполнения ограничен диапазоном от 0 до 100. Для этапа
   `defended` требуется значение `100`; после этого закрепление получает
   статус `completed`.

Научный руководитель не может:

- принимать заявки на темы другого научного руководителя;
- одобрять заявку на неопубликованную тему;
- превысить собственный `Teacher.max_students`;
- одобрить второе активное закрепление для студента;
- повторно принять уже обработанную заявку.

## Быстрый запуск через Docker

Создайте `.env` в корне проекта:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=diplom_navigator
POSTGRES_PORT=5432
SECRET_KEY=change-me-for-local-development
APPLICATION_DECISION_TIMEOUT_MINUTES=2
```

Запустите PostgreSQL и приложение:

```powershell
docker compose up -d --build
docker compose exec app alembic upgrade head
docker compose exec app python -m scripts.seed
```

Проверка:

```text
http://localhost:8000/health
http://localhost:8000/docs
```

Ожидаемый ответ `/health`:

```json
{"status": "ok", "environment": "development"}
```

## Локальный запуск приложения

Если PostgreSQL уже запущен локально или в Docker:

```powershell
python -m alembic upgrade head
python -m scripts.seed
python -m uvicorn app.main:app --reload
```

Для запуска только базы:

```powershell
docker compose -f docker-compose.db.yml up -d
python -m alembic upgrade head
python -m scripts.seed
python -m uvicorn app.main:app --reload
```

Seed-скрипт идемпотентен и не создает дубликаты при повторном запуске.
Тестовые пользователи и данные описаны в [seed/README.md](seed/README.md).

## Проверки

```powershell
python -m pytest -q
python -m ruff check .
```
