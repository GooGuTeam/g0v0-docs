---
---

# 插件开发

g0v0 提供了一个插件系统，允许开发者为 g0v0 添加新的功能和特性。插件可以添加新的 API，数据库模型，也可以监听 g0v0 的事件并做出响应。

## 特性

### 事件响应

插件可以监听 g0v0 的事件，并在事件发生时执行特定的操作。例如，当用户注册成功时，插件可以发送欢迎信息。

```python
from app.database import User
from app.plugins import listen
from app.dependencies.bot import BanchoBot
from app.dependencies.database import Database
from app.models.events import UserRegisteredEvent


@listen
async def on_user_registered(event: UserRegisteredEvent, bot: BanchoBot, session: Database):  # 这里使用了依赖注入，将在下文详细介绍。
    user = await session.get(User, event.user_id)
    if user:
        bot.send_reply(user, f"欢迎 {user.username} 注册成功！")
```

### API 扩展

插件可以添加新的 API 端点，允许外部系统与 g0v0 进行交互。例如，插件可以提供一个 API 来验证客户端是否可用。

```python
from app.plugins import register_api
from app.dependencies.client_verification import ClientVerificationService

router = register_api()

@router.get("/verify-client")  # /api/plugins/{plugin_id}/verify-client
async def verify_client(version_hash: str, verification_service: ClientVerificationService):
    if not (
        client_version := await verification_service.validate_client_version(
            version_hash,
        )
    ):
        return {"status": "invalid", "message": "客户端版本无效"}
    return {"status": "valid", "client_version": client_version}
```

### 数据库模型

插件可以拥有自己的数据库模型和自己独立的数据库迁移文件夹。这允许插件存储和管理自己的数据，而不会干扰 g0v0 的核心数据库结构。

```python
# 假设插件的 id 为 `my_plugin`
from app.database._base import DatabaseModel
from sqlmodel import Field

class MyPluginModel(DatabaseModel, table=True):
    __tablename__ = "mytable"  # -> plugin_my_plugin_mytable

    id: int = Field(primary_key=True)
    name: str = Field(max_length=255, nullable=False)
```

```bash
cd path/to/my_plugin
g0v0-migrate revision -m "Add MyPluginModel" --autogenerate
g0v0-migrate upgrade head
```

### 依赖注入

得益于
[FastDepends](https://lancetnik.github.io/FastDepends/)，插件可以在事件监听器使用 FastAPI-like 的依赖注入来获取 g0v0 的核心服务和资源。这使得插件开发更加简洁和高效。插件也可以独立使用 FastDepends 来管理自己的服务和资源。

```python
from app.plugins import listen

from fast_depends import Depends

async def my_plugin_service():
    # 这里可以创建和返回插件需要的服务实例
    return MyPluginService()

@listen
async def on_event(my_service: MyPluginService = Depends(my_plugin_service)):
    await my_service.do_something()
```
