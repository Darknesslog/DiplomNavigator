# Словарь данных DiplomNavigator

Документ сгенерирован из `app/models` командой `uv run python scripts/dump_docs.py`.
Правки в этот файл не вносятся — меняйте модели и пересобирайте.

Всего таблиц: **13**. Типы указаны в нотации PostgreSQL.

## Содержание

- [academic_periods](#academic_periods) — Периоды учебного года, в рамках которых выбираются темы
- [faculties](#faculties) — Факультеты и институты
- [users](#users) — Учётные записи пользователей
- [departments](#departments) — Кафедры
- [notifications](#notifications) — Уведомления пользователей
- [study_groups](#study_groups) — Учебные группы
- [students](#students) — Студенты
- [teachers](#teachers) — Преподаватели и научные руководители
- [topics](#topics) — Темы выпускных квалификационных работ
- [applications](#applications) — Заявки студентов на темы
- [assignments](#assignments) — Итоговые закрепления тем за студентами
- [application_status_history](#application_status_history) — История изменения статусов заявок
- [attachments](#attachments) — Файлы, прикреплённые к темам и заявкам

## academic_periods

*Периоды учебного года, в рамках которых выбираются темы*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| **name** | `VARCHAR(100)` | нет | — | — | UNIQUE. Отображаемое имя, например «Весна 2027» |
| academic_year | `INTEGER` | нет | — | — | Учебный год, в который входит период (2026 = 2026/2027) |
| semester | `VARCHAR(16)` | нет | — | — | Осенний или весенний |
| starts_on | `DATE` | нет | — | — | Первый день периода |
| ends_on | `DATE` | нет | — | — | Последний день периода |
| application_opens_at | `TIMESTAMP WITH TIME ZONE` | нет | — | — | Когда открывается подача заявок |
| application_closes_at | `TIMESTAMP WITH TIME ZONE` | нет | — | — | Когда подача заявок закрывается |
| status | `VARCHAR(32)` | нет | draft | — | draft / open / closed / archived |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Проверки:

- `ck_academic_periods_application_window`: `application_closes_at > application_opens_at`
- `ck_academic_periods_period_status`: `academic_periods.status IN ('draft', 'open', 'closed', 'archived')`
- `ck_academic_periods_dates_order`: `ends_on >= starts_on`
- `ck_academic_periods_semester`: `academic_periods.semester IN ('autumn', 'spring')`

## faculties

*Факультеты и институты*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| **name** | `VARCHAR(200)` | нет | — | — | UNIQUE. Полное название факультета |
| **short_name** | `VARCHAR(30)` | нет | — | — | UNIQUE. Аббревиатура для интерфейса |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

## users

*Учётные записи пользователей*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| last_name | `VARCHAR(100)` | нет | — | — | Фамилия |
| first_name | `VARCHAR(100)` | нет | — | — | Имя |
| middle_name | `VARCHAR(100)` | да | — | — | Отчество, если есть |
| email | `VARCHAR(255)` | нет | — | — | Логин и адрес для писем |
| password_hash | `VARCHAR(255)` | нет | — | — | Хэш пароля (argon2/bcrypt), не сам пароль |
| role | `VARCHAR(32)` | нет | — | — | Роль: student / nauchruk / zavkaf / admin |
| is_active | `BOOLEAN` | нет | true | — | Может ли входить в систему |
| last_login_at | `TIMESTAMP WITH TIME ZONE` | да | — | — | Последний успешный вход |
| failed_login_attempts | `INTEGER` | нет | 0 | — | Неудачные попытки входа |
| locked_until | `TIMESTAMP WITH TIME ZONE` | да | — | — | Вход заблокирован до (UTC) |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Проверки:

- `ck_users_user_role`: `users.role IN ('student', 'nauchruk', 'zavkaf', 'admin')`

Индексы:

- `uq_users_email_lower` UNIQUE (email)

## departments

*Кафедры*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| faculty_id | `BIGINT` | нет | — | faculties.id | Факультет, к которому относится кафедра |
| name | `VARCHAR(200)` | нет | — | — | Полное название кафедры |
| **short_name** | `VARCHAR(30)` | нет | — | — | UNIQUE. Аббревиатура кафедры |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Индексы:

- `ix_departments_faculty_id` (faculty_id)

## notifications

*Уведомления пользователей*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| user_id | `BIGINT` | нет | — | users.id | Получатель |
| kind | `VARCHAR(50)` | нет | — | — | Тип события, например application_approved |
| title | `VARCHAR(200)` | нет | — | — | Заголовок |
| body | `TEXT` | да | — | — | Текст уведомления |
| payload | `JSONB` | да | — | — | Служебные данные события |
| is_read | `BOOLEAN` | нет | false | — | Прочитано ли |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда создано |
| read_at | `TIMESTAMP WITH TIME ZONE` | да | — | — | Когда прочитано |

Индексы:

- `ix_notifications_user_id_is_read` (user_id, is_read)

## study_groups

*Учебные группы*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| faculty_id | `BIGINT` | нет | — | faculties.id | Факультет группы |
| **name** | `VARCHAR(50)` | нет | — | — | UNIQUE. Название группы, например ИУ7-41Б |
| enrollment_year | `SMALLINT` | нет | — | — | Год поступления группы |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Индексы:

- `ix_study_groups_faculty_id` (faculty_id)

## students

*Студенты*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| **user_id** | `BIGINT` | нет | — | users.id | UNIQUE. Учётная запись студента |
| group_id | `BIGINT` | нет | — | study_groups.id | Учебная группа |
| department_id | `BIGINT` | да | — | departments.id | Кафедра; NULL для ещё не распределённых студентов |
| **record_book_number** | `VARCHAR(20)` | да | — | — | UNIQUE. Номер зачётной книжки |
| admission_year | `SMALLINT` | да | — | — | Год поступления |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Индексы:

- `ix_students_department_id` (department_id)
- `ix_students_group_id` (group_id)

## teachers

*Преподаватели и научные руководители*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| **user_id** | `BIGINT` | нет | — | users.id | UNIQUE. Учётная запись преподавателя |
| department_id | `BIGINT` | нет | — | departments.id | Кафедра |
| position | `VARCHAR(100)` | да | — | — | Должность: доцент, профессор, ассистент |
| academic_degree | `VARCHAR(100)` | да | — | — | Учёная степень и звание |
| max_students | `SMALLINT` | нет | 5 | — | Сколько студентов одновременно может вести |
| is_available | `BOOLEAN` | нет | true | — | Показывать ли в списке доступных руководителей |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Индексы:

- `ix_teachers_department_id` (department_id)

## topics

*Темы выпускных квалификационных работ*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| period_id | `BIGINT` | нет | — | academic_periods.id | Период, в котором тема доступна |
| supervisor_id | `BIGINT` | нет | — | teachers.id | Научный руководитель |
| department_id | `BIGINT` | да | — | departments.id | Кафедра, за которой закреплена тема |
| created_by_user_id | `BIGINT` | нет | — | users.id | Кто создал карточку темы |
| proposed_by_student_id | `BIGINT` | да | — | students.id | Студент, если тему предложил он сам |
| title | `VARCHAR(500)` | нет | — | — | Формулировка темы |
| description | `TEXT` | нет | — | — | Краткое описание, задачи, ожидаемый результат |
| status | `VARCHAR(32)` | нет | draft | — | draft / published / rejected / archived |
| source | `VARCHAR(32)` | нет | teacher | — | Кто предложил: преподаватель, студент или компания |
| company_name | `VARCHAR(200)` | да | — | — | Организация, если тема от предприятия |
| published_at | `TIMESTAMP WITH TIME ZONE` | да | — | — | Когда тема стала видна студентам |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Проверки:

- `ck_topics_topic_source`: `topics.source IN ('teacher', 'student', 'company')`
- `ck_topics_topic_status`: `topics.status IN ('draft', 'published', 'rejected', 'archived')`

Индексы:

- `ix_topics_created_by_user_id` (created_by_user_id)
- `ix_topics_department_id` (department_id)
- `ix_topics_period_id_status` (period_id, status)
- `ix_topics_supervisor_id` (supervisor_id)

## applications

*Заявки студентов на темы*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| student_id | `BIGINT` | нет | — | students.id | Кто подал заявку |
| topic_id | `BIGINT` | нет | — | topics.id | На какую тему |
| status | `VARCHAR(32)` | нет | pending | — | pending / approved / rejected / withdrawn |
| motivation | `TEXT` | да | — | — | Почему студент хочет эту тему |
| decided_by_user_id | `BIGINT` | да | — | users.id | Кто принял решение по заявке |
| decided_at | `TIMESTAMP WITH TIME ZONE` | да | — | — | Когда принято решение |
| decision_comment | `TEXT` | да | — | — | Комментарий к решению |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Проверки:

- `ck_applications_application_status`: `applications.status IN ('pending', 'approved', 'rejected', 'withdrawn')`

Индексы:

- `ix_applications_decided_by_user_id` (decided_by_user_id)
- `ix_applications_status` (status)
- `ix_applications_student_id` (student_id)
- `ix_applications_topic_id` (topic_id)
- `uq_applications_student_id_topic_id_active` UNIQUE (student_id, topic_id) WHERE status IN ('pending', 'approved')

## assignments

*Итоговые закрепления тем за студентами*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| student_id | `BIGINT` | нет | — | students.id | Студент |
| topic_id | `BIGINT` | нет | — | topics.id | Тема |
| supervisor_id | `BIGINT` | нет | — | teachers.id | Научный руководитель на момент закрепления |
| status | `VARCHAR(32)` | нет | active | — | active / completed / cancelled |
| assigned_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда тема закреплена |
| order_number | `VARCHAR(50)` | да | — | — | Номер приказа о закреплении тем |
| order_date | `DATE` | да | — | — | Дата приказа |
| cancel_reason | `TEXT` | да | — | — | Причина отмены закрепления |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Проверки:

- `ck_assignments_cancelled_requires_reason`: `status <> 'cancelled' OR cancel_reason IS NOT NULL`
- `ck_assignments_assignment_status`: `assignments.status IN ('active', 'completed', 'cancelled')`

Индексы:

- `ix_assignments_student_id` (student_id)
- `ix_assignments_supervisor_id` (supervisor_id)
- `ix_assignments_topic_id` (topic_id)
- `uq_assignments_student_id_active` UNIQUE (student_id) WHERE status = 'active'

## application_status_history

*История изменения статусов заявок*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| application_id | `BIGINT` | нет | — | applications.id | Заявка |
| from_status | `VARCHAR(32)` | да | — | — | Предыдущий статус, NULL для создания заявки |
| to_status | `VARCHAR(32)` | нет | — | — | Новый статус |
| changed_by_user_id | `BIGINT` | да | — | users.id | Кто изменил статус |
| comment | `TEXT` | да | — | — | Причина перехода |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда произошёл переход |

Проверки:

- `ck_application_status_history_application_status_to`: `application_status_history.to_status IN ('pending', 'approved', 'rejected', 'withdrawn')`
- `ck_application_status_history_application_status_from`: `application_status_history.from_status IN ('pending', 'approved', 'rejected', 'withdrawn')`

Индексы:

- `ix_application_status_history_application_id_created_at` (application_id, created_at)

## attachments

*Файлы, прикреплённые к темам и заявкам*

| Поле | Тип | NULL | По умолчанию | Ссылка | Описание |
| --- | --- | --- | --- | --- | --- |
| **id** | `BIGINT` | нет | identity | — | PK. Первичный ключ |
| topic_id | `BIGINT` | да | — | topics.id | Тема-владелец файла |
| application_id | `BIGINT` | да | — | applications.id | Заявка-владелец файла |
| original_name | `VARCHAR(255)` | нет | — | — | Имя файла, которое видел пользователь |
| **storage_key** | `VARCHAR(500)` | нет | — | — | UNIQUE. Путь/ключ в хранилище (S3, диск) |
| mime_type | `VARCHAR(100)` | да | — | — | MIME-тип |
| size_bytes | `BIGINT` | нет | — | — | Размер в байтах |
| uploaded_by_user_id | `BIGINT` | да | — | users.id | Кто загрузил |
| created_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись создана |
| updated_at | `TIMESTAMP WITH TIME ZONE` | нет | now() | — | Когда запись последний раз менялась |

Проверки:

- `ck_attachments_exactly_one_owner`: `num_nonnulls(topic_id, application_id) = 1`

Индексы:

- `ix_attachments_application_id` (application_id)
- `ix_attachments_topic_id` (topic_id)
