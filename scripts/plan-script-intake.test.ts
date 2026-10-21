import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve, sep } from 'node:path'
import { createBatchContext, prepareScriptBatch } from './prepare-script-batch.mjs'
import { roleDefinitionHashes } from './build/role-definition-pins.mjs'
import { createRoleReuseIndex, sha256 } from './build/script-role-reuse.mjs'
import { planScriptIntake, writeIntakePlan } from './plan-script-intake.mjs'

const temporary = mkdtempSync(join(tmpdir(), 'botc-library-plan-'))
let context: ReturnType<typeof createBatchContext>, reuse: ReturnType<typeof createRoleReuseIndex>
beforeAll(() => { context = createBatchContext(process.cwd()); reuse = createRoleReuseIndex(process.cwd(), context) }, 30000)
afterAll(() => {
  if (!resolve(temporary).startsWith(resolve(tmpdir()) + sep) || !basename(temporary).startsWith('botc-library-plan-')) throw new Error('Unexpected cleanup path')
  rmSync(temporary, { recursive: true, force: true })
})
const originals = ['chef', 'empath', 'fortuneteller', 'monk', 'soldier', 'drunk', 'poisoner', 'imp']
function source(boards: unknown[][]) {
  const build = 'a'.repeat(64)
  const rows = boards.map((_row, index) => [`fixture ${index}`, 'fixture', '', '', null, [], 'json'])
  const full = boards.map((roles, index) => ({ f: `${index}.json`, t: JSON.stringify([{ id: '_meta', name: `fixture ${index}`, states: [{ ability: 'author rule remains pending' }] }, ...roles], null, 2) + '\r\n' }))
  const catalogText = `var LIBRARY_BUILD=${JSON.stringify(build)};\nvar CHARS=[];\nvar SCRIPTS=${JSON.stringify(rows)};\nvar CATS=[];`
  const fullText = `var SCRIPT_FULL_BUILD=${JSON.stringify(build)};\nvar SCRIPT_FULL=${JSON.stringify(full)};`
  return { catalogText, fullText, full }
}
function plan(boards: unknown[][], limit = 100) {
  const data = source(boards)
  return { data, result: planScriptIntake(data.catalogText, data.fullText, context, reuse, limit) }
}

describe('whole-library intake planning and reusable source evidence', () => {
  it('normalizes legacy IDs only for intake and keeps unreviewed rules pending', () => {
    const before = JSON.stringify(context.packs)
    const old = reuse.resolve({ id:'plague_doctor', name:'瘟疫医生', team:'outsider', ability:'Unreviewed replacement ability' })
    expect(old.reusable).toBe(false)
    expect(old.roleId ?? old.reference?.id).toBe('plaguedoctor')
    expect(old.sourceTextReviewRequired).toBe(true)
    expect(JSON.stringify(context.packs)).toBe(before)
    const { result } = plan([['plaguedoctor', { id:'plague_doctor', name:'瘟疫医生', team:'outsider', ability:'Unreviewed replacement ability' }]])
    expect(result.report.rows[0].hold).toBe('duplicate-canonical-role')
  })

  it('keeps special openings in the unapproved batch instead of silently filtering every such script', () => {
    const { result } = plan([[...originals, 'summoner']])
    expect(result.report.rows[0].specialOpeningReviewRequired).toBe(true)
    expect(result.manifest.scripts).toHaveLength(1)
    expect(result.manifest.scripts[0].intakeReview.required).toBe(true)
    expect(result.report.automaticRuleApproval).toBe(false)
  })
  it('keeps explicitly typed author jinx notes out of seats while preserving them for review', () => {
    const note = { id: 'author-jinx', name: '巫婆与少女', team: 'a jinxed', ability: 'Author rule still requires review.' }
    const { result } = plan([[...originals, note]])
    expect(result.manifest.scripts).toHaveLength(1)
    expect(result.manifest.scripts[0].roleRefs).toHaveLength(originals.length)
    expect(result.report.rows[0]).toMatchObject({ authorRuleEntries: [note], authorRuleReviewRequired: true })
    const output = join(temporary, 'jinx-note-output')
    writeIntakePlan(output, result)
    const prepared = prepareScriptBatch(result.manifest, output, context)
    expect(prepared.prepared[0].source.lock.authorRuleEntries).toEqual([note])
    expect(prepared.prepared[0].source.lock.authorSpecialRules).toContainEqual(note)
    expect(prepared.prepared[0].source.lock.knowledgeStatus).toBe('needs-review')
    const malformed = plan([[...originals, { ...note, ability: null }]])
    expect(malformed.result.report.rows[0].hold).toBe('invalid-author-rule-entry')
    expect(malformed.result.manifest.scripts).toHaveLength(0)
    const custom = plan([[...originals, { ...note, team: 'fabled' }]])
    expect(custom.result.manifest.scripts).toHaveLength(0)
  })

  it('separates existing rosters and named versions from genuinely new combinations', () => {
    const existing = context.packs.find((pack) => pack.scriptId === 'trouble-brewing')!
    const { result } = plan([existing.roles.map((role) => role.id), originals])
    expect(result.report.rows[0]).toMatchObject({ hold: 'existing-roster-review', existingPackIds: ['trouble-brewing'] })
    expect(result.manifest.scripts).toHaveLength(1)
    const data = source([originals])
    const named = planScriptIntake(data.catalogText.replace('fixture 0', existing.displayName + ' v2.1'), data.fullText, context, reuse)
    expect(named.report.rows[0]).toMatchObject({ hold: 'existing-name-version-review', existingPackIds: ['trouble-brewing'] })
    expect(named.manifest.scripts).toHaveLength(0)
  })

  it('plans all records offline, emits one limited manifest and keeps every board unapproved', () => {
    const network = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network forbidden'))
    try {
      const { result } = plan([originals, originals], 1)
      expect(result.report.entries).toBe(2)
      expect(result.report.manifestEligible).toBe(2)
      expect(result.manifest.scripts).toHaveLength(1)
      expect(result.report.automaticRuleApproval).toBe(false)
      expect(result.report.rows.every((row) => row.boardReviewRequired && !row.published)).toBe(true)
      expect(result.report.rows[0].authorMetadata.states).toHaveLength(1)
      expect(result.report.liveAiExecuted).toBe(false)
      expect(result.report.browserExecuted).toBe(false)
      expect(network).not.toHaveBeenCalled()
    } finally { network.mockRestore() }
  })

  it('collapses arbitrary source aliases only with matching reviewed role text, team and an unambiguous stable definition', () => {
    const role = context.library.resolve('chef').role
    const raw = { id: 'author-chef-one', name: role.name, ability: role.abilityText, team: role.team }
    const { result } = plan([[raw], [{ ...raw, id: 'author-chef-two' }]])
    expect(result.roleGroups).toHaveLength(1)
    expect(result.roleGroups[0]).toMatchObject({ reusable: true, reference: { id: 'chef' }, sourceIndices: [0, 1] })
    expect(result.roleGroups[0].sourceRoleIds).toEqual(['author-chef-one', 'author-chef-two'])
  })

  it('does not treat a matching Chinese name as confirmed skill or ignore conflicting declared IDs', () => {
    const role = context.library.resolve('chef').role
    const proposed = reuse.resolve({ id: 'new-author-id', name: role.name, team: role.team, ability: 'New and unverified ability' })
    expect(proposed).toMatchObject({ reusable: false, identityReviewRequired: true, sourceTextReviewRequired: true })
    expect(reuse.resolve({ id: 'chef', GstoneID: 'imp', name: role.name, team: role.team, ability: role.abilityText }))
      .toMatchObject({ reusable: false, status: 'conflicting-source-identity' })
    expect(reuse.resolve({ id: 'new-author-id', name: role.name, team: 'demon', ability: role.abilityText }).reusable).toBe(false)
  })

  it('keeps a complete set of identity candidates separate from source rule acceptance', () => {
    const role = context.library.resolve('chef').role
    const { result } = plan([[{ id: 'source-only-candidate', name: role.name, team: role.team, ability: 'Unverified variant' }]])
    expect(result.report.recordsWithCompleteReferenceCandidates).toBe(1)
    expect(result.report.reusableRoleRecords).toBe(0)
    expect(result.report.rows[0].rolesReusable).toBe(false)
    expect(result.manifest.scripts[0].intakeReview).toMatchObject({ required: true, pendingRoleReviewKeys: [expect.any(String)] })
    expect(result.report.automaticRuleApproval).toBe(false)
  })

  it('isolates invalid entries, missing role definitions and duplicate originals', () => {
    const data = source([originals, [null], ['never-reviewed-role']])
    const result = planScriptIntake(data.catalogText, data.fullText, context, reuse)
    expect(result.report.rows[1].hold).toBe('invalid-roster-or-metadata')
    expect(result.report.rows[2].hold).toBe('role-review')
    expect(result.manifest.scripts).toHaveLength(1)
    const duplicated = data.fullText.replace(JSON.stringify(data.full[2]), JSON.stringify(data.full[0]))
    expect(planScriptIntake(data.catalogText, duplicated, context, reuse).report.rows[2].hold).toBe('duplicate-original')
    expect(() => plan([originals], 0)).toThrow(/数量/)
  })

  it('does not let one malformed role reference interrupt the other source records', () => {
    const { result } = plan([originals, [{ id: 'unknown-source-alias', GstoneID: 'x'.repeat(300) }]])
    expect(result.manifest.scripts).toHaveLength(1)
    expect(result.report.rows[1].hold).toBe('role-review')
    expect(result.roleGroups.at(-1)).toMatchObject({ reusable: false, status: 'invalid-role-reference' })
  })

  it('preserves exact original bytes, role review dependencies and existing output directories', () => {
    const { data, result } = plan([originals])
    const output = join(temporary, 'output')
    writeIntakePlan(output, result)
    const input = JSON.parse(readFileSync(join(output, 'batch.json'), 'utf8')).scripts[0]
    const bytes = readFileSync(join(output, input.sourceFile))
    expect(bytes.toString('utf8')).toBe(data.full[0].t)
    expect(input.source.contentHash).toBe(`sha256:${sha256(bytes)}`)
    input.intakeReview.pendingRoleReviewKeys = ['a'.repeat(64)]
    const checked = prepareScriptBatch({ scripts: [input] }, output, context)
    expect(checked.prepared[0].source.lock.intakeReview).toEqual(input.intakeReview)
    expect(checked.prepared[0].pack.definition.knowledgeStatus).toBe('needs-review')
    const bypassed = prepareScriptBatch({ scripts: [{ ...input, intakeReview: { ...input.intakeReview, required: false } }] }, output, context)
    expect(bypassed.prepared).toHaveLength(0)
    expect(bypassed.report.scripts[0].error).toMatch(/复核依赖/)
    expect(() => writeIntakePlan(output, result)).toThrow(/不会覆盖/)
  }, 30000)

  it('invalidates accepted source mappings when full role definitions or original bytes change', () => {
    const resolved = context.library.resolve('chef'), role = resolved.role
    const root = join(temporary, 'proof'), folder = join(root, 'src/domain/scripts/packs/proof-source')
    mkdirSync(folder, { recursive: true })
    const raw = { id: 'previously-reviewed-alias', name: role.name, team: role.team, ability: role.abilityText }
    const bytes = JSON.stringify([raw])
    writeFileSync(join(folder, 'source.json'), bytes)
    writeFileSync(join(folder, 'source-lock.json'), JSON.stringify({ knowledgeStatus: 'confirmed', rawJsonSha256: sha256(bytes), rawJsonByteLength: Buffer.byteLength(bytes),
      roleAliases: [{ rawId: raw.id, roleId: role.id, sourceId: resolved.sourceId, sourceVersion: resolved.sourceVersion,
        rawAbilitySha256: sha256(raw.ability), sharedRoleDefinitionHash: roleDefinitionHashes([role])[role.id], aliasReviewed: true, abilityTextReviewed: true }] }))
    const accepted = createRoleReuseIndex(root, context)
    expect(accepted.resolve(raw).status).toBe('reviewed-source')
    expect(accepted.resolve({ ...raw, GstoneID: 'imp' })).toMatchObject({ reusable: false, status: 'conflicting-source-identity' })
    const changed = (entry: typeof resolved) => ({ ...entry, role: entry.role.id === role.id ? { ...entry.role, abilityText: 'changed shared skill' } : entry.role })
    const next = { ...context, library: { all: () => context.library.all().map(changed), variants: (id: string) => context.library.variants(id).map(changed), resolve: (ref: string) => changed(context.library.resolve(ref)) } }
    const index = createRoleReuseIndex(root, next)
    expect(index.staleRoleMappings).toBe(1)
    expect(index.resolve(raw).reusable).toBe(false)
    writeFileSync(join(folder, 'source.json'), bytes + ' ')
    expect(createRoleReuseIndex(root, context).invalidProofs).toEqual(['proof-source'])
  })
})
