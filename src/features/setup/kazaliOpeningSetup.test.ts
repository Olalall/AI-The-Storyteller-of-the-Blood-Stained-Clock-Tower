import { describe, expect, it } from 'vitest'
import { smartScriptPacks as sourcePacks } from '../../domain/scripts/allPacks'
import { smartScriptRegistry, roleSnapshotsForScript } from '../../domain/scripts'
import { scriptManifest } from '../../domain/scripts/catalog'
import type { SmartScriptPack } from '../../domain/scripts'
import { normalizeImportedPack } from '../../domain/scripts/normalizeImportedPack'
import { actualCompositionForTemplate, validateTemplateComposition } from '../../domain/setup-templates/composition'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from './smartScriptSetupCandidates'
import { hasBlockingSetupIssue } from './setupRuleEvaluator'

const smartScriptPacks: readonly SmartScriptPack[] = sourcePacks.map(normalizeImportedPack)
for (const pack of smartScriptPacks) if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
const pack = smartScriptPacks.find((entry) => entry.scriptId === 'one-in-one-out')!
function board(roles: readonly string[], currentPack: SmartScriptPack = pack) {
  const snapshots = new Map(roleSnapshotsForScript(currentPack.scriptId).map((role) => [role.id, role]))
  return { assignments: roles.map((id, index) => ({ seatId: index + 1, role: { ...snapshots.get(id)!, id } })),
    bluffs: currentPack.roles.filter((role) => role.team === 'townsfolk' && !roles.includes(role.id)).slice(0, 3).map((role) => snapshots.get(role.id)!),
    seats: roles.map((_role, index) => index + 1) }
}
function opening(count: number, outsiders: number) {
  return board([...pack.roles.filter((role) => role.team === 'townsfolk').slice(0, count - outsiders - 1).map((role) => role.id),
    ...pack.roles.filter((role) => role.team === 'outsider').slice(0, outsiders).map((role) => role.id), 'kazali'])
}

describe('Kazali opening bag and confirmed-source compatibility', () => {
  it.each([[7, 0, 1], [9, 4, 1], [10, 0, 2], [12, 4, 2], [13, 2, 3], [15, 4, 3]])('%i players permit %i Outsiders and require no preassigned Minions', (count, outsiders, groups) => {
    const data = opening(count, outsiders)
    const before = structuredClone(data)
    const report = evaluateSmartScriptSetup(pack.scriptId, data.assignments, data.bluffs, data.seats)
    expect(report.expectedCounts).toEqual({ townsfolk: count - outsiders - 1, outsider: outsiders, minion: 0, demon: 1 })
    expect(hasBlockingSetupIssue(report)).toBe(false)
    expect(report.checks.find((check) => check.id === 'modifier-kazali-opening')?.summary).toContain(`首夜选择 ${groups} 组`)
    expect(data).toEqual(before)
  })
  it.each(['poisoner', 'imp', 'missing-role'])('blocks an initial bag that replaces a good role with %s', (roleId) => {
    const data = opening(7, 0)
    data.assignments[0].role = { ...data.assignments[0].role, id: roleId }
    expect(hasBlockingSetupIssue(evaluateSmartScriptSetup(pack.scriptId, data.assignments, data.bluffs, data.seats))).toBe(true)
  })
  it('does not extend the exception to an ordinary Demon or duplicate good role', () => {
    const ordinary = opening(7, 0)
    ordinary.assignments[6].role.id = 'imp'
    expect(hasBlockingSetupIssue(evaluateSmartScriptSetup(pack.scriptId, ordinary.assignments, ordinary.bluffs, ordinary.seats))).toBe(true)
    const duplicate = opening(7, 0)
    duplicate.assignments[0].role = { ...duplicate.assignments[1].role }
    expect(hasBlockingSetupIssue(evaluateSmartScriptSetup(pack.scriptId, duplicate.assignments, duplicate.bluffs, duplicate.seats))).toBe(true)
  })
  it('preserves a confirmed legacy preassigned-Minions bag without mutating or silently repairing it', () => {
    const ids = ['snakecharmer', 'fortuneteller', 'seamstress', 'farmer', 'cannibal', 'goon', 'harpy', 'kazali']
    const data = board(ids), before = JSON.stringify(data)
    expect(hasBlockingSetupIssue(evaluateSmartScriptSetup(pack.scriptId, data.assignments, data.bluffs, data.seats))).toBe(true)
    const legacy = evaluateSmartScriptSetup(pack.scriptId, data.assignments, data.bluffs, data.seats, [], [], ids)
    expect(hasBlockingSetupIssue(legacy)).toBe(false)
    expect(legacy.expectedCounts).toEqual({ townsfolk: 5, outsider: 1, minion: 1, demon: 1 })
    expect(legacy.checks.some((check) => check.id === 'modifier-kazali-opening')).toBe(false)
    expect(JSON.stringify(data)).toBe(before)
  })
  it('keeps a confirmed new opening source usable after explicitly assigning its three Minions', () => {
    const data = opening(15, 4), source = data.assignments.map((assignment) => assignment.role.id)
    const minions = ['poisoner', 'harpy', 'spy']
    data.assignments = data.assignments.map((assignment, index) => index < 3
      ? { ...assignment, role: roleSnapshotsForScript(pack.scriptId).find((role) => role.id === minions[index])! } : assignment)
    const report = evaluateSmartScriptSetup(pack.scriptId, data.assignments, data.bluffs, data.seats, [], [], source)
    expect(hasBlockingSetupIssue(report)).toBe(false)
    expect(report.expectedCounts).toEqual({ townsfolk: 7, outsider: 4, minion: 3, demon: 1 })
    expect(source.slice(0, 3)).not.toEqual(minions)
  })
  it('does not reinterpret a midgame-created Kazali as a new opening bag', () => {
    const data = opening(7, 0)
    const sources = data.assignments.map((assignment) => assignment.role.id === 'kazali' ? 'imp' : assignment.role.id)
    const report = evaluateSmartScriptSetup(pack.scriptId, data.assignments, data.bluffs, data.seats, [], [], sources)
    expect(report.checks.some((check) => check.id === 'modifier-kazali-opening')).toBe(false)
    expect(hasBlockingSetupIssue(report)).toBe(true)
  })
  it('keeps all 24 repaired templates visible, preserving three out-of-bag bluffs', () => {
    const affected = smartScriptPacks.filter((candidate) => ['devout-theists', 'one-in-one-out', 'punchy', 'wu-he-you-zhi-xiang'].includes(candidate.scriptId))
    expect(affected.map((candidate) => candidate.scriptId).sort()).toEqual(['devout-theists', 'one-in-one-out', 'punchy', 'wu-he-you-zhi-xiang'])
    let checked = 0
    for (const currentPack of affected) for (const template of currentPack.setupTemplates.filter((entry) => entry.roles.includes('kazali'))) {
      const counts = actualCompositionForTemplate(currentPack, template)
      expect(counts.minion).toBe(0)
      expect(counts.demon).toBe(1)
      expect(counts.townsfolk + counts.outsider).toBe(template.playerCount - 1)
      expect(template.bluffs).toHaveLength(3)
      for (const bluff of template.bluffs) expect(template.roles).not.toContain(bluff)
      const profiles = Array.from({ length: template.playerCount }, (_value, index) => ({ seatId: index + 1, experience: (['new', 'regular', 'veteran'] as const)[index % 3] }))
      const candidates = createSmartScriptSetupCandidates(currentPack.scriptId, profiles, { count: 100, seed: 'kazali-opening' })
      const actual = candidates.find((entry) => entry.id === template.templateId)!
      expect(actual, template.templateId).toBeTruthy()
      expect(actual.demonBluffs.map((role) => role.id)).toEqual(template.bluffs)
      expect(hasBlockingSetupIssue(evaluateSmartScriptSetup(currentPack.scriptId, actual.assignments, actual.demonBluffs,
        profiles.map((seat) => seat.seatId), actual.setupRuleSelections))).toBe(false)
      checked += 1
    }
    expect(checked).toBe(24)
  })
  it('audits all registered packs through composition and actual candidate validation', () => {
    expect(smartScriptPacks.length).toBeGreaterThanOrEqual(148)
    expect(smartScriptPacks.map((pack) => pack.scriptId).sort()).toEqual(scriptManifest.map((pack) => pack.scriptId).sort())
    for (const currentPack of smartScriptPacks) {
      for (const template of currentPack.setupTemplates) expect(validateTemplateComposition(currentPack, template).problems, template.templateId).toEqual([])
      for (const count of currentPack.playerCounts) {
        const profiles = Array.from({ length: count }, (_value, index) => ({ seatId: index + 1, experience: 'regular' as const }))
        const actual = createSmartScriptSetupCandidates(currentPack.scriptId, profiles, { count: 100, seed: 'all-kazali-setup-audit' })
        expect(actual.map((entry) => entry.id).sort(), `${currentPack.scriptId}/${count}`).toEqual(currentPack.setupTemplates.filter((template) => template.playerCount === count).map((template) => template.templateId).sort())
      }
    }
  })
})
