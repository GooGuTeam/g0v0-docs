---
---

# 部署前端

g0v0 的前端网站可以独立于后端部署。部署任意前端前，请先确认 g0v0 后端已经可以正常从公网访问。

## 通用要求

无论你使用哪一种前端，通常都需要同时检查**服务器配置**和**前端配置**。

### 服务器配置

部署前端前，建议至少确认以下配置：

- `SERVER_URL`：后端 API 对外访问地址。
- `FRONTEND_URL`：前端站点地址。
- `CORS_URLS`：如果前端直接跨域请求 API，需要允许前端域名。
- `OSU_WEB_CLIENT_ID` 和
  `OSU_WEB_CLIENT_SECRET`：Web 前端登录只使用 OAuth，这组配置必须与前端保持一致。
- `ENABLE_TURNSTILE_VERIFICATION` 和
  `TURNSTILE_SECRET_KEY`：如果前端启用了 Cloudflare
  Turnstile，需要在后端一并配置。

关于这些配置的详细说明，请参考[配置](../reference/configurations.md)。

如果你使用的是 AWS S3 或 Cloudflare
R2 存储，并且让前端直接访问头像、封面等静态资源，还需要在对象存储的 CORS 配置中允许前端域名。

### 前端配置

前端通常至少需要修改以下内容：

- API 地址
- 前端站点域名对应的部署平台设置
- 验证服务配置，例如 Turnstile Site Key
- 站点标题、图标、统计脚本等品牌信息

此外，如果你的部署平台不会自动处理单页应用路由，你还需要额外配置 SPA 回退规则，将前端路由重写到
`index.html`。

### 前端署名要求

只要你使用 g0v0-server 作为后端并部署前端，就应在前端页面中保留清晰可见的署名，例如页脚、关于页或源码仓库说明中至少包含：

```text
GooGuTeam/g0v0-server - https://github.com/GooGuTeam/g0v0-server
```

建议同时在前端仓库 README 或站点页脚中注明后端项目和开发者来源。

## [gusou-lazer-web](https://github.com/GooGuJiang/gusou-lazer-web)

gusou-lazer-web 是一个基于 Vite 构建的静态前端，适合部署到 Vercel、Netlify、Cloudflare
Pages 或自行托管的 NGINX。

:::warning 注意

部署 gusou-lazer-web 时，不要只修改前端 `.env`。如果你更改了域名、CORS、Web
OAuth Client 或 Turnstile，后端配置也要同步修改。

:::

### 修改前端配置

gusou-lazer-web 的网页登录流程依赖的 OAuth。必须修改后端的 `OSU_WEB_CLIENT_ID`
和 `OSU_WEB_CLIENT_SECRET`。

:::tip 提示

`OSU_WEB_CLIENT_ID` 可以保持默认值 `6`，也可以改成
**10 以内的整数**，以避免和用户自行新建的 OAuth 客户端冲突。g0v0 中用户新建的 OAuth 客户端 ID 从
`10` 开始分配。

:::

可以使用下面的方式生成一个新的 `OSU_WEB_CLIENT_SECRET`：

```sh
openssl rand -hex 32
```

`OSU_WEB_CLIENT_SECRET`
需要替换为上面生成的新密钥。修改后，前端和后端必须保持一致。

先将
[`GooGuJiang/gusou-lazer-web`](https://github.com/GooGuJiang/gusou-lazer-web)
fork 到你自己的 GitHub 账号，在你自己的 fork 中修改代码和配置。

在 `.env` 中，至少需要确认以下内容：

```dotenv
VITE_API_BASE_URL=https://lazer-api.example.com
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

如果你的部署平台会将 `/api/*` 代理到后端，也可以改成：

```dotenv
VITE_API_BASE_URL=/api
```

除环境变量外，以下文件也可能需要按你的环境修改：

| 文件                      | 说明                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `src/utils/api/config.ts` | 如果你修改了后端的 `OSU_WEB_CLIENT_ID` 或 `OSU_WEB_CLIENT_SECRET`，这里也要同步修改。 |
| `index.html`              | 修改页面标题、描述和统计脚本。                                                        |
| `public/`                 | 替换 logo、背景图等静态资源。                                                         |
| `vercel.json`             | 如果平台不会自动读取 Vercel 规则，需要把里面的重写和代理规则迁移到你的平台。          |

### 构建前端

如果你需要本地验证，可以在你的 fork 仓库中安装依赖后执行：

```sh
corepack enable
pnpm install
pnpm build
```

构建完成后，静态文件会输出到 `dist/` 目录。

### 部署到 Vercel 等平台

如果你要部署到 Vercel、Netlify、Cloudflare
Pages 这类支持 Git 自动构建的静态站点平台，可以按下面的方式配置：

1. 在部署平台中导入你自己的 fork 仓库。
2. 分支使用你 fork 仓库中的 `main`。
3. 将运行时设置为 Node.js 20+。
4. 安装命令填写 `corepack enable && pnpm install --frozen-lockfile`。
5. 构建命令填写 `pnpm build`。
6. 输出目录填写 `dist`。
7. 在平台环境变量中添加 `VITE_API_BASE_URL` 和 `VITE_TURNSTILE_SITE_KEY`。

如果你使用的是 Vercel，仓库中的 `vercel.json` 可以作为默认参考。

gusou-lazer-web 使用 React Router 的
`BrowserRouter`，因此必须配置 SPA 回退规则。否则刷新
`/login`、`/register`、`/rankings` 这类页面时会得到 404。

如果你的部署平台支持 API 代理，推荐：

- 将 `/api/*` 代理到 `https://lazer-api.example.com/api/*`
- 将前端环境变量 `VITE_API_BASE_URL` 设为 `/api`

如果你的部署平台不支持代理，则直接将 `VITE_API_BASE_URL`
设为完整 API 地址，并在后端的 `CORS_URLS` 中允许前端域名。

### 测试登录

部署完成后，直接访问前端登录页进行测试：

```text
https://your-frontend-domain.com/login
```

如果页面可以正常打开，并且能够完成登录，说明前端地址、后端 API 地址、OAuth 配置基本正确。

随后再参考[通过客户端连接到服务器](./login-from-client.md)：

- `Website Url` 填写前端地址
- `API Url` 填写后端 API 地址
