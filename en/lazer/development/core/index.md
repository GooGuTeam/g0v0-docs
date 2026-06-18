---
---

# Core Development

This section is for developers who directly modify the g0v0-server core code. It
covers the development environment, project structure, routers, authentication,
database, migrations, services, tasks, logging, error handling, quality checks,
and PR conventions.

This documentation follows the latest `main` branch of GooGuTeam/g0v0-server. If
this section conflicts with the plugin development documentation, use this
section for core code and use
[Plugin Development](/en/lazer/development/plugin/) for plugin code.

## Quick Links

- [Development Environment and Commands](./setup): prepare the repository,
  dependencies, configuration, and common commands.
- [Project Structure and Lifecycle](./architecture): understand core
  directories, startup order, and shutdown order.
- [Routers, APIs, and Authentication](./routers): keep osu! API compatibility
  and use dependency injection correctly.
- [Database, Models, and Migrations](./database): write SQLModel models,
  on-demand response models, Redis code, and migrations.
- [Services, Tasks, Logging, and Error Handling](./services-tasks): organize
  business logic, background tasks, schedulers, and structured errors.
- [Code Quality, PRs, and Performance](./quality): pre-submit checks, PR scope,
  AI agent rules, and performance notes.

## Core Principles

1. **Keep public APIs compatible.** `app/router/v1/`, `app/router/v2/`, and
   `app/router/notification/` may only implement endpoints that exist in the
   official osu! API. Custom or experimental endpoints must go under
   `app/router/private/`.
2. **Keep routers thin.** Route handlers should handle parameters,
   authentication, and response composition. Complex business logic belongs in
   `app/service/`.
3. **Database changes require migrations.** After changing SQLModel table
   structures under `app/database/`, generate and manually review a migration.
4. **Prefer async code and avoid blocking.** All route handlers must be `async`.
   Long-running work should be wrapped with background tasks, schedulers, or
   controlled thread-pool execution.
5. **Keep public contracts stable.** Do not casually change response schemas,
   route prefixes, authentication scopes, or error formats without a migration
   plan and compatibility notes.
6. **Pass checks before submitting.** Run at least Ruff, formatting, Pyright,
   and pre-commit. The current repository does not have a complete test suite,
   so static checks and manual review are especially important.

## Relationship with Repository Documents

The latest repository `CONTRIBUTING.md` points to this page. `AGENTS.md` still
keeps short rules for Copilot, LLMs, Dependabot, pre-commit.ci, and background
workers. This section expands those rules and provides context suitable for
human developers.
