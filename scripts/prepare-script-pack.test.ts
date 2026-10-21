import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { createTypescriptLoader } from './build/load-typescript.mjs'
import { verifyRoleDefinitionPins } from './build/role-definition-pins.mjs'
import { prepareScriptPack, projectContext, writePreparedScript } from './prepare-script-pack.mjs'

let context: ReturnType<typeof projectContext>
const temporary = mkdtempSync(join(tmpdir(), 'botc-role-preparation-'))
beforeAll(() => { context = projectContext(process.cwd()) }, 30000)
afterAll(() => { rmSync(temporary, { recursive: true, force: true }) })
const input = () => {
  const source = context.packs.find((pack) => pack.scriptId === 'trouble-brewing')!
  return { scriptId: 'shared-preparation-example', displayName: 'Shared preparation example',
    source: { url: 'https://scripts.example.org/example', contentHash: 'sha256:' + 'e'.repeat(64), verifiedAt: '2026-10-21' },
    roleRefs: source.roles.map((role) => ({ id: role.id, sourceId: source.scriptId, sourceVersion: source.source.contentHash })),
    templateSources: [source.scriptId], setupRules: source.setupRules,
  }
}

describe('offline referenced script preparation', () => {
  it('reuses all known definitions and actual eligible templates without registering a board', () => {
    const before = JSON.stringify(context.packs), source = input()
    const result = prepareScriptPack(source, context)
    expect(result.report.registered).toBe(false)
    expect(result.report.templateCount).toBe(22)
    expect(result.report.missingTemplateCounts).toEqual([])
    expect(result.definition.setupTemplates.every((template) => template.verified === false)).toBe(true)
    expect(result.definition.knowledgeStatus).toBe('needs-review')
    expect(result.definition.roleRefs.every((ref) => ref.sourceId && ref.sourceVersion)).toBe(true)
    expect(JSON.stringify(context.packs)).toBe(before)
    expect(source.scriptId).toBe('shared-preparation-example')
  }, 30000)
  it('uses shared canonical defaults instead of guessing among translated legacy copies', () => {
    const result = prepareScriptPack({ ...input(), roleRefs: ['chef', 'empath', 'imp', 'monk'], playerCounts: [7] }, context)
    expect(result.report.roleCount).toBe(4)
    expect(result.report.missingTemplateCounts).toEqual([{ playerCount: 7, missing: 3 }])
    expect(result.definition.setupTemplates).toEqual([])
  })
  it('rejects unknown roles and explicit stale source versions before writing a draft', () => {
    expect(() => prepareScriptPack({ ...input(), roleRefs: ['unknown-author-role'] }, context)).toThrow()
    expect(() => prepareScriptPack({ ...input(), roleRefs: [{ id: 'chef', sourceId: 'trouble-brewing', sourceVersion: 'stale' }] }, context)).toThrow()
    expect(() => prepareScriptPack({ ...input(), templateSources: ['unknown-script'] }, context)).toThrow('模板来源')
  })
  it('preserves explicit source orders and never manufactures templates for custom roles', () => {
    const custom = context.library.all().find((row) => row.role.id === 'pinuocao')!
    expect(custom).toBeTruthy()
    const roleRefs = [{ id: custom.role.id, sourceId: custom.sourceId, sourceVersion: custom.sourceVersion }]
    expect(() => prepareScriptPack({ ...input(), roleRefs }, context)).toThrow('自制')
    const orders = { firstNight: [{ roleId: custom.role.id, order: 1, knowledgeStatus: 'confirmed' }], otherNight: [] }
    const prepared = prepareScriptPack({ ...input(), roleRefs, nightOrders: orders }, context)
    expect(prepared.definition.nightOrders).toEqual(orders)
    expect(prepared.report.templateCount).toBe(0)
  })
  it('writes source references and review metadata without copying ability text or replacing a directory', () => {
    const prepared = prepareScriptPack(input(), context), output = resolve(temporary, 'draft')
    const result = writePreparedScript(output, prepared, context)
    const source = readFileSync(join(output, 'index.ts'), 'utf8')
    expect(source).toContain('../../role-library/')
    expect(source).not.toContain('../../packs/')
    expect(source).not.toContain('abilityText')
    expect(JSON.parse(readFileSync(join(output, 'definition.json'), 'utf8')).roleRefs).toEqual(prepared.definition.roleRefs)
    expect(result.registered).toBe(false)
    const exports: Record<string, unknown> = {}, load = createTypescriptLoader()
    const compiled = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } }).outputText
    runInNewContext(compiled, { exports, require(id: string) {
      if (id === './definition.json') return prepared.definition
      if (!id.startsWith('../../')) throw new Error('Unexpected generated import')
      return load(resolve(process.cwd(), 'src/domain/scripts', id.slice(6) + '.ts'))
    } })
    const roundtrip = exports[result.exportName] as { roles: { id: string; abilityText: string }[]; knowledgeStatus: string }
    expect(roundtrip.roles.map((role) => role.id)).toEqual(prepared.definition.roleRefs.map((ref) => ref.id))
    expect(roundtrip.knowledgeStatus).toBe('needs-review')
    expect(() => verifyRoleDefinitionPins(prepared.definition, roundtrip.roles)).not.toThrow()
    const updatedLibrary = roundtrip.roles.map((role, index) => index ? role : { ...role, abilityText: 'A changed definition under the same source version.' })
    expect(() => verifyRoleDefinitionPins(prepared.definition, updatedLibrary)).toThrow('角色资料已变化')
    expect(() => verifyRoleDefinitionPins({ ...prepared.definition, roleDefinitionHashes: undefined }, roundtrip.roles)).toThrow('缺少指纹')
    expect(() => writePreparedScript(output, prepared, context)).toThrow('不会覆盖')
  })
  it('does not create a partial output for an invalid role origin', () => {
    const prepared = prepareScriptPack(input(), context), output = resolve(temporary, 'invalid')
    expect(() => writePreparedScript(output, prepared, { ...context, originModules: new Map() })).toThrow('安全导入')
    expect(existsSync(output)).toBe(false)
  })
  it('rejects repeated non-repeatable roles and evil or already-present demon bluffs', () => {
    const template = { templateId: 'invalid', scriptId: 'old', playerCount: 7, style: 'balanced',
      roles: ['chef', 'chef', 'chef', 'chef', 'chef', 'poisoner', 'imp'],
      bluffs: ['empath', 'monk', 'mayor'], notes: [], verified: true }
    expect(prepareScriptPack({ ...input(), playerCounts: [7], setupTemplates: [template] }, context).report.templateCount).toBe(0)
    const original = context.packs.find((pack) => pack.scriptId === 'trouble-brewing')!.setupTemplates.find((item) => item.playerCount === 7)!
    expect(prepareScriptPack({ ...input(), playerCounts: [7], setupTemplates: [{ ...original, bluffs: ['imp', 'spy', 'baron'] }] }, context).report.templateCount).toBe(0)
    expect(prepareScriptPack({ ...input(), playerCounts: [7], setupTemplates: [{ ...original, bluffs: original.roles.slice(0, 3) }] }, context).report.templateCount).toBe(0)
  })
})
