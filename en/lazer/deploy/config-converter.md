<script setup lang="ts">
import ConfigConverter from '../../../.vitepress/theme/components/ConfigConverter.vue';
</script>

# Config Converter

Convert the `.env` configuration file of
[g0v0-server v1](https://github.com/GooGuTeam/g0v0-server) into the set of
`config/*.json` files required by g0v0 server v2, with a one-click bundled
download.

The whole conversion runs locally in your browser — your configuration
(including database passwords, JWT secrets and other sensitive values) is never
uploaded anywhere.

<ConfigConverter />

## Usage

1. Paste the content of your v1 server's `.env` into the input box above, or use
   "Upload file" to pick the `.env` file (you can also click "Load sample" to
   try it out first).
2. Review the generated JSON files (`general.json`, `game.json`,
   `realtime.json`, `chat.json`, `storage.json`).
3. Click "Download all (.zip)", then extract the `config/` directory into the
   working directory of your v2 server (e.g. `g0v0.Server.Realtime`).

Missing variables fall back to the v2 defaults automatically. v1 variables that
have no v2 counterpart are listed below the converter so you can review them one
by one.

## Notes

- `UseLegacyDatabase` in `general.json` defaults to `true` (keep using the v1
  MySQL database). If you want to switch to the new v2 PostgreSQL database,
  untick the option in the "Other v2 settings" section and fill in
  `PostgresqlConnectionString`.
- `REDIS_URL` is converted into the `host:port` format that v2 expects (the
  `redis://` scheme and any embedded password are stripped).
- v2-only settings (such as the replay upload concurrency and multiplayer room
  limits in `realtime.json`, or the chat limits in `chat.json`) are generated
  with their defaults and can be tuned in the collapsible "Other v2 settings"
  section below the input box. See the
  [g0v0.Server.Realtime README](https://github.com/GooGuTeam/g0v0.Server.Realtime#configure-the-realtime-server)
  for the full field reference.
- `config/chat.json` is optional: when the file is absent, all chat limits use
  the defaults from osu-web.

## Working with other v2 services

The configuration generated on this page applies to the g0v0 server v2 series.
All v2 services share the database, JWT and storage settings from
`config/general.json`, so make sure every service uses the same `general.json`
and `storage.json` when migrating.
