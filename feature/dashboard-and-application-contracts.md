# Контракты Дашборда и Заявок

## Состав изменений

Основа: ветка заявок `01c965c`. Подача/решения повторно используют существующие
сервисы, чтение реализовано отдельным слоем проекций.

- [API экранов](../backend/app/api/read_models.py): заявки, dashboard, workload и алиасы.
- [API научрука](../backend/app/api/supervisor.py): карточки и списки студентов/закреплений.
- [Сервисы чтения](../backend/app/services/read_models.py): ownership, кафедра, агрегаты.
- [Общие карточки](../backend/app/schemas/presentation.py), [дашборды](../backend/app/schemas/dashboard.py),
  [заявки](../backend/app/schemas/application.py), [закрепления](../backend/app/schemas/supervisor.py).
- [Профиль](../backend/app/schemas/accounts.py) и [сериализация](../backend/app/services/accounts.py):
  группа, кафедра, зачётная книжка, год поступления.
- [Темы](../backend/app/schemas/topic.py): подпись статуса, удалено повторное объявление поля.
- [Регистрация](../backend/app/main.py): `/auth/login`, `/auth/me` при сохранении старых путей.

Модель БД не меняется, новой миграции нет. Существующие миграции ветки заявок
должны быть применены. История прогресса пока не сохраняется.

## Студент: подача и отслеживание

1. `POST /auth/login`: form-поля `username` (email), `password`.
2. JWT передаётся через `Authorization: Bearer <token>`.
3. `GET /auth/me`: текущая роль, группа и кафедра.
4. `GET /topics`: доступные опубликованные темы по правилам исходной ветки.
5. `POST /topics/12/applications` или `/topics/12/bookings`:

   ```json
   {"justification": "Хочу исследовать планирование нагрузки."}
   ```

6. `GET /applications/me` или `/bookings/me`: заявки, решения и дедлайны.

`motivation` остаётся допустимым входным ключом и полем ответа.
Оба ключа одновременно запрещены (`422`).

Пример одной заявки в массиве ответа; данные демонстрационные:

```json
{
  "id": 7,
  "student_id": 3,
  "topic_id": 12,
  "status": "pending",
  "motivation": "Хочу исследовать планирование нагрузки.",
  "expires_at": "2026-11-01T10:02:00Z",
  "cooldown_until": null,
  "decided_by_user_id": null,
  "decided_at": null,
  "decision_comment": null,
  "created_at": "2026-11-01T10:00:00Z",
  "updated_at": "2026-11-01T10:00:00Z",
  "student": {
    "id": 3,
    "user_id": 8,
    "first_name": "Иван",
    "last_name": "Петров",
    "middle_name": null,
    "email": "student@example.com",
    "group_id": 1,
    "group_name": "ИВТ-41",
    "department_id": 2,
    "record_book_number": null,
    "admission_year": 2023,
    "full_name": "Петров Иван"
  },
  "topic": {
    "id": 12,
    "title": "Система планирования нагрузки",
    "department_id": 2,
    "supervisor_id": 4
  },
  "group_name": "ИВТ-41",
  "justification": "Хочу исследовать планирование нагрузки.",
  "status_label": "На рассмотрении"
}
```

После отказа возвращаются `rejected`, комментарий, `cooldown_until`.
Cooldown заявки не блокирует вход. Просрочка при обработке меняет заявку
на `expired`, а тему архивирует для всех студентов.

## Научрук: dashboard и карточки

1. `GET /supervisor/dashboard` или `/dashboard/supervisor`.
2. `GET /supervisor/applications?status=pending&limit=20`.
3. `PATCH /supervisor/applications/7/approve` с `{"comment":"Согласовано"}`
   или `POST /booking-requests/7/approve` с тем же телом.
4. `GET /supervisor/assignments`: созданное закрепление.
5. `GET /supervisor/students/3`: профиль и только собственные закрепления.
6. `PATCH /supervisor/assignments/{id}/progress`: прежняя операция прогресса.

Дашборд нового научрука без тем и студентов:

```json
{
  "supervisor_id": 4,
  "user_id": 9,
  "full_name": "Иванова Анна",
  "email": "supervisor@example.com",
  "department_id": 2,
  "department_name": "Кафедра информатики",
  "current_load": 0,
  "max_students": 5,
  "available_places": 5,
  "topics_count": 0,
  "students_count": 0,
  "pending_applications": 0,
  "recent_applications": [],
  "recent_assignments": []
}
```

`current_load` считает только `active`; список студентов включает `active`
и `completed`. Счётчики учитывают все записи, последние карточки ограничены пятью.
Информация дашборда не заменяет транзакционную проверку лимита при одобрении.

Карточка закрепления дополнена `student`, `topic`, `group_name`, `status_label`,
`current_stage_label`, `progress_history`. История теперь сохраняется и возвращается
массивом событий с автором, временем, прежними и новыми значениями и комментарием.
Для старых закреплений без записанных событий возвращается `[]`; прежние события
не восстанавливаются. История доступна также через
`GET /assignments/{assignment_id}/progress-history`: студенту и руководителю
своего закрепления, завкафедрой своей кафедры и администратору.

После `admitted_to_defense` обычный `PATCH /progress` допускает только сохранение
допуска (100%) либо переход в `defended` (100%). После защиты изменения запрещены.
Завкафедрой/администратор может выполнить
`POST /assignments/{assignment_id}/revoke-admission` с обязательным непустым
`comment`: работа возвращается в `under_review`, процент остаётся 100, а причина
и автор сохраняются в журнале. Это не позволяет отменить уже состоявшуюся защиту.

Студенческая подача заявки в периоде `closed` запрещена с 403, в том числе через
алиас bookings. Ручное назначение руководством сохраняет обход закрытого периода,
но не лимитов, кафедральных ограничений и уникальности закрепления.
При одобрении либо ручном назначении остальные pending-заявки студента в той же
транзакции переводятся в withdrawn без cooldown; соответствующие темы не архивируются.

## Завкафедрой

- `GET /dashboard/head`: счётчики своей кафедры.
- `GET /booking-requests?status=pending`: заявки на темы кафедры.
- `GET /workload/supervisors`: нагрузка действующих руководителей, включая нулевую.
- Admin указывает `?department_id=2`; без него получает `422`.
- Завкаф не может выбрать чужую кафедру (`403`).

Дашборд содержит `students_count`, `supervisors_count`, `active_assignments`,
`pending_applications`, `topics` (`draft/published/rejected/archived`),
`current_load`, `max_students`, `available_places`.
Нагрузка считается по текущей кафедре руководителя, `active_assignments` —
по кафедре темы. После переноса профилей эти числа могут отличаться.

## Когда запрос не сработает

| Сценарий | Ответ |
| --- | --- |
| Нет JWT / JWT истёк / аккаунт неактивен | `401` |
| Студент вызывает dashboard научрука или кафедры | `403` |
| Научрук читает чужую карточку студента/закрепления | `404` |
| Научрук решает чужую заявку | Прежний `403` |
| Повторное решение обработанной заявки | Прежний `409` |
| Достигнут лимит при одобрении | Прежний `409` |
| Неправильный limit/offset/status | `422` |
| Admin не указал кафедру для dashboard/workload | `422` |
| Запрошены `/auth/logout`, `/reports`, `/works` | `404`, ручки не реализованы |

Роли: `student`, `nauchruk`, `zavkaf`, `admin`. Статусы остаются в нижнем
регистре, подписи выделены отдельно. Отдельного `APPROVED` у темы в БД нет.
Полная матрица и оставшиеся продуктовые задачи: [TASK.md](../TASK.md).
