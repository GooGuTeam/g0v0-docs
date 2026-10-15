import fs from 'fs'
import path from 'path'

// Schema + Chinese labels used by the manual config generator (v1 `.env` form).
// The same data drives the “配置” reference page.
export default {
  watch: ['./data/configuration/zh-CN.js', './data/configuration/definition.json'],
  async load() {
    const definitionPath = path.resolve('./data/configuration/definition.json')
    const labelsPath = path.resolve('./data/configuration/zh-CN.js')
    const labels = (await import(/* @vite-ignore */ `${labelsPath}?t=${Date.now()}`)).default
    return {
      definition: JSON.parse(await fs.promises.readFile(definitionPath, 'utf-8')),
      labels,
    }
  },
}
