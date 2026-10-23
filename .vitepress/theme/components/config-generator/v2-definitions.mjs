/**
 * Loads and merges every `*.json` definition file in the v2 `definitions/`
 * folder into one definition object.
 *
 * Each json file contributes top-level sections keyed by config file name
 * (e.g. `general.json`, `realtime.json`). `common.json` is merged first so
 * that more specific files (sorted alphabetically afterwards) keep a stable
 * section order; duplicate section keys are overridden by later files.
 *
 * This helper is only imported by VitePress data loaders (node context), so it
 * stays plain ESM with node builtins only.
 */
import fs from 'node:fs/promises'
import path from 'node:path'

export async function loadV2Definitions(dir) {
  const files = (await fs.readdir(dir)).filter(file => file.endsWith('.json'))
  files.sort((a, b) => (a === 'common.json' ? -1 : b === 'common.json' ? 1 : a < b ? -1 : 1))

  const merged = {}
  for (const file of files) {
    Object.assign(merged, JSON.parse(await fs.readFile(path.join(dir, file), 'utf-8')))
  }
  return merged
}
