---
---

# Development Environment and Commands

## Cloning and Related Services

The core repository is `GooGuTeam/g0v0-server`:

```bash
git clone https://github.com/GooGuTeam/g0v0-server.git
cd g0v0-server
```

If you need to test the full client flow, prepare the related services required
by your target feature:

- [`spectator-server`](https://github.com/GooGuTeam/osu-server-spectator):
  spectator server, placed under `spectator-server/` at the repository root.
- [`performance-server`](https://github.com/GooGuTeam/osu-performance-server) or
  `rosu-pp-py`: performance calculation backend. `rosu-pp-py` is an optional
  dependency group. If your instance uses a standalone performance service,
  start it according to your deployment configuration.
- Custom ruleset DLLs: place them in the corresponding ruleset directory when
  custom rulesets are needed, and keep version hashes aligned with the client.

## Recommended Environment

The project requires Python 3.12+, and CI runs on a newer version. Dev Container
is recommended to avoid version mismatches across local MySQL, Redis, system
dependencies, and .NET services.

The historical development environment workflow still applies:

1. Install Docker.
2. Install the Dev Containers extension in VS Code.
3. Open the repository and choose “Reopen in Container”.
4. In the container environment, common settings are `MYSQL_HOST=mysql` and
   `REDIS_URL=redis://redis/0`.

If you do not use Dev Container, prepare the following yourself:

- MySQL, accessed through `aiomysql`.
- Redis, used by cache, chat messages, binary data, and blocking subscriptions
  through different connections.
- Optional spectator, performance, object storage, email, GeoIP, and frontend
  services.

## Configuration

Copy `.env.example` to `.env`, then fill in local configuration:

```bash
cp .env.example .env
```

Pay special attention to the following:

- Do not commit real `.env` files, secrets, passwords, tokens, database URLs, or
  object storage credentials.
- `SECRET_KEY` must not keep the default value. You can generate one with
  `openssl rand -hex 32`.
- `OSU_WEB_CLIENT_SECRET` must not keep the default value. You can generate one
  with `openssl rand -hex 40`.
- If your local environment does not use HTTPS and osu!(lazer) needs to connect
  directly, follow the
  [osu!(lazer) full-stack testing guide](https://github.com/ppy/osu/wiki/Testing-web-server-full-stack-with-osu!#basics)
  to handle client-side SSL restrictions.

## Installing Dependencies

The project uses `uv` for dependency and workspace management:

```bash
uv sync
```

To install the optional rosu calculator dependency:

```bash
uv sync --extra rosu
```

Workspace members include:

- `packages/g0v0-migrations`

## Starting the Development Server

Common startup command:

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You can also run the entrypoint directly. It reads host, port, debug, and
related values from `app.config.settings`:

```bash
uv run python main.py
```

Or use the Dev Container startup script, which starts `spectator-server` and
`performance-server` together if both exist:

```bash
./.devcontainer/start-dev.sh
```

The Dev Container startup script loads environment variables from `.env` and
starts services in development order. Note that the externally exposed port may
be forwarded through NGINX and can differ from the port listened to by the
application itself.

## Common Check Commands

Before submitting, run at least:

```bash
uv run pyright
uv run ruff check --fix .
uv run ruff format .
pre-commit run --all-files
```

If the change modifies database structure, also run migration commands and
review the generated file. See [Database, Models, and Migrations](./database).

## Current Test Status

The current core repository does not have a complete test suite. Do not commit
one-off test scripts for temporary validation. Prefer the following checks:

- Static checks: Pyright, Ruff, and pre-commit.
- Local startup and API documentation checks.
- Manual requests against affected APIs.
- Local upgrade / downgrade risk review for database migrations.
