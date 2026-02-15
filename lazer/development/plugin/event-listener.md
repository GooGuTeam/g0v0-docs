# 事件监听

插件可以通过事件系统来监听和发送事件，实现插件之间或与 g0v0 核心功能的交互。

## 监听事件

### 使用装饰器

你可以使用 `listen` 装饰器来监听事件：

```python
from app.plugins import event_hub
from app.models.events import MessageSentEvent

@event_hub.listen
async def on_my_custom_event(event: MessageSentEvent):
    print(f"User {event.sender_id} sent a message: {event.message_content}")
```

:::warning 警告

事件监听器必须是异步函数。

:::

### 使用 subscribe_event 方法

你也可以直接使用 `subscribe_event` 方法来订阅事件：

```python
from app.plugins import event_hub
from app.models.events import MessageSentEvent

async def my_event_handler(event: MessageSentEvent):
    print(f"User {event.sender_id} sent a message: {event.message_content}")

event_hub.subscribe_event(my_event_handler)
```

## 内置事件

g0v0 核心功能会在特定的时刻触发一些内置事件，例如用户注册成功、成绩提交等。你可以监听这些事件来实现特定的功能。例如：

```python
from app.plugins import listen
from app.models.events import UserRegisteredEvent
from app.dependencies.database import Database
from app.database import User

@listen
async def on_user_registered(event: UserRegisteredEvent, session: Database):
    user_id = event.user_id
    user = await session.get(User, user_id)

    print(f"User registered: {user.username}")
```

查看[内置事件](../../reference/builtin-event.md)以获取所有可用的内置事件。

## 定义事件

所有自定义事件都需要继承 `PluginEvent` 基类：

```python
from app.models.events import PluginEvent

class MyCustomEvent(PluginEvent):
    user_id: int
    message: str
```

## 发送事件

你可以使用 `event_hub.emit()` 方法来发送事件：

```python
from app.plugins import event_hub
from app.models.events import MyCustomEvent


event = MyCustomEvent(user_id=123, message="Hello, world!")
event_hub.emit(event)
```

事件会被异步发送到所有订阅了该事件类型的监听器。事件会在后台异步执行，不会阻塞发送方。

### 在 API 中使用

你也可以通过依赖注入在 API 端点中获取 `EventHub` 实例：

```python
from app.dependencies.event_hub import EventHub
from app.plugins import register_api

router = register_api()

@router.post("/send-event")
async def send_event(event_hub: EventHub):
    event = MyCustomEvent(user_id=1, message="Event from API")
    event_hub.emit(event)
    return {"status": "sent"}
```
