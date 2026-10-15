# 从 spectator-server 迁移

从 2026/10/10 起，g0v0 正式启用了 V2 系列的 Realtime 作为实时游戏服务器，原有的 spectator-server 将不再使用。

V2
Realtime 除了实现了原有 spectator-server 的所有功能之外，还实现了 Python 部分原有的通知服务器和聊天接口。性能与原 spectator-server 和 Python 通知服务器相比有显著提升。

## 如果你仍然需要使用 spectator-server

:::warning 注意

spectator-server 已经被弃用且不会再进行更新。建议尽快迁移到 V2 Realtime。

:::

如果你仍然需要使用原有的 spectator-server，可以保留原有的配置和服务。只需要添加

```env
ENABLE_V2_IPC=false
```

到 `.env` 里面即可继续使用 V1。

如果你是使用 g0v0-server GitHub 仓库源代码部署的，还需要把相关的 Docker
Compose 文件和 NGINX 文件回滚到提交
[1daecd8](https://github.com/GooGuTeam/g0v0-server/commit/1daecd8a46eec8682e9861bb146ad4672205e795)

```bash
# 回滚 NGINX
git checkout 1daecd8 -- nginx/default.conf

# 回滚 Docker Compose 文件
git checkout 1daecd8 -- docker-compose.yml  # 普通
git checkout 1daecd8 -- docker-compose-osurx.yml  # RX
```

## 修改 docker-compose.yml

将原来的 `docker-compose.yml`
中的 spectator-server 服务部分替换为如下的 Realtime 配置：

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

  # 如果你在 g0v0 中使用本地存储，启用这个。
  #   - ./storage:/app/storage
  networks:
    - osu-network
```

## 迁移配置

V2 系列采用了全新的配置格式。所有配置均采用 JSON 且分文件存储。v1 的 `.env`
需要迁移到 `v2-config` 目录下的相应 JSON 文件中。

我们提供了一个[在线转换器](./config-converter.md) 来帮助你将 v1 的 `.env`
文件转换为 v2 的 JSON 配置文件。你也可以参考[配置文档](https://github.com/GooGuTeam/g0v0.Server.Realtime#configure-the-realtime-server)手动进行迁移。

## 修改服务器版本

随着这次更改，我们引入了服务器版本机制。服务器首次启动会在 `config/server-ver`
存入初始版本号（`0.1.0`）。你需要将此版本号修改为 `0.2.0`
来确保你完成了此次迁移。
