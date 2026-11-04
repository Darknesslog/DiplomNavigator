# DiplomNavigator

Полный запуск с нуля, Swagger и три проверяемых сценария:
[USER.md](USER.md). Текущие [API и роли](docs/api-endpoints.md),
[история миграций](docs/migration-history.md), [проверка демо](docs/technical-demo.md).
Повторяемый seed-сценарий Docker → Swagger → допуск к защите: [TRY1.md](TRY1.md).

## Контракты экранов и аудит API

Сверка Swagger с текстовой расшифровкой макетов: [TASK.md](TASK.md).
Примеры JSON, права доступа, совместимые пути и ограничения:
[контракты Дашборда и Заявок](feature/dashboard-and-application-contracts.md).

Добавлены `/dashboard/supervisor`, `/dashboard/head`, `/applications/me`,
`/booking-requests`, карточки `/supervisor/students/{student_id}` и
`/supervisor/assignments/{assignment_id}`. Алиасы `/bookings/me` и
`/topics/{topic_id}/bookings` используют существующую сущность `Application`.
Поля интерфейса: `group_name`, `justification`, `status_label`, `current_stage_label`.
Дашборды читают БД; `progress_history: null` — заглушка, поскольку история
прогресса в исходной ветке не сохраняется.

Backend MVP для выбора тем выпускных работ на FastAPI, SQLAlchemy,
Alembic и PostgreSQL.

## Структура проекта

```text
project/
├── backend/              # FastAPI, модели, миграции, seed и backend-тесты
├── frontend/             # React/Vite-прототип
├── docs/                 # API, ER, миграции и материалы проверки
├── feature/              # описания отдельных функциональных блоков
├── Dockerfile
├── docker-compose*.yml
├── pyproject.toml
├── uv.lock
├── alembic.ini
├── README.md
└── USER.md
```

Внутри `backend/`:

```text
backend/app/
├── main.py              # создание FastAPI-приложения и подключение роутеров
├── config.py            # настройки из .env и переменных окружения
├── db.py                # SQLAlchemy engine, SessionLocal и get_db
├── dependencies.py      # JWT-аутентификация и проверки ролей
├── security.py          # хеширование паролей и JWT
├── api/                 # HTTP endpoints и роутеры
├── schemas/             # Pydantic-схемы входных и выходных данных API
├── services/            # бизнес-логика и проверки доступа
└── models/              # SQLAlchemy-модели и перечисления

backend/migrations/              # версии Alembic для изменения БД
backend/scripts/                 # CLI и служебные скрипты (seed, admin, DDL)
backend/seed/data/               # JSON-файлы фиктивных данных
backend/tests/                   # API- и интеграционные тесты
docs/                    # API, ER, миграции и материалы проверки PR
sql/                     # сгенерированная SQL-схема
```

### Как размещать новый код

- Новый HTTP endpoint добавляется в `backend/app/api/`.
- Новая бизнес-операция — в соответствующий модуль `backend/app/services/`.
- Входные и выходные контракты — в `backend/app/schemas/`.
- Новая таблица или поле — в `backend/app/models/`, затем отдельной миграцией
  в `backend/migrations/versions/`.
- Общие модели и перечисления экспортируются через `backend/app/models/__init__.py`.
- Тесты для новой функции добавляются в `backend/tests/`.
- Изменения схемы отражаются также в `docs/`, а при необходимости
  обновляется `sql/schema.sql`.
- Разовые команды и загрузчики данных размещаются в `backend/scripts/`, а исходные
  JSON-фикстуры — в `backend/seed/data/`.

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

   Процент выполнения ограничен диапазоном от 0 до 100. При
   `admitted_to_defense` он принудительно становится 100. Для этапа
   `defended` требуется значение `100`; после этого закрепление получает
   статус `completed`.

Научный руководитель не может:

- принимать заявки на темы другого научного руководителя;
- одобрять заявку на неопубликованную тему;
- превысить собственный `Teacher.max_students`;
- одобрить второе активное закрепление для студента;
- повторно принять уже обработанную заявку.

## Быстрый запуск через Docker

Скопируйте `.env.example` в `.env`, задайте собственные реквизиты PostgreSQL,
случайный `SECRET_KEY` не короче 32 байт и обязательный `SEED_PASSWORD`
длиной 12–128 символов. Точные параметры и согласование локального порта:
[USER.md](USER.md#2-клонирование-и-настройки).

Запустите PostgreSQL и приложение:

```powershell
docker compose up -d --build
docker compose exec app alembic upgrade head
docker compose exec app python -m backend.scripts.seed
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
python -m backend.scripts.seed
python -m uvicorn backend.app.main:app --reload
```

Для запуска только базы:

```powershell
docker compose -f docker-compose.db.yml up -d
python -m alembic upgrade head
python -m backend.scripts.seed
python -m uvicorn backend.app.main:app --reload
```

Seed-скрипт идемпотентен и не создает дубликаты при повторном запуске.
Тестовые пользователи и данные описаны в [backend/seed/README.md](backend/seed/README.md).

## Проверки

```powershell
python -m pytest -q
python -m ruff check .
```
