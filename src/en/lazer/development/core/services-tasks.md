---
---

# Services, Tasks, Logging, and Error Handling

## Service Layer

Core business logic belongs in `app/service/`. Routers should call services
instead of directly implementing complex business logic.

Logic suitable for services includes:

- Multi-table queries and transaction orchestration.
- Cache reads, backfills, and invalidation.
- Email, notifications, chat messages, beatmap downloads, and beatmapset
  updates.
- Domain logic for rankings, user statistics, daily challenges, recalculation,
  and related features.
- Flows shared by routers, tasks, and scripts.

Prefer organizing services as classes. Pass dependencies through constructors or
method parameters, and do not create request-scoped sessions during global
initialization.

```python
from app.log import service_logger


class ExampleService:
    def __init__(self) -> None:
        self.logger = service_logger("ExampleService")

    async def run(self) -> None:
        self.logger.info("running example service")
```

## Background Tasks

Long-running logic should not block route responses:

- Background actions originating from API routes: use FastAPI's
  `BackgroundTasks`.
- Non-router scenarios: use `app.helpers.bg_tasks`, which provides an interface
  similar to FastAPI `BackgroundTasks`.
- CPU-intensive work or blocking library calls: wrap them in controlled
  thread-pool execution or a standalone service, instead of blocking the event
  loop directly.

```python
from fastapi import APIRouter, BackgroundTasks

router = APIRouter(prefix="/api/private/example", tags=["g0v0"])


async def refresh_cache(user_id: int) -> None:
    ...


@router.post("/refresh-cache/{user_id}")
async def refresh_cache_api(user_id: int, background_tasks: BackgroundTasks):
    background_tasks.add_task(refresh_cache, user_id)
    return {"status": "queued"}
```

## Scheduled Tasks, Startup Tasks, and Shutdown Tasks

Tasks live in `app/tasks/` and are exported through `__init__.py`. Tasks that
need to run during application startup or shutdown are called by the lifespan in
`main.py`; scheduled tasks are registered through APScheduler.

When writing tasks, they must be:

- **Idempotent.** Repeated runs should not create duplicate data or invalid
  states.
- **Observable.** Every exit path should log what happened, especially skipped,
  failed, no-data, and partially successful states.
- **Retryable.** External network failures and temporary database failures
  should be safe to retry.
- **Non-blocking.** Long batch jobs should paginate, process in chunks, and
  release connections.
- **Misfire-tolerant.** Cron jobs should set `misfire_grace_time` when needed.

Example:

```python
from app.log import task_logger

logger = task_logger("ExampleJob")


async def example_job() -> None:
    logger.info("example job started")
    try:
        ...
    except Exception:
        logger.exception("example job failed")
        raise
    logger.info("example job finished")
```

## Logging

Choose the logger entrypoint based on code location:

```python
from app.log import fetcher_logger, log, service_logger, system_logger, task_logger

log("RouterName").info("router event")
system_logger("Startup").info("system event")
service_logger("RankingService").info("service event")
task_logger("DailyChallenge").info("task event")
fetcher_logger("BeatmapFetcher").info("fetcher event")
```

Practices:

- Log server-side exceptions with structured logs, and do not return internal
  details directly to clients.
- Do not log passwords, tokens, email verification codes, real `.env` values, or
  object storage secrets.
- Batch tasks should log input size, success count, failure count, and duration.
- Avoid excessive info logs on high-frequency paths. Use debug logs when
  appropriate.

## Error Handling

The core application registers common exception handlers:

- `RequestValidationError`: returns 422.
- `RequestError`: returns structured `error`, `msg_key`, and details.
- `HTTPException`: returns the corresponding status code and an `error` field.

Client-side error:

```python
from fastapi import HTTPException

if user is None:
    raise HTTPException(status_code=404, detail="User not found")
```

When a localized key or structured details are needed:

```python
from app.models.error import RequestError

raise RequestError(
    status_code=400,
    msg_key="invalid_request",
    message="Invalid request",
    details={"field": "beatmap_id"},
)
```

Server-side errors should not be converted into 200 responses or swallowed
silently. Recoverable errors should be logged and degraded gracefully;
unrecoverable errors should be logged and re-raised for the upper layer to
handle consistently.

## Cache and Invalidation

Cache-related logic should reuse existing services where possible, such as user
cache, beatmap cache, and ranking cache. When adding a new cache, define:

1. Key naming.
2. TTL.
3. Data source.
4. Invalidation triggers.
5. Whether stale values may be returned briefly.
6. Whether background refresh is needed.

For data consumed by multiple paths, such as user avatars, covers, beatmapsets,
and online status, changes to write paths must also review cache invalidation
paths.
