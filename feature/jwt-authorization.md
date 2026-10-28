# Feature: JWT authorization and managed accounts

## Purpose and current status

This change adds login, authenticated identity, four-role authorization, managed student and
supervisor accounts, department links, and a cooldown after repeated failed logins.

The implementation is complete in the working tree. The migration has **not** been applied to a
live PostgreSQL database. The latest implementation checks passed: **52 tests**, repository Ruff
lint, ORM relationship/schema checks, and PostgreSQL upgrade/downgrade SQL rendering.
API tests use isolated SQLite; they do not prove PostgreSQL concurrency behavior.

## What exactly changed

Paths below are relative to this document.

| File or area | Change |
| --- | --- |
| [Authentication routes](../app/api/auth.py) | Added POST /login and GET /me; persisted failed attempts and cooldown state |
| [Account routes](../app/api/accounts.py) | Added student/supervisor creation and listing, department listing, department assignment, and role assignment |
| [Security helpers](../app/security.py) | Added Argon2id password hashing, existing bcrypt verification, JWT creation and validation |
| [Dependencies](../app/dependencies.py) | Added get_current_user and reusable require_roles dependencies |
| [Account service](../app/services/accounts.py) | Added department scope checks, profile/role checks, faculty consistency, safe public responses, and conflict handling |
| [API schemas](../app/schemas/accounts.py) | Added separate input/output models, field validation, and rejection of unexpected input fields |
| [Application entry point](../app/main.py) | Registered both new routers; the existing health endpoint remains |
| [Account models](../app/models/accounts.py) | Added users.failed_login_attempts, users.locked_until, and students.department_id |
| [Role enum](../app/models/enums.py) | Replaced UserRole.TEACHER with NAUCHRUK and added ZAVKAF; retained STUDENT and ADMIN |
| [Configuration](../app/config.py) | Added token lifetime, cooldown duration, failure threshold, issuer, and audience |
| [Environment example](../.env.example) | Removed the example signing secret; documented the new settings |
| [Alembic migration](../migrations/versions/2b88c9a7d104_authentication_and_departments.py) | Added columns, department foreign key/index, converted teacher roles, and updated the role CHECK constraint |
| [Administrator bootstrap](../scripts/create_admin.py) | Added interactive creation of the first administrator |
| [Tests](../tests/test_authentication.py) and [fixtures](../tests/conftest.py) | Added real JWT/password API tests with an isolated database |
| [Dependencies and tooling](../pyproject.toml), [lockfile](../uv.lock) | Added PyJWT, pwdlib with Argon2/bcrypt, multipart parsing, email validation, pytest, HTTPX, and Ruff; configured tests and lint |
| [ORM models](../app/models/) | Added type-only imports for relationship annotations; these imports do not execute at runtime |
| [Schema check script](../scripts/check_schema.py), [documentation generator](../scripts/dump_docs.py), [SQL generator](../scripts/dump_ddl.py) | Corrected lint issues; normalized whitespace in generated SQL |
| [Data dictionary](../docs/data-dictionary.md), [DBML](../docs/schema.dbml), [ER diagram](../docs/er.md), [SQL reference](../sql/schema.sql) | Updated schema references to match the models |
| [Operational documentation](../docs/authentication.md) | Documented deployment and the API contract |
| [Git ignore rules](../.gitignore) | Excluded local agent instructions, editor/agent configuration, MCP configuration, and Repowise state |

The database session implementation remains synchronous. Routes use ordinary def functions with
Depends(get_db). There is no async-session migration in this change.

The existing Topic → Application → Assignment workflow and its partial unique indexes remain.
There are no new topic-approval, student-assignment, or supervisor-capacity-allocation endpoints.

## Identity, profiles, and departments

A User is the login identity. Student and Teacher are domain profiles linked to that identity.

- Roles are exactly admin, zavkaf, nauchruk, student.
- Teacher is still the database/model name for a supervisor profile.
- A supervisor or department head gets its department from Teacher.department_id.
- A student gets its department from the new Student.department_id.
- An administrator can exist without either domain profile.
- A role change retains existing profiles; it does not create, convert, or delete them.

A student's group and department must belong to the same faculty. A faculty can contain several
departments, so a group/faculty alone cannot tell us which department to assign.

Existing students therefore receive department_id = null during migration. An administrator must
assign their department explicitly. Newly created students must supply department_id and group_id.

## How login and JWT authentication work

### Login sequence

1. The client submits an OAuth2 form to POST /login. The username field contains the email.
2. The server requires a signing secret of at least 32 bytes.
3. The email is stripped and matched case-insensitively against the database.
4. For an existing account, the query uses SELECT FOR UPDATE to serialize login attempts.
5. The server checks whether an active account is still cooling down.
6. It verifies the password hash. New passwords use Argon2id; existing bcrypt is supported.
7. A successful login clears the failure counter/cooldown, records last_login_at, and issues a JWT.
8. Failed attempts for a known active account are committed before returning an error.

Unknown emails and inactive accounts receive the same generic 401 message. Ordinary unknown-email
attempts verify against a dummy password hash. Passwords longer than 128 characters skip expensive
hash verification but still count as failures for an existing active account.

### What is inside the token?

The signed token contains:

| Claim | Meaning |
| --- | --- |
| sub | User ID as a string |
| iat | Issued-at time |
| exp | Expiration time |
| iss | diplomnavigator |
| aud | diplomnavigator-api |

The algorithm is fixed to HS256. Signature, required claims, issuer, audience, expiration,
issued-at validity, and subject format/range are checked.

**The token does not carry an authoritative role.** On every protected request, get_current_user
loads the user, current role, profiles, and active state from the database.

A signed JWT is not encrypted. Treat the complete bearer token as a credential.

### Protected-request sequence

Authorization: Bearer <token> → validate JWT → load current user → reject missing/inactive account
→ check allowed roles → check department/profile rules → perform the operation.

Consequences:

- A department head demoted to nauchruk loses department-head access on subsequent requests,
  even when using a token issued before the demotion.
- Deactivating an account rejects its existing tokens on subsequent requests.
- An expired, wrongly signed, malformed, or wrong-audience token is rejected.
- Rotating SECRET_KEY invalidates previously signed tokens.
- There is no refresh-token endpoint or logout/revocation endpoint in this change.

## Cooldown: worked examples

Defaults: **3 consecutive failures**, **15-minute cooldown**, **30-minute access token**.

Assume the account exists, is active, and starts with no failures:

| Time | Request | Result | Stored state |
| --- | --- | --- | --- |
| 09:00:00 | Wrong password | 401 | failures = 1 |
| 09:00:10 | Wrong password | 401 | failures = 2 |
| 09:00:20 | Wrong password | 429, Retry-After: 900 | failures = 3; locked until 09:15:20 |
| 09:05:00 | Correct password | 429 with remaining seconds | Original deadline retained |
| 09:10:00 | Wrong password | 429 with remaining seconds | Deadline is not extended |
| 09:16:00 | Correct password | 200 and a JWT | failures = 0; locked_until = null |

Separate sequences:

- Wrong → wrong → correct: success resets the count; the next wrong attempt is failure 1.
- Expired cooldown → wrong: a new sequence starts at failure 1.
- Unknown email → wrong repeatedly: generic 401; no nonexistent account gets a persisted counter.
- Inactive account with a stored cooldown: generic 401, not a cooldown disclosure.
- Existing valid JWT → three failed new logins → GET /me using that JWT: still allowed until
  token expiry, account deactivation, or another relevant authorization change.

**A login cooldown prevents new logins. It does not revoke existing tokens.**

The counter is stored in the database, so restarting the API does not clear it. The row lock is
intended to prevent simultaneous failures from overwriting each other's increments in PostgreSQL.
That concurrency guarantee has not yet been verified with live PostgreSQL tests.

This is per-account lockout, not an IP-wide rate limiter. Someone who knows an email can
deliberately trigger that account's temporary cooldown.

## Endpoints and permissions

All account/directory endpoints require a valid token from an active user.

| Method and path | Admin | Zavkaf | Nauchruk / student |
| --- | --- | --- | --- |
| POST /login | Login | Login | Login |
| GET /me | Own identity | Own identity | Own identity |
| GET /departments | Directory | Directory | Directory |
| POST /students | Any existing department | Own department only | 403 |
| GET /students | All active students | Own department's active students | 403 |
| POST /supervisors | Any existing department | Own department only | 403 |
| GET /supervisors | All matching supervisors | Own department | Own department |
| PATCH /users/{id}/department | May transfer profiles | Ordinary accounts already in own department, destination also own department | 403 |
| PATCH /users/{id}/role | Allowed, with profile checks | 403 | 403 |

List endpoints accept offset >= 0 and limit from 1 to 100; the default limit is 50.

GET /supervisors returns active users with role nauchruk or zavkaf whose Teacher profile has
is_available = true. An admin who retains a teacher profile is not included merely because of that
profile. An unassigned student gets an empty list. Listing supervisors does not reserve capacity
or check whether current_load has reached max_students.

### Role-assignment examples

| Requested action | Expected result |
| --- | --- |
| Admin gives a supervisor with a department the zavkaf role | 200 |
| Admin gives an existing account the admin role | 200 |
| Zavkaf tries to grant admin, even to someone in the same department | 403 |
| Student tries to promote themselves | 403 |
| Admin gives a student without a teacher profile the nauchruk role | 409 |
| Admin gives a teacher without a student profile the student role | 409 |
| Admin tries to demote their own account | 409 |
| Request uses the retired role teacher | 422 |
| A validly authorized request targets a missing user | 404 |

Granting admin is powerful and is intentionally restricted to administrators. Profile compatibility
does not prevent an admin from granting admin to an existing student or supervisor.

A typical department-head appointment is: create a supervisor → admin assigns zavkaf.

### Department-assignment examples

| Requested action | Expected result |
| --- | --- |
| Admin assigns a previously unassigned student to a compatible department | 200 |
| Admin transfers a student to another department in the group's faculty | 200 |
| Admin transfers a student to a department in a different faculty | 409 |
| Zavkaf of department A changes an ordinary A-account's department to A | 200 |
| Zavkaf of A tries to move an A-account to B | 403 |
| Zavkaf of A tries to claim an account already in B or currently unassigned | 403 |
| Zavkaf tries to change their own or another elevated account's department | 403 |
| Admin assigns a department to an account with no domain profile | 409 |
| An otherwise authorized request uses a nonexistent department | 404 |

For a department head, both the current target scope and the requested destination are checked.
Knowing a target's user ID does not grant access.

## Request examples

These PowerShell examples assume the database has been migrated, faculty/group/department
reference rows exist, and the API is running locally. Substitute real IDs and an existing admin
email. The sample new-account password is for disposable local examples only.

### Log in and inspect your identity

POST /login expects form fields, not a JSON email/password body.

```powershell
$api = "http://127.0.0.1:8000"
$adminEmail = Read-Host "Administrator email"
$securePassword = Read-Host "Administrator password" -AsSecureString
$password = [System.Net.NetworkCredential]::new("", $securePassword).Password

$login = Invoke-RestMethod -Method Post -Uri "$api/login" -ContentType "application/x-www-form-urlencoded" -Body @{
    username = $adminEmail
    password = $password
}
$password = $null
$headers = @{ Authorization = "Bearer $($login.access_token)" }

Invoke-RestMethod -Method Get -Uri "$api/me" -Headers $headers
```

Successful login returns access_token, token_type = bearer, and expires_in = 1800 by default.
GET /me returns identity fields, current role, activity, department_id, and last_login_at.
It excludes password_hash, failed_login_attempts, and locked_until.

### Create a student

Using the administrator headers above:

```powershell
$studentBody = @{
    email = "student.demo@example.com"
    password = "Local-Demo-Password-123!"
    first_name = "Ivan"
    last_name = "Petrov"
    department_id = 1
    group_id = 1
} | ConvertTo-Json

$student = Invoke-RestMethod -Method Post -Uri "$api/students" -Headers $headers -ContentType "application/json" -Body $studentBody
```

Expected: 201; a user and student profile are committed together; the response role is student.
The new password is hashed. A duplicate case-insensitive email returns 409 without an orphan profile.
A role field in this creation body returns 422 because unexpected fields are forbidden.

### Create a supervisor and appoint a department head

```powershell
$supervisorBody = @{
    email = "supervisor.demo@example.com"
    password = "Local-Demo-Password-123!"
    first_name = "Anna"
    last_name = "Ivanova"
    department_id = 1
    max_students = 5
} | ConvertTo-Json

$supervisor = Invoke-RestMethod -Method Post -Uri "$api/supervisors" -Headers $headers -ContentType "application/json" -Body $supervisorBody

$roleBody = @{ role = "zavkaf" } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri "$api/users/$($supervisor.id)/role" -Headers $headers -ContentType "application/json" -Body $roleBody
```

Creation returns 201 with role nauchruk. The admin-only PATCH returns 200 with role zavkaf.

### Change a student's department

```powershell
$departmentBody = @{ department_id = 2 } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri "$api/users/$($student.id)/department" -Headers $headers -ContentType "application/json" -Body $departmentBody
```

Expected: 200 if department 2 exists and shares the student's group faculty.
The same operation returns 403 when performed by a department head moving their student outside
their department. A cross-faculty move returns 409 for an administrator.

## Failure codes to understand

| Code | Meaning here | Example |
| --- | --- | --- |
| 401 | Authentication failed | Wrong password before cooldown; missing/invalid/expired token; inactive user |
| 403 | Authenticated caller lacks permission | Student assigns a role; zavkaf accesses another department |
| 404 | Required resource not found after applicable scope checks | Missing department, study group, or user |
| 409 | Data or domain conflict | Duplicate email; incompatible role/profile; faculty mismatch; self-demotion |
| 422 | Request validation failed | Invalid email; password shorter than 12 characters on creation; extra role field; limit=101 |
| 429 | Account login cooldown | Third failed password or another login during the active timer |
| 503 | Authentication configuration unavailable | SECRET_KEY is missing or shorter than 32 bytes |

Authorization checks may happen before resource lookup. A department head targeting an
out-of-scope department can receive 403 rather than learning whether that department exists.
Malformed requests can also fail validation before business logic runs.

## Deployment and migration effects

1. Install the locked dependencies with `uv sync`.
2. Set a random private SECRET_KEY of at least 32 bytes.
3. Run `uv run alembic upgrade head`.
4. Bootstrap the first admin with `uv run python -m scripts.create_admin`.
5. Start the existing development server with `uv run uvicorn app.main:app --reload`.

The admin bootstrap prompts for identity and a password twice. It creates a new account; it does
not silently promote an existing account. It does not create faculty/group/department records.
There is no public self-registration or administrator-registration endpoint.

| Setting | Default | Effect |
| --- | --- | --- |
| SECRET_KEY | Empty in the example | Authentication returns 503 until a sufficiently long value is configured |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30 | Lifetime of newly issued tokens |
| LOGIN_COOLDOWN_MINUTES | 15 | Duration of a newly triggered cooldown |
| LOGIN_MAX_ATTEMPTS | 3, fixed in code | Consecutive-failure threshold |

Durations must be positive; invalid duration configuration prevents application startup.
Tokens already issued retain their encoded expiry when the lifetime setting changes.
The cooldown deadline is stored explicitly; changing its duration does not rewrite existing locks.

Migration upgrade converts existing users.role = teacher to nauchruk, adds zavkaf as a valid
role, and adds the login-state columns and nullable student department foreign key/index.
It does not rename the teachers table or the separate TopicSource.TEACHER value.

Downgrade removes the new fields and maps both nauchruk and zavkaf back to teacher.
It loses the student-department links, cooldown state, and supervisor/department-head distinction.
Schema-reference SQL files are documentation; use Alembic to change the running database.

## Understanding-check preparation

After you approve the final version and say you are ready for a protected-branch push, I will ask
you to predict behavior in a concrete scenario. This document is preparation, not a completed check.
If a material point is missed, I will explain it and ask again, usually with a new scenario.
A successful check does not bypass Git branch protection or grant server-side permissions.

Use the worked examples above to explain, in your own words:

1. Why correct credentials can still return 429.
2. Why a token issued before a role change does not preserve the old permissions.
3. Why a login cooldown and account deactivation affect existing tokens differently.
4. Why a department head cannot claim an unassigned student.
5. Why changing a role does not convert a student profile into a teacher profile.
6. Why a foreign key alone cannot enforce the group/department faculty rule.
7. Why failure state must be committed before returning an HTTP error.
8. What the database row lock is intended to protect when requests arrive simultaneously.
9. Which parts were verified locally and which PostgreSQL behavior remains unverified.
10. What data is preserved on migration upgrade and lost on downgrade.

For any scenario, predict: the HTTP result, database changes, effect on existing tokens,
and whether another department's data becomes accessible.

## Local agent files and Git

The ignore rules keep agent instructions/configuration and the local Repowise index out of commits.
The files remain on disk and can still guide local sessions. Product source, migrations,
tests, the dependency lockfile, and this feature guide remain eligible for version control.

Ignoring a file does not untrack an already committed file. The agent-only paths checked during
this update were untracked, so no Git index removal was necessary.