# Матрица эндпоинтов и трассировки backend

Дата актуализации: 05.11.2026

Документ описывает backend без frontend и загрузки файлов. Статус
«демонстрация» означает, что сценарий был показан через Swagger. Статус
«вне демонстрации» означает, что функция реализована и покрыта backend-тестами
или проверялась отдельно. «Технический долг» означает отсутствие функции либо
неполное покрытие заявленного user flow.

## 1. Реализованные эндпоинты

| Метод | Endpoint | Роли | Назначение | Статус |
|---|---|---|---|---|
| POST | `/login` | Публичный | Вход и выдача JWT | Демонстрация |
| POST | `/auth/login` | Публичный | Алиас входа | Демонстрация |
| GET | `/me`, `/auth/me` | Все | Профиль текущего пользователя | Демонстрация |
| GET | `/health` | Публичный | Проверка доступности API | Демонстрация |
| GET | `/departments` | Все | Справочник кафедр | Демонстрация |
| GET | `/academic-periods` | Все | Справочник учебных периодов | Демонстрация |
| GET | `/study-groups` | Все | Справочник учебных групп | Вне демонстрации |
| GET | `/supervisors` | Все | Список научруков в области доступа | Вне демонстрации |
| POST | `/students` | admin, zavkaf | Создание студента | Вне демонстрации |
| GET | `/students` | admin, zavkaf | Список студентов | Вне демонстрации |
| POST | `/supervisors` | admin, zavkaf | Создание научрука | Вне демонстрации |
| PATCH | `/users/{user_id}/department` | admin, zavkaf | Назначение кафедры | Вне демонстрации |
| PATCH | `/users/{user_id}/role` | admin | Изменение роли | Вне демонстрации |
| POST | `/topics` | admin, nauchruk, zavkaf | Создание темы | Демонстрация |
| GET | `/topics`, `/topics/{topic_id}` | Все | Каталог и карточка темы | Демонстрация |
| PATCH | `/topics/{topic_id}/status` | admin, zavkaf | Публикация и модерация темы | Демонстрация |
| POST | `/topics/{topic_id}/applications` | student | Подача заявки студентом | Демонстрация |
| POST | `/topics/{topic_id}/bookings` | student | Совместимый алиас подачи заявки | Вне демонстрации |
| GET | `/applications/me`, `/bookings/me` | student | Заявки текущего студента | Вне демонстрации |
| GET | `/supervisor/applications` | nauchruk | Заявки на темы научрука | Демонстрация |
| PATCH | `/supervisor/applications/{id}/approve` | nauchruk | Одобрение заявки | Демонстрация |
| PATCH | `/supervisor/applications/{id}/reject` | nauchruk | Отклонение заявки | Вне демонстрации |
| GET | `/booking-requests` | admin, nauchruk, zavkaf | Заявки в области доступа | Вне демонстрации |
| POST | `/booking-requests/{id}/approve` | nauchruk | Совместимый алиас одобрения | Вне демонстрации |
| POST | `/booking-requests/{id}/reject` | nauchruk | Совместимый алиас отклонения | Вне демонстрации |
| PATCH | `/reservations/{id}/approve` | admin, nauchruk, zavkaf | Одобрение заявки с проверками области | Демонстрация |
| PATCH | `/reservations/{id}/reject` | admin, nauchruk, zavkaf | Отклонение и освобождение заявки | Вне демонстрации |
| GET | `/supervisor/assignments` | nauchruk | Закрепления научрука | Демонстрация |
| GET | `/supervisor/assignments/{id}` | nauchruk | Одно закрепление | Вне демонстрации |
| GET | `/supervisor/students` | nauchruk | Студенты научрука | Вне демонстрации |
| GET | `/supervisor/students/{id}` | nauchruk | Карточка студента научрука | Вне демонстрации |
| GET | `/supervisor/works` | nauchruk | Работы научрука | Вне демонстрации |
| GET | `/supervisor/dashboard`, `/dashboard/supervisor` | nauchruk | Дашборд и нагрузка | Вне демонстрации |
| PATCH | `/works/{assignment_id}/progress` | nauchruk | Изменение этапа и прогресса | Демонстрация |
| PATCH | `/supervisor/assignments/{id}/progress` | nauchruk | Совместимый алиас прогресса | Вне демонстрации |
| GET | `/works/me` | student | Прогресс работ студента | Демонстрация |
| GET | `/notifications` | Все | Уведомления текущего пользователя | Демонстрация |
| GET | `/dashboard/head` | admin, zavkaf | Дашборд кафедры | Вне демонстрации |
| GET | `/workload/supervisors` | admin, zavkaf | Нагрузка научруков | Вне демонстрации |
| PATCH | `/supervisors/{id}/limit` | admin, zavkaf | Изменение лимита научрука | Вне демонстрации |
| POST | `/assignments` | admin, zavkaf | Прямое закрепление темы за студентом | Демонстрация |
| POST | `/topics/{id}/deletion-requests` | nauchruk | Заявка научрука на удаление темы | Вне демонстрации |
| GET | `/topics/deletion-requests` | admin, zavkaf, nauchruk | Просмотр заявок удаления | Вне демонстрации |
| PATCH | `/topics/deletion-requests/{id}/approve` | admin, zavkaf | Одобрение удаления и архивирование | Вне демонстрации |
| PATCH | `/topics/deletion-requests/{id}/reject` | admin, zavkaf | Отклонение удаления | Вне демонстрации |

## 2. Матрица трассировки требований

| ID | Требование / user flow | Реализация | Проверка | Состояние |
|---|---|---|---|---|
| AUTH-01 | Пользователь входит по email и паролю | `/auth/login`, JWT Bearer | `test_authentication.py`, Swagger | Готово |
| AUTH-02 | Роль ограничивает доступ к операциям | role dependencies и scope checks | `test_authentication.py`, `test_workflows.py` | Готово |
| TOPIC-01 | Научрук создает тему | `POST /topics`, owner определяется сервером | `test_topics.py` | Готово |
| TOPIC-02 | Завкафедра публикует тему своей кафедры | `PATCH /topics/{id}/status` | `test_topics.py` | Готово |
| TOPIC-03 | Компания предлагает тему с назначенным научруком | `POST /topics`, `source=company` | `test_topics.py` | Готово |
| TOPIC-04 | Студент видит доступные темы своей кафедры | `GET /topics` | `test_topics.py`, Swagger | Готово |
| TOPIC-05 | Студент подает заявку | `POST /topics/{id}/applications` | `test_applications.py`, Swagger | Готово |
| TOPIC-06 | Завкафедра создает тему студента и сразу закрепляет ее | `POST /topics` + `PATCH status` + `POST /assignments` | `test_workflows.py`, Swagger | Готово |
| BOOK-01 | Научрук одобряет или отклоняет заявку | supervisor application endpoints | `test_workflows.py`, `test_applications.py` | Готово |
| BOOK-02 | Нельзя превысить лимит научрука | capacity lock и workload checks | `test_workflows.py` | Готово |
| WORK-01 | Одобрение заявки создает Assignment | transactional application workflow | `test_workflows.py` | Готово |
| WORK-02 | Научрук меняет этап и процент работы | `PATCH /works/{id}/progress` | `test_supervisor.py`, Swagger | Готово |
| WORK-03 | Студент видит актуальный прогресс | `GET /works/me` | `test_supervisor.py`, Swagger | Готово |
| WORK-04 | Студент получает уведомление о прогрессе | `assignment_progress_updated` | `test_supervisor.py`, Swagger | Готово |
| WORK-05 | Защищенная работа закрывает Assignment и архивирует тему | `defended` transition | `test_supervisor.py`, Swagger | Готово |
| DEL-01 | Научрук просит удалить свою тему | deletion request workflow | `test_workflows.py` | Готово |
| DEL-02 | Завкафедра отклоняет удаление без изменения темы | reject endpoint | `test_workflows.py`, отдельная live-проверка | Готово |
| DEL-03 | Завкафедра одобряет удаление и архивирует тему | approve endpoint | `test_workflows.py` | Готово |
| DATA-01 | Состояния workflow сохраняются в PostgreSQL | SQLAlchemy models и миграции | PostgreSQL, Alembic | Готово |
| DATA-02 | Есть история изменения заявок | `ApplicationStatusHistory` | `test_workflows.py` | Готово |

## 3. Технический долг и отсутствующие функции

| ID | Область | Что отсутствует или требует развития | Приоритет |
|---|---|---|---|
| DEBT-01 | Frontend | Полная привязка экранов к API, JWT и обработке ошибок | Высокий |
| DEBT-02 | Файлы | Хранилище, загрузка, скачивание и права доступа к файлам ВКР | Средний |
| DEBT-03 | Отчеты | Экспорт отчетов в Excel/CSV/PDF | Средний |
| DEBT-04 | Темы | Отдельный `PATCH /topics/{id}` для редактирования карточки темы | Средний |
| DEBT-05 | Авторизация | Отдельный logout/revocation токенов | Средний |
| DEBT-06 | Прогресс | История изменений прогресса, а не только текущее состояние | Средний |
| DEBT-07 | Партнеры | Отдельная сущность компании и workflow подтверждения партнером | Низкий |
| DEBT-08 | Уведомления | Endpoint отметки уведомления прочитанным и push/email-каналы | Низкий |
| DEBT-09 | Приемка | Расширенный набор live-интеграционных тестов PostgreSQL и CI | Средний |

Эти пункты не являются незавершенными частями уже реализованных маршрутов:
они относятся к отдельным функциям, которые не входили в текущий backend-объем.

## 4. Итог

- Реализованные backend-маршруты: покрывают авторизацию, роли, темы, заявки,
  закрепления, прогресс, уведомления, ручные назначения и архивирование.
- Основной демонстрационный user flow завершен от создания/публикации темы до
  защиты и архива.
- Основные функции, не вошедшие в запись, доступны для отдельного показа через
  Swagger и покрыты автоматическими тестами.
- После изменений по темам от партнера локальный набор проверок должен оставаться
  на уровне `90 passed`; frontend, файлы и отчеты остаются отдельным объемом.
