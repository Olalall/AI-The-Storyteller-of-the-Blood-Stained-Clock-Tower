import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { smartScriptPacks } from './allPacks'
import { getSmartScriptPack } from './index'
import { scriptManifest, smartScriptRegistry } from './catalog'
import { normalizeRoleId } from './roleId'
import { buildScriptQualitySummary } from './quality'
import { createRoleDefinitionLibrary } from './roleDefinitionLibrary'
import type { ReferencedScriptDefinition } from './referencedScriptPack'
import type { SmartScriptPack } from './types'
import { validateTemplateComposition } from '../setup-templates/composition'
import officialNightSheet from '../../features/night-workbench/data/official/nightsheet.json' with { type: 'json' }
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from '../../features/setup/smartScriptSetupCandidates'
import { createSmartScriptSetupSession } from '../../features/game-session/data/createPrototypeSession'
import { createSetupDraftFromCandidate } from '../../features/setup/setupDraft'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../features/game-session/state/projectors'
import { cardinalitySession } from '../../features/night-workbench/state/nightCardinality.test-support'
import { actNight, projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { canConfirmDraft } from '../../features/night-workbench/state/workbenchGuards'
import { nightContextKey } from '../../features/night-workbench/state/gameSessionAdapter'
import { parseSessionBackup } from '../../services/session/sessionBackup'

const sources = [
  ['jiu-ri-chong-xian', 377, 'ea5d369b9f65e22dfab3cb52e4892280a8fed6c9e9d835e0d4e7be5fde23726b'],
  ['bu-zhi-zhi-zheng', 900, '1ef5e50f76db692f5825673f9a2221af1e41e49b74bf8f7fca6b043b78faa7e6'],
  ['wang-ling-tong-hao-hui', 901, '6ba5cfe963c606e56e5e567b26ca2ed3a3837d429017f55d190889173589d517'],
  ['yi-cun-duan-yi-cun-xian', 391, 'ec0a63737570d97ef55821295a1d2e0640fbfdd8acdd707453eb348fd6bbf04b'],
  ['jia-fang-fu-chou-ji', 561, '50cd959cdbada67d1ad97cdff83223a9d7e43da6e420b61f9793929076e1a042'],
  ['you-tou-lai-guo', 396, '3f1f9b3ba84318c973ad39ffe92d83475b886843f0fae41bb62bf0d114a4d8e1'],
  ['fu-shou-cheng-chen', 540, '5db5191d519df7ad436f14d0b1c18b959d779e8bef543f0655360eb9dbc00e00'],
  ['wen-run-liang-ye', 628, '70707cc970d66701a00729b3ac05ccdb420dce5ba3ff6f197b67c6e1750a5644'],
  ['shen-bu-you-ji', 562, '052a01a8d2a7c6270b45ee7c068da272dfebfc569823d3059ad9ef4b7bea2dc6'],
  ['quan-qiu-jing-song', 511, '6d4630e148f22ae7da8c05abb12433acb6201615b310d30957e04499c435435f'],
] as const
const ids = new Set<string>(sources.map(([id]) => id))
for (const pack of smartScriptPacks.filter((entry) => ids.has(entry.scriptId))) {
  if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
}
const minimum = [3, 2, 2, 3, 2, 3, 2, 2, 3]
const at = '2026-10-21T00:00:00.000Z'
const sha = (input: string | Buffer) => createHash('sha256').update(input).digest('hex')
const sourceFile = (id: string, name: string) => readFileSync(resolve('src/domain/scripts/packs', id, name))
function packFor(id: string): SmartScriptPack {
  const pack = (smartScriptPacks as readonly SmartScriptPack[]).find((entry) => entry.scriptId === id)
  expect(pack, `${id} must be registered, not an empty parameterized suite`).toBeDefined()
  return pack!
}
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, nested]) => [key, stable(nested)]))
  return value
}
function roster(pack: SmartScriptPack, playable = false) {
  return pack.roles.filter((role) => !playable || ['townsfolk', 'outsider', 'minion', 'demon'].includes(role.team))
    .map((role) => normalizeRoleId(role.id)).sort().join('|')
}
function current(session: ReturnType<typeof cardinalitySession>) {
  const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}
function sessionFor(id: string, roleId: string, later = false) {
  const pack = packFor(id)
  const count = pack.playerCounts.find((count) => createSmartScriptSetupCandidates(id,
    Array.from({ length: count }, (_, i) => ({ seatId: i + 1, experience: 'regular' as const })),
    { seed: `cardinality-${id}`, count: pack.setupTemplates.length })
    .some((candidate) => candidate.assignments.some((assignment) => assignment.role.id === roleId)))
  expect(count, `${id}: actual legal template covering ${roleId}`).toBeDefined()
  return cardinalitySession(id, roleId, count!, later)
}

describe('wiki batch 04: actual sources, shared definitions and playable setup', () => {
  it('registers all ten reviewed source identities exactly once', () => {
    expect(smartScriptPacks.filter((pack) => ids.has(pack.scriptId)).map((pack) => pack.scriptId).sort())
      .toEqual([...ids].sort())
    expect(scriptManifest.filter((entry) => ids.has(entry.scriptId)).map((entry) => entry.scriptId).sort()).toEqual([...ids].sort())
  })

  for (const [id, sourceIndex, expectedHash] of sources) {
    it(`${id} preserves original source bytes and explicit versioned role aliases`, () => {
      const pack = packFor(id), bytes = sourceFile(id, 'source.json')
      const raw = JSON.parse(bytes.toString()), lock = JSON.parse(sourceFile(id, 'source-lock.json').toString())
      expect(sha(bytes)).toBe(expectedHash)
      expect(pack.source.contentHash).toBe(`sha256:${expectedHash}`)
      expect(lock).toMatchObject({ sourceIndex, rawJsonSha256: expectedHash, rawJsonByteLength: bytes.length,
        sourceBuild: '16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e' })
      const originals = raw.filter((row: string | { id: string }) => typeof row === 'string' || row.id !== '_meta')
      expect(lock.roleAliases).toHaveLength(originals.length)
      expect(lock.roleAliases.map((row: { roleId: string }) => row.roleId)).toEqual(pack.roles.map((role) => role.id))
      for (const [index, original] of originals.entries()) {
        const alias = lock.roleAliases[index], role = pack.roles[index]
        expect(alias.rawId).toBe(typeof original === 'string' ? original : original.id)
        expect(alias.sourceId ?? alias.sharedSourceId).toBeTruthy()
        expect(alias.sourceVersion ?? alias.sharedSourceVersion).toMatch(/^sha256:[a-f0-9]{64}$/)
        expect(alias.resolvedAbilitySha256).toBe(sha(role.abilityText))
        if (typeof original !== 'string') {
          expect(alias.rawAbilitySha256).toBe(sha(original.ability))
          expect(alias.rawTeam).toBe(original.team)
        } else {
          // A bare source ID is not evidence that the original included ability prose or a night sheet.
          expect(alias.rawAbilitySha256).toBeNull()
          expect(alias.rawTeam).toBeNull()
        }
      }
    })

    it(`${id} pins full shared definitions without copying a private role implementation`, () => {
      const pack = packFor(id), definition = JSON.parse(sourceFile(id, 'definition.json').toString()) as ReferencedScriptDefinition
      expect(definition.roleRefs).toHaveLength(pack.roles.length)
      expect(Object.keys(definition.roleDefinitionHashes ?? {}).sort()).toEqual(pack.roles.map((role) => role.id).sort())
      const oldPacks = smartScriptPacks.filter((entry) => !ids.has(entry.scriptId))
      const library = createRoleDefinitionLibrary(oldPacks.map((entry) => ({ sourceId: entry.scriptId,
        sourceVersion: entry.source.contentHash, roles: entry.roles })))
      for (const [index, reference] of definition.roleRefs.entries()) {
        expect(typeof reference).toBe('object')
        if (typeof reference === 'string') throw new Error('Every reviewed role must retain its source and version')
        expect(reference.sourceId).toBeTruthy()
        expect(reference.sourceVersion).toMatch(/^sha256:[a-f0-9]{64}$/)
        expect(library.resolve(reference).role).toEqual(pack.roles[index])
        expect(definition.roleDefinitionHashes![pack.roles[index].id]).toBe(`sha256:${sha(JSON.stringify(stable(pack.roles[index])))}`)
      }
      expect(sourceFile(id, 'index.ts').toString()).toContain('createReferencedScriptPack')
      expect(buildScriptQualitySummary(pack).readiness).not.toBe('blocked')
    })

    it(`${id} has no complete or playable roster duplicate and follows both official night sheets`, () => {
      const pack = packFor(id)
      for (const old of smartScriptPacks) {
        if (old.scriptId === id) continue
        expect(roster(pack), `${old.scriptId}:complete`).not.toBe(roster(old))
        expect(roster(pack, true), `${old.scriptId}:playable`).not.toBe(roster(old, true))
      }
      for (const night of ['firstNight', 'otherNight'] as const) {
        const expected = officialNightSheet[night].filter((roleId) => pack.roles.some((role) => role.id === roleId))
        expect(pack.nightOrders[night].map((entry) => entry.roleId)).toEqual(expected)
        expect(pack.nightOrders[night].map((entry) => entry.order)).toEqual(expected.map((_, index) => index + 1))
        expect(getSmartScriptPack(id).nightOrders[night].map((entry) => entry.roleId)).toEqual(expected)
      }
    })

    it(`${id} exposes every 7–15 template through production assignment, validation and backup`, () => {
      const pack = packFor(id)
      expect(pack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
      expect(pack.setupTemplates).toHaveLength(22)
      for (const [index, count] of pack.playerCounts.entries()) {
        const templates = pack.setupTemplates.filter((template) => template.playerCount === count)
        expect(templates).toHaveLength(minimum[index])
        expect(new Set(templates.map((template) => [...template.roles].sort().join('|'))).size).toBe(templates.length)
        for (const mixed of [false, true]) for (const seed of ['batch04-first', 'batch04-second']) {
          const profiles = Array.from({ length: count }, (_, i) => ({ seatId: i + 1,
            experience: mixed ? (['new', 'regular', 'veteran'] as const)[i % 3] : 'regular' as const }))
          const before = structuredClone(profiles)
          const candidates = createSmartScriptSetupCandidates(id, profiles, { seed, count: 100 })
          expect(candidates.map((candidate) => candidate.id).sort()).toEqual(templates.map((template) => template.templateId).sort())
          for (const candidate of candidates) {
            expect(candidate.legalityChecks.filter((check) => !check.passed), candidate.id).toEqual([])
            const evaluated = evaluateSmartScriptSetup(id, candidate.assignments, candidate.demonBluffs,
              profiles.map((profile) => profile.seatId), candidate.setupRuleSelections)
            expect(evaluated.checks.filter((check) => !check.passed), candidate.id).toEqual([])
            if (!mixed && seed === 'batch04-first') {
              let session = createSmartScriptSetupSession(id, at, { playerCount: count })
              session = gameSessionReducer(session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
              session = gameSessionReducer(session, { type: 'confirm-setup', id: `${candidate.id}-confirmed`, confirmedAt: at })
              expect(projectCurrentAssignments(session)).toEqual(candidate.assignments)
              expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
            }
          }
          expect(profiles).toEqual(before)
        }
        for (const template of templates) {
          expect(template.verified).toBe(true)
          expect(validateTemplateComposition(pack, template).problems, template.templateId).toEqual([])
          expect(new Set(template.bluffs).size).toBe(3)
          for (const bluff of template.bluffs) {
            expect(template.roles).not.toContain(bluff)
            expect(['townsfolk', 'outsider']).toContain(pack.roles.find((role) => role.id === bluff)?.team)
          }
          for (const roleId of ['godfather', 'fanggu', 'baron', 'balloonist', 'vigormortis']) {
            const ruleId = `${roleId}-setup-count`
            const adjustment = template.setupAdjustments?.find((row) => row.ruleId === ruleId)
            expect(Boolean(adjustment), `${template.templateId}/${roleId}`).toBe(template.roles.includes(roleId))
            if (adjustment) expect(adjustment.choiceId).toBeTruthy()
          }
        }
      }
    })
  }
})

describe('batch 04 uses shared information guards and explicit character changes', () => {
  it.each([
    ['jia-fang-fu-chou-ji', 'vizier', 'courtier', '8047cac751e99faf00e45239b40b7453bee2786f88369d9f48c9dfd4440a7995'],
    ['jia-fang-fu-chou-ji', 'vizier', 'investigator', '20fc6a86b5eca56b9b073538e15101f167d5028a2b0bf3f2e903e9ce3d93a964'],
    ['wen-run-liang-ye', 'scarletwoman', 'fanggu', 'a637c48c200b6294a49d4375c485f1b4dfc335ebf9f45f5c6760fc7ea15bfb50'],
    ['shen-bu-you-ji', 'mathematician', 'drunk', 'acdc6074f889ce6d886db5105a5ded2d696f221bae87ca5ee9ad55eceac1709f'],
    ['shen-bu-you-ji', 'scarletwoman', 'fanggu', 'a637c48c200b6294a49d4375c485f1b4dfc335ebf9f45f5c6760fc7ea15bfb50'],
    ['quan-qiu-jing-song', 'marionette', 'balloonist', 'd55e5087001fa2d41e878e2cdb7cba72874b27f34cc7dc9b9698d5f603cff188'],
  ] as const)('%s explicitly retains the current %s/%s jinx separately from the source script hash', (id, roleId, withRoleId, reasonHash) => {
    const pack = packFor(id), lock = JSON.parse(sourceFile(id, 'source-lock.json').toString())
    const jinx = lock.currentJinxes.find((row: { roleId: string; withRoleId: string }) => row.roleId === roleId && row.withRoleId === withRoleId)
    expect(jinx).toBeDefined()
    expect(sha(jinx.reason)).toBe(reasonHash)
    expect(lock.officialJinxSourceUrl).toBe('https://release.botc.app/resources/data/jinxes.json')
    expect(lock.officialJinxSnapshotSha256).toBe('5d3d8d0ac194fb1ea44af79b74f9e4bdc09712aef2123c3a3ef2b6c43efa7df7')
    const rule = pack.setupRules.find((row) => row.id === `${roleId}-${withRoleId}-jinx`)!
    expect(rule).toBeDefined()
    expect(rule.summary.trim().length).toBeGreaterThan(20)
    expect(rule.sourceUrls).toContain('https://release.botc.app/resources/data/jinxes.json')
  })

  it.each([
    ['jiu-ri-chong-xian', 'chef', false, '1'], ['wang-ling-tong-hao-hui', 'oracle', true, '0'],
    ['yi-cun-duan-yi-cun-xian', 'oracle', true, '0'], ['you-tou-lai-guo', 'chambermaid', false, '0'],
    ['fu-shou-cheng-chen', 'chambermaid', false, '0'], ['shen-bu-you-ji', 'mathematician', false, '0'],
  ] as const)('%s/%s rejects missing/illegal formal numbers without recording or changing authority', (id, roleId, later, value) => {
    let session = sessionFor(id, roleId, later)
    const states = projectCurrentPlayerStates(session), assignments = projectCurrentAssignments(session)
    const history = structuredClone(session.timeline), item = current(session).item
    for (const seatId of Object.keys(session.seats).map(Number).filter((seat) => seat !== item.seatId).slice(0, item.targetCount)) {
      session = actNight(session, { type: 'target', seatId })
    }
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, item, current(session).draft)).toBe(false)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(session.timeline).toEqual(history)
    for (const invalid of ['-1', '1.5', 'not-a-number', '999']) {
      session = actNight(session, { type: 'information', value: invalid })
      session = actNight(session, { type: 'outcome', outcomeId: 'record' })
      expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(false)
    }
    session = actNight(session, { type: 'information', value })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    const record = session.timeline.findLast((entry) => entry.kind === 'night_action' && entry.wakeItemId === item.id)
    expect(record?.kind === 'night_action' && record.record.snapshot.informationGiven).toBe(value)
    expect(projectCurrentAssignments(session)).toEqual(assignments)
    expect(projectCurrentPlayerStates(session)).toEqual(states)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('records a zero-outsider Librarian without stale targets/role and without changing seats', () => {
    let session = sessionFor('bu-zhi-zhi-zheng', 'librarian')
    const assignments = projectCurrentAssignments(session), states = projectCurrentPlayerStates(session)
    const item = current(session).item
    for (const seatId of Object.keys(session.seats).map(Number).filter((seat) => seat !== item.seatId).slice(0, 2)) session = actNight(session, { type: 'target', seatId })
    session = actNight(session, { type: 'role-choice', roleId: 'recluse' })
    session = actNight(session, { type: 'outcome', outcomeId: 'no-outsiders' })
    expect(current(session).draft).toMatchObject({ targets: [], roleChoice: '', informationGiven: '没有外来者。' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projectCurrentAssignments(session)).toEqual(assignments)
    expect(projectCurrentPlayerStates(session)).toEqual(states)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it.each([
    ['jia-fang-fu-chou-ji', 'fortuneteller', false, 'yes', '是。'],
    ['wen-run-liang-ye', 'towncrier', true, 'no', '否。'],
    ['quan-qiu-jing-song', 'villageidiot', false, 'evil', '邪恶阵营。'],
  ] as const)('%s/%s keeps formal answer choices as a snapshot, without applying alignment or status', (id, roleId, later, outcome, expected) => {
    let session = sessionFor(id, roleId, later)
    const states = projectCurrentPlayerStates(session), assignments = projectCurrentAssignments(session)
    const item = current(session).item
    for (const seatId of Object.keys(session.seats).map(Number).filter((seat) => seat !== item.seatId).slice(0, item.targetCount)) {
      session = actNight(session, { type: 'target', seatId })
    }
    session = actNight(session, { type: 'outcome', outcomeId: outcome })
    expect(current(session).draft.informationGiven).toBe(expected)
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(projectCurrentAssignments(session)).toEqual(assignments)
    expect(projectCurrentPlayerStates(session)).toEqual(states)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('keeps a Barber-to-FangGu conversion deferred until the host confirms timing, with no extra attack', () => {
    const before = sessionFor('jia-fang-fu-chou-ji', 'barber', true)
    const old = current(before).item, run = before.nightRuns[before.activeNightRunId!]
    const after = gameSessionReducer(before, { type: 'confirm-night-role-change', nightRunId: run.id,
      seatId: old.seatId, roleId: 'fanggu', expectedRoleId: 'barber', id: 'batch04-fanggu-conversion',
      timing: 'later', reason: 'gameplay', expectedRevision: run.revision, expectedContextKey: nightContextKey(before),
      confirmedAt: new Date(Date.now() + 1000).toISOString() })
    expect(projectCurrentAssignments(after).find((assignment) => assignment.seatId === old.seatId)?.role.id).toBe('fanggu')
    expect(projected(after).queue.find((item) => item.id === old.id)?.progress).toBe('not_applicable')
    expect(projected(after).queue.filter((item) => item.seatId === old.seatId && item.progress !== 'not_applicable')).toEqual([])
    expect(after.timeline.slice(0, before.timeline.length)).toEqual(before.timeline)
    expect(projectCurrentPlayerStates(after)).toEqual(projectCurrentPlayerStates(before))
    expect(parseSessionBackup(JSON.stringify(after))).toEqual(after)
  })

  it('inserts a host-confirmed new ability tonight and prevents its replaced pending ability from committing', () => {
    const before = sessionFor('jiu-ri-chong-xian', 'empath', true)
    const pack = packFor(before.scriptId), assignments = projectCurrentAssignments(before)
    const nextRole = ['towncrier', 'chambermaid', 'snakecharmer', 'fortuneteller'].find((id) =>
      pack.nightOrders.otherNight.some((entry) => entry.roleId === id) && !assignments.some((entry) => entry.role.id === id))!
    expect(nextRole).toBeDefined()
    const old = current(before).item, run = before.nightRuns[before.activeNightRunId!]
    let after = gameSessionReducer(before, { type: 'confirm-night-role-change', nightRunId: run.id,
      seatId: old.seatId, roleId: nextRole, expectedRoleId: old.roleId, id: 'batch04-current-night-change',
      timing: 'tonight', reason: 'gameplay', expectedRevision: run.revision, expectedContextKey: nightContextKey(before),
      confirmedAt: new Date(Date.now() + 1000).toISOString() })
    expect(projectCurrentAssignments(after).find((assignment) => assignment.seatId === old.seatId)?.role.id).toBe(nextRole)
    expect(projected(after).queue.find((item) => item.id === old.id)).toMatchObject({ progress: 'not_applicable', applicability: 'not_applicable' })
    expect(projected(after).queue.some((item) => item.seatId === old.seatId && item.roleId === nextRole && item.progress === 'pending')).toBe(true)
    const rank = new Map(pack.nightOrders.otherNight.map((entry) => [entry.roleId, entry.order]))
    const actualOrder = projected(after).queue.filter((item) => !item.systemStep && item.progress !== 'not_applicable').map((item) => rank.get(item.roleId)!)
    expect(actualOrder).toEqual([...actualOrder].sort((a, b) => a - b))
    const history = structuredClone(after.timeline)
    after = actNight(actNight(after, { type: 'preview', id: old.id }), { type: 'activate-preview' })
    after = actNight(actNight(after, { type: 'information', value: '0' }), { type: 'outcome', outcomeId: 'record' })
    after = actNight(after, { type: 'confirm', advance: false })
    expect(after.timeline).toEqual(history)
    expect(projectCurrentPlayerStates(after)).toEqual(projectCurrentPlayerStates(before))
    expect(parseSessionBackup(JSON.stringify(after))).toEqual(after)
  })

  it('records a real first-night Lleech host as a choice, not an automatic poisoning or death', () => {
    let session = sessionFor('fu-shou-cheng-chen', 'lleech')
    const states = projectCurrentPlayerStates(session), history = structuredClone(session.timeline)
    const item = current(session).item
    expect(item.targetCount).toBe(1)
    expect(`${item.ability} ${item.storytellerPrompt}`).toMatch(/宿主|host/)
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(false)
    const target = Object.keys(session.seats).map(Number).find((seat) => seat !== item.seatId)!
    session = actNight(actNight(session, { type: 'target', seatId: target }), { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(session.timeline.slice(0, history.length)).toEqual(history)
    expect(projectCurrentPlayerStates(session)).toEqual(states)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('keeps source Princess, Ogre and Village Idiot mapped to their explicit current rules', () => {
    const pack = packFor('you-tou-lai-guo')
    expect(pack.roles.find((role) => role.id === 'princess')?.abilityText).toMatch(/1st day.*nominated.*executed/)
    expect(pack.roles.find((role) => role.id === 'ogre')?.abilityText).toContain('even if drunk or poisoned')
    expect(pack.roles.find((role) => role.id === 'villageidiot')?.abilityText).toContain('1 of the extras is drunk')
  })

  it('pins the existing custom Traveler separately and excludes it from every normal seat and bluff', () => {
    const pack = packFor('wen-run-liang-ye'), lock = JSON.parse(sourceFile(pack.scriptId, 'source-lock.json').toString())
    const role = pack.roles.find((role) => role.id === 'li_beng_wang_sheng_zhe')!
    const old = packFor('li-beng-le-huai').roles.find((entry) => entry.id === role.id)!
    expect(role.team).toBe('traveler')
    expect(role.abilityText).toBe(old.abilityText)
    expect(lock.customRoleReuse).toEqual(expect.arrayContaining([expect.objectContaining({ roleId: role.id,
      sourceId: 'li-beng-le-huai', exactAbilityMatch: true, includedInNormalSeats: false, includedInBluffs: false,
      automaticAbilityExecution: false })]))
    for (const template of pack.setupTemplates) expect([...template.roles, ...template.bluffs]).not.toContain(role.id)
    for (const night of Object.values(pack.nightOrders)) expect(night.map((entry) => entry.roleId)).not.toContain(role.id)
  })

  it('separates the original Boomdandy minute from the reviewed ten-to-one countdown', () => {
    const pack = packFor('shen-bu-you-ji'), raw = JSON.parse(sourceFile(pack.scriptId, 'source.json').toString())
    const lock = JSON.parse(sourceFile(pack.scriptId, 'source-lock.json').toString())
    expect(raw.find((row: { name?: string }) => row.name === '炸弹人').ability).toMatch(/1分钟|一分钟/)
    expect(pack.roles.find((role) => role.id === 'boomdandy')?.abilityText).toMatch(/10[\s\S]{0,40}(?:to 1|到\s*1|至\s*1|→\s*1)/)
    expect(JSON.stringify(lock.differences)).toMatch(/炸弹人|Boomdandy|boomdandy/)
  })

  it('uses current third-day Riot and retains real Minions plus both explicit Balloonist setup choices', () => {
    const pack = packFor('quan-qiu-jing-song'), lock = JSON.parse(sourceFile(pack.scriptId, 'source-lock.json').toString())
    expect(pack.roles.find((role) => role.id === 'riot')?.abilityText).toContain('On day 3, Minions become Riot')
    expect(JSON.stringify(lock.differences)).toMatch(/暴乱|Riot|riot/)
    const riotTemplates = pack.setupTemplates.filter((template) => template.roles.includes('riot'))
    expect(riotTemplates.length).toBeGreaterThan(0)
    for (const template of riotTemplates) expect(template.roles.some((id) => pack.roles.find((role) => role.id === id)?.team === 'minion')).toBe(true)
    const choices = new Set(pack.setupTemplates.flatMap((template) => template.setupAdjustments
      ?.filter((choice) => choice.ruleId === 'balloonist-setup-count').map((choice) => choice.choiceId) ?? []))
    expect(choices).toContain('no-extra-outsider')
    expect(choices).toContain('add-one-outsider')
  })
})
