# Authentication and managed accounts

## Deployment

1. Run `uv sync`.
2. Set a randomly generated `SECRET_KEY` of at least 32 bytes in the ignored local
   environment file or deployment secrets. Never commit the actual secret.
3. Apply `uv run alembic upgrade head`.
4. Create the first administrator with `uv run python -m scripts.create_admin`.
   The command prompts for the identity and password; it does not promote an existing user.
5. Start the existing development server and use its Swagger UI at `/docs`.

Authentication fails closed with HTTP 503 if the signing secret is missing or too short.
Changing the secret invalidates all outstanding tokens. Use HTTPS outside local development.

## API

| Method | Path | Access and behavior |
| --- | --- | --- |
| POST | /login | OAuth2 form: username is email, plus password; returns a bearer JWT |
| GET | /me | Any active authenticated account; returns its current role and department |
| GET | /departments | Any active authenticated account; paginated department directory |
| POST | /students | Admin globally, zavkaf within own department; creates user and student profile |
| GET | /students | Admin globally, zavkaf within own department; active students only |
| POST | /supervisors | Admin globally, zavkaf within own department; creates user and teacher profile |
| GET | /supervisors | Active, available supervisors in the caller's department; admin sees all |
| PATCH | /users/{user_id}/department | Admin may move profiles; zavkaf may manage ordinary accounts only within their existing department |
| PATCH | /users/{user_id}/role | Admin only; checks compatible profiles and rejects self-demotion |

Send protected requests with `Authorization: Bearer <access_token>`.
List endpoints accept `offset` (default 0) and `limit` (default 50, maximum 100).

New accounts require email, password (12–128 characters), first_name, last_name, and
department_id. Student creation also requires group_id and accepts record_book_number and
admission_year. Supervisor creation accepts position, academic_degree, and max_students.
New passwords use Argon2id; existing Argon2 and bcrypt hashes can be verified.

Creation assigns a fixed role: student or nauchruk. It does not accept a role field.
To appoint a department head, create a supervisor and have an administrator set its role
to zavkaf. Only administrators can grant admin or zavkaf. Students and supervisors cannot
create users, change roles, or change their department. They can access their own identity.

Roles are admin, zavkaf, nauchruk, student. The Teacher database model remains the supervisor
profile. A student role requires a student profile; nauchruk/zavkaf require a teacher profile.
Changing a role does not create or delete profiles and cannot convert a student into a
supervisor. Admin accounts may retain an existing domain profile.

Student groups and departments must belong to the same faculty. Existing students receive
a nullable department link because faculty alone does not identify their department; admins
must assign it explicitly. Unassigned students see an empty supervisor list.

## Login policy

- Email matching is case-insensitive.
- Attempts one and two with a wrong password return 401.
- The third consecutive wrong password starts a cooldown and returns 429 with Retry-After.
- During cooldown, even the correct password returns 429. Attempts do not extend the timer.
- After expiry, the failure count starts again. Successful login clears the failure state.
- Login state is stored in PostgreSQL, with SELECT FOR UPDATE serializing attempts across workers.
- Unknown emails and inactive users receive the same generic 401 message; unknown emails
  still perform dummy password verification. Lockout is per existing active account, not
  an IP-based rate limiter. Deliberate attempts can therefore temporarily lock a known account.
- Invalid credentials never return a token. Responses never include password hashes or counters.
- A login cooldown prevents new logins; it does not revoke existing valid access tokens.

Access tokens expire after ACCESS_TOKEN_EXPIRE_MINUTES (default 30). The cooldown lasts
LOGIN_COOLDOWN_MINUTES (default 15); both settings must be positive. The failure threshold is 3.
JWT signature, algorithm, expiry, issuance time, issuer, audience, and subject are validated.
Roles and active status are loaded from the database on every authenticated request, so
existing tokens cannot retain a removed role and inactive accounts cannot continue using them.
There is no refresh-token or logout/revocation endpoint in this change.

## Migration and checks

The migration renames stored teacher roles to nauchruk without deleting accounts or profiles.
Downgrading removes the new login and student-department fields and maps nauchruk and zavkaf
back to teacher; it therefore loses the distinction between supervisor and department head.

Run `uv run pytest` for the authentication and authorization tests.
SQLite API tests validate request behavior and state persistence, not PostgreSQL row-lock
semantics. PostgreSQL migration SQL can be rendered with `uv run alembic upgrade head --sql`.
The actual upgrade and concurrency behavior still require verification against PostgreSQL.

Before an approved protected-branch push, follow the [understanding-check preparation](../feature/jwt-authorization.md#understanding-check-preparation).