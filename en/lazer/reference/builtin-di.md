# Built-in Dependency Injection

## Database and Cache

| Dependency Type | Import Path                 | Description                                                                                                                                                                                             |
| --------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Database`      | `app.dependencies.database` | Database session (`AsyncSession`), used for database operations                                                                                                                                         |
| `NoContextDB`   | `app.dependencies.database` | No-context database session (`AsyncSession`), used when you need to perform database operations without sharing Session in dependency injection. Use this if you encounter concurrent connection issues |
| `Redis`         | `app.dependencies.database` | Redis client (`redis.asyncio.Redis`), used for cache operations                                                                                                                                         |

## Core Services

| Dependency Type  | Import Path                  | Description                                             |
| ---------------- | ---------------------------- | ------------------------------------------------------- |
| `Fetcher`        | `app.dependencies.fetcher`   | Fetcher instance, used to fetch data from osu! official |
| `StorageService` | `app.dependencies.storage`   | Storage service, used for file storage operations       |
| `EventHub`       | `app.dependencies.event_hub` | Event hub, used to send and subscribe to events         |

## Cache Services

| Dependency Type          | Import Path              | Description              |
| ------------------------ | ------------------------ | ------------------------ |
| `BeatmapsetCacheService` | `app.dependencies.cache` | Beatmapset cache service |
| `UserCacheService`       | `app.dependencies.cache` | User cache service       |

## Request Context

| Dependency Type | Import Path                    | Description                                 |
| --------------- | ------------------------------ | ------------------------------------------- |
| `IPAddress`     | `app.dependencies.geoip`       | Client IP address (`str`)                   |
| `GeoIPService`  | `app.dependencies.geoip`       | GeoIP service, used to query location by IP |
| `UserAgentInfo` | `app.dependencies.user_agent`  | User agent info model                       |
| `APIVersion`    | `app.dependencies.api_version` | API version number (`int`)                  |

## Chat

| Dependency Type | Import Path            | Description                                    |
| --------------- | ---------------------- | ---------------------------------------------- |
| `BanchoBot`     | `app.dependencies.bot` | BanchoBot instance, used to send chat messages |

## Other Services

| Dependency Type             | Import Path                            | Description                                                    |
| --------------------------- | -------------------------------------- | -------------------------------------------------------------- |
| `DownloadService`           | `app.dependencies.beatmap_download`    | Beatmap download service, provides load-balanced download URLs |
| `ClientVerificationService` | `app.dependencies.client_verification` | Client version verification service                            |
