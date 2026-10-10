/**
 * Convert g0v0-server v1 `.env` content into g0v0-server v2 `config/*.json` files.
 *
 * The mapping follows the v1 -> v2 tables documented in
 * https://github.com/GooGuTeam/g0v0.Server.Realtime#configure-the-realtime-server
 */

export type EnvMap = Record<string, string>

/** Parse dotenv-style text. Returns upper-cased keys with raw string values. */
export function parseEnv(text: string): EnvMap {
  const result: EnvMap = {}
  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    if (line.startsWith('export ')) line = line.slice(7).trim()
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim().toUpperCase()
    const value = stripInlineComment(line.slice(eq + 1).trim())
    result[key] = unquote(value)
  }
  return result
}

function unquote(value: string): string {
  if (value.length >= 2) {
    if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
    if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1)
  }
  return value
}

/** Remove ` # comment` suffixes that are not inside quotes. */
function stripInlineComment(value: string): string {
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === "'" && !inDouble) inSingle = !inSingle
    else if (ch === '"' && !inSingle) inDouble = !inDouble
    else if (ch === '#' && !inSingle && !inDouble && i > 0 && /\s/.test(value[i - 1])) {
      return value.slice(0, i).trimEnd()
    }
  }
  return value
}

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback
  const s = value.toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(s)) return true
  if (['false', '0', 'no', 'off'].includes(s)) return false
  return fallback
}

function toInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') return fallback
  const n = Number.parseInt(value.trim(), 10)
  return Number.isNaN(n) ? fallback : n
}

/** Empty string becomes null to match `JwtIssuer: string?`. */
function toNullable(value: string | undefined): string | null {
  return value === undefined || value === '' ? null : value
}

/** `redis://[:password@]host[:port][/db]` -> `host:port` (v2 `RedisHost` format). */
export function normalizeRedisHost(value: string | undefined): string {
  if (value === undefined || value === '') return 'localhost:6379'
  if (/^rediss?:\/\//i.test(value)) {
    try {
      const url = new URL(value)
      return `${url.hostname}${url.port ? `:${url.port}` : ''}`
    } catch {
      // fall through to the manual handling below
    }
  }
  const noScheme = value.replace(/^rediss?:\/\//i, '')
  const hostPart = noScheme.split('/')[0]
  const host = hostPart.includes('@') ? (hostPart.split('@').pop() ?? '') : hostPart
  return host || 'localhost:6379'
}

export type StorageType = 'Local' | 'S3' | 'R2'

function toStorageType(value: string | undefined): StorageType {
  const s = (value ?? 'local').trim().toLowerCase()
  if (s === 's3') return 'S3'
  if (s === 'r2') return 'R2'
  return 'Local'
}

const DEFAULT_STORAGE_OPTIONS: Record<StorageType, Record<string, unknown>> = {
  Local: { local_storage_path: './storage' },
  S3: {
    s3_access_key_id: '',
    s3_secret_access_key: '',
    s3_bucket_name: '',
    s3_region_name: 'us-east-1',
    s3_public_url_base: '',
  },
  R2: {
    r2_account_id: '',
    r2_access_key_id: '',
    r2_secret_access_key: '',
    r2_bucket_name: '',
    r2_public_url_base: '',
  },
}

export interface ConvertedConfig {
  /** file name inside the v2 `config/` directory */
  name: string
  json: unknown
  /** env vars consumed by this file (upper-cased) */
  sources: string[]
}

/** v2-only settings that have no v1 `.env` counterpart and are user-tweakable. */
export interface ConverterOptions {
  useLegacyDatabase: boolean
  postgresqlConnectionString: string
  saveReplays: boolean
  replayUploaderConcurrency: number
  maxStartedScores: number
  hostPlaylistLimit: number
  guestPlaylistLimit: number
  multiplayerDisconnectGracePeriod: string
  tournamentRoomRetentionPeriod: string
  sentryEnvironment: string
  sentryTracesSampleRate: number
  sentrySendDefaultPii: boolean
  channelLimit: number
  messageLengthLimit: number
  announceMessageLengthLimit: number
  publicBacklogLimitHours: number
  activityTimeoutSeconds: number
  recentMessageLimit: number
  publicMessageLimit: number
  publicMessageWindowSeconds: number
  privateMessageLimit: number
  privateMessageWindowSeconds: number
}

export const DEFAULT_OPTIONS: ConverterOptions = {
  useLegacyDatabase: true,
  postgresqlConnectionString:
    'Host=localhost;Port=5432;Username=g0v0;Password=password;Database=g0v0',
  saveReplays: true,
  replayUploaderConcurrency: 4,
  maxStartedScores: 2,
  hostPlaylistLimit: 50,
  guestPlaylistLimit: 3,
  multiplayerDisconnectGracePeriod: '00:00:30',
  tournamentRoomRetentionPeriod: '00:30:00',
  sentryEnvironment: '',
  sentryTracesSampleRate: 0.1,
  sentrySendDefaultPii: false,
  channelLimit: 10000,
  messageLengthLimit: 450,
  announceMessageLengthLimit: 1024,
  publicBacklogLimitHours: 24,
  activityTimeoutSeconds: 60,
  recentMessageLimit: 50,
  publicMessageLimit: 1,
  publicMessageWindowSeconds: 1,
  privateMessageLimit: 1,
  privateMessageWindowSeconds: 1,
}

/** Numbers coming from UI inputs may be '' or NaN; fall back to the default. */
function numField(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export interface ConvertResult {
  files: ConvertedConfig[]
  /** v1 vars that exist but have no v2 counterpart */
  unmapped: string[]
  /** vars present in the input that are not part of the known v1 set */
  unknown: string[]
  /** non-fatal problems, e.g. STORAGE_SETTINGS failed to parse */
  warnings: string[]
}

/** Known v1 vars that intentionally have no v2 mapping (special-case notes live in the UI). */
const KNOWN_UNMAPPED: Record<string, true> = Object.fromEntries(
  [
    // database
    'MYSQL_ROOT_PASSWORD',
    // jwt
    'ACCESS_TOKEN_EXPIRE_MINUTES',
    'REFRESH_TOKEN_EXPIRE_MINUTES',
    // server
    'HOST',
    'PORT',
    'DEBUG',
    'CORS_URLS',
    'FRONTEND_URL',
    'ENABLE_RATE_LIMIT',
    // logging
    'LOG_LEVEL',
    // verification
    'ENABLE_TOTP_VERIFICATION',
    'TOTP_ISSUER',
    'TOTP_SERVICE_NAME',
    'TOTP_USE_USERNAME_IN_LABEL',
    'ENABLE_TURNSTILE_VERIFICATION',
    'TURNSTILE_SECRET_KEY',
    'TURNSTILE_DEV_MODE',
    'ENABLE_EMAIL_VERIFICATION',
    'ENABLE_SESSION_VERIFICATION',
    'ENABLE_MULTI_DEVICE_LOGIN',
    'MAX_TOKENS_PER_CLIENT',
    'DEVICE_TRUST_DURATION_DAYS',
    // email
    'EMAIL_PROVIDER',
    'EMAIL_PROVIDER_CONFIG',
    'FROM_EMAIL',
    'FROM_NAME',
    // monitoring
    'NEW_RELIC_ENVIRONMENT',
    // geoip
    'GEOIP_DEST_DIR',
    'GEOIP_UPDATE_DAY',
    'GEOIP_UPDATE_HOUR',
    // game
    'ENABLE_SUPPORTER_FOR_ALL_USERS',
    'ENABLE_ALL_BEATMAP_PP',
    'SEASONAL_BACKGROUNDS',
    'BEATMAP_TAG_TOP_COUNT',
    'OLD_SCORE_PROCESSING_MODE',
    'SCORING_MODE',
    'USE_OLD_SCORE_MULTIPLIER',
    // calculator
    'CALCULATOR',
    'CALCULATOR_CONFIG',
    'FALLBACK_NO_CALCULATOR_PP',
    // cache
    'ENABLE_BEATMAP_PRELOAD',
    'BEATMAPSET_CACHE_EXPIRE_SECONDS',
    'ENABLE_RANKING_CACHE',
    'RANKING_CACHE_EXPIRE_MINUTES',
    'RANKING_CACHE_REFRESH_INTERVAL_MINUTES',
    'RANKING_CACHE_MAX_PAGES',
    'TOP_SCORE_CACHE_MAX_PAGES',
    'RANKING_CACHE_TOP_COUNTRIES',
    'ENABLE_USER_CACHE_PRELOAD',
    'USER_CACHE_EXPIRE_SECONDS',
    'USER_SCORES_CACHE_EXPIRE_SECONDS',
    'USER_BEATMAPSETS_CACHE_EXPIRE_SECONDS',
    'USER_CACHE_MAX_PRELOAD_USERS',
    // asset proxy
    'ENABLE_ASSET_PROXY',
    'CUSTOM_ASSET_DOMAIN',
    'ASSET_PROXY_PREFIX',
    'AVATAR_PROXY_PREFIX',
    'BEATMAP_PROXY_PREFIX',
    // beatmap sync
    'ENABLE_AUTO_BEATMAP_SYNC',
    'BEATMAP_SYNC_INTERVAL_MINUTES',
    // anticheat
    'BANNED_NAME',
    'ALLOW_DELETE_SCORES',
    'CHECK_RULESET_VERSION',
    'CHECK_CLIENT_VERSION',
    'CLIENT_VERSION_URLS',
    // plugins
    'PLUGIN_DIRS',
    'DISABLED_PLUGINS',
    // v2 (v1-side toggle, not needed on the v2 server itself)
    'ENABLE_V2_IPC',
  ].map(k => [k, true])
)

/** The first defined value among aliases (ENABLE_RX / ENABLE_OSU_RX). */
function firstDefined(...values: (string | undefined)[]): string | undefined {
  for (const v of values) if (v !== undefined) return v
  return undefined
}

function buildGeneral(env: EnvMap, options: ConverterOptions): ConvertedConfig {
  return {
    name: 'general.json',
    sources: [
      'MYSQL_HOST',
      'MYSQL_PORT',
      'MYSQL_DATABASE',
      'MYSQL_USER',
      'MYSQL_PASSWORD',
      'REDIS_URL',
      'JWT_SECRET_KEY',
      'JWT_ALGORITHM',
      'JWT_AUDIENCE',
      'JWT_ISSUER',
      'OSU_CLIENT_ID',
      'OSU_CLIENT_SECRET',
      'OSU_WEB_CLIENT_ID',
      'OSU_WEB_CLIENT_SECRET',
      'FETCHER_CLIENT_ID',
      'FETCHER_CLIENT_SECRET',
      'BEATMAP_CACHE_EXPIRE_HOURS',
      'SERVER_URL',
    ],
    json: {
      UseLegacyDatabase: options.useLegacyDatabase,
      MySqlHost: env.MYSQL_HOST ?? 'localhost',
      MySqlPort: env.MYSQL_PORT ?? '3306',
      MySqlDatabase: env.MYSQL_DATABASE ?? 'osu_api',
      MySqlUsername: env.MYSQL_USER ?? 'osu_api',
      MySqlPassword: env.MYSQL_PASSWORD ?? 'password',
      PostgresqlConnectionString: options.postgresqlConnectionString,
      RedisHost: normalizeRedisHost(env.REDIS_URL),
      JwtSecretKey: env.JWT_SECRET_KEY ?? 'your_jwt_secret_here',
      JwtAlgorithm: env.JWT_ALGORITHM ?? 'HS256',
      JwtAudience: env.JWT_AUDIENCE ?? '5',
      JwtIssuer: toNullable(env.JWT_ISSUER),
      OsuClientId: toInt(env.OSU_CLIENT_ID, 5),
      OsuClientSecret: env.OSU_CLIENT_SECRET ?? 'FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk',
      OsuWebClientId: toInt(env.OSU_WEB_CLIENT_ID, 6),
      OsuWebClientSecret: env.OSU_WEB_CLIENT_SECRET ?? 'your_osu_web_client_secret_here',
      FetcherClientId: toInt(env.FETCHER_CLIENT_ID, 0),
      FetcherClientSecret: env.FETCHER_CLIENT_SECRET ?? '',
      FetcherBeatmapRawCacheExpireHours: toInt(env.BEATMAP_CACHE_EXPIRE_HOURS, 24),
      ServerUrl: env.SERVER_URL ?? 'http://localhost:8000',
    },
  }
}

function buildGame(env: EnvMap): ConvertedConfig {
  return {
    name: 'game.json',
    sources: [
      'ENABLE_RX',
      'ENABLE_OSU_RX',
      'ENABLE_AP',
      'ENABLE_OSU_AP',
      'ENABLE_ALL_BEATMAP_LEADERBOARD',
    ],
    json: {
      EnableRelax: toBool(firstDefined(env.ENABLE_RX, env.ENABLE_OSU_RX), false),
      EnableAutopilot: toBool(firstDefined(env.ENABLE_AP, env.ENABLE_OSU_AP), false),
      EnableAllBeatmapLeaderboard: toBool(env.ENABLE_ALL_BEATMAP_LEADERBOARD, false),
    },
  }
}

function buildRealtime(env: EnvMap, options: ConverterOptions): ConvertedConfig {
  return {
    name: 'realtime.json',
    sources: ['SENTRY_DSN'],
    json: {
      SaveReplays: options.saveReplays,
      ReplayUploaderConcurrency: numField(options.replayUploaderConcurrency, 4),
      MaxStartedScores: numField(options.maxStartedScores, 2),
      HostPlaylistLimit: numField(options.hostPlaylistLimit, 50),
      GuestPlaylistLimit: numField(options.guestPlaylistLimit, 3),
      MultiplayerDisconnectGracePeriod:
        options.multiplayerDisconnectGracePeriod ||
        DEFAULT_OPTIONS.multiplayerDisconnectGracePeriod,
      TournamentRoomRetentionPeriod:
        options.tournamentRoomRetentionPeriod || DEFAULT_OPTIONS.tournamentRoomRetentionPeriod,
      Sentry: {
        Dsn: env.SENTRY_DSN ?? '',
        Environment: options.sentryEnvironment,
        TracesSampleRate: numField(options.sentryTracesSampleRate, 0.1),
        SendDefaultPii: options.sentrySendDefaultPii,
      },
    },
  }
}

function buildChat(options: ConverterOptions): ConvertedConfig {
  return {
    name: 'chat.json',
    sources: [],
    json: {
      ChannelLimit: numField(options.channelLimit, 10000),
      MessageLengthLimit: numField(options.messageLengthLimit, 450),
      AnnounceMessageLengthLimit: numField(options.announceMessageLengthLimit, 1024),
      PublicBacklogLimitHours: numField(options.publicBacklogLimitHours, 24),
      ActivityTimeoutSeconds: numField(options.activityTimeoutSeconds, 60),
      RecentMessageLimit: numField(options.recentMessageLimit, 50),
      PublicMessageLimit: numField(options.publicMessageLimit, 1),
      PublicMessageWindowSeconds: numField(options.publicMessageWindowSeconds, 1),
      PrivateMessageLimit: numField(options.privateMessageLimit, 1),
      PrivateMessageWindowSeconds: numField(options.privateMessageWindowSeconds, 1),
    },
  }
}

function buildStorage(env: EnvMap): { config: ConvertedConfig; warning?: string } {
  const type = toStorageType(env.STORAGE_SERVICE)
  let options: Record<string, unknown> = DEFAULT_STORAGE_OPTIONS[type]
  let warning: string | undefined
  const raw = env.STORAGE_SETTINGS
  if (raw !== undefined && raw.trim() !== '') {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        options = parsed as Record<string, unknown>
      } else {
        warning = 'STORAGE_SETTINGS'
      }
    } catch {
      warning = 'STORAGE_SETTINGS'
    }
  }
  return {
    config: {
      name: 'storage.json',
      sources: ['STORAGE_SERVICE', 'STORAGE_SETTINGS'],
      json: { Type: type, Options: options },
    },
    warning,
  }
}

export function convertEnvToV2(
  envText: string,
  options: ConverterOptions = DEFAULT_OPTIONS
): ConvertResult {
  const env = parseEnv(envText)
  const warnings: string[] = []

  const storage = buildStorage(env)
  if (storage.warning) warnings.push(storage.warning)

  const files = [
    buildGeneral(env, options),
    buildGame(env),
    buildRealtime(env, options),
    buildChat(options),
    storage.config,
  ]

  const mapped = new Set(files.flatMap(f => f.sources))
  const present = Object.keys(env)
  const unmapped = present.filter(k => !mapped.has(k) && KNOWN_UNMAPPED[k])
  const unknown = present.filter(k => !mapped.has(k) && !KNOWN_UNMAPPED[k])

  return { files, unmapped, unknown, warnings }
}

/** Stable JSON string used for previews and downloads. */
export function toJsonText(json: unknown): string {
  return `${JSON.stringify(json, null, 2)}\n`
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const JSON_TOKEN_RE =
  /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

/**
 * Minimal JSON tokenizer that emits token spans styled to match the site's
 * (shiki github) code block colors, for use inside VitePress-style
 * `language-json` code blocks.
 */
export function highlightJson(text: string): string {
  let out = ''
  let last = 0
  for (const match of text.matchAll(JSON_TOKEN_RE)) {
    const start = match.index ?? 0
    out += escapeHtml(text.slice(last, start))
    if (match[1] !== undefined) {
      if (match[2] !== undefined) {
        out += `<span class="tok-key">${escapeHtml(match[1])}</span>${escapeHtml(match[2])}`
      } else {
        out += `<span class="tok-str">${escapeHtml(match[1])}</span>`
      }
    } else if (match[3] !== undefined) {
      out += `<span class="tok-lit">${escapeHtml(match[3])}</span>`
    } else if (match[4] !== undefined) {
      out += `<span class="tok-num">${escapeHtml(match[4])}</span>`
    }
    last = start + match[0].length
  }
  out += escapeHtml(text.slice(last))
  return out
}
