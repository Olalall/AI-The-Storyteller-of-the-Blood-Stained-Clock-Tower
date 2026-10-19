import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleSnapshotsForScript, type PlayerCount } from '../../../domain/scripts'
import { actualCompositionForTemplate } from '../../../domain/setup-templates/composition'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { createSetupDraftFromCandidate } from '../../setup/setupDraft'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from '../../setup/smartScriptSetupCandidates'
import { sessionInitialNightState } from '../../night-workbench/state/gameSessionAdapter'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import { projectCurrentAssignments } from './projectors'

const at = '2026-10-16T10:00:00.000Z'

function candidates(scriptId: string, playerCount: PlayerCount) {
  const session = createSmartScriptSetupSession(scriptId, at, { playerCount })
  return {
    session,
    candidates: createSmartScriptSetupCandidates(scriptId, Object.values(session.seats), {
      count: getSmartScriptPack(scriptId).setupTemplates.length,
      seed: 'official-metadata-followups',
    }),
  }
}

// Independent official counts, including the Godfather modifier in the last two cases.
// https://wiki.bloodontheclocktower.com/Summoner: replace the Demon with a Townsfolk.
const summonerCases = [
  { count: 10, suffix: 'summoner-short', expected: { townsfolk: 8, outsider: 0, minion: 2, demon: 0 } },
  { count: 12, suffix: 'summoner-mid', expected: { townsfolk: 8, outsider: 2, minion: 2, demon: 0 } },
  { count: 13, suffix: 'thirteen-summoner', expected: { townsfolk: 9, outsider: 1, minion: 3, demon: 0 } },
  { count: 15, suffix: 'fifteen-summoner', expected: { townsfolk: 11, outsider: 1, minion: 3, demon: 0 } },
] as const

describe('official setup and night metadata followups', () => {
  it.each(summonerCases)('offers a legal Summoner opening at $count players with the standard Minion count', ({ count, suffix, expected }) => {
    const pack = getSmartScriptPack('a-grimm-chorus')
    const templateId = `a-grimm-chorus-${count}-${suffix}`
    const template = pack.setupTemplates.find((entry) => entry.templateId === templateId)!
    expect(actualCompositionForTemplate(pack, template)).toEqual(expected)

    const opening = candidates(pack.scriptId, count)
    const candidate = opening.candidates.find((entry) => entry.id === templateId)!
    expect(candidate, 'corrected template must remain available in the real setup UI').toBeDefined()
    const report = evaluateSmartScriptSetup(pack.scriptId, candidate.assignments, candidate.demonBluffs,
      Object.values(opening.session.seats).map((seat) => seat.seatId), candidate.setupRuleSelections)
    expect(report.checks.filter((check) => check.status === 'fail' || check.status === 'needs_choice')).toEqual([])
    expect(candidate.demonBluffs).toHaveLength(3)
    expect(new Set(candidate.demonBluffs.map((role) => role.id)).size).toBe(3)
    expect(candidate.demonBluffs.every((bluff) => !candidate.assignments.some((assignment) => assignment.role.id === bluff.id))).toBe(true)

    let session = gameSessionReducer(opening.session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
    session = gameSessionReducer(session, { type: 'confirm-setup', id: `${templateId}-confirmed`, confirmedAt: at })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
    const restored = parseSessionBackup(JSON.stringify(session))
    expect(restored.timeline).toEqual(session.timeline)
    expect(restored.nightRuns[restored.activeNightRunId!].queue.some((item) => item.roleId === 'summoner')).toBe(true)
  })

  it.each(summonerCases)('keeps the already-confirmed pre-fix Summoner setup at $count players intact on reload', ({ count, suffix }) => {
    const opening = candidates('a-grimm-chorus', count)
    const candidate = opening.candidates.find((entry) => entry.id === `a-grimm-chorus-${count}-${suffix}`)!
    const draft = createSetupDraftFromCandidate(candidate, at)
    const replacement = { 10: 'villageidiot', 12: 'soldier', 13: 'minstrel', 15: 'innkeeper' }[count]
    const snapshots = roleSnapshotsForScript('a-grimm-chorus')
    // Reconstruct the old persisted snapshot, rather than re-running the now-corrected setup validator.
    draft.assignments = draft.assignments.map((assignment) => assignment.role.id === replacement
      ? { ...assignment, role: { ...snapshots.find((role) => role.id === 'scarletwoman')! } } : assignment)
    if (count === 15) draft.demonBluffs = ['innkeeper', 'slayer', 'minstrel'].map((id) => ({ ...snapshots.find((role) => role.id === id)! }))
    let legacy = gameSessionReducer(opening.session, { type: 'set-setup-draft', draft })
    legacy = gameSessionReducer(legacy, { type: 'confirm-setup', id: 'pre-fix-confirmed-setup', confirmedAt: at })
    legacy = gameSessionReducer(legacy, { type: 'start-next-night-run' })
    const raw = JSON.stringify(legacy)
    const restored = parseSessionBackup(raw)
    expect(JSON.stringify(restored)).toBe(raw)
    expect(projectCurrentAssignments(restored).map((assignment) => assignment.role.id)).toEqual(draft.assignments.map((assignment) => assignment.role.id))
    expect(restored.nightRuns).toEqual(legacy.nightRuns)
  })

  const organGrinderScripts = ['yu-zhe-huan-yan', 'chuan-qi-zhi-ye', 'yi-chu-hao-xi-lao-hua-deng'] as const

  it.each(organGrinderScripts)('includes the nightly choice in new first and later nights for %s', (scriptId) => {
    const pack = getSmartScriptPack(scriptId)
    for (const entries of [pack.nightOrders.firstNight, pack.nightOrders.otherNight]) {
      const ids = entries.map((entry) => entry.roleId)
      expect(ids.filter((id) => id === 'organgrinder')).toHaveLength(1)
      const index = ids.indexOf('organgrinder')
      // The official sheet places this choice after Snake Charmer / Monk and before these later actions.
      for (const anchor of ['snakecharmer', 'monk']) {
        if (ids.includes(anchor)) expect(index).toBeGreaterThan(ids.indexOf(anchor))
      }
      for (const anchor of ['cerenovus', 'pithag', 'pukka', 'fearmonger']) {
        if (ids.includes(anchor)) expect(index).toBeLessThan(ids.indexOf(anchor))
      }
      expect(entries[index].note).toContain('醉酒直到黄昏')
    }

    const opening = candidates(scriptId, 13)
    const candidate = opening.candidates.find((entry) => entry.assignments.some((a) => a.role.id === 'organgrinder'))!
    expect(candidate).toBeDefined()
    let session = gameSessionReducer(opening.session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
    session = gameSessionReducer(session, { type: 'confirm-setup', id: `${scriptId}-setup`, confirmedAt: at })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
    const firstRunId = session.activeNightRunId!
    expect(session.nightRuns[firstRunId].nightType).toBe('first')
    expect(session.nightRuns[firstRunId].queue.filter((item) => item.roleId === 'organgrinder')).toHaveLength(1)
    session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: firstRunId, closedAt: at })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
    const later = session.nightRuns[session.activeNightRunId!]
    expect(later.nightType).toBe('other')
    expect(later.queue.filter((item) => item.roleId === 'organgrinder')).toHaveLength(1)
  })

  it.each(organGrinderScripts)('preserves a saved pre-update queue on backup reload for %s', (scriptId) => {
    const opening = candidates(scriptId, 13)
    const candidate = opening.candidates.find((entry) => entry.assignments.some((a) => a.role.id === 'organgrinder'))!
    let session = gameSessionReducer(opening.session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
    session = gameSessionReducer(session, { type: 'confirm-setup', id: `${scriptId}-old-setup`, confirmedAt: at })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
    const run = session.nightRuns[session.activeNightRunId!]
    const oldQueue = run.queue.filter((item) => item.roleId !== 'organgrinder')
    const legacyRun = { ...run, queue: oldQueue, activeCursorId: oldQueue[0].id, previewEntryId: oldQueue[0].id }
    const legacy = { ...session, nightRuns: { [run.id]: legacyRun } }
    const raw = JSON.stringify(legacy)
    const restored = parseSessionBackup(raw)
    expect(restored.nightRuns[run.id]).toEqual(legacyRun)
    expect(JSON.stringify(restored)).toBe(raw)
    const projected = sessionInitialNightState({ session: restored, dispatchSession: () => undefined })!
    expect(projected.queue.map((item) => [item.id, item.roleId, item.orderIndex])).toEqual(oldQueue.map((item) => [item.id, item.roleId, item.orderIndex]))
    expect(gameSessionReducer(restored, { type: 'start-next-night-run' })).toBe(restored)
  })
})
