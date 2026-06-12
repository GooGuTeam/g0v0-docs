---
---

# 自定义你的服务器

上一节介绍了如何使用 Docker 快速部署 g0v0。但是你的服务器还需要一些自定义配置才能正常运行。本节将介绍如何自定义你的 g0v0。

## 配置反向代理

前端在加载头像、谱面封面、静态资源等图片时，资源实际来自以下三个 osu! 官方域名：

| 上游域名        | 内容         |
| --------------- | ------------ |
| `a.ppy.sh`      | 用户头像     |
| `b.ppy.sh`      | 谱面封面图片 |
| `assets.ppy.sh` | 静态资源     |

由于浏览器的跨域限制（CORS），当前端域名与这些资源域名不一致时，图片可能无法正常加载。通过在你自己的域名下为这三个上游分别配置 NGINX 反代，并在反代层返回正确的 CORS 响应头，可以使前端正常加载这些图片。

配置反代前，先在 `.env` 中启用资源代理功能并设置相关参数：

```dotenv
ENABLE_ASSET_PROXY=true
CUSTOM_ASSET_DOMAIN=your-server-domain.com   # 你的服务器域名
AVATAR_PROXY_PREFIX=a-ppy                    # a.ppy.sh 的子域名前缀，可自定义
BEATMAP_PROXY_PREFIX=b-ppy                   # b.ppy.sh 的子域名前缀，可自定义
ASSET_PROXY_PREFIX=assets-ppy               # assets.ppy.sh 的子域名前缀，可自定义
```

完整配置说明请参考[配置](../reference/configurations.md)。修改前缀后，NGINX 配置中的
`server_name` 也要同步修改。

参考 NGINX 配置如下（只保留关键部分，证书和 HTTP 跳转请按你的环境补充）：

```nginx
# 放在 http {} 中，为静态资源反代启用缓存
proxy_cache_path /var/cache/nginx/ppy-assets
    levels=1:2
    keys_zone=ppy_assets:50m
    inactive=7d
    max_size=10g;

server {
    listen 443 ssl;
    server_name a-ppy.your-server-domain.com;  # 头像

    location / {
        proxy_pass https://a.ppy.sh;
        proxy_ssl_server_name on;
        proxy_ssl_name a.ppy.sh;
        proxy_set_header Host a.ppy.sh;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, Accept, Content-Type" always;
    }
}

server {
    listen 443 ssl;
    server_name b-ppy.your-server-domain.com;  # 谱面封面

    location / {
        proxy_pass https://b.ppy.sh;
        proxy_ssl_server_name on;
        proxy_ssl_name b.ppy.sh;
        proxy_set_header Host b.ppy.sh;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, Accept, Content-Type" always;
    }
}

server {
    listen 443 ssl;
    server_name assets-ppy.your-server-domain.com;  # 静态资源

    location / {
        proxy_pass https://assets.ppy.sh;
        proxy_ssl_server_name on;
        proxy_ssl_name assets.ppy.sh;
        proxy_set_header Host assets.ppy.sh;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, Accept, Content-Type" always;

        proxy_cache ppy_assets;
        proxy_cache_valid 200 301 302 1d;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status always;
    }
}
```

`assets-ppy` 主要提供静态资源，适合开启 `proxy_cache`；`a-ppy` 和 `b-ppy`
以图片为主，按需决定是否启用缓存。即使不使用
`proxy_cache`，也建议为这些资源设置合适的 `Cache-Control` 或
`expires`，避免旧资源长期被客户端或边缘节点缓存。

## 设置 Fetcher

新建的 g0v0 不存在任何谱面数据，其使用 Fetcher 从 osu!
Bancho 获取谱面。下面介绍如何配置 Fetcher。

### 获取 osu 开放授权

Fetcher 基于 osu! API v2 工作，因此你需要一个 osu! API v2 开放授权。前往
[osu! 设置](https://osu.ppy.sh/home/account/edit#new-oauth-application)
创建一个新的 OAuth 应用，填写以下信息：

- 应用名称：任意名称，例如 `g0v0 Fetcher`
- 重定向 URI：`http://your-server-url.com/fetcher/callback`，将
  `your-server-url.com` 替换为你的服务器地址。

创建后记下客户端 ID 和客户端密钥，稍后配置 Fetcher 时会用到。

### 配置 Fetcher

编辑 `.env`，添加以下配置：

```dotenv
FETCHER_CLIENT_ID="你的客户端 ID"
FETCHER_CLIENT_SECRET="你的客户端密钥"
```

保存后重启 g0v0 服务器。这样 Fetcher 就配置完成了。当服务器接收到不存在的谱面的请求时，Fetcher 会自动从 osu!
Bancho 获取谱面数据。,,

## 用户会话安全

g0v0 内置了一系列用户会话安全设置：

- 邮件或 TOTP 双重验证
- 多设备登录限制
- 设备指纹识别

### 配置邮件服务 (SMTP)

编辑 `.env`，添加以下配置：

```dotenv
ENABLE_EMAIL_VERIFICATION=true
EMAIL_PROVIDER=smtp
SMTP_SERVER="smtp.your-email-provider.com"
SMTP_USERNAME="your-email-username"
SMTP_PASSWORD="your-email-password"
SMTP_PORT=587  # 根据你的邮件服务提供商设置端口，通常是 587 或 465。
FROM_EMAIL="noreply@your-server-url.com"
FROM_NAME="Your Server Name"
```

保存后重启 g0v0 服务器。这样邮件服务就配置完成了。

### 配置 TOTP

g0v0 默认启用 TOTP 双重验证。你可以通过编辑 `.env` 来禁用它：

```dotenv
ENABLE_TOTP_VERIFICATION=false
```

或者修改 TOTP 的发行者名称、服务名称等：

```dotenv
TOTP_ISSUER="Your Server Name"
TOTP_SERVICE_NAME="your-server-url.com"
# 在TOTP标签中使用用户名而不是邮箱
TOTP_USE_USERNAME_IN_LABEL=true
```

### 配置设备及会话

g0v0 支持多设备登录限制和设备指纹识别。你可以通过编辑 `.env` 来配置这些设置：

```dotenv
# 是否允许多设备同时登录
ENABLE_MULTI_DEVICE_LOGIN=true
# 设备信任持续天数
DEVICE_TRUST_DURATION_DAYS=30
# 每个用户每个客户端的最大令牌数量
MAX_TOKENS_PER_USER_PER_CLIENT=5
```

## 启用 Relax/Autopilot 统计信息

g0v0 支持 Relax/Autopilot
Mod 统计信息。但是这个功能默认是关闭的。你需要在配置文件中启用它。

编辑 `.env`，添加以下配置：

```dotenv
ENABLE_RX=true
ENABLE_AP=true
```

此外，由于客户端的限制，你无法直接在游戏内查看 Relax/Autopilot 的成绩排行榜。g0v0 提供了一种替代方法：使用筛选当前 mod 组合来查看成绩排行榜。由于这个功能需要 osu! 支持者，因此建议启用所有新注册用户的支持者状态。

编辑 `.env`，添加以下配置：

```dotenv
ENABLE_SUPPORTER_FOR_ALL_USERS=true
```

保存后重启 g0v0 服务器。服务器会自动创建 Relax/Autopilot 统计信息。

## 配置谱面的排行榜

g0v0 支持为没有排行榜的谱面强制启用排行榜。这些图会在客户端内显示 Approved 状态。

编辑 `.env`，添加以下配置：

```dotenv
ENABLE_ALL_BEATMAP_LEADERBOARD=true
```

## 配置可获得 pp 的谱面和 mod

g0v0 支持强制启用非上架谱面的 pp 计算。编辑 `.env`，添加以下配置：

```dotenv
ENABLE_ALL_BEATMAP_PP=true
```

此外，你还可以配置哪些 mod 可以获得 pp。

对于启用全部 mod 或恢复默认可获得 pp 的 mod，我们提供了一个脚本来简化操作：

```sh
# 添加 --all 参数以启用所有 mod
docker exec -it g0v0-server uv run --no-sync tools/generate_ranked_mods.py
```

对于更精细的控制，你可以编辑 `config/ranked_mods.json`
文件，添加或删除你想要的 mod。结构如下：

```json
{
  "0": {  // 游戏模式 ID，查看首页的支持的 ruleset 表格获取 ID。
    "EZ": {  // mod 缩写。
      "retries": {
        "type": "number",  // 类型是必须的。查看 https://github.com/GooGuTeam/g0v0-server/blob/main/static/mods.json 获取这个字段的类型。
        "eq": 2  // 该值需要等于此值。
      }
    },
    "NF": {},  // 没有内容表示允许所有设置。
    "HT": {
      "speed_change": {
        "type": "number",
        "eq": 0.75
      },
      "adjust_pitch": {
        "check": false,  // 标记 `check` 为 `false` 以跳过此字段的检查。
        "type": "boolean"
      }
    },
    "DT": {
      "speed_change": {
        "type": "number",
        "le": 2,  // 传递给 pydantic 的参数以进行验证，详见 https://docs.pydantic.dev/latest/concepts/fields/
        "ge": 1
      }
      // 其他未定义的设置则不允许。
    }
    // 未在此处定义的 mod 不允许。
  },
  "1": {...},
  "$mods_checksum": "md5-checksum of static/mods.json"  // 这个字段不要修改，除非服务器报错提示 checksum 不匹配。
}
```

保存后重启 g0v0 服务器。服务器会根据配置更新可获得 pp 的谱面和 mod。如果需要重新计算 pp，请参考[重新计算](../maintenance/recalculate.md)一节。

## 设置节日背景图

g0v0 支持节日背景图功能。你可以自由设置在客户端显示的节日背景图。

编辑 `.env`，添加以下配置：

```dotenv
SEASONAL_BACKGROUNDS=["url1","url2","url3"]
```

## 启用自定义 ruleset 支持

g0v0 支持自定义 ruleset。如果你想启用自定义 ruleset 支持，前往
[GitHub](https://github.com/GooGuTeam/custom-rulesets/releases/latest)
下载自定义 ruleset，并将它们放到 `rulesets/` 目录下。
