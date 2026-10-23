import path from 'path'
import { createMarkdownRenderer } from 'vitepress'

export default {
  watch: ['../../data/v2-configuration/zh-CN.js', '../../data/v2-configuration/definitions/*.json'],
  async load() {
    const md = await createMarkdownRenderer(process.cwd(), {}, '/')
    const langPath = path.resolve(`./data/v2-configuration/zh-CN.js`)
    const lang = (await import(/* @vite-ignore */ `${langPath}?t=${Date.now()}`)).default
    const { loadV2Definitions } = await import(
      /* @vite-ignore */ `${path.resolve('./.vitepress/theme/components/config-generator/v2-definitions.mjs')}?t=${Date.now()}`
    )

    for (const key in lang) {
      const item = lang[key]
      if (item.$description) {
        item.$description = md.render(item.$description)
      }
    }
    return {
      definition: await loadV2Definitions(path.resolve('./data/v2-configuration/definitions')),
      trans: lang,
    }
  },
}
