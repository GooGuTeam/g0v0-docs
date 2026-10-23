/**
 * Shared configuration model for g0v0-server docs.
 *
 * Both v1 (`data/configuration/definition.json`) and v2
 * (`data/v2-configuration/definition.json`) config definitions live as JSON;
 * the locale labels (field descriptions / section names) live in
 * `data/<...>/<locale>.js`. This module only contains the generic logic that
 * turns those JSON definitions into form models (config generator) and
 * reference-page rows (配置 / Configurations pages) — it never hardcodes any
 * field.
 */

/* -------------------------------------------------------------------------- */
/* generic form model (shared by the v1 `.env` and v2 `config/*.json` panels) */
/* -------------------------------------------------------------------------- */

import { parseEnv } from '../config-converter/convert'

export type FieldKind = 'string' | 'int' | 'float' | 'bool' | 'enum' | 'json'

export interface Field {
  /** v1 env key or v2 JSON property path, e.g. `MYSQL_HOST` / `Sentry.Dsn`. */
  key: string
  kind: FieldKind
  /** raw `$type` from the definition, shown as a hint */
  type: string
  enumValues?: string[]
  aliases: string[]
  label: string
  def: string | number | boolean
  /** empty input is written as `null` instead of `""` */
  nullable?: boolean
}

export interface Group {
  key: string
  name: string
  description?: string
  fields: Field[]
}

interface DefinitionField {
  $type: string
  $default: unknown
  $aliases?: string[]
  $nullable?: boolean
}

export type Definition = Record<string, Record<string, DefinitionField | unknown>>
export type Labels = Record<string, Record<string, string>>

export function parseKind(type: string): { kind: FieldKind; enumValues?: string[] } {
  if (type === 'string') return { kind: 'string' }
  if (type === 'integer') return { kind: 'int' }
  if (type === 'float') return { kind: 'float' }
  if (type === 'boolean') return { kind: 'bool' }
  const enumMatch = /^enum\(([^)]*)\)$/.exec(type)
  if (enumMatch) {
    return {
      kind: 'enum',
      enumValues: enumMatch[1]
        .split(',')
        .map(v => v.trim())
        .filter(Boolean),
    }
  }
  return { kind: 'json' }
}

export function toFormValue(kind: FieldKind, value: unknown): string | number | boolean {
  if (kind === 'bool') return value === true
  if (value === null || value === undefined) return ''
  if (kind === 'json') return JSON.stringify(value)
  return String(value)
}

/** Build the grouped form model from a `definition.json` + locale labels. */
export function buildGroups(definition: Definition, labels: Labels): Group[] {
  const groups: Group[] = []
  for (const [groupKey, rawFields] of Object.entries(definition)) {
    if (groupKey.startsWith('$')) continue
    const groupLabels = labels[groupKey] ?? {}
    const fields: Field[] = []
    for (const [key, raw] of Object.entries(rawFields)) {
      if (key.startsWith('$')) continue
      const field = raw as DefinitionField
      const { kind, enumValues } = parseKind(field.$type)
      fields.push({
        key,
        kind,
        type: field.$type,
        enumValues,
        aliases: field.$aliases ?? [],
        label: groupLabels[key] ?? key,
        def: toFormValue(kind, field.$default),
        nullable: field.$nullable,
      })
    }
    groups.push({
      key: groupKey,
      name: groupLabels.$name ?? groupKey,
      description: groupLabels.$description,
      fields,
    })
  }
  return groups
}

export function createState(groups: Group[]): Record<string, string | number | boolean> {
  const state: Record<string, string | number | boolean> = {}
  for (const group of groups) {
    for (const field of group.fields) state[field.key] = field.def
  }
  return state
}

/** Per-file flat state for the v2 panels: `file name` -> `path` -> value. */
export function createSectionsState(
  sections: Group[]
): Record<string, Record<string, string | number | boolean>> {
  const state: Record<string, Record<string, string | number | boolean>> = {}
  for (const section of sections) state[section.key] = createState([section])
  return state
}

/* -------------------------------------------------------------------------- */
/* v2 model (built from `data/v2-configuration/definition.json`)              */
/* -------------------------------------------------------------------------- */

export interface V2StorageModel {
  /** storage backends in definition order, e.g. `['Local', 'S3', 'R2']` */
  types: string[]
  typeLabels: Record<string, string>
  optionFields: Record<string, Field[]>
  typeField: Field
}

export interface V2Model {
  /** config files except `storage.json` */
  sections: Group[]
  storage: V2StorageModel
}

/** Build the v2 form model from the v2 definition + locale labels. */
export function buildV2Model(definition: Definition, labels: Labels): V2Model {
  const groups = buildGroups(definition, labels)
  const sections = groups.filter(group => group.key !== 'storage.json')

  const storageDef = (definition['storage.json'] ?? {}) as Record<string, unknown>
  const storageLabels = labels['storage.json'] ?? {}
  const options = (storageDef.$storageOptions ?? {}) as Record<
    string,
    Record<string, DefinitionField>
  >
  const types = Object.keys(options)
  const optionFields: Record<string, Field[]> = {}
  for (const type of types) {
    optionFields[type] =
      buildGroups({ [type]: options[type] }, { [type]: storageLabels })[0]?.fields ?? []
  }
  const storageGroup = groups.find(group => group.key === 'storage.json')
  const typeField = storageGroup?.fields.find(field => field.key === 'Type') ?? {
    key: 'Type',
    kind: 'string',
    type: `enum(${types.join(', ')})`,
    aliases: [],
    label: storageLabels.Type ?? 'Type',
    def: types[0] ?? 'Local',
  }

  return {
    sections,
    storage: {
      types,
      typeLabels: (storageLabels.$storageTypeLabels as Record<string, string> | undefined) ?? {},
      optionFields,
      typeField,
    },
  }
}

export function createStorageOptions(
  storage: V2StorageModel
): Record<string, Record<string, string | number | boolean>> {
  const result: Record<string, Record<string, string | number | boolean>> = {}
  for (const type of storage.types) {
    result[type] = Object.fromEntries(
      (storage.optionFields[type] ?? []).map(field => [field.key, field.def])
    )
  }
  return result
}

function coerce(field: Field, value: string | number | boolean | null | undefined): unknown {
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
export function buildSectionJson(section: Group, values: Record<string, unknown>): unknown {
  const json: Record<string, unknown> = {}
  for (const field of section.fields) {
    const parts = field.key.split('.')
    let cursor = json
    for (const part of parts.slice(0, -1)) {
      if (typeof cursor[part] !== 'object' || cursor[part] === null) cursor[part] = {}
      cursor = cursor[part] as Record<string, unknown>
    }
    cursor[parts[parts.length - 1]] = coerce(field, values[field.key] ?? field.def)
  }
  return json
}

export interface GeneratedFile {
  name: string
  json: unknown
}

/** Build every `config/*.json` file from the current form state. */
export function buildV2Files(
  model: V2Model,
  state: Record<string, Record<string, string | number | boolean>>,
  storageType: string,
  storageOptions: Record<string, Record<string, string | number | boolean>>
): GeneratedFile[] {
  const files: GeneratedFile[] = model.sections.map(section => ({
    name: section.key,
    json: buildSectionJson(section, state[section.key] ?? {}),
  }))

  const options: Record<string, unknown> = {}
  for (const field of model.storage.optionFields[storageType] ?? []) {
    options[field.key] = coerce(field, storageOptions[storageType]?.[field.key] ?? field.def)
  }

  files.push({ name: 'storage.json', json: { Type: storageType, Options: options } })
  return files
}

/* -------------------------------------------------------------------------- */
/* v1 `.env` rendering + import (used only by the v1 panel)                   */
/* -------------------------------------------------------------------------- */

function formatValue(field: Field, value: string | number | boolean | undefined): string {
  const v = value ?? field.def
  if (field.kind === 'bool') return v === true ? 'true' : 'false'
  if (field.kind === 'int') {
    const text = String(v).trim()
    if (!text) return ''
    const n = Number.parseInt(text, 10)
    return Number.isFinite(n) ? String(n) : String(field.def)
  }
  if (field.kind === 'json') {
    const text = String(v ?? '').trim()
    if (!text) return ''
    try {
      return JSON.stringify(JSON.parse(text))
    } catch {
      return text
    }
  }
  const text = String(v ?? '')
  // dotenv treats `#` as the start of a comment, so quote such values.
  if (text.includes('#') || text !== text.trim()) return JSON.stringify(text)
  return text
}

/** Render the current form state as `.env` text. */
export function serializeEnv(
  groups: Group[],
  state: Record<string, string | number | boolean>
): string {
  const lines: string[] = ['# g0v0-server v1 configuration (.env)', '']
  for (const group of groups) {
    lines.push(`# ${group.name}`)
    for (const field of group.fields) {
      lines.push(`${field.key}=${formatValue(field, state[field.key])}`)
    }
    lines.push('')
  }
  return `${lines.join('\n').trimEnd()}\n`
}

function toTypedValue(field: Field, raw: string): string | number | boolean {
  if (field.kind === 'bool') return ['true', '1', 'yes', 'on'].includes(raw.toLowerCase())
  if (field.kind === 'json' && raw.trim() !== '') {
    try {
      return JSON.stringify(JSON.parse(raw))
    } catch {
      return raw
    }
  }
  return raw
}

/**
 * Fill the form from pasted `.env` text. Only known keys (and their aliases)
 * are applied, so unknown lines are ignored instead of creating stray fields.
 */
export function applyEnvText(
  groups: Group[],
  state: Record<string, string | number | boolean>,
  text: string
): number {
  const env = parseEnv(text)
  let applied = 0
  for (const group of groups) {
    for (const field of group.fields) {
      const key = [field.key, ...field.aliases].find(k => env[k] !== undefined)
      if (key === undefined) continue
      state[field.key] = toTypedValue(field, env[key])
      applied++
    }
  }
  return applied
}

/** Simple `.env` syntax highlighting matching the site's code block palette. */
export function highlightEnv(text: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return text
    .split('\n')
    .map(line => {
      const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line)
      if (match) {
        return `<span class="tok-key">${escape(match[1])}</span>=<span class="tok-str">${escape(
          match[2]
        )}</span>`
      }
      if (line.startsWith('#')) return `<span class="tok-comment">${escape(line)}</span>`
      return escape(line)
    })
    .join('\n')
}

/* -------------------------------------------------------------------------- */
/* v2 reference page rows (v2 配置 / v2 Configurations)                        */
/* -------------------------------------------------------------------------- */

export interface V2FieldRow {
  path: string
  kind: FieldKind
  /** display value for the type column; defaults to `kind` */
  typeText?: string
  description: string
  defaultText: string
}

export interface V2FieldGroup {
  /** group heading inside the table (storage backends); `null` for plain rows */
  title: string | null
  fields: V2FieldRow[]
}

export interface V2SectionRow {
  file: string
  title: string
  description: string | null
  groups: V2FieldGroup[]
}

/** How the default is displayed: nullable empty strings are written as `null`. */
function defaultText(field: Field): string {
  if (field.def === '') return field.nullable ? 'null' : '""'
  if (field.def === null) return 'null'
  return String(field.def)
}

function buildFieldRow(field: Field, fileTrans: Record<string, string>): V2FieldRow {
  return {
    path: field.key,
    kind: field.kind,
    typeText: field.type || field.kind,
    description: fileTrans[field.key] ?? field.key,
    defaultText: defaultText(field),
  }
}

function buildSectionRow(section: Group, fileTrans: Record<string, string>): V2SectionRow {
  return {
    file: section.key,
    title: fileTrans.$name ? `${section.key} — ${fileTrans.$name}` : section.key,
    description: fileTrans.$description ?? null,
    groups: [{ title: null, fields: section.fields.map(field => buildFieldRow(field, fileTrans)) }],
  }
}

/** Merge the v2 definition + locale translations into reference-page rows. */
export function buildV2Reference(definition: Definition, trans: Labels): V2SectionRow[] {
  const model = buildV2Model(definition, trans)
  const rows = model.sections.map(section => buildSectionRow(section, trans[section.key] ?? {}))
  const fileTrans = trans['storage.json'] ?? {}
  rows.push({
    file: 'storage.json',
    title: fileTrans.$name ? `storage.json — ${fileTrans.$name}` : 'storage.json',
    description: fileTrans.$description ?? null,
    groups: [
      {
        title: null,
        fields: [buildFieldRow(model.storage.typeField, fileTrans)],
      },
      ...model.storage.types.map(type => ({
        title: model.storage.typeLabels[type] ?? type,
        fields: (model.storage.optionFields[type] ?? []).map(field =>
          buildFieldRow(field, fileTrans)
        ),
      })),
    ],
  })
  return rows
}
