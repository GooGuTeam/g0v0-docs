---
---

# Deploy Project with Docker

This section will use Docker and Docker Compose to quickly set up a g0v0 server.

## Configure the Server

v1 is configured with the `.env` file in the server directory, while Realtime is
configured with the JSON files under the `v2-config/` directory.

We recommend using the [Config Generator](./config-generator) to generate these
configuration files.

You can also fill the configuration files in by hand with the help of the
[Configurations](../reference/configurations.md) page and the
[Realtime README](https://github.com/GooGuTeam/g0v0.Server.Realtime#configure-the-realtime-server).

## Get NGINX Configuration

```sh
mkdir nginx
curl https://raw.githubusercontent.com/GooGuTeam/g0v0-server/refs/heads/main/nginx/default.conf -o nginx/default.conf
```

## Create `docker-compose.yml`

Create a new `docker-compose.yml`, referring to the example below according to
your needs.

```yml
version: '3.8'

services:
  app:
    image: mingxuangame/g0v0-server:latest
    pull_policy: always
    container_name: g0v0-server
    environment:
      - MYSQL_HOST=mysql
      - MYSQL_PORT=3306
      - REDIS_URL=redis://redis:6379
      - CALCULATOR_CONFIG={"server_url":"http://performance-server:8080"}
    env_file:
      - .env
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      performance-server:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config

      # If you use local storage, enable these two.
      # - ./replays:/app/replays
      # - ./storage:/app/storage

      # If you enable New Relic. Enable this.
      # - ./newrelic.ini:/app/newrelic.ini:ro
    restart: unless-stopped
    networks:
      - osu-network

  mysql:
    image: mysql:8.0
    container_name: g0v0-mysql
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - g0v0-mysql_data:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
      timeout: 20s
      retries: 10
      interval: 10s
      start_period: 40s
    restart: unless-stopped
    networks:
      - osu-network

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

  nginx:
    image: nginx:1.25-alpine
    container_name: g0v0-nginx
    ports:
      - '8000:80'
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    restart: unless-stopped
    networks:
      - osu-network

  redis:
    image: redis:7-alpine
    container_name: g0v0-redis
    volumes:
      - g0v0-redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      timeout: 5s
      retries: 5
      interval: 10s
      start_period: 10s
    restart: unless-stopped
    networks:
      - osu-network
    command: redis-server --appendonly yes

  performance-server:
    # Image based on ppysb Relax algorithm: ghcr.io/googuteam/osu-performance-server-osurx:latest
    image: ghcr.io/googuteam/osu-performance-server:latest
    container_name: performance-server
    environment:
      - SAVE_BEATMAP_FILES=false
    volumes:
      - ./rulesets:/data/rulesets
    restart: unless-stopped
    networks:
      - osu-network

volumes:
  g0v0-mysql_data:
  g0v0-redis_data:

networks:
  osu-network:
    driver: bridge
```

## Start Service

```sh
docker-compose up -d
```

If everything goes well, your g0v0 should now be accessible via `SERVER_URL`.

```sh
$ curl http://your-server-url.com/health
{"status":"ok","timestamp":"2026-01-29T10:18:18.213896+00:00"}
```
