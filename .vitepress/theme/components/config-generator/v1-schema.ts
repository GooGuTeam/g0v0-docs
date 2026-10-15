/**
 * g0v0-server v1 `.env` configuration model used by the manual config generator.
 *
 * The schema comes from `data/configuration/definition.json`, the same file the
 * "配置 / Configurations" reference page is built from, and the labels come from
 * `data/configuration/<locale>.js`.
 */

import { parseEnv } from '../config-converter/convert'

export type V1Kind = 'string' | 'int' | 'bool' | 'enum' | 'json'

/** Booleans are kept as booleans, everything else as raw input text. */
export type V1Value = string | boolean

export interface V1Field {
  key: string
  kind: V1Kind
  /** raw `$type` from the definition, shown as a hint */
  type: string
  enumValues?: string[]
  aliases: string[]
  label: string
  def: V1Value
}

export interface V1Group {
  key: string
  name: string
  description?: string
  fields: V1Field[]
}

interface DefinitionField {
  $type: string
  $default: unknown
  $aliases?: string[]
}

interface Definition {
  [group: string]: { [field: string]: DefinitionField | unknown }
}

type Labels = Record<string, Record<string, string>>

export type V1Definition = Definition

function parseKind(type: string): { kind: V1Kind; enumValues?: string[] } {
  if (type === 'string') return { kind: 'string' }
  if (type === 'integer') return { kind: 'int' }
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

function toFormValue(kind: V1Kind, value: unknown): V1Value {
  if (kind === 'bool') return value === true
  if (value === null || value === undefined) return ''
  if (kind === 'json') return JSON.stringify(value)
  return String(value)
}

/** Build the grouped v1 form model from the definition + locale labels. */
export function buildV1Groups(definition: Definition, labels: Labels): V1Group[] {
  const groups: V1Group[] = []
  for (const [groupKey, rawFields] of Object.entries(definition)) {
    if (groupKey.startsWith('$')) continue
    const groupLabels = labels[groupKey] ?? {}
    const fields: V1Field[] = []
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

export function createV1State(groups: V1Group[]): Record<string, V1Value> {
  const state: Record<string, V1Value> = {}
  for (const group of groups) {
    for (const field of group.fields) state[field.key] = field.def
  }
  return state
}

function formatValue(field: V1Field, value: V1Value | undefined): string {
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
export function serializeEnv(groups: V1Group[], state: Record<string, V1Value>): string {
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

function toTypedValue(field: V1Field, raw: string): V1Value {
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
  groups: V1Group[],
  state: Record<string, V1Value>,
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
