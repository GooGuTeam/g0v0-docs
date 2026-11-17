import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'
import { createMarkdownRenderer } from 'vitepress'

// 路径相对本文件（src/lazer/reference），指向 srcDir 内的 src/data
const dataDir = path.resolve(__dirname, '../../data')

export default {
  watch: ['../../data/configuration/zh-CN.js', '../../data/configuration/definition.json'],
  async load() {
    const md = await createMarkdownRenderer(process.cwd(), {}, '/')
    const langPath = path.join(dataDir, 'configuration/zh-CN.js')
    const definitionPath = path.join(dataDir, 'configuration/definition.json')
    const lang = (
      await import(/* @vite-ignore */ `${pathToFileURL(langPath).href}?t=${Date.now()}`)
    ).default

    for (const key in lang) {
      const item = lang[key]
      if (item.$description) {
        item.$description = md.render(item.$description)
      }
    }
    return {
      trans: lang,
      definition: JSON.parse(await fs.promises.readFile(definitionPath, 'utf-8')),
    }
  },
}
