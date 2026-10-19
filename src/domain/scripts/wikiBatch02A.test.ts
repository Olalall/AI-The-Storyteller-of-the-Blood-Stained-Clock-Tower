// Integration target: src/domain/scripts/wikiBatch02A.test.ts.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from '../../features/setup/smartScriptSetupCandidates'
import { cardinalitySession } from '../../features/night-workbench/state/nightCardinality.test-support'
import { actNight, projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { canConfirmDraft } from '../../features/night-workbench/state/workbenchGuards'
import { projectCurrentPlayerStates } from '../../features/game-session/state/projectors'
import { validateTemplateComposition } from '../setup-templates/composition'
import { smartScriptRegistry } from './catalog'
import { buildScriptQualitySummary } from './quality'
import { localizedRoleAbility } from './role-copy'
import { confirmedRoleFactsForScript } from './role-facts'
import { jiuRiShuShiSmartScriptPack } from './packs/jiu-ri-shu-shi'
import { zhuiFengZhuRiSmartScriptPack } from './packs/zhui-feng-zhu-ri'
import { xiongGuiNanBianSmartScriptPack } from './packs/xiong-gui-nan-bian'
import { weiWangGuiLaiSmartScriptPack } from './packs/wei-wang-gui-lai'
import { huaWaiZhiMinSmartScriptPack } from './packs/hua-wai-zhi-min'
import { baoMengMiTuanRoles } from './packs/bao-meng-mi-tuan/roles'
import { jingHouJiaYinRoles } from './packs/jing-hou-jia-yin/roles'
import { yuZheHuanYanRoles } from './packs/yu-zhe-huan-yan/roles'
import type { SmartScriptPack } from './types'

const packs: readonly SmartScriptPack[] = [jiuRiShuShiSmartScriptPack, zhuiFengZhuRiSmartScriptPack,
  xiongGuiNanBianSmartScriptPack, weiWangGuiLaiSmartScriptPack, huaWaiZhiMinSmartScriptPack]
const minimum = [3, 2, 2, 3, 2, 3, 2, 2, 3]
const hashes = [
  'e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7',
  'a6e65b08c24c8b8c43bd5bf5f8bed1d515a34d3f6d735c6f8a66713811ef030c',
  'f19e62de0b9e10b650211a2fa0df628ea0297cc1769be4bb50a915ac8e4b732a',
  '7a0921d4f3b7ca391a608e681a59345fee7d5a1b3eb2498d08d7eebe8385aa93',
  '92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c',
]
const nights = [
  ['poisoner godfather librarian investigator chef empath grandmother seamstress', 'poisoner gambler monk scarletwoman imp fanggu vortox assassin godfather barber grandmother ravenkeeper empath flowergirl oracle seamstress'],
  ['godfather devilsadvocate pukka chef fortuneteller grandmother seamstress chambermaid', 'gambler devilsadvocate scarletwoman pukka po fanggu vortox assassin godfather barber grandmother ravenkeeper fortuneteller flowergirl oracle seamstress juggler chambermaid'],
  ['philosopher yaggababble godfather witch cerenovus harpy investigator empath seamstress knight balloonist nightwatchman chambermaid', 'philosopher monk witch cerenovus harpy scarletwoman shabaloth nodashii yaggababble godfather gossip hatter tinker ravenkeeper empath seamstress balloonist nightwatchman chambermaid'],
  ['alchemist poisoner widow pixie amnesiac grandmother noble vizier', 'poisoner gambler monk po nodashii vortox assassin gossip amnesiac farmer moonchild grandmother flowergirl'],
  ['widow godfather organgrinder pukka pixie amnesiac librarian dreamer seamstress noble balloonist shugenja general', 'organgrinder imp pukka fanggu nodashii assassin godfather gossip amnesiac dreamer towncrier seamstress juggler balloonist general'],
]
const sourceFile = (pack: SmartScriptPack, name: string) => readFileSync(resolve(
  process.env.WIKI_BATCH_02_DRAFT_ROOT ?? 'src/domain/scripts/packs', pack.scriptId, name))
for (const pack of packs) if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)

function current(session: ReturnType<typeof cardinalitySession>) {
  const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

describe('clocktower-wiki batch 02 A source, candidates and real night inputs', () => {
  for (const [index, pack] of packs.entries()) {
    it(`${pack.scriptId} locks actual source bytes and reviewed stable aliases`, () => {
      const raw = sourceFile(pack, 'source.json'), source = JSON.parse(raw.toString())
      const lock = JSON.parse(sourceFile(pack, 'source-lock.json').toString())
      const hash = createHash('sha256').update(raw).digest('hex')
      expect(hash).toBe(hashes[index])
      expect(pack.source.contentHash).toBe(`sha256:${hash}`)
      expect(lock.rawJsonSha256).toBe(hash)
      expect(lock.rawJsonByteLength).toBe(raw.length)
      expect(lock.sourceIndex).toBe([321, 324, 489, 538, 543][index])
      expect(lock.sourceBuild).toBe('16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e')
      expect(lock.rulesVersion).toContain('2026-10-16当前官方规则适配')
      expect(lock.roleAliases.map((row: { roleId: string }) => row.roleId)).toEqual(pack.roles.map((role) => role.id))
      for (const [roleIndex, role] of pack.roles.entries()) {
        const alias = lock.roleAliases[roleIndex], sourceRole = source[roleIndex + 1]
        expect(alias.rawId).toBe(sourceRole.id)
        expect(alias.rawTeam).toBe(role.team)
        expect(alias.officialTeam).toBe(role.team)
        expect(alias.rawAbilitySha256).toBe(createHash('sha256').update(sourceRole.ability).digest('hex'))
        expect(alias.officialAbilitySha256).toBe(createHash('sha256').update(alias.officialAbility).digest('hex'))
        expect(alias.newRole).toBe(false)
      }
    })

    it(`${pack.scriptId} reuses current objects and the pinned official night sheet`, () => {
      for (const role of pack.roles) {
        const extended = role.id === 'djinn' ? baoMengMiTuanRoles : role.id === 'hatter' ? jingHouJiaYinRoles : yuZheHuanYanRoles
        const expected = ['djinn', 'hatter', 'organgrinder'].includes(role.id)
          ? extended.find((candidate) => candidate.id === role.id) : confirmedRoleFactsForScript([role.id])[0]
        expect(role).toBe(expected)
        expect(role.knowledgeStatus).toBe('confirmed')
        expect(role.research?.sourceUrls.length).toBeGreaterThan(0)
      }
      expect(buildScriptQualitySummary(pack).readiness).toBe('ready')
      expect(pack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual(nights[index][0].split(' '))
      expect(pack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual(nights[index][1].split(' '))
      for (const entries of Object.values(pack.nightOrders)) expect(entries.map((entry) => entry.order)).toEqual(entries.map((_entry, i) => i + 1))
    })

    it(`${pack.scriptId} exposes all 22 legal templates after production assignment and initial confirmation checks`, () => {
      expect(pack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
      expect(pack.setupTemplates).toHaveLength(22)
      for (const [countIndex, count] of pack.playerCounts.entries()) {
        const templates = pack.setupTemplates.filter((template) => template.playerCount === count)
        expect(templates).toHaveLength(minimum[countIndex])
        expect(new Set(templates.map((template) => [...template.roles].sort().join('|'))).size).toBe(templates.length)
        for (const mixed of [false, true]) for (const seed of ['first', 'second']) {
          const profiles = Array.from({ length: count }, (_value, i) => ({ seatId: i + 1,
            experience: mixed ? (['new', 'regular', 'veteran'] as const)[i % 3] : 'regular' as const }))
          const before = structuredClone(profiles)
          const candidates = createSmartScriptSetupCandidates(pack.scriptId, profiles, { count: 100, seed })
          expect(candidates.map((candidate) => candidate.id).sort()).toEqual(templates.map((template) => template.templateId).sort())
          for (const candidate of candidates) {
            expect(candidate.legalityChecks.every((check) => check.passed), candidate.id).toBe(true)
            const report = evaluateSmartScriptSetup(pack.scriptId, candidate.assignments, candidate.demonBluffs,
              profiles.map((profile) => profile.seatId), candidate.setupRuleSelections)
            expect(report.checks.filter((check) => !check.passed), candidate.id).toEqual([])
          }
          expect(profiles).toEqual(before)
        }
      }
      const byId = new Map(pack.roles.map((role) => [role.id, role]))
      for (const template of pack.setupTemplates) {
        expect(validateTemplateComposition(pack, template).problems, template.templateId).toEqual([])
        expect(new Set(template.roles).size).toBe(template.playerCount)
        expect(new Set(template.bluffs).size).toBe(3)
        for (const id of template.bluffs) {
          expect(template.roles).not.toContain(id)
          expect(['townsfolk', 'outsider']).toContain(byId.get(id)?.team)
        }
        for (const [roleId, ruleId] of [['godfather', 'godfather-outsiders'], ['fanggu', 'fanggu-outsider'], ['baron', 'baron-outsiders'], ['balloonist', 'balloonist-outsider']]) {
          const adjustment = template.setupAdjustments?.find((row) => row.ruleId === ruleId)
          expect(Boolean(adjustment), `${template.templateId}/${roleId}`).toBe(template.roles.includes(roleId))
          if (adjustment) expect(adjustment.choiceId).toBeTruthy()
        }
      }
    })
  }

  it('retains both optional Balloonist choices and both mandatory Godfather directions', () => {
    for (const ruleId of ['balloonist-outsider', 'godfather-outsiders']) {
      const choices = new Set(packs.flatMap((pack) => pack.setupTemplates.flatMap((template) =>
        template.setupAdjustments?.filter((row) => row.ruleId === ruleId).map((row) => row.choiceId) ?? [])))
      expect(choices).toContain(ruleId === 'balloonist-outsider' ? 'keep-outsiders' : 'remove-one-outsider')
      expect(choices).toContain('add-one-outsider')
    }
  })

  it('adapts old Balloonist text explicitly and does not merge Investigator with Librarian', () => {
    const lock = JSON.parse(sourceFile(huaWaiZhiMinSmartScriptPack, 'source-lock.json').toString())
    const balloonist = lock.roleAliases.find((row: { roleId: string }) => row.roleId === 'balloonist')
    expect(balloonist.rawAbility).toContain('+1')
    expect(balloonist.officialAbility).toContain('last night')
    expect(balloonist.officialAbility).toContain('+0 or +1 Outsider')
    for (const pack of [jiuRiShuShiSmartScriptPack, xiongGuiNanBianSmartScriptPack]) {
      const investigator = pack.roles.find((role) => role.id === 'investigator')!
      expect(investigator.abilityText).not.toContain('zero')
      expect(localizedRoleAbility(investigator)).not.toContain('没有爪牙')
    }
    expect(weiWangGuiLaiSmartScriptPack.roles.find((role) => role.id === 'alchemist')!.abilityText).toContain('When using this')
    expect(weiWangGuiLaiSmartScriptPack.setupRules.find((rule) => rule.id === 'vizier-execution')!.summary).toContain('不受半数或最高票限制')
    expect(weiWangGuiLaiSmartScriptPack.setupTemplates.every((template) => !template.roles.includes('amnesiac'))).toBe(true)
  })

  it.each([
    ['zhui-feng-zhu-ri', 'chambermaid', 7, false, 2],
    ['xiong-gui-nan-bian', 'shabaloth', 7, true, 2],
    ['xiong-gui-nan-bian', 'knight', 15, false, 2],
    ['wei-wang-gui-lai', 'noble', 15, false, 3],
    ['hua-wai-zhi-min', 'noble', 15, false, 3],
  ] as const)('%s/%s retains every target through real setup, night queue and reducer', (scriptId, roleId, count, otherNight, size) => {
    let session = cardinalitySession(scriptId, roleId, count, otherNight)
    const authority = structuredClone(session.timeline)
    const targets = Object.keys(session.seats).map(Number).filter((id) => id !== current(session).item.seatId).slice(0, size)
    for (const seatId of targets) session = actNight(session, { type: 'target', seatId })
    expect(current(session).item.targetCount).toBe(size)
    expect(current(session).draft.targets).toEqual(targets)
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    expect(session.timeline).toEqual(authority)
  })

  it.each(['zhui-feng-zhu-ri', 'wei-wang-gui-lai'])('%s Po modes remain explicit and never auto-apply attacks', (scriptId) => {
    let session = cardinalitySession(scriptId, 'po', 7, true)
    const authority = projectCurrentPlayerStates(session)
    expect(current(session).item.allowedTargetCounts).toEqual([0, 1, 3])
    for (const size of [0, 1, 3]) {
      session = actNight(session, { type: 'target-count-choice', count: size })
      for (let seatId = 1; seatId <= size; seatId++) session = actNight(session, { type: 'target', seatId })
      session = actNight(session, { type: 'outcome', outcomeId: 'record' })
      expect(current(session).draft.targets).toHaveLength(size)
      expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
      session = actNight(session, { type: 'clear-draft' })
    }
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
  })

  it('Hua Wai Organ Grinder records the current self-drunk choice without changing game authority', () => {
    let session = cardinalitySession('hua-wai-zhi-min', 'organgrinder', 15)
    const before = projectCurrentPlayerStates(session)
    expect(current(session).item.targetCount).toBe(0)
    expect(current(session).item.outcomeOptions.map((option) => option.id)).toEqual(['choose-drunk', 'choose-sober'])
    session = actNight(session, { type: 'outcome', outcomeId: 'choose-drunk' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).draft.storytellerResult).toContain('选择醉酒')
    expect(projectCurrentPlayerStates(session)).toEqual(before)
  })
})
