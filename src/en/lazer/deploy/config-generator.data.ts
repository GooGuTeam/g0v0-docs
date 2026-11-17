import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

// 路径相对本文件（src/en/lazer/deploy），指向 srcDir 内的 src/data
const dataDir = path.resolve(__dirname, '../../../data')

// Schema + English labels used by the manual config generator (v1 `.env` form).
// The same data drives the “Configurations” reference page. v2 uses its own
// definitions (`data/v2-configuration/definitions/*.json`) + labels, loaded
// here too.
export default {
  watch: [
    '../../../data/configuration/en.js',
    '../../../data/configuration/definition.json',
    '../../../data/v2-configuration/en.js',
    '../../../data/v2-configuration/definitions/*.json',
  ],
  async load() {
    const definitionPath = path.join(dataDir, 'configuration/definition.json')
    const labelsPath = path.join(dataDir, 'configuration/en.js')
    const v2LabelsPath = path.join(dataDir, 'v2-configuration/en.js')
    const labels = (
      await import(/* @vite-ignore */ `${pathToFileURL(labelsPath).href}?t=${Date.now()}`)
    ).default
    const v2Labels = (
      await import(/* @vite-ignore */ `${pathToFileURL(v2LabelsPath).href}?t=${Date.now()}`)
    ).default
    const { loadV2Definitions } = await import(
      /* @vite-ignore */ `${pathToFileURL(path.resolve(__dirname, '../../../../.vitepress/theme/components/config-generator/v2-definitions.mjs')).href}?t=${Date.now()}`
    )
    return {
      definition: JSON.parse(await fs.promises.readFile(definitionPath, 'utf-8')),
      labels,
      v2Definition: await loadV2Definitions(path.join(dataDir, 'v2-configuration/definitions')),
      v2Labels,
    }
  },
}
