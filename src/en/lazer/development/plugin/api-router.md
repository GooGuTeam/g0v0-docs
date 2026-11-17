# Register API

Plugins can register a new API router using the `register_api()` function. This
function returns a FastAPI `APIRouter` object, and you can define your API
endpoints on this object. The API prefix is `/api/plugins/{plugin_id}`, where
`{plugin_id}` is your plugin ID.

```python
from app.plugins import register_api

router = register_api()
```

Then you can define your API endpoints on `router`:

```python
@router.get("/hello")
async def hello():
    return {"message": "Hello from My Plugin!"}
```

`register_api()` can also accept the same parameters as `APIRouter`, for
example:

```python
router = register_api(prefix="/my-plugin", tags=["My Plugin"])  # /api/plugins/{plugin_id}/my-plugin
```
