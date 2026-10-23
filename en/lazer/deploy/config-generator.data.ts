import fs from 'fs'
import path from 'path'

// Schema + English labels used by the manual config generator (v1 `.env` form).
// The same data drives the “Configurations” reference page. v2 uses its own
// definitions (`data/v2-configuration/definitions/*.json`) + labels, loaded
// here too.
export default {
  watch: [
    '../../data/configuration/en.js',
    '../../data/configuration/definition.json',
    '../../data/v2-configuration/en.js',
    '../../data/v2-configuration/definitions/*.json',
  ],
  async load() {
    const definitionPath = path.resolve('./data/configuration/definition.json')
    const labelsPath = path.resolve('./data/configuration/en.js')
    const v2LabelsPath = path.resolve('./data/v2-configuration/en.js')
    const labels = (await import(/* @vite-ignore */ `${labelsPath}?t=${Date.now()}`)).default
    const v2Labels = (await import(/* @vite-ignore */ `${v2LabelsPath}?t=${Date.now()}`)).default
    const { loadV2Definitions } = await import(
      /* @vite-ignore */ `${path.resolve('./.vitepress/theme/components/config-generator/v2-definitions.mjs')}?t=${Date.now()}`
    )
    return {
      definition: JSON.parse(await fs.promises.readFile(definitionPath, 'utf-8')),
      labels,
      v2Definition: await loadV2Definitions(path.resolve('./data/v2-configuration/definitions')),
      v2Labels,
    }
  },
}
