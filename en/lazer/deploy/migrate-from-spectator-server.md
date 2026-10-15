# Migrating from spectator-server

Since 2026/10/10, g0v0 has officially enabled the Realtime server of the V2
series as its real-time game server, and the old spectator-server is no longer
used.

Besides implementing everything the old spectator-server did, V2 Realtime also
implements the notification server and the chat API that used to be part of the
Python server. Its performance is significantly better than the old
spectator-server and Python notification server.

## If you still need to use spectator-server

:::warning Note

spectator-server has been deprecated and will no longer receive updates. We
recommend migrating to V2 Realtime as soon as possible.

:::

If you still need to use the old spectator-server, you can keep your existing
configuration and services. You only need to add

```env
ENABLE_V2_IPC=false
```

to your `.env` to keep using V1.

If you deployed from the g0v0-server GitHub repository source code, you also
need to roll the related Docker Compose files and the NGINX file back to commit
[1daecd8](https://github.com/GooGuTeam/g0v0-server/commit/1daecd8a46eec8682e9861bb146ad4672205e795)

```bash
# Roll back NGINX
git checkout 1daecd8 -- nginx/default.conf

# Roll back the Docker Compose files
git checkout 1daecd8 -- docker-compose.yml  # normal
git checkout 1daecd8 -- docker-compose-osurx.yml  # RX
```

## Modifying docker-compose.yml

Replace the spectator-server service in your original `docker-compose.yml` with
the following Realtime configuration:

```yml
realtime:
  image: ghcr.io/googuteam/g0v0.server.realtime:main
  environment:
    - ASPNETCORE_URLS=http://0.0.0.0:8080
  env_file:
    - .env
  depends_on:
    - app
    - mysql
    - redis
  restart: unless-stopped
  volumes:
    - ./v2-config:/app/config:ro
    - ./rulesets:/app/rulesets:ro

  # Enable this if you use local storage in g0v0.
  #   - ./storage:/app/storage
  networks:
    - osu-network
```

## Migrating the configuration

The V2 series uses a brand-new configuration format. All configuration is stored
as JSON, split across several files. The v1 `.env` has to be migrated into the
corresponding JSON files under the `v2-config` directory.

We provide an [online converter](./config-converter.md) that helps you convert
the v1 `.env` file into the v2 JSON configuration files. You can also refer to
the
[configuration documentation](https://github.com/GooGuTeam/g0v0.Server.Realtime#configure-the-realtime-server)
to migrate manually.

## Changing the server version

Along with this change we introduced a server version mechanism. On its first
start the server stores the initial version number (`0.1.0`) in
`config/server-ver`. You need to change this version number to `0.2.0` to
confirm that you have completed this migration.
