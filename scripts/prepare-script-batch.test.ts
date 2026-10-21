import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createBatchContext, prepareScriptBatch, writeScriptBatch } from './prepare-script-batch.mjs'

const temporary = mkdtempSync(join(tmpdir(), 'botc-batch-intake-'))
let context: ReturnType<typeof createBatchContext>
beforeAll(() => { context = createBatchContext(process.cwd()); mkdirSync(join(temporary, 'sources')) }, 30000)
afterAll(() => { rmSync(temporary, { recursive: true, force: true }) })
let number = 0
function input() {
  const pack = context.packs.find((entry) => entry.scriptId === 'trouble-brewing')!
  const scriptId = `batch-fixture-${++number}`
  const source = JSON.stringify([{ id: '_meta', name: scriptId }, ...pack.roles.map((role) => role.id)])
  writeFileSync(join(temporary, 'sources', `${scriptId}.json`), source)
  return { scriptId, displayName: scriptId, sourceFile: `sources/${scriptId}.json`,
    source: { url: 'https://scripts.example.org/source', contentHash: `sha256:${createHash('sha256').update(source).digest('hex')}`, verifiedAt: '2026-10-21' },
    roleRefs: pack.roles.map((role) => ({ id: role.id, sourceId: pack.scriptId, sourceVersion: pack.source.contentHash })),
    templateSources: [pack.scriptId], setupRules: pack.setupRules,
  }
}

describe('batched source preparation and production validation', () => {
  it('shares one context, checks actual candidates and both night queues, and keeps output unapproved', () => {
    const first = input(), second = input(), before = JSON.stringify(context.packs)
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No network in intake'))
    try {
      const result = prepareScriptBatch({ scripts: [first, second] }, temporary, context)
      expect(result.report.scripts).toHaveLength(2)
      expect(result.report.scripts.every((row) => row.automaticChecksPassed), JSON.stringify(result.report.scripts)).toBe(true)
      expect(result.report.productionCandidatesChecked).toBe(44)
      expect(result.report.nightQueuesChecked).toBe(88)
      expect(result.report.registered).toBe(false)
      expect(result.report.reviewRequired).toBe(true)
      expect(result.report.liveAiExecuted).toBe(false)
      expect(result.report.browserExecuted).toBe(false)
      expect(result.report.roleReviewGroups.length).toBe(first.roleRefs.length)
      expect(result.report.roleReviewGroups.every((group) => group.scriptIds.length === 2)).toBe(true)
      expect(JSON.stringify(context.packs)).toBe(before)
      expect(network).not.toHaveBeenCalled()
      for (const row of result.prepared) {
        expect(row.pack.definition.knowledgeStatus).toBe('needs-review')
        expect(row.pack.definition.setupTemplates.every((template) => !template.verified)).toBe(true)
      }
    } finally { network.mockRestore() }
  }, 30000)

  it('isolates an invalid source without falsely passing it or losing the other draft', () => {
    const bad = input(), good = input()
    bad.source.contentHash = `sha256:${'0'.repeat(64)}`
    const result = prepareScriptBatch({ scripts: [bad, good] }, temporary, context)
    expect(result.report.scripts[0]).toMatchObject({ scriptId: bad.scriptId, automaticChecksPassed: false })
    expect(result.report.scripts[0].error).toMatch(/原文字节|哈希/)
    expect(result.report.scripts[1].automaticChecksPassed).toBe(true)
    expect(result.prepared).toHaveLength(1)
    expect(result.report.automaticChecksPassed).toBe(false)
  }, 30000)

  it('rejects duplicate or registered IDs before producing output', () => {
    const row = input()
    expect(() => prepareScriptBatch({ scripts: [row, row] }, temporary, context)).toThrow(/重复/)
    expect(() => prepareScriptBatch({ scripts: [{ ...row, scriptId: 'trouble-brewing' }] }, temporary, context)).toThrow(/已注册/)
    expect(() => prepareScriptBatch({ scripts: [{ ...row, scriptId: '../escape' }] }, temporary, context)).toThrow(/ID/)
    expect(() => prepareScriptBatch({ scripts: [{ ...row, source: context.packs[0].source }] }, temporary, context)).toThrow(/原文已经注册/)
  })

  it.each(['../outside.json', 'sources/../../outside.json'])('does not follow a source path outside the manifest directory: %s', (sourceFile) => {
    const result = prepareScriptBatch({ scripts: [{ ...input(), sourceFile }] }, temporary, context)
    expect(result.report.scripts[0].automaticChecksPassed).toBe(false)
    expect(result.report.scripts[0].error).toMatch(/原文路径/)
    expect(result.prepared).toEqual([])
  })

  it('blocks wrong source roster cardinality and unknown role definitions', () => {
    const wrongCount = input(), unknown = input()
    wrongCount.roleRefs = wrongCount.roleRefs.slice(1)
    unknown.roleRefs[0] = { id: 'unreviewed-new-role', sourceId: 'missing', sourceVersion: 'missing' }
    const result = prepareScriptBatch({ scripts: [wrongCount, unknown] }, temporary, context)
    expect(result.report.scripts.every((row) => !row.automaticChecksPassed)).toBe(true)
    expect(result.prepared).toEqual([])
  })

  it('rejects a missing official wake instead of approving a sorted but incomplete night', () => {
    const row = input(), original = context.packs.find((entry) => entry.scriptId === 'trouble-brewing')!
    const nightOrders = { ...original.nightOrders, firstNight: original.nightOrders.firstNight.slice(1) }
    const result = prepareScriptBatch({ scripts: [{ ...row, nightOrders }] }, temporary, context)
    expect(result.report.scripts[0]).toMatchObject({ automaticChecksPassed: false })
    expect(result.report.scripts[0].error).toMatch(/夜序|夜表/)
  })

  it('reuses count facts once per role and passes every template through production guards', () => {
    const row = { ...input(), setupTemplates: [], fillTemplateGaps: true }
    const result = prepareScriptBatch({ scripts: [row] }, temporary, context)
    expect(result.report.scripts[0], JSON.stringify(result.report.scripts[0])).toMatchObject({ automaticChecksPassed: true, templateCount: 22, missingTemplateCounts: [] })
    expect(result.report.productionCandidatesChecked).toBe(22)
    const definition = result.prepared[0].pack.definition
    expect(new Set(definition.setupTemplates.map((template) => JSON.stringify([template.playerCount, [...template.roles].sort()]))).size).toBe(22)
    expect(definition.setupTemplates.every((template) => !template.verified)).toBe(true)
    const selectedRuleIds = new Set(definition.setupTemplates.flatMap((template) => template.setupAdjustments.map((entry) => entry.ruleId)))
    expect([...selectedRuleIds].filter((id) => /baron/.test(id))).toHaveLength(1)
    expect(result.report.scripts[0].reviewRequired).toBe(true)
  }, 30000)

  it('preserves original source bytes and never overwrites a previous batch', () => {
    const row = input()
    const raw = JSON.parse(readFileSync(join(temporary, row.sourceFile), 'utf8'))
    raw[0].state = [{ stateName: '作者规则', stateDescription: '须单独核实，不能只读states字段。' }]
    const bytes = Buffer.from(JSON.stringify(raw) + '\r\n')
    writeFileSync(join(temporary, row.sourceFile), bytes)
    row.source.contentHash = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
    const result = prepareScriptBatch({ scripts: [row] }, temporary, context)
    const output = join(temporary, 'out')
    writeScriptBatch(output, result, context)
    expect(readFileSync(join(output, row.scriptId, 'source.json'))).toEqual(readFileSync(join(temporary, row.sourceFile)))
    const lock = JSON.parse(readFileSync(join(output, row.scriptId, 'source-lock.json'), 'utf8'))
    expect(lock.rawJsonSha256).toBe(row.source.contentHash.slice(7))
    expect(lock.roleAliases).toHaveLength(row.roleRefs.length)
    expect(lock.authorSpecialRules).toEqual(raw[0].state)
    expect(lock.authorMetadata).toEqual(raw[0])
    expect(readFileSync(join(output, row.scriptId, 'review.json'), 'utf8')).not.toContain(temporary)
    expect(existsSync(join(output, 'batch-review.json'))).toBe(true)
    expect(() => writeScriptBatch(output, result, context)).toThrow(/覆盖/)
  }, 30000)
})
