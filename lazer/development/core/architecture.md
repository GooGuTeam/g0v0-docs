---
---

# 项目结构与生命周期

## 技术栈概览

核心服务是基于 FastAPI 的异步 Python 应用，主要组成如下：

- Web 框架：FastAPI。
- 数据库：SQLModel / SQLAlchemy async + MySQL（`aiomysql`）。
- 缓存与消息：`redis.asyncio`。
- 后台调度：APScheduler。
- 配置：`pydantic-settings`，入口为 `app/config.py` 中的 `settings`。
- 日志：`loguru` 封装在 `app/log.py`。
- 迁移：`packages/g0v0-migrations` 提供的 `g0v0-migrate` CLI。
- 插件扩展：`app/plugins/`，核心开发文档只说明核心边界，插件细节见[插件开发](/lazer/development/plugin/)。

## 核心目录

| 路径                 | 作用                                                                               |
| -------------------- | ---------------------------------------------------------------------------------- |
| `main.py`            | FastAPI 应用入口，注册路由、中间件、异常处理和 lifespan。                          |
| `app/router/`        | API 路由，按 v1、v2、notification、private、auth、file、redirect、lio 等分组。     |
| `app/database/`      | SQLModel 数据库表、数据库响应模型和 `DatabaseModel` 基类。                         |
| `app/models/`        | 非数据库模型：枚举、请求/响应结构、事件、mods、score 辅助结构等。                  |
| `app/service/`       | 核心业务逻辑；路由中不应堆积复杂业务。                                             |
| `app/tasks/`         | 启动任务、关闭任务和 APScheduler 定时任务。                                        |
| `app/dependencies/`  | FastAPI / FastDepends 依赖注入：数据库、Redis、鉴权、限流、fetcher、scheduler 等。 |
| `app/helpers/`       | 通用辅助能力：后台任务、时间、字符串、GeoIP、资源代理等。                          |
| `app/fetcher/`       | 从 osu! 官方或外部服务获取谱面、用户等数据。                                       |
| `app/calculating/`   | 难度、表现分、mods 与 ruleset 相关计算。                                           |
| `app/plugins/`       | 插件加载、事件中心、插件 API 路由与插件迁移集成。                                  |
| `app/storage/`       | 本地或对象存储相关逻辑。                                                           |
| `migrations/`        | 核心数据库迁移。                                                                   |
| `packages/`          | uv workspace 包，例如迁移工具。                                      |
| `static/` | 默认配置定义、静态数据和生成出的 ruleset/mods 资源。                               |
| `scripts/`、`tools/` | 运维脚本、生成脚本和一次性维护工具。                                               |

## 应用启动顺序

`main.py` 的 lifespan 是理解核心系统的入口。当前主分支启动时大致执行：

1. 初始化文件日志。
2. 加载插件并挂载插件路由。
3. 初始化 mods、ranked mods、ruleset version hash、成就和表现分计算器。
4. 如果开启客户端版本检查，初始化客户端验证服务。
5. 初始化 fetcher、GeoIP 与可选的 v2 IPC。
6. 初始化游戏基础数据：RX / 自定义 ruleset 统计、用户排名、每日挑战、BanchoBot。
7. 启动服务：邮件处理器、下载服务健康检查、缓存任务、谱面集更新服务、Redis 消息系统、调度器。
8. 如果未启用 v2 IPC，启动用户在线状态订阅。
9. 输出资源代理等系统状态日志。

添加新的启动逻辑时应遵循：

- 能懒加载的不要放入启动关键路径。
- 启动任务必须可重复运行，避免重复插入或重复注册。
- 依赖外部网络的初始化要有超时、错误日志和降级策略。
- 只在真正需要时修改 `main.py`，更复杂的逻辑应封装在 service 或 task 中。

## 应用关闭顺序

关闭时会依次停止后台任务、缓存任务、调度器、下载服务健康检查、邮件处理器，并关闭数据库引擎与 Redis 连接。

新增长期运行服务时必须提供明确关闭逻辑，并确保：

- 不遗留未 await 的协程。
- 不吞掉取消异常和关闭异常。
- 不在关闭阶段新建无必要的数据库或 Redis 连接。

## 路由注册边界

核心路由在应用创建后挂载：

- `api_v2_router`
- `api_v1_router`
- `chat_router`
- `redirect_api_router`
- `file_router`
- `auth_router`
- `private_router`
- `lio_router`

插件路由会在 lifespan 中随插件加载后挂载。不要把核心实验 API 挂到插件路由，也不要把插件专用 API 放进核心
`private_router`。

## 特别注意

- `/_lio` 相关路径服务于 spectator / legacy
  IO 场景，生产网络应阻止公网直接访问。
- `app.database` 导入时会对 `*Model` 和 `*Resp` 类型执行
  `model_rebuild()`，新增相关类型后必须正确导出。
- 核心仓库同时兼容 osu! API
  v1/v2、g0v0 私有 API、插件 API 与客户端特有流程；修改公共行为前必须确认影响范围。
