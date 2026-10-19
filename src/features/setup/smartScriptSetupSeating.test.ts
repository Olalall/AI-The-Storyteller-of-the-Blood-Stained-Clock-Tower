import { describe, expect, it } from 'vitest'
import { roleSnapshotsForScript, smartScriptPacks, smartScriptRegistry, type SmartScriptPack } from '../../domain/scripts'
import { yiZhiDuXiuSmartScriptPack } from '../../domain/scripts/packs/yi-zhi-du-xiu'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from './smartScriptSetupCandidates'
import type { SetupSeatProfile } from './types'
import type { SetupAssignment } from '../game-session/types'
import { fitSetupSeating, setupSeatingChecks } from './setupSeatingConstraints'
import { createSetupDraftFromCandidate, swapDraftSeats } from './setupDraft'
import { hasBlockingSetupIssue } from './setupRuleEvaluator'

function mixedProfiles(count: number, shift: number): SetupSeatProfile[] {
  return Array.from({ length: count }, (_v, i) => ({
    seatId: i + 1, experience: (['new', 'veteran', 'regular'] as const)[(i + shift) % 3],
  }))
}

function assertOracle(assignments: readonly SetupAssignment[], pack: SmartScriptPack) {
  const seats = [...assignments].sort((a, b) => a.seatId - b.seatId)
  const teams = new Map(pack.roles.map((r) => [r.id, r.team]))
  const evil = seats.map((a) => ['minion', 'demon'].includes(teams.get(a.role.id) ?? ''))
  const before = (i: number) => (i + seats.length - 1) % seats.length
  const after = (i: number) => (i + 1) % seats.length
  for (let i = 0; i < seats.length; i++) {
    if (seats[i].role.id === 'marionette') {
      expect([teams.get(seats[before(i)].role.id), teams.get(seats[after(i)].role.id)], `${pack.scriptId}/木偶 ${seats[i].seatId} 号`).toContain('demon')
    }
    if (seats[i].role.id === 'lordoftyphon') {
      expect(evil[before(i)] && evil[after(i)], `${pack.scriptId}/堤丰 ${seats[i].seatId} 号两侧`).toBe(true)
      expect(evil.filter((isEvil, j) => isEvil !== evil[after(j)]), `${pack.scriptId}/邪恶连续段`).toHaveLength(2)
    }
  }
}

describe('generated setup seating respects sourced starting constraints', () => {
  it('accepts circular neighbors and an off-center Lord inside the evil line', () => {
    const roleIds = ['lordoftyphon', 'poisoner', 'spy', 'harpy', 'chef', 'empath', 'monk', 'marionette']
    const assignments = roleIds.map((id, i) => ({ seatId: i + 1, role: { id, name: id, initial: id[0], iconPath: '' } }))
    const teams = Object.fromEntries(roleIds.map((id) => [id, id === 'lordoftyphon' ? 'demon' as const
      : ['poisoner', 'spy', 'harpy', 'marionette'].includes(id) ? 'minion' as const : 'townsfolk' as const]))
    expect(setupSeatingChecks(assignments, teams).every((c) => c.passed)).toBe(true)
    expect(fitSetupSeating(assignments, teams, roleIds.map((_r, i) => i + 1))).toBe(assignments)
  })

  it('fits both restrictions without mutating the preferred allocation or rewriting unrelated setups', () => {
    const roleIds = ['marionette', 'chef', 'lordoftyphon', 'empath', 'monk', 'poisoner', 'slayer']
    const assignments = roleIds.map((id, i) => ({ seatId: i + 1, role: { id, name: id, initial: id[0], iconPath: '' } }))
    const teams = Object.fromEntries(roleIds.map((id) => [id, id === 'lordoftyphon' ? 'demon' as const
      : ['poisoner', 'marionette'].includes(id) ? 'minion' as const : 'townsfolk' as const]))
    const before = JSON.stringify(assignments)
    const fitted = fitSetupSeating(assignments, teams, [1, 4, 7, 2, 5, 3, 6])
    expect(setupSeatingChecks(assignments, teams).some((c) => !c.passed)).toBe(true)
    expect(setupSeatingChecks(fitted, teams).every((c) => c.passed)).toBe(true)
    expect(JSON.stringify(assignments)).toBe(before)
    const ordinary = assignments.filter((a) => !['lordoftyphon', 'marionette'].includes(a.role.id))
    expect(fitSetupSeating(ordinary, teams, ordinary.map((a) => a.seatId))).toBe(ordinary)
    const noDemon = assignments.filter((a) => a.role.id !== 'lordoftyphon')
    expect(setupSeatingChecks(noDemon, teams).find((c) => c.id === 'marionette-neighbor')?.status).toBe('fail')
  })

  it('rejects an impossible Lord candidate with an explicit reason instead of claiming legality', () => {
    const pack = yiZhiDuXiuSmartScriptPack
    const id = 'seating-impossible-lord-regression'
    const template = { ...pack.setupTemplates[0], scriptId: id,
      roles: ['pixie', 'shugenja', 'chef', 'general', 'innkeeper', 'poisoner', 'lordoftyphon'],
      bluffs: ['flowergirl', 'savant', 'fisherman'], setupAdjustments: undefined }
    smartScriptRegistry.register({ ...pack, scriptId: id, setupTemplates: [template] })
    expect(() => createSmartScriptSetupCandidates(id, mixedProfiles(7, 1))).toThrow('堤丰两侧都有邪恶角色')
  })

  it('keeps every existing Marionette template next to a Demon with mixed experience and multiple seeds', () => {
    let checked = 0
    for (const pack of smartScriptPacks.filter((p) => p.setupTemplates.some((t) => t.roles.includes('marionette')))) {
      for (const count of pack.playerCounts) for (const shift of [0, 1, 2]) {
        const templates = pack.setupTemplates.filter((t) => t.playerCount === count)
        const candidates = createSmartScriptSetupCandidates(pack.scriptId, mixedProfiles(count, shift), {
          count: pack.setupTemplates.length, seed: `marionette-${count}-${shift}`,
        })
        expect(candidates, `${pack.scriptId}/${count}`).toHaveLength(templates.length)
        for (const candidate of candidates) {
          if (!candidate.assignments.some((a) => a.role.id === 'marionette')) continue
          assertOracle(candidate.assignments, pack)
          checked++
        }
      }
    }
    expect(checked).toBeGreaterThanOrEqual(205 * 3)
  })

  it('keeps the actual new Lord templates in one circular evil line, including both Demon neighbors', () => {
    const pack = yiZhiDuXiuSmartScriptPack
    if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
    let checked = 0
    for (const count of pack.playerCounts) for (const shift of [0, 1, 2]) {
      const candidates = createSmartScriptSetupCandidates(pack.scriptId, mixedProfiles(count, shift), { count: 100, seed: `lord-${shift}` })
      expect(candidates).toHaveLength(pack.setupTemplates.filter((t) => t.playerCount === count).length)
      for (const candidate of candidates) {
        assertOracle(candidate.assignments, pack)
        if (candidate.assignments.some((a) => a.role.id === 'lordoftyphon')) checked++
      }
    }
    expect(checked).toBe(27)
  })

  it('leaves an explicit manual seat swap intact and preserves the original candidate snapshot', () => {
    const pack = yiZhiDuXiuSmartScriptPack
    if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
    const candidate = createSmartScriptSetupCandidates(pack.scriptId, mixedProfiles(7, 0), { count: 100, seed: 'manual-snapshot' })
      .find((c) => c.assignments.some((a) => a.role.id === 'lordoftyphon'))!
    const before = JSON.stringify(candidate)
    const draft = createSetupDraftFromCandidate(candidate, '2026-10-16T00:00:00Z')
    const lordSeat = draft.assignments.find((a) => a.role.id === 'lordoftyphon')!.seatId
    const goodSeat = draft.assignments.find((a) => ['chef', 'pixie', 'shugenja', 'flowergirl', 'savant', 'fisherman', 'amnesiac'].includes(a.role.id))!.seatId
    const swapped = swapDraftSeats(draft, lordSeat, goodSeat, '2026-10-16T00:01:00Z')
    expect(swapped.assignments.find((a) => a.seatId === goodSeat)?.role.id).toBe('lordoftyphon')
    expect(JSON.stringify(candidate)).toBe(before)
    expect(draft.assignments.find((a) => a.role.id === 'lordoftyphon')?.seatId).toBe(lordSeat)
    const swappedBefore = JSON.stringify(swapped)
    const initial = evaluateSmartScriptSetup(pack.scriptId, swapped.assignments, swapped.demonBluffs,
      mixedProfiles(7, 0).map((p) => p.seatId), swapped.setupRuleSelections, swapped.repeatableRoleIds)
    expect(initial.checks.find((c) => c.id === 'lordoftyphon-evil-line')?.status).toBe('fail')
    expect(hasBlockingSetupIssue(initial)).toBe(true)
    const existing = evaluateSmartScriptSetup(pack.scriptId, swapped.assignments, swapped.demonBluffs,
      mixedProfiles(7, 0).map((p) => p.seatId), swapped.setupRuleSelections, swapped.repeatableRoleIds,
      draft.assignments.map((a) => a.role.id))
    expect(existing.checks.some((c) => c.id === 'lordoftyphon-evil-line')).toBe(false)
    expect(hasBlockingSetupIssue(existing)).toBe(false)
    expect(JSON.stringify(swapped)).toBe(swappedBefore)
    expect(JSON.stringify(candidate)).toBe(before)
  })

  it('blocks a first-confirmation Marionette swap without repairing or rewriting the manual draft', () => {
    const scriptId = 'uncertain-death'
    const candidate = createSmartScriptSetupCandidates(scriptId, mixedProfiles(12, 1), { count: 100, seed: 'marionette-first-confirm' })
      .find((c) => c.assignments.some((a) => a.role.id === 'marionette'))!
    const draft = createSetupDraftFromCandidate(candidate, '2026-10-16T00:00:00Z')
    const marionette = draft.assignments.find((a) => a.role.id === 'marionette')!
    const pack = smartScriptRegistry.get(scriptId)!
    const teams = new Map(pack.roles.map((r) => [r.id, r.team]))
    const demons = draft.assignments.filter((a) => teams.get(a.role.id) === 'demon')
    const distantGood = draft.assignments.find((a) => ['townsfolk', 'outsider'].includes(teams.get(a.role.id) ?? '')
      && demons.every((d) => ![1, 11].includes(Math.abs(d.seatId - a.seatId))))!
    const swapped = swapDraftSeats(draft, marionette.seatId, distantGood.seatId, '2026-10-16T00:01:00Z')
    const before = JSON.stringify({ candidate, draft, swapped })
    const expectedSeats = mixedProfiles(12, 1).map((p) => p.seatId)
    const first = evaluateSmartScriptSetup(scriptId, swapped.assignments, swapped.demonBluffs, expectedSeats, swapped.setupRuleSelections, swapped.repeatableRoleIds)
    expect(first.checks.find((c) => c.id === 'marionette-neighbor')?.status).toBe('fail')
    expect(hasBlockingSetupIssue(first)).toBe(true)
    const confirmed = evaluateSmartScriptSetup(scriptId, swapped.assignments, swapped.demonBluffs, expectedSeats, swapped.setupRuleSelections,
      swapped.repeatableRoleIds, draft.assignments.map((a) => a.role.id))
    expect(confirmed.checks.some((c) => c.id === 'marionette-neighbor')).toBe(false)
    expect(hasBlockingSetupIssue(confirmed)).toBe(false)
    expect(JSON.stringify({ candidate, draft, swapped })).toBe(before)
  })

  it('allows legal first-and-last-seat neighbors at initial confirmation and does not duplicate candidate checks', () => {
    const scriptId = 'uncertain-death'
    const snapshots = new Map(roleSnapshotsForScript(scriptId).map((r) => [r.id, r]))
    const roles = ['marionette', 'clockmaker', 'grandmother', 'librarian', 'empath', 'fortuneteller', 'recluse', 'pukka']
    const assignments = roles.map((id, i) => ({ seatId: i + 1, role: snapshots.get(id)! }))
    const bluffs = ['artist', 'monk', 'slayer'].map((id) => snapshots.get(id)!)
    const before = JSON.stringify({ assignments, bluffs })
    const report = evaluateSmartScriptSetup(scriptId, assignments, bluffs, roles.map((_r, i) => i + 1))
    expect(report.checks.filter((c) => c.id === 'marionette-neighbor')).toEqual([expect.objectContaining({ status: 'pass' })])
    expect(hasBlockingSetupIssue(report)).toBe(false)
    const candidate = createSmartScriptSetupCandidates(scriptId, mixedProfiles(12, 2), { count: 100, seed: 'one-seating-check' })
      .find((c) => c.assignments.some((a) => a.role.id === 'marionette'))!
    expect(candidate.legalityChecks.filter((c) => c.id === 'marionette-neighbor')).toHaveLength(1)
    const afterSetup = evaluateSmartScriptSetup(scriptId, assignments, bluffs, roles.map((_r, i) => i + 1), [], [], [])
    expect(afterSetup.checks.some((c) => c.id === 'marionette-neighbor')).toBe(false)
    expect(JSON.stringify({ assignments, bluffs })).toBe(before)
  })
})
