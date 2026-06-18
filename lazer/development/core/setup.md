---
---

# 开发环境与命令

## 克隆与相关服务

核心仓库为 `GooGuTeam/g0v0-server`：

```bash
git clone https://github.com/GooGuTeam/g0v0-server.git
cd g0v0-server
```

如果需要联调完整客户端链路，还需要按实际功能准备相关服务：

- [`spectator-server`](https://github.com/GooGuTeam/osu-server-spectator)：旁观服务器，放在仓库根目录下的 `spectator-server/`。
- [`performance-server`](https://github.com/GooGuTeam/osu-performance-server) 或 `rosu-pp-py`：表现分计算后端。`rosu-pp-py`
  是可选依赖组；如果实例使用独立性能服务，请按部署配置启动服务。
- 自定义规则集 DLL：需要自定义 ruleset 时放入对应的 ruleset 目录，并保持版本 hash 与客户端一致。

## 推荐环境

项目使用 Python 3.12+，CI 以更新版本运行。推荐使用 Dev
Container，以避免本机 MySQL、Redis、系统依赖和 .NET 服务版本不一致。

历史开发环境约定仍然适用：

1. 安装 Docker。
2. 在 VS Code 安装 Dev Containers 扩展。
3. 打开仓库并选择“在容器中重新打开”。
4. 在容器环境中，常见配置为 `MYSQL_HOST=mysql`、`REDIS_URL=redis://redis/0`。

如果不使用 Dev Container，需要自行准备：

- MySQL（通过 `aiomysql` 访问）。
- Redis（缓存、聊天消息、二进制数据与阻塞订阅会使用不同连接）。
- 可选的 spectator、performance、对象存储、邮件、GeoIP 与前端服务。

## 配置

从 `.env.example` 复制 `.env`，再填写本地配置：

```bash
cp .env.example .env
```

必须特别注意：

- 不要提交真实 `.env`、密钥、密码、token、数据库地址或对象存储凭据。
- `SECRET_KEY` 不应保留默认值；可用 `openssl rand -hex 32` 生成。
- `OSU_WEB_CLIENT_SECRET` 不应保留默认值；可用 `openssl rand -hex 40` 生成。
- 本地无 HTTPS 且需要 osu!(lazer) 直接连接时，可按 [osu!(lazer) 测试服务器文档](https://github.com/ppy/osu/wiki/Testing-web-server-full-stack-with-osu!#basics)处理客户端 SSL 限制。

## 安装依赖

项目使用 `uv` 管理依赖和 workspace：

```bash
uv sync
```

如需安装可选的 rosu 计算器依赖：

```bash
uv sync --extra rosu
```

workspace 成员包括：

- `packages/g0v0-migrations`

## 启动开发服务器

常用启动命令：

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

也可以直接运行入口文件，入口会使用 `app.config.settings`
中的 host、port、debug 等配置：

```bash
uv run python main.py
```

或者使用 Dev Container 中的启动脚本（同时启动 `spectator-server` 和 `performance-server`，需要这两者存在）：

```bash
./.devcontainer/start-dev.sh
```

如果使用 Dev Container 中的启动脚本，脚本会从 `.env`
加载环境变量并按开发环境顺序启动相关服务。注意外部访问端口可能经过 NGINX 转发，和应用本身监听端口不同。

## 常用检查命令

提交前至少运行：

```bash
uv run pyright
uv run ruff check --fix .
uv run ruff format .
pre-commit run --all-files
```

如果是数据库结构变更，还需要运行迁移命令并审查生成文件，详见[数据库、模型与迁移](./database)。

## 当前仓库的测试现状

当前核心仓库没有完整测试套件。不要为了临时验证而提交一次性测试脚本；需要验证时优先使用：

- 静态检查：Pyright、Ruff、pre-commit。
- 本地启动与接口文档检查。
- 针对受影响 API 的手动请求。
- 数据库迁移的本地 upgrade / downgrade 风险审查。
