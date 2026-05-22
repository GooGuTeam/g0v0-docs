---
---

# Deploying the Frontend

The g0v0 website frontend can be deployed separately from the backend. Before
deploying any frontend, make sure your g0v0 backend is already reachable from
the public internet.

## General Requirements

No matter which frontend you use, you usually need to check both the **server
configuration** and the **frontend configuration**.

### Server Configuration

Before deploying a frontend, you should at least review these settings:

- `SERVER_URL`: public backend API address
- `FRONTEND_URL`: frontend site address
- `CORS_URLS`: required if the frontend calls the API cross-origin
- `OSU_WEB_CLIENT_ID` and `OSU_WEB_CLIENT_SECRET`: web frontend login uses OAuth
  only, so these settings must stay consistent with the frontend
- `ENABLE_TURNSTILE_VERIFICATION` and `TURNSTILE_SECRET_KEY`: required if the
  frontend enables Cloudflare Turnstile

For the full description of these settings, see
[Configurations](../reference/configurations.md).

If you use **AWS S3** or Cloudflare R2 storage and let the frontend access
avatars, covers, or other static assets directly, also allow the frontend domain
in the bucket CORS configuration.

### Frontend Configuration

A frontend deployment usually requires changes to:

- the API base URL
- hosting platform settings for the frontend domain
- verification settings such as the Turnstile Site Key
- branding information such as title, icons, and analytics scripts

Also, if your hosting platform does not automatically handle single-page app
routing, you must configure an SPA fallback that rewrites frontend routes to
`index.html`.

### Frontend Attribution Requirement

If you use g0v0-server as the backend and deploy a frontend for it, keep clear
and visible attribution in the frontend itself. For example, in the footer, an
about page, or repository documentation, include at least:

```text
GooGuTeam/g0v0-server - https://github.com/GooGuTeam/g0v0-server
```

It is recommended to also mention the backend project and original developers in
the frontend repository README or site footer.

## [gusou-lazer-web](https://github.com/GooGuJiang/gusou-lazer-web)

gusou-lazer-web is a Vite-based static frontend and works well on Vercel,
Netlify, Cloudflare Pages, or your own NGINX server.

:::warning Note

When deploying gusou-lazer-web, do not change only the frontend `.env` file. If
you change domains, CORS, the Web OAuth Client, or Turnstile, update the backend
configuration as well.

:::

### Change Frontend Configuration

gusou-lazer-web's web login flow depends on OAuth. You must change the backend
`OSU_WEB_CLIENT_ID` and `OSU_WEB_CLIENT_SECRET`.

:::tip Tip

`OSU_WEB_CLIENT_ID` can stay at the default value `6`, or you can change it to
an integer below `10` to avoid conflicts with OAuth clients created by users. In
g0v0, user-created OAuth client IDs start from `10`.

:::

You can generate a new `OSU_WEB_CLIENT_SECRET` like this:

```sh
openssl rand -hex 32
```

`OSU_WEB_CLIENT_SECRET` should be replaced with the generated secret. After you
change it, keep the frontend and backend values consistent.

First, fork
[`GooGuJiang/gusou-lazer-web`](https://github.com/GooGuJiang/gusou-lazer-web) to
your own GitHub account, and make code and configuration changes in your own
fork.

In `.env`, you should at least confirm these values:

```dotenv
VITE_API_BASE_URL=https://lazer-api.example.com
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

If your hosting platform proxies `/api/*` to the backend, you can use:

```dotenv
VITE_API_BASE_URL=/api
```

Besides environment variables, you may also need to adjust these files:

| File                      | Description                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/utils/api/config.ts` | If you changed `OSU_WEB_CLIENT_ID` or `OSU_WEB_CLIENT_SECRET` on the backend, update the same values here.             |
| `index.html`              | Change the page title, description, and analytics scripts.                                                             |
| `public/`                 | Replace logos, backgrounds, and other static assets.                                                                   |
| `vercel.json`             | If your platform does not read Vercel rules directly, copy its rewrite and proxy behavior into your platform settings. |

### Build the Frontend

If you want to verify the build locally, install dependencies in your fork and
run:

```sh
corepack enable
pnpm install
pnpm build
```

After the build finishes, the generated static files will be placed in `dist/`.

### Deploy to Vercel and Similar Platforms

If you are deploying to Vercel, Netlify, Cloudflare Pages, or similar Git-based
static hosting platforms, use settings like these:

1. Import your own fork into the hosting platform.
2. Use the `main` branch from your fork.
3. Set the runtime to Node.js 20+.
4. Use `corepack enable && pnpm install --frozen-lockfile` as the install
   command.
5. Use `pnpm build` as the build command.
6. Use `dist` as the output directory.
7. Add `VITE_API_BASE_URL` and `VITE_TURNSTILE_SITE_KEY` as environment
   variables.

If you use Vercel, the repository `vercel.json` can be used as the default
reference.

gusou-lazer-web uses React Router with `BrowserRouter`, so an SPA fallback rule
is required. Without it, refreshing routes such as `/login`, `/register`, or
`/rankings` will return 404.

If your hosting platform supports API proxying, it is recommended to:

- proxy `/api/*` to `https://lazer-api.example.com/api/*`
- set `VITE_API_BASE_URL` to `/api`

If your hosting platform does not support proxying, set `VITE_API_BASE_URL` to
the full backend API URL and allow the frontend domain in `CORS_URLS` on the
backend.

### Test Login

After deployment, test it by opening the frontend login page directly:

```text
https://your-frontend-domain.com/login
```

If the page opens correctly and login works, the frontend address, backend API
address, and OAuth configuration are basically correct.

Then follow
[Connect to the Server from the osu!(lazer) Client](./login-from-client.md):

- set `Website Url` to the frontend address
- set `API Url` to the backend API address
