<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useData } from 'vitepress'
import {
  DEFAULT_OPTIONS,
  convertEnvToV2,
  highlightJson,
  toJsonText,
  type ConvertedConfig,
} from './config-converter/convert'
import { createZipBlob } from './config-converter/zip'

const { lang } = useData()
const zh = computed(() => lang.value.toLowerCase().startsWith('zh'))

const STRINGS = {
  en: {
    inputTitle: '1. Paste your g0v0-server v1 .env content',
    inputHint: 'Everything is converted locally in your browser — no data is uploaded.',
    upload: 'Upload file',
    sample: 'Load sample',
    clear: 'Clear',
    otherTitle: 'Other v2 settings',
    otherHint: 'v2-only options, generated with defaults — click to configure',
    generalSection: 'general.json',
    realtimeSection: 'realtime.json',
    chatSection: 'chat.json (optional)',
    useLegacyDatabase: 'Use the v1 MySQL (legacy) database',
    postgresqlConnectionString: 'PostgreSQL connection string (used when the option above is off)',
    saveReplays: 'Save spectator replays',
    replayUploaderConcurrency: 'Replay uploader concurrency',
    maxStartedScores: 'Max concurrent started scores',
    hostPlaylistLimit: 'Host playlist item limit',
    guestPlaylistLimit: 'Guest playlist item limit',
    multiplayerDisconnectGracePeriod: 'Disconnect grace period (hh:mm:ss)',
    tournamentRoomRetentionPeriod: 'Tournament room retention (hh:mm:ss)',
    sentryEnvironment: 'Sentry environment tag',
    sentryTracesSampleRate: 'Sentry trace sample rate (0–1)',
    sentrySendDefaultPii: 'Send default PII to Sentry',
    channelLimit: 'Channel list limit',
    messageLengthLimit: 'Message length limit',
    announceMessageLengthLimit: 'Announcement length limit',
    publicBacklogLimitHours: 'Public backlog hours',
    activityTimeoutSeconds: 'Activity timeout (seconds)',
    recentMessageLimit: 'Recent messages attached',
    publicMessageLimit: 'Public messages per window',
    publicMessageWindowSeconds: 'Public rate window (seconds)',
    privateMessageLimit: 'Private messages per window',
    privateMessageWindowSeconds: 'Private rate window (seconds)',
    resetDefaults: 'Reset to defaults',
    outputTitle: '2. Generated v2 config files',
    outputHint:
      'Put these files into the config/ directory of your g0v0 server v2 (e.g. g0v0.Server.Realtime).',
    downloadAll: 'Download all (.zip)',
    copy: 'Copy',
    download: 'Download',
    emptyInput:
      'Paste or upload your v1 .env above — the defaults below are used for missing values.',
    convertedTitle: 'Converted variables',
    convertedFile: 'v2 target',
    convertedEnv: 'v1 .env variable',
    unmappedTitle: 'Variables without a v2 counterpart',
    unknownTitle: 'Unrecognized variables',
    unknownHint:
      'These are not part of the known v1 .env set — please double-check their spelling.',
    warningsTitle: 'Warnings',
    storageWarning:
      'STORAGE_SETTINGS is not valid JSON, so the default options for the selected storage type were used.',
    chatNote:
      'chat.json is optional in v2 and has no v1 equivalent — the values start from the upstream (osu-web) defaults and can be changed in “Other v2 settings”.',
  },
  zh: {
    inputTitle: '1. 粘贴 g0v0-server v1 的 .env 内容',
    inputHint: '整个转换过程完全在浏览器本地完成，配置不会被上传到任何服务器。',
    upload: '上传文件',
    sample: '载入示例',
    clear: '清空',
    otherTitle: '其他 v2 设置',
    otherHint: 'v2 独有配置项，默认以默认值生成——点击展开配置',
    generalSection: 'general.json',
    realtimeSection: 'realtime.json',
    chatSection: 'chat.json（可选）',
    useLegacyDatabase: '使用 v1 MySQL（旧版）数据库',
    postgresqlConnectionString: 'PostgreSQL 连接字符串（取消勾选上面选项时使用）',
    saveReplays: '保存观战回放',
    replayUploaderConcurrency: '回放上传并发数',
    maxStartedScores: '单个会话最大同时开始分数',
    hostPlaylistLimit: '房主谱面列表上限',
    guestPlaylistLimit: '玩家谱面列表上限',
    multiplayerDisconnectGracePeriod: '断线保留时间 (hh:mm:ss)',
    tournamentRoomRetentionPeriod: '比赛房间保留时间 (hh:mm:ss)',
    sentryEnvironment: 'Sentry 环境标签',
    sentryTracesSampleRate: 'Sentry 性能采样率 (0–1)',
    sentrySendDefaultPii: '向 Sentry 发送默认 PII',
    channelLimit: '频道列表数量上限',
    messageLengthLimit: '消息长度上限',
    announceMessageLengthLimit: '公告消息长度上限',
    publicBacklogLimitHours: '公共频道历史保留（小时）',
    activityTimeoutSeconds: '活跃超时（秒）',
    recentMessageLimit: '附加最近消息数',
    publicMessageLimit: '公共频道每窗口条数',
    publicMessageWindowSeconds: '公共频道限速窗口（秒）',
    privateMessageLimit: '私信每窗口条数',
    privateMessageWindowSeconds: '私信限速窗口（秒）',
    resetDefaults: '恢复默认值',
    outputTitle: '2. 生成的 v2 配置文件',
    outputHint: '将这些文件放入 g0v0 server v2（例如 g0v0.Server.Realtime）的 config/ 目录中。',
    downloadAll: '打包下载全部 (.zip)',
    copy: '复制',
    download: '下载',
    emptyInput: '在上方粘贴或上传 v1 的 .env——缺失的变量将使用默认值。',
    convertedTitle: '已转换的变量',
    convertedFile: 'v2 目标',
    convertedEnv: 'v1 .env 变量',
    unmappedTitle: '没有 v2 对应项的变量',
    unknownTitle: '未识别的变量',
    unknownHint: '这些变量不属于已知的 v1 .env 配置项，请检查拼写。',
    warningsTitle: '警告',
    storageWarning: 'STORAGE_SETTINGS 不是合法的 JSON，已改用所选存储类型的默认 Options。',
    chatNote:
      'chat.json 在 v2 中是可选文件，v1 中没有对应项——初始值为上游（osu-web）默认值，可在「其他 v2 设置」中修改。',
  },
} as const

type Strings = (typeof STRINGS)['en']

const t = computed<Strings>(() => (zh.value ? STRINGS.zh : STRINGS.en))

const SAMPLE_ENV = `MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=osu_api
MYSQL_USER=osu_api
MYSQL_PASSWORD=password
MYSQL_ROOT_PASSWORD=password
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET_KEY=your_jwt_secret_here
JWT_ALGORITHM=HS256
JWT_AUDIENCE=5
JWT_ISSUER=
OSU_CLIENT_ID=5
OSU_CLIENT_SECRET=FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk
OSU_WEB_CLIENT_ID=6
OSU_WEB_CLIENT_SECRET=your_osu_web_client_secret_here
SERVER_URL=http://localhost:8000/
FETCHER_CLIENT_ID=
FETCHER_CLIENT_SECRET=
BEATMAP_CACHE_EXPIRE_HOURS=24
ENABLE_RX=false
ENABLE_AP=false
ENABLE_ALL_BEATMAP_LEADERBOARD=false
SENTRY_DSN=
STORAGE_SERVICE=local
STORAGE_SETTINGS={"local_storage_path":"./storage"}
`

interface MappingRow {
  env: string
  target: string
}

const MAPPING_ROWS: MappingRow[] = [
  { env: 'MYSQL_HOST', target: 'general.json → MySqlHost' },
  { env: 'MYSQL_PORT', target: 'general.json → MySqlPort' },
  { env: 'MYSQL_DATABASE', target: 'general.json → MySqlDatabase' },
  { env: 'MYSQL_USER', target: 'general.json → MySqlUsername' },
  { env: 'MYSQL_PASSWORD', target: 'general.json → MySqlPassword' },
  { env: 'REDIS_URL', target: 'general.json → RedisHost' },
  { env: 'JWT_SECRET_KEY', target: 'general.json → JwtSecretKey' },
  { env: 'JWT_ALGORITHM', target: 'general.json → JwtAlgorithm' },
  { env: 'JWT_AUDIENCE', target: 'general.json → JwtAudience' },
  { env: 'JWT_ISSUER', target: 'general.json → JwtIssuer' },
  { env: 'OSU_CLIENT_ID', target: 'general.json → OsuClientId' },
  { env: 'OSU_CLIENT_SECRET', target: 'general.json → OsuClientSecret' },
  { env: 'OSU_WEB_CLIENT_ID', target: 'general.json → OsuWebClientId' },
  { env: 'OSU_WEB_CLIENT_SECRET', target: 'general.json → OsuWebClientSecret' },
  { env: 'FETCHER_CLIENT_ID', target: 'general.json → FetcherClientId' },
  { env: 'FETCHER_CLIENT_SECRET', target: 'general.json → FetcherClientSecret' },
  { env: 'BEATMAP_CACHE_EXPIRE_HOURS', target: 'general.json → FetcherBeatmapRawCacheExpireHours' },
  { env: 'SERVER_URL', target: 'general.json → ServerUrl' },
  { env: 'ENABLE_RX / ENABLE_OSU_RX', target: 'game.json → EnableRelax' },
  { env: 'ENABLE_AP / ENABLE_OSU_AP', target: 'game.json → EnableAutopilot' },
  { env: 'ENABLE_ALL_BEATMAP_LEADERBOARD', target: 'game.json → EnableAllBeatmapLeaderboard' },
  { env: 'SENTRY_DSN', target: 'realtime.json → Sentry.Dsn' },
  { env: 'STORAGE_SERVICE', target: 'storage.json → Type' },
  { env: 'STORAGE_SETTINGS', target: 'storage.json → Options' },
]

const UNMAPPED_NOTES: Record<string, { en: string; zh: string }> = {
  MYSQL_ROOT_PASSWORD: {
    en: 'Only used by Docker Compose when initializing the database container; the server itself does not read it.',
    zh: '仅用于 Docker Compose 初始化数据库容器，服务器本身不会读取它。',
  },
  ENABLE_V2_IPC: {
    en: 'This is a v1-side switch that enables IPC with the v2 server; nothing to configure on the v2 side.',
    zh: '这是 v1 服务端的开关，用于启用与 v2 服务端的 IPC 互通，v2 服务端无需配置。',
  },
}

const REALTIME_NUMBER_FIELDS = [
  'replayUploaderConcurrency',
  'maxStartedScores',
  'hostPlaylistLimit',
  'guestPlaylistLimit',
] as const

const CHAT_NUMBER_FIELDS = [
  'channelLimit',
  'messageLengthLimit',
  'announceMessageLengthLimit',
  'publicBacklogLimitHours',
  'activityTimeoutSeconds',
  'recentMessageLimit',
  'publicMessageLimit',
  'publicMessageWindowSeconds',
  'privateMessageLimit',
  'privateMessageWindowSeconds',
] as const

const envText = ref('')
const activeFile = ref(0)
const showOther = ref(false)
const opts = reactive({ ...DEFAULT_OPTIONS })

const result = computed(() => convertEnvToV2(envText.value, opts))
const hasInput = computed(() => envText.value.trim().length > 0)
const fileHtml = computed(() => result.value.files.map(f => highlightJson(toJsonText(f.json))))

function unmappedNote(name: string): string {
  const note = UNMAPPED_NOTES[name]
  return note ? note[zh.value ? 'zh' : 'en'] : ''
}

function triggerFileInput() {
  fileInput.value?.click()
}

const fileInput = ref<HTMLInputElement | null>(null)

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    envText.value = String(reader.result ?? '')
  }
  reader.readAsText(file)
  input.value = ''
}

function resetOther() {
  Object.assign(opts, DEFAULT_OPTIONS)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadFile(file: ConvertedConfig) {
  const blob = new Blob([toJsonText(file.json)], { type: 'application/json' })
  downloadBlob(blob, file.name)
}

function downloadZip() {
  const encoder = new TextEncoder()
  const blob = createZipBlob(
    result.value.files.map(f => ({
      name: `config/${f.name}`,
      data: encoder.encode(toJsonText(f.json)),
    }))
  )
  downloadBlob(blob, 'g0v0-v2-config.zip')
}
</script>

<template>
  <div class="config-converter">
    <div class="cc-card">
      <div class="cc-card-head">
        <h3 class="cc-card-title">{{ t.inputTitle }}</h3>
        <div class="cc-toolbar">
          <button class="cc-btn cc-btn-soft" type="button" @click="triggerFileInput">
            {{ t.upload }}
          </button>
          <button class="cc-btn cc-btn-soft" type="button" @click="envText = SAMPLE_ENV">
            {{ t.sample }}
          </button>
          <button class="cc-btn cc-btn-soft" type="button" @click="envText = ''">
            {{ t.clear }}
          </button>
          <input
            ref="fileInput"
            class="cc-file-input"
            type="file"
            accept=".env,.txt,text/plain"
            @change="selectFile"
          />
        </div>
      </div>
      <p class="cc-hint">{{ t.inputHint }}</p>
      <textarea
        v-model="envText"
        class="cc-input"
        rows="12"
        spellcheck="false"
        placeholder="MYSQL_HOST=localhost&#10;MYSQL_PORT=3306&#10;..."
      ></textarea>
    </div>

    <div class="cc-card">
      <button class="cc-collapse-head" type="button" @click="showOther = !showOther">
        <span class="cc-chevron" :class="{ open: showOther }"></span>
        <span class="cc-card-title">{{ t.otherTitle }}</span>
        <span class="cc-collapse-hint">{{ t.otherHint }}</span>
      </button>

      <div v-show="showOther" class="cc-other-body">
        <h4 class="cc-group-title">{{ t.generalSection }}</h4>
        <label class="cc-check">
          <input v-model="opts.useLegacyDatabase" type="checkbox" />
          <span>{{ t.useLegacyDatabase }}</span>
        </label>
        <label v-if="!opts.useLegacyDatabase" class="cc-field cc-field-wide">
          <span class="cc-label">{{ t.postgresqlConnectionString }}</span>
          <input
            v-model="opts.postgresqlConnectionString"
            type="text"
            class="cc-text"
            spellcheck="false"
          />
        </label>

        <h4 class="cc-group-title">{{ t.realtimeSection }}</h4>
        <label class="cc-check">
          <input v-model="opts.saveReplays" type="checkbox" />
          <span>{{ t.saveReplays }}</span>
        </label>
        <div class="cc-grid">
          <label v-for="field in REALTIME_NUMBER_FIELDS" :key="field" class="cc-field">
            <span class="cc-label">{{ t[field] }}</span>
            <input v-model.number="opts[field]" type="number" min="0" class="cc-text" />
          </label>
          <label class="cc-field">
            <span class="cc-label">{{ t.multiplayerDisconnectGracePeriod }}</span>
            <input
              v-model="opts.multiplayerDisconnectGracePeriod"
              type="text"
              class="cc-text"
              placeholder="00:00:30"
              spellcheck="false"
            />
          </label>
          <label class="cc-field">
            <span class="cc-label">{{ t.tournamentRoomRetentionPeriod }}</span>
            <input
              v-model="opts.tournamentRoomRetentionPeriod"
              type="text"
              class="cc-text"
              placeholder="00:30:00"
              spellcheck="false"
            />
          </label>
          <label class="cc-field">
            <span class="cc-label">{{ t.sentryEnvironment }}</span>
            <input
              v-model="opts.sentryEnvironment"
              type="text"
              class="cc-text"
              spellcheck="false"
            />
          </label>
          <label class="cc-field">
            <span class="cc-label">{{ t.sentryTracesSampleRate }}</span>
            <input
              v-model.number="opts.sentryTracesSampleRate"
              type="number"
              min="0"
              max="1"
              step="0.05"
              class="cc-text"
            />
          </label>
        </div>
        <label class="cc-check">
          <input v-model="opts.sentrySendDefaultPii" type="checkbox" />
          <span>{{ t.sentrySendDefaultPii }}</span>
        </label>

        <h4 class="cc-group-title">{{ t.chatSection }}</h4>
        <div class="cc-grid">
          <label v-for="field in CHAT_NUMBER_FIELDS" :key="field" class="cc-field">
            <span class="cc-label">{{ t[field] }}</span>
            <input v-model.number="opts[field]" type="number" min="0" class="cc-text" />
          </label>
        </div>

        <div class="cc-other-actions">
          <button class="cc-btn cc-btn-soft" type="button" @click="resetOther">
            {{ t.resetDefaults }}
          </button>
        </div>
      </div>
    </div>

    <div class="cc-card">
      <div class="cc-card-head">
        <h3 class="cc-card-title">{{ t.outputTitle }}</h3>
        <button class="cc-btn cc-btn-primary" type="button" @click="downloadZip">
          {{ t.downloadAll }}
        </button>
      </div>
      <p class="cc-hint">{{ t.outputHint }}</p>
      <p v-if="!hasInput" class="cc-empty">{{ t.emptyInput }}</p>

      <div class="cc-tabs-row">
        <div class="cc-tabs" role="tablist">
          <button
            v-for="(file, index) in result.files"
            :key="file.name"
            class="cc-tab"
            :class="{ active: activeFile === index }"
            type="button"
            role="tab"
            @click="activeFile = index"
          >
            {{ file.name }}
          </button>
        </div>
        <button
          class="cc-btn cc-btn-mini"
          type="button"
          @click="downloadFile(result.files[activeFile])"
        >
          {{ t.download }}
        </button>
      </div>

      <div
        v-for="(file, index) in result.files"
        v-show="activeFile === index"
        :key="file.name"
        class="cc-block-wrap"
      >
        <div class="language-json">
          <button title="Copy Code" class="copy"></button>
          <span class="lang">json</span>
          <pre tabindex="0" dir="ltr"><code v-html="fileHtml[index]"></code></pre>
        </div>
        <p v-if="file.name === 'chat.json'" class="cc-hint">{{ t.chatNote }}</p>
      </div>
    </div>

    <div v-if="result.warnings.length" class="cc-card cc-alert">
      <h3 class="cc-card-title">{{ t.warningsTitle }}</h3>
      <ul>
        <li v-for="warning in result.warnings" :key="warning">
          {{ warning === 'STORAGE_SETTINGS' ? t.storageWarning : warning }}
        </li>
      </ul>
    </div>

    <div class="cc-card">
      <h3 class="cc-card-title">{{ t.convertedTitle }}</h3>
      <div class="cc-table-wrap">
        <table class="cc-table">
          <thead>
            <tr>
              <th>{{ t.convertedEnv }}</th>
              <th>{{ t.convertedFile }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in MAPPING_ROWS" :key="row.env">
              <td>
                <code>{{ row.env }}</code>
              </td>
              <td>
                <code>{{ row.target }}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="result.unmapped.length || result.unknown.length" class="cc-card">
      <template v-if="result.unmapped.length">
        <h3 class="cc-card-title">{{ t.unmappedTitle }}</h3>
        <ul class="cc-var-list">
          <li v-for="name in result.unmapped" :key="name">
            <code>{{ name }}</code>
            <span v-if="unmappedNote(name)" class="cc-var-note"> — {{ unmappedNote(name) }}</span>
          </li>
        </ul>
      </template>
      <template v-if="result.unknown.length">
        <h3 class="cc-card-title">{{ t.unknownTitle }}</h3>
        <p class="cc-hint">{{ t.unknownHint }}</p>
        <ul class="cc-var-list">
          <li v-for="name in result.unknown" :key="name">
            <code>{{ name }}</code>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped>
.config-converter {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 16px 0;
}

.cc-card {
  background: var(--card-bg, var(--vp-c-bg-soft));
  border: 1px solid var(--border-color, var(--vp-c-divider));
  border-radius: 12px;
  padding: 16px 20px;
}

.cc-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.cc-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  border: none;
}

.cc-hint {
  margin: 6px 0 10px;
  font-size: 13px;
  color: var(--text-secondary, var(--vp-c-text-2));
}

.cc-empty {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.cc-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cc-file-input {
  display: none;
}

.cc-btn {
  display: inline-flex;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.cc-btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.cc-btn-primary:hover {
  background: var(--vp-c-brand-2);
}

.cc-btn-soft {
  background: var(--vp-c-bg-soft);
  border-color: var(--border-color, var(--vp-c-divider));
  color: var(--vp-c-text-1);
}

.cc-btn-soft:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.cc-btn-mini {
  padding: 3px 10px;
  font-size: 12px;
  background: var(--vp-c-bg-soft);
  border-color: var(--border-color, var(--vp-c-divider));
  color: var(--vp-c-text-1);
  align-self: center;
}

.cc-btn-mini:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.cc-collapse-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.cc-chevron {
  width: 0;
  height: 0;
  border-left: 6px solid var(--vp-c-text-2);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.cc-chevron.open {
  transform: rotate(90deg);
}

.cc-collapse-hint {
  font-size: 13px;
  color: var(--text-secondary, var(--vp-c-text-2));
  font-weight: 400;
  margin-left: auto;
}

.cc-other-body {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color, var(--vp-c-divider));
}

.cc-group-title {
  margin: 12px 0 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--vp-font-family-mono, monospace);
  color: var(--vp-c-brand-1);
}

.cc-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin: 6px 0;
  cursor: pointer;
}

.cc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px 16px;
  margin: 8px 0;
}

.cc-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.cc-field-wide {
  margin: 6px 0;
}

.cc-label {
  color: var(--text-secondary, var(--vp-c-text-2));
}

.cc-text {
  box-sizing: border-box;
  width: 100%;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-color, var(--vp-c-divider));
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono, monospace);
}

.cc-text:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.cc-other-actions {
  margin-top: 12px;
}

.cc-input {
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 13px;
  line-height: 1.5;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color, var(--vp-c-divider));
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.cc-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.cc-tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin: 8px 0 12px;
}

.cc-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cc-tab {
  border: 1px solid var(--border-color, var(--vp-c-divider));
  background: transparent;
  color: var(--vp-c-text-2);
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 13px;
  font-family: var(--vp-font-family-mono, monospace);
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s,
    background-color 0.2s;
}

.cc-tab:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.cc-tab.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.cc-block-wrap :deep(div[class*='language-']) {
  margin: 0;
}

.cc-table-wrap {
  overflow-x: auto;
}

.cc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.cc-table th,
.cc-table td {
  border: none;
  border-bottom: 1px solid var(--border-color, var(--vp-c-divider));
  padding: 6px 10px;
  text-align: left;
  vertical-align: top;
}

.cc-table th {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.cc-table code {
  font-size: 12px;
  background: var(--vp-c-bg-soft);
  padding: 1px 6px;
  border-radius: 4px;
}

.cc-var-list {
  margin: 8px 0 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 13px;
}

.cc-var-list code {
  font-size: 12px;
  background: var(--vp-c-bg-soft);
  padding: 1px 6px;
  border-radius: 4px;
}

.cc-var-note {
  color: var(--text-secondary, var(--vp-c-text-2));
}

.cc-alert {
  border-color: var(--vp-c-warning-1, #e0a800);
}
</style>

<style>
/* JSON token colors for the dynamic code blocks (shiki github light/dark palette). */
.language-json code .tok-key {
  color: #0550ae;
}

.language-json code .tok-str {
  color: #0a3069;
}

.language-json code .tok-lit,
.language-json code .tok-num {
  color: #cf222e;
}

.dark .language-json code .tok-key {
  color: #79c0ff;
}

.dark .language-json code .tok-str {
  color: #a5d6ff;
}

.dark .language-json code .tok-lit,
.dark .language-json code .tok-num {
  color: #79c0ff;
}
</style>
