export default {
  database: {
    $name: 'Database Settings',
    MYSQL_HOST: 'MySQL Server Address',
    MYSQL_PORT: 'MySQL Server Port',
    MYSQL_DATABASE: 'MySQL Database Name',
    MYSQL_USER: 'MySQL Username',
    MYSQL_PASSWORD: 'MySQL Password',
    MYSQL_ROOT_PASSWORD: 'MySQL Root Password',
    REDIS_URL: 'Redis Connection URL',
  },
  jwt: {
    $name: 'JWT Settings',
    JWT_SECRET_KEY: 'JWT Signing Key',
    JWT_ALGORITHM: 'JWT Algorithm',
    ACCESS_TOKEN_EXPIRE_MINUTES: 'Access Token Expiration Time (Min)',
    REFRESH_TOKEN_EXPIRE_MINUTES: 'Refresh Token Expiration Time (Min)',
    JWT_AUDIENCE: 'JWT Audience',
    JWT_ISSUER: 'JWT Issuer',
  },
  oauth: {
    $name: 'OAuth Settings',
    OSU_CLIENT_ID: 'OAuth Client ID',
    OSU_CLIENT_SECRET: 'OAuth Client Secret',
    OSU_WEB_CLIENT_ID: 'Web OAuth Client ID',
    OSU_WEB_CLIENT_SECRET: 'Web OAuth Client Secret',
  },
  server: {
    $name: 'Server Settings',
    HOST: 'Server Listening Address',
    PORT: 'Server Listening Port',
    DEBUG: 'Whether to enable Debug Mode',
    CORS_URLS: 'Additional CORS allowed domain list (JSON format)',
    SERVER_URL: 'Server URL',
    FRONTEND_URL:
      'Frontend URL, will redirect to this URL when accessing URL opened from game. Empty means no redirect.',
    ENABLE_RATE_LIMIT: 'Whether to enable Rate Limiting',
  },
  fetcher: {
    $name: 'Fetcher Settings',
    $description:
      'Fetcher is used to fetch data from osu! official API, using osu! official API OAuth 2.0 authentication',
    FETCHER_CLIENT_ID: 'Fetcher Client ID',
    FETCHER_CLIENT_SECRET: 'Fetcher Client Secret',
  },
  logging: {
    $name: 'Log Settings',
    LOG_LEVEL: 'Log Level',
  },
  verification: {
    $name: 'Verification Service Settings',
    ENABLE_TOTP_VERIFICATION: 'Whether to enable TOTP Two-Factor Authentication',
    TOTP_ISSUER: 'Issuer Name in TOTP Authenticator',
    TOTP_SERVICE_NAME: 'Service Name displayed in TOTP Authenticator',
    TOTP_USE_USERNAME_IN_LABEL: 'Use username instead of email in TOTP label',
    ENABLE_TURNSTILE_VERIFICATION:
      'Whether to enable Cloudflare Turnstile Verification (Non-osu clients only)',
    TURNSTILE_SECRET_KEY: 'Cloudflare Turnstile Secret Key',
    TURNSTILE_DEV_MODE: 'Turnstile Dev Mode (Skip verification, for local dev)',
    ENABLE_EMAIL_VERIFICATION: 'Whether to enable Email Verification',
    ENABLE_SESSION_VERIFICATION: 'Whether to enable Session Verification Middleware',
    ENABLE_MULTI_DEVICE_LOGIN: 'Whether to allow multi-device login simultaneously',
    MAX_TOKENS_PER_CLIENT: 'Max tokens per client per user',
    DEVICE_TRUST_DURATION_DAYS: 'Device Trust Duration Days',
  },
  email: {
    $name: 'Email Service Settings',
    $description:
      'Configure the email provider and related parameters.\n\n' +
      'If `EMAIL_PROVIDER` starts with `-`, the server will try to load the email provider implementation from the plugin corresponding to the id after it. ' +
      'If `EMAIL_PROVIDER` does not contain `.`, it is considered a built-in email provider name. Currently, there is one built-in provider: `smtp`. ' +
      'Otherwise, the server will try to load the email provider implementation from the module path specified by `EMAIL_PROVIDER`.\n\n' +
      '### smtp (Default)\n' +
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
    EMAIL_PROVIDER: 'Email Provider',
    EMAIL_PROVIDER_CONFIG: 'Email Provider Config (JSON)',
    FROM_EMAIL: 'Sender Email',
    FROM_NAME: 'Sender Name',
  },
  monitoring: {
    $name: 'Monitoring Settings',
    $description:
      'Configure application monitoring options, such as Sentry and New Relic.\n\n' +
      'Place newrelic.ini config file in the project root to automatically enable New Relic monitoring. If config file does not exist or newrelic package is not installed, New Relic initialization will be skipped.',
    SENTRY_DSN: 'Sentry DSN, empty to disable Sentry',
    NEW_RELIC_ENVIRONMENT: 'New Relic Environment ID, set to "production" or "development"',
  },
  geoip: {
    $name: 'GeoIP Settings',
    MAXMIND_LICENSE_KEY: 'MaxMind License Key (For downloading offline IP DB)',
    GEOIP_DEST_DIR: 'GeoIP Database Storage Directory',
    GEOIP_UPDATE_DAY: 'GeoIP Weekly Update Day (0=Mon, 6=Sun)',
    GEOIP_UPDATE_HOUR: 'GeoIP Weekly Update Hour (0-23)',
  },
  game: {
    $name: 'Game Settings',
    ENABLE_RX: 'Enable RX mod statistics',
    ENABLE_AP: 'Enable AP mod statistics',
    ENABLE_SUPPORTER_FOR_ALL_USERS: 'Enable supporter status for all new users',
    ENABLE_ALL_BEATMAP_LEADERBOARD: 'Enable leaderboards for all beatmaps',
    ENABLE_ALL_BEATMAP_PP: 'Allow any beatmap to gain PP',
    SEASONAL_BACKGROUNDS: 'Seasonal Background URL List',
    BEATMAP_TAG_TOP_COUNT: 'Minimum votes required for tags to be shown in result list',
    OLD_SCORE_PROCESSING_MODE:
      'Old Score Processing Mode\n' +
      'strict: delete all related scores, pp, stats, replays\n' +
      'normal: delete pp and leaderboard scores',
    SCORING_MODE: 'Scoring Mode: standardised or classic',
  },
  calculator: {
    $name: 'Performance Calculation Settings',
    $description:
      'Configure performance calculator and its parameters.\n\n' +
      'If `CALCULATOR` starts with `-`, the server will try to load the calculator implementation from the plugin corresponding to the id after it. ' +
      'If `CALCULATOR` does not contain `.`, it is considered a built-in calculator name. Currently, there are two built-in calculators: `performance_server` and `rosu`. ' +
      'Otherwise, the server will try to load the calculator implementation from the module path specified by `CALCULATOR`.\n\n' +
      '### [osu-performance-server](https://github.com/GooGuTeam/osu-performance-server) (Default)\n' +
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
    CALCULATOR: 'Performance Calculator',
    CALCULATOR_CONFIG: 'Performance Calculator Config (JSON format), see above for details',
    FALLBACK_NO_CALCULATOR_PP:
      "Use simplified pp calculation as fallback when calculator doesn't support a mode",
  },
  cache: {
    $name: 'Cache Settings',
    ENABLE_BEATMAP_PRELOAD: 'Enable Beatmap Cache Preload',
    BEATMAP_CACHE_EXPIRE_HOURS: 'Beatmap Cache Expiration (Hours)',
    BEATMAPSET_CACHE_EXPIRE_SECONDS: 'Beatmapset Cache Expiration (Seconds)',
    ENABLE_RANKING_CACHE: 'Enable Leaderboard Cache',
    RANKING_CACHE_EXPIRE_MINUTES: 'Leaderboard Cache Expiration (Minutes)',
    RANKING_CACHE_REFRESH_INTERVAL_MINUTES: 'Leaderboard Cache Refresh Interval (Minutes)',
    RANKING_CACHE_MAX_PAGES: 'Max Cached Pages',
    RANKING_CACHE_TOP_COUNTRIES: 'Cache Top N Country Leaderboards',
    ENABLE_USER_CACHE_PRELOAD: 'Enable User Cache Preload',
    USER_CACHE_EXPIRE_SECONDS: 'User Cache Expiration (Seconds)',
    USER_SCORES_CACHE_EXPIRE_SECONDS: 'User Scores Cache Expiration (Seconds)',
    USER_BEATMAPSETS_CACHE_EXPIRE_SECONDS: 'User Beatmapsets Cache Expiration (Seconds)',
    USER_CACHE_MAX_PRELOAD_USERS: 'Max Preloaded Users',
  },
  asset_proxy: {
    $name: 'Asset Proxy Settings',
    ENABLE_ASSET_PROXY: 'Enable Asset Proxy',
    CUSTOM_ASSET_DOMAIN: 'Custom Asset Domain',
    ASSET_PROXY_PREFIX: 'Custom prefix for assets.ppy.sh',
    AVATAR_PROXY_PREFIX: 'Custom prefix for a.ppy.sh',
    BEATMAP_PROXY_PREFIX: 'Custom prefix for b.ppy.sh',
  },
  beatmap_sync: {
    $name: 'Beatmap Sync Settings',
    ENABLE_AUTO_BEATMAP_SYNC: 'Enable Auto Beatmap Sync',
    BEATMAP_SYNC_INTERVAL_MINUTES: 'Auto Beatmap Sync Interval (Minutes)',
  },
  anticheat: {
    $name: 'Anti-Cheat Settings',
    BANNED_NAME: 'Banned Username List',
    ALLOW_DELETE_SCORES: 'Allow users to delete their own scores',
    CHECK_RULESET_VERSION: 'Check Custom Ruleset Version',
    CHECK_CLIENT_VERSION: 'Check Client Version',
    CLIENT_VERSION_URLS:
      'Client Version List URLs, see https://github.com/GooGuTeam/g0v0-client-versions to add your own client',
  },
  storage: {
    $name: 'Storage Service Settings',
    $description:
      'Used for storing replay files, avatars, etc.\n\n' +
      '### Local Storage (Recommended for Development)\n\n' +
      "Local storage saves files in the server's local file system, suitable for development and small-scale deployment.\n\n" +
      '```bash\n' +
      'STORAGE_SERVICE="local"\n' +
      'STORAGE_SETTINGS=\'{"local_storage_path": "./storage"}\'\n' +
      '```\n\n' +
      '### Cloudflare R2 Storage (Recommended for Production)\n\n' +
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
      '### AWS S3 Storage\n\n' +
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
    STORAGE_SERVICE: 'Storage Service Type: local, r2, s3',
    STORAGE_SETTINGS: 'Storage Service Configuration (JSON)',
  },
  plugins: {
    $name: 'Plugin Settings',
    PLUGIN_DIRS: 'Plugin Directory List',
    DISABLED_PLUGINS: 'Disabled Plugin List',
  },
}
