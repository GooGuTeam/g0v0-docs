---
---

# Wiki、更新日志与新闻

g0v0 实现了 osu! 的 wiki、changelog 与 news 三组端点，让客户端的 **Wiki**、**更新日志** 与 **新闻** 浮层显示定制内容。

考虑到这三类内容的数据量很大且应单独维护，g0v0 会从指定的外部仓库读取它们并按 osu! API 规范返回，同时提供简单的缓存服务。

| 功能      | 端点                                                                        | 客户端位置      | 内容来源                                         |
|-----------|-----------------------------------------------------------------------------|-----------------|--------------------------------------------------|
| Wiki      | `GET /api/v2/wiki/{locale}/{path}`                                          | Wiki 浮层       | `WIKI_REPOSITORY`（默认 `ppy/osu-wiki`）         |
| Wiki 图片 | `GET /wiki/images/{path}`                                                   | Wiki / 新闻封面 | 同上仓库的 `WIKI_CONTENT_ROOT`                   |
| 更新日志  | `GET /api/v2/changelog`、`/api/v2/changelog/{stream}/{build}`、`/{version}` | 更新日志浮层    | `CONTENT_REPOSITORY` 的 `CHANGELOG_CONTENT_ROOT` |
| 新闻      | `GET /api/v2/news`、`/api/v2/news/{news}`                                   | 新闻浮层        | `CONTENT_REPOSITORY` 的 `NEWS_CONTENT_ROOT`      |
| 图片包装  | `GET /media-url?url=...`                                                    | 所有 Markdown   | ——                                               |

## 特性

三条内容服务链路共用同一套读取与缓存机制：

- **仅提供单一格式**。g0v0 始终返回 Markdown，响应中的 HTML 格式字段留空，客户端应按需自行处理。
- **GitHub 兼容**。文本从 `*_RAW_BASE_URL/{owner}/{repo}/{branch}/{path}` 读取，目录列举走 `*_LISTING_BASE_URL/repos/{owner}/{repo}/contents/{path}`。
- **后台预热**。启动时在后台预热缓存；仓库访问问题不会影响其他核心功能，以及已有的内容缓存。
- **严格处理**。内容文件无效时即被跳过，不会提供回退值。

## Wiki

### 文章布局

Wiki 采用 osu-wiki 的仓库布局——一个页面每种语言一个文件：

```text
{WIKI_CONTENT_ROOT}/{路径}/{语言}.md
```

默认 `WIKI_REPOSITORY=ppy/osu-wiki`、`WIKI_BRANCH=master`、`WIKI_CONTENT_ROOT=wiki`

### 路径与重定向

`{path}` 接受客户端能产生的各种写法：`Gameplay/Accuracy`、`/wiki/Gameplay/Accuracy`、`Accuracy.md`。

页面不存在时，g0v0 会同时检查仓库里的 `redirect.yaml` 给出重定向（服务器层面）后的页面。

### 页面元数据

| 字段                | 来源                                                                        |
|---------------------|-----------------------------------------------------------------------------|
| `title`             | front matter 的 `title` → 正文第一个一级标题（链接取链接文本）→ 由路径推导  |
| `layout`            | front matter 的 `layout`； （`main_page` 采用主页布局） |
| `tags`              | front matter 的 `tags`（行内列表或单个字符串）                              |
| `subtitle`          | 上级页面的标题；上级不是文章时为空                                          |
| `markdown`          | 原样返回                               |
| `available_locales` | 目录列举得到的语言列表                                                      |

### 图片与 `/media-url`

osu-wiki 的 Markdown 里图片写成 `/wiki/shared/...`（绝对）或 `img/...`（相对文章）。客户端解析后会把 `/wiki/` 重写成 `/wiki/images/`，所以本服务器提供：

- `GET /wiki/images/{path}` —— 返回 Wiki 图片。

### 指向自己的仓库

```dotenv
# 用自己的 fork 或镜像
WIKI_REPOSITORY=your-name/osu-wiki
WIKI_BRANCH=master
WIKI_CONTENT_ROOT=wiki
WIKI_RAW_BASE_URL=https://raw.githubusercontent.com
WIKI_LISTING_BASE_URL=https://api.github.com
# 目录列举走 GitHub API，未认证时每小时的请求数受限
WIKI_GITHUB_TOKEN=ghp_xxxxxxxx
WIKI_FALLBACK_LOCALE=en
```

`WIKI_RAW_BASE_URL` 也可以指向自建仓库，只要格式符合 `osu-wiki` 结构即可。

## 更新日志

### 目录结构

```text
{CHANGELOG_CONTENT_ROOT}/
  streams.json                 # 可选，描述通道
  g0v0/
    2026.1009.0-g0v0.json      # 每个构建一个文件
    2026.1002.0-g0v0.json
  robin/
    2026.1015.0-robin.json
```

目录名就是通道名（`changelog/g0v0/` 对应 `/api/v2/changelog/g0v0/...`），文件名就是构建的版本。

一个构建文件：

```json
{
  "version": "2026.1009.0-g0v0",
  "created_at": "2026-10-09 12:00:00 +0000",
  "entries": [
    {
      "type": "add",
      "category": "客户端",
      "title": "旁观模式",
      "message": "观战多人房间不再需要重启客户端。",
      "url": "https://github.com/GooGuTeam/g0v0-server/pull/512"
    }
  ]
}
```

| 字段              | 必填 | 说明                                                                                     |
|-------------------|------|------------------------------------------------------------------------------------------|
| `version`         | 是   | `2026.1009.0` 与 `2026.1009.0-g0v0` 都接受。`-后缀` 表示构建所属通道，必须与所在目录一致 |
| `entries`         | 是   | 至少一条。                                                  |
| `id`              | 否   | 由 `version` 中的数字推导。两个构建数字相同则显式声明                                    |
| `display_version` | 否   | 去掉 `-后缀` 与非数字字符后的版本，即客户端显示的版本                                    |
| `created_at`      | 否   | 默认取 `version` 里的日期（UTC 零点）；两者都没有则拒绝                                  |
| `users`           | 否   | 该构建的用户数，默认 `0`。                                   |
| `youtube_id`      | 否   | 构建上方的视频，填裸 ID                                                                  |

条目里 `type` 必须是 `add`、`fix`、`misc`；`title` 与 `message` 至少存在一个；`category` 默认为 `Miscellaneous`；另有 `url`、`repository`、`github_url`、`github_pull_request_id`、`major`、`created_at`、`github_user`。

### 通道

`streams.json` 只描述需要显示的通道，列表可以顶层，也可以放在 `streams` 下：

```json
{
  "streams": [
    { "name": "g0v0", "id": 1, "display_name": "g0v0", "is_featured": true },
    { "name": "robin", "id": 2, "display_name": "robin" }
  ]
}
```

- `name` 必须是目录名，且只用小写字母、数字和连字符；`id` 默认取位置，`display_name` 默认取 `name`。
- `is_featured` 的通道排在前面。
- **不允许出现 `user_count`**（g0v0 会实时计算出各通道的活跃用户数。）
- 没有在该文件中声明的目录依然会出现，使用目录名作显示名。
- 没有构建版本的通道**不会出现**。

### 三种寻址方式

| 请求                                     | 语义                                               |
|------------------------------------------|----------------------------------------------------|
| `GET /api/v2/changelog/{stream}/{build}` | 指定通道与版本                                     |
| `GET /api/v2/changelog/{version}`        | 按版本查找；也接受通道名（解析为该通道最新的构建） |
| `GET /api/v2/changelog/{version}?key=id` | 按构建 ID 查找                                     |

`{build}` 与 `{version}` 都接受带后缀和不带后缀的写法：精确匹配失败后，会按 `display_version`（砍掉 `-后缀` 与非数字字符）再匹配一次，所以从客户端里复制出来的 `2026.1009.0` 链接不会 404。

### 响应要点

- 列表按时间倒序，**每页固定 21 条**（`search.limit` 会照实报告这个值），可用 `stream`、`from`、`to`、`max_id` 过滤。
- `message_formats[]` 不传时返回 Markdown；传了但不含 `markdown` 时 `message` 为 `null`。`message_html` 恒为 `null`。
- 单构建端点会带上 `versions.next` / `versions.previous`（同一通道内的前后构建）；列表里的构建不带这个字段。
- 列表里的 `streams[]` 才带 `user_count` 与 `latest_build`；构建里嵌套的 `update_stream` 只有四个标识字段。
- `users` 与 `user_count` 都是**文件里声明的数字**：服务器不追踪客户端实际运行的构建。

## 新闻

### 文章格式

新闻沿用 osu-wiki `news/` 的写法：一篇文章一个 Markdown 文件，文件名（去掉 `.md`）就是它的 slug，也就是 `/api/v2/news/{news}` 的 `{news}`。文章可以按年份分目录，也可以平铺。

```markdown
---
title: 标题
author: GooGuTeam
date: 2026-10-28 08:00:00 +0000
updated: 2026-10-28 09:30:00 +0000
---

![banner](/wiki/shared/news/2026-10-28-autumn-update/banner.jpg)

开头这一段会成为列表里的预览文本。
```

| 字段      | 必填 | 说明                                             |
|-----------|------|--------------------------------------------------|
| `title`   | 是   | 列表与通知里的标题                               |
| `author`  | 是   | 署名，原样显示                                   |
| `date`    | 是   | 发布时间。列表按它排序，并且**到这一刻才会公开** |
| `updated` | 否   | 默认等于 `date`                                  |
| `id`      | 否   | 数字 ID，缺省时由 `date` 精确到秒推导            |
| `series`  | 否   | 自由文本（暂不约束），缺省不填                   |

正文里**第一张图片**会成为列表横幅：

- `/wiki/...` 或 `/wiki/images/...` → 由本服务器的 Wiki 图片端点提供
- `http(s)://` 绝对地址 → 原样使用
- 其他相对路径 → 按内容仓库解析

## 缓存

| 内容                      | 存活时间                                                           |
|---------------------------|--------------------------------------------------------------------|
| Wiki 文章文本（含 404）   | `WIKI_CACHE_EXPIRE_SECONDS`（300s）                                |
| Wiki 图片字节             | `WIKI_RESOURCE_CACHE_EXPIRE_SECONDS`（3600s）；不存在的图只记 300s |
| Wiki 目录列举 / 重定向表  | `WIKI_RESOURCE_CACHE_EXPIRE_SECONDS`（3600s）                      |
| 内容文件（含 404）        | `CONTENT_CACHE_EXPIRE_SECONDS`（300s）                             |
| 内容元数据（按 blob SHA） | 30 天（只有文件内容变化才会换 key）                                |
| 内容快照（已解析）        | `CONTENT_INDEX_EXPIRE_SECONDS`（600s），过期后台刷新               |
| 内容目录列举              | `CONTENT_LISTING_CACHE_EXPIRE_SECONDS`（1800s）                    |

## 常见问题

| 现象                                              | 原因与处理                                                                                                      |
|---------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| `/api/v2/changelog` 或 `/api/v2/news` 返回 503    | `CONTENT_LISTING_BASE_URL` 为空（无法列举），或仓库列举失败（限流、私有仓库缺 Token）                           |
| 服务端日志说「No build ... could be read」        | 目录里有文件但全部校验失败。日志会指出具体文件与字段，修文件而不是改服务器                                      |
| 新加的文章 / 构建没出现                           | 等 `CONTENT_INDEX_EXPIRE_SECONDS` 与 `CONTENT_LISTING_CACHE_EXPIRE_SECONDS` 到期；要立刻生效就清理对应的 Redis 键 |
| 新闻 `content`、更新日志 `message_html` 是 `null` | 预期行为，服务器只返回 Markdown                                                                                 |
| 新闻单篇 404，但文件确实在仓库里                  | `date` 在未来（未公开），或 slug 与文件名不一致                                                                 |
| Wiki 页面 404，文件存在                           | 检查 `WIKI_CONTENT_ROOT`、语言文件名、路径大小写（仓库路径区分大小写）                                          |
| Wiki 图片裂图                                     | 图片由本服务器提供，需要 `ENABLE_WIKI=true`；检查 `/wiki/images/...` 能否直接取到                               |
| 浏览器打开 `/media-url` 得到 403                  | 预期行为，该端点拒绝浏览器来源                                                                                  |
