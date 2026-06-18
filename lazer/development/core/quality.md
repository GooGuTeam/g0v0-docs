---
---

# 代码质量、PR 与性能

## 基本约定

- Python 版本：项目要求 Python 3.12+，CI 使用更新版本。
- 行宽：Ruff 配置为 120。
- 路由：所有路由处理器必须是 `async`。
- 提交信息：使用 Angular 风格 `type(scope): subject`。
- 公共 API：保持 osu! v1/v2 兼容；自定义 API 放入 private 或 plugin 路由。
- 测试现状：核心仓库没有完整测试套件，提交前静态检查和人工审查必须更严格。

## 提交前检查

推荐顺序：

```bash
uv run ruff check --fix .
uv run ruff format .
uv run pyright
pre-commit run --all-files
```

如果只想先安装 hook：

```bash
pre-commit install
```

数据库模型变更还必须执行：

```bash
uv run g0v0-migrate revision --autogenerate -m "feat(db): describe change"
uv run g0v0-migrate upgrade head
```

## 提交信息

类型建议：

- `feat`：新功能。
- `fix`：修复 bug。
- `docs`：文档更改。
- `style`：不改变代码含义的格式调整。
- `refactor`：重构。
- `perf`：性能优化。
- `test`：测试相关。
- `chore`：构建、依赖、辅助工具。
- `ci`：持续集成。
- `deploy`：部署相关。

示例：

```text
feat(api): add beatmap favourite endpoint
fix(database): rebuild forward references for score response
perf(score): add union index for best scores
docs(dev): update core development guide
```

## PR 范围

一个 PR 只解决一个问题：

- 一个端点。
- 一个 bug 修复。
- 一次依赖升级。
- 一组强相关重构。

不要把端点、数据库迁移、重构、依赖升级和文档更新混成一个大 PR，除非它们是同一变更不可分割的一部分。

PR 描述至少说明：

1. 修改目的。
2. 影响的 API、数据库表、配置项或后台任务。
3. 是否修改公共契约。
4. 是否包含迁移，以及迁移风险。
5. 已运行的检查命令。
6. 需要运维执行的步骤。

## API 审查清单

修改端点时审查：

- 是否放在正确 router 目录。
- v1/v2/notification 是否符合官方 osu! API。
- private API 是否使用 `/api/private/` 前缀。
- 鉴权依赖和 scope 是否正确。
- OpenAPI 文档是否准确。
- 错误格式是否符合现有约定。
- 是否意外改变响应字段、分页、排序、状态码或缓存行为。

## 数据库审查清单

修改 `app/database/` 后审查：

- 是否新增或更新迁移。
- 是否导出新模型并触发 `model_rebuild()`。
- 迁移 SQL 是否符合预期。
- 索引是否足够，是否有重复或低价值索引。
- nullable、默认值、唯一约束和外键是否会破坏已有数据。
- 大表变更是否需要分阶段上线或维护脚本。

## 性能建议

数据库：

- 只选择必要字段，避免无条件 `select(Model)`。
- 用 `exists()` 检查存在性。
- 避免 N+1 查询，合理使用 `selectinload` / `joinedload`。
- 批量插入、更新和删除应在同一事务中分批执行。
- 排行榜、分数、每日挑战、谱面同步和缓存重算路径要特别关注索引。

异步与任务：

- 不要在事件循环中直接执行阻塞 IO 或 CPU 密集计算。
- API 路由中耗时工作放入 `BackgroundTasks`。
- 非路由场景使用 `app.helpers.bg_tasks`。
- 定时任务记录开始、结束、跳过、失败和耗时。
- 外部请求设置超时，避免启动和任务被无限挂起。

缓存：

- 热点响应优先复用已有缓存服务。
- 写路径必须同步检查缓存失效。
- 二进制数据使用 `redis_binary_client`
  或存储服务，不要误用默认 decode 的 Redis 连接。
- PubSub / BRPOP 等阻塞读取使用 `redis_blocking_client`。

## AI 与自动化代理规则

使用 Copilot、LLM、Dependabot、pre-commit.ci 或其他自动化工具时必须遵守：

1. 自动生成代码必须由维护者审核。
2. 不提交密钥、token、真实 `.env`、生产数据库地址或用户敏感数据。
3. 代理 PR 必须单一职责。
4. 依赖升级 PR 需要通过 CI 和 pre-commit。
5. 不在 v1/v2/notification 添加非官方端点。
6. 未经批准不修改公共契约。
7. 不创建额外的一次性测试脚本作为提交内容。

给 LLM/Copilot 的提示应明确文件位置和限制，例如：

```text
Add an async endpoint under app/router/private/example.py.
Do not add endpoints to app/router/v1 or app/router/v2.
Use Database and Redis dependencies from app.dependencies.database.
Keep business logic in app/service/example_service.py.
```

## 安全与许可证提醒

- 任何派生、修改或部署都必须遵守仓库许可证要求，并清晰标注 GooGuTeam 与原项目地址。
- 生产环境必须修改默认 JWT secret 和 OAuth client secret。
- `/_lio` 路径不应暴露到公网。
- 日志、错误和调试输出不得泄露认证信息或用户敏感信息。
