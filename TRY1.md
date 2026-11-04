# TRY1: запуск и Swagger — студент → научрук → допуск к защите

Цель: собрать backend, подключиться к PostgreSQL и выполнить настоящий сценарий
через Swagger. Frontend-прототип для этого сценария не используется.

## 1. Docker и локальные настройки

Запустите Docker Desktop, дождитесь готовности Engine. Откройте PowerShell:

```powershell
cd F:\SchoolX\DiplomNavigator
docker info
```

Ожидается информация о Docker Server без ошибки подключения.

Откройте [.env](.env) и проверьте:

| Параметр | Значение |
| --- | --- |
| `APP_PORT` | `8000` |
| `POSTGRES_PORT` | `5433` |
| `POSTGRES_USER` | `diplom_user` для текущего локального окружения |
| `POSTGRES_DB` | `diplom_navigator` |
| `POSTGRES_PASSWORD` | Ваш пароль существующей PostgreSQL |
| `SECRET_KEY` | Случайный секрет не короче 32 байт |
| `SEED_PASSWORD` | Пароль, с которым создавались seed-аккаунты |
| `APPLICATION_DECISION_TIMEOUT_MINUTES` | `20160` для спокойной демонстрации |

Пароли и SECRET_KEY в этот документ не копируются. Если файла настроек ещё нет,
скопируйте [.env.example](.env.example) в `.env` и заполните его.
Существующий `.env` шаблоном не перезаписывайте.

Изменение `SEED_PASSWORD` не меняет пароли уже созданных пользователей.
Изменение POSTGRES_PASSWORD не меняет пароль БД в существующем Docker volume.
Используйте реквизиты, с которыми эти данные создавались.

Если локальный Uvicorn уже занимает 8000, остановите его через Ctrl+C
в соответствующем терминале перед запуском контейнера API.

## 2. Сборка и запуск

```powershell
docker compose up -d --build
docker compose ps
```

Ожидается `db` в состоянии healthy и работающий `app` на порту 8000.
При ошибке:

```powershell
docker compose logs --tail=50 db app
```

После изменения переменных окружения уже работающего контейнера API:

```powershell
docker compose up -d --force-recreate app
```

Это пересоздаёт контейнер app с новым окружением. Данные PostgreSQL в volume
сохраняются. Для обновления Python-кода образ необходимо пересобрать.

## 3. Миграции и seed

```powershell
docker compose exec app alembic upgrade head
docker compose exec app alembic current
docker compose exec app python -m scripts.seed
```

Ожидается head `b5c8d0e3f712` и `Seed completed`. Повторный seed пропускает
существующие записи и не восстанавливает уже архивированные темы.
Администратор для этого сценария со seed-аккаунтами не нужен.

Откройте:

- http://127.0.0.1:8000/health — `status: ok`;
- http://127.0.0.1:8000/docs — Swagger UI.

Чтобы открыть Swagger рядом с файлами VS Code:
`Ctrl+Shift+P` → **Simple Browser: Show** → `http://127.0.0.1:8000/docs` → Enter.
Вкладку можно перетащить в соседнюю группу редактора.

## 4. Подключение DBeaver

Создайте PostgreSQL connection либо откройте **Edit Connection → Main**:

| Поле DBeaver | Значение |
| --- | --- |
| Host | `127.0.0.1` |
| Port | `5433` |
| Database | `diplom_navigator` |
| Username | `diplom_user` |
| Password | Значение POSTGRES_PASSWORD из локального `.env` |

Нажмите **Test Connection**, затем **Finish**.
Если ваши реквизиты отличаются, подставьте их реальные значения.
Не вводите буквальные `POSTGRES_USER`, `POSTGRES_PASSWORD` или пароль seed.
Ошибка `Role "POSTGRES_USER" does not exist` означает, что введено имя
переменной вместо её значения.

Из компьютера подключение идёт к `127.0.0.1:5433`, внутри Docker — к `db:5432`.

## 5. Войти студентом

В Swagger нажмите **Authorize**:

- username: `seed.student.1@example.com`;
- password: пароль, с которым загружали seed;
- остальные поля оставьте пустыми.

Нажмите **Authorize → Close**.
Откройте `GET /auth/me` → **Try it out → Execute**.

Ожидается `200`, `role: student`. Запишите `student_id`.
Для каждого следующего endpoint используйте тот же порядок:
открыть строку → Try it out → заполнить параметры/JSON → Execute.

**Смена пользователя выполняется через Authorize → Logout → Authorize.**
Отдельный вызов POST /auth/login возвращает JWT, но не переключает
авторизацию остальных запросов Swagger автоматически.

## 6. Выбрать опубликованную тему

Выполните `GET /topics`. Выберите тему со `status: published`, запишите:

- `id` — Topic ID;
- `supervisor_id` — Teacher ID, профиль научрука.

Выполните `GET /supervisors`, найдите запись с совпадающим **supervisor_id**,
запишите email. Поле `id` в ответе этого endpoint — User ID, оно может отличаться.

Для seed-кафедры ПИ руководитель — `seed.supervisor.pi@example.com`.
Окончательно определяйте владельца по ответам API, а не по имени или порядку списка.

## 7. Подать заявку и показать запрет доступа

В `POST /topics/{topic_id}/applications` укажите Topic ID и тело:

```json
{
  "justification": "Хочу реализовать эту тему в рамках своей ВКР."
}
```

Ожидается `201`, `status: pending`, `expires_at`. Запишите **id заявки**.
Проверьте её через `GET /applications/me`.

Если `409`, тема может быть занята, у студента уже есть активное закрепление
или действует cooldown после отказа. Выберите свободную тему; студенту
с активным закреплением понадобится другой seed-аккаунт для нового показа.

Под студентом выполните `GET /supervisor/works`.
Ожидается `403 Forbidden`: студент не имеет прав научрука.

## 8. Войти владельцем темы и одобрить

Откройте **Authorize → Logout**, затем войдите email руководителя из шага 6.
Для seed-научрука используется пароль, с которым загружали seed.

Сначала выполните `GET /auth/me`: ожидается `role: nauchruk`.
Затем `GET /supervisor/applications`, параметр `status = pending`.

В `PATCH /reservations/{application_id}/approve` подставьте ID заявки:

```json
{
  "comment": "Тема согласована, приступайте к работе."
}
```

Ожидается `200`, `status: approved`.
Сервер проверяет ownership, публикацию темы, лимит нагрузки и отсутствие
другого активного закрепления студента.

## 9. Увидеть закрепление и нагрузку

- `GET /supervisor/works`: найдите запись по студенту и теме.
  Ожидается `status: active`, `progress_percent: 0`.
- `GET /supervisor/dashboard`: current_load увеличился на 1,
  available_places уменьшилось на 1.

Запишите **id закрепления** из списка работ. Это Assignment ID,
он не обязан совпадать с ID заявки.

## 10. Допустить к защите

В `PATCH /works/{assignment_id}/progress` подставьте Assignment ID:

```json
{
  "current_stage": "admitted_to_defense",
  "progress_percent": 20
}
```

Ожидается `200` и следующий фрагмент ответа:

```json
{
  "status": "active",
  "progress_percent": 100,
  "current_stage": "admitted_to_defense"
}
```

Процент принудительно становится 100. Допуск ещё не завершает закрепление.
Обновлять прогресс должен научрук-владелец работы.

## 11. Проверить результат студентом

Смените авторизацию обратно на исходного студента:

- `GET /applications/me` — заявка approved;
- `GET /notifications` — уведомление об одобрении.

## 12. Подтвердить сохранение в PostgreSQL

В DBeaver откройте SQL Editor для подключённой БД и выполните:

```sql
SELECT u.email,
       a.id AS application_id,
       a.status AS application_status,
       w.id AS assignment_id,
       w.status AS assignment_status,
       w.current_stage,
       w.progress_percent
FROM users AS u
JOIN students AS s ON s.user_id = u.id
JOIN applications AS a ON a.student_id = s.id
JOIN assignments AS w
  ON w.student_id = s.id AND w.topic_id = a.topic_id
WHERE u.email = 'seed.student.1@example.com'
ORDER BY w.id DESC;
```

Если использовали другого студента, замените email.
Ожидается approved, active, admitted_to_defense, 100.

```powershell
docker compose restart app
```

Повторите SQL: запись должна сохраниться.

## 13. Почему бывает 403 и как повторить просроченное демо

| Ситуация | Что делать |
| --- | --- |
| Под admin вызывается GET /supervisor/works или /supervisor/applications | Войти научруком; эти личные endpoints требуют nauchruk |
| Admin хочет увидеть все заявки | Использовать GET /booking-requests |
| Admin хочет решить pending-заявку | Использовать PATCH /reservations/{id}/approve или /reject |
| Admin обновляет прогресс | Войти научруком-владельцем работы |
| GET /auth/me всё ещё показывает student после login | Переключить пользователя через Authorize, а не только POST /auth/login |
| Научрук одобряет чужую заявку | Войти владельцем темы, определённым по supervisor_id |
| Нет действительного JWT | Будет 401; повторить авторизацию |

В проверенном окружении demo.admin@example.com действительно имеет admin.
Его пароль берётся из DEMO_ADMIN_PASSWORD, а не SEED_PASSWORD.
Отказ на личной ручке научрука не означает отсутствие административных прав.

При диагностике обнаружены заявка №5 expired и тема №1 archived.
Это снимок конкретного окружения: такую заявку нельзя одобрить.
Выберите другую свободную опубликованную тему и создайте новую заявку.
Тема №2 на момент проверки была опубликована; её доступность проверяйте через API.

Если timeout не задан, default — 2 минуты. Значение 20160 действует только
на новые заявки после запуска API с новым окружением: старые expires_at
не продлеваются, архивированные темы автоматически не восстанавливаются.

## 14. Запасной запуск при недоступной Docker-сборке

Если сборка зависла на registry, остановите ожидание Ctrl+C.
Используйте PostgreSQL в Docker и локальный API:

```powershell
docker compose stop app
docker compose up -d db
uv sync
uv run alembic upgrade head
uv run python -m scripts.seed
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

DATABASE_URL в локальной `.env` должен указывать на 127.0.0.1:5433
с реальными реквизитами Docker PostgreSQL. Терминал Uvicorn оставьте открытым.
Продолжайте Swagger со шага 5. Для перезапуска локального API используйте
Ctrl+C и повтор команды uvicorn; `docker compose restart app` относится
только к контейнерному варианту.

Полное руководство с созданием аккаунтов и сценарием завкафедрой: [USER.md](USER.md).
