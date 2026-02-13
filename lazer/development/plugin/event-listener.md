# 事件监听

插件可以通过事件系统来监听和发送事件，实现插件之间或与 g0v0 核心功能的交互。

## 定义事件

所有自定义事件都需要继承 `PluginEvent` 基类：

```python
from app.models.events import PluginEvent

class MyCustomEvent(PluginEvent):
    user_id: int
    message: str
```

## 监听事件

### 使用装饰器

你可以使用 `listen` 装饰器来监听事件：

```python
from app.plugins import event_hub

@event_hub.listen
async def on_my_custom_event(event: MyCustomEvent):
    print(f"Received event from user {event.user_id}: {event.message}")
```

:::warning 警告

事件监听器必须是异步函数。

:::

### 使用 subscribe_event 方法

你也可以直接使用 `subscribe_event` 方法来订阅事件：

```python
from app.plugins import event_hub

async def my_event_handler(event: MyCustomEvent):
    print(f"Handling event: {event.message}")

event_hub.subscribe_event(my_event_handler)
```

## 发送事件

使用 `emit` 方法来发送事件：

```python
from app.plugins import event_hub

event = MyCustomEvent(user_id=1, message="Hello, World!")
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
