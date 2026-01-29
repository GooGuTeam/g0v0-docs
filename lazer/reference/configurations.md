---
editLink: false
lastUpdated: false
---

# 配置

## 数据库设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `MYSQL_HOST` | MySQL 服务器地址 | string | `localhost` |
| `MYSQL_PORT` | MySQL 服务器端口 | integer | `3306` |
| `MYSQL_DATABASE` | MySQL 数据库名称 | string | `osu_api` |
| `MYSQL_USER` | MySQL 用户名 | string | `osu_api` |
| `MYSQL_PASSWORD` | MySQL 密码 | string | `password` |
| `MYSQL_ROOT_PASSWORD` | MySQL root 密码 | string | `password` |
| `REDIS_URL` | Redis 连接 URL | string | `redis://127.0.0.1:6379` |

## JWT 设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `JWT_SECRET_KEY` | JWT 签名密钥 | string | `your_jwt_secret_here` |
| `JWT_ALGORITHM` | JWT 算法 | string | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 访问令牌过期时间（分钟） | integer | `1440` |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | 刷新令牌过期时间（分钟） | integer | `21600` |
| `JWT_AUDIENCE` | JWT 受众 | string | `5` |
| `JWT_ISSUER` | JWT 签发者 | string / null | `null` |

## OAuth 设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `OSU_CLIENT_ID` | OAuth 客户端 ID | integer | `5` |
| `OSU_CLIENT_SECRET` | OAuth 客户端密钥 | string | `FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk` |
| `OSU_WEB_CLIENT_ID` | Web OAuth 客户端 ID | integer | `6` |
| `OSU_WEB_CLIENT_SECRET` | Web OAuth 客户端密钥 | string | `your_osu_web_client_secret_here` |

## 服务器设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `HOST` | 服务器监听地址 | string | `0.0.0.0` |
| `PORT` | 服务器监听端口 | integer | `8000` |
| `DEBUG` | 是否启用调试模式 | boolean | `false` |
| `CORS_URLS` | 额外的 CORS 允许的域名列表 (JSON 格式) | array[string (url)] | `[]` |
| `SERVER_URL` | 服务器 URL | string (url) | `http://localhost:8000/` |
| `FRONTEND_URL` | 前端 URL，当访问从游戏打开的 URL 时会重定向到这个 URL，为空表示不重定向 | string (url) / null | `null` |
| `ENABLE_RATE_LIMIT` | 是否启用速率限制 | boolean | `true` |

## Fetcher 设置

Fetcher 用于从 osu! 官方 API 获取数据，使用 osu! 官方 API 的 OAuth 2.0 认证

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `FETCHER_CLIENT_ID` | Fetcher 客户端 ID | string | `""` |
| `FETCHER_CLIENT_SECRET` | Fetcher 客户端密钥 | string | `""` |

## 日志设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `LOG_LEVEL` | 日志级别 | string | `INFO` |

## 验证服务设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `ENABLE_TOTP_VERIFICATION` | 是否启用TOTP双因素验证 | boolean | `true` |
| `TOTP_ISSUER` | TOTP 认证器中的发行者名称 | string / null | `null` |
| `TOTP_SERVICE_NAME` | TOTP 认证器中显示的服务名称 | string | `g0v0! Lazer Server` |
| `TOTP_USE_USERNAME_IN_LABEL` | 在TOTP标签中使用用户名而不是邮箱 | boolean | `true` |
| `ENABLE_TURNSTILE_VERIFICATION` | 是否启用 Cloudflare Turnstile 验证（仅对非 osu! 客户端） | boolean | `false` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Secret Key | string | `""` |
| `TURNSTILE_DEV_MODE` | Turnstile 开发模式（跳过验证，用于本地开发） | boolean | `false` |
| `ENABLE_EMAIL_VERIFICATION` | 是否启用邮件验证功能 | boolean | `false` |
| `ENABLE_SESSION_VERIFICATION` | 是否启用会话验证中间件 | boolean | `true` |
| `ENABLE_MULTI_DEVICE_LOGIN` | 是否允许多设备同时登录 | boolean | `true` |
| `MAX_TOKENS_PER_CLIENT` | 每个用户每个客户端的最大令牌数量 | integer | `10` |
| `DEVICE_TRUST_DURATION_DAYS` | 设备信任持续天数 | integer | `30` |
| `EMAIL_PROVIDER` | 邮件发送提供商：smtp（SMTP）或 mailersend（MailerSend） | enum(smtp, mailersend) | `smtp` |
| `SMTP_SERVER` | SMTP 服务器地址 | string | `localhost` |
| `SMTP_PORT` | SMTP 服务器端口 | integer | `587` |
| `SMTP_USERNAME` | SMTP 用户名 | string | `""` |
| `SMTP_PASSWORD` | SMTP 密码 | string | `""` |
| `FROM_EMAIL` | 发件人邮箱 | string | `noreply@example.com` |
| `FROM_NAME` | 发件人名称 | string | `osu! server` |
| `MAILERSEND_API_KEY` | MailerSend API Key | string | `""` |
| `MAILERSEND_FROM_EMAIL` | MailerSend 发件人邮箱（需要在 MailerSend 中验证） | string | `""` |

## 监控设置

配置应用的监控选项，如 Sentry 和 New Relic。

将 newrelic.ini 配置文件放入项目根目录即可自动启用 New Relic 监控。如果配置文件不存在或 newrelic 包未安装，将跳过 New Relic 初始化。

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `SENTRY_DSN` | Sentry DSN，为空不启用 Sentry | string (url) / null | `null` |
| `NEW_RELIC_ENVIRONMENT` | New Relic 环境标识，设置为 "production" 或 "development" | string / null | `null` |

## GeoIP 配置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `MAXMIND_LICENSE_KEY` | MaxMind License Key（用于下载离线IP库） | string | `""` |
| `GEOIP_DEST_DIR` | GeoIP 数据库存储目录 | string | `./geoip` |
| `GEOIP_UPDATE_DAY` | GeoIP 每周更新的星期几（0=周一，6=周日） | integer | `1` |
| `GEOIP_UPDATE_HOUR` | GeoIP 每周更新时间（小时，0-23） | integer | `2` |

## 游戏设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `ENABLE_RX` (`ENABLE_RX`, `ENABLE_OSU_RX`) | 启用 RX mod 统计数据 | boolean | `false` |
| `ENABLE_AP` (`ENABLE_AP`, `ENABLE_OSU_AP`) | 启用 AP mod 统计数据 | boolean | `false` |
| `ENABLE_SUPPORTER_FOR_ALL_USERS` | 启用所有新注册用户的支持者状态 | boolean | `false` |
| `ENABLE_ALL_BEATMAP_LEADERBOARD` | 启用所有谱面的排行榜 | boolean | `false` |
| `ENABLE_ALL_BEATMAP_PP` | 允许任何谱面获得 PP | boolean | `false` |
| `SEASONAL_BACKGROUNDS` | 季节背景图 URL 列表 | array[string] | `[]` |
| `BEATMAP_TAG_TOP_COUNT` | 显示在结算列表的标签所需的最低票数 | integer | `2` |
| `OLD_SCORE_PROCESSING_MODE` | 旧成绩处理模式<br/>strict: 删除所有相关的成绩、pp、统计信息、回放<br/>normal: 删除 pp 和排行榜成绩 | enum(strict, normal) | `normal` |
| `SCORING_MODE` | 分数计算模式：standardised（标准化）或 classic（经典） | enum(standardised, classic) | `standardised` |

## 表现计算设置

配置表现分计算器及其参数。

### [osu-performance-server](https://github.com/GooGuTeam/osu-performance-server) (默认)

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

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `CALCULATOR` | 表现分计算器 | enum(rosu, performance_server) | `performance_server` |
| `CALCULATOR_CONFIG` | 表现分计算器配置 (JSON 格式)，具体配置项请参考上方 | object[string, any] | `{"server_url": "http://localhost:5225"}` |
| `FALLBACK_NO_CALCULATOR_PP` | 当计算器不支持某个模式时，使用简化的 pp 计算方法作为后备 | boolean | `false` |

## 缓存设置

### 谱面缓存

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `ENABLE_BEATMAP_PRELOAD` | 启用谱面缓存预加载 | boolean | `true` |
| `BEATMAP_CACHE_EXPIRE_HOURS` | 谱面缓存过期时间（小时） | integer | `24` |
| `BEATMAPSET_CACHE_EXPIRE_SECONDS` | Beatmapset 缓存过期时间（秒） | integer | `3600` |

### 排行榜缓存

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `ENABLE_RANKING_CACHE` | 启用排行榜缓存 | boolean | `true` |
| `RANKING_CACHE_EXPIRE_MINUTES` | 排行榜缓存过期时间（分钟） | integer | `10` |
| `RANKING_CACHE_REFRESH_INTERVAL_MINUTES` | 排行榜缓存刷新间隔（分钟） | integer | `10` |
| `RANKING_CACHE_MAX_PAGES` | 最多缓存的页数 | integer | `20` |
| `RANKING_CACHE_TOP_COUNTRIES` | 缓存前N个国家的排行榜 | integer | `20` |

### 用户缓存

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `ENABLE_USER_CACHE_PRELOAD` | 启用用户缓存预加载 | boolean | `true` |
| `USER_CACHE_EXPIRE_SECONDS` | 用户信息缓存过期时间（秒） | integer | `300` |
| `USER_SCORES_CACHE_EXPIRE_SECONDS` | 用户成绩缓存过期时间（秒） | integer | `60` |
| `USER_BEATMAPSETS_CACHE_EXPIRE_SECONDS` | 用户谱面集缓存过期时间（秒） | integer | `600` |
| `USER_CACHE_MAX_PRELOAD_USERS` | 最多预加载的用户数量 | integer | `200` |

## 资源代理设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `ENABLE_ASSET_PROXY` | 启用资源代理 | boolean | `false` |
| `CUSTOM_ASSET_DOMAIN` | 自定义资源域名 | string | `g0v0.top` |
| `ASSET_PROXY_PREFIX` | assets.ppy.sh 的自定义前缀 | string | `assets-ppy` |
| `AVATAR_PROXY_PREFIX` | a.ppy.sh 的自定义前缀 | string | `a-ppy` |
| `BEATMAP_PROXY_PREFIX` | b.ppy.sh 的自定义前缀 | string | `b-ppy` |

## 谱面同步设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `ENABLE_AUTO_BEATMAP_SYNC` | 启用自动谱面同步 | boolean | `false` |
| `BEATMAP_SYNC_INTERVAL_MINUTES` | 自动谱面同步间隔（分钟） | integer | `60` |

## 反作弊设置

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `SUSPICIOUS_SCORE_CHECK` | 启用可疑分数检查（pp>3000） | boolean | `true` |
| `BANNED_NAME` | 禁止使用的用户名列表 | array[string] | `["mrekk", "vaxei", "btmc", "cookiezi", "peppy", "saragi", "chocomint"]` |
| `ALLOW_DELETE_SCORES` | 允许用户删除自己的成绩 | boolean | `false` |
| `CHECK_RULESET_VERSION` | 检查自定义 ruleset 版本 | boolean | `true` |
| `CHECK_CLIENT_VERSION` | 检查客户端版本 | boolean | `true` |
| `CLIENT_VERSION_URLS` | 客户端版本列表 URL, 查看 <https://github.com/GooGuTeam/g0v0-client-versions> 来添加你自己的客户端 | array[string] | `["https://raw.githubusercontent.com/GooGuTeam/g0v0-client-versions/main/version_list.json"]` |

## 存储服务设置

用于存储回放文件、头像等静态资源。

### 本地存储 (推荐用于开发环境)

本地存储将文件保存在服务器的本地文件系统中，适合开发和小规模部署。

```bash
STORAGE_SERVICE="local"
STORAGE_SETTINGS='{"local_storage_path": "./storage"}'
```

### Cloudflare R2 存储 (推荐用于生产环境)

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

### AWS S3 存储

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

| 变量名 | 描述 | 类型 | 默认值 |
|------|------|--------|------|
| `STORAGE_SERVICE` | 存储服务类型：local、r2、s3 | enum(local, r2, s3) | `local` |
| `STORAGE_SETTINGS` | 存储服务配置 (JSON 格式) | LocalStorageSettings / CloudflareR2Settings / AWSS3StorageSettings | `{"local_storage_path":"./storage"}` |

## 旁观服务器设置

| 变量名 | 描述 | 类型 | 默认值 |
|--------|------|--------|--------|
| `SAVE_REPLAYS` | 是否保存回放，设置为 `1` 为启用 | boolean | `0` |
| `REDIS_HOST` | Redis 服务器地址 | string | `localhost` |
| `SHARED_INTEROP_DOMAIN` | API 服务器（即本服务）地址 | string (url) | `http://localhost:8000` |
| `SERVER_PORT` | 旁观服务器端口 | integer | `8006` |
| `SP_SENTRY_DSN` | 旁观服务器的 Sentry DSN | string | `null` |
| `MATCHMAKING_ROOM_ROUNDS` | 匹配对战房间的回合数 | integer | 5 |
| `MATCHMAKING_ALLOW_SKIP` | 是否允许用户跳过匹配阶段 | boolean | false |
| `MATCHMAKING_LOBBY_UPDATE_RATE` | 更新匹配大厅的频率（以秒为单位） | integer | 5 |
| `MATCHMAKING_QUEUE_UPDATE_RATE` | 更新匹配队列的频率（以秒为单位） | integer | 1 |
| `MATCHMAKING_QUEUE_BAN_DURATION` | 玩家拒绝邀请后暂时禁止进入匹配队列的时间（以秒为单位） | integer | 60 |
| `MATCHMAKING_POOL_SIZE` | 每个匹配房间的谱面数量 | integer | 50 |

> 上次生成：2026-01-11 08:30:41 UTC 于提交 [`8923d714a7d40df07bb885f4084ff610c81b018b`](https://github.com/GooGuTeam/g0v0-server/commit/8923d714a7d40df07bb885f4084ff610c81b018b)

> **注意: 在生产环境中，请务必更改默认的密钥和密码！**
