// Integration target: src/domain/scripts/wikiBatch03.test.ts.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from '../../features/setup/smartScriptSetupCandidates'
import { cardinalitySession } from '../../features/night-workbench/state/nightCardinality.test-support'
import { actNight, projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { canConfirmDraft } from '../../features/night-workbench/state/workbenchGuards'
import { nightContextKey } from '../../features/night-workbench/state/gameSessionAdapter'
import { projectKazaliAllocation } from '../../features/game-session/state/applyKazaliAllocation'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../features/game-session/state/projectors'
import { validateTemplateComposition } from '../setup-templates/composition'
import { smartScriptRegistry } from './catalog'
import { getSmartScriptPack } from './index'
import officialNightSheet from '../../features/night-workbench/data/official/nightsheet.json' with { type: 'json' }
import { parseSessionBackup } from '../../services/session/sessionBackup'
import { smartScriptPacks } from './allPacks'
import { buildScriptQualitySummary } from './quality'
import { fengMaoZhiYanSmartScriptPack } from './packs/feng-mao-zhi-yan'
import { tanHuSeBianSmartScriptPack } from './packs/tan-hu-se-bian'
import { yanBuYouZhongSmartScriptPack } from './packs/yan-bu-you-zhong'
import type { SmartScriptPack } from './types'

const packs: readonly SmartScriptPack[] = [fengMaoZhiYanSmartScriptPack, tanHuSeBianSmartScriptPack, yanBuYouZhongSmartScriptPack]
const indices = [480, 560, 604]
const hashes = ['66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab',
  'aff3eded23c576fe55149a470f643b5d2b57d30218b5222106474cea7059e005',
  'f90e3927c1b9aac332d37b29fe5119e82a0bd808d73d8a6dba0ed62ee57fce48']
const minimum = [3, 2, 2, 3, 2, 3, 2, 2, 3]
const nights = [
  ['philosopher alchemist poppygrower lleech courtier godfather harpy chef seamstress noble balloonist', 'philosopher poppygrower courtier innkeeper harpy fanggu vortox ojo lleech assassin godfather hatter sweetheart farmer moonchild flowergirl seamstress juggler balloonist'],
  ['kazali widow witch cerenovus pixie amnesiac fortuneteller dreamer seamstress noble shugenja highpriestess', 'monk witch cerenovus scarletwoman nodashii vortox kazali hatter amnesiac ravenkeeper fortuneteller dreamer seamstress highpriestess'],
  ['kazali yaggababble magician lunatic widow cerenovus pixie amnesiac seamstress balloonist shugenja nightwatchman highpriestess chambermaid', 'cerenovus scarletwoman lunatic imp po yaggababble kazali amnesiac moonchild towncrier seamstress balloonist nightwatchman highpriestess chambermaid'],
]
const sourceFile = (pack: SmartScriptPack, name: string) => readFileSync(resolve(
  process.env.WIKI_BATCH03_DRAFT_ROOT ?? 'src/domain/scripts/packs', pack.scriptId, name))
for (const pack of packs) if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
const canonical = (id: string) => id.replaceAll('_', '').replaceAll('-', '').toLowerCase()
const roster = (pack: SmartScriptPack, seatedOnly = false) => pack.roles.filter((role) =>
  !seatedOnly || !['fabled', 'traveller'].includes(role.team)).map((role) => canonical(role.id)).sort().join('|')

function current(session: ReturnType<typeof cardinalitySession>) {
  const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

function applyOpening(session: ReturnType<typeof cardinalitySession>, retainSeat?: number) {
  const before = projected(session), kazali = before.queue.find((item) => item.roleId === 'kazali')
  if (!kazali) return session
  const pack = packs.find((pack) => pack.scriptId === session.scriptId)!
  const minions = pack.roles.filter((role) => role.team === 'minion').slice(0, kazali.targetRoleChoiceCount)
  const seats = Object.keys(session.seats).map(Number).filter((seat) => seat !== kazali.seatId && seat !== retainSeat)
  session = actNight(actNight(session, { type: 'preview', id: kazali.id }), { type: 'activate-preview' })
  for (const [index, role] of minions.entries()) session = actNight(session, { type: 'target-role-choice', index, seatId: seats[index], roleId: role.id })
  session = actNight(session, { type: 'outcome', outcomeId: 'record' })
  session = actNight(session, { type: 'confirm', advance: false })
  const plan = projectKazaliAllocation(session)!
  expect(plan.blockedReason).toBeFalsy()
  session = gameSessionReducer(session, { type: 'apply-kazali-allocation', nightRunId: plan.run.id,
    sourceEntryId: plan.record!.id, expectedContextKey: nightContextKey(session), confirmedAt: new Date(Date.now() + 1000).toISOString() })
  expect(projectKazaliAllocation(session)?.isApplied).toBe(true)
  return session
}

describe('clocktower-wiki batch 03 source, actual setup candidates and night inputs', () => {
  for (const [index, pack] of packs.entries()) {
    it(`${pack.scriptId} pins original bytes and every reviewed role alias`, () => {
      const bytes = sourceFile(pack, 'source.json'), raw = JSON.parse(bytes.toString())
      const lock = JSON.parse(sourceFile(pack, 'source-lock.json').toString())
      const hash = createHash('sha256').update(bytes).digest('hex')
      expect(hash).toBe(hashes[index])
      expect(pack.source.contentHash).toBe(`sha256:${hash}`)
      expect(lock.rawJsonSha256).toBe(hash)
      expect(lock.rawJsonByteLength).toBe(bytes.length)
      expect(lock.sourceIndex).toBe(indices[index])
      expect(lock.sourceBuild).toBe('16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e')
      expect(lock.officialRoleSnapshotSha256).toBe('6c659354dee75cf3afdeaf6cbc750b274a87d1099cc5f68651a2114881eb85ca')
      expect(lock.officialNightSnapshotSha256).toBe('99a2815bb31bcec3e107bf7f1c2fb305e301d317981d855704d3d954ec4c3f75')
      expect(lock.roleAliases.map((row: { roleId: string }) => row.roleId)).toEqual(pack.roles.map((role) => role.id))
      for (const [i, role] of pack.roles.entries()) {
        const alias = lock.roleAliases[i], original = raw[i + 1]
        expect(alias.rawId).toBe(original.id)
        expect(alias.rawTeam).toBe(role.team)
        expect(alias.officialTeam).toBe(role.team)
        expect(alias.rawAbilitySha256).toBe(createHash('sha256').update(original.ability).digest('hex'))
        expect(alias.officialAbilitySha256).toBe(createHash('sha256').update(alias.officialAbility).digest('hex'))
        expect(alias.newRole).toBe(false)
        expect(role.knowledgeStatus).toBe('confirmed')
        expect(role.research?.sourceUrls.length).toBeGreaterThan(0)
      }
      expect(buildScriptQualitySummary(pack).readiness).toBe('ready')
      expect(pack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual(nights[index][0].split(' '))
      expect(pack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual(nights[index][1].split(' '))
      for (const entries of Object.values(pack.nightOrders)) expect(entries.map((entry) => entry.order)).toEqual(entries.map((_entry, i) => i + 1))
    })

    it(`${pack.scriptId} has no full or playable roster duplicate among existing packs`, () => {
      for (const old of smartScriptPacks as readonly SmartScriptPack[]) {
        if (old.scriptId === pack.scriptId) continue // after integration, allPacks includes this exact pack
        expect(roster(pack), `${old.scriptId}:full`).not.toBe(roster(old))
        expect(roster(pack, true), `${old.scriptId}:playable`).not.toBe(roster(old, true))
      }
    })

    it(`${pack.scriptId} exposes all 22 legal templates through actual assignment and confirmation validation`, () => {
      expect(pack.setupTemplates).toHaveLength(22)
      const byId = new Map(pack.roles.map((role) => [role.id, role]))
      for (const [i, count] of pack.playerCounts.entries()) {
        const templates = pack.setupTemplates.filter((template) => template.playerCount === count)
        expect(templates).toHaveLength(minimum[i])
        expect(new Set(templates.map((template) => [...template.roles].sort().join('|'))).size).toBe(templates.length)
        for (const mixed of [false, true]) for (const seed of ['first', 'second']) {
          const profiles = Array.from({ length: count }, (_value, seat) => ({ seatId: seat + 1,
            experience: mixed ? (['new', 'regular', 'veteran'] as const)[seat % 3] : 'regular' as const }))
          const before = structuredClone(profiles)
          const candidates = createSmartScriptSetupCandidates(pack.scriptId, profiles, { count: 100, seed })
          expect(candidates.map((c) => c.id).sort()).toEqual(templates.map((t) => t.templateId).sort())
          for (const candidate of candidates) {
            expect(candidate.legalityChecks.filter((check) => !check.passed), candidate.id).toEqual([])
            const report = evaluateSmartScriptSetup(pack.scriptId, candidate.assignments, candidate.demonBluffs,
              profiles.map((profile) => profile.seatId), candidate.setupRuleSelections)
            expect(report.checks.filter((check) => !check.passed), candidate.id).toEqual([])
          }
          expect(profiles).toEqual(before)
        }
        for (const template of templates) {
          expect(validateTemplateComposition(pack, template).problems, template.templateId).toEqual([])
          expect(new Set(template.roles).size).toBe(count)
          expect(new Set(template.bluffs).size).toBe(3)
          for (const id of template.bluffs) {
            expect(template.roles).not.toContain(id)
            expect(['townsfolk', 'outsider']).toContain(byId.get(id)?.team)
          }
          if (template.roles.includes('kazali')) {
            expect(template.roles.filter((id) => byId.get(id)?.team === 'minion')).toEqual([])
            expect(template.roles.filter((id) => byId.get(id)?.team === 'demon')).toEqual(['kazali'])
            expect(template.roles.every((id) => id === 'kazali' || ['townsfolk', 'outsider'].includes(byId.get(id)!.team))).toBe(true)
          }
          for (const [roleId, ruleId] of [['godfather', 'godfather-outsiders'], ['fanggu', 'fanggu-outsider'], ['baron', 'baron-outsiders'], ['balloonist', 'balloonist-outsider']]) {
            const adjustment = template.setupAdjustments?.find((row) => row.ruleId === ruleId)
            expect(Boolean(adjustment), `${template.templateId}/${roleId}`).toBe(template.roles.includes(roleId))
            if (adjustment) expect(adjustment.choiceId).toBeTruthy()
          }
        }
      }
    })
  }

  it('covers all 7–15 counts with zero-Minion Kazali openings and explicitly adapts the obsolete Goon jinx', () => {
    for (const pack of [tanHuSeBianSmartScriptPack, yanBuYouZhongSmartScriptPack]) {
      expect(pack.setupTemplates.filter((t) => t.roles.includes('kazali')).map((t) => t.playerCount)).toEqual([7,8,9,10,11,12,13,14,15])
    }
    const lock = JSON.parse(sourceFile(tanHuSeBianSmartScriptPack, 'source-lock.json').toString())
    expect(JSON.stringify(lock.sourceMetaStates)).toContain('卡扎力')
    expect(lock.differences.join('|')).toContain('旧Kazali/Goon相克')
    expect(tanHuSeBianSmartScriptPack.setupRules.find((rule) => rule.id === 'kazali-opening')!.summary).toContain('Goon不阻止')
  })

  it('documents current Alchemist copying and Cerenovus/Goblin jinx with exact official links', () => {
    const rule = fengMaoZhiYanSmartScriptPack.setupRules.find((row) => row.id === 'alchemist-ability')!
    expect(rule.summary).toContain('已在场')
    expect(rule.sourceUrls).toContain('https://wiki.bloodontheclocktower.com/Alchemist')
    expect(yanBuYouZhongSmartScriptPack.setupRules.find((row) => row.id === 'cerenovus-goblin-jinx')!.sourceUrls).toContain('https://wiki.bloodontheclocktower.com/Cerenovus')
    expect(fengMaoZhiYanSmartScriptPack.setupRules.find((row) => row.id === 'hatter-tea-party')!.summary).toContain('先死亡、后成为帽匠不会触发')
  })

  it.each(['tan-hu-se-bian', 'yan-bu-you-zhong'].flatMap((id) => [7,10,15].map((count) => [id,count] as const)))('%s/%s applies the real first-night allocation and preserves official order of new Minions', (id, count) => {
    let session = cardinalitySession(id, 'kazali', count)
    const original = projectCurrentAssignments(session)
    expect(original.filter((assignment) => assignment.role.id === 'kazali')).toHaveLength(1)
    session = applyOpening(session)
    const pack = packs.find((pack) => pack.scriptId === id)!
    const minions = new Set(pack.roles.filter((role) => role.team === 'minion').map((role) => role.id))
    expect(projectCurrentAssignments(session).filter((assignment) => minions.has(assignment.role.id))).toHaveLength(count < 10 ? 1 : count < 13 ? 2 : 3)
    const live = projected(session).queue.filter((item) => item.progress !== 'not_applicable')
    // 知识包的来源快照在上面单独锁定；实际队列用加载后的官方相对夜序，系统信息有独立槽位。
    const roleWakes = live.filter((item) => !item.systemStep)
    const productionOrders = getSmartScriptPack(id).nightOrders.firstNight
    const order = roleWakes.map((item) => productionOrders.find((entry) => entry.roleId === item.roleId)!.order)
    expect(order).toEqual([...order].sort((a,b) => a-b))
    const officialPosition = new Map(officialNightSheet.firstNight.map((roleId, index) => [roleId, index]))
    const fullOrder = live.map((item) => officialPosition.get(item.roleId === 'system-minion-info' ? 'minioninfo'
      : item.roleId === 'system-demon-info' ? 'demoninfo' : item.roleId)!)
    expect(fullOrder.every(Number.isInteger)).toBe(true)
    expect(fullOrder).toEqual([...fullOrder].sort((a,b) => a-b))
    expect(live.filter((item) => item.systemStep).map((item) => item.systemStep!.kind)).toEqual(['minion_info', 'demon_info'])
    const currentAssignments = projectCurrentAssignments(session)
    for (const item of roleWakes) expect(currentAssignments.find((assignment) => assignment.seatId === item.seatId)?.role.id).toBe(item.roleId)
    const changes = currentAssignments.flatMap((assignment) => {
      const fromRole = original.find((prior) => prior.seatId === assignment.seatId)!.role
      return fromRole.id === assignment.role.id ? [] : [{ seatId: assignment.seatId, fromRole, toRole: assignment.role }]
    })
    const statuses = projectCurrentPlayerStates(session)
    for (const change of changes) {
      const oldItem = projected(session).queue.find((item) => !item.systemStep && item.seatId === change.seatId && item.roleId === change.fromRole.id)
      if (oldItem) {
        expect(oldItem).toMatchObject({ progress: 'not_applicable', applicability: 'not_applicable' })
        session = actNight(actNight(session, { type: 'preview', id: oldItem.id }), { type: 'activate-preview' })
        const before = structuredClone(session.timeline)
        session = actNight(actNight(session, { type: 'outcome', outcomeId: 'record' }), { type: 'confirm', advance: false })
        expect(session.timeline).toEqual(before)
      }
      const newItem = projected(session).queue.find((item) => !item.systemStep && item.seatId === change.seatId && item.roleId === change.toRole.id)!
      if (!productionOrders.some((entry) => entry.roleId === change.toRole.id)) {
        expect(newItem).toBeUndefined() // 被动或仅白天发动的爪牙不虚构首夜唤醒。
        continue
      }
      expect(newItem).toBeDefined()
      session = actNight(actNight(session, { type: 'preview', id: newItem.id }), { type: 'activate-preview' })
      for (const target of Object.keys(session.seats).map(Number).filter((seat) => seat !== newItem.seatId).slice(0, newItem.targetCount)) {
        session = actNight(session, { type: 'target', seatId: target })
      }
      if (newItem.roleChoices?.length) session = actNight(session, { type: 'role-choice', roleId: newItem.roleChoices[0].id })
      session = actNight(session, { type: 'storyteller-context', value: '隔离回归由主持确认技能录入；不自动修改状态。' })
      session = actNight(session, { type: 'outcome', outcomeId: 'record' })
      expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
      session = actNight(session, { type: 'confirm', advance: false })
      expect(projected(session).queue.find((item) => item.id === newItem.id)?.progress).toBe('confirmed')
      expect(session.timeline.some((entry) => entry.kind === 'night_action' && entry.wakeItemId === newItem.id)).toBe(true)
    }
    expect(projectCurrentPlayerStates(session)).toEqual(statuses)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it.each([
    ['feng-mao-zhi-yan', 'innkeeper', 12, true, 2],
    ['feng-mao-zhi-yan', 'noble', 15, false, 3],
    ['yan-bu-you-zhong', 'chambermaid', 10, false, 2],
    ['yan-bu-you-zhong', 'seamstress', 15, false, 2],
  ] as const)('%s/%s retains every target through real setup and night reducer without changing authority', (scriptId, roleId, count, otherNight, size) => {
    let session = cardinalitySession(scriptId, roleId, count, otherNight)
    const selected = current(session).item
    if (projected(session).queue.some((item) => item.roleId === 'kazali')) {
      session = applyOpening(session, selected.seatId)
      session = actNight(actNight(session, { type: 'preview', id: selected.id }), { type: 'activate-preview' })
    }
    const timeline = structuredClone(session.timeline)
    const targets = Object.keys(session.seats).map(Number).filter((seat) => seat !== current(session).item.seatId).slice(0, size)
    for (const seatId of targets) session = actNight(session, { type: 'target', seatId })
    expect(current(session).item.targetCount).toBe(size)
    expect(current(session).draft.targets).toEqual(targets)
    let outcomeId = 'record'
    if (roleId === 'chambermaid') {
      session = actNight(session, { type: 'storyteller-context', value: '合成首夜场景：主持确认这两名目标至今均未因自身能力被唤醒，正式告知0。' })
      session = actNight(session, { type: 'information', value: '0' })
    }
    if (roleId === 'seamstress') {
      const assignments = projectCurrentAssignments(session), roles = getSmartScriptPack(scriptId).roles
      const alignments = targets.map((seatId) => ['townsfolk', 'outsider'].includes(roles.find((role) => role.id === assignments.find((assignment) => assignment.seatId === seatId)!.role.id)!.team) ? '善良' : '邪恶')
      outcomeId = alignments[0] === alignments[1] ? 'yes' : 'no'
      session = actNight(session, { type: 'storyteller-context', value: `合成首夜场景：目标当前阵营依次为${alignments.join('、')}；主持确认没有阵营变化、毒醉或误登记，正式回答${outcomeId === 'yes' ? '是' : '否'}。` })
    }
    session = actNight(session, { type: 'outcome', outcomeId })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    if (roleId === 'chambermaid') expect(current(session).draft.informationGiven).toBe('0')
    if (roleId === 'seamstress') expect(current(session).draft.informationGiven).toBe(outcomeId === 'yes' ? '是。' : '否。')
    expect(session.timeline).toEqual(timeline)
  })
})
