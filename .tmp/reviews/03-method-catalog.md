# Каталог существующих методов и HTTP-контрактов

Сгенерировано из рабочей копии: AST определений и зарегистрированная OpenAPI. Унаследованные и автоматически созданные методы не перечислены. Docstring описывает намерение автора, а не доказывает поведение. Тесты, CLI и frontend не входят в область backend/app.

Функций/методов: **132**; классов: **65**; HTTP-операций с учётом алиасов: **51**.

Пересоздать: `uv run python -m backend.scripts.export_method_inventory --output .tmp/reviews/03-method-catalog.md`.

## Зарегистрированные HTTP-операции

| Метод и путь | Operation ID | Документированные HTTP-ответы |
|---|---|---|
| `GET /academic-periods` | `academic_periods_academic_periods_get` | 200, 422 |
| `GET /applications/me` | `my_applications_applications_me_get` | 200, 422 |
| `POST /assignments` | `create_manual_assignment_assignments_post` | 201, 422 |
| `GET /assignments/{assignment_id}/progress-history` | `read_progress_history_assignments__assignment_id__progress_history_get` | 200, 404, 422 |
| `POST /assignments/{assignment_id}/revoke-admission` | `revoke_work_admission_assignments__assignment_id__revoke_admission_post` | 200, 403, 404, 409, 422 |
| `POST /auth/login` | `login_auth_login_post` | 200, 422 |
| `GET /auth/me` | `me_auth_me_get` | 200 |
| `GET /booking-requests` | `booking_requests_booking_requests_get` | 200, 422 |
| `POST /booking-requests/{application_id}/approve` | `approve_request_booking_requests__application_id__approve_post` | 200, 422 |
| `POST /booking-requests/{application_id}/reject` | `reject_request_booking_requests__application_id__reject_post` | 200, 422 |
| `GET /bookings/me` | `my_applications_bookings_me_get` | 200, 422 |
| `GET /dashboard/head` | `read_head_dashboard_dashboard_head_get` | 200, 422 |
| `GET /dashboard/supervisor` | `read_supervisor_dashboard_dashboard_supervisor_get` | 200 |
| `GET /departments` | `list_departments_departments_get` | 200, 422 |
| `GET /health` | `health_health_get` | 200 |
| `POST /login` | `login_login_post` | 200, 422 |
| `GET /me` | `me_me_get` | 200 |
| `GET /notifications` | `my_notifications_notifications_get` | 200, 422 |
| `PATCH /reservations/{application_id}/approve` | `approve_reservation_reservations__application_id__approve_patch` | 200, 422 |
| `PATCH /reservations/{application_id}/reject` | `reject_reservation_reservations__application_id__reject_patch` | 200, 422 |
| `GET /students` | `list_students_students_get` | 200, 422 |
| `POST /students` | `create_student_students_post` | 201, 422 |
| `GET /study-groups` | `study_groups_study_groups_get` | 200, 422 |
| `GET /supervisor/applications` | `list_applications_supervisor_applications_get` | 200, 422 |
| `PATCH /supervisor/applications/{application_id}/approve` | `approve_application_supervisor_applications__application_id__approve_patch` | 200, 422 |
| `PATCH /supervisor/applications/{application_id}/reject` | `reject_application_supervisor_applications__application_id__reject_patch` | 200, 422 |
| `GET /supervisor/assignments` | `list_assignments_supervisor_assignments_get` | 200, 422 |
| `GET /supervisor/assignments/{assignment_id}` | `read_assignment_supervisor_assignments__assignment_id__get` | 200, 422 |
| `PATCH /supervisor/assignments/{assignment_id}/progress` | `update_progress_supervisor_assignments__assignment_id__progress_patch` | 200, 422 |
| `GET /supervisor/dashboard` | `read_supervisor_dashboard_supervisor_dashboard_get` | 200 |
| `GET /supervisor/students` | `list_students_supervisor_students_get` | 200, 422 |
| `GET /supervisor/students/{student_id}` | `read_student_supervisor_students__student_id__get` | 200, 422 |
| `GET /supervisor/works` | `supervisor_works_supervisor_works_get` | 200, 422 |
| `GET /supervisors` | `list_supervisors_supervisors_get` | 200, 422 |
| `POST /supervisors` | `create_supervisor_supervisors_post` | 201, 422 |
| `PATCH /supervisors/{supervisor_id}/limit` | `change_supervisor_limit_supervisors__supervisor_id__limit_patch` | 200, 422 |
| `GET /topics` | `list_topics_topics_get` | 200, 422 |
| `POST /topics` | `create_topics_post` | 201, 422 |
| `GET /topics/deletion-requests` | `list_deletion_requests_topics_deletion_requests_get` | 200, 422 |
| `PATCH /topics/deletion-requests/{request_id}/approve` | `approve_deletion_request_topics_deletion_requests__request_id__approve_patch` | 200, 422 |
| `PATCH /topics/deletion-requests/{request_id}/reject` | `reject_deletion_request_topics_deletion_requests__request_id__reject_patch` | 200, 422 |
| `GET /topics/{topic_id}` | `read_topic_topics__topic_id__get` | 200, 422 |
| `POST /topics/{topic_id}/applications` | `apply_for_topic_topics__topic_id__applications_post` | 201, 422 |
| `POST /topics/{topic_id}/bookings` | `book_topic_topics__topic_id__bookings_post` | 201, 422 |
| `POST /topics/{topic_id}/deletion-requests` | `request_deletion_topics__topic_id__deletion_requests_post` | 201, 422 |
| `PATCH /topics/{topic_id}/status` | `update_status_topics__topic_id__status_patch` | 200, 422 |
| `PATCH /users/{user_id}/department` | `assign_department_users__user_id__department_patch` | 200, 422 |
| `PATCH /users/{user_id}/role` | `assign_role_users__user_id__role_patch` | 200, 422 |
| `GET /workload/supervisors` | `read_workload_workload_supervisors_get` | 200, 422 |
| `GET /works/me` | `my_works_works_me_get` | 200, 422 |
| `PATCH /works/{assignment_id}/progress` | `change_work_progress_works__assignment_id__progress_patch` | 200, 422 |

## backend/app/api/accounts.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [new_user](../../backend/app/api/accounts.py#L36) | `new_user(data: AccountCreate, role: UserRole) -> User` | Construct an account without accepting client-supplied privileges. |
| [managed_target](../../backend/app/api/accounts.py#L50) | `managed_target(db: Session, user_id: int, actor: User) -> User` | Lock the target identity and check department boundaries before modifications. |
| [create_student](../../backend/app/api/accounts.py#L68) | `create_student(data: StudentCreate, db: DbSession, actor: Manager) -> UserResponse` | Create a student and group/department links atomically within the manager's scope. |
| [create_supervisor](../../backend/app/api/accounts.py#L84) | `create_supervisor(data: SupervisorCreate, db: DbSession, actor: Manager) -> UserResponse` | Create a nauchruk account and its teacher-domain profile atomically. |
| [list_students](../../backend/app/api/accounts.py#L100) | `list_students(db: DbSession, actor: Manager, offset: Annotated[int, Query(ge=0)]=0, limit: Annotated[int, Query(ge=1, le=100)]=50) -> list[UserResponse]` | List active students; department heads see only their department. |
| [list_supervisors](../../backend/app/api/accounts.py#L124) | `list_supervisors(db: DbSession, user: CurrentUser, offset: Annotated[int, Query(ge=0)]=0, limit: Annotated[int, Query(ge=1, le=100)]=50) -> list[UserResponse]` | List available supervisors in the caller's department; admins see all. |
| [list_departments](../../backend/app/api/accounts.py#L153) | `list_departments(db: DbSession, user: CurrentUser, offset: Annotated[int, Query(ge=0)]=0, limit: Annotated[int, Query(ge=1, le=100)]=50) -> list[DepartmentResponse]` | Return the department directory to authenticated users. |
| [assign_department](../../backend/app/api/accounts.py#L169) | `assign_department(user_id: int, data: DepartmentUpdate, db: DbSession, actor: Manager) -> UserResponse` | Assign a profile's department; only admins may transfer between departments. |
| [assign_role](../../backend/app/api/accounts.py#L190) | `assign_role(user_id: int, data: RoleUpdate, db: DbSession, actor: Administrator) -> UserResponse` | Assign roles as admin, retaining profiles and preventing self-demotion. |

## backend/app/api/auth.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [cooldown_error](../../backend/app/api/auth.py#L21) | `cooldown_error(seconds: int) -> HTTPException` | Return a retryable login denial with a standard countdown header. |
| [login](../../backend/app/api/auth.py#L31) | `login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbSession, response: Response) -> TokenResponse` | Authenticate with email in username; lock the account after three failed attempts. |
| [me](../../backend/app/api/auth.py#L87) | `me(user: CurrentUser) -> UserResponse` | Return the authenticated account's current role and department, without credentials. |

## backend/app/api/read_models.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [my_applications](../../backend/app/api/read_models.py#L37) | `my_applications(db: DbSession, actor: Student, application_status: StatusFilter=None, offset: Offset=0, limit: Limit=50) -> list[StudentApplicationResponse]` | Read only the current student's requests, including decisions and deadlines. |
| [booking_requests](../../backend/app/api/read_models.py#L50) | `booking_requests(db: DbSession, actor: Reviewer, application_status: StatusFilter=None, offset: Offset=0, limit: Limit=50) -> list[StudentApplicationResponse]` | Supervisors see owned topics, heads their department, and admins all requests. |
| [book_topic](../../backend/app/api/read_models.py#L67) | `book_topic(topic_id: int, data: ApplicationCreate, db: DbSession, actor: Student) -> StudentApplicationResponse` | Compatibility path for submitting an Application; no separate Booking entity. |
| [approve_request](../../backend/app/api/read_models.py#L80) | `approve_request(application_id: int, decision: ApplicationDecision, db: DbSession, actor: Supervisor) -> StudentApplicationResponse` | Delegate to the existing transactional ownership and workload checks. |
| [reject_request](../../backend/app/api/read_models.py#L93) | `reject_request(application_id: int, decision: ApplicationDecision, db: DbSession, actor: Supervisor) -> StudentApplicationResponse` | Reject through the existing service, preserving the student-topic cooldown. |
| [read_supervisor_dashboard](../../backend/app/api/read_models.py#L107) | `read_supervisor_dashboard(db: DbSession, actor: Supervisor) -> SupervisorDashboard` | Read the supervisor's load, counters, and recent application/assignment cards. |
| [read_head_dashboard](../../backend/app/api/read_models.py#L114) | `read_head_dashboard(db: DbSession, actor: Head, department_id: DepartmentFilter=None) -> HeadDashboard` | Read departmental counters; admins must specify department_id. |
| [read_workload](../../backend/app/api/read_models.py#L128) | `read_workload(db: DbSession, actor: Head, department_id: DepartmentFilter=None, offset: Offset=0, limit: Limit=50) -> list[SupervisorWorkload]` | Read real active load and free places for the authorized department. |

## backend/app/api/supervisor.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [list_applications](../../backend/app/api/supervisor.py#L34) | `list_applications(db: DbSession, actor: Supervisor, application_status: Annotated[ApplicationStatus \| None, Query(alias='status')]=None, offset: Annotated[int, Query(ge=0)]=0, limit: Annotated[int, Query(ge=1, le=100)]=50) -> list[ApplicationResponse]` | List applications submitted for the supervisor's topics. |
| [list_assignments](../../backend/app/api/supervisor.py#L46) | `list_assignments(db: DbSession, actor: Supervisor, assignment_status: Annotated[AssignmentStatus \| None, Query(alias='status')]=None, offset: Annotated[int, Query(ge=0)]=0, limit: Annotated[int, Query(ge=1, le=100)]=50) -> list[AssignmentDetail]` | List only the current supervisor's assignments. |
| [read_assignment](../../backend/app/api/supervisor.py#L58) | `read_assignment(assignment_id: int, db: DbSession, actor: Supervisor) -> AssignmentDetail` | Return an owned assignment or 404 without disclosing another supervisor's data. |
| [list_students](../../backend/app/api/supervisor.py#L64) | `list_students(db: DbSession, actor: Supervisor, offset: Annotated[int, Query(ge=0)]=0, limit: Annotated[int, Query(ge=1, le=100)]=50) -> list[StudentSummary]` | List students attached to this supervisor through noncancelled assignments. |
| [read_student](../../backend/app/api/supervisor.py#L75) | `read_student(student_id: int, db: DbSession, actor: Supervisor) -> StudentDetail` | Read a student profile and only this supervisor's assignments. |
| [approve_application](../../backend/app/api/supervisor.py#L81) | `approve_application(application_id: int, decision: ApplicationDecision, db: DbSession, actor: Supervisor) -> ApplicationResponse` | Approve a pending application and create its active assignment. |
| [reject_application](../../backend/app/api/supervisor.py#L92) | `reject_application(application_id: int, decision: ApplicationDecision, db: DbSession, actor: Supervisor) -> ApplicationResponse` | Reject a pending application and release the topic. |
| [update_progress](../../backend/app/api/supervisor.py#L103) | `update_progress(assignment_id: int, data: AssignmentProgressUpdate, db: DbSession, actor: Supervisor) -> Assignment` | Update the work stage and completion percentage. |

## backend/app/api/topics.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [create](../../backend/app/api/topics.py#L46) | `create(data: TopicCreate, db: DbSession, actor: TopicManager) -> Topic` | Create an owned topic; department-head company topics are published immediately. |
| [list_topics](../../backend/app/api/topics.py#L52) | `list_topics(db: DbSession, actor: CurrentUser, topic_status: Annotated[TopicStatus \| None, Query(alias='status')]=None, period_id: Annotated[int \| None, Query(gt=0)]=None, department_id: Annotated[int \| None, Query(gt=0)]=None, supervisor_id: Annotated[int \| None, Query(gt=0)]=None, offset: Annotated[int, Query(ge=0)]=0, limit: Annotated[int, Query(ge=1, le=100)]=50) -> list[TopicResponse]` | List only topics visible to the authenticated role. |
| [apply_for_topic](../../backend/app/api/topics.py#L85) | `apply_for_topic(topic_id: int, data: ApplicationCreate, db: DbSession, actor: Student) -> StudentApplicationResponse` | Submit a pending topic application for the authenticated student. |
| [update_status](../../backend/app/api/topics.py#L93) | `update_status(topic_id: int, data: TopicStatusUpdate, db: DbSession, actor: Moderator) -> TopicResponse` | Moderate a topic in the moderator's department. |
| [request_deletion](../../backend/app/api/topics.py#L105) | `request_deletion(topic_id: int, data: TopicDeletionRequestCreate, db: DbSession, actor: Annotated[User, Depends(require_roles(UserRole.NAUCHRUK))]) -> TopicDeletionRequestResponse` | Ask the department head to archive one of the supervisor's topics. |
| [list_deletion_requests](../../backend/app/api/topics.py#L118) | `list_deletion_requests(db: DbSession, actor: DeletionViewer, offset: Annotated[int, Query(ge=0)]=0, limit: Annotated[int, Query(ge=1, le=100)]=50) -> list[TopicDeletionRequestResponse]` | List deletion requests within the caller's ownership or department scope. |
| [approve_deletion_request](../../backend/app/api/topics.py#L135) | `approve_deletion_request(request_id: int, data: TopicDeletionDecision, db: DbSession, actor: DeletionReviewer) -> TopicDeletionRequestResponse` | Approve a topic deletion request and archive the topic. |
| [reject_deletion_request](../../backend/app/api/topics.py#L151) | `reject_deletion_request(request_id: int, data: TopicDeletionDecision, db: DbSession, actor: DeletionReviewer) -> TopicDeletionRequestResponse` | Reject a topic deletion request without changing the topic. |
| [read_topic](../../backend/app/api/topics.py#L164) | `read_topic(topic_id: int, db: DbSession, actor: CurrentUser) -> TopicResponse` | Return one visible topic. |

## backend/app/api/workflows.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [supervisor_works](../../backend/app/api/workflows.py#L57) | `supervisor_works(db: DbSession, actor: Supervisor, work_status: Annotated[AssignmentStatus \| None, Query(alias='status')]=None, offset: Offset=0, limit: Limit=50) -> list[AssignmentDetail]` | Read assigned students, topics, stages and percentages owned by this supervisor. |
| [approve_reservation](../../backend/app/api/workflows.py#L69) | `approve_reservation(application_id: int, data: ApplicationDecision, db: DbSession, actor: DecisionActor) -> StudentApplicationResponse` | Approve as owner or department head; capacity checks cannot be bypassed. |
| [reject_reservation](../../backend/app/api/workflows.py#L82) | `reject_reservation(application_id: int, data: ApplicationDecision, db: DbSession, actor: DecisionActor) -> StudentApplicationResponse` | Release a pending reservation and persist an in-app notification for its student. |
| [change_work_progress](../../backend/app/api/workflows.py#L95) | `change_work_progress(assignment_id: int, data: AssignmentProgressUpdate, db: DbSession, actor: Supervisor) -> AssignmentResponse` | Update an owned work; admission to defense forces the completion percentage to 100. |
| [change_supervisor_limit](../../backend/app/api/workflows.py#L108) | `change_supervisor_limit(supervisor_id: int, data: SupervisorLimitUpdate, db: DbSession, actor: Manager) -> LimitUpdateResponse` | Change a scoped supervisor limit and return recalculated departmental workload. |
| [create_manual_assignment](../../backend/app/api/workflows.py#L119) | `create_manual_assignment(data: ManualAssignmentCreate, db: DbSession, actor: Manager) -> AssignmentResponse` | Manually assign a free topic while preserving Application and Assignment separately. |
| [my_notifications](../../backend/app/api/workflows.py#L129) | `my_notifications(db: DbSession, actor: CurrentUser, offset: Offset=0, limit: Limit=50) -> list[NotificationResponse]` | List only this recipient's persisted notifications. |
| [revoke_work_admission](../../backend/app/api/workflows.py#L157) | `revoke_work_admission(assignment_id: int, data: AdmissionRevocation, db: DbSession, actor: Manager) -> AssignmentDetail` | Revoke admission in the manager's scope with a mandatory audited explanation. |
| [read_progress_history](../../backend/app/api/workflows.py#L169) | `read_progress_history(assignment_id: int, db: DbSession, actor: CurrentUser) -> list[ProgressHistoryEntry]` | Read the saved timeline as owner, student, department head or administrator. |
| [my_works](../../backend/app/api/workflows.py#L177) | `my_works(db: DbSession, actor: Annotated[User, Depends(require_roles(UserRole.STUDENT))], offset: Offset=0, limit: Limit=50) -> list[AssignmentDetail]` | Read the current student's assignments and progress. |
| [study_groups](../../backend/app/api/workflows.py#L188) | `study_groups(db: DbSession, actor: CurrentUser, offset: Offset=0, limit: Limit=50) -> list[StudyGroupResponse]` | Read group IDs used when an administrator creates a student. |
| [academic_periods](../../backend/app/api/workflows.py#L204) | `academic_periods(db: DbSession, actor: CurrentUser, offset: Offset=0, limit: Limit=50) -> list[PeriodResponse]` | Read period IDs used when a supervisor proposes a topic. |

## backend/app/db.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [get_db](../../backend/app/db.py#L36) | `get_db() -> Iterator[Session]` | FastAPI-зависимость: сессия на запрос, гарантированное закрытие. |

## backend/app/dependencies.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [get_current_user](../../backend/app/dependencies.py#L20) | `get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: DbSession) -> User` | Read current activity and role from the database on every authenticated request. |
| [require_roles](../../backend/app/dependencies.py#L44) | `require_roles(*roles: UserRole) -> Callable[..., User]` | Build a dependency that rejects authenticated users outside the allowed roles. |
| [require_roles.check_role](../../backend/app/dependencies.py#L47) | `require_roles.check_role(user: CurrentUser) -> User` | — |

## backend/app/main.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [health](../../backend/app/main.py#L32) | `health() -> dict[str, str]` | Проверка живости для docker healthcheck и мониторинга. |

## backend/app/models/accounts.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [User](../../backend/app/models/accounts.py#L31) | `class User` | Учётная запись: то, чем человек логинится. |
| [User.__repr__](../../backend/app/models/accounts.py#L78) | `User.__repr__(self) -> str` | — |
| [Student](../../backend/app/models/accounts.py#L87) | `class Student` | Профиль студента. |
| [Student.__repr__](../../backend/app/models/accounts.py#L126) | `Student.__repr__(self) -> str` | — |
| [Teacher](../../backend/app/models/accounts.py#L130) | `class Teacher` | Профиль преподавателя — потенциального научного руководителя. |
| [Teacher.__repr__](../../backend/app/models/accounts.py#L172) | `Teacher.__repr__(self) -> str` | — |

## backend/app/models/base.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [Base](../../backend/app/models/base.py#L25) | `class Base` | Базовый класс всех ORM-моделей проекта. |
| [IdMixin](../../backend/app/models/base.py#L31) | `class IdMixin` | Суррогатный первичный ключ. |
| [TimestampMixin](../../backend/app/models/base.py#L47) | `class TimestampMixin` | Даты создания и изменения записи. |

## backend/app/models/enums.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [UserRole](../../backend/app/models/enums.py#L23) | `class UserRole` | Роль пользователя в системе. |
| [PeriodStatus](../../backend/app/models/enums.py#L32) | `class PeriodStatus` | Состояние периода выбора тем. |
| [Semester](../../backend/app/models/enums.py#L41) | `class Semester` | Семестр учебного года. |
| [TopicStatus](../../backend/app/models/enums.py#L48) | `class TopicStatus` | Жизненный цикл темы. |
| [TopicArchiveReason](../../backend/app/models/enums.py#L57) | `class TopicArchiveReason` | Why a topic was moved to the archive. |
| [TopicDeletionRequestStatus](../../backend/app/models/enums.py#L65) | `class TopicDeletionRequestStatus` | Lifecycle of a supervisor's topic deletion request. |
| [TopicSource](../../backend/app/models/enums.py#L73) | `class TopicSource` | Кто предложил тему. |
| [ApplicationStatus](../../backend/app/models/enums.py#L81) | `class ApplicationStatus` | Статус заявки студента на тему. |
| [AssignmentStatus](../../backend/app/models/enums.py#L91) | `class AssignmentStatus` | Статус итогового закрепления темы за студентом. |
| [AssignmentStage](../../backend/app/models/enums.py#L99) | `class AssignmentStage` | Current stage of the graduation work. |
| [NotificationKind](../../backend/app/models/enums.py#L108) | `class NotificationKind` | Workflow event names stored in recipient notifications. |
| [db_enum](../../backend/app/models/enums.py#L116) | `db_enum(enum_cls: type[StrEnum], name: str, length: int=32) -> Enum` | Собирает VARCHAR + CHECK колонку из Python-перечисления. |

## backend/app/models/misc.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [Attachment](../../backend/app/models/misc.py#L30) | `class Attachment` | Файл, прикреплённый к теме или к заявке. |
| [Notification](../../backend/app/models/misc.py#L73) | `class Notification` | Уведомление пользователя. |

## backend/app/models/period.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [AcademicPeriod](../../backend/app/models/period.py#L17) | `class AcademicPeriod` | Учебный период, к которому привязаны темы и заявки. |
| [AcademicPeriod.__repr__](../../backend/app/models/period.py#L58) | `AcademicPeriod.__repr__(self) -> str` | — |

## backend/app/models/refs.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [Faculty](../../backend/app/models/refs.py#L16) | `class Faculty` | Факультет (институт). |
| [Faculty.__repr__](../../backend/app/models/refs.py#L32) | `Faculty.__repr__(self) -> str` | — |
| [Department](../../backend/app/models/refs.py#L36) | `class Department` | Кафедра — подразделение, к которому относятся научные руководители. |
| [Department.__repr__](../../backend/app/models/refs.py#L62) | `Department.__repr__(self) -> str` | — |
| [StudyGroup](../../backend/app/models/refs.py#L66) | `class StudyGroup` | Учебная группа студента. |
| [StudyGroup.__repr__](../../backend/app/models/refs.py#L88) | `StudyGroup.__repr__(self) -> str` | — |

## backend/app/models/topic.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [Topic](../../backend/app/models/topic.py#L35) | `class Topic` | Тема диплома, которую можно взять. |
| [Topic.__repr__](../../backend/app/models/topic.py#L121) | `Topic.__repr__(self) -> str` | — |
| [Topic.is_reserved](../../backend/app/models/topic.py#L125) | `Topic.is_reserved(self) -> bool` | Return whether the topic has an active or completed assignment. |
| [TopicDeletionRequest](../../backend/app/models/topic.py#L132) | `class TopicDeletionRequest` | Request from a supervisor to archive one of their topics. |

## backend/app/models/workflow.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [Application](../../backend/app/models/workflow.py#L30) | `class Application` | Заявка студента на тему. |
| [Application.__repr__](../../backend/app/models/workflow.py#L117) | `Application.__repr__(self) -> str` | — |
| [ApplicationStatusHistory](../../backend/app/models/workflow.py#L121) | `class ApplicationStatusHistory` | История переходов заявки между статусами. |
| [Assignment](../../backend/app/models/workflow.py#L173) | `class Assignment` | Закрепление темы за студентом — итоговый факт. |
| [Assignment.__repr__](../../backend/app/models/workflow.py#L265) | `Assignment.__repr__(self) -> str` | — |
| [AssignmentProgressHistory](../../backend/app/models/workflow.py#L269) | `class AssignmentProgressHistory` | Append-only audit of progress changes and administrative admission revocation. |

## backend/app/schemas/accounts.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [UserResponse](../../backend/app/schemas/accounts.py#L11) | `class UserResponse` | Public identity and the user's current department. |
| [TokenResponse](../../backend/app/schemas/accounts.py#L34) | `class TokenResponse` | Short-lived bearer token returned after a successful login. |
| [AccountCreate](../../backend/app/schemas/accounts.py#L42) | `class AccountCreate` | Identity fields shared by managed student and supervisor creation. |
| [AccountCreate.normalize_email](../../backend/app/schemas/accounts.py#L56) | `AccountCreate.normalize_email(cls, value: str) -> str` | Match the database's case-insensitive login uniqueness. |
| [StudentCreate](../../backend/app/schemas/accounts.py#L61) | `class StudentCreate` | Create a student account with a study group and department. |
| [SupervisorCreate](../../backend/app/schemas/accounts.py#L69) | `class SupervisorCreate` | Create a supervisor account and teaching profile. |
| [RoleUpdate](../../backend/app/schemas/accounts.py#L77) | `class RoleUpdate` | Assign one supported role; only administrators may grant elevated roles. |
| [DepartmentUpdate](../../backend/app/schemas/accounts.py#L84) | `class DepartmentUpdate` | Move a student or supervisor profile into a department. |
| [DepartmentResponse](../../backend/app/schemas/accounts.py#L91) | `class DepartmentResponse` | Public department-directory entry. |

## backend/app/schemas/application.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [ApplicationCreate](../../backend/app/schemas/application.py#L11) | `class ApplicationCreate` | Fields submitted by a student when reserving a topic. |
| [StudentApplicationResponse](../../backend/app/schemas/application.py#L24) | `class StudentApplicationResponse` | Application representation visible to its student. |
| [StudentApplicationResponse.group_name](../../backend/app/schemas/application.py#L48) | `StudentApplicationResponse.group_name(self) -> str` | Expose the group on the application card. |
| [StudentApplicationResponse.justification](../../backend/app/schemas/application.py#L54) | `StudentApplicationResponse.justification(self) -> str \| None` | Keep the UI term and the existing motivation field in sync. |
| [StudentApplicationResponse.status_label](../../backend/app/schemas/application.py#L60) | `StudentApplicationResponse.status_label(self) -> str` | Localize the label without changing the machine-readable status. |

## backend/app/schemas/dashboard.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [AssignmentDetail](../../backend/app/schemas/dashboard.py#L10) | `class AssignmentDetail` | Assignment card with events recorded since progress auditing was introduced. |
| [StudentDetail](../../backend/app/schemas/dashboard.py#L19) | `class StudentDetail` | Student card containing only assignments owned by the current supervisor. |
| [SupervisorWorkload](../../backend/app/schemas/dashboard.py#L26) | `class SupervisorWorkload` | Current active assignments compared with the supervisor's configured limit. |
| [SupervisorDashboard](../../backend/app/schemas/dashboard.py#L40) | `class SupervisorDashboard` | Counters and up to five recent cards for the authenticated supervisor. |
| [TopicCounts](../../backend/app/schemas/dashboard.py#L50) | `class TopicCounts` | Topic counters retain the actual backend lifecycle names. |
| [HeadDashboard](../../backend/app/schemas/dashboard.py#L59) | `class HeadDashboard` | Department-scoped counters for the head dashboard. |

## backend/app/schemas/management.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [SupervisorLimitUpdate](../../backend/app/schemas/management.py#L12) | `class SupervisorLimitUpdate` | New per-supervisor limit; existing active assignments cannot be invalidated. |
| [LimitUpdateResponse](../../backend/app/schemas/management.py#L19) | `class LimitUpdateResponse` | Updated supervisor and freshly calculated workload of the entire department. |
| [ManualAssignmentCreate](../../backend/app/schemas/management.py#L26) | `class ManualAssignmentCreate` | Assign a free published topic without bypassing capacity or department checks. |
| [TopicDeletionRequestCreate](../../backend/app/schemas/management.py#L35) | `class TopicDeletionRequestCreate` | Reason submitted by a supervisor when requesting topic removal. |
| [TopicDeletionDecision](../../backend/app/schemas/management.py#L42) | `class TopicDeletionDecision` | Optional head/admin comment attached to a deletion decision. |
| [TopicDeletionRequestResponse](../../backend/app/schemas/management.py#L49) | `class TopicDeletionRequestResponse` | Topic deletion request and its current decision. |
| [NotificationResponse](../../backend/app/schemas/management.py#L66) | `class NotificationResponse` | Persisted in-app notification belonging to the authenticated recipient. |
| [StudyGroupResponse](../../backend/app/schemas/management.py#L79) | `class StudyGroupResponse` | Study-group directory for managed student creation. |
| [PeriodResponse](../../backend/app/schemas/management.py#L89) | `class PeriodResponse` | Academic period identity needed when proposing a topic. |

## backend/app/schemas/presentation.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [StudentSummary](../../backend/app/schemas/presentation.py#L38) | `class StudentSummary` | Student profile allowlist; id identifies a Student, not a User. |
| [StudentSummary.full_name](../../backend/app/schemas/presentation.py#L67) | `StudentSummary.full_name(self) -> str` | Return a display name without inventing a missing middle name. |
| [TopicSummary](../../backend/app/schemas/presentation.py#L74) | `class TopicSummary` | Topic identity embedded in application and assignment cards. |

## backend/app/schemas/supervisor.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [ApplicationResponse](../../backend/app/schemas/supervisor.py#L17) | `class ApplicationResponse` | A student application visible to its topic supervisor. |
| [ApplicationDecision](../../backend/app/schemas/supervisor.py#L21) | `class ApplicationDecision` | Optional explanation attached to an approval or rejection. |
| [AssignmentResponse](../../backend/app/schemas/supervisor.py#L29) | `class AssignmentResponse` | A supervisor's active or completed student assignment. |
| [AssignmentResponse.group_name](../../backend/app/schemas/supervisor.py#L49) | `AssignmentResponse.group_name(self) -> str` | Expose the group without requiring another API request. |
| [AssignmentResponse.status_label](../../backend/app/schemas/supervisor.py#L55) | `AssignmentResponse.status_label(self) -> str` | Return the display label for the assignment status. |
| [AssignmentResponse.current_stage_label](../../backend/app/schemas/supervisor.py#L61) | `AssignmentResponse.current_stage_label(self) -> str` | Return the display label for the current work stage. |
| [AssignmentProgressUpdate](../../backend/app/schemas/supervisor.py#L66) | `class AssignmentProgressUpdate` | A validated progress update for an assignment. |
| [AdmissionRevocation](../../backend/app/schemas/supervisor.py#L79) | `class AdmissionRevocation` | A department decision must explain why the prior admission was revoked. |
| [ProgressHistoryEntry](../../backend/app/schemas/supervisor.py#L86) | `class ProgressHistoryEntry` | Persisted actor, time, before/after state and explanation of a progress change. |

## backend/app/schemas/topic.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [TopicCreate](../../backend/app/schemas/topic.py#L11) | `class TopicCreate` | Fields used to create a topic; ownership is checked by the service. |
| [TopicCreate.validate_company_source](../../backend/app/schemas/topic.py#L26) | `TopicCreate.validate_company_source(self) -> 'TopicCreate'` | A company name is meaningful only for company-proposed topics. |
| [TopicStatusUpdate](../../backend/app/schemas/topic.py#L39) | `class TopicStatusUpdate` | A moderation status transition. |
| [TopicResponse](../../backend/app/schemas/topic.py#L47) | `class TopicResponse` | Public topic representation. |
| [TopicResponse.status_label](../../backend/app/schemas/topic.py#L74) | `TopicResponse.status_label(self) -> str` | Display a localized label while preserving the existing status enum. |
| [TopicResponse.source_label](../../backend/app/schemas/topic.py#L84) | `TopicResponse.source_label(self) -> str` | Display the origin of the topic for catalog users. |

## backend/app/security.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [signing_key](../../backend/app/security.py#L20) | `signing_key() -> str` | Fail closed when the deployment has no sufficiently long signing secret. |
| [hash_password](../../backend/app/security.py#L30) | `hash_password(password: str) -> str` | Hash a new password with Argon2id. |
| [verify_password](../../backend/app/security.py#L35) | `verify_password(password: str, encoded: str) -> bool` | Verify supported hashes; malformed or unsupported hashes never authenticate. |
| [create_access_token](../../backend/app/security.py#L43) | `create_access_token(user_id: int) -> str` | Issue an expiring token containing identity, not cached authorization roles. |
| [decode_access_token](../../backend/app/security.py#L59) | `decode_access_token(token: str) -> int` | Validate signature, algorithm, required claims, issuer, audience and subject. |

## backend/app/services/accounts.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [department_id](../../backend/app/services/accounts.py#L11) | `department_id(user: User) -> int \| None` | Resolve the department from the account's domain profile. |
| [public_user](../../backend/app/services/accounts.py#L20) | `public_user(user: User) -> UserResponse` | Build the API allowlist without exposing password hashes or cooldown state. |
| [check_department_scope](../../backend/app/services/accounts.py#L50) | `check_department_scope(actor: User, target_department_id: int \| None) -> None` | Permit admins globally and department heads only inside their own department. |
| [require_department](../../backend/app/services/accounts.py#L61) | `require_department(db: Session, target_id: int) -> Department` | Load an existing department before assigning a domain profile to it. |
| [check_student_faculty](../../backend/app/services/accounts.py#L69) | `check_student_faculty(db: Session, group_id: int, department: Department) -> None` | Ensure the student's group and department belong to the same faculty. |
| [commit_account](../../backend/app/services/accounts.py#L78) | `commit_account(db: Session, user: User) -> UserResponse` | Commit user/profile writes together; turn uniqueness races into a conflict. |
| [check_role_profile](../../backend/app/services/accounts.py#L91) | `check_role_profile(user: User, role: UserRole) -> None` | Keep role changes consistent with existing, retained domain profiles. |

## backend/app/services/application.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [application_deadline](../../backend/app/services/application.py#L27) | `application_deadline(created_at: datetime) -> datetime` | Return the configured decision deadline for an application. |
| [expire_overdue_applications](../../backend/app/services/application.py#L33) | `expire_overdue_applications(db: Session, now: datetime \| None=None) -> int` | Expire pending applications and archive their topics. |
| [refresh_expired_applications](../../backend/app/services/application.py#L73) | `refresh_expired_applications(db: Session) -> None` | Persist lazy expiration as a command, outside read-only projections. |
| [create_application](../../backend/app/services/application.py#L79) | `create_application(db: Session, actor: User, topic_id: int, data: ApplicationCreate) -> Application` | Create one pending application for the authenticated student. |
| [student_topic_query](../../backend/app/services/application.py#L172) | `student_topic_query(actor: User) -> Select[tuple[Topic]]` | Return published topics not blocked by this student's cooldown. |

## backend/app/services/management.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [update_limit](../../backend/app/services/management.py#L37) | `update_limit(db: Session, actor: User, teacher_id: int, maximum: int) -> LimitUpdateResponse` | Lock the same teacher row used by approvals and recalculate department workload. |
| [manually_assign](../../backend/app/services/management.py#L72) | `manually_assign(db: Session, actor: User, data: ManualAssignmentCreate) -> Assignment` | Assign as a manager even in a closed period; capacity/scope still apply. |

## backend/app/services/read_models.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [application_query](../../backend/app/services/read_models.py#L34) | `application_query() -> Select[tuple[Application]]` | Load only the relationships needed by the public application contract. |
| [assignment_query](../../backend/app/services/read_models.py#L43) | `assignment_query() -> Select[tuple[Assignment]]` | Load students and topic cards together to avoid a query per row. |
| [assignment_progress_history](../../backend/app/services/read_models.py#L53) | `assignment_progress_history(db: Session, actor: User, assignment_id: int) -> list[ProgressHistoryEntry]` | Read history only within the caller's assignment/department scope. |
| [visible_applications](../../backend/app/services/read_models.py#L76) | `visible_applications(db: Session, actor: User, status_filter: ApplicationStatus \| None, offset: int, limit: int) -> list[StudentApplicationResponse]` | Students see their own requests; supervisors own topics; heads their department. |
| [supervisor_assignments](../../backend/app/services/read_models.py#L109) | `supervisor_assignments(db: Session, actor: User, offset: int, limit: int, status_filter: AssignmentStatus \| None=None) -> list[AssignmentDetail]` | Read only assignments owned by the caller, including completed history. |
| [student_assignments](../../backend/app/services/read_models.py#L131) | `student_assignments(db: Session, actor: User, offset: int, limit: int) -> list[AssignmentDetail]` | Read the current student's assignments and progress. |
| [supervisor_assignment](../../backend/app/services/read_models.py#L151) | `supervisor_assignment(db: Session, actor: User, assignment_id: int) -> AssignmentDetail` | Use an ownership-filtered lookup; other supervisors' IDs are not disclosed. |
| [supervisor_students](../../backend/app/services/read_models.py#L164) | `supervisor_students(db: Session, actor: User, offset: int, limit: int) -> list[StudentSummary]` | List students with a noncancelled assignment to this supervisor. |
| [supervisor_student](../../backend/app/services/read_models.py#L187) | `supervisor_student(db: Session, actor: User, student_id: int) -> StudentDetail` | Never return assignments belonging to a different supervisor on a student card. |
| [workload_query](../../backend/app/services/read_models.py#L212) | `workload_query() -> Select[tuple[Teacher, int]]` | Count active assignments once and retain supervisors with zero load. |
| [workload_card](../../backend/app/services/read_models.py#L235) | `workload_card(teacher: Teacher, load: int) -> SupervisorWorkload` | Build workload cards without exposing internal account fields. |
| [scoped_department](../../backend/app/services/read_models.py#L253) | `scoped_department(db: Session, actor: User, requested_id: int \| None) -> Department` | Heads are fixed to their department; admins must explicitly select one. |
| [department_workload](../../backend/app/services/read_models.py#L265) | `department_workload(db: Session, actor: User, department_id: int \| None, offset: int, limit: int) -> list[SupervisorWorkload]` | Return a bounded workload table in the head's authorized department. |
| [supervisor_dashboard](../../backend/app/services/read_models.py#L286) | `supervisor_dashboard(db: Session, actor: User) -> SupervisorDashboard` | Aggregate the supervisor's own persisted records without changing state. |
| [head_dashboard](../../backend/app/services/read_models.py#L327) | `head_dashboard(db: Session, actor: User, department_id: int \| None) -> HeadDashboard` | Aggregate a single authorized department; counts are independent of pagination. |

## backend/app/services/supervisor.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [require_supervisor_profile](../../backend/app/services/supervisor.py#L49) | `require_supervisor_profile(actor: User) -> Teacher` | Return the domain profile required by supervisor endpoints. |
| [supervisor_applications](../../backend/app/services/supervisor.py#L56) | `supervisor_applications(db: Session, actor: User, status_filter: ApplicationStatus \| None=None, offset: int=0, limit: int=50) -> list[Application]` | List applications for topics owned by the current supervisor. |
| [decide_application](../../backend/app/services/supervisor.py#L83) | `decide_application(db: Session, actor: User, application_id: int, decision: ApplicationDecision, *, approve: bool) -> Application` | Approve or reject one pending application atomically. |
| [update_assignment_progress](../../backend/app/services/supervisor.py#L176) | `update_assignment_progress(db: Session, actor: User, assignment_id: int, data: AssignmentProgressUpdate) -> Assignment` | Update progress only for an assignment owned by the current supervisor. |
| [revoke_admission](../../backend/app/services/supervisor.py#L243) | `revoke_admission(db: Session, actor: User, assignment_id: int, comment: str) -> Assignment` | Allow a scoped manager to return an admitted active work to review, with audit. |

## backend/app/services/topic.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [create_topic_deletion_request](../../backend/app/services/topic.py#L31) | `create_topic_deletion_request(db: Session, actor: User, topic_id: int, reason: str \| None) -> TopicDeletionRequest` | Create one pending deletion request for the supervisor's own topic. |
| [decide_topic_deletion_request](../../backend/app/services/topic.py#L63) | `decide_topic_deletion_request(db: Session, actor: User, request_id: int, comment: str \| None, *, approve: bool) -> TopicDeletionRequest` | Approve or reject a deletion request within the actor's scope. |
| [topic_deletion_requests](../../backend/app/services/topic.py#L130) | `topic_deletion_requests(db: Session, actor: User, offset: int, limit: int) -> list[TopicDeletionRequest]` | List deletion requests visible to a supervisor, head, or admin. |
| [require_period](../../backend/app/services/topic.py#L152) | `require_period(db: Session, period_id: int) -> AcademicPeriod` | Load the period referenced by a topic. |
| [require_teacher](../../backend/app/services/topic.py#L160) | `require_teacher(db: Session, teacher_id: int) -> Teacher` | Load a supervisor profile. |
| [require_department](../../backend/app/services/topic.py#L168) | `require_department(db: Session, department_id_value: int) -> Department` | Load a topic department. |
| [check_topic_scope](../../backend/app/services/topic.py#L176) | `check_topic_scope(actor: User, topic: Topic) -> None` | Ensure an actor can see or moderate a topic. |
| [create_topic](../../backend/app/services/topic.py#L187) | `create_topic(db: Session, data: TopicCreate, actor: User) -> Topic` | Validate ownership and construct a draft topic. |
| [topic_query](../../backend/app/services/topic.py#L246) | `topic_query(actor: User, *, status_filter: TopicStatus \| None=None) -> Select[tuple[Topic]]` | Build the visibility query shared by list and detail endpoints. |
| [get_topic](../../backend/app/services/topic.py#L264) | `get_topic(db: Session, actor: User, topic_id: int) -> Topic` | Load a topic only when it is visible to the caller. |
| [moderate_topic](../../backend/app/services/topic.py#L279) | `moderate_topic(db: Session, actor: User, topic_id: int, data: TopicStatusUpdate) -> Topic` | Publish, reject, or archive a topic inside the moderator's department. |

## backend/app/services/workflow.py

| Определение | Сигнатура | Назначение из docstring |
|---|---|---|
| [check_workflow_scope](../../backend/app/services/workflow.py#L24) | `check_workflow_scope(actor: User, topic: Topic) -> None` | Authorize a supervisor's own topic or a head's department. |
| [lock_student](../../backend/app/services/workflow.py#L37) | `lock_student(db: Session, student_id: int) -> Student` | Lock the student before topics/applications to serialize their commands. |
| [withdraw_other_applications](../../backend/app/services/workflow.py#L50) | `withdraw_other_applications(db: Session, student_id: int, actor_id: int, now: datetime, *, keep_application_id: int \| None=None) -> None` | Release other reservations under the student's lock; caller commits atomically. |
| [lock_assignment_capacity](../../backend/app/services/workflow.py#L85) | `lock_assignment_capacity(db: Session, topic: Topic, student_id: int) -> Teacher` | Check capacity with student and topic already locked by the caller. |
| [commit_workflow](../../backend/app/services/workflow.py#L143) | `commit_workflow(db: Session) -> None` | Translate uniqueness races into an API conflict and roll back all changes. |
