# История миграций

| Revision | Родитель | Назначение |
| --- | --- | --- |
| `11df49dcefbc` | `base` | init schema |
| `2b88c9a7d104` | `11df49dcefbc` | Add login cooldown state, student departments and four application roles. |
| `7c3d2e1f4a5b` | `2b88c9a7d104` | Make topic descriptions required and enforce one active reservation per topic. |
| `8e4f6a2b1c90` | `7c3d2e1f4a5b` | Add assignment progress tracking. |
| `9f2a7c6d4e10` | `8e4f6a2b1c90` | Add application expiration, cooldown, and topic archive metadata. |
| `a4b7c9d2e601` | `9f2a7c6d4e10` | Enforce exclusive topic reservation and assignment. |
| `b5c8d0e3f712` | `a4b7c9d2e601` | Align timeout/archive comments with the ORM metadata. |
| `c6d1e2f3a4b5` | `b5c8d0e3f712` | Add supervisor topic deletion requests and head decisions. |
| `c7e2f3a4b5c6` | `c6d1e2f3a4b5` | Align deletion-request comments with ORM metadata. |

Единственная вершина: `c7e2f3a4b5c6`.
Применение: `uv run alembic upgrade head`; проверка: `uv run alembic current`.
