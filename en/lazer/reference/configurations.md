---
editLink: false
lastUpdated: false
---

> Last Generated: 2026-01-29 12:29:48 UTC at commit
> [`eb7dd2b74e8e77d0ed8c91a880dc17a3008e9079`](https://github.com/GooGuTeam/g0v0-server/commit/eb7dd2b74e8e77d0ed8c91a880dc17a3008e9079)

# Configurations

This page lists all available configuration options in the `.env` file and their
descriptions.

::: warning Warning

In a production environment, be sure to change the default keys and passwords!

:::

## Database Settings

| Variable Name         | Description          | Type    | Default Value            |
| --------------------- | -------------------- | ------- | ------------------------ |
| `MYSQL_HOST`          | MySQL Server Address | string  | `localhost`              |
| `MYSQL_PORT`          | MySQL Server Port    | integer | `3306`                   |
| `MYSQL_DATABASE`      | MySQL Database Name  | string  | `osu_api`                |
| `MYSQL_USER`          | MySQL Username       | string  | `osu_api`                |
| `MYSQL_PASSWORD`      | MySQL Password       | string  | `password`               |
| `MYSQL_ROOT_PASSWORD` | MySQL Root Password  | string  | `password`               |
| `REDIS_URL`           | Redis Connection URL | string  | `redis://127.0.0.1:6379` |

## JWT Settings

| Variable Name                  | Description                         | Type          | Default Value          |
| ------------------------------ | ----------------------------------- | ------------- | ---------------------- |
| `JWT_SECRET_KEY`               | JWT Signing Key                     | string        | `your_jwt_secret_here` |
| `JWT_ALGORITHM`                | JWT Algorithm                       | string        | `HS256`                |
| `ACCESS_TOKEN_EXPIRE_MINUTES`  | Access Token Expiration Time (Min)  | integer       | `1440`                 |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | Refresh Token Expiration Time (Min) | integer       | `21600`                |
| `JWT_AUDIENCE`                 | JWT Audience                        | string        | `5`                    |
| `JWT_ISSUER`                   | JWT Issuer                          | string / null | `null`                 |

## OAuth Settings

| Variable Name           | Description             | Type    | Default Value                              |
| ----------------------- | ----------------------- | ------- | ------------------------------------------ |
| `OSU_CLIENT_ID`         | OAuth Client ID         | integer | `5`                                        |
| `OSU_CLIENT_SECRET`     | OAuth Client Secret     | string  | `FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk` |
| `OSU_WEB_CLIENT_ID`     | Web OAuth Client ID     | integer | `6`                                        |
| `OSU_WEB_CLIENT_SECRET` | Web OAuth Client Secret | string  | `your_osu_web_client_secret_here`          |

## Server Settings

| Variable Name       | Description                                                                                           | Type                | Default Value            |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| `HOST`              | Server Listening Address                                                                              | string              | `0.0.0.0`                |
| `PORT`              | Server Listening Port                                                                                 | integer             | `8000`                   |
| `DEBUG`             | Whether to enable Debug Mode                                                                          | boolean             | `false`                  |
| `CORS_URLS`         | Additional CORS allowed domain list (JSON format)                                                     | array[string (url)] | `[]`                     |
| `SERVER_URL`        | Server URL                                                                                            | string (url)        | `http://localhost:8000/` |
| `FRONTEND_URL`      | Frontend URL, will redirect to this URL when accessing URL opened from game. Empty means no redirect. | string (url) / null | `null`                   |
| `ENABLE_RATE_LIMIT` | Whether to enable Rate Limiting                                                                       | boolean             | `true`                   |

## Fetcher Settings

Fetcher is used to fetch data from osu! official API, using osu! official API
OAuth 2.0 authentication.

| Variable Name           | Description           | Type   | Default Value |
| ----------------------- | --------------------- | ------ | ------------- |
| `FETCHER_CLIENT_ID`     | Fetcher Client ID     | string | `""`          |
| `FETCHER_CLIENT_SECRET` | Fetcher Client Secret | string | `""`          |

## Log Settings

| Variable Name | Description | Type   | Default Value |
| ------------- | ----------- | ------ | ------------- |
| `LOG_LEVEL`   | Log Level   | string | `INFO`        |

## Verification Service Settings

| Variable Name                   | Description                                                                | Type                   | Default Value         |
| ------------------------------- | -------------------------------------------------------------------------- | ---------------------- | --------------------- |
| `ENABLE_TOTP_VERIFICATION`      | Whether to enable TOTP Two-Factor Authentication                           | boolean                | `true`                |
| `TOTP_ISSUER`                   | Issuer Name in TOTP Authenticator                                          | string / null          | `null`                |
| `TOTP_SERVICE_NAME`             | Service Name displayed in TOTP Authenticator                               | string                 | `g0v0! Lazer Server`  |
| `TOTP_USE_USERNAME_IN_LABEL`    | Use username instead of email in TOTP label                                | boolean                | `true`                |
| `ENABLE_TURNSTILE_VERIFICATION` | Whether to enable Cloudflare Turnstile Verification (Non-osu clients only) | boolean                | `false`               |
| `TURNSTILE_SECRET_KEY`          | Cloudflare Turnstile Secret Key                                            | string                 | `""`                  |
| `TURNSTILE_DEV_MODE`            | Turnstile Dev Mode (Skip verification, for local dev)                      | boolean                | `false`               |
| `ENABLE_EMAIL_VERIFICATION`     | Whether to enable Email Verification                                       | boolean                | `false`               |
| `ENABLE_SESSION_VERIFICATION`   | Whether to enable Session Verification Middleware                          | boolean                | `true`                |
| `ENABLE_MULTI_DEVICE_LOGIN`     | Whether to allow multi-device login simultaneously                         | boolean                | `true`                |
| `MAX_TOKENS_PER_CLIENT`         | Max tokens per client per user                                             | integer                | `10`                  |
| `DEVICE_TRUST_DURATION_DAYS`    | Device Trust Duration Days                                                 | integer                | `30`                  |
| `EMAIL_PROVIDER`                | Email Provider: smtp (SMTP) or mailersend (MailerSend)                     | enum(smtp, mailersend) | `smtp`                |
| `SMTP_SERVER`                   | SMTP Server Address                                                        | string                 | `localhost`           |
| `SMTP_PORT`                     | SMTP Server Port                                                           | integer                | `587`                 |
| `SMTP_USERNAME`                 | SMTP Username                                                              | string                 | `""`                  |
| `SMTP_PASSWORD`                 | SMTP Password                                                              | string                 | `""`                  |
| `FROM_EMAIL`                    | Sender Email                                                               | string                 | `noreply@example.com` |
| `FROM_NAME`                     | Sender Name                                                                | string                 | `osu! server`         |
| `MAILERSEND_API_KEY`            | MailerSend API Key                                                         | string                 | `""`                  |
| `MAILERSEND_FROM_EMAIL`         | MailerSend Sender Email (Need verification in MailerSend)                  | string                 | `""`                  |

## Monitoring Settings

Configure application monitoring options, such as Sentry and New Relic.

Place `newrelic.ini` config file in the project root to automatically enable New
Relic monitoring. If config file does not exist or newrelic package is not
installed, New Relic initialization will be skipped.

| Variable Name           | Description                                                    | Type                | Default Value |
| ----------------------- | -------------------------------------------------------------- | ------------------- | ------------- |
| `SENTRY_DSN`            | Sentry DSN, empty to disable Sentry                            | string (url) / null | `null`        |
| `NEW_RELIC_ENVIRONMENT` | New Relic Environment ID, set to "production" or "development" | string / null       | `null`        |

## GeoIP Settings

| Variable Name         | Description                                         | Type    | Default Value |
| --------------------- | --------------------------------------------------- | ------- | ------------- |
| `MAXMIND_LICENSE_KEY` | MaxMind License Key (For downloading offline IP DB) | string  | `""`          |
| `GEOIP_DEST_DIR`      | GeoIP Database Storage Directory                    | string  | `./geoip`     |
| `GEOIP_UPDATE_DAY`    | GeoIP Weekly Update Day (0=Mon, 6=Sun)              | integer | `1`           |
| `GEOIP_UPDATE_HOUR`   | GeoIP Weekly Update Hour (0-23)                     | integer | `2`           |

## Game Settings

| Variable Name                              | Description                                                                                                                      | Type                        | Default Value  |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------- |
| `ENABLE_RX` (`ENABLE_RX`, `ENABLE_OSU_RX`) | Enable RX mod statistics                                                                                                         | boolean                     | `false`        |
| `ENABLE_AP` (`ENABLE_AP`, `ENABLE_OSU_AP`) | Enable AP mod statistics                                                                                                         | boolean                     | `false`        |
| `ENABLE_SUPPORTER_FOR_ALL_USERS`           | Enable supporter status for all new users                                                                                        | boolean                     | `false`        |
| `ENABLE_ALL_BEATMAP_LEADERBOARD`           | Enable leaderboards for all beatmaps                                                                                             | boolean                     | `false`        |
| `ENABLE_ALL_BEATMAP_PP`                    | Allow any beatmap to gain PP                                                                                                     | boolean                     | `false`        |
| `SEASONAL_BACKGROUNDS`                     | Seasonal Background URL List                                                                                                     | array[string]               | `[]`           |
| `BEATMAP_TAG_TOP_COUNT`                    | Minimum votes required for tags to be shown in result list                                                                       | integer                     | `2`            |
| `OLD_SCORE_PROCESSING_MODE`                | Old Score Processing Mode<br/>strict: delete all related scores, pp, stats, replays<br/>normal: delete pp and leaderboard scores | enum(strict, normal)        | `normal`       |
| `SCORING_MODE`                             | Scoring Mode: standardised or classic                                                                                            | enum(standardised, classic) | `standardised` |

## Performance Calculation Settings

Configure performance calculator and its parameters.

### [osu-performance-server](https://github.com/GooGuTeam/osu-performance-server) (Default)

```bash
CALCULATOR="performance_server"
CALCULATOR_CONFIG='{
    "server_url": "http://localhost:5225"
}'
```

### rosu-pp-py

```bash
CALCULATOR="rosu"
CALCULATOR_CONFIG='{}'
```

| Variable Name               | Description                                                                      | Type                           | Default Value                             |
| --------------------------- | -------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------- |
| `CALCULATOR`                | Performance Calculator                                                           | enum(rosu, performance_server) | `performance_server`                      |
| `CALCULATOR_CONFIG`         | Performance Calculator Config (JSON format), see above for details               | object[string, any]            | `{"server_url": "http://localhost:5225"}` |
| `FALLBACK_NO_CALCULATOR_PP` | Use simplified pp calculation as fallback when calculator doesn't support a mode | boolean                        | `false`                                   |

## Cache Settings

### Beatmap Cache

| Variable Name                     | Description                           | Type    | Default Value |
| --------------------------------- | ------------------------------------- | ------- | ------------- |
| `ENABLE_BEATMAP_PRELOAD`          | Enable Beatmap Cache Preload          | boolean | `true`        |
| `BEATMAP_CACHE_EXPIRE_HOURS`      | Beatmap Cache Expiration (Hours)      | integer | `24`          |
| `BEATMAPSET_CACHE_EXPIRE_SECONDS` | Beatmapset Cache Expiration (Seconds) | integer | `3600`        |

### Leaderboard Cache

| Variable Name                            | Description                                  | Type    | Default Value |
| ---------------------------------------- | -------------------------------------------- | ------- | ------------- |
| `ENABLE_RANKING_CACHE`                   | Enable Leaderboard Cache                     | boolean | `true`        |
| `RANKING_CACHE_EXPIRE_MINUTES`           | Leaderboard Cache Expiration (Minutes)       | integer | `10`          |
| `RANKING_CACHE_REFRESH_INTERVAL_MINUTES` | Leaderboard Cache Refresh Interval (Minutes) | integer | `10`          |
| `RANKING_CACHE_MAX_PAGES`                | Max Cached Pages                             | integer | `20`          |
| `RANKING_CACHE_TOP_COUNTRIES`            | Cache Top N Country Leaderboards             | integer | `20`          |

### User Cache

| Variable Name                           | Description                                 | Type    | Default Value |
| --------------------------------------- | ------------------------------------------- | ------- | ------------- |
| `ENABLE_USER_CACHE_PRELOAD`             | Enable User Cache Preload                   | boolean | `true`        |
| `USER_CACHE_EXPIRE_SECONDS`             | User Cache Expiration (Seconds)             | integer | `300`         |
| `USER_SCORES_CACHE_EXPIRE_SECONDS`      | User Scores Cache Expiration (Seconds)      | integer | `60`          |
| `USER_BEATMAPSETS_CACHE_EXPIRE_SECONDS` | User Beatmapsets Cache Expiration (Seconds) | integer | `600`         |
| `USER_CACHE_MAX_PRELOAD_USERS`          | Max Preloaded Users                         | integer | `200`         |

## Asset Proxy Settings

| Variable Name          | Description                     | Type    | Default Value |
| ---------------------- | ------------------------------- | ------- | ------------- |
| `ENABLE_ASSET_PROXY`   | Enable Asset Proxy              | boolean | `false`       |
| `CUSTOM_ASSET_DOMAIN`  | Custom Asset Domain             | string  | `g0v0.top`    |
| `ASSET_PROXY_PREFIX`   | Custom prefix for assets.ppy.sh | string  | `assets-ppy`  |
| `AVATAR_PROXY_PREFIX`  | Custom prefix for a.ppy.sh      | string  | `a-ppy`       |
| `BEATMAP_PROXY_PREFIX` | Custom prefix for b.ppy.sh      | string  | `b-ppy`       |

## Beatmap Sync Settings

| Variable Name                   | Description                          | Type    | Default Value |
| ------------------------------- | ------------------------------------ | ------- | ------------- |
| `ENABLE_AUTO_BEATMAP_SYNC`      | Enable Auto Beatmap Sync             | boolean | `false`       |
| `BEATMAP_SYNC_INTERVAL_MINUTES` | Auto Beatmap Sync Interval (Minutes) | integer | `60`          |

## Anti-Cheat Settings

| Variable Name            | Description                                                                                       | Type          | Default Value                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| `SUSPICIOUS_SCORE_CHECK` | Enable Suspicious Score Check (pp>3000)                                                           | boolean       | `true`                                                                                        |
| `BANNED_NAME`            | Banned Username List                                                                              | array[string] | `["mrekk", "vaxei", "btmc", "cookiezi", "peppy", "saragi", "chocomint"]`                      |
| `ALLOW_DELETE_SCORES`    | Allow users to delete their own scores                                                            | boolean       | `false`                                                                                       |
| `CHECK_RULESET_VERSION`  | Check Custom Ruleset Version                                                                      | boolean       | `true`                                                                                        |
| `CHECK_CLIENT_VERSION`   | Check Client Version                                                                              | boolean       | `true`                                                                                        |
| `CLIENT_VERSION_URLS`    | Client Version List URLs. See <https://github.com/GooGuTeam/g0v0-client-versions> to add your own | array[string] | `["https://raw.githubusercontent.com/GooGuTeam/g0v0-client-versions/main/version_list.json"]` |

## Storage Service Settings

Used for storing replay files, avatars, etc.

### Local Storage (Recommended for Development)

Local storage saves files in the server's local file system, suitable for
development and small-scale deployment.

```bash
STORAGE_SERVICE="local"
STORAGE_SETTINGS='{"local_storage_path": "./storage"}'
```

### Cloudflare R2 Storage (Recommended for Production)

```bash
STORAGE_SERVICE="r2"
STORAGE_SETTINGS='{
  "r2_account_id": "your_cloudflare_account_id",
  "r2_access_key_id": "your_r2_access_key_id",
  "r2_secret_access_key": "your_r2_secret_access_key",
  "r2_bucket_name": "your_bucket_name",
  "r2_public_url_base": "https://your-custom-domain.com"
}'
```

### AWS S3 Storage

```bash
STORAGE_SERVICE="s3"
STORAGE_SETTINGS='{
  "s3_access_key_id": "your_aws_access_key_id",
  "s3_secret_access_key": "your_aws_secret_access_key",
  "s3_bucket_name": "your_s3_bucket_name",
  "s3_region_name": "us-east-1",
  "s3_public_url_base": "https://your-custom-domain.com"
}'
```

| Variable Name      | Description                          | Type                                                               | Default Value                        |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------ | ------------------------------------ |
| `STORAGE_SERVICE`  | Storage Service Type: local, r2, s3  | enum(local, r2, s3)                                                | `local`                              |
| `STORAGE_SETTINGS` | Storage Service Configuration (JSON) | LocalStorageSettings / CloudflareR2Settings / AWSS3StorageSettings | `{"local_storage_path":"./storage"}` |

## Spectator Server Settings

| Variable Name                    | Description                                                             | Type         | Default Value           |
| -------------------------------- | ----------------------------------------------------------------------- | ------------ | ----------------------- |
| `SAVE_REPLAYS`                   | Whether to save replays, set to `1` to enable                           | boolean      | `0`                     |
| `REDIS_HOST`                     | Redis Server Address                                                    | string       | `localhost`             |
| `SHARED_INTEROP_DOMAIN`          | API Server (this service) Address                                       | string (url) | `http://localhost:8000` |
| `SERVER_PORT`                    | Spectator Server Port                                                   | integer      | `8006`                  |
| `SP_SENTRY_DSN`                  | Spectator Server Sentry DSN                                             | string       | `null`                  |
| `MATCHMAKING_ROOM_ROUNDS`        | Matchmaking Room Rounds                                                 | integer      | 5                       |
| `MATCHMAKING_ALLOW_SKIP`         | Whether to allow users to skip matchmaking phase                        | boolean      | false                   |
| `MATCHMAKING_LOBBY_UPDATE_RATE`  | Matchmaking Lobby Update Rate (Seconds)                                 | integer      | 5                       |
| `MATCHMAKING_QUEUE_UPDATE_RATE`  | Matchmaking Queue Update Rate (Seconds)                                 | integer      | 1                       |
| `MATCHMAKING_QUEUE_BAN_DURATION` | Ban duration for players rejecting invitations in matchmaking (Seconds) | integer      | 60                      |
| `MATCHMAKING_POOL_SIZE`          | Number of beatmaps in each matchmaking room                             | integer      | 50                      |
