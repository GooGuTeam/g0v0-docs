---
---

# Database, Models, and Migrations

## Model Directory Boundaries

- `app/database/`: SQLModel tables, persistent models, database response models,
  and `DatabaseModel` utilities.
- `app/models/`: non-database models, such as events, enums, request structures,
  and intermediate structures for mods / score code.

Do not put SQLModel tables into `app/models/`. Historical documentation that
mentions database models under `app.models` no longer applies to the latest
repository. Use `app/database/` as the source of truth.

## On-Demand Response Models

Core database models use an “on-demand response” design. The typical structure
is `Dict` → `Model` → `Table`:

1. `Dict`: a `TypedDict` describing the transformed dictionary structure for
   type checking and documentation generation.
2. `Model`: extends `DatabaseModel[Dict]` and defines public fields, on-demand
   fields, and calculated properties.
3. `Table`: extends `Model` with `table=True` and defines the actual database
   table fields.

Example:

```python
from typing import NotRequired, TypedDict

from app.database._base import DatabaseModel, OnDemand, included, ondemand
from sqlalchemy import func, select
from sqlmodel import Field
from sqlmodel.ext.asyncio.session import AsyncSession


class ExampleUserDict(TypedDict):
    id: int
    username: str
    email: NotRequired[str]
    followers_count: int


class ExampleUserModel(DatabaseModel[ExampleUserDict]):
    id: int = Field(primary_key=True)
    username: str
    email: OnDemand[str]

    @included
    @staticmethod
    async def followers_count(session: AsyncSession, instance: "ExampleUser") -> int:
        return await session.scalar(select(func.count()).where(Follower.followed_id == instance.id)) or 0

    @ondemand
    @staticmethod
    async def optional_badge(session: AsyncSession, instance: "ExampleUser") -> str | None:
        return None


class ExampleUser(ExampleUserModel, table=True):
    password: str
```

Field conventions:

- Regular fields: always returned.
- `OnDemand[T]`: database fields that exist but are only returned when specified
  in `includes`.
- `@included`: regular calculated properties, always returned.
- `@ondemand`: on-demand calculated properties, only returned when specified in
  `includes`.
- `Exclude[T]`: useful for fields that must exist in the table structure but
  should not be exported by default.

## Transformation and Response Documentation

Use `transform` to convert database objects:

```python
user = await session.get(User, 1)
user_dict = await UserModel.transform(
    user,
    includes=["email"],
    session=session,
)
```

In routers, use `generate_typeddict` to generate more accurate response
documentation:

```python
@router.get("/users/{user_id}", response_model=UserModel.generate_typeddict(includes=("email",)))
async def get_user(user_id: int, session: Database) -> dict:
    user = await session.get(User, user_id)
    return await UserModel.transform(user, includes=["email"], session=session)
```

`app/database/__init__.py` runs `model_rebuild()` for `*Model` and `*Resp` types
to resolve forward references. After adding a new model:

1. Define clear `Dict`, `Model`, and `Table` types in the corresponding module.
2. Export the public types from `app/database/__init__.py`.
3. Confirm that `model_rebuild()` does not fail because of missing imports or
   circular references.

If you use SQLAlchemy relationships, follow the current repository style and use
type-checker-compatible forms such as `Mapped[...]`.

## Database Session

Common dependencies:

- `Database`: request-scoped session based on `ContextVar`; suitable for most
  routes.
- `NoContextDB`: creates a fresh session each time; use it when you must avoid
  sharing the current request session.
- `with_db()`: async context manager for manually creating sessions outside
  routers.
- `DBFactory`: use it when multiple sessions need to be created on demand.

Example:

```python
from app.dependencies.database import with_db


async def run_job() -> None:
    async with with_db() as session:
        # Commit manually after modifying data.
        await session.commit()
```

Notes:

- Explicitly call `await session.commit()` after modifying data.
- Batch writes should be placed in the same transaction to avoid many small
  transactions.
- Do not keep a session in a global object for a long time.

## Redis Connections

The current core dependencies provide multiple Redis connections:

| Connection               | DB  | Purpose                                                                                   |
| ------------------------ | --- | ----------------------------------------------------------------------------------------- |
| `Redis` / `redis_client` | 0   | Default cache, regular strings, and hashes.                                               |
| `redis_blocking_client`  | 0   | Blocking reads, PubSub, BRPOP, and operations that require socket timeout to be disabled. |
| `redis_message_client`   | 1   | Message cache, such as chat messages.                                                     |
| `redis_binary_client`    | 2   | Binary data such as audio and replays; response decoding is disabled.                     |

Cache keys should follow existing naming conventions, such as `user:{id}:...`.
If a cache write does not affect the current response, consider performing it
through a background task.

## Migrations

The latest repository uses `g0v0-migrate`, which wraps Alembic and supports
plugin migrations. After changing table structures under `app/database/`, run:

```bash
uv run g0v0-migrate revision --autogenerate -m "feat(db): describe change"
uv run g0v0-migrate upgrade head
```

To upgrade both core and all plugin migrations:

```bash
uv run g0v0-migrate upgrade-all
```

Migration checklist:

1. Manually review generated SQL after creating the migration.
2. Check indexes, unique constraints, foreign keys, default values, and nullable
   changes.
3. Evaluate lock, backfill, and online upgrade cost for large-table changes.
4. Do not mix business data fixes into schema migrations. Use a separate
   maintenance script for complex fixes and document how it is executed.
5. In the PR, explain whether the migration is backward compatible, whether
   downtime is required, and whether manual steps are needed.

## Query Performance Suggestions

Prefer selecting only necessary fields:

```python
stmt = select(User.id, User.username).where(User.active == True)
rows = await session.exec(stmt)
```

Use `exists()` to check existence and avoid loading entire rows:

```python
from sqlalchemy import exists, select

exists_stmt = select(exists().where(User.id == user_id))
found = await session.scalar(exists_stmt)
```

Avoid N+1 queries. Use `selectinload` or `joinedload` when related objects are
needed. Batch calculation, rankings, beatmap synchronization, and similar paths
should pay special attention to indexes and query plans.
