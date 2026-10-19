import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { compactScriptText, createScriptTextPool, renderScriptTextPool, scriptTextModule } from './compact-script-text.ts'

/** Build-only compression generated from the actual packs, never a second knowledge source. */
export function scriptTextPlugin(): Plugin {
  let root = ''
  let pool = new Map<string, string>()
  const files = new Set<string>()
  const normalized = (path: string) => path.replaceAll('\\', '/')
  return {
    name: 'botc-compact-script-text',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) { root = resolve(config.root, 'src/domain/scripts/packs') },
    async buildStart() {
      files.clear()
      const names = (await readdir(root, { recursive: true })).filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts')).sort()
      const sources = await Promise.all(names.map(async (name) => {
        const file = resolve(root, name)
        files.add(normalized(file))
        this.addWatchFile(file)
        return readFile(file, 'utf8')
      }))
      pool = createScriptTextPool(sources)
    },
    resolveId(id) { if (id === scriptTextModule) return `\0${scriptTextModule}` },
    load(id) { if (id === `\0${scriptTextModule}`) return renderScriptTextPool(pool) },
    transform(code, id) {
      if (!files.has(normalized(id))) return null
      const compacted = compactScriptText(code, pool)
      return compacted ? { code: compacted, map: null } : null
    },
  }
}
