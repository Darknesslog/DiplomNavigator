# PostgreSQL integration checks

This subtree uses PostgreSQL 16, the complete Alembic migration chain, and the same
seed rows as the SQLite behavior suite. Every collected test here has the `postgres`
marker. The default `uv run pytest` selects `not postgres`; an explicit
`uv run pytest -m postgres` selects this suite and requires `TEST_DATABASE_URL`.
Missing configuration fails instead of silently skipping the checks.

## PowerShell: automatic lifecycle

From the repository root, run `uv sync`, start Docker Desktop, then:

```powershell
./backend/tests/integration/run_postgresql.ps1
```

The runner uses a unique Compose project and a dynamically assigned localhost port.
It starts a disposable database, runs `pytest -m postgres`, propagates the exit code,
restores environment variables, and removes only that test project's resources.
It uses the project's existing `.venv/Scripts/python.exe`.

## Manual / Linux / CI

```sh
docker compose -p diplomnavigator-tests -f docker-compose.test.yml up -d --wait
export TEST_DATABASE_URL='postgresql+psycopg://postgres:test-only-password@127.0.0.1:55432/diplom_test'
uv run pytest -m postgres --tb=short
docker compose -p diplomnavigator-tests -f docker-compose.test.yml down --volumes
```

For manual PowerShell runs, set `$env:TEST_DATABASE_URL` instead of `export`.
`POSTGRES_TEST_PORT` can override the manual port. Keep the port in the URL aligned
with that setting. Always run the cleanup command, including after failed tests.

## Isolation and scope

- Only PostgreSQL on localhost with database name `diplom_test` is allowed.
  Tests truncate its application tables between cases. Never reuse a valuable database
  with this name. The Compose file uses tmpfs and contains public test-only credentials.
- Alembic creates the schema; the fixture never creates PostgreSQL tables from ORM metadata.
- No application `.env`, production volume, or production Compose project is modified.
- Tests run serially. Do not run concurrent pytest processes against the same test database.
- The PostgreSQL session matches production `autoflush=False` and `expire_on_commit=False`.
- Cases cover concurrent reservation/approval, shared last-slot capacity, one assignment per
  student, concurrent limit changes, rollback, partial indexes, roles, department boundaries,
  partner topics, progress, expiration and endpoint aliases.
- Passing these cases verifies those interleavings and invariants; it is not a proof that
  all possible races are excluded. Closed-period acceptance and progress regression tests
  explicitly characterize current policy gaps rather than endorsing those policies.

The previous local audit log is preserved in
[the review history](../../../.tmp/reviews/00-postgresql-audit-history.md).
