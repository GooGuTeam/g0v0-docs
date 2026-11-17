---
---

# 数据库、模型与迁移

## 模型目录边界

- `app/database/`：SQLModel 表、可持久化模型、数据库响应模型、`DatabaseModel`
  相关工具。
- `app/models/`：非数据库模型，例如事件、枚举、请求结构、mods /
  score 的中间数据结构。

不要把 SQLModel 表放入 `app/models/`。历史文档中关于“数据库模型在
`app.models`”的描述已经不适用于最新仓库，应以 `app/database/` 为准。

## 按需返回模型

核心数据库模型使用“按需返回”设计，典型结构是 `Dict` → `Model` → `Table`：

1. `Dict`：使用 `TypedDict` 描述转换后的字典结构，供类型检查和文档生成使用。
2. `Model`：继承 `DatabaseModel[Dict]`，定义公开字段、按需字段和计算属性。
3. `Table`：继承 `Model` 并设置 `table=True`，定义实际数据库表字段。

示例：

```python
from typing import NotRequired, TypedDict

from app.database._base import DatabaseModel, OnDemand, included, ondemand
from sqlalchemy import func, select
from sqlmodel import Field
from sqlmodel.ext.asyncio.session import AsyncSession


class ExampleUserDict(TypedDict):
    id: int
    username: str
    email: NotRequired[str]
    followers_count: int


class ExampleUserModel(DatabaseModel[ExampleUserDict]):
    id: int = Field(primary_key=True)
    username: str
    email: OnDemand[str]

    @included
    @staticmethod
    async def followers_count(session: AsyncSession, instance: "ExampleUser") -> int:
        return await session.scalar(select(func.count()).where(Follower.followed_id == instance.id)) or 0

    @ondemand
    @staticmethod
    async def optional_badge(session: AsyncSession, instance: "ExampleUser") -> str | None:
        return None


class ExampleUser(ExampleUserModel, table=True):
    password: str
```

字段约定：

- 普通字段：总是返回。
- `OnDemand[T]`：数据库字段存在，但只在 `includes` 指定时返回。
- `@included`：普通计算属性，总是返回。
- `@ondemand`：按需计算属性，仅在 `includes` 指定时返回。
- `Exclude[T]`：可用于需要进入表结构但不参与默认导出的字段。

## 转换与响应文档

使用 `transform` 转换数据库对象：

```python
user = await session.get(User, 1)
user_dict = await UserModel.transform(
    user,
    includes=["email"],
    session=session,
)
```

在路由中可用 `generate_typeddict` 生成更准确的响应文档：

```python
@router.get("/users/{user_id}", response_model=UserModel.generate_typeddict(includes=("email",)))
async def get_user(user_id: int, session: Database) -> dict:
    user = await session.get(User, user_id)
    return await UserModel.transform(user, includes=["email"], session=session)
```

`app/database/__init__.py` 会对 `*Model` 和 `*Resp` 类型执行
`model_rebuild()`，用于解析前向引用。新增模型后必须：

1. 在对应模块中定义清晰的 `Dict`、`Model`、`Table`。
2. 在 `app/database/__init__.py` 中导出需要公开的类型。
3. 确认 `model_rebuild()` 不会因缺失导入或循环引用失败。

如果使用 SQLAlchemy relationship，遵循当前仓库做法，使用 `Mapped[...]`
等兼容类型检查的写法。

## 数据库 Session

常用依赖：

- `Database`：基于 `ContextVar` 的请求作用域 session，适合大多数路由。
- `NoContextDB`：每次创建全新 session，适合必须避免共享当前请求 session 的场景。
- `with_db()`：非路由场景下手动创建 session 的 async context manager。
- `DBFactory`：需要按需创建多个 session 时使用。

示例：

```python
from app.dependencies.database import with_db


async def run_job() -> None:
    async with with_db() as session:
        # 修改数据后必须手动 commit。
        await session.commit()
```

注意：

- 修改数据后显式 `await session.commit()`。
- 批量写入时放在同一个事务中，避免多个小事务。
- 不要把 session 长期保存到全局对象中。

## Redis 连接

当前核心依赖提供多个 Redis 连接：

| 连接                     | DB  | 用途                                                       |
| ------------------------ | --- | ---------------------------------------------------------- |
| `Redis` / `redis_client` | 0   | 默认缓存、常规字符串和哈希。                               |
| `redis_blocking_client`  | 0   | 阻塞读取、PubSub、BRPOP 等需要禁用 socket timeout 的操作。 |
| `redis_message_client`   | 1   | 聊天消息等消息缓存。                                       |
| `redis_binary_client`    | 2   | 音频、回放等二进制数据，不自动 decode。                    |

缓存 key 应遵循现有命名习惯，例如
`user:{id}:...`。如果缓存写入不影响当前响应，应考虑后台任务异步回填。

## 迁移

最新仓库使用 `g0v0-migrate`，它封装 Alembic 并支持插件迁移。修改 `app/database/`
表结构后运行：

```bash
uv run g0v0-migrate revision --autogenerate -m "feat(db): describe change"
uv run g0v0-migrate upgrade head
```

如果需要升级核心和所有插件迁移：

```bash
uv run g0v0-migrate upgrade-all
```

迁移检查清单：

1. 生成迁移后人工审查 SQL。
2. 检查索引、唯一约束、外键、默认值和 nullable 变化。
3. 大表字段变更要评估锁表、回填和线上升级成本。
4. 不要把业务数据修复混入 schema 迁移；复杂修复应使用独立维护脚本并记录执行方式。
5. PR 中说明迁移是否向后兼容、是否需要停机、是否需要手动步骤。

## 查询性能建议

优先只选择必要字段：

```python
stmt = select(User.id, User.username).where(User.active == True)
rows = await session.exec(stmt)
```

检查存在性时使用 `exists()`，避免加载整行：

```python
from sqlalchemy import exists, select

exists_stmt = select(exists().where(User.id == user_id))
found = await session.scalar(exists_stmt)
```

避免 N+1 查询；需要关联对象时使用 `selectinload` 或
`joinedload`。批量计算、排行榜和谱面同步类逻辑应重点审查索引和查询计划。
