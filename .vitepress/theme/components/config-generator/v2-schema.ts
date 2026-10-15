/**
 * g0v0 server v2 configuration model used by the manual config generator.
 *
 * The field list mirrors the configuration classes of g0v0 server v2:
 *  - general.json  -> g0v0.Server.Common.Configuration.GeneralConfig
 *  - game.json     -> g0v0.Server.Common.Configuration.GameConfig
 *  - realtime.json -> g0v0.Server.Realtime.RealtimeConfig (+ SentryOptions)
 *  - chat.json     -> g0v0.Server.Realtime.ChatConfig
 *  - storage.json  -> g0v0.Server.Common.Configuration.StorageConfiguration
 */

export interface Bi {
  zh: string
  en: string
}

export type FieldKind = 'string' | 'int' | 'float' | 'bool'

export interface V2Field {
  /** JSON property path inside the config file, e.g. `Sentry.Dsn`. */
  path: string
  kind: FieldKind
  def: string | number | boolean
  label: Bi
  /** empty input is written as `null` instead of `""` */
  nullable?: boolean
}

export interface V2Section {
  /** file name inside the v2 `config/` directory */
  file: string
  label: Bi
  fields: V2Field[]
}

export const GENERAL_SECTION: V2Section = {
  file: 'general.json',
  label: {
    zh: 'general.json — 数据库、JWT、OAuth 与服务地址（所有 v2 服务共用）',
    en: 'general.json — database, JWT, OAuth and server URL (shared by all v2 services)',
  },
  fields: [
    {
      path: 'UseLegacyDatabase',
      kind: 'bool',
      def: true,
      label: { zh: '使用 v1 MySQL（旧版）数据库', en: 'Use the v1 MySQL (legacy) database' },
    },
    {
      path: 'MySqlHost',
      kind: 'string',
      def: '127.0.0.1',
      label: { zh: 'MySQL 主机', en: 'MySQL host' },
    },
    {
      path: 'MySqlPort',
      kind: 'string',
      def: '3306',
      label: { zh: 'MySQL 端口', en: 'MySQL port' },
    },
    {
      path: 'MySqlDatabase',
      kind: 'string',
      def: 'osu_api',
      label: { zh: 'MySQL 数据库名', en: 'MySQL database' },
    },
    {
      path: 'MySqlUsername',
      kind: 'string',
      def: 'osu_api',
      label: { zh: 'MySQL 用户名', en: 'MySQL username' },
    },
    {
      path: 'MySqlPassword',
      kind: 'string',
      def: 'password',
      label: { zh: 'MySQL 密码', en: 'MySQL password' },
    },
    {
      path: 'PostgresqlConnectionString',
      kind: 'string',
      def: 'Host=localhost;Port=5432;Username=g0v0;Password=password;Database=g0v0',
      label: {
        zh: 'PostgreSQL 连接字符串（不使用旧版数据库时生效）',
        en: 'PostgreSQL connection string (used when the legacy database option is off)',
      },
    },
    {
      path: 'RedisHost',
      kind: 'string',
      def: 'localhost:6379',
      label: { zh: 'Redis 地址 (host:port)', en: 'Redis host (host:port)' },
    },
    {
      path: 'JwtSecretKey',
      kind: 'string',
      def: 'your_jwt_secret_here',
      label: { zh: 'JWT 签名密钥', en: 'JWT secret key' },
    },
    {
      path: 'JwtAlgorithm',
      kind: 'string',
      def: 'HS256',
      label: { zh: 'JWT 算法', en: 'JWT algorithm' },
    },
    {
      path: 'JwtAudience',
      kind: 'string',
      def: '5',
      label: { zh: 'JWT 受众', en: 'JWT audience' },
    },
    {
      path: 'JwtIssuer',
      kind: 'string',
      def: '',
      nullable: true,
      label: { zh: 'JWT 签发者（留空写入 null）', en: 'JWT issuer (empty writes null)' },
    },
    {
      path: 'OsuClientId',
      kind: 'int',
      def: 5,
      label: { zh: 'osu! 客户端 ID', en: 'osu! client ID' },
    },
    {
      path: 'OsuClientSecret',
      kind: 'string',
      def: 'FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk',
      label: { zh: 'osu! 客户端密钥', en: 'osu! client secret' },
    },
    {
      path: 'OsuWebClientId',
      kind: 'int',
      def: 6,
      label: { zh: 'osu! Web 客户端 ID', en: 'osu! web client ID' },
    },
    {
      path: 'OsuWebClientSecret',
      kind: 'string',
      def: 'your_osu_web_client_secret_here',
      label: { zh: 'osu! Web 客户端密钥', en: 'osu! web client secret' },
    },
    {
      path: 'FetcherClientId',
      kind: 'int',
      def: 0,
      label: { zh: 'Fetcher 客户端 ID', en: 'Fetcher client ID' },
    },
    {
      path: 'FetcherClientSecret',
      kind: 'string',
      def: '',
      label: { zh: 'Fetcher 客户端密钥', en: 'Fetcher client secret' },
    },
    {
      path: 'FetcherBeatmapRawCacheExpireHours',
      kind: 'int',
      def: 24,
      label: {
        zh: '原始谱面缓存时间（小时）',
        en: 'Raw beatmap cache duration (hours)',
      },
    },
    {
      path: 'ServerUrl',
      kind: 'string',
      def: 'http://localhost:8000',
      label: { zh: '服务器公开 URL', en: 'Public server URL' },
    },
  ],
}

export const GAME_SECTION: V2Section = {
  file: 'game.json',
  label: {
    zh: 'game.json — 玩法功能开关',
    en: 'game.json — gameplay feature flags',
  },
  fields: [
    {
      path: 'EnableRelax',
      kind: 'bool',
      def: false,
      label: { zh: '启用 Relax', en: 'Enable Relax' },
    },
    {
      path: 'EnableAutopilot',
      kind: 'bool',
      def: false,
      label: { zh: '启用 Autopilot', en: 'Enable Autopilot' },
    },
    {
      path: 'EnableAllBeatmapLeaderboard',
      kind: 'bool',
      def: false,
      label: { zh: '所有谱面均可有排行榜', en: 'Leaderboards for every beatmap' },
    },
  ],
}

export const REALTIME_SECTION: V2Section = {
  file: 'realtime.json',
  label: {
    zh: 'realtime.json — 观战/回放、多人游戏与 Sentry',
    en: 'realtime.json — spectator replays, multiplayer and Sentry',
  },
  fields: [
    {
      path: 'SaveReplays',
      kind: 'bool',
      def: true,
      label: { zh: '保存观战回放', en: 'Save spectator replays' },
    },
    {
      path: 'ReplayUploaderConcurrency',
      kind: 'int',
      def: 4,
      label: { zh: '回放上传并发数', en: 'Replay uploader concurrency' },
    },
    {
      path: 'MaxStartedScores',
      kind: 'int',
      def: 2,
      label: {
        zh: '单个会话最大同时开始分数',
        en: 'Max concurrent started scores per session',
      },
    },
    {
      path: 'HostPlaylistLimit',
      kind: 'int',
      def: 50,
      label: { zh: '房主谱面列表上限', en: 'Host playlist item limit' },
    },
    {
      path: 'GuestPlaylistLimit',
      kind: 'int',
      def: 3,
      label: { zh: '玩家谱面列表上限', en: 'Guest playlist item limit' },
    },
    {
      path: 'MultiplayerDisconnectGracePeriod',
      kind: 'string',
      def: '00:00:30',
      label: { zh: '断线保留时间 (hh:mm:ss)', en: 'Disconnect grace period (hh:mm:ss)' },
    },
    {
      path: 'TournamentRoomRetentionPeriod',
      kind: 'string',
      def: '00:30:00',
      label: { zh: '比赛房间保留时间 (hh:mm:ss)', en: 'Tournament room retention (hh:mm:ss)' },
    },
    {
      path: 'Sentry.Dsn',
      kind: 'string',
      def: '',
      label: { zh: 'Sentry DSN（留空即禁用）', en: 'Sentry DSN (empty disables Sentry)' },
    },
    {
      path: 'Sentry.Environment',
      kind: 'string',
      def: '',
      label: { zh: 'Sentry 环境标签', en: 'Sentry environment tag' },
    },
    {
      path: 'Sentry.TracesSampleRate',
      kind: 'float',
      def: 0.1,
      label: { zh: 'Sentry 性能采样率 (0–1)', en: 'Sentry trace sample rate (0–1)' },
    },
    {
      path: 'Sentry.SendDefaultPii',
      kind: 'bool',
      def: false,
      label: { zh: '向 Sentry 发送默认 PII', en: 'Send default PII to Sentry' },
    },
  ],
}

export const CHAT_SECTION: V2Section = {
  file: 'chat.json',
  label: {
    zh: 'chat.json — 聊天限制（可选文件）',
    en: 'chat.json — chat limits (optional file)',
  },
  fields: [
    {
      path: 'ChannelLimit',
      kind: 'int',
      def: 10000,
      label: { zh: '频道列表数量上限', en: 'Channel list limit' },
    },
    {
      path: 'MessageLengthLimit',
      kind: 'int',
      def: 450,
      label: { zh: '消息长度上限', en: 'Message length limit' },
    },
    {
      path: 'AnnounceMessageLengthLimit',
      kind: 'int',
      def: 1024,
      label: { zh: '公告消息长度上限', en: 'Announcement length limit' },
    },
    {
      path: 'PublicBacklogLimitHours',
      kind: 'int',
      def: 24,
      label: { zh: '公共频道历史保留（小时）', en: 'Public backlog hours' },
    },
    {
      path: 'ActivityTimeoutSeconds',
      kind: 'int',
      def: 60,
      label: { zh: '活跃超时（秒）', en: 'Activity timeout (seconds)' },
    },
    {
      path: 'RecentMessageLimit',
      kind: 'int',
      def: 50,
      label: { zh: '附加最近消息数', en: 'Recent messages attached to a channel' },
    },
    {
      path: 'PublicMessageLimit',
      kind: 'int',
      def: 1,
      label: { zh: '公共频道每窗口条数', en: 'Public messages per window' },
    },
    {
      path: 'PublicMessageWindowSeconds',
      kind: 'int',
      def: 1,
      label: { zh: '公共频道限速窗口（秒）', en: 'Public rate window (seconds)' },
    },
    {
      path: 'PrivateMessageLimit',
      kind: 'int',
      def: 1,
      label: { zh: '私信每窗口条数', en: 'Private messages per window' },
    },
    {
      path: 'PrivateMessageWindowSeconds',
      kind: 'int',
      def: 1,
      label: { zh: '私信限速窗口（秒）', en: 'Private rate window (seconds)' },
    },
  ],
}

export const V2_SECTIONS: V2Section[] = [
  GENERAL_SECTION,
  GAME_SECTION,
  REALTIME_SECTION,
  CHAT_SECTION,
]

/* -------------------------------------------------------------------------- */
/* storage.json                                                               */
/* -------------------------------------------------------------------------- */

export type StorageType = 'Local' | 'S3' | 'R2'

export const STORAGE_TYPES: StorageType[] = ['Local', 'S3', 'R2']

export const STORAGE_TYPE_LABELS: Record<StorageType, Bi> = {
  Local: { zh: '本地存储', en: 'Local storage' },
  S3: { zh: 'Amazon S3', en: 'Amazon S3' },
  R2: { zh: 'Cloudflare R2', en: 'Cloudflare R2' },
}

export const STORAGE_OPTION_FIELDS: Record<StorageType, V2Field[]> = {
  Local: [
    {
      path: 'local_storage_path',
      kind: 'string',
      def: './storage',
      label: { zh: '本地存储路径', en: 'Local storage path' },
    },
  ],
  S3: [
    {
      path: 's3_access_key_id',
      kind: 'string',
      def: '',
      label: { zh: 'S3 Access Key ID', en: 'S3 access key ID' },
    },
    {
      path: 's3_secret_access_key',
      kind: 'string',
      def: '',
      label: { zh: 'S3 Secret Access Key', en: 'S3 secret access key' },
    },
    {
      path: 's3_bucket_name',
      kind: 'string',
      def: '',
      label: { zh: 'S3 存储桶名称', en: 'S3 bucket name' },
    },
    {
      path: 's3_region_name',
      kind: 'string',
      def: 'us-east-1',
      label: { zh: 'S3 区域', en: 'S3 region' },
    },
    {
      path: 's3_public_url_base',
      kind: 'string',
      def: '',
      label: { zh: 'S3 公共访问 URL 前缀（可选）', en: 'S3 public URL base (optional)' },
    },
  ],
  R2: [
    {
      path: 'r2_account_id',
      kind: 'string',
      def: '',
      label: { zh: 'R2 账户 ID', en: 'R2 account ID' },
    },
    {
      path: 'r2_access_key_id',
      kind: 'string',
      def: '',
      label: { zh: 'R2 Access Key ID', en: 'R2 access key ID' },
    },
    {
      path: 'r2_secret_access_key',
      kind: 'string',
      def: '',
      label: { zh: 'R2 Secret Access Key', en: 'R2 secret access key' },
    },
    {
      path: 'r2_bucket_name',
      kind: 'string',
      def: '',
      label: { zh: 'R2 存储桶名称', en: 'R2 bucket name' },
    },
    {
      path: 'r2_public_url_base',
      kind: 'string',
      def: '',
      label: { zh: 'R2 公共访问 URL 前缀（可选）', en: 'R2 public URL base (optional)' },
    },
  ],
}

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

export type V2Value = string | number | boolean | null
/** `file name` -> `property path` -> value */
export type V2State = Record<string, Record<string, V2Value>>

/** Build the initial form state (one entry per config file) from the defaults. */
export function createV2State(): V2State {
  const state: V2State = {}
  for (const section of V2_SECTIONS) {
    state[section.file] = Object.fromEntries(section.fields.map(f => [f.path, f.def]))
  }
  return state
}

export function createStorageOptions(): Record<StorageType, Record<string, V2Value>> {
  const result = {} as Record<StorageType, Record<string, V2Value>>
  for (const type of STORAGE_TYPES) {
    result[type] = Object.fromEntries(STORAGE_OPTION_FIELDS[type].map(f => [f.path, f.def]))
  }
  return result
}

function coerce(field: V2Field, value: V2Value): unknown {
  if (field.kind === 'bool') return value === true || value === 'true'
  if (field.kind === 'int') {
    const n = Number.parseInt(String(value), 10)
    return Number.isFinite(n) ? n : field.def
  }
  if (field.kind === 'float') {
    const n = Number(value)
    return Number.isFinite(n) ? n : field.def
  }
  const text = value === null || value === undefined ? '' : String(value)
  if (field.nullable && text === '') return null
  return text
}

/** Turn a flat `path -> value` map into the nested JSON object of one config file. */
export function buildSectionJson(section: V2Section, values: Record<string, V2Value>): unknown {
  const json: Record<string, unknown> = {}
  for (const field of section.fields) {
    const parts = field.path.split('.')
    let cursor = json
    for (const part of parts.slice(0, -1)) {
      if (typeof cursor[part] !== 'object' || cursor[part] === null) cursor[part] = {}
      cursor = cursor[part] as Record<string, unknown>
    }
    cursor[parts[parts.length - 1]] = coerce(field, values[field.path] ?? field.def)
  }
  return json
}

export interface GeneratedFile {
  name: string
  json: unknown
}

/** Build every `config/*.json` file from the current form state. */
export function buildV2Files(
  state: V2State,
  storageType: StorageType,
  storageOptions: Record<StorageType, Record<string, V2Value>>
): GeneratedFile[] {
  const files: GeneratedFile[] = V2_SECTIONS.map(section => ({
    name: section.file,
    json: buildSectionJson(section, state[section.file] ?? {}),
  }))

  const options: Record<string, unknown> = {}
  for (const field of STORAGE_OPTION_FIELDS[storageType]) {
    options[field.path] = coerce(field, storageOptions[storageType]?.[field.path] ?? field.def)
  }

  files.push({ name: 'storage.json', json: { Type: storageType, Options: options } })
  return files
}
