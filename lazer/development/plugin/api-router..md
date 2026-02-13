# 注册 API

插件可以通过 `register_api()`
函数来注册一个新的 API 路由器。这个函数会返回一个 FastAPI 的 `APIRouter`
对象，你可以在这个对象上定义你的 API 端点。

```python
from app.plugins import register_api

router = register_api()
```

然后你就可以在 `router` 上定义你的 API 端点了：

```python
@router.get("/hello")
async def hello():
    return {"message": "Hello from My Plugin!"}
```

`register_api()` 也可以传入与 `APIRouter` 相同的参数，例如：

```python
router = register_api(prefix="/my-plugin", tags=["My Plugin"])
```
