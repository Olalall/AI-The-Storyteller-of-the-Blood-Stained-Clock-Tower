// Integration target: src/features/setup/setupCountBounds.test.ts
import { describe, expect, it } from 'vitest'
import { baseCompositionForPlayerCount, expectedCompositionForTemplate, validateTemplateComposition } from '../../domain/setup-templates/composition'
import { boundedSetupTransferForRole, resolveSetupCountChanges } from '../../domain/setup-templates/setupCountChanges'
import { catfishingSmartScriptPack } from '../../domain/scripts/packs/catfishing'
import { troubleBrewingSmartScriptPack } from '../../domain/scripts/packs/trouble-brewing'
import { yeJingGengShenSmartScriptPack } from '../../domain/scripts/packs/ye-jing-geng-shen'
import { yiZhiDuXiuSmartScriptPack } from '../../domain/scripts/packs/yi-zhi-du-xiu'
import { smartScriptRegistry } from '../../domain/scripts'
import type { PlayerCount, SetupTemplate, SmartScriptPack } from '../../domain/scripts'
import { catfishingSetupRulePack } from './catfishingSetupRules'
import { createSetupRulePackForScript, evaluateSmartScriptSetup } from './smartScriptSetupCandidates'
import { evaluateSetupRules, hasBlockingSetupIssue } from './setupRuleEvaluator'
import type { RoleSnapshot } from '../night-workbench/types'

const nominal = { townsfolk: 1, outsider: -1 }
const vigorChange = { delta: nominal, boundedTransfer: boundedSetupTransferForRole('vigormortis', nominal) }
for (const pack of [troubleBrewingSmartScriptPack, yeJingGengShenSmartScriptPack, yiZhiDuXiuSmartScriptPack]) {
  if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
}
function snapshot(pack: SmartScriptPack, id: string): RoleSnapshot {
  const role = pack.roles.find((item) => item.id === id)!
  return { id, name: role.name, initial: role.name.slice(0, 1), iconPath: role.iconPath ?? '' }
}
function board(pack: SmartScriptPack, ids: readonly string[]) {
  const assignments = ids.map((id, index) => ({ seatId: index + 1, role: snapshot(pack, id) }))
  const demonBluffs = pack.roles.filter((role) => role.team === 'townsfolk' && !ids.includes(role.id)).slice(0, 3).map((role) => snapshot(pack, role.id))
  return { assignments, demonBluffs, seats: ids.map((_id, i) => i + 1) }
}
function vigorBoard(count: PlayerCount) {
  const base = baseCompositionForPlayerCount(count)
  const removed = Math.min(base.outsider, 1)
  const expected = { ...base, townsfolk: base.townsfolk + removed, outsider: base.outsider - removed }
  const pack = catfishingSmartScriptPack
  const townsfolk = pack.roles.filter((role) => role.team === 'townsfolk' && role.id !== 'balloonist').slice(0, expected.townsfolk).map((role) => role.id)
  const outsiders = pack.roles.filter((role) => role.team === 'outsider').slice(0, expected.outsider).map((role) => role.id)
  const minions = pack.roles.filter((role) => role.team === 'minion' && role.id !== 'godfather').slice(0, expected.minion).map((role) => role.id)
  const ids = [...townsfolk, ...outsiders, ...minions, 'vigormortis']
  expect(ids).toHaveLength(count)
  const built = board(pack, ids)
  const template: SetupTemplate = { templateId: `bounded-vigor-${count}`, scriptId: pack.scriptId, playerCount: count, style: 'balanced', roles: ids, bluffs: built.demonBluffs.map((role) => role.id), notes: [], verified: true,
    setupAdjustments: [{ ruleId: 'vigormortis-outsider', choiceId: 'remove-outsider', compositionDelta: nominal }] }
  return { ...built, pack, expected, template, selections: [{ ruleId: 'vigormortis-outsider', choiceId: 'remove-outsider' }] }
}
function permutations<T>(items: readonly T[]): T[][] {
  return items.length ? items.flatMap((item, index) => permutations(items.filter((_v, i) => i !== index)).map((rest) => [item, ...rest])) : [[]]
}

describe('source-backed bounded setup counts and required selections', () => {
  it.each([7, 10, 13] as const)('%i-player zero-Outsider Vigormortis changes neither Outsiders nor Townsfolk', (count) => {
    const data = vigorBoard(count)
    expect(expectedCompositionForTemplate(data.template, data.pack)).toEqual(data.expected)
    expect(validateTemplateComposition(data.pack, data.template).valid).toBe(true)
    const report = evaluateSmartScriptSetup(data.pack.scriptId, data.assignments, data.demonBluffs, data.seats, data.selections)
    expect(report.expectedCounts).toEqual(data.expected)
    expect(hasBlockingSetupIssue(report)).toBe(false)
    expect(report.checks.find((check) => check.id === 'modifier-vigormortis-outsider')?.summary).toContain('无可移除外来者，不增加镇民')
    expect(data.template.setupAdjustments![0].compositionDelta).toEqual(nominal)
  })
  it.each([8, 11, 14] as const)('%i-player Vigormortis really replaces the existing Outsider', (count) => {
    const data = vigorBoard(count)
    expect(validateTemplateComposition(data.pack, data.template).valid).toBe(true)
    const report = evaluateSmartScriptSetup(data.pack.scriptId, data.assignments, data.demonBluffs, data.seats, data.selections)
    expect(report.expectedCounts).toEqual(data.expected)
    expect(report.expectedCounts?.outsider).toBe(0)
    expect(hasBlockingSetupIssue(report)).toBe(false)
  })
  it('keeps the legacy optional-pack API for ordinary changes', () => {
    const data = vigorBoard(7)
    const template = { ...data.template, setupAdjustments: [{ ruleId: 'ordinary', compositionDelta: { townsfolk: -2, outsider: 2 } }] }
    expect(expectedCompositionForTemplate(template)).toEqual({ townsfolk: 3, outsider: 2, minion: 1, demon: 1 })
  })
  it.each([
    ['Baron', 0, [{ townsfolk: -2, outsider: 2 }], 1],
    ['Balloonist', 0, [{ townsfolk: -1, outsider: 1 }], 0],
    ['Godfather plus', 0, [{ townsfolk: -1, outsider: 1 }], 0],
    ['Godfather minus', 1, [{ townsfolk: 1, outsider: -1 }], 0],
    ['Baron/Godfather plus', 0, [{ townsfolk: -2, outsider: 2 }, { townsfolk: -1, outsider: 1 }], 2],
    ['Baron/Godfather minus', 0, [{ townsfolk: -2, outsider: 2 }, { townsfolk: 1, outsider: -1 }], 0],
  ] as const)('%s combines ordinary deltas before bounded removal independently of order', (_label, baseOutsiders, ordinary, expectedOutsiders) => {
    const base = { townsfolk: 7, outsider: baseOutsiders, minion: 2, demon: 1 }
    const total = Object.values(base).reduce((sum, value) => sum + value, 0)
    const changes = [...ordinary.map((delta) => ({ delta })), vigorChange]
    for (const order of permutations(changes)) {
      const resolved = resolveSetupCountChanges(base, order)
      expect(resolved.counts.outsider).toBe(expectedOutsiders)
      expect(Object.values(resolved.counts).reduce((sum, value) => sum + value, 0)).toBe(total)
    }
  })
  it('does not clamp arbitrary negative deltas or infer this exception for another role', () => {
    const base = baseCompositionForPlayerCount(7)
    expect(boundedSetupTransferForRole('godfather', nominal)).toBeUndefined()
    expect(boundedSetupTransferForRole('vigormortis', {})).toBeUndefined()
    expect(resolveSetupCountChanges(base, [{ delta: nominal }]).counts).toEqual({ townsfolk: 6, outsider: -1, minion: 1, demon: 1 })
    expect(resolveSetupCountChanges(base, [{ delta: { townsfolk: 1, outsider: -1 } }, vigorChange]).counts.outsider).toBe(-1)
  })
  it('shares the bounded operation through both generic projections and the dedicated Catfishing rules', () => {
    const data = vigorBoard(7)
    const generic = createSetupRulePackForScript(data.pack)
    expect(generic.modifiers.find((rule) => rule.roleId === 'vigormortis')?.choices[0].boundedTransfer).toBeTruthy()
    const fallbackPack = { ...data.pack, setupRules: data.pack.setupRules.filter((rule) => rule.roleId !== 'vigormortis') }
    expect(createSetupRulePackForScript(fallbackPack).modifiers.find((rule) => rule.roleId === 'vigormortis')?.choices[0].boundedTransfer).toBeTruthy()
    expect(expectedCompositionForTemplate(data.template, fallbackPack)).toEqual(data.expected)
    const report = evaluateSetupRules({ assignments: data.assignments, demonBluffs: data.demonBluffs, expectedSeatIds: data.seats, playerCount: 7, rulePack: catfishingSetupRulePack, selections: data.selections, teamForRole: Object.fromEntries(data.pack.roles.map((role) => [role.id, role.team])) as Record<string, 'townsfolk' | 'outsider' | 'minion' | 'demon'> })
    expect(report.expectedCounts).toEqual(data.expected)
    expect(hasBlockingSetupIssue(report)).toBe(false)
  })
  it('rejects a nominal zero-removal Vigormortis template even when its unmodified counts match', () => {
    const data = vigorBoard(7)
    const invalid = { ...data.template, setupAdjustments: [{ ruleId: 'vigormortis-outsider', choiceId: 'zero-removal', compositionDelta: {} }] }
    expect(validateTemplateComposition(data.pack, invalid).valid).toBe(false)
  })
  it('rejects an accidental zero choice for a new eight-player one-Outsider draft', () => {
    const pack = catfishingSmartScriptPack
    const template = pack.setupTemplates.find((item) => item.templateId === 'catfishing-8-classic-info')!
    const data = board(pack, template.roles.map((id) => id === 'imp' ? 'vigormortis' : id))
    const rules = structuredClone(catfishingSetupRulePack)
    const modifier = rules.modifiers.find((rule) => rule.roleId === 'vigormortis')!
    const zero = { id: 'zero-removal', label: 'zero-removal', delta: {} }
    const rulePack = { ...rules, modifiers: rules.modifiers.map((rule) => rule.id === modifier.id ? { ...rule, choices: [...rule.choices, zero] } : rule) }
    const report = evaluateSetupRules({ assignments: data.assignments, demonBluffs: data.demonBluffs, expectedSeatIds: data.seats, playerCount: 8, rulePack, selections: [{ ruleId: modifier.id, choiceId: zero.id }], teamForRole: Object.fromEntries(pack.roles.map((role) => [role.id, role.team])) as Record<string, 'townsfolk' | 'outsider' | 'minion' | 'demon'> })
    expect(hasBlockingSetupIssue(report)).toBe(true)
  })
  it.each(['vigormortis', 'fanggu', 'godfather'] as const)('blocks a manual Imp/Minion → %s new draft without its required source selection', (changedRole) => {
    const pack = catfishingSmartScriptPack
    const template = pack.setupTemplates.find((item) => item.templateId === 'catfishing-8-classic-info')!
    const ids = template.roles.map((id) => changedRole === 'godfather' ? id === 'cerenovus' ? changedRole : id : id === 'imp' ? changedRole : id)
    const data = board(pack, ids)
    const before = structuredClone(data)
    const report = evaluateSmartScriptSetup(pack.scriptId, data.assignments, data.demonBluffs, data.seats, [])
    expect(report.checks.some((check) => check.status === 'needs_choice' && check.detail?.includes('重新生成候选'))).toBe(true)
    expect(hasBlockingSetupIssue(report)).toBe(true)
    expect(data).toEqual(before)
  })
  it('blocks a manual ordinary Minion → Baron new draft without its mandatory adjustment', () => {
    const pack = troubleBrewingSmartScriptPack
    const team = Object.fromEntries(pack.roles.map((role) => [role.id, role.team]))
    const template = pack.setupTemplates.find((item) => item.playerCount === 7 && !item.roles.includes('baron'))!
    const data = board(pack, template.roles.map((id) => team[id] === 'minion' ? 'baron' : id))
    const report = evaluateSmartScriptSetup(pack.scriptId, data.assignments, data.demonBluffs, data.seats)
    expect(report.checks.some((check) => check.status === 'needs_choice')).toBe(true)
  })
  it('retains old confirmed-source selections and snapshots without introducing a new required choice', () => {
    const pack = catfishingSmartScriptPack
    const template = pack.setupTemplates.find((item) => item.templateId === 'catfishing-8-classic-info')!
    const data = board(pack, template.roles.map((id) => id === 'imp' ? 'vigormortis' : id))
    const snapshot = { ...data, selections: [] as { ruleId: string; choiceId: string }[], originalRoleIds: data.assignments.map((a) => a.role.id) }
    const before = structuredClone(snapshot)
    const report = evaluateSmartScriptSetup(pack.scriptId, snapshot.assignments, snapshot.demonBluffs, snapshot.seats, snapshot.selections, [], snapshot.originalRoleIds)
    expect(report.expectedCounts?.outsider).toBe(1)
    expect(hasBlockingSetupIssue(report)).toBe(false)
    expect(snapshot).toEqual(before)
    const newData = vigorBoard(7)
    const selectedBefore = structuredClone(newData)
    expect(hasBlockingSetupIssue(evaluateSmartScriptSetup(pack.scriptId, newData.assignments, newData.demonBluffs, newData.seats, newData.selections, [], newData.assignments.map((a) => a.role.id)))).toBe(false)
    expect(newData).toEqual(selectedBefore)
  })
  it('marks only existing source-backed mandatory modifiers, retaining optional and legacy Catfishing contracts', () => {
    for (const [pack, roleId] of [[yeJingGengShenSmartScriptPack, 'summoner'], [yiZhiDuXiuSmartScriptPack, 'lordoftyphon']] as const) {
      expect(createSetupRulePackForScript(pack).modifiers.find((rule) => rule.roleId === roleId)?.requiresSelectionForNewSetup).toBe(true)
    }
    expect(catfishingSetupRulePack.modifiers.find((rule) => rule.roleId === 'godfather')?.requiresStorytellerChoice).toBe(true)
    expect(catfishingSetupRulePack.modifiers.find((rule) => rule.roleId === 'balloonist')?.requiresSelectionForNewSetup).toBe(false)
    const noRules = { ...catfishingSmartScriptPack, setupRules: [], setupTemplates: [] }
    expect(createSetupRulePackForScript(noRules).modifiers).toEqual([])
  })
})
