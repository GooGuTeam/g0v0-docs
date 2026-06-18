---
---

# Routers, APIs, and Authentication

## Router Directory Rules

The location of public APIs is a hard rule:

| Path                                          | Allowed content                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `app/router/v1/`                              | Endpoints that already exist in osu! API v1.                                               |
| `app/router/v2/`                              | Endpoints that already exist in osu! API v2 / OpenAPI.                                     |
| `app/router/notification/`                    | osu! chat, notification, and BanchoBot endpoints. These must also match official behavior. |
| `app/router/auth.py`                          | OAuth, token, login authorization, and related authentication flows.                       |
| `app/router/private/`                         | g0v0 custom or experimental core APIs.                                                     |
| `app/router/file.py`, `redirect.py`, `lio.py` | Dedicated entrypoints for files, frontend redirects, legacy IO, and related features.      |

Before adding an endpoint, check the official specifications:

- v1: <https://github.com/ppy/osu-api/wiki>
- v2: <https://osu.ppy.sh/docs/index.html>

If an endpoint does not exist in the official v1/v2 specifications, it must not
be placed under `v1/`, `v2/`, or `notification/`.

## Route Handler Principles

All route handlers must:

- Use `async def`.
- Use Annotated-style dependency injection or dependency aliases provided by the
  repository.
- Only handle parameter parsing, authentication, service calls, response
  composition, and client-side errors.
- Keep externally visible response schemas, paths, scopes, and error formats
  stable.
- Provide sufficient OpenAPI documentation for new or changed endpoints.
- Use the existing asset proxy helper when returning proxied asset URLs.

Do not pile complex queries, cache backfills, batch processing, or cross-service
orchestration into routers. Put that logic into `app/service/`.

## Authentication Patterns

### OAuth Scope Authentication

v2 / private APIs exposed to clients, frontends, or third-party OAuth
applications usually use `get_current_user` with `Security`:

```python
from typing import Annotated

from app.database import User
from app.dependencies.user import get_current_user
from fastapi import APIRouter, Security

router = APIRouter(prefix="/api/private/example", tags=["g0v0"])


@router.get("/public-user")
async def get_public_user(
    current_user: Annotated[User, Security(get_current_user, scopes=["public"])],
):
    return {"id": current_user.id}
```

Choose scopes from the OAuth definitions in `app.dependencies.user`. Do not
invent new scopes casually.

### Client / Frontend Users

APIs used only by the osu!(lazer) client or the g0v0 frontend can use
`ClientUser`:

```python
from app.dependencies.user import ClientUser
from fastapi import APIRouter

router = APIRouter(prefix="/api/private/example", tags=["g0v0"])


@router.get("/me")
async def get_me(current_user: ClientUser):
    return {"id": current_user.id, "username": current_user.username}
```

If you also need the token, use variants such as `get_current_user_and_token` or
`get_client_user_and_token`.

### v1 API Key

v1 endpoints use the `v1_authorize` dependency. The API key is provided in the
query parameter `k`. v1 responses need historical compatibility: the current v1
router serializes values as strings through `AllStrModel`.

## Database and Redis Dependencies

Common dependencies are in `app.dependencies.database`:

```python
from app.dependencies.database import Database, Redis
from fastapi import APIRouter

router = APIRouter(prefix="/api/private/example", tags=["g0v0"])


@router.get("/cache-demo")
async def cache_demo(session: Database, redis: Redis):
    value = await redis.get("example:key")
    if value is not None:
        return {"value": value}

    # Real business logic should be placed in a service.
    await redis.set("example:key", "created", ex=60)
    return {"value": "created"}
```

Use `NoContextDB` when you must avoid reusing the current request session.
Regular routes should prefer `Database`.

## Rate Limiting

The v1/v2 router layer uses `LIMITERS` from `app.dependencies.rate_limit`
according to configuration. When adding download, replay, batch query, or
high-cost endpoints, check whether stricter rate limits are needed.

## Error Responses

- Client-side errors: use `HTTPException` or `app.models.error.RequestError`.
- When structured error codes and extra fields are needed, prefer
  `RequestError`. It emits `error`, `msg_key`, and `details`.
- Server-side errors: write structured logs and do not expose internal exception
  details directly to clients.

## New Endpoint Checklist

Before adding or changing an endpoint, confirm that:

1. The path is in the correct directory.
2. The behavior, parameters, pagination, error codes, and response fields are
   compatible with the corresponding official osu! API.
3. The handler is asynchronous.
4. It uses existing DB, Redis, user, and rate-limit dependencies from the
   repository.
5. Complex logic is placed in a service.
6. Public contract changes include compatibility notes.
7. Private APIs use `/api/private/`; plugin APIs use
   `/api/plugins/<plugin-id>/`.
