---
---

# Customize Your Server

The previous section introduced how to quickly deploy g0v0 using Docker.
However, your server still needs some custom configurations to run properly.
This section will introduce how to customize your g0v0.

## Set up Fetcher

A newly created g0v0 does not contain any beatmap data. It uses Fetcher to fetch
beatmaps from osu! Bancho. Below is how to configure Fetcher.

### Get osu! OAuth Grant

Fetcher works based on osu! API v2, so you need an osu! API v2 OAuth grant. Go
to [osu! Settings](https://osu.ppy.sh/home/account/edit#new-oauth-application)
to create a new OAuth application and fill in the following information:

- Application Name: Any name, e.g., `g0v0 Fetcher`
- Redirect URI: `http://your-server-url.com/oauth/callback`, replace
  `your-server-url.com` with your server address.

After creation, note down the Client ID and Client Secret, which will be used
later when configuring Fetcher.

### Configure Fetcher

Edit `.env` and add the following configuration:

```env
FETCHER_CLIENT_ID="Your Client ID"
FETCHER_CLIENT_SECRET="Your Client Secret"
```

Save and restart the g0v0 server. Now Fetcher is configured. When the server
receives a request for a non-existent beatmap, Fetcher will automatically fetch
beatmap data from osu! Bancho.

## Set up GeoIP

g0v0 uses the MaxMind GeoIP2 database to get users' geographical location
information. This is used to record users' IP addresses and display users'
countries/regions.

### Get MaxMind License Key

Go to [MaxMind Website](https://www.maxmind.com/en/accounts/current/license-key)
to create an account and get a License Key. You need to register for a free
account to get a License Key. Note down your License Key, which will be used
later when configuring GeoIP.

## Configure GeoIP

Edit `.env` and add the following configuration:

```env
MAXMIND_LICENSE_KEY="Your License Key"
```

Save and restart the g0v0 server. Now GeoIP is configured. The server will
automatically download and update the GeoIP database.

## User Session Security

g0v0 has built-in user session security settings:

- Email or TOTP Two-Factor Authentication
- Multi-device login restriction
- Device fingerprinting

### Configure Email Service (SMTP)

Edit `.env` and add the following configuration:

```env
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

```env
ENABLE_TOTP_VERIFICATION=false
```

Or modify the TOTP issuer name, service name, etc.:

```env
TOTP_ISSUER="Your Server Name"
TOTP_SERVICE_NAME="your-server-url.com"
# Use username instead of email in TOTP label
TOTP_USE_USERNAME_IN_LABEL=true
```

### Configure Devices and Sessions

g0v0 supports multi-device login restriction and device fingerprinting. You can
configure these settings by editing `.env`:

```env
# Whether to allow multiple devices to login simultaneously
ENABLE_MULTI_DEVICE_LOGIN=true
# Device trust duration in days
DEVICE_TRUST_DURATION_DAYS=30
# Max tokens per user per client
MAX_TOKENS_PER_USER_PER_CLIENT=5
```

Save and restart the g0v0 server. Now user session security settings are
configured.

## Enable Relax/Autopilot Statistics

g0v0 supports Relax/Autopilot Mod statistics. However, this feature is disabled
by default. You need to enable it in the configuration file.

Edit `.env` and add the following configuration:

```env
ENABLE_RX=true
ENABLE_AP=true
```

Additionally, due to client limitations, you cannot directly view
Relax/Autopilot score leaderboards in-game. g0v0 provides an alternative: view
score leaderboards by filtering the current mod combination. Since this feature
requires osu! supporter, it is recommended to enable supporter status for all
newly registered users.

Edit `.env` and add the following configuration:

```env
ENABLE_SUPPORTER_FOR_ALL_USERS=true
```

Save and restart the g0v0 server. The server will automatically create
Relax/Autopilot statistics.

## Configure Beatmap Leaderboards

g0v0 supports forcing leaderboards for beatmaps that do not have one. These maps
will show as Approved status in the client.

Edit `.env` and add the following configuration:

```env
ENABLE_ALL_BEATMAP_LEADERBOARD=true
```

## Configure PP for Beatmaps and Mods

g0v0 supports forcing pp calculation for unranked beatmaps. Edit `.env` and add
the following configuration:

```env
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

```env
SEASONAL_BACKGROUNDS=["url1","url2","url3"]
```

## Enable Custom Ruleset Support

g0v0 supports custom rulesets. If you want to enable custom ruleset support, go
to [GitHub](https://github.com/GooGuTeam/custom-rulesets/releases/latest) to
download custom rulesets and place them in the `rulesets/` directory.
