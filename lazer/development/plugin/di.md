# 依赖注入

g0v0 的依赖注入系统基于
[FastDepends](https://lancetnik.github.io/FastDepends/)，这是从 FastAPI 提取出来的一套独立的依赖注入库。它允许你在插件的任何部分（包括事件监听器）使用类似于 FastAPI 的方式来声明和注入依赖。

## 定义依赖

你可以定义一个依赖函数来创建和返回你需要的服务实例。例如：

```python
async def my_plugin_service():
    # 这里可以创建和返回插件需要的服务实例
    return MyPluginService()
```

## 注入依赖

你可以在事件监听器中使用 `Depends` 来注入这个依赖：

```python
from app.plugins import listen
from fast_depends import Depends


@listen
async def on_some_event(my_service: MyPluginService = Depends(my_plugin_service)):
    await my_service.do_something()
```

:::warning 警告

从 `fast_depends` 导入 `Depends`，而不是从 `fastapi` 导入。

:::

:::tip 提示

event 也是一个依赖，所以你也可以在事件监听器中注入它且不需要使用 `Depends`：

```python
@listen
async def on_some_event(event: MyCustomEvent, my_service: MyPluginService = Depends(my_plugin_service)):
    print(f"Received event: {event.message}")
    await my_service.do_something()
```

:::

## 内置依赖注入

g0v0 还提供了一些内置的依赖注入来帮助你获取核心服务和资源。例如，你可以注入
`Database` 来进行数据库操作：

```python
from app.dependencies.database import Database   # AsyncSession


@listen
async def on_some_event(db: Database):
    # 使用 db 进行数据库操作
    ...
```

g0v0 提供的依赖都使用了 FastAPI 的 `Depends` 和 FastDepends 的 `Depends`
来实现，所以你也可以在 API 端点中使用它们。

查看[内置依赖注入](../../reference/builtin-di.md) 来了解更多可用的依赖注入。
