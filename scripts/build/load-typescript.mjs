import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

/** Offline trusted project modules only. Script JSON is parsed as data, never evaluated. */
export function createTypescriptLoader() {
  const cache = new Map()
  function load(file) {
    file = resolve(file)
    if (cache.has(file)) return cache.get(file)
    if (file.endsWith('.json')) {
      const data = JSON.parse(readFileSync(file, 'utf8'))
      cache.set(file, data)
      return data
    }
    const output = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      transformers: { before: [(context) => {
        const visit = (node) => ts.isMetaProperty(node) && node.keywordToken === ts.SyntaxKind.ImportKeyword
          ? ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment('env', ts.factory.createObjectLiteralExpression()),
            ts.factory.createPropertyAssignment('url', ts.factory.createStringLiteral(pathToFileURL(file).href)),
          ])
          : ts.visitEachChild(node, visit, context)
        return (node) => ts.visitNode(node, visit)
      }] },
    }).outputText
    const exports = {}
    cache.set(file, exports)
    try {
      runInNewContext(output, { exports, URL, structuredClone, require(id) {
        if (!id.startsWith('.')) throw new Error('Offline loader only accepts relative project modules')
        const base = resolve(dirname(file), id)
        const target = [base, base + '.ts', base + '.tsx', base + '.json', resolve(base, 'index.ts')]
          .find((candidate) => /\.(?:tsx?|json)$/.test(candidate) && existsSync(candidate))
        if (!target) throw new Error('Missing offline project module: ' + id)
        return load(target)
      } })
    } catch (error) {
      cache.delete(file)
      throw error
    }
    return exports
  }
  return load
}
