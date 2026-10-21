import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { compactScriptText, createScriptTextPool, renderScriptTextPool, scriptTextModule } from './compact-script-text.ts'

/** Build-only compression generated from the actual packs, never a second knowledge source. */
export function scriptTextPlugin(): Plugin {
  let roots: string[] = []
  let pool = new Map<string, string>()
  const files = new Set<string>()
  const normalized = (path: string) => path.replaceAll('\\', '/')
  return {
    name: 'botc-compact-script-text',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) { roots = ['packs', 'role-library'].map((directory) => resolve(config.root, 'src/domain/scripts', directory)) },
    async buildStart() {
      files.clear()
      const paths = (await Promise.all(roots.map(async (root) => (await readdir(root, { recursive: true }))
        .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts')).sort().map((name) => resolve(root, name))))).flat()
      const sources = await Promise.all(paths.map(async (file) => {
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
