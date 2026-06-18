---
---

# Project Structure and Lifecycle

## Technology Overview

The core service is an asynchronous Python application based on FastAPI. Its
main components are:

- Web framework: FastAPI.
- Database: SQLModel / SQLAlchemy async + MySQL (`aiomysql`).
- Cache and messaging: `redis.asyncio`.
- Background scheduling: APScheduler.
- Configuration: `pydantic-settings`, exposed through `settings` in
  `app/config.py`.
- Logging: `loguru`, wrapped by `app/log.py`.
- Migrations: the `g0v0-migrate` CLI provided by `packages/g0v0-migrations`.
- Plugin extension: `app/plugins/`. Core development documentation only
  describes the core boundary. See
  [Plugin Development](/en/lazer/development/plugin/) for plugin details.

## Core Directories

| Path                 | Purpose                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `main.py`            | FastAPI application entrypoint. Registers routers, middleware, exception handlers, and lifespan.                           |
| `app/router/`        | API routers grouped by v1, v2, notification, private, auth, file, redirect, lio, and related modules.                      |
| `app/database/`      | SQLModel database tables, database response models, and the `DatabaseModel` base class.                                    |
| `app/models/`        | Non-database models, such as enums, request/response structures, events, mods, and score helper structures.                |
| `app/service/`       | Core business logic. Complex business logic should not be placed in routers.                                               |
| `app/tasks/`         | Startup tasks, shutdown tasks, and APScheduler jobs.                                                                       |
| `app/dependencies/`  | FastAPI / FastDepends dependency injection for database, Redis, authentication, rate limits, fetcher, scheduler, and more. |
| `app/helpers/`       | Common helpers for background tasks, time, strings, GeoIP, asset proxy, and related utilities.                             |
| `app/fetcher/`       | Fetches beatmaps, users, and other data from official osu! or external services.                                           |
| `app/calculating/`   | Difficulty, performance, mods, and ruleset-related calculation code.                                                       |
| `app/plugins/`       | Plugin loading, event hub, plugin API router, and plugin migration integration.                                            |
| `app/storage/`       | Local storage or object storage related logic.                                                                             |
| `migrations/`        | Core database migrations.                                                                                                  |
| `packages/`          | uv workspace packages, such as the migration tool.                                                                         |
| `static/`            | Default definitions, static data, and generated ruleset/mods resources.                                                    |
| `scripts/`, `tools/` | Operational scripts, generation scripts, and one-off maintenance tools.                                                    |

## Application Startup Order

The lifespan in `main.py` is the entrypoint for understanding the core system.
On the current main branch, startup roughly performs the following:

1. Initializes file logging.
2. Loads plugins and mounts plugin routers.
3. Initializes mods, ranked mods, ruleset version hashes, achievements, and the
   performance calculator.
4. Initializes the client verification service if client version checks are
   enabled.
5. Initializes the fetcher, GeoIP, and optional v2 IPC.
6. Initializes game base data: RX / custom ruleset statistics, user ranks, daily
   challenge, and BanchoBot.
7. Starts services: email processor, download service health checks, cache
   tasks, beatmapset update service, Redis message system, and scheduler.
8. Starts the user online-status subscriber if v2 IPC is not enabled.
9. Logs system status such as asset proxy status.

When adding new startup logic, follow these rules:

- Do not put work on the critical startup path if it can be lazily initialized.
- Startup tasks must be repeatable and avoid duplicate inserts or duplicate
  registrations.
- Initialization that depends on external networks must have timeouts, error
  logs, and fallback behavior.
- Modify `main.py` only when truly necessary. More complex logic should be
  wrapped in a service or task.

## Application Shutdown Order

Shutdown stops background tasks, cache tasks, scheduler, download service health
checks, and the email processor, then closes the database engine and Redis
connections.

When adding a long-running service, provide explicit shutdown logic and ensure
that:

- No un-awaited coroutine is left behind.
- Cancellation and shutdown exceptions are not swallowed silently.
- No unnecessary database or Redis connections are created during shutdown.

## Router Registration Boundaries

Core routers are mounted after the application is created:

- `api_v2_router`
- `api_v1_router`
- `chat_router`
- `redirect_api_router`
- `file_router`
- `auth_router`
- `private_router`
- `lio_router`

Plugin routers are mounted during lifespan after plugins are loaded. Do not
mount experimental core APIs on the plugin router, and do not place plugin-only
APIs under the core `private_router`.

## Special Notes

- Paths under `/_lio` are used for spectator / legacy IO scenarios. Production
  networks should block public access to them.
- Importing `app.database` runs `model_rebuild()` for `*Model` and `*Resp`
  types. New related types must be exported correctly.
- The core repository is compatible with osu! API v1/v2, g0v0 private APIs,
  plugin APIs, and client-specific flows. Confirm the impact scope before
  modifying public behavior.
