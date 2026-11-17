import path from 'path'
import { pathToFileURL } from 'url'
import { createMarkdownRenderer } from 'vitepress'

// 路径相对本文件（src/lazer/reference），指向 srcDir 内的 src/data
const dataDir = path.resolve(__dirname, '../../data')

export default {
  watch: ['../../data/v2-configuration/zh-CN.js', '../../data/v2-configuration/definitions/*.json'],
  async load() {
    const md = await createMarkdownRenderer(process.cwd(), {}, '/')
    const langPath = path.join(dataDir, 'v2-configuration/zh-CN.js')
    const lang = (
      await import(/* @vite-ignore */ `${pathToFileURL(langPath).href}?t=${Date.now()}`)
    ).default
    const { loadV2Definitions } = await import(
      /* @vite-ignore */ `${pathToFileURL(path.resolve(__dirname, '../../../.vitepress/theme/components/config-generator/v2-definitions.mjs')).href}?t=${Date.now()}`
    )

    for (const key in lang) {
      const item = lang[key]
      if (item.$description) {
        item.$description = md.render(item.$description)
      }
    }
    return {
      definition: await loadV2Definitions(path.join(dataDir, 'v2-configuration/definitions')),
      trans: lang,
    }
  },
}
