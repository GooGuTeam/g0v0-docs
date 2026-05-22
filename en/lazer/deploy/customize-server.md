---
---

# Customize Your Server

The previous section introduced how to quickly deploy g0v0 using Docker.
However, your server still needs some custom configurations to run properly.
This section will introduce how to customize your g0v0.

## Configure Reverse Proxy

When the frontend loads avatars, beatmap covers, and other static images, the
resources come from three official osu! domains:

| Upstream Domain | Content        |
| --------------- | -------------- |
| `a.ppy.sh`      | User avatars   |
| `b.ppy.sh`      | Beatmap covers |
| `assets.ppy.sh` | Static assets  |

Because of browser CORS restrictions, images may fail to load when the frontend
domain differs from these resource domains. By setting up NGINX reverse proxies
for these three upstreams under your own domain and returning the correct CORS
response headers, the frontend can load these images without issues.

Before configuring the reverse proxy, enable the asset proxy feature in `.env`
and set the related options:

```dotenv
ENABLE_ASSET_PROXY=true
CUSTOM_ASSET_DOMAIN=your-server-domain.com   # your server domain
AVATAR_PROXY_PREFIX=a-ppy                    # subdomain prefix for a.ppy.sh, customizable
BEATMAP_PROXY_PREFIX=b-ppy                   # subdomain prefix for b.ppy.sh, customizable
ASSET_PROXY_PREFIX=assets-ppy               # subdomain prefix for assets.ppy.sh, customizable
```

For the full description of these settings, see
[Configurations](../reference/configurations.md). If you change the prefix
values, update the `server_name` directives in the NGINX configuration
accordingly.

Example NGINX configuration (key parts only; add certificates and HTTP-to-HTTPS
redirects for your own environment):

```nginx
# Put this inside http {} to enable proxy caching for static assets.
proxy_cache_path /var/cache/nginx/ppy-assets
    levels=1:2
    keys_zone=ppy_assets:50m
    inactive=7d
    max_size=10g;

server {
    listen 443 ssl;
    server_name a-ppy.your-server-domain.com;  # avatars

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
    server_name b-ppy.your-server-domain.com;  # beatmap covers

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
    server_name assets-ppy.your-server-domain.com;  # static assets

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

`assets-ppy` mainly serves static resources and is a good candidate for
`proxy_cache`. For `a-ppy` and `b-ppy`, enable caching as needed. Even if you do
not use `proxy_cache`, it is recommended to set appropriate `Cache-Control`
headers or `expires` rules so clients and edge nodes do not keep serving
outdated files.

## Set up Fetcher

A newly created g0v0 does not contain any beatmap data. It uses Fetcher to fetch
beatmaps from osu! Bancho. Below is how to configure Fetcher.

### Get osu! OAuth Grant

Fetcher works based on osu! API v2, so you need an osu! API v2 OAuth grant. Go
to [osu! Settings](https://osu.ppy.sh/home/account/edit#new-oauth-application)
to create a new OAuth application and fill in the following information:

- Application Name: Any name, e.g., `g0v0 Fetcher`
- Redirect URI: `http://your-server-url.com/fetcher/callback`, replace
  `your-server-url.com` with your server address.

After creation, note down the Client ID and Client Secret, which will be used
later when configuring Fetcher.

### Configure Fetcher

Edit `.env` and add the following configuration:

```dotenv
FETCHER_CLIENT_ID="Your Client ID"
FETCHER_CLIENT_SECRET="Your Client Secret"
```

Save and restart the g0v0 server. Now Fetcher is configured. When the server
receives a request for a non-existent beatmap request, Fetcher will
automatically fetch beatmap data from osu! Bancho.

## User Session Security

g0v0 has built-in user session security settings:

- Email or TOTP Two-Factor Authentication
- Multi-device login restriction
- Device fingerprinting

### Configure Email Service (SMTP)

Edit `.env` and add the following configuration:

```dotenv
ENABLE_EMAIL_VERIFICATION=true
EMAIL_PROVIDER=smtp
SMTP_SERVER="smtp.your-email-provider.com"
SMTP_USERNAME="your-email-username"
SMTP_PASSWORD="your-email-password"
SMTP_PORT=587  # Set port according to your email provider, usually 587 or 465.
FROM_EMAIL="noreply@your-server-url.com"
FROM_NAME="Your Server Name"
```

Save and restart the g0v0 server. Now the email service is configured.

### Configure TOTP

g0v0 enables TOTP Two-Factor Authentication by default. You can disable it by
editing `.env`:

```dotenv
ENABLE_TOTP_VERIFICATION=false
```

Or modify the TOTP issuer name, service name, etc.:

```dotenv
TOTP_ISSUER="Your Server Name"
TOTP_SERVICE_NAME="your-server-url.com"
# Use username instead of email in TOTP label
TOTP_USE_USERNAME_IN_LABEL=true
```

### Configure Devices and Sessions

g0v0 supports multi-device login restriction and device fingerprinting. You can
configure these settings by editing `.env`:

```dotenv
# Whether to allow multiple devices to login simultaneously
ENABLE_MULTI_DEVICE_LOGIN=true
# Device trust duration in days
DEVICE_TRUST_DURATION_DAYS=30
# Max tokens per user per client
MAX_TOKENS_PER_USER_PER_CLIENT=5
```

## Enable Relax/Autopilot Statistics

g0v0 supports Relax/Autopilot Mod statistics. However, this feature is disabled
by default. You need to enable it in the configuration file.

Edit `.env` and add the following configuration:

```dotenv
ENABLE_RX=true
ENABLE_AP=true
```

Additionally, due to client limitations, you cannot directly view
Relax/Autopilot score leaderboards in-game. g0v0 provides an alternative: view
score leaderboards by filtering the current mod combination. Since this feature
requires osu! supporter, it is recommended to enable supporter status for all
newly registered users.

Edit `.env` and add the following configuration:

```dotenv
ENABLE_SUPPORTER_FOR_ALL_USERS=true
```

Save and restart the g0v0 server. The server will automatically create
Relax/Autopilot statistics.

## Configure Beatmap Leaderboards

g0v0 supports forcing leaderboards for beatmaps that do not have one. These maps
will show as Approved status in the client.

Edit `.env` and add the following configuration:

```dotenv
ENABLE_ALL_BEATMAP_LEADERBOARD=true
```

## Configure PP for Beatmaps and Mods

g0v0 supports forcing pp calculation for unranked beatmaps. Edit `.env` and add
the following configuration:

```dotenv
ENABLE_ALL_BEATMAP_PP=true
```

Additionally, you can configure which mods can award pp.

For enabling all mods or restoring default ranked mods, we provide a script to
simplify the operation:

```sh
# Add --all argument to enable all mods
docker exec -it g0v0-server uv run --no-sync tools/generate_ranked_mods.py
```

For finer control, you can edit the `config/ranked_mods.json` file to add or
remove mods you want. The structure is as follows:

```json
{
  "0": {  // Game mode ID, check the Supported Rulesets table on the homepage for ID.
    "EZ": {  // mod abbreviation.
      "retries": {
        "type": "number",  // Type is required. Check https://github.com/GooGuTeam/g0v0-server/blob/main/static/mods.json for field types.
        "eq": 2  // The value must equal this value.
      }
    },
    "NF": {},  // Empty content means allow all settings.
    "HT": {
      "speed_change": {
        "type": "number",
        "eq": 0.75
      },
      "adjust_pitch": {
        "check": false,  // Mark `check` as `false` to skip checking this field.
        "type": "boolean"
      }
    },
    "DT": {
      "speed_change": {
        "type": "number",
        "le": 2,  // Arguments passed to pydantic for validation, see https://docs.pydantic.dev/latest/concepts/fields/
        "ge": 1
      }
      // Other undefined settings are not allowed.
    }
    // Mods not defined here are not allowed.
  },
  "1": {...},
  "$mods_checksum": "md5-checksum of static/mods.json"  // Do not modify this field unless the server reports a checksum mismatch error.
}
```

Save and restart the g0v0 server. The server will update ranked beatmaps and
mods according to the configuration. If you need to recalculate pp, please refer
to the
[Recalculate Performance Points and Statistics](../maintenance/recalculate-pp-and-stats.md)
section.

## Set Seasonal Backgrounds

g0v0 supports seasonal backgrounds. You can freely set seasonal backgrounds to
be displayed in the client.

Edit `.env` and add the following configuration:

```dotenv
SEASONAL_BACKGROUNDS=["url1","url2","url3"]
```

## Enable Custom Ruleset Support

g0v0 supports custom rulesets. If you want to enable custom ruleset support, go
to [GitHub](https://github.com/GooGuTeam/custom-rulesets/releases/latest) to
download custom rulesets and place them in the `rulesets/` directory.
