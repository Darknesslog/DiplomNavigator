# API: действия и роли

Сгенерировано из зарегистрированных маршрутов. Ownership и кафедра проверяются сервисами.
Списки ограничены limit/offset. Завкаф принимает решения через `/reservations`.

| Метод | Endpoint | Роли | Действие |
| --- | --- | --- | --- |
| POST | `/login` | Публичный | Authenticate with email in username; lock the account after three failed attempts. |
| GET | `/me` | Все авторизованные | Return the authenticated account's current role and department, without credentials. |
| POST | `/auth/login` | Публичный | Authenticate with email in username; lock the account after three failed attempts. |
| GET | `/auth/me` | Все авторизованные | Return the authenticated account's current role and department, without credentials. |
| POST | `/students` | admin, zavkaf | Create a student and group/department links atomically within the manager's scope. |
| GET | `/students` | admin, zavkaf | List active students; department heads see only their department. |
| POST | `/supervisors` | admin, zavkaf | Create a nauchruk account and its teacher-domain profile atomically. |
| GET | `/supervisors` | Все авторизованные | List available supervisors in the caller's department; admins see all. |
| GET | `/departments` | Все авторизованные | Return the department directory to authenticated users. |
| PATCH | `/users/{user_id}/department` | admin, zavkaf | Assign a profile's department; only admins may transfer between departments. |
| PATCH | `/users/{user_id}/role` | admin | Assign roles as admin, retaining profiles and preventing self-demotion. |
| POST | `/topics` | admin, nauchruk, zavkaf | Create a draft topic owned by the authenticated supervisor or department. |
| GET | `/topics` | Все авторизованные | List only topics visible to the authenticated role. |
| POST | `/topics/{topic_id}/applications` | student | Submit a pending topic application for the authenticated student. |
| GET | `/topics/{topic_id}` | Все авторизованные | Return one visible topic. |
| PATCH | `/topics/{topic_id}/status` | admin, zavkaf | Moderate a topic in the moderator's department. |
| POST | `/topics/{topic_id}/deletion-requests` | nauchruk | Request department review before archiving an owned topic. |
| GET | `/topics/deletion-requests` | admin, zavkaf, nauchruk | List deletion requests in the caller's ownership or department scope. |
| PATCH | `/topics/deletion-requests/{request_id}/approve` | admin, zavkaf | Approve a deletion request and archive the topic. |
| PATCH | `/topics/deletion-requests/{request_id}/reject` | admin, zavkaf | Reject a deletion request without changing the topic. |
| GET | `/supervisor/applications` | nauchruk | List applications submitted for the supervisor's topics. |
| GET | `/supervisor/assignments` | nauchruk | List only the current supervisor's assignments. |
| GET | `/supervisor/assignments/{assignment_id}` | nauchruk | Return an owned assignment or 404 without disclosing another supervisor's data. |
| GET | `/supervisor/students` | nauchruk | List students attached to this supervisor through noncancelled assignments. |
| GET | `/supervisor/students/{student_id}` | nauchruk | Read a student profile and only this supervisor's assignments. |
| PATCH | `/supervisor/applications/{application_id}/approve` | nauchruk | Approve a pending application and create its active assignment. |
| PATCH | `/supervisor/applications/{application_id}/reject` | nauchruk | Reject a pending application and release the topic. |
| PATCH | `/supervisor/assignments/{assignment_id}/progress` | nauchruk | Update the work stage and completion percentage. |
| GET | `/bookings/me` | student | Read only the current student's requests, including decisions and deadlines. |
| GET | `/applications/me` | student | Read only the current student's requests, including decisions and deadlines. |
| GET | `/works/me` | student | Read the current student's assignments, stages, percentages and completion status. |
| GET | `/booking-requests` | admin, nauchruk, zavkaf | Supervisors see owned topics, heads their department, and admins all requests. |
| POST | `/topics/{topic_id}/bookings` | student | Compatibility path for submitting an Application; no separate Booking entity. |
| POST | `/booking-requests/{application_id}/approve` | nauchruk | Delegate to the existing transactional ownership and workload checks. |
| POST | `/booking-requests/{application_id}/reject` | nauchruk | Reject through the existing service, preserving the student-topic cooldown. |
| GET | `/supervisor/dashboard` | nauchruk | Read the supervisor's load, counters, and recent application/assignment cards. |
| GET | `/dashboard/supervisor` | nauchruk | Read the supervisor's load, counters, and recent application/assignment cards. |
| GET | `/dashboard/head` | admin, zavkaf | Read departmental counters; admins must specify department_id. |
| GET | `/workload/supervisors` | admin, zavkaf | Read real active load and free places for the authorized department. |
| GET | `/supervisor/works` | nauchruk | Read assigned students, topics, stages and percentages owned by this supervisor. |
| PATCH | `/reservations/{application_id}/approve` | admin, nauchruk, zavkaf | Approve as owner or department head; capacity checks cannot be bypassed. |
| PATCH | `/reservations/{application_id}/reject` | admin, nauchruk, zavkaf | Release a pending reservation and persist an in-app notification for its student. |
| PATCH | `/works/{assignment_id}/progress` | nauchruk | Update an owned work; admission to defense forces the completion percentage to 100. |
| PATCH | `/supervisors/{supervisor_id}/limit` | admin, zavkaf | Change a scoped supervisor limit and return recalculated departmental workload. |
| POST | `/assignments` | admin, zavkaf | Manually assign a free topic while preserving Application and Assignment separately. |
| GET | `/notifications` | Все авторизованные | List only this recipient's persisted notifications. |
| GET | `/study-groups` | Все авторизованные | Read group IDs used when an administrator creates a student. |
| GET | `/academic-periods` | Все авторизованные | Read period IDs used when a supervisor proposes a topic. |
| GET | `/health` | Публичный | Проверка живости для docker healthcheck и мониторинга. |
