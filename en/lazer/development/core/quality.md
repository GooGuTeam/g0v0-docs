---
---

# Code Quality, PRs, and Performance

## Basic Conventions

- Python version: the project requires Python 3.12+, and CI uses a newer
  version.
- Line length: Ruff is configured with a line length of 120.
- Routers: all route handlers must be `async`.
- Commit messages: use Angular style, `type(scope): subject`.
- Public APIs: keep osu! v1/v2 compatibility. Custom APIs belong under private
  or plugin routers.
- Test status: the core repository does not have a complete test suite, so
  static checks and manual review must be stricter before submission.

## Pre-submit Checks

Recommended order:

```bash
uv run ruff check --fix .
uv run ruff format .
uv run pyright
pre-commit run --all-files
```

To install hooks first:

```bash
pre-commit install
```

Database model changes must also run:

```bash
uv run g0v0-migrate revision --autogenerate -m "feat(db): describe change"
uv run g0v0-migrate upgrade head
```

## Commit Messages

Recommended types:

- `feat`: new feature.
- `fix`: bug fix.
- `docs`: documentation change.
- `style`: formatting change that does not affect code meaning.
- `refactor`: refactoring.
- `perf`: performance improvement.
- `test`: test-related change.
- `chore`: build, dependency, or auxiliary tool change.
- `ci`: continuous integration.
- `deploy`: deployment-related change.

Examples:

```text
feat(api): add beatmap favourite endpoint
fix(database): rebuild forward references for score response
perf(score): add union index for best scores
docs(dev): update core development guide
```

## PR Scope

One PR should solve one problem:

- One endpoint.
- One bug fix.
- One dependency upgrade.
- One closely related refactor group.

Do not mix endpoints, database migrations, refactors, dependency upgrades, and
documentation updates into one large PR unless they are inseparable parts of the
same change.

A PR description should at least explain:

1. Purpose of the change.
2. Affected APIs, database tables, configuration items, or background tasks.
3. Whether public contracts are changed.
4. Whether migrations are included, and what migration risks exist.
5. Check commands that were run.
6. Operational steps required from maintainers.

## API Review Checklist

When changing endpoints, review:

- Whether the endpoint is placed in the correct router directory.
- Whether v1/v2/notification endpoints conform to the official osu! API.
- Whether private APIs use the `/api/private/` prefix.
- Whether authentication dependencies and scopes are correct.
- Whether OpenAPI documentation is accurate.
- Whether the error format follows existing conventions.
- Whether response fields, pagination, sorting, status codes, or cache behavior
  changed unexpectedly.

## Database Review Checklist

After changing `app/database/`, review:

- Whether a migration was added or updated.
- Whether new models are exported and participate in `model_rebuild()`.
- Whether migration SQL matches expectations.
- Whether indexes are sufficient, duplicated, or low-value.
- Whether nullable changes, default values, unique constraints, or foreign keys
  can break existing data.
- Whether large-table changes need staged rollout or maintenance scripts.

## Performance Suggestions

Database:

- Select only necessary fields and avoid unconditional `select(Model)`.
- Use `exists()` for existence checks.
- Avoid N+1 queries and use `selectinload` / `joinedload` where appropriate.
- Batch inserts, updates, and deletes should be chunked inside the same
  transaction.
- Ranking, score, daily challenge, beatmap sync, and cache recalculation paths
  require special attention to indexes.

Async and tasks:

- Do not execute blocking IO or CPU-intensive work directly in the event loop.
- Put long-running work from API routes into `BackgroundTasks`.
- Use `app.helpers.bg_tasks` for non-router scenarios.
- Scheduled tasks should log start, finish, skipped, failed, and duration
  states.
- External requests should set timeouts to prevent startup and tasks from
  hanging forever.

Cache:

- Reuse existing cache services for hot responses whenever possible.
- Write paths must review cache invalidation.
- Use `redis_binary_client` or storage services for binary data. Do not
  accidentally use the default Redis connection with response decoding enabled.
- Use `redis_blocking_client` for blocking reads such as PubSub / BRPOP.

## AI and Automation Agent Rules

When using Copilot, LLMs, Dependabot, pre-commit.ci, or other automation tools,
follow these rules:

1. Automatically generated code must be reviewed by maintainers.
2. Do not commit secrets, tokens, real `.env` values, production database URLs,
   or sensitive user data.
3. Agent PRs must have a single responsibility.
4. Dependency upgrade PRs must pass CI and pre-commit.
5. Do not add non-official endpoints to v1/v2/notification.
6. Do not change public contracts without approval.
7. Do not create extra one-off test scripts as committed content.

Prompts for LLMs / Copilot should clearly state file locations and constraints.
For example:

```text
Add an async endpoint under app/router/private/example.py.
Do not add endpoints to app/router/v1 or app/router/v2.
Use Database and Redis dependencies from app.dependencies.database.
Keep business logic in app/service/example_service.py.
```

## Security and License Notes

- Any derivative work, modification, or deployment must follow repository
  license requirements and clearly attribute GooGuTeam and the original project
  URL.
- Production environments must change default JWT secrets and OAuth client
  secrets.
- The `/_lio` path must not be exposed to the public internet.
- Logs, errors, and debug output must not leak authentication information or
  sensitive user data.
