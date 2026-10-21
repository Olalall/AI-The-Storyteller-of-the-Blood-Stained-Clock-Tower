// @vitest-environment node
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { expect, test } from 'vitest'
import ts from 'typescript'
import { scriptManifest } from '../../src/domain/scripts/scriptManifest.generated'
import { scriptAssetProjection } from '../../src/domain/scripts/scriptAssets.generated'
import { projectCharacterAssetPack } from '../../src/services/assets/assetPackService'
import { normalizeImportedPack } from '../../src/domain/scripts/normalizeImportedPack'
import type { SmartScriptPack } from '../../src/domain/scripts/types'
import { smartScriptPacks } from '../../src/domain/scripts/catalog'
import { compactScriptText, createScriptTextPool, renderScriptTextPool, scriptTextModule } from './compact-script-text'

function execute(code: string, requireModule: (id: string) => unknown = () => ({})) {
  const output = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
  const exports = {}
  runInNewContext(output, { exports, require: requireModule, URL })
  return exports as Record<string, unknown>
}

function createPooledScriptLoader(files: readonly string[], pool = createScriptTextPool(files.map((file) => readFileSync(file, 'utf8')))) {
  const fileSet = new Set(files)
  const textExports = execute(renderScriptTextPool(pool))
  const cache = new Map<string, Record<string, unknown>>()
  function load(file: string): Record<string, unknown> {
    const cached = cache.get(file)
    if (cached) return cached
    const source = readFileSync(file, 'utf8')
    // Match Node's JSON require shape; TypeScript supplies default import interop.
    if (file.endsWith('.json')) {
      const exports = JSON.parse(source)
      cache.set(file, exports)
      return exports
    }
    const transformed = fileSet.has(file) ? compactScriptText(source, pool) ?? source : source
    const exports = execute(transformed, (id) => {
      if (id === scriptTextModule) return textExports
      const path = resolve(dirname(file), id)
      const target = [path, `${path}.ts`, `${path}.json`, resolve(path, 'index.ts')]
        .find((candidate) => /\.(?:ts|json)$/.test(candidate) && existsSync(candidate))
      if (!target) throw new Error(`Missing pooled test module: ${id}`)
      return load(target)
    })
    cache.set(file, exports)
    return exports
  }
  return load
}

test('pooling preserves escaped Unicode and excludes property names, imports and types', () => {
  const text = '一段重复的角色说明，包含换行\n引号"以及反斜杠\\，不应被改变。'
  const literal = JSON.stringify(text)
  const source = `const __botcPackText = 1; type T = ${literal}; export const data = { [${literal}]: [${literal}, ${literal}], value: ${literal}, marker: __botcPackText };`
  const pool = createScriptTextPool([source])
  expect(pool.size).toBe(1)
  const compacted = compactScriptText(source, pool)!
  expect(compacted).toContain(`type T = ${literal}`)
  expect(compacted).toContain(`[${literal}]:`)
  const before = execute(source)
  const after = execute(compacted, () => execute(renderScriptTextPool(pool)))
  expect(JSON.stringify(after)).toBe(JSON.stringify(before))
  expect(compactScriptText('export const value = "short"', pool)).toBeNull()
})

test('every registered production pack retains all data after text pooling', () => {
  const files = ['packs', 'role-library'].flatMap((directory) => {
    const root = resolve('src/domain/scripts', directory)
    return readdirSync(root, { recursive: true }).map(String).filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts')).sort().map((name) => resolve(root, name))
  })
  const load = createPooledScriptLoader(files)
  const pooled = load(resolve('src/domain/scripts/allPacks.ts')).smartScriptPacks as SmartScriptPack[]
  const actual = pooled.map(normalizeImportedPack)
  expect(smartScriptPacks).toHaveLength(scriptManifest.length)
  expect(JSON.parse(JSON.stringify(actual))).toEqual(JSON.parse(JSON.stringify(smartScriptPacks)))
}, 30_000)

test('thin pack JSON metadata and official night data survive the pooled module loader', () => {
  const root = resolve('src/domain/scripts/packs/wen-run-liang-ye')
  const index = resolve(root, 'index.ts')
  const definition = resolve(root, 'definition.json')
  const nightSheet = resolve('src/features/night-workbench/data/official/nightsheet.json')
  const load = createPooledScriptLoader([index])
  expect(load(definition)).toEqual(JSON.parse(readFileSync(definition, 'utf8')))
  expect(load(nightSheet)).toEqual(JSON.parse(readFileSync(nightSheet, 'utf8')))
  const pooled = load(index).preparedWenRunLiangYeSmartScriptPack as SmartScriptPack
  const original = smartScriptPacks.find((pack) => pack.scriptId === 'wen-run-liang-ye')
  expect(JSON.parse(JSON.stringify(normalizeImportedPack(pooled)))).toEqual(JSON.parse(JSON.stringify(original)))
})


test('generated list and icon projection match complete source packs', () => {
  expect(scriptManifest).toEqual(smartScriptPacks.map(({ scriptId, displayName, playerCounts, knowledgeStatus }) => ({ scriptId, displayName, playerCounts, knowledgeStatus })))
  expect(scriptAssetProjection).toEqual(projectCharacterAssetPack(smartScriptPacks))
})
