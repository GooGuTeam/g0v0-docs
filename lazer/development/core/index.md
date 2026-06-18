---
---

# 核心开发

本节面向直接修改 g0v0-server 核心代码的开发者，覆盖开发环境、项目结构、路由、鉴权、数据库、迁移、服务、任务、日志、错误处理、质量检查和 PR 规范。

本文档以 GooGuTeam/g0v0-server 最新 `main` 分支为准。若本节内容与插件开发文档冲突：核心代码以本节为准，插件代码以[插件开发](/lazer/development/plugin/)为准。

## 快速入口

- [开发环境与命令](./setup)：准备仓库、依赖、配置和常用命令。
- [项目结构与生命周期](./architecture)：理解核心目录、启动顺序和关闭顺序。
- [路由、API 与鉴权](./routers)：保持 osu! API 兼容并正确使用依赖注入。
- [数据库、模型与迁移](./database)：编写 SQLModel 模型、按需返回模型、Redis 和迁移。
- [服务、任务、日志与错误处理](./services-tasks)：组织业务逻辑、后台任务、调度器和结构化错误。
- [代码质量、PR 与性能](./quality)：提交前检查、PR 范围、AI 代理规则和性能注意事项。

## 核心原则

1. **公开 API 保持兼容。**
   `app/router/v1/`、`app/router/v2/`、`app/router/notification/`
   只能实现官方 osu! API 已存在的端点；自定义或实验性端点必须放在
   `app/router/private/`。
2. **路由保持轻量。** 路由处理器负责参数、鉴权和响应组合；复杂业务逻辑放入
   `app/service/`。
3. **数据库变更必须迁移。** 修改 `app/database/`
   中的 SQLModel 表结构后，必须生成并人工审查迁移。
4. **优先异步，避免阻塞。** 所有路由处理器必须是
   `async`；耗时工作使用后台任务、调度器或线程池封装。
5. **公共契约稳定。**
   未经迁移计划与兼容性说明，不要随意修改响应 schema、路由前缀、鉴权 scope 或错误格式。
6. **提交前通过检查。**
   至少运行 Ruff、格式化、Pyright 与 pre-commit；当前仓库没有完整测试套件，因此静态检查和人工审查更重要。

## 与仓库文档的关系

最新仓库中的 `CONTRIBUTING.md`
已指向本页。`AGENTS.md`
仍保留面向 Copilot、LLM、Dependabot、pre-commit.ci 和后台 worker 的短规则；本节会展开这些规则，并给出适合人工开发者阅读的背景说明。
