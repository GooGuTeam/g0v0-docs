---
---

# 使用 Docker 部署项目

本节将使用 Docker 和 Docker Compose 快速搭建一个 g0v0 服务器。

## 创建 .env 文件

```sh
# 下载示例 .env
curl https://raw.githubusercontent.com/GooGuTeam/g0v0-server/refs/heads/main/.env.example -o .env
```

使用编辑器编辑 `.env`，编辑以下配置：

- `JWT_SECRET_KEY` JWT 密钥。使用 `openssl rand -hex 32` 生成。
- `SERVER_URL` 服务器对外开放地址。以 `http://` 或 `https://` 开头。
- `SENTRY_DSN` 和 `SP_SENTRY_DSN` [Sentry](https://sentry.io)
  DSN 地址。前者用于 API，后者用于 spectator-server。
- [存储服务相关设置](../reference/configurations#存储服务设置)。

修改配置后保存。

## 获取 NGINX 配置

```sh
mkdir nginx
curl https://raw.githubusercontent.com/GooGuTeam/g0v0-server/refs/heads/main/nginx/default.conf -o nginx/default.conf
```

## 创建 `docker-compose.yml`

新建 `docker-compose.yml`，根据你的需要参考下面的示例创建这个文件。

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

      # 如果你使用本地存储，启用这两个。
      # - ./replays:/app/replays
      # - ./storage:/app/storage

      # 如果启用 New Relic。启用这个。
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

  spectator:
    image: ghcr.io/googuteam/osu-server-spectator:master
    container_name: spectator-server
    pull_policy: always
    environment:
      - REPLAY_UPLOAD_THREADS=${REPLAY_UPLOAD_THREADS:-1}
      - TRACK_BUILD_USER_COUNTS=${TRACK_BUILD_USER_COUNTS:-}
      - SERVER_PORT=${SERVER_PORT:-80}
      - REDIS_HOST=redis
      - SENTRY_DSN=${SENTRY_DSN:-}
      - SHARED_INTEROP_DOMAIN=http://app:8000
      - SHARED_INTEROP_SECRET=${SHARED_INTEROP_SECRET:-}
      - MYSQL_HOST=mysql
      - MYSQL_PORT=3306
    env_file:
      - .env
    depends_on:
      - app
      - mysql
      - redis
    restart: unless-stopped
    volumes:
      - ./rulesets:/data/rulesets
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
    # 基于偏偏要上班 Relax 算法的镜像：ghcr.io/googuteam/osu-performance-server-osurx:latest
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

## 启动服务

```sh
docker-compose up -d
```

如果一切顺利，你的 g0v0 现在应该可以通过 `SERVER_URL` 访问了。

```sh
$ curl http://your-server-url.com/health
{"status":"ok","timestamp":"2026-01-29T10:18:18.213896+00:00"}
```
