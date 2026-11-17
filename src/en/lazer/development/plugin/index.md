---
---

# Plugin Development

g0v0 provides a plugin system that allows developers to add new features and
capabilities to g0v0. Plugins can add new APIs, database models, and can also
listen to g0v0 events and respond accordingly.

## Features

### Event Response

Plugins can listen to g0v0 events and perform specific actions when events
occur. For example, when a user registers successfully, a plugin can send a
welcome message.

```python
from app.database import User
from app.plugins import listen
from app.dependencies.bot import BanchoBot
from app.dependencies.database import Database
from app.models.events import UserRegisteredEvent


@listen
async def on_user_registered(event: UserRegisteredEvent, bot: BanchoBot, session: Database):  # This uses dependency injection, which will be explained in detail below.
    user = await session.get(User, event.user_id)
    if user:
        bot.send_reply(user, f"Welcome {user.username}, registration successful!")
```

### API Extension

Plugins can add new API endpoints, allowing external systems to interact with
g0v0. For example, a plugin can provide an API to verify whether a client is
valid.

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
        return {"status": "invalid", "message": "Client version invalid"}
    return {"status": "valid", "client_version": client_version}
```

### Database Models

Plugins can have their own database models and independent database migration
folders. This allows plugins to store and manage their own data without
interfering with g0v0's core database structure.

```python
# Assuming the plugin id is `my_plugin`
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

### Dependency Injection

Thanks to [FastDepends](https://lancetnik.github.io/FastDepends/), plugins can
use FastAPI-like dependency injection in event listeners to access g0v0's core
services and resources. This makes plugin development more concise and
efficient. Plugins can also independently use FastDepends to manage their own
services and resources.

```python
from app.plugins import listen

from fast_depends import Depends

async def my_plugin_service():
    # Create and return the service instance needed by the plugin
    return MyPluginService()

@listen
async def on_event(my_service: MyPluginService = Depends(my_plugin_service)):
    await my_service.do_something()
```
