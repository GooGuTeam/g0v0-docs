---
---

# 添加每日挑战 (Daily Challenge)

可以通过脚本工具或直接操作 Redis 数据库来为服务器添加每日挑战。

## 通过工具添加

确保已经配置好项目环境变量（`.env`），然后运行以下 python 脚本：

```sh
python tools/add_daily_challenge.py
```

:::tip 提示如果你使用 Docker 部署 g0v0，请使用以下命令运行脚本：

```sh
docker exec -it g0v0-server uv run --no-sync python tools/add_daily_challenge.py
```

:::

脚本运行后，根据终端提示输入相应内容即可完成添加。

## 手动添加

你可以使用 `redis-cli`
或其他 Redis 管理工具连接到 Redis 数据库，通过设置 Hash 来添加每日挑战。

你需要设置如下 HashMap 结构：

```redis
HSET daily_challenge:%Y-%m-%d beatmap <谱面id>
HSET daily_challenge:%Y-%m-%d ruleset_id <游戏模式>
HSET daily_challenge:%Y-%m-%d required_mods [额外必需mod，可选，默认为空]
HSET daily_challenge:%Y-%m-%d allowed_mods [额外Freemod，可选，默认为全部（满足 `required_mods` 要求）]
```

### 参数说明

- `%Y-%m-%d` 为每日挑战应用的日期。例如 `2025-08-10`。
- `beatmap`：谱面 ID。
- `ruleset_id`：游戏模式 ID。
- `required_mods`：额外必需 mod。
- `allowed_mods`：额外 Freemod。

### 生效

等待 UTC 0 点后或者重启服务器，服务器会自动应用每日挑战。
