import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from '../../features/setup/smartScriptSetupCandidates'
import { actualCompositionForTemplate, validateTemplateComposition } from '../setup-templates/composition'
import { inferModifierRoleId, isMandatorySetupCountRole } from '../setup-templates/setupCountChanges'
import { smartScriptRegistry } from './catalog'
import { catfishingSmartScriptPack } from './packs/catfishing'
import { badMoonRisingSmartScriptPack } from './packs/bad-moon-rising'
import { punchySmartScriptPack } from './packs/punchy'
import { gaiTouHuanMianSmartScriptPack } from './packs/gai-tou-huan-mian'
import type { SmartScriptPack } from './types'

const packs: readonly SmartScriptPack[] = [catfishingSmartScriptPack, badMoonRisingSmartScriptPack,
  punchySmartScriptPack, gaiTouHuanMianSmartScriptPack]
for (const pack of packs) if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
const repaired = [
  ['catfishing', 'catfishing-13-vigormortis-balance', [9, 0, 3, 1], ['snakecharmer', 'philosopher', 'ravenkeeper']],
  ['catfishing', 'catfishing-14-vigormortis-long-game', [10, 0, 3, 1], ['philosopher', 'ravenkeeper', 'amnesiac']],
  ['bad-moon-rising', 'bad-moon-rising-11-pukka-minstrel', [6, 2, 2, 1], ['grandmother', 'chambermaid', 'innkeeper']],
  ['bad-moon-rising', 'bad-moon-rising-14-po-vote-endgame', [8, 2, 3, 1], ['grandmother', 'innkeeper', 'gambler']],
  ['punchy', 'punchy-9-nine-vigor', [6, 1, 1, 1], ['steward', 'pixie', 'balloonist']],
  ['gai-tou-huan-mian', 'gai-tou-huan-mian-7-3', [3, 2, 1, 1], ['wudaozhe', 'gambler', 'dreamer']],
  ['gai-tou-huan-mian', 'gai-tou-huan-mian-8-3', [2, 4, 1, 1], ['savant', 'wudaozhe', 'gambler']],
  ['gai-tou-huan-mian', 'gai-tou-huan-mian-9-3', [4, 3, 1, 1], ['savant', 'wudaozhe', 'gambler']],
  ['gai-tou-huan-mian', 'gai-tou-huan-mian-10-2', [4, 3, 2, 1], ['wudaozhe', 'gambler', 'dreamer']],
  ['gai-tou-huan-mian', 'gai-tou-huan-mian-11-2', [6, 2, 2, 1], ['dreamer', 'noble', 'atheist']],
  ['gai-tou-huan-mian', 'gai-tou-huan-mian-11-3', [4, 4, 2, 1], ['gambler', 'dreamer', 'noble']],
  ['gai-tou-huan-mian', 'gai-tou-huan-mian-12-2', [6, 3, 2, 1], ['dreamer', 'noble', 'atheist']],
  ['gai-tou-huan-mian', 'gai-tou-huan-mian-12-3', [6, 3, 2, 1], ['gambler', 'dreamer', 'noble']],
] as const

describe('mandatory setup modifier data repairs preserve real candidates', () => {
  it.each(repaired)('%s/%s keeps its original three bluffs and the sourced actual counts', (scriptId, templateId, counts, bluffs) => {
    const pack = smartScriptRegistry.get(scriptId)!
    const template = pack.setupTemplates.find((entry) => entry.templateId === templateId)!
    expect(template).toBeTruthy()
    const expected = { townsfolk: counts[0], outsider: counts[1], minion: counts[2], demon: counts[3] }
    expect(actualCompositionForTemplate(pack, template)).toEqual(expected)
    expect(validateTemplateComposition(pack, template)).toMatchObject({ valid: true, expected, actual: expected })
    expect(template.bluffs).toEqual(bluffs)
    expect(new Set(template.roles).size).toBe(template.playerCount)
    for (const roleId of template.roles.filter(isMandatorySetupCountRole)) {
      const adjustment = template.setupAdjustments?.find((entry) => inferModifierRoleId(entry.ruleId, pack) === roleId)
      expect(adjustment?.choiceId, `${templateId}/${roleId}`).toBeTruthy()
    }
    for (const bluffId of bluffs) {
      expect(template.roles).not.toContain(bluffId)
      expect(['townsfolk', 'outsider']).toContain(pack.roles.find((role) => role.id === bluffId)?.team)
    }
    for (const mixed of [false, true]) for (const seed of ['mandatory-first', 'mandatory-second']) {
      const profiles = Array.from({ length: template.playerCount }, (_value, index) => ({ seatId: index + 1,
        experience: mixed ? (['new', 'regular', 'veteran'] as const)[index % 3] : 'regular' as const }))
      const before = structuredClone(profiles)
      const candidate = createSmartScriptSetupCandidates(scriptId, profiles, { count: 100, seed }).find((entry) => entry.id === templateId)
      expect(candidate, `must remain visible ${templateId}/${mixed}/${seed}`).toBeTruthy()
      const report = evaluateSmartScriptSetup(scriptId, candidate!.assignments, candidate!.demonBluffs,
        profiles.map((profile) => profile.seatId), candidate!.setupRuleSelections)
      expect(report.expectedCounts).toEqual(expected)
      expect(report.checks.filter((check) => !check.passed && check.status !== 'review')).toEqual([])
      expect(candidate!.assignments.map((assignment) => assignment.role.id).sort()).toEqual([...template.roles].sort())
      expect(profiles).toEqual(before)
    }
  })

  it('keeps all 98 templates in the four packs visible across 7–15 players instead of hiding broken rows', () => {
    expect(packs.map((pack) => pack.setupTemplates.length)).toEqual([27, 22, 22, 27])
    for (const pack of packs) for (const count of pack.playerCounts) {
      const profiles = Array.from({ length: count }, (_value, index) => ({ seatId: index + 1,
        experience: (['new', 'regular', 'veteran'] as const)[index % 3] }))
      const candidates = createSmartScriptSetupCandidates(pack.scriptId, profiles, { count: 100, seed: 'mandatory-all-visible' })
      expect(candidates.map((entry) => entry.id).sort()).toEqual(pack.setupTemplates
        .filter((template) => template.playerCount === count).map((template) => template.templateId).sort())
    }
  })

  it.each(repaired.slice(0, 2))('%s/%s does not double-remove an Outsider or add an extra Townsfolk', (scriptId, templateId) => {
    const pack = smartScriptRegistry.get(scriptId)!, template = pack.setupTemplates.find((entry) => entry.templateId === templateId)!
    const godfather = template.setupAdjustments!.find((entry) => entry.ruleId === 'godfather-outsider')!
    expect(godfather).toMatchObject({ choiceId: 'remove-outsider', compositionDelta: { townsfolk: 1, outsider: -1 } })
    // The nominal source fact remains -1; actual bounded removal is zero after the other modifiers.
    expect(template.setupAdjustments!.find((entry) => entry.ruleId === 'vigormortis-outsider')!.compositionDelta).toEqual({ townsfolk: 1, outsider: -1 })
    expect(validateTemplateComposition(pack, { ...template, setupAdjustments: [...template.setupAdjustments!].reverse() }).valid).toBe(true)
    const profiles = Array.from({ length: template.playerCount }, (_value, index) => ({ seatId: index + 1, experience: 'regular' as const }))
    const candidate = createSmartScriptSetupCandidates(scriptId, profiles, { count: 100 }).find((entry) => entry.id === templateId)!
    const report = evaluateSmartScriptSetup(scriptId, candidate.assignments, candidate.demonBluffs,
      profiles.map((profile) => profile.seatId), [...candidate.setupRuleSelections!].reverse())
    expect(report.checks.find((check) => check.id === 'modifier-vigormortis-outsider')?.summary).toContain('无可移除外来者，不增加镇民')
  })

  it('replaces only the impossible Baron/Fang Gu combinations and preserves Atheist bluff semantics', () => {
    const pack: SmartScriptPack = gaiTouHuanMianSmartScriptPack
    const nine = pack.setupTemplates.find((template) => template.templateId === 'gai-tou-huan-mian-9-3')!
    const twelve = pack.setupTemplates.find((template) => template.templateId === 'gai-tou-huan-mian-12-3')!
    expect(pack.roles.filter((role) => role.team === 'outsider')).toHaveLength(4)
    for (const template of [nine, twelve]) {
      expect(template.roles).toContain('fanggu')
      expect(template.roles).not.toContain('baron')
      expect(template.setupAdjustments?.some((entry) => entry.ruleId === 'baron-plus-two-outsiders')).toBe(false)
    }
    expect(nine.roles).toContain('poisoner')
    expect(twelve.roles).toContain('pithag')
    expect(pack.setupTemplates.every((template) => !template.roles.includes('atheist'))).toBe(true)
    expect(pack.setupTemplates.some((template) => template.bluffs.includes('atheist'))).toBe(true)
  })

  it('requires the repaired source choices on a new draft rather than silently treating them as optional', () => {
    for (const [scriptId, templateId] of repaired) {
      const pack = smartScriptRegistry.get(scriptId)!, template = pack.setupTemplates.find((entry) => entry.templateId === templateId)!
      const profiles = Array.from({ length: template.playerCount }, (_value, index) => ({ seatId: index + 1, experience: 'regular' as const }))
      const candidate = createSmartScriptSetupCandidates(scriptId, profiles, { count: 100 }).find((entry) => entry.id === templateId)!
      const mandatory = template.setupAdjustments!.filter((entry) => isMandatorySetupCountRole(inferModifierRoleId(entry.ruleId, pack)))
      expect(mandatory.length).toBeGreaterThan(0)
      for (const adjustment of mandatory) {
        const selections = candidate.setupRuleSelections!.filter((entry) => entry.ruleId !== adjustment.ruleId)
        const report = evaluateSmartScriptSetup(scriptId, candidate.assignments, candidate.demonBluffs, profiles.map((profile) => profile.seatId), selections)
        expect(report.checks.find((check) => check.id === `modifier-${adjustment.ruleId}`)?.passed, `${templateId}/${adjustment.ruleId}`).toBe(false)
      }
    }
  })
})
