---
---

# 路由、API 与鉴权

## 路由目录规则

公开 API 的目录位置是硬性规则：

| 路径                                          | 允许内容                                                     |
| --------------------------------------------- | ------------------------------------------------------------ |
| `app/router/v1/`                              | osu! API v1 中已经存在的端点。                               |
| `app/router/v2/`                              | osu! API v2 / OpenAPI 中已经存在的端点。                     |
| `app/router/notification/`                    | osu! 聊天、通知和 BanchoBot 相关端点；同样必须匹配官方行为。 |
| `app/router/auth.py`                          | OAuth、token、登录授权等认证流程。                           |
| `app/router/private/`                         | g0v0 自定义或实验性核心 API。                                |
| `app/router/file.py`、`redirect.py`、`lio.py` | 文件、前端重定向、legacy IO 等专用入口。                     |

新增端点前必须先查官方规范：

- v1：<https://github.com/ppy/osu-api/wiki>
- v2: <https://osu.ppy.sh/docs/index.html>

如果端点不在官方 v1/v2 规范中，不得放入 `v1/`、`v2/` 或 `notification/`。

## 路由处理器原则

所有路由处理器必须：

- 使用 `async def`。
- 使用 Annotated-style 或仓库内封装好的依赖注入类型。
- 只处理参数解析、鉴权、调用 service、组合响应和抛出客户端错误。
- 对外响应 schema、路径、scope 和错误格式保持稳定。
- 为新增或变更端点提供足够的 OpenAPI 文档信息。
- 如果返回资源代理地址，使用现有的 asset proxy helper。

不要在路由中堆积复杂查询、缓存回填、批处理或跨服务编排；这些逻辑应放入
`app/service/`。

## 鉴权模式

### OAuth scope 鉴权

公开给客户端、前端或第三方 OAuth 应用的 v2 / private API，一般使用
`get_current_user` 与 `Security`：

```python
from typing import Annotated

from app.database import User
from app.dependencies.user import get_current_user
from fastapi import APIRouter, Security

router = APIRouter(prefix="/api/private/example", tags=["g0v0"])


@router.get("/public-user")
async def get_public_user(
    current_user: Annotated[User, Security(get_current_user, scopes=["public"])],
):
    return {"id": current_user.id}
```

scope 列表应参考 `app.dependencies.user` 中 OAuth 定义，不要随意发明新 scope。

### 客户端/前端用户

仅供 osu!(lazer) 客户端或 g0v0 前端使用的接口，可以使用 `ClientUser`：

```python
from app.dependencies.user import ClientUser
from fastapi import APIRouter

router = APIRouter(prefix="/api/private/example", tags=["g0v0"])


@router.get("/me")
async def get_me(current_user: ClientUser):
    return {"id": current_user.id, "username": current_user.username}
```

如需同时取得 token，可使用 `get_current_user_and_token` 或
`get_client_user_and_token` 变种。

### v1 API Key

v1 端点使用 `v1_authorize` 依赖，API key 位于 query 参数
`k`。v1 响应需要注意历史兼容：当前 v1 router 通过 `AllStrModel`
将值序列化为字符串。

## 数据库与 Redis 依赖

常用依赖位于 `app.dependencies.database`：

```python
from app.dependencies.database import Database, Redis
from fastapi import APIRouter

router = APIRouter(prefix="/api/private/example", tags=["g0v0"])


@router.get("/cache-demo")
async def cache_demo(session: Database, redis: Redis):
    value = await redis.get("example:key")
    if value is not None:
        return {"value": value}

    # 真实业务逻辑应放入 service。
    await redis.set("example:key", "created", ex=60)
    return {"value": "created"}
```

当你必须避免复用当前请求的 session 时，使用 `NoContextDB`。普通路由优先使用
`Database`。

## 限流

v1/v2 router 层会根据配置使用 `app.dependencies.rate_limit` 中的
`LIMITERS`。新增下载、回放、批量查询或高成本端点时，应检查是否需要更严格的限流策略。

## 错误返回

- 客户端错误：使用 `HTTPException` 或 `app.models.error.RequestError`。
- 需要结构化错误码和额外字段时，优先使用 `RequestError`，它会输出
  `error`、`msg_key` 和 `details`。
- 服务端错误：记录结构化日志，不要把内部异常细节直接暴露给客户端。

## 新增端点检查清单

新增或修改端点前，请确认：

1. 路径放在正确目录。
2. 与官方 osu! API 对应的行为、参数、分页、错误码和响应字段兼容。
3. 处理器是异步函数。
4. 使用仓库内已有的 DB、Redis、用户和限流依赖。
5. 复杂逻辑放在 service。
6. 修改公共契约时写明兼容性影响。
7. 私有 API 使用 `/api/private/`；插件 API 使用 `/api/plugins/<plugin-id>/`。
