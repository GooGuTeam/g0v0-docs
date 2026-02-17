# Dependency Injection

g0v0's dependency injection system is based on
[FastDepends](https://lancetnik.github.io/FastDepends/), which is a standalone
dependency injection library extracted from FastAPI. It allows you to declare
and inject dependencies in any part of your plugin (including event listeners)
in a FastAPI-like manner.

## Define Dependencies

You can define a dependency function to create and return the service instance
you need. For example:

```python
async def my_plugin_service():
    # Create and return the service instance needed by the plugin
    return MyPluginService()
```

## Inject Dependencies

You can use `Depends` in event listeners to inject this dependency:

```python
from app.plugins import listen
from fast_depends import Depends


@listen
async def on_some_event(my_service: MyPluginService = Depends(my_plugin_service)):
    await my_service.do_something()
```

:::warning Warning

Import `Depends` from `fast_depends`, not from `fastapi`.

:::

:::tip Tip

The event is also a dependency, so you can inject it in event listeners without
using `Depends`:

```python
@listen
async def on_some_event(event: MyCustomEvent, my_service: MyPluginService = Depends(my_plugin_service)):
    print(f"Received event: {event.message}")
    await my_service.do_something()
```

:::

## Built-in Dependency Injection

g0v0 also provides some built-in dependency injections to help you access core
services and resources. For example, you can inject `Database` to perform
database operations:

```python
from app.dependencies.database import Database   # AsyncSession


@listen
async def on_some_event(db: Database):
    # Use db for database operations
    ...
```

Dependencies provided by g0v0 are implemented using both FastAPI's `Depends` and
FastDepends' `Depends`, so you can also use them in API endpoints.

See [Built-in Dependency Injection](../../reference/builtin-di.md) to learn more
about available dependency injections.
