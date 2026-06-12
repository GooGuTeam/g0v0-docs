# Connect to the Server from the osu!(lazer) Client

The osu!(lazer) client does not natively support connecting to a server via
command line (`-devserver`) like osu!(stable). Therefore, to connect to your
server, you need to use a custom osu!(lazer) client modified by
us—[osu! GU](https://github.com/GooGuTeam/osu), or use
[LazerAuthlibInjection](https://github.com/MingxuanGame/LazerAuthlibInjection)
to inject the connection configuration into the client.

## Using osu! GU

This method is recommended for all users who can run osu!(lazer) on their
platform.

### Steps

1. **Download osu! GU**

   Download the latest version from
   [GitHub Releases](https://github.com/GooGuTeam/osu/releases/latest).

2. **Configure the Server URL**

   In the osu!(lazer) settings, find the "Online" section, locate the "Custom
   API Server URL" setting, and enter your server address in the input field
   (e.g., `lazer-api.g0v0.top`).

   ![osu-gu-connect-to-server](/public/images/osu-gu-connect-to-server-en.jpg)

3. **Restart the Client**

   After entering the URL, exit osu!(lazer) and restart it for the changes to
   take effect.

## Using LazerAuthlibInjection

[LazerAuthlibInjection](https://github.com/MingxuanGame/LazerAuthlibInjection)
is a ruleset that adds custom server support to the official osu!(lazer) client.

:::danger Danger

**This will result in your osu! account being banned!**

The official osu! team has explicitly stated that using LazerAuthlibInjection
and similar injection rulesets to connect to official servers will result in
account bans
([see this issue](https://github.com/Cai1Hsu/osu-plugins/issues/93)).

Only use this tool on **private development servers**, and ensure you have
logged out of or disconnected from the official servers before using it.

This project is not affiliated with or endorsed by the official osu! team. **Use
at your own risk.** **Do not report any issues regarding this ruleset to the
official osu! team.**

:::

### Supported Platforms

- Linux (amd64, arm64)
- Windows (amd64, arm64)
- macOS (Intel, Apple Silicon)

### Installation Steps

1. **Open the osu! Data Directory**

   In the settings panel, click `Open osu! folder` to open the osu! data
   directory.

   Default locations:
   - Windows: `%AppData%\osu!`
   - Linux: `~/.local/share/osu`
   - macOS: `~/Library/Application Support/osu`

2. **Install EnhancedAuth**

   Download the latest version from the
   [Releases page](https://github.com/MingxuanGame/LazerAuthlibInjection/releases/latest),
   and copy `osu.Game.Rulesets.EnhancedAuth.dll` to the `rulesets` directory.

::: tip Migrating from the old version If you previously used
`osu.Game.Rulesets.AuthlibInjection.dll`, please delete that file first. :::

3. **Configure LazerAuthlibInjection**

   In the settings panel, click `Rulesets`, then configure:
   - `API Url`: Your custom server API URL (e.g., `https://lazer-api.g0v0.top`)
   - `Website Url`: Your custom server website URL (e.g.,
     `https://lazer.g0v0.top`)

   Then click `Save Changes` to save the settings.

   ![authlib-injection-settings](/public/images/lazer-authlib-injection-connect-to-server-en.jpg)

4. **Restart the Client**

   Restart osu!(lazer) for the configuration to take effect.

### Command Line Arguments

You can also pass settings via command line arguments:

| Argument                   | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `--api-url` / `-devserver` | API URL                                                              |
| `--website-url`            | Website URL                                                          |
| `--client-id`              | Client ID                                                            |
| `--client-secret`          | Client Secret                                                        |
| `--spectator-url`          | Spectator service URL                                                |
| `--multiplayer-url`        | Multiplayer service URL                                              |
| `--metadata-url`           | Metadata service URL                                                 |
| `--bss-url`                | Beatmap submission service URL                                       |
| `--disable-sentry-logger`  | Disable sending Sentry logs to the official osu! servers             |
| `--non-g0v0-server`        | Disable g0v0-server specific features (Relax, custom ruleset scores) |

**Example:**

```bash
osu!.exe --api-url=lazer-api.g0v0.top --website-url=lazer.g0v0.top --disable-sentry-logger
```
