# 内置依赖注入

## 数据库与缓存

| 依赖类型      | 导入路径                    | 描述                                                                                                                                        |
| ------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Database`    | `app.dependencies.database` | 数据库会话（`AsyncSession`），用于执行数据库操作                                                                                            |
| `NoContextDB` | `app.dependencies.database` | 无上下文数据库会话（`AsyncSession`），用于在不在依赖注入共享 Session 的情况下执行数据库操作。如果你遇到了并发使用连接的问题，可以使用此依赖 |
| `Redis`       | `app.dependencies.database` | Redis 客户端（`redis.asyncio.Redis`），用于缓存操作                                                                                         |

## 核心服务

| 依赖类型         | 导入路径                     | 描述                                   |
| ---------------- | ---------------------------- | -------------------------------------- |
| `Fetcher`        | `app.dependencies.fetcher`   | Fetcher 实例，用于从 osu! 官方获取数据 |
| `StorageService` | `app.dependencies.storage`   | 存储服务，用于文件存储操作             |
| `EventHub`       | `app.dependencies.event_hub` | 事件中心，用于发送和订阅事件           |

## 缓存服务

| 依赖类型                 | 导入路径                 | 描述           |
| ------------------------ | ------------------------ | -------------- |
| `BeatmapsetCacheService` | `app.dependencies.cache` | 谱面集缓存服务 |
| `UserCacheService`       | `app.dependencies.cache` | 用户缓存服务   |

## 请求上下文

| 依赖类型        | 导入路径                       | 描述                                 |
| --------------- | ------------------------------ | ------------------------------------ |
| `IPAddress`     | `app.dependencies.geoip`       | 客户端 IP 地址（`str`）              |
| `GeoIPService`  | `app.dependencies.geoip`       | GeoIP 服务，用于根据 IP 查询地理位置 |
| `UserAgentInfo` | `app.dependencies.user_agent`  | 用户代理信息模型                     |
| `APIVersion`    | `app.dependencies.api_version` | API 版本号（`int`）                  |

## 聊天

| 依赖类型    | 导入路径               | 描述                             |
| ----------- | ---------------------- | -------------------------------- |
| `BanchoBot` | `app.dependencies.bot` | BanchoBot 实例，用于发送聊天消息 |

## 其他服务

| 依赖类型                    | 导入路径                               | 描述                                 |
| --------------------------- | -------------------------------------- | ------------------------------------ |
| `DownloadService`           | `app.dependencies.beatmap_download`    | 谱面下载服务，提供负载均衡的下载 URL |
| `ClientVerificationService` | `app.dependencies.client_verification` | 客户端版本验证服务                   |
