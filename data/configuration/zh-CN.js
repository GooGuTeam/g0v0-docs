export default {
  database: {
    $name: '数据库设置',
    MYSQL_HOST: 'MySQL 服务器地址',
    MYSQL_PORT: 'MySQL 服务器端口',
    MYSQL_DATABASE: 'MySQL 数据库名称',
    MYSQL_USER: 'MySQL 用户名',
    MYSQL_PASSWORD: 'MySQL 密码',
    MYSQL_ROOT_PASSWORD: 'MySQL root 密码',
    REDIS_URL: 'Redis 连接 URL',
  },
  jwt: {
    $name: 'JWT 设置',
    JWT_SECRET_KEY: 'JWT 签名密钥',
    JWT_ALGORITHM: 'JWT 算法',
    ACCESS_TOKEN_EXPIRE_MINUTES: '访问令牌过期时间（分钟）',
    REFRESH_TOKEN_EXPIRE_MINUTES: '刷新令牌过期时间（分钟）',
    JWT_AUDIENCE: 'JWT 受众',
    JWT_ISSUER: 'JWT 签发者',
  },
  oauth: {
    $name: 'OAuth 设置',
    OSU_CLIENT_ID: 'OAuth 客户端 ID',
    OSU_CLIENT_SECRET: 'OAuth 客户端密钥',
    OSU_WEB_CLIENT_ID: 'Web OAuth 客户端 ID',
    OSU_WEB_CLIENT_SECRET: 'Web OAuth 客户端密钥',
  },
  server: {
    $name: '服务器设置',
    HOST: '服务器监听地址',
    PORT: '服务器监听端口',
    DEBUG: '是否启用调试模式',
    CORS_URLS: '额外的 CORS 允许的域名列表 (JSON 格式)',
    SERVER_URL: '服务器 URL',
    FRONTEND_URL: '前端 URL，当访问从游戏打开的 URL 时会重定向到这个 URL，为空表示不重定向',
    ENABLE_RATE_LIMIT: '是否启用速率限制',
    TRUSTED_PROXIES:
      '允许通过 X-Forwarded-For / X-Real-IP / CF-Connecting-IP 提供客户端 IP 的代理地址段（CIDR 列表）。' +
      '只填代理地址：受信任的一方可以改写自己的身份',
    TRUSTED_PROXY_SOURCES:
      '发布 CDN 回源地址段的 URL 列表（纯文本、JSON 或 CSV，任何形如 CIDR 的片段都会被采用），' +
      '拉取到的地址段会并入 TRUSTED_PROXIES',
    TRUSTED_PROXY_REFRESH_MINUTES: '重新拉取上述地址段的间隔（分钟）',
  },
  fetcher: {
    $name: 'Fetcher 设置',
    $description: 'Fetcher 用于从 osu! 官方 API 获取数据，使用 osu! 官方 API 的 OAuth 2.0 认证。',
    FETCHER_CLIENT_ID: 'Fetcher 客户端 ID',
    FETCHER_CLIENT_SECRET: 'Fetcher 客户端密钥',
  },
  logging: {
    $name: '日志设置',
    LOG_LEVEL: '日志级别',
  },
  verification: {
    $name: '验证服务设置',
    ENABLE_TOTP_VERIFICATION: '是否启用TOTP双因素验证',
    TOTP_ISSUER: 'TOTP 认证器中的发行者名称',
    TOTP_SERVICE_NAME: 'TOTP 认证器中显示的服务名称',
    TOTP_USE_USERNAME_IN_LABEL: '在TOTP标签中使用用户名而不是邮箱',
    ENABLE_TURNSTILE_VERIFICATION: '是否启用 Cloudflare Turnstile 验证（仅对非 osu! 客户端）',
    TURNSTILE_SECRET_KEY: 'Cloudflare Turnstile Secret Key',
    TURNSTILE_DEV_MODE: 'Turnstile 开发模式（跳过验证，用于本地开发）',
    ENABLE_EMAIL_VERIFICATION: '是否启用邮件验证功能',
    ENABLE_SESSION_VERIFICATION: '是否启用会话验证中间件',
    ENABLE_MULTI_DEVICE_LOGIN: '是否允许多设备同时登录',
    MAX_TOKENS_PER_CLIENT: '每个用户每个客户端的最大令牌数量',
    DEVICE_TRUST_DURATION_DAYS: '设备信任持续天数',
  },
  email: {
    $name: '邮件服务设置',
    $description:
      '配置邮件发送提供商和相关参数。\n\n' +
      '如果 `EMAIL_PROVIDER` 以 `-` 开头，服务器将尝试从其后面的 id 对应的插件中加载邮件提供商实现。' +
      '如果 `EMAIL_PROVIDER` 不存在 `.`，则认为它是一个内置邮件提供商的名称，目前内置了 `smtp` 一个提供商。' +
      '否则，服务器将尝试从 `EMAIL_PROVIDER` 指定的模块路径加载邮件提供商实现。\n\n' +
      '### smtp (默认)\n' +
      '\n' +
      '```bash\n' +
      'EMAIL_PROVIDER="smtp"\n' +
      "EMAIL_PROVIDER_CONFIG='{\n" +
      '    "smtp_server": "smtp.example.com",\n' +
      '    "smtp_port": 587,\n' +
      '    "smtp_username": "your_smtp_username",\n' +
      '    "smtp_password": "your_smtp_password",\n' +
      "}'\n" +
      '```',
    EMAIL_PROVIDER: '邮件发送提供商',
    EMAIL_PROVIDER_CONFIG: '邮件提供商配置 (JSON)',
    FROM_EMAIL: '发件人邮箱',
    FROM_NAME: '发件人名称',
  },
  monitoring: {
    $name: '监控设置',
    $description:
      '配置应用的监控选项，如 Sentry 和 New Relic。\n\n' +
      '将 newrelic.ini 配置文件放入项目根目录即可自动启用 New Relic 监控。如果配置文件不存在或 newrelic 包未安装，将跳过 New Relic 初始化。',
    SENTRY_DSN: 'Sentry DSN，为空不启用 Sentry',
    NEW_RELIC_ENVIRONMENT: 'New Relic 环境标识，设置为 "production" 或 "development"',
  },
  geoip: {
    $name: 'GeoIP 配置',
    GEOIP_DEST_DIR: 'GeoIP 数据库存储目录',
    GEOIP_UPDATE_DAY: 'GeoIP 每周更新的星期几（0=周一，6=周日）',
    GEOIP_UPDATE_HOUR: 'GeoIP 每周更新时间（小时，0-23）',
  },
  game: {
    $name: '游戏设置',
    ENABLE_RX: '启用 RX mod 统计数据',
    ENABLE_AP: '启用 AP mod 统计数据',
    ENABLE_SUPPORTER_FOR_ALL_USERS: '启用所有新注册用户的支持者状态',
    ENABLE_ALL_BEATMAP_LEADERBOARD: '启用所有谱面的排行榜',
    ENABLE_ALL_BEATMAP_PP: '允许任何谱面获得 PP',
    SEASONAL_BACKGROUNDS: '季节背景图 URL 列表',
    BEATMAP_TAG_TOP_COUNT: '显示在结算列表的标签所需的最低票数',
    OLD_SCORE_PROCESSING_MODE:
      '旧成绩处理模式\n' +
      'strict: 删除所有相关的成绩、pp、统计信息、回放\n' +
      'normal: 删除 pp 和排行榜成绩',
    SCORING_MODE: '分数计算模式：standardised（标准化）或 classic（经典）',
    USE_OLD_SCORE_MULTIPLIER:
      '使用旧版（[Mod Multiplier Rework](https://osu.ppy.sh/home/news/2026-06-03-mod-multipliers-survey-results) 之前）模组乘数',
    DISABLE_SUBMISSION_MODS: '禁用分数提交的模组',
  },
  calculator: {
    $name: '表现计算设置',
    $description:
      '配置表现分计算器及其参数。\n\n' +
      '如果 `CALCULATOR` 以 `-` 开头，服务器将尝试从其后面的 id 对应的插件中加载计算器实现。' +
      '如果 `CALCULATOR` 不存在 `.`，则认为它是一个内置计算器的名称，目前内置了 `performance_server` 和 `rosu` 两个计算器。' +
      '否则，服务器将尝试从 `CALCULATOR` 指定的模块路径加载计算器实现。\n\n' +
      '### [osu-performance-server](https://github.com/GooGuTeam/osu-performance-server) (默认)\n' +
      '\n' +
      '```bash\n' +
      'CALCULATOR="performance_server"\n' +
      "CALCULATOR_CONFIG='{\n" +
      '    "server_url": "http://localhost:5225"\n' +
      "}'\n" +
      '```\n\n' +
      '### rosu-pp-py\n' +
      '\n' +
      '```bash\n' +
      'CALCULATOR="rosu"\n' +
      "CALCULATOR_CONFIG='{}'\n" +
      '```',
    CALCULATOR: '表现分计算器',
    CALCULATOR_CONFIG: '表现分计算器配置 (JSON 格式)，具体配置项请参考上方',
    FALLBACK_NO_CALCULATOR_PP: '当计算器不支持某个模式时，使用简化的 pp 计算方法作为后备',
  },
  cache: {
    $name: '缓存设置',
    ENABLE_BEATMAP_PRELOAD: '启用谱面缓存预加载',
    BEATMAP_CACHE_EXPIRE_HOURS: '谱面缓存过期时间（小时）',
    BEATMAPSET_CACHE_EXPIRE_SECONDS: 'Beatmapset 缓存过期时间（秒）',
    ENABLE_RANKING_CACHE: '启用排行榜缓存',
    RANKING_CACHE_EXPIRE_MINUTES: '排行榜缓存过期时间（分钟）',
    RANKING_CACHE_REFRESH_INTERVAL_MINUTES: '排行榜缓存刷新间隔（分钟）',
    RANKING_CACHE_MAX_PAGES: '最多缓存的页数',
    TOP_SCORE_CACHE_MAX_PAGES: '最多缓存的单图成绩页数',
    RANKING_CACHE_TOP_COUNTRIES: '缓存前N个国家的排行榜',
    ENABLE_USER_CACHE_PRELOAD: '启用用户缓存预加载',
    USER_CACHE_EXPIRE_SECONDS: '用户信息缓存过期时间（秒）',
    USER_SCORES_CACHE_EXPIRE_SECONDS: '用户成绩缓存过期时间（秒）',
    USER_BEATMAPSETS_CACHE_EXPIRE_SECONDS: '用户谱面集缓存过期时间（秒）',
    USER_CACHE_MAX_PRELOAD_USERS: '最多预加载的用户数量',
  },
  asset_proxy: {
    $name: '资源代理设置',
    ENABLE_ASSET_PROXY: '启用资源代理',
    CUSTOM_ASSET_DOMAIN: '自定义资源域名',
    ASSET_PROXY_PREFIX: 'assets.ppy.sh 的自定义前缀',
    AVATAR_PROXY_PREFIX: 'a.ppy.sh 的自定义前缀',
    BEATMAP_PROXY_PREFIX: 'b.ppy.sh 的自定义前缀',
  },
  wiki: {
    $name: 'Wiki 服务设置',
    $description:
      '配置基于 GitHub 托管的 Wiki 服务。服务器从 [osu-wiki](https://github.com/ppy/osu-wiki) 仓库' +
      '直接读取 Markdown 文章内容，转交客户端渲染。支持基于 wiki 仓库 `redirect.yaml` 配置的重定向。\n' +
      '部署与内容格式说明见 [Wiki、更新日志与新闻](../deploy/content-and-wiki)。',
    ENABLE_WIKI: '启用 Wiki 服务',
    WIKI_REPOSITORY: '提供 Wiki 文章的仓库，格式为 owner/repo',
    WIKI_BRANCH: '读取文章的分支',
    WIKI_CONTENT_ROOT: '仓库中存放文章的目录。ppy/osu-wiki 为 wiki',
    WIKI_RAW_BASE_URL: '读取文件内容的基础地址，可指向自己搭建的镜像',
    WIKI_LISTING_BASE_URL:
      '列举目录用的 GitHub API 地址，只用于返回页面已有的翻译语言。留空则只能返回实际提供的语言',
    WIKI_GITHUB_TOKEN: '列举目录时使用的 GitHub Token，留空会受到未认证调用速率限制',
    WIKI_FALLBACK_LOCALE: '对应页面的翻译不存在时，应使用的语言',
    WIKI_CACHE_EXPIRE_SECONDS: '文章请求响应的缓存时间（秒）',
    WIKI_RESOURCE_CACHE_EXPIRE_SECONDS: 'Wiki 图片、目录列举与重定向表请求的缓存时间（秒）',
    WIKI_REQUEST_TIMEOUT_SECONDS: '请求 Wiki 仓库的超时时间（秒）',
  },
  content: {
    $name: '内容服务设置（更新日志与新闻）',
    $description:
      '配置基于 GitHub 托管的更新日志与新闻服务。建议使用 [GooGuTeam/g0v0-news](https://github.com/GooGuTeam/g0v0-news) ' +
      '结构的仓库，但也可以分开存储，分别修改下面的配置即可。\n' +
      '部署与内容格式说明见 [Wiki、更新日志与新闻](../deploy/content-and-wiki)。',
    ENABLE_CHANGELOG: '启用更新日志服务',
    ENABLE_NEWS: '启用新闻服务',
    CONTENT_REPOSITORY: '存放更新日志与新闻的仓库，格式为 owner/repo',
    CONTENT_BRANCH: '读取内容的分支',
    CHANGELOG_CONTENT_ROOT: '更新日志内容目录',
    NEWS_CONTENT_ROOT: '新闻内容目录',
    CONTENT_RAW_BASE_URL: '读取文件内容的基础地址，可指向自己搭建的镜像',
    CONTENT_LISTING_BASE_URL: '列举构建和文章用的 GitHub API 地址，留空会导致服务不可用',
    CONTENT_GITHUB_TOKEN: '列举目录时使用的 GitHub Token，留空会受到未认证调用速率限制',
    CONTENT_WEB_BASE_URL: '文章源文件的网页地址，用于生成新闻的 edit_url',
    CONTENT_CACHE_EXPIRE_SECONDS: '文件内容响应的缓存时间（秒）',
    CONTENT_LISTING_CACHE_EXPIRE_SECONDS: '目录列举的缓存时间（秒），建议设置为大于 CONTENT_INDEX_EXPIRE_SECONDS',
    CONTENT_INDEX_EXPIRE_SECONDS: '解析后的内容快照复用时间（秒）',
    CONTENT_REQUEST_TIMEOUT_SECONDS: '请求内容仓库的超时时间（秒）',
  },
  beatmap_sync: {
    $name: '谱面同步设置',
    ENABLE_AUTO_BEATMAP_SYNC: '启用自动谱面同步',
    BEATMAP_SYNC_INTERVAL_MINUTES: '自动谱面同步间隔（分钟）',
  },
  anticheat: {
    $name: '反作弊设置',
    BANNED_NAME: '禁止使用的用户名列表',
    ALLOW_DELETE_SCORES: '允许用户删除自己的成绩',
    CHECK_RULESET_VERSION: '检查自定义 ruleset 版本',
    CHECK_CLIENT_VERSION: '检查客户端版本',
    CLIENT_VERSION_URLS:
      '客户端版本列表 URL, 查看 https://github.com/GooGuTeam/g0v0-client-versions 来添加你自己的客户端',
  },
  storage: {
    $name: '存储服务设置',
    $description:
      '用于存储回放文件、头像等静态资源。\n\n' +
      '### 本地存储 (推荐用于开发环境)\n\n' +
      '本地存储将文件保存在服务器的本地文件系统中，适合开发和小规模部署。\n\n' +
      '```bash\n' +
      'STORAGE_SERVICE="local"\n' +
      'STORAGE_SETTINGS=\'{"local_storage_path": "./storage"}\'\n' +
      '```\n\n' +
      '### Cloudflare R2 存储 (推荐用于生产环境)\n\n' +
      '```bash\n' +
      'STORAGE_SERVICE="r2"\n' +
      "STORAGE_SETTINGS='{\n" +
      '  "r2_account_id": "your_cloudflare_account_id",\n' +
      '  "r2_access_key_id": "your_r2_access_key_id",\n' +
      '  "r2_secret_access_key": "your_r2_secret_access_key",\n' +
      '  "r2_bucket_name": "your_bucket_name",\n' +
      '  "r2_public_url_base": "https://your-custom-domain.com"\n' +
      "}'\n" +
      '```\n\n' +
      '### AWS S3 存储\n\n' +
      '```bash\n' +
      'STORAGE_SERVICE="s3"\n' +
      "STORAGE_SETTINGS='{\n" +
      '  "s3_access_key_id": "your_aws_access_key_id",\n' +
      '  "s3_secret_access_key": "your_aws_secret_access_key",\n' +
      '  "s3_bucket_name": "your_s3_bucket_name",\n' +
      '  "s3_region_name": "us-east-1",\n' +
      '  "s3_public_url_base": "https://your-custom-domain.com"\n' +
      "}'\n" +
      '```',
    STORAGE_SERVICE: '存储服务类型：local、r2、s3',
    STORAGE_SETTINGS: '存储服务配置 (JSON 格式)',
    ENABLE_SCREENSHOT_CLEANUP: '是否启用截图清理任务（每小时执行一次，删除长期未被访问的截图）',
    SCREENSHOT_RETENTION_DAYS: '截图保留天数',
    SCREENSHOT_CLEANUP_BATCH_SIZE: '每次清理最多处理的截图数量',
  },
  plugins: {
    $name: '插件设置',
    PLUGIN_DIRS: '插件目录列表',
    DISABLED_PLUGINS: '禁用的插件列表',
  },
  v2: {
    $name: '咕哦！v2 服务器设置',
    ENABLE_V2_IPC:
      '启用咕哦！v2 服务器的进程间通信（IPC）。这需要使用咕哦！v2 的 Realtime 实现而不是 spectator-server。',
  },
}
