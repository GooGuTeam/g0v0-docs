---
---

# Wiki, Changelog, and News

g0v0 implements the osu! wiki, changelog and news endpoints, so that the **Wiki**, **Changelog** and **News** overlays of the client (`osu!lazer`) show the content of your own repository. None of it is stored in the database: articles, build notes and posts are files in a Git repository, and the server only reads, caches and answers them in the shape of the osu! API.

| Feature       | Endpoint                                                                    | Where the client shows it | Content source                                   |
|---------------|-----------------------------------------------------------------------------|---------------------------|--------------------------------------------------|
| Wiki          | `GET /api/v2/wiki/{locale}/{path}`                                          | Wiki overlay              | `WIKI_REPOSITORY` (default `ppy/osu-wiki`)       |
| Wiki images   | `GET /wiki/images/{path}`                                                   | Wiki / news banners       | `WIKI_CONTENT_ROOT` of the same repository       |
| Changelog     | `GET /api/v2/changelog`, `/api/v2/changelog/{stream}/{build}`, `/{version}` | Changelog overlay         | `CHANGELOG_CONTENT_ROOT` of `CONTENT_REPOSITORY` |
| News          | `GET /api/v2/news`, `/api/v2/news/{news}`                                   | News overlay              | `NEWS_CONTENT_ROOT` of `CONTENT_REPOSITORY`      |
| Image wrapper | `GET /media-url?url=...`                                                    | Every Markdown            | —                                                |

All of these are public (no OAuth token needed) and rate limited like the rest of `/api/v2`. Every setting is listed in [Configurations](../reference/configurations.md).

## What they share

The three read their content through the same client and cache (`app/service/repository.py`):

- **Read, never render.** The server answers with Markdown and the client renders it. The HTML fields of a response (a post's `content`, an entry's `message_html`) are always `null` by design, not for lack of data.
- **Mirrors and self-hosted repositories work.** Text is read from `*_RAW_BASE_URL/{owner}/{repo}/{branch}/{path}` and directories are listed through `*_LISTING_BASE_URL/repos/{owner}/{repo}/contents/{path}`, so anything GitHub compatible will do.
- **Nothing waits on the network at startup.** Caches are warmed in the background; a slow or unreachable repository delays neither startup nor a request that already has a cache entry.
- **No repair.** A file that fails validation is skipped whole, with the field it broke on written to the log. Nothing is filled in from elsewhere.

## Wiki

### Article layout

The wiki reuses the layout of osu-wiki — one file per language, per page:

```text
{WIKI_CONTENT_ROOT}/{path}/{locale}.md
```

With the defaults (`WIKI_REPOSITORY=ppy/osu-wiki`, `WIKI_BRANCH=master`, `WIKI_CONTENT_ROOT=wiki`), the English `Gameplay/Accuracy` is `wiki/Gameplay/Accuracy/en.md` in that repository.

The `{locale}` of a request is tried in this order, and the `locale` in the response is the one **actually served**:

1. The requested language (`zh-CN` → `zh-cn`; underscores are normalised to dashes)
2. Its primary subtag (`zh`)
3. `WIKI_FALLBACK_LOCALE` (default `en`)

`available_locales` comes from listing the directory. Leave `WIKI_LISTING_BASE_URL` empty and the listing is unavailable: the served language is then the only one reported, and pages still resolve.

### Paths and redirects

`{path}` accepts whatever the client can produce — `Gameplay/Accuracy`, `/wiki/Gameplay/Accuracy`, `Accuracy.md` — anchors and query strings are dropped, and a `..` that would leave the repository root is refused.

The `redirect.yaml` of the repository (the same map osu-web reads) is consulted only when no page carries the path; keys are normalised for case and spaces. **The server answers with the target page directly** rather than a 302: the client treats the `path` of a response as its current location, so resolving the redirect here saves a round trip and keeps the request authenticated. At most 5 redirects are followed per request, and loops (such as `sitemap: Sitemap`) are detected.

### Page metadata

| Field               | Source                                                                                                   |
|---------------------|----------------------------------------------------------------------------------------------------------|
| `title`             | The `title` of the front matter → the first level-1 heading (link text) → derived from the path          |
| `layout`            | The `layout` of the front matter; only `main_page` is special cased, anything else renders as an article |
| `tags`              | The `tags` of the front matter (inline list or single string)                                            |
| `subtitle`          | Title of the parent page; empty when the parent is not an article                                        |
| `markdown`          | Passed through as written — front matter included, no rewriting of links or images                       |
| `available_locales` | The languages found by listing the directory                                                             |

### Images and `/media-url`

osu-wiki writes its images as `/wiki/shared/...` (absolute) or `img/...` (relative to the article). The client resolves both and rewrites the `/wiki/` segment into `/wiki/images/`, so the server offers:

- `GET /wiki/images/{path}` — `{path}` is relative to `WIKI_CONTENT_ROOT`, only common image extensions are served, and the response carries `Cache-Control: max-age=604800`.
- `GET /media-url?url=...` — the client wraps **every** Markdown image it renders (wiki, beatmap descriptions, comments) in this endpoint. It only redirects: a `/wiki/` path is rewritten to `/wiki/images/`, an absolute URL is passed through, and anything else is treated as a path on this host.

Two things that trip people up:

- `/media-url` is **not** affected by `ENABLE_WIKI`, because beatmap descriptions and comments load their images through it too.
- It refuses browser requests (anything carrying `Origin`, `Referer` or `Sec-Fetch-Site` answers 403), and refuses `//host/path`, which is another host in disguise. **Opening the endpoint in a browser and getting 403 is expected**, not a misconfiguration.

### Pointing at your own repository

```dotenv
# Your own fork or mirror
WIKI_REPOSITORY=your-name/osu-wiki
WIKI_BRANCH=master
WIKI_CONTENT_ROOT=wiki
WIKI_RAW_BASE_URL=https://raw.githubusercontent.com
WIKI_LISTING_BASE_URL=https://api.github.com
# Listing goes through the GitHub API, which allows 60 requests an hour unauthenticated
WIKI_GITHUB_TOKEN=ghp_xxxxxxxx
WIKI_FALLBACK_LOCALE=en
```

`WIKI_RAW_BASE_URL` may point at a mirror of your own, as long as files can be fetched as `{base}/{owner}/{repo}/{branch}/{path}`. If `available_locales` is not needed, `WIKI_LISTING_BASE_URL` can be cleared as well, and the wiki then needs the GitHub API not at all.

### Turning the wiki off

```dotenv
ENABLE_WIKI=false
```

Wiki pages and wiki images then answer 404 (not 403). The client's wiki overlay cannot load content, but nothing else is affected — including the images of comments and beatmap descriptions.

## Changelog

### Layout

```text
{CHANGELOG_CONTENT_ROOT}/
  streams.json                 # optional, describes the streams
  g0v0/
    2026.1009.0-g0v0.json      # one file per build
    2026.1002.0-g0v0.json
  robin/
    2026.1015.0-robin.json
```

The directory is the stream name (`changelog/g0v0/` is served at `/api/v2/changelog/g0v0/...`) and the file name is the version of the build.

A build file:

```json
{
  "version": "2026.1009.0-g0v0",
  "created_at": "2026-10-09 12:00:00 +0000",
  "entries": [
    {
      "type": "add",
      "category": "Client",
      "title": "Spectator mode",
      "message": "Watching a multiplayer room no longer requires a client restart.",
      "url": "https://github.com/GooGuTeam/g0v0-server/pull/512"
    }
  ]
}
```

| Key               | Required | Notes                                                                                                                  |
|-------------------|----------|------------------------------------------------------------------------------------------------------------------------|
| `version`         | yes      | Both `2026.1009.0` and `2026.1009.0-g0v0` are accepted. A `-suffix` names the stream, so it has to match the directory |
| `entries`         | yes      | At least one. A build that lists nothing is a file left half-written                                                   |
| `id`              | no       | Derived from the digits of `version`. Declare it when two builds spell the same digits                                 |
| `display_version` | no       | Defaults to `version` without the `-suffix` and any non-numeric characters, which is what the client shows             |
| `created_at`      | no       | Defaults to the date carried by `version`, at midnight UTC; neither means the build is refused                         |
| `users`           | no       | Users on this build, `0` by default, summed per stream into `user_count`                                               |
| `youtube_id`      | no       | Video shown above the changelog, as the bare identifier                                                                |

An entry requires `type`, which is one of `add`, `fix` or `misc` (the client has an icon per type, so an unknown one is refused), and at least one of `title` and `message`. `category` defaults to `Miscellaneous`; `url`, `repository`, `github_url`, `github_pull_request_id`, `major`, `created_at` and `github_user` are also accepted.

### Streams

`streams.json` describes only the streams you want to control; the list may be top level or under a `streams` key:

```json
{
  "streams": [
    { "name": "g0v0", "id": 1, "display_name": "g0v0", "is_featured": true },
    { "name": "robin", "id": 2, "display_name": "robin" }
  ]
}
```

- `name` has to be the directory name, and is limited to lowercase letters, digits and dashes. `id` defaults to the position in the list, `display_name` to `name`.
- Featured streams are listed first.
- **`user_count` does not belong here.** It is summed from the `users` of the stream's builds, the way osu-web does it, so a number typed into the file would only be a copy that goes stale — and it is refused.
- A directory nobody describes still shows up, under the directory name.
- **A stream with no build at all is left out of the response**, because the client unconditionally reads the `latest_build` of every stream.

### Three ways to address a build

| Request                                  | Meaning                                                                     |
|------------------------------------------|-----------------------------------------------------------------------------|
| `GET /api/v2/changelog/{stream}/{build}` | A version of a given stream                                                 |
| `GET /api/v2/changelog/{version}`        | By version; a stream name is also accepted and resolves to its newest build |
| `GET /api/v2/changelog/{version}?key=id` | By build identifier                                                         |

Both `{build}` and `{version}` accept the version with or without its suffix: when the exact match fails, the lookup is retried against `display_version` (the version without the `-suffix` and non-numeric characters), so a `2026.1009.0` link copied out of the client does not 404.

### What a response says

- A listing is newest first and always **21 builds per page** (`search.limit` reports that figure), filtered by `stream`, `from`, `to` and `max_id`.
- Markdown bodies are returned unless `message_formats[]` is sent without `markdown`, in which case `message` is `null`. `message_html` is always `null`.
- The single-build endpoints carry `versions.next` and `versions.previous` (within the same stream); builds listed inside a page do not.
- `streams[]` of a listing carries `user_count` and `latest_build`; the `update_stream` nested in a build carries the four identifying fields only.
- `users` and `user_count` are **what the files declare**: the server does not track which build a client actually runs.

## News

### Post format

A post is written the way osu-wiki writes its `news/` articles — one Markdown file per post, whose file name without `.md` is its slug, that is the `{news}` of `/api/v2/news/{news}`. Posts may sit in a directory per year, or flat.

```markdown
---
title: A title
author: GooGuTeam
date: 2026-10-28 08:00:00 +0000
updated: 2026-10-28 09:30:00 +0000
---

![banner](/wiki/shared/news/2026-10-28-autumn-update/banner.jpg)

The opening paragraph becomes the preview in the listing.
```

| Key       | Required | Notes                                                                         |
|-----------|----------|-------------------------------------------------------------------------------|
| `title`   | yes      | Shown in the listing and the notification                                     |
| `author`  | yes      | Credited as written                                                           |
| `date`    | yes      | Publication time. Orders the listing, and the post goes public at this moment |
| `updated` | no       | Defaults to `date`                                                            |
| `id`      | no       | Numeric identifier, derived to the second from `date` when absent             |
| `series`  | no       | Free text for now (not checked against a list)                                |

The front matter is read by a small flat YAML parser: `key: value` on one line, plus inline lists such as `tags: [a, b]`. **Nested blocks are ignored.** A bare number is read as an integer, which is what makes `id: 20261028080000` a number rather than text.

The **first image** of the body becomes the listing banner:

- `/wiki/...` or `/wiki/images/...` → served by the wiki image endpoint of this server, so shared banners belong in `wiki/shared/news/` of `ppy/osu-wiki`
- an absolute `http(s)://` URL → used as written
- any other relative path → resolved against the content repository

### Listing and pagination

The parameters of `GET /api/v2/news`:

| Parameter                            | Meaning                                                            |
|--------------------------------------|--------------------------------------------------------------------|
| `limit`                              | Posts per page, 12 by default, clamped to 1–21                     |
| `year`                               | Only list a given year                                             |
| `cursor_string`                      | The cursor a previous response returned, sent back whole           |
| `cursor[published_at]`, `cursor[id]` | The same cursor split per key — **which is what the client sends** |

`news_sidebar` carries the year navigation: `current_year` is the year of the first returned post (the requested year, or the current one, when the page is empty), `news_posts` holds every post of that year, and `years` lists every year that has a post, newest first.

Two behaviours worth knowing, both aligned with osu-web:

- A post whose `date` is in the future is **not** listed, and cannot be read on its own either (404).
- Listing the current year during its first three months also includes posts from November and December of the previous year, so that the turn of the year does not empty the listing.

### Body and links

- `content` (rendered HTML) is always `null`; the body is in `content_markdown`, and is `null` when `content_formats[]` is sent without `markdown`.
- `first_image@2x` is always `null`, as the content repository ships one file per image.
- `edit_url` is built from `CONTENT_WEB_BASE_URL`, the repository, the branch and the file path, and points at the source file.
- The single-post endpoint carries `navigation.newer` and `navigation.older`.

## Caching and how long a change takes

| What                               | Where                             | Lifetime                                                                             |
|------------------------------------|-----------------------------------|--------------------------------------------------------------------------------------|
| Wiki article text (404 included)   | Redis DB 0, `g0v0:wiki:v2:...`    | `WIKI_CACHE_EXPIRE_SECONDS` (300s)                                                   |
| Wiki image bytes                   | Redis DB 2 (media type in DB 0)   | `WIKI_RESOURCE_CACHE_EXPIRE_SECONDS` (3600s); a missing image is remembered for 300s |
| Wiki directory listing / redirects | Redis / in-process                | `WIKI_RESOURCE_CACHE_EXPIRE_SECONDS` (3600s)                                         |
| Content files (404 included)       | Redis DB 0, `g0v0:content:v2:...` | `CONTENT_CACHE_EXPIRE_SECONDS` (300s)                                                |
| Parsed metadata (by blob SHA)      | Redis DB 0                        | 30 days (the key changes with the content)                                           |
| Parsed snapshot                    | In-process                        | `CONTENT_INDEX_EXPIRE_SECONDS` (600s), refreshed in the background                   |
| Content directory listing          | Redis                             | `CONTENT_LISTING_CACHE_EXPIRE_SECONDS` (1800s)                                       |

Both snapshots are stale-while-revalidate: once expired, the old value is served while a refresh runs in the background. A refresh that fails keeps the previous value and backs off for 60 seconds.

The listing cache has to outlive the snapshot, or every background refresh would call the GitHub API again. The price is that **a new file can take up to 1800 seconds to be noticed**, and restarting does not change that, because the listing lives in Redis.

## Troubleshooting

| Symptom                                           | Cause and fix                                                                                                                                  |
|---------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `/api/v2/changelog` or `/api/v2/news` answers 503 | `CONTENT_LISTING_BASE_URL` is empty (nothing can be listed), or listing the repository failed (rate limit, private repository without a token) |
| The log says "No build ... could be read"         | The directory holds files, but all of them failed validation. The log names the file and the field — fix the file, not the server              |
| A new post or build does not show up              | Wait for `CONTENT_INDEX_EXPIRE_SECONDS` and `CONTENT_LISTING_CACHE_EXPIRE_SECONDS`, or drop the matching Redis keys to publish it now          |
| `content` or `message_html` is `null`             | Expected: the server only returns Markdown                                                                                                     |
| A post 404s although the file is there            | Its `date` is in the future, or its slug differs from the file name                                                                            |
| A wiki page 404s although the file is there       | Check `WIKI_CONTENT_ROOT`, the language file name, and the case of the path (repository paths are case sensitive)                              |
| Wiki images are broken                            | Images are served by this server: `ENABLE_WIKI` has to be on, and `/wiki/images/...` has to resolve                                            |
| A browser gets 403 from `/media-url`              | Expected: the endpoint refuses browser requests                                                                                                |
