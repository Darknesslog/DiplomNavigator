# DiplomNavigator: запуск с нуля и демонстрация

Готовый walkthrough Docker → DBeaver → Swagger → допуск к защите:
[TRY1.md](TRY1.md).

## Swagger во вкладке VS Code и диагностика 403

Нажмите `Ctrl+Shift+P`, выберите **Simple Browser: Show**, введите
`http://127.0.0.1:8000/docs` и нажмите Enter. Страница открывается вкладкой
редактора; её можно перетащить в соседнюю группу вкладок. API запускается отдельно.

После смены аккаунта проверяйте `GET /auth/me`. Ручной запрос `POST /auth/login`
возвращает токен, но сам не переключает авторизацию остальных операций Swagger.
Для переключения используйте **Authorize → Logout → Authorize**.

Admin имеет доступ к управлению аккаунтами и решениям
`PATCH /reservations/{id}/approve`, но личные ручки научрука
`GET /supervisor/applications`, `GET /supervisor/works` и
`PATCH /works/{id}/progress` требуют именно `nauchruk` и ownership.
Поэтому `403` под admin на этих ручках не означает потерю роли admin.
Для просмотра заявок администратором используйте `GET /booking-requests`.

Локальный `demo.admin@example.com`, если создан для проверки, использует
`DEMO_ADMIN_PASSWORD`; seed-аккаунты используют пароль, с которым выполнялся seed.
Это разные настройки. Пароли существующих аккаунтов от редактирования `.env`
не меняются.

Заявку `expired` нельзя одобрить: выберите другую свободную опубликованную тему
и создайте новую заявку. Для следующих заявок установите
`APPLICATION_DECISION_TIMEOUT_MINUTES=20160` и перезапустите API;
для Docker пересоздайте app-контейнер с обновлённым окружением.
Настройка не продлевает старые дедлайны и не восстанавливает архивированные темы.

Это руководство проверяет настоящий backend и PostgreSQL через Swagger.
Frontend из объединённой ветки остаётся демонстрационным прототипом с локальными
данными: его кнопки не выполняют приведённые HTTP-запросы и не записывают данные в БД.

## 1. Что установить

- Git, чтобы клонировать репозиторий.
- Docker Desktop с Linux containers; запустите его и дождитесь состояния Running.
- Python 3.12 или 3.13: диапазон проекта `>=3.12,<3.14`.
- uv — менеджер Python-зависимостей. Проверка: `uv --version`.
- Для отдельного frontend нужны Node.js и npm. Проверенная среда: Node 24.

Откройте PowerShell или терминал VS Code. Все команды далее выполняются из корня
репозитория, кроме отдельно отмеченных команд frontend.

## 2. Клонирование и настройки

```powershell
git clone https://github.com/Darknesslog/DiplomNavigator.git
cd DiplomNavigator
git switch feature/supervisor-workflows-and-demo
uv python install 3.12
uv sync
Copy-Item .env.example .env
```

Если каталог уже существует, не копируйте шаблон поверх своего файла настроек.
Откройте `.env` в редакторе и задайте:

```dotenv
APP_PORT=8000
DEBUG=false
ENVIRONMENT=development
POSTGRES_USER=diplom_user
POSTGRES_PASSWORD=your-local-database-password
POSTGRES_DB=diplom_navigator
POSTGRES_PORT=5433
DATABASE_URL=postgresql+psycopg://diplom_user:your-local-database-password@127.0.0.1:5433/diplom_navigator
SECRET_KEY=replace-with-a-random-secret-at-least-32-bytes
ACCESS_TOKEN_EXPIRE_MINUTES=30
LOGIN_COOLDOWN_MINUTES=15
APPLICATION_DECISION_TIMEOUT_MINUTES=20160
SEED_PASSWORD=replace-with-your-demo-password
```

Замените значения паролей и секрет JWT своими. Пароли аккаунтов и `SEED_PASSWORD`
должны иметь 12–128 символов. Для генерации секрета:

```powershell
uv run python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Скопируйте результат в `SECRET_KEY`. Файл `.env` исключён из Git.
Пароль в `DATABASE_URL` должен совпадать с `POSTGRES_PASSWORD`; специальные
символы в URL кодируются. Для простого локального запуска используйте случайный
буквенно-цифровой пароль. Внутри Compose приложение подключается к `db:5432`,
локальные команды uv — к опубликованному порту `127.0.0.1:5433`.

`5433` позволяет не конфликтовать с отдельно установленным PostgreSQL на `5432`.
Если выбрали другой свободный порт, измените и `POSTGRES_PORT`, и `DATABASE_URL`.
Пароли уже созданной БД в Docker volume не меняются от редактирования `.env`.
Не удаляйте том для исправления подключения: восстановите исходные реквизиты.

Для спокойной демонстрации выбран таймаут 14 дней (`20160` минут).
Значение `2` подходит для отдельного показа автоматической просрочки.

## 3. Запуск PostgreSQL, миграции и seed

```powershell
docker compose up -d db
docker compose ps
uv run alembic upgrade head
uv run alembic current
uv run python -m scripts.seed
```

Ожидается работающий `db`, head `b5c8d0e3f712` и сообщение `Seed completed`.
Seed создаёт справочники, период, научруков, студентов и десять тем.
Повторный запуск пропускает существующие записи и не сбрасывает пароли.
Список seed-аккаунтов: [seed/README.md](seed/README.md).

Создайте первого администратора:

```powershell
uv run python -m scripts.create_admin
```

Введите email, имя, фамилию и дважды пароль. Пример email: `admin@example.com`.
Запомните введённый пароль. Ожидается `Administrator created`.
Seed сам не создаёт admin; публичной регистрации администратора нет.

Запуск всего backend через Docker:

```powershell
docker compose up -d --build
```

Альтернатива для разработки, если сборка образа не может скачать зависимости:
оставьте БД в Docker и в отдельном терминале выполните:

```powershell
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Не запускайте оба варианта API одновременно на порту 8000.
Откройте http://127.0.0.1:8000/health — ожидается `status: ok`.
Откройте http://127.0.0.1:8000/docs — появится Swagger UI со списком endpoints.
Остановка контейнеров: `docker compose stop`; данные сохраняются в volume.

## 4. Как пользоваться Swagger

Для каждого endpoint:

1. Нажмите строку с методом и адресом, например `GET /auth/me`.
2. Нажмите **Try it out**.
3. Заполните параметры или JSON в **Request body**.
4. Нажмите **Execute**.
5. Смотрите **Server response → Code** и **Response body**.

Вход: справа вверху нажмите **Authorize**. В поле **username** укажите email,
в **password** — пароль аккаунта; `client_id`, `client_secret`, `scope`
оставьте пустыми. Нажмите **Authorize**, затем **Close**.
Swagger получает JWT через `/login` и добавляет Bearer автоматически.
Для смены пользователя откройте **Authorize → Logout**, затем введите другие
данные. Это удаляет токен из Swagger; серверного отзыва ранее выданного JWT нет.
Проверьте текущую роль запросом `GET /auth/me`.

Три неправильных пароля подряд включают блокировку входа: `429` и заголовок
`Retry-After`. Перезапуск API не снимает её. Ранее выданный JWT продолжает
действовать до истечения, если аккаунт активен.

## 5. Пример 1: admin, научрук, завкаф и тема

### 5.1. Вход и получение идентификаторов

1. Откройте `/docs`, авторизуйтесь администратором.
2. Выполните `GET /auth/me`: ожидается `200`, `role: admin`.
3. Выполните `GET /departments`: запишите ID выбранной кафедры и `faculty_id`.
4. Выполните `GET /study-groups`: выберите группу с тем же `faculty_id`.
5. Выполните `GET /academic-periods`: запишите ID периода.

В JSON ниже числа `1` — пример. Подставляйте фактические ID из ответов.

### 5.2. Создание научрука

Как admin откройте `POST /supervisors → Try it out`, вставьте:

```json
{
  "email": "supervisor.demo@example.com",
  "password": "ExampleSupervisor2026!",
  "first_name": "Анна",
  "last_name": "Петрова",
  "department_id": 1,
  "max_students": 3
}
```

Нажмите **Execute**. Ожидается `201` и `role: nauchruk`.
`id` ответа — это **User ID**, а не ID профиля руководителя.

### 5.3. Создание завкафедрой

Повторите `POST /supervisors` с email `head.demo@example.com`, паролем
`ExampleHead2026!`, именем и фамилией завкафедрой, той же кафедрой.
Запишите **User ID** ответа. Затем как admin выполните:

`PATCH /users/{user_id}/role`, где `user_id` — этот User ID:

```json
{"role": "zavkaf"}
```

Ожидается `200`, `role: zavkaf`. Только admin назначает роли.

### 5.4. Научрук предлагает тему

1. Через **Authorize → Logout** смените аккаунт на `supervisor.demo@example.com`.
2. Выполните `GET /supervisor/dashboard`. Запишите `supervisor_id` из ответа —
   это **Teacher ID**, используемый в лимитах и назначениях.
3. Откройте `POST /topics`, введите:

   ```json
   {
     "period_id": 1,
     "title": "Сервис планирования нагрузки кафедры",
     "description": "Разработка API и интерфейса контроля нагрузки научных руководителей."
   }
   ```

4. Нажмите **Execute**. Ожидается `201`, `status: draft`. Запишите **Topic ID**.

### 5.5. Завкаф публикует тему

Смените аккаунт на `head.demo@example.com`. Выполните
`PATCH /topics/{topic_id}/status` для созданной темы:

```json
{"status": "published"}
```

Ожидается `200`, `status: published`. Тема доступна студентам своей кафедры.
Фактические статусы: `draft/published/rejected/archived`; отдельного
промежуточного статуса `APPROVED` у темы нет.

## 6. Пример 2: студент подаёт заявку, научрук одобряет

### 6.1. Admin создаёт студента

Смените аккаунт на admin. Выполните `POST /students`:

```json
{
  "email": "student.demo@example.com",
  "password": "ExampleStudent2026!",
  "first_name": "Иван",
  "last_name": "Кузнецов",
  "department_id": 1,
  "group_id": 1,
  "record_book_number": "DEMO-2026-001",
  "admission_year": 2023
}
```

Ожидается `201`, `role: student`. Группа и кафедра должны принадлежать одному
факультету. Повтор того же email или номера зачётной книжки вернёт `409`.

### 6.2. Студент резервирует тему

1. Авторизуйтесь как `student.demo@example.com`.
2. Выполните `GET /topics`: опубликованная тема должна быть в массиве.
3. Выполните `POST /topics/{topic_id}/applications`:

   ```json
   {"justification": "Хочу разработать сервис планирования нагрузки."}
   ```

4. Ожидается `201`, `status: pending`, `expires_at`. Запишите **Application ID**
   (`id`) и **Student ID** (`student_id`). Это не User ID студента.
5. Выполните `GET /applications/me`: заявка видна только своему студенту.

До дедлайна научрук или завкаф должен принять решение. Если заявка просрочена,
при обработке API она станет `expired`, а тема — `archived` для всех студентов.

### 6.3. Научрук принимает решение

1. Смените аккаунт на научрука, создавшего тему.
2. `GET /supervisor/applications?status=pending`: заявка присутствует.
3. `PATCH /reservations/{application_id}/approve`, тело:

   ```json
   {"comment": "Готов руководить работой."}
   ```

4. Ожидается `200`, `status: approved`. Созданы отдельное закрепление
   `Assignment` и уведомление. При заполненном лимите будет `409`.
5. `GET /supervisor/works`: студент, тема, статус и `progress_percent: 0`.
   Запишите **Assignment ID** — это идентификатор работы.
6. `GET /supervisor/dashboard`: `current_load` увеличился на 1,
   `available_places` уменьшилось на 1.

Ветка отказа: вместо approve используйте `/reject` с комментарием.
Студент увидит `rejected` и запись в `GET /notifications`; тема доступна
другим студентам, повторная заявка этого студента имеет cooldown на эту тему.

### 6.4. Прогресс и допуск к защите

Как научрук выполните `PATCH /works/{assignment_id}/progress`:

```json
{"current_stage": "under_review", "progress_percent": 70}
```

Ожидается `200`, 70%, «На проверке». Затем:

```json
{"status": "admitted_to_defense", "progress_percent": 20}
```

`status` здесь — альтернативное имя **этапа**; в ответе этап — `current_stage`.
Ожидается `progress_percent: 100`, `current_stage: admitted_to_defense`,
`status: active`. Допуск ещё не означает завершённую защиту.
Для завершения: `{"current_stage":"defended","progress_percent":100}`,
после чего статус закрепления станет `completed` и активная нагрузка уменьшится.

## 7. Пример 3: вмешательство завкафедрой

### 7.1. Контроль кафедры

Авторизуйтесь как завкаф. Откройте `GET /dashboard/head`, затем
`GET /workload/supervisors`: ожидаются только данные своей кафедры.
`GET /booking-requests?status=pending` показывает её заявки, включая заявки
на темы других научруков этой кафедры.

### 7.2. Одобрение вместо научрука

Для pending-заявки своей кафедры вызовите
`PATCH /reservations/{application_id}/approve` с комментарием.
Заявка станет approved; автор решения сохранится как завкаф, руководителем
останется владелец темы. Лимит и единственное активное закрепление студента
проверяются в любом случае. Нельзя повторно решить уже обработанную заявку.

### 7.3. Изменение лимита

Откройте `PATCH /supervisors/{supervisor_id}/limit`, где ID профиля научрука
взят из workload или его dashboard:

```json
{"max_students": 5}
```

Ожидается `200`, обновлённый `supervisor` и `department_workload` для всех
действующих руководителей кафедры. Нагрузка вычисляется из Assignment при чтении;
лимиты остальных преподавателей не меняются. Значение ниже текущей нагрузки
отклоняется с `409`. Чужая кафедра — `403`.

### 7.4. Ручное назначение

Подготовьте **второго студента без активного закрепления** через `POST /students`
и **другую опубликованную свободную тему** той же кафедры, повторив предыдущие
шаги с новыми email, номером зачётной книжки и названием темы.
ID профиля студента возвращается как `student_id` в ответе `POST /students`
или `GET /auth/me` студента; это также поле `student_id` в карточке заявки.

Как завкаф откройте `POST /assignments`:

```json
{"student_id": 2, "topic_id": 3, "comment": "Назначение решением кафедры."}
```

Подставьте реальные **Student ID** и **Topic ID**. Ожидается `201`, новое
закрепление. Одновременно создаются approved-заявка, история решения и уведомление.
Уже занятую тему, чужую кафедру, достигнутый лимит или второго активного
руководителя студенту назначить нельзя (`409`/`403`).
Если тема уже имеет pending-заявку, обработайте её через reservations;
ручное назначение не забирает тему у другого заявителя.

## 8. Подтверждение сохранения в PostgreSQL

После `POST /students` вернитесь в терминал корня проекта:

```powershell
uv run python -m scripts.verify_persistence --email student.demo@example.com
```

Скрипт открывает новую сессию PostgreSQL, выполняет только SELECT и выводит
`id`, `student_id`, `department_id`, `group_id`. Успех подтверждает сохранённую
запись, а не содержимое ответа HTTP или mock frontend. Отсутствие записи —
ненулевой код выхода. Пароль/hash не выводится.
Повторите проверку после перезапуска API — запись должна сохраниться.

## 9. Успешный и ошибочный запросы cURL

Пример успешного входа; замените пароль своим. В Windows используйте `curl.exe`:

```powershell
curl.exe -i -X POST http://127.0.0.1:8000/auth/login -H "Content-Type: application/x-www-form-urlencoded" --data-urlencode "username=student.demo@example.com" --data-urlencode "password=ExampleStudent2026!"
```

Ожидается `200`, JSON с `access_token`, `token_type: bearer`, `expires_in: 1800`.
Вставьте токен **студента** вместо `<STUDENT_TOKEN>`:

```powershell
curl.exe -i http://127.0.0.1:8000/supervisor/works -H "Authorization: Bearer <STUDENT_TOKEN>"
```

Ожидается `403`, `{"detail":"Insufficient role"}`. Если токена нет или он
истёк, ответ будет `401`, а не `403`.

## 10. Проверки и frontend

```powershell
uv run pytest -v
uv run ruff check .
uv run alembic check
uv run python scripts/check_schema.py
uv run python -m scripts.export_demo_docs
```

Актуальные [ER](docs/er.md), [миграции](docs/migration-history.md),
[API и роли](docs/api-endpoints.md), [результаты проверки](docs/technical-demo.md).

Для отдельного визуального прототипа, в другом терминале:

```powershell
cd frontend
npm ci
npm run build
npm run dev
```

Откройте URL, показанный Vite (обычно http://localhost:5173).
Для проверки реальных записей и прав используйте Swagger, а не локальные
демонстрационные данные прототипа.

Повторяемая HTTP-проверка создаёт новые demo-аккаунты и темы:
задайте локально `DEMO_ADMIN_EMAIL` и `DEMO_ADMIN_PASSWORD` существующего admin,
запустите API, затем `uv run python -m scripts.verify_demo`.
Локальный отчёт появится в `docs/demo-verification.md`; он исключён из Git.
Для ревью PR результаты собраны в [техническом отчёте](docs/technical-demo.md).
