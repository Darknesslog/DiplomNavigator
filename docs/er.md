# Схема данных DiplomNavigator v0.1

Диаграмма отражает только ключевые поля (PK/FK). Полный перечень колонок —
в [словаре данных](data-dictionary.md), он генерируется из моделей и всегда
актуален.

```mermaid
erDiagram
    faculties ||--o{ departments : "имеет кафедры"
    faculties ||--o{ study_groups : "имеет группы"
    departments ||--o{ teachers : "работают"
    departments |o--o{ students : "закреплены"
    study_groups ||--o{ students : "учатся"

    users ||--o| students : "профиль студента"
    users ||--o| teachers : "профиль преподавателя"
    users ||--o{ notifications : "получает"

    academic_periods ||--o{ topics : "включает темы"
    teachers ||--o{ topics : "руководит"
    departments ||--o{ topics : "закреплена за"
    users ||--o{ topics : "создал карточку"
    students ||--o{ topics : "предложил свою тему"

    students ||--o{ applications : "подаёт"
    topics ||--o{ applications : "получает заявки"
    users ||--o{ applications : "решает по заявке"
    applications ||--o{ application_status_history : "история статусов"

    students ||--o{ assignments : "закреплён"
    topics ||--o{ assignments : "закреплена"
    teachers ||--o{ assignments : "ведёт"

    topics ||--o{ attachments : "файлы темы"
    applications ||--o{ attachments : "файлы заявки"
    users ||--o{ attachments : "загрузил"

    users {
        bigint id PK
        varchar last_name
        varchar first_name
        varchar email UK
        varchar role "student / nauchruk / zavkaf / admin"
    }

    students {
        bigint id PK
        bigint user_id FK,UK
        bigint department_id FK
        bigint group_id FK
        varchar record_book_number UK
    }

    teachers {
        bigint id PK
        bigint user_id FK,UK
        bigint department_id FK
        smallint max_students
    }

    faculties {
        bigint id PK
        varchar name UK
        varchar short_name UK
    }

    departments {
        bigint id PK
        bigint faculty_id FK
        varchar name
        varchar short_name UK
    }

    study_groups {
        bigint id PK
        bigint faculty_id FK
        varchar name UK
        smallint enrollment_year
    }

    academic_periods {
        bigint id PK
        varchar name UK
        int academic_year
        varchar semester "autumn / spring"
        timestamptz application_opens_at
        timestamptz application_closes_at
        varchar status
    }

    topics {
        bigint id PK
        bigint period_id FK
        bigint supervisor_id FK
        bigint department_id FK
        bigint created_by_user_id FK
        bigint proposed_by_student_id FK
        varchar title
        varchar status "draft / published / rejected / archived"
        varchar source "teacher / student / company"
        smallint max_students
    }

    applications {
        bigint id PK
        bigint student_id FK
        bigint topic_id FK
        varchar status "pending / approved / rejected / withdrawn"
        bigint decided_by_user_id FK
        timestamptz decided_at
    }

    application_status_history {
        bigint id PK
        bigint application_id FK
        varchar from_status
        varchar to_status
        bigint changed_by_user_id FK
        timestamptz created_at
    }

    assignments {
        bigint id PK
        bigint student_id FK
        bigint topic_id FK
        bigint supervisor_id FK
        varchar status "active / completed / cancelled"
        timestamptz assigned_at
        varchar order_number
        date order_date
    }

    attachments {
        bigint id PK
        bigint topic_id FK
        bigint application_id FK
        varchar original_name
        varchar storage_key UK
        bigint size_bytes
        bigint uploaded_by_user_id FK
    }

    notifications {
        bigint id PK
        bigint user_id FK
        varchar kind
        bool is_read
        timestamptz created_at
    }
```

## Как читать схему

1. **`users` — это только учётные записи.** Кто человек в предметной области,
   решают `students` и `teachers`, которые ссылаются на `users` один-к-одному.
   Так один аккаунт может быть и научруком, и методистом, и внешним
   пользователем, а авторизация не зависит от роли.
2. **`academic_periods` — рамка всего.** Тема всегда принадлежит периоду.
   Без этого «текущий семестр» протекает в код и в отчёты.
3. **`topics` — предложение, `applications` — намерение, `assignments` — факт.**
   Три разные сущности с разным жизненным циклом. Нельзя выкинуть
   `assignments` и считать «закреплён» статусом заявки: заявку можно отозвать
   и подать заново, а закрепление живёт отдельно и имеет номер приказа.
4. **`application_status_history`** хранит путь, а не последний шаг: на разборе
   нужен ответ «кто отклонил и когда», а не только текущий статус.
5. **`attachments`** — один владелец на файл, проверяется
   `num_nonnulls(topic_id, application_id) = 1`. Полиморфную пару
   `(owner_type, owner_id)` сознательно не взяли: с ней нельзя поставить FK.

## Правила, зашитые в БД, а не в код

| Правило | Где живёт |
| --- | --- |
| У студента не больше одного активного закрепления | частичный UNIQUE `uq_assignments_student_id_active` |
| Одна активная заявка на тему от одного студента | частичный UNIQUE `uq_applications_student_id_topic_id_active` |
| Отмена закрепления требует причины | CHECK `ck_assignments_cancelled_requires_reason` |
| Период не может кончиться раньше начала | CHECK `ck_academic_periods_dates_order` |
| Окно подачи заявок закрывается позже, чем открывается | CHECK `ck_academic_periods_application_window` |
| Email уникален без учёта регистра | `CREATE UNIQUE INDEX uq_users_email_lower ON users (lower(email))` |
| У файла ровно один владелец | CHECK `ck_attachments_exactly_one_owner` |

## Чего в схеме сознательно нет

Это не забытое, а отложенное — чтобы не тащить в MVP лишнее:

- **теги и области знаний** (`tags`, `topic_tags`) — нужны для поиска, но
  набор тегов ещё никто не сформулировал;
- **комментарии/обсуждение темы** (`comments`) — на MVP хватает
  `applications.decision_comment`;
- **этапы работы** (главы, проверки, рецензии) — это отдельный домен, если
  продукт пойдёт дальше выбора темы;
- **аудит-лог** изменений всех сущностей — истории статусов заявок достаточно
  для первого семестра;
- **мягкое удаление** (`deleted_at`) — пока неясно, нужно ли восстанавливать
  удалённые темы; сейчас удаление ограничено внешними ключами.
