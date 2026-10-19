import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { roleResearchForAI, smartScriptRegistry } from '../../domain/scripts'
import { roleKnowledgeForAI } from '../../domain/role-knowledge'
import { buildScriptQualitySummary } from '../../domain/scripts/quality'
import { validateTemplateComposition } from '../../domain/setup-templates/composition'
import type { SmartScriptPack } from '../../domain/scripts/types'
import { createSetupRulePackForScript, createSmartScriptSetupCandidates } from '../../features/setup/smartScriptSetupCandidates'
import { evaluateSetupRules } from '../../features/setup/setupRuleEvaluator'
import type { SetupTeam } from '../../features/setup/types'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../features/game-session/state/projectors'
import { actNight, projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { cardinalitySession } from '../../features/night-workbench/state/nightCardinality.test-support'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { canConfirmDraft } from '../../features/night-workbench/state/workbenchGuards'
import { buildNightSettlementRequest } from './contextBuilder'
import { baoZouGeBuLinSmartScriptPack } from '../../domain/scripts/packs/bao-zou-ge-bu-lin'
import { longZhengHuDouSmartScriptPack } from '../../domain/scripts/packs/long-zheng-hu-dou'
import { paXingDuShiSmartScriptPack } from '../../domain/scripts/packs/pa-xing-du-shi'
import { daChengXiaoZhenSmartScriptPack } from '../../domain/scripts/packs/da-cheng-xiao-zhen'

const packs: readonly SmartScriptPack[] = [baoZouGeBuLinSmartScriptPack, longZhengHuDouSmartScriptPack, paXingDuShiSmartScriptPack, daChengXiaoZhenSmartScriptPack]
const counts = [7, 8, 9, 10, 11, 12, 13, 14, 15] as const
const minimum = [3, 2, 2, 3, 2, 3, 2, 2, 3]
// Independently pinned from the 2026-10-16 official nightsheet snapshot.
const expectedNights = [
  ['philosopher yaggababble widow devilsadvocate witch cerenovus investigator clockmaker seamstress balloonist ogre', 'philosopher gambler devilsadvocate witch cerenovus fanggu vortox yaggababble gossip banshee towncrier seamstress juggler balloonist'],
  ['philosopher sailor poisoner courtier godfather devilsadvocate pukka huntsman damsel librarian balloonist chambermaid', 'philosopher sailor poisoner courtier monk devilsadvocate pithag pukka po fanggu godfather huntsman damsel moonchild ravenkeeper undertaker balloonist chambermaid'],
  ['philosopher sailor poisoner snakecharmer devilsadvocate washerwoman librarian chef spy general chambermaid', 'philosopher sailor poisoner innkeeper snakecharmer devilsadvocate alhadikhia barber sweetheart undertaker flowergirl spy general chambermaid'],
  ['philosopher magician lunatic marionette godfather cerenovus mezepheles pixie librarian fortuneteller seamstress noble general', 'philosopher monk cerenovus mezepheles lunatic imp vigormortis godfather ravenkeeper fortuneteller oracle seamstress general'],
]
const root = resolve(process.env.BOTC_DRAFT_PACK_ROOT ?? 'src/domain/scripts/packs')
const expectedHashes = ['ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f', '5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17', '73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac', 'caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3']

// Test-process registration only: production source and generated registry are not changed.
beforeAll(() => {
  for (const pack of packs) if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
})

function current(session: ReturnType<typeof cardinalitySession>) {
  const state = projected(session), item = state.queue.find(x => x.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

describe('wiki batch 02 B copyable source packs', () => {
  for (const [packIndex, pack] of packs.entries()) {
    it(`${pack.scriptId} preserves exact source bytes and explicit ability/team aliases`, () => {
      const bytes = readFileSync(resolve(root, pack.scriptId, 'source.json'))
      const raw = JSON.parse(bytes.toString())
      const lock = JSON.parse(readFileSync(resolve(root, pack.scriptId, 'source-lock.json'), 'utf8'))
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(expectedHashes[packIndex])
      expect(pack.source.contentHash).toBe(`sha256:${expectedHashes[packIndex]}`)
      expect(lock.rawJsonByteLength).toBe(bytes.length)
      expect(lock.duplicateCheck).toEqual({ existingPackCount: 126, samePlayableRoleSets: [] })
      expect(lock.roleAliases.map((r: { roleId: string }) => r.roleId)).toEqual(pack.roles.map(r => r.id))
      for (const [i, role] of pack.roles.entries()) {
        expect(lock.roleAliases[i]).toMatchObject({ rawId: raw[i + 1].id, rawTeam: role.team, officialTeam: role.team })
        expect(lock.roleAliases[i].rawAbilitySha256).toBe(createHash('sha256').update(raw[i + 1].ability).digest('hex'))
        expect(lock.roleAliases[i].officialAbility).toBeTruthy()
      }
      expect(buildScriptQualitySummary(pack).readiness).toBe('ready')
    })

    it(`${pack.scriptId} uses the official current first/later night filter`, () => {
      for (const [kindIndex, kind] of (['firstNight', 'otherNight'] as const).entries()) {
        expect(pack.nightOrders[kind].map(r => r.roleId)).toEqual(expectedNights[packIndex][kindIndex].split(' '))
        expect(pack.nightOrders[kind].map(r => r.order)).toEqual(pack.nightOrders[kind].map((_, i) => i + 1))
      }
    })

    it(`${pack.scriptId} keeps all 22 templates legal through the actual rule evaluator`, () => {
      expect(pack.setupTemplates).toHaveLength(22)
      const roles = new Map(pack.roles.map(r => [r.id, r]))
      const snapshot = (id: string) => ({ id, name: roles.get(id)!.name, initial: id[0], iconPath: '' })
      const rulePack = createSetupRulePackForScript(pack)
      for (const [i, count] of counts.entries()) expect(pack.setupTemplates.filter(t => t.playerCount === count)).toHaveLength(minimum[i])
      for (const template of pack.setupTemplates) {
        expect(validateTemplateComposition(pack, template).problems, template.templateId).toEqual([])
        expect(template.bluffs).toHaveLength(3)
        for (const bluff of template.bluffs) {
          expect(template.roles).not.toContain(bluff)
          expect(['townsfolk', 'outsider']).toContain(roles.get(bluff)?.team)
        }
        const report = evaluateSetupRules({ assignments: template.roles.map((id, i) => ({ seatId: i + 1, role: snapshot(id) })),
          demonBluffs: template.bluffs.map(snapshot), expectedSeatIds: Array.from({ length: template.playerCount }, (_, i) => i + 1), playerCount: template.playerCount,
          rulePack, teamForRole: Object.fromEntries(pack.roles.map(r => [r.id, r.team])) as Record<string, SetupTeam>,
          selections: template.setupAdjustments?.map(a => ({ ruleId: a.ruleId, choiceId: a.choiceId! })),
        })
        expect(report.checks.filter(c => !c.passed), template.templateId).toEqual([])
        expect(report.actualCounts, template.templateId).toEqual(report.expectedCounts)
      }
    })

    it(`${pack.scriptId} exposes every candidate for regular and mixed-experience seats`, () => {
      for (const [i, count] of counts.entries()) {
        for (const mixed of [false, true]) {
          const candidates = createSmartScriptSetupCandidates(pack.scriptId, Array.from({ length: count }, (_, n) => ({ seatId: n + 1, experience: mixed ? (['new', 'regular', 'veteran'] as const)[n % 3] : 'regular' as const })), { count: 99, random: () => 0.5 })
          expect(candidates, `${pack.scriptId}/${count}/${mixed}`).toHaveLength(minimum[i])
          for (const candidate of candidates) expect(candidate.legalityChecks.filter(c => !c.passed), candidate.id).toEqual([])
        }
      }
    })
  }

  it('keeps source-current Balloonist differences and new jinxes visible', () => {
    for (const pack of [packs[0], packs[1]]) {
      expect(pack.roles.find(r => r.id === 'balloonist')?.abilityText).toContain('different character type than last night')
      expect(pack.setupRules.find(r => r.id === 'balloonist-outsider')?.summary).toMatch(/上一晚/)
    }
    expect(packs[0].setupRules.map(r => r.id)).toEqual(expect.arrayContaining(['cerenovus-goblin-jinx', 'recluse-ogre-jinx', 'vortox-banshee-jinx']))
    expect(packs[1].setupRules.map(r => r.id)).toContain('pithag-damsel-jinx')
    expect(packs[2].setupRules.find(r => r.id === 'innkeeper-lasting-effects')?.summary).toMatch(/旅店死亡或换角(?:时)?立即结束/)
    expect(packs[2].setupRules.find(r => r.id === 'innkeeper-lasting-effects')?.summary).toMatch(/(?:之前|先前)已.*(?:挡下|保护).*不追溯/)
  })

  it('requires one Damsel whenever Huntsman appears, with the declared count choice', () => {
    for (const template of packs[1].setupTemplates.filter(t => t.roles.includes('huntsman'))) {
      expect(template.roles.filter(id => id === 'damsel')).toHaveLength(1)
      expect(template.setupAdjustments?.find(a => a.ruleId === 'huntsman-damsel')?.choiceId).toMatch(/add-damsel|damsel-already-present/)
    }
    for (const count of [10, 13]) expect(packs[3].setupTemplates.filter(t => t.playerCount === count).every(t => t.roles.includes('imp'))).toBe(true)
    const zeroOutsiderVigor = packs[3].setupTemplates.find(t => t.playerCount === 7 && t.roles.includes('vigormortis'))!
    expect(zeroOutsiderVigor).toBeDefined()
    const teamFor = new Map(packs[3].roles.map(r => [r.id, r.team]))
    expect(['townsfolk', 'outsider', 'minion', 'demon'].map(team => zeroOutsiderVigor.roles.filter(id => teamFor.get(id) === team).length)).toEqual([5, 0, 1, 1])
    expect(zeroOutsiderVigor.roles).not.toContain('godfather')
    expect(zeroOutsiderVigor.setupAdjustments?.find(a => a.ruleId === 'vigormortis-outsider')?.choiceId).toBeTruthy()
  })
})

describe('Crawling City actual setup, later-night reducer and AI context', () => {
  it('projects actual Innkeeper research with the same source-dependent protection boundary', () => {
    const session = cardinalitySession('pa-xing-du-shi', 'innkeeper', 12, true)
    const { state, item, draft } = current(session)
    const request = buildNightSettlementRequest({ state, item, draft })
    expect(request.context.roleResearch).toEqual(roleResearchForAI('pa-xing-du-shi', 'innkeeper'))
    expect(request.context.roleKnowledge).toEqual(roleKnowledgeForAI('innkeeper'))
    expect(request.context.roleKnowledge?.reminders.join(' ')).toContain('死亡或换角时立即结束')
    expect(request.context.roleKnowledge?.reminders.join(' ')).toContain('先前已被有效保护挡下的攻击不追溯重算')
    expect(JSON.stringify(request.context.roleResearch)).not.toContain('不能因为来源在夜里死亡就默认所有效果立即结束')
  })
  it('confirms zero-target non-use without announcement or authority changes', () => {
    let session = cardinalitySession('pa-xing-du-shi', 'alhadikhia', 12, true)
    const authority = projectCurrentPlayerStates(session), assignments = projectCurrentAssignments(session)
    expect(current(session).item.targetCount).toBe(3)
    expect(current(session).item.storytellerPrompt).toContain('不播报')
    session = actNight(session, { type: 'outcome', outcomeId: 'skip' })
    expect(current(session).draft.targets).toEqual([])
    expect(current(session).draft.informationGiven).toBe('')
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).item.progress).toBe('confirmed')
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
    expect(projectCurrentAssignments(session)).toEqual(assignments)
  })

  it('rejects 1/2 targets and preserves the chosen order of all 3', () => {
    let session = cardinalitySession('pa-xing-du-shi', 'alhadikhia', 12, true)
    const authority = projectCurrentPlayerStates(session)
    for (const seatId of [7, 2]) {
      session = actNight(session, { type: 'target', seatId })
      session = actNight(session, { type: 'outcome', outcomeId: 'record' })
      expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(false)
    }
    session = actNight(session, { type: 'target', seatId: 5 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(current(session).draft.targets).toEqual([7, 2, 5])
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).state.confirmedRecords[current(session).item.id].at(-1)?.snapshot.targets).toEqual([7, 2, 5])
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
  })

  it.each([{ impairments: [] }, { impairments: ['poisoned'] }, { impairments: ['drunk'] }])('retains optional use and impairment evidence in the real AI request: $impairments', ({ impairments }) => {
    const session = cardinalitySession('pa-xing-du-shi', 'alhadikhia', 12, true)
    const { state, item, draft } = current(session)
    const request = buildNightSettlementRequest({ state, item: { ...item, status: { ...item.status, impairments: impairments as ('poisoned' | 'drunk')[] } }, draft })
    expect(request.context.wakeItem.status.impairments).toEqual(impairments)
    expect(request.context.wakeItem.ability).toContain('可以选择三名')
    expect(JSON.stringify(request.context.roleKnowledge)).toContain('不发动时不播报且无人因此死亡')
    expect(JSON.stringify(request.context.roleKnowledge)).toContain('醉酒或中毒时能力完全无效果')
    expect(request.context.draft.targets).toEqual([])
    expect(request.context.roleKnowledge).toBeDefined()
  })
})
