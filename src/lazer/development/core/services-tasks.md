---
---

# 服务、任务、日志与错误处理

## Service 层

核心业务逻辑放在 `app/service/`。路由应该调用 service，而不是直接实现复杂业务。

适合放入 service 的逻辑包括：

- 多表查询和事务编排。
- 缓存读取、回填和失效。
- 邮件、通知、聊天消息、谱面下载、谱面集更新。
- 排行榜、用户统计、每日挑战、重算等领域逻辑。
- 需要复用在路由、任务、脚本之间的流程。

建议以类组织 service，依赖通过构造函数或方法参数传入，不要在全局初始化时创建请求级 session。

```python
from app.log import service_logger


class ExampleService:
    def __init__(self) -> None:
        self.logger = service_logger("ExampleService")

    async def run(self) -> None:
        self.logger.info("running example service")
```

## 后台任务

耗时逻辑不要阻塞路由响应：

- 来自 API 路由的后台动作：使用 FastAPI 的 `BackgroundTasks`。
- 非路由场景：使用 `app.helpers.bg_tasks`，它提供与 FastAPI `BackgroundTasks`
  类似的接口。
- CPU 密集或阻塞库调用：封装到可控的线程池或独立服务，避免直接阻塞事件循环。

```python
from fastapi import APIRouter, BackgroundTasks

router = APIRouter(prefix="/api/private/example", tags=["g0v0"])


async def refresh_cache(user_id: int) -> None:
    ...


@router.post("/refresh-cache/{user_id}")
async def refresh_cache_api(user_id: int, background_tasks: BackgroundTasks):
    background_tasks.add_task(refresh_cache, user_id)
    return {"status": "queued"}
```

## 定时任务、启动任务与关闭任务

任务放在 `app/tasks/`，并通过 `__init__.py`
导出。需要在应用启动或关闭时执行的任务由 `main.py`
的 lifespan 调用；定时任务通过 APScheduler 注册。

编写任务时必须满足：

- **幂等。** 重复运行不会产生重复数据或错误状态。
- **可观测。** 每个退出路径都有日志，尤其是跳过、失败、无数据、部分成功。
- **可重试。** 外部网络失败、数据库临时失败应能安全重试。
- **不阻塞。** 长耗时批处理要分页、分批、释放连接。
- **有误触发容忍。** cron 任务根据需要设置 `misfire_grace_time`。

示意：

```python
from app.log import task_logger

logger = task_logger("ExampleJob")


async def example_job() -> None:
    logger.info("example job started")
    try:
        ...
    except Exception:
        logger.exception("example job failed")
        raise
    logger.info("example job finished")
```

## 日志

按代码位置选择日志入口：

```python
from app.log import fetcher_logger, log, service_logger, system_logger, task_logger

log("RouterName").info("router event")
system_logger("Startup").info("system event")
service_logger("RankingService").info("service event")
task_logger("DailyChallenge").info("task event")
fetcher_logger("BeatmapFetcher").info("fetcher event")
```

实践要求：

- 服务端异常记录结构化日志，不把内部细节直接返回给客户端。
- 日志中不要输出密码、token、邮箱验证码、真实 `.env` 值或对象存储密钥。
- 批处理任务应记录输入规模、成功数量、失败数量和耗时。
- 高频路径避免过量 info 日志，必要时使用 debug。

## 错误处理

核心应用注册了常见异常处理器：

- `RequestValidationError`：返回 422。
- `RequestError`：返回结构化 `error`、`msg_key` 和 details。
- `HTTPException`：返回对应 status code 和 `error` 字段。

客户端错误：

```python
from fastapi import HTTPException

if user is None:
    raise HTTPException(status_code=404, detail="User not found")
```

需要本地化 key 或结构化细节时：

```python
from app.models.error import RequestError

raise RequestError(
    status_code=400,
    msg_key="invalid_request",
    message="Invalid request",
    details={"field": "beatmap_id"},
)
```

服务端错误不应转换成 200 或吞掉异常。能恢复的错误应记录并降级；不能恢复的错误应记录后抛出，让上层统一处理。

## 缓存与失效

缓存相关逻辑优先复用已有 service，例如用户缓存、谱面缓存、排行榜缓存。新增缓存时要明确：

1. key 命名。
2. TTL。
3. 数据来源。
4. 失效触发点。
5. 旧值是否允许短暂返回。
6. 是否需要后台刷新。

对于用户头像、封面、谱面集、在线状态等会被多个路径消费的数据，修改写入逻辑时必须同步检查缓存失效路径。
