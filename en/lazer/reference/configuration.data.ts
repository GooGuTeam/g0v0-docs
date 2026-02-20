import path from 'path'
import fs from 'fs'
import { createMarkdownRenderer } from 'vitepress'

export default {
  watch: ['./data/configuration/en.js', './data/configuration/definition.json'],
  async load() {
    const md = await createMarkdownRenderer(process.cwd(), {}, '/')
    const langPath = path.resolve(`./data/configuration/en.js`)
    const definitionPath = path.resolve(`./data/configuration/definition.json`)
    const lang = (await import(/* @vite-ignore */ `${langPath}?t=${Date.now()}`)).default

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
