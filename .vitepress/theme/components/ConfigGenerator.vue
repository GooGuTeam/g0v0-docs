<script setup lang="ts">
/**
 * Manual configuration generator for g0v0-server.
 *
 * The v1 panel fills in every `.env` option of g0v0-server v1 and exports a
 * ready-to-use `.env`; the v2 panel fills in every `config/*.json` option of
 * g0v0 server v2 and exports the JSON files. Everything runs locally in the
 * browser.
 */

import { computed, reactive, ref } from 'vue'
import { useData } from 'vitepress'
import { highlightJson, toJsonText } from './config-converter/convert'
import { createZipBlob } from './config-converter/zip'
import ConfigField from './config-generator/ConfigField.vue'
import {
  applyEnvText,
  buildV1Groups,
  createV1State,
  highlightEnv,
  serializeEnv,
  type V1Field,
  type V1Value,
} from './config-generator/v1-schema'
import {
  createStorageOptions,
  createV2State,
  buildV2Files,
  STORAGE_OPTION_FIELDS,
  STORAGE_TYPES,
  STORAGE_TYPE_LABELS,
  V2_SECTIONS,
  type Bi,
  type StorageType,
  type V2Field,
  type V2Section,
  type V2Value,
} from './config-generator/v2-schema'

const props = defineProps<{
  schema: {
    definition: Record<string, any>
    labels: Record<string, Record<string, string>>
  }
}>()

const { lang } = useData()
const zh = computed(() => lang.value.toLowerCase().startsWith('zh'))

const STRINGS = {
  en: {
    intro:
      'Fill in the options below — both the v1 `.env` and the v2 `config/*.json` files are generated locally in your browser, so nothing (including passwords and secrets) is uploaded anywhere.',
    tabV1: 'v1 config (.env)',
    tabV2: 'v2 config (config/*.json)',
    v1Title: 'g0v0-server v1 configuration (.env)',
    v1Hint: 'Every option starts from the v1 default value; highlighted fields were changed.',
    v2Title: 'g0v0 server v2 configuration (config/*.json)',
    v2Hint:
      'Every option starts from the v2 default value. Put the generated files into the config/ directory of your v2 services (e.g. g0v0.Server.Realtime).',
    importEnv: 'Import .env',
    importPlaceholder: 'Paste an existing v1 .env here to load it into the form…',
    importApply: 'Load into form',
    cancel: 'Cancel',
    importApplied: 'Loaded {n} values from the pasted text.',
    importEmpty: 'No known v1 variable was found in the pasted text.',
    reset: 'Reset to defaults',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    storageType: 'Storage type',
    storageDesc: 'Storage backend shared by all v2 services',
    outputV1Title: 'Generated .env',
    outputV2Title: 'Generated config files',
    outputV1Hint: 'Save this as `.env` in the root directory of your g0v0-server v1 deployment.',
    chatNote:
      'config/chat.json is optional: when the file is absent every chat limit falls back to the osu-web default.',
    copy: 'Copy',
    copied: 'Copied',
    download: 'Download',
    downloadEnv: 'Download .env',
    downloadAll: 'Download all (.zip)',
    converterHint:
      'Already have a v1 `.env`? The config converter turns it into v2 files automatically.',
  },
  zh: {
    intro:
      '在下方填写配置项——v1 的 `.env` 与 v2 的 `config/*.json` 都在浏览器本地生成，包括密码与密钥在内的所有内容都不会被上传。',
    tabV1: 'v1 配置（.env）',
    tabV2: 'v2 配置（config/*.json）',
    v1Title: 'g0v0-server v1 配置（.env）',
    v1Hint: '所有选项都以 v1 的默认值开始，改动过的选项会被高亮。',
    v2Title: 'g0v0 server v2 配置（config/*.json）',
    v2Hint:
      '所有选项都以 v2 的默认值开始。把生成的文件放入各个 v2 服务（例如 g0v0.Server.Realtime）的 config/ 目录即可。',
    importEnv: '导入 .env',
    importPlaceholder: '在此粘贴已有的 v1 .env 内容，即可导入到表单中……',
    importApply: '导入到表单',
    cancel: '取消',
    importApplied: '已从粘贴的内容中导入 {n} 个配置项。',
    importEmpty: '粘贴的内容中没有识别到已知的 v1 配置项。',
    reset: '恢复默认值',
    expandAll: '全部展开',
    collapseAll: '全部折叠',
    storageType: '存储类型',
    storageDesc: 'v2 各个服务共用的存储后端',
    outputV1Title: '生成的 .env',
    outputV2Title: '生成的配置文件',
    outputV1Hint: '将内容保存为 `.env`，放到 g0v0-server v1 部署的根目录中。',
    chatNote:
      'config/chat.json 是可选文件：不放入该文件时，所有聊天限制将使用来自 osu-web 的默认值。',
    copy: '复制',
    copied: '已复制',
    download: '下载',
    downloadEnv: '下载 .env',
    downloadAll: '打包下载全部 (.zip)',
    converterHint: '已经有 v1 的 `.env`？可以使用配置转换器一键转换为 v2 配置文件。',
  },
} as const

type Strings = (typeof STRINGS)['en']

const t = computed<Strings>(() => (zh.value ? STRINGS.zh : STRINGS.en))
const bi = (label: Bi) => (zh.value ? label.zh : label.en)

/* -------------------------------------------------------------------------- */
/* v1 panel                                                                   */
/* -------------------------------------------------------------------------- */

const groups = computed(() => buildV1Groups(props.schema.definition, props.schema.labels))
const v1 = reactive<Record<string, V1Value>>(createV1State(groups.value))
const openV1 = reactive<Record<string, boolean>>(
  Object.fromEntries(groups.value.map((group, index) => [group.key, index === 0]))
)

const envText = computed(() => serializeEnv(groups.value, v1))
const envHtml = computed(() => highlightEnv(envText.value))

function nonBool(fields: V1Field[]) {
  return fields.filter(field => field.kind !== 'bool')
}

function boolFields(fields: V1Field[]) {
  return fields.filter(field => field.kind === 'bool')
}

function isChanged(field: V1Field): boolean {
  const value = v1[field.key]
  return typeof field.def === 'boolean' ? value !== field.def : String(value) !== String(field.def)
}

function toggleAllV1(open: boolean) {
  for (const group of groups.value) openV1[group.key] = open
}

function resetV1() {
  const defaults = createV1State(groups.value)
  for (const key of Object.keys(defaults)) v1[key] = defaults[key]
  importMessage.value = ''
}

const showImport = ref(false)
const importText = ref('')
const importMessage = ref('')

function doImport() {
  const count = applyEnvText(groups.value, v1, importText.value)
  importMessage.value = count
    ? t.value.importApplied.replace('{n}', String(count))
    : t.value.importEmpty
  if (count) showImport.value = false
}

function closeImport() {
  showImport.value = false
  importText.value = ''
  importMessage.value = ''
}

/* -------------------------------------------------------------------------- */
/* v2 panel                                                                   */
/* -------------------------------------------------------------------------- */

const mode = ref<'v1' | 'v2'>('v1')
const v2 = reactive<Record<string, Record<string, V2Value>>>(createV2State())
const storageType = ref<StorageType>('Local')
const storageOptions = reactive(createStorageOptions())
const activeFile = ref(0)

const files = computed(() => buildV2Files(v2, storageType.value, storageOptions))
const fileHtml = computed(() => files.value.map(file => highlightJson(toJsonText(file.json))))

function nonBoolV2(fields: V2Field[]) {
  return fields.filter(field => field.kind !== 'bool')
}

function boolV2(fields: V2Field[]) {
  return fields.filter(field => field.kind === 'bool')
}

const GENERAL_FILE = 'general.json'
const MYSQL_FIELDS = [
  'MySqlHost',
  'MySqlPort',
  'MySqlDatabase',
  'MySqlUsername',
  'MySqlPassword',
  'PostgresqlConnectionString',
]

/**
 * `general.json` only shows the database options that are actually in use:
 * the MySQL fields with `UseLegacyDatabase: true`, and the PostgreSQL
 * connection string otherwise. Both are still written to the generated file.
 */
function visibleV2Fields(section: V2Section): V2Field[] {
  if (section.file !== GENERAL_FILE) return section.fields
  const legacy = v2[GENERAL_FILE]?.UseLegacyDatabase !== false
  return section.fields.filter(field => {
    if (field.path === 'PostgresqlConnectionString') return !legacy
    if (MYSQL_FIELDS.includes(field.path)) return legacy
    return true
  })
}

function onStorageTypeChange(event: Event) {
  storageType.value = (event.target as HTMLSelectElement).value as StorageType
}

function resetV2() {
  const defaults = createV2State()
  for (const file of Object.keys(defaults)) {
    for (const key of Object.keys(defaults[file])) v2[file][key] = defaults[file][key]
  }
  const storageDefaults = createStorageOptions()
  storageType.value = 'Local'
  for (const type of STORAGE_TYPES) {
    for (const key of Object.keys(storageDefaults[type])) {
      storageOptions[type][key] = storageDefaults[type][key]
    }
  }
}

/* -------------------------------------------------------------------------- */
/* output helpers                                                             */
/* -------------------------------------------------------------------------- */

const copied = ref('')
let copiedTimer: ReturnType<typeof setTimeout> | undefined

async function copyText(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      if (copied.value === key) copied.value = ''
    }, 1500)
  } catch {
    /* clipboard unavailable (e.g. insecure context) — ignore */
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function downloadEnv() {
  downloadBlob(new Blob([envText.value], { type: 'text/plain' }), '.env')
}

function downloadFile(index: number) {
  const file = files.value[index]
  downloadBlob(new Blob([toJsonText(file.json)], { type: 'application/json' }), file.name)
}

function downloadZip() {
  const encoder = new TextEncoder()
  downloadBlob(
    createZipBlob(
      files.value.map(file => ({
        name: `config/${file.name}`,
        data: encoder.encode(toJsonText(file.json)),
      }))
    ),
    'g0v0-v2-config.zip'
  )
}
</script>

<template>
  <div class="config-generator">
    <div class="cg-card">
      <div class="cg-mode-tabs" role="tablist">
        <button
          class="cg-tab"
          :class="{ active: mode === 'v1' }"
          type="button"
          role="tab"
          @click="mode = 'v1'"
        >
          {{ t.tabV1 }}
        </button>
        <button
          class="cg-tab"
          :class="{ active: mode === 'v2' }"
          type="button"
          role="tab"
          @click="mode = 'v2'"
        >
          {{ t.tabV2 }}
        </button>
      </div>
      <p class="cg-hint">{{ t.intro }}</p>
    </div>

    <!-- v1 ------------------------------------------------------------------ -->
    <template v-if="mode === 'v1'">
      <div class="cg-card">
        <div class="cg-card-head">
          <h3 class="cg-card-title">{{ t.v1Title }}</h3>
          <div class="cg-toolbar">
            <button class="cg-btn cg-btn-soft" type="button" @click="showImport = !showImport">
              {{ t.importEnv }}
            </button>
            <button class="cg-btn cg-btn-soft" type="button" @click="toggleAllV1(true)">
              {{ t.expandAll }}
            </button>
            <button class="cg-btn cg-btn-soft" type="button" @click="toggleAllV1(false)">
              {{ t.collapseAll }}
            </button>
            <button class="cg-btn cg-btn-soft" type="button" @click="resetV1">
              {{ t.reset }}
            </button>
          </div>
        </div>
        <p class="cg-hint">{{ t.v1Hint }}</p>

        <div v-if="showImport" class="cg-import">
          <textarea
            v-model="importText"
            class="cg-input"
            rows="5"
            spellcheck="false"
            :placeholder="t.importPlaceholder"
          ></textarea>
          <div class="cg-import-actions">
            <button class="cg-btn cg-btn-primary" type="button" @click="doImport">
              {{ t.importApply }}
            </button>
            <button class="cg-btn cg-btn-soft" type="button" @click="closeImport">
              {{ t.cancel }}
            </button>
            <span v-if="importMessage" class="cg-msg">{{ importMessage }}</span>
          </div>
        </div>

        <section v-for="group in groups" :key="group.key" class="cg-group">
          <button
            class="cg-group-head"
            type="button"
            @click="openV1[group.key] = !openV1[group.key]"
          >
            <span class="cg-chevron" :class="{ open: openV1[group.key] }"></span>
            <span class="cg-group-name">{{ group.name }}</span>
            <code class="cg-key">{{ group.key }}</code>
            <span class="cg-group-count">{{ group.fields.length }}</span>
          </button>

          <div v-show="openV1[group.key]" class="cg-group-body">
            <p v-if="group.description" class="cg-hint">{{ group.description }}</p>

            <div class="cg-checks">
              <ConfigField
                v-for="field in boolFields(group.fields)"
                :key="field.key"
                v-model="v1[field.key]"
                :kind="field.kind"
                :label="field.label"
                :hint="field.key"
                :class="{ changed: isChanged(field) }"
              />
            </div>

            <div class="cg-grid">
              <ConfigField
                v-for="field in nonBool(group.fields)"
                :key="field.key"
                v-model="v1[field.key]"
                :kind="field.kind"
                :label="field.label"
                :hint="field.key"
                :enum-values="field.enumValues"
                :class="{ changed: isChanged(field) }"
              />
            </div>
          </div>
        </section>
      </div>

      <div class="cg-card">
        <div class="cg-card-head">
          <h3 class="cg-card-title">{{ t.outputV1Title }}</h3>
          <div class="cg-toolbar">
            <button class="cg-btn cg-btn-soft" type="button" @click="copyText(envText, 'env')">
              {{ copied === 'env' ? t.copied : t.copy }}
            </button>
            <button class="cg-btn cg-btn-primary" type="button" @click="downloadEnv">
              {{ t.downloadEnv }}
            </button>
          </div>
        </div>
        <p class="cg-hint">{{ t.outputV1Hint }}</p>
        <div class="cg-code">
          <pre tabindex="0" dir="ltr"><code v-html="envHtml"></code></pre>
        </div>
      </div>
    </template>

    <!-- v2 ------------------------------------------------------------------ -->
    <template v-else>
      <div class="cg-card">
        <div class="cg-card-head">
          <h3 class="cg-card-title">{{ t.v2Title }}</h3>
          <div class="cg-toolbar">
            <button class="cg-btn cg-btn-soft" type="button" @click="resetV2">
              {{ t.reset }}
            </button>
          </div>
        </div>
        <p class="cg-hint">{{ t.v2Hint }}</p>

        <section v-for="section in V2_SECTIONS" :key="section.file" class="cg-group">
          <div class="cg-group-head cg-group-head-static">
            <span class="cg-group-name">{{ section.file }}</span>
            <span class="cg-group-desc">{{ bi(section.label) }}</span>
          </div>
          <div class="cg-group-body">
            <div class="cg-checks">
              <ConfigField
                v-for="field in boolV2(visibleV2Fields(section))"
                :key="field.path"
                v-model="v2[section.file][field.path]"
                :kind="field.kind"
                :label="bi(field.label)"
                :hint="field.path"
              />
            </div>
            <div class="cg-grid">
              <ConfigField
                v-for="field in nonBoolV2(visibleV2Fields(section))"
                :key="field.path"
                v-model="v2[section.file][field.path]"
                :kind="field.kind"
                :label="bi(field.label)"
                :hint="field.path"
              />
            </div>
          </div>
        </section>

        <section class="cg-group">
          <div class="cg-group-head cg-group-head-static">
            <span class="cg-group-name">storage.json</span>
            <span class="cg-group-desc">{{ t.storageDesc }}</span>
          </div>
          <div class="cg-group-body">
            <div class="cg-grid">
              <label class="cg-field">
                <span class="cg-label">
                  <span>{{ t.storageType }}</span>
                  <code class="cg-key">Type</code>
                </span>
                <select class="cg-text" :value="storageType" @change="onStorageTypeChange">
                  <option v-for="type in STORAGE_TYPES" :key="type" :value="type">
                    {{ bi(STORAGE_TYPE_LABELS[type]) }}
                  </option>
                </select>
              </label>
              <ConfigField
                v-for="field in STORAGE_OPTION_FIELDS[storageType]"
                :key="field.path"
                v-model="storageOptions[storageType][field.path]"
                :kind="field.kind"
                :label="bi(field.label)"
                :hint="field.path"
              />
            </div>
          </div>
        </section>
      </div>

      <div class="cg-card">
        <div class="cg-card-head">
          <h3 class="cg-card-title">{{ t.outputV2Title }}</h3>
          <button class="cg-btn cg-btn-primary" type="button" @click="downloadZip">
            {{ t.downloadAll }}
          </button>
        </div>

        <div class="cg-tabs-row">
          <div class="cg-tabs" role="tablist">
            <button
              v-for="(file, index) in files"
              :key="file.name"
              class="cg-tab"
              :class="{ active: activeFile === index }"
              type="button"
              role="tab"
              @click="activeFile = index"
            >
              {{ file.name }}
            </button>
          </div>
          <div class="cg-toolbar">
            <button
              class="cg-btn cg-btn-mini"
              type="button"
              @click="copyText(toJsonText(files[activeFile].json), 'file')"
            >
              {{ copied === 'file' ? t.copied : t.copy }}
            </button>
            <button class="cg-btn cg-btn-mini" type="button" @click="downloadFile(activeFile)">
              {{ t.download }}
            </button>
          </div>
        </div>

        <div
          v-for="(file, index) in files"
          v-show="activeFile === index"
          :key="file.name"
          class="cg-code"
        >
          <pre tabindex="0" dir="ltr"><code v-html="fileHtml[index]"></code></pre>
        </div>

        <p v-if="files[activeFile].name === 'chat.json'" class="cg-hint">{{ t.chatNote }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.config-generator {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 16px 0;
}

.cg-card {
  background: var(--card-bg, var(--vp-c-bg-soft));
  border: 1px solid var(--border-color, var(--vp-c-divider));
  border-radius: 12px;
  padding: 16px 20px;
}

.cg-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.cg-card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  border: none;
}

.cg-hint {
  margin: 6px 0 10px;
  font-size: 13px;
  color: var(--text-secondary, var(--vp-c-text-2));
}

.cg-mode-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cg-tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin: 4px 0 12px;
}

.cg-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cg-tab {
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

.cg-tab:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.cg-tab.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.cg-mode-tabs .cg-tab {
  padding: 6px 16px;
  font-family: inherit;
  font-weight: 500;
}

.cg-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cg-btn {
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

.cg-btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.cg-btn-primary:hover {
  background: var(--vp-c-brand-2);
}

.cg-btn-soft {
  background: var(--vp-c-bg-soft);
  border-color: var(--border-color, var(--vp-c-divider));
  color: var(--vp-c-text-1);
}

.cg-btn-soft:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.cg-btn-mini {
  padding: 3px 10px;
  font-size: 12px;
  background: var(--vp-c-bg-soft);
  border-color: var(--border-color, var(--vp-c-divider));
  color: var(--vp-c-text-1);
  align-self: center;
}

.cg-btn-mini:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.cg-import {
  margin: 8px 0 14px;
  padding: 12px;
  border: 1px dashed var(--border-color, var(--vp-c-divider));
  border-radius: 10px;
}

.cg-import-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.cg-msg {
  font-size: 13px;
  color: var(--text-secondary, var(--vp-c-text-2));
}

.cg-input {
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

.cg-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.cg-group {
  border-top: 1px dashed var(--border-color, var(--vp-c-divider));
  margin-top: 12px;
  padding-top: 4px;
}

.cg-group:first-of-type {
  border-top: none;
}

.cg-group-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: transparent;
  border: none;
  padding: 6px 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.cg-group-head-static {
  cursor: default;
}

.cg-chevron {
  width: 0;
  height: 0;
  border-left: 6px solid var(--vp-c-text-2);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.cg-chevron.open {
  transform: rotate(90deg);
}

.cg-group-name {
  font-size: 14px;
  font-weight: 600;
}

.cg-group-desc {
  font-size: 13px;
  font-weight: 400;
  color: var(--text-secondary, var(--vp-c-text-2));
}

.cg-group-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.cg-group-body {
  padding: 4px 0 8px;
}

.cg-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  margin: 4px 0 8px;
}

.cg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px 16px;
  margin: 8px 0;
}

.cg-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}

.cg-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.cg-text {
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

.cg-textarea {
  resize: vertical;
  line-height: 1.5;
}

.cg-text:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.cg-code {
  overflow-x: auto;
}

.cg-code pre {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-alt, var(--vp-c-bg-soft));
  overflow-x: auto;
}

.cg-code code {
  font-family: var(--vp-font-family-mono, monospace);
  white-space: pre;
}
</style>

<style>
/* token colors for the generated code blocks (shiki github light/dark palette) */
.config-generator .cg-code code .tok-key {
  color: #0550ae;
}

.config-generator .cg-code code .tok-str {
  color: #0a3069;
}

.config-generator .cg-code code .tok-lit,
.config-generator .cg-code code .tok-num {
  color: #cf222e;
}

.config-generator .cg-code code .tok-comment {
  color: #6e7781;
}

.dark .config-generator .cg-code code .tok-key {
  color: #79c0ff;
}

.dark .config-generator .cg-code code .tok-str {
  color: #a5d6ff;
}

.dark .config-generator .cg-code code .tok-lit,
.dark .config-generator .cg-code code .tok-num {
  color: #79c0ff;
}

.dark .config-generator .cg-code code .tok-comment {
  color: #8b949e;
}
</style>
