# Event Listening

Plugins can listen to and send events through the event system, enabling
interaction between plugins or with g0v0's core functionality.

## Listen to Events

### Using Decorators

You can use the `listen` decorator to listen to events:

```python
from app.plugins import listen
from app.models.events import MessageSentEvent

@listen
async def on_message_sent(event: MessageSentEvent):
    print(f"User {event.sender_id} sent a message: {event.message_content}")
```

:::warning Warning

Event listeners must be async functions.

:::

### Using the subscribe_event Method

You can also directly use the `subscribe_event` method to subscribe to events:

```python
from app.plugins import hub
from app.models.events import MessageSentEvent

async def my_event_handler(event: MessageSentEvent):
    print(f"User {event.sender_id} sent a message: {event.message_content}")

hub.subscribe_event(my_event_handler)
```

## Built-in Events

g0v0's core functionality triggers some built-in events at specific moments,
such as user registration success, score submission, etc. You can listen to
these events to implement specific features. For example:

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

See [Built-in Events](../../reference/builtin-event.md) for all available
built-in events.

## Define Events

All custom events need to inherit from the `PluginEvent` base class:

```python
from app.models.events import PluginEvent

class MyCustomEvent(PluginEvent):
    user_id: int
    message: str
```

## Send Events

You can use the `hub.emit()` method to send events:

```python
from app.plugins import hub

event = MyCustomEvent(user_id=123, message="Hello, world!")
hub.emit(event)
```

Events are sent asynchronously to all listeners subscribed to that event type.
Events execute asynchronously in the background and do not block the sender.

### Using in APIs

You can also get the `EventHub` instance through dependency injection in API
endpoints:

```python
from app.dependencies.hub import EventHub
from app.plugins import register_api

router = register_api()

@router.post("/send-event")
async def send_event(hub: EventHub):
    event = MyCustomEvent(user_id=1, message="Event from API")
    hub.emit(event)
    return {"status": "sent"}
```
