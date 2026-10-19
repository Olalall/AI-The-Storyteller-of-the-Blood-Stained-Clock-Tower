import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleSnapshotsForScript } from '../../../domain/scripts'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { createSmartScriptSetupSession } from '../../game-session/data/createPrototypeSession'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import { actNight, projected } from './nightInformation.test-support'
import { emptyWakeDraft } from './projectWakeDraft'
import { canConfirmDraft } from './workbenchGuards'

const at = '2026-10-16T12:00:00.000Z'

function typhonSession() {
  const scriptId = 'xin-kou-ci-huang'
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: 7 })
  const snapshots = roleSnapshotsForScript(scriptId)
  const role = (id: string) => {
    const found = snapshots.find((entry) => entry.id === id)
    if (!found) throw new Error(`Missing fixture role ${id}`)
    return { ...found }
  }
  // Host-confirmed legal 7p setup: 4 Townsfolk, 2 Minions (+1), no Outsiders; evil line 5–6–7 with Typhon in the middle.
  const roles = ['philosopher', 'slayer', 'nightwatchman', 'courtier', 'poisoner', 'lordoftyphon', 'scarletwoman']
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'controlled-legal-typhon-setup', revision: 1, updatedAt: at,
    assignments: roles.map((id, index) => ({ seatId: index + 1, role: role(id) })),
    demonBluffs: ['farmer', 'grandmother', 'dreamer'].map(role),
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'typhon-setup', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  return activateTyphon(session)
}

function activateTyphon(session: GameSessionState) {
  const item = projected(session).queue.find((entry) => entry.roleId === 'lordoftyphon')!
  return actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
}

function current(session: GameSessionState) {
  const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

function nextNight(session: GameSessionState) {
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
  for (const item of projected(session).queue) {
    if (item.progress !== 'confirmed') session = actNight(session, { type: 'skip-item', id: item.id, reason: '其他技能不属于本回归，主持跳过。' })
  }
  session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: at })
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
  session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'typhon-no-execution', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
  return activateTyphon(gameSessionReducer(session, { type: 'start-next-night-run' }))
}

describe('Lord of Typhon first and later night recording', () => {
  it('records first-night setup acknowledgement without inventing attack targets for legacy players metadata', () => {
    expect(getSmartScriptPack('xin-kou-ci-huang').roles.find((r) => r.id === 'lordoftyphon')?.inputKinds).toEqual(['players'])
    let session = typhonSession()
    const authority = projectCurrentPlayerStates(session), assignments = projectCurrentAssignments(session)
    const teams = new Map(getSmartScriptPack(session.scriptId).roles.map((role) => [role.id, role.team]))
    expect(assignments.reduce<Record<string, number>>((counts, assignment) => {
      const team = teams.get(assignment.role.id)!
      counts[team] = (counts[team] ?? 0) + 1
      return counts
    }, {})).toEqual({ townsfolk: 4, minion: 2, demon: 1 })
    expect(assignments.slice(4).map((assignment) => assignment.role.id)).toEqual(['poisoner', 'lordoftyphon', 'scarletwoman'])
    expect(current(session).state.nightType).toBe('first')
    expect(current(session).item.targetCount).toBe(0)
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).state.confirmedRecords[current(session).item.id].at(-1)?.snapshot.targets).toEqual([])
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
    expect(projectCurrentAssignments(session)).toEqual(assignments)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('requires exactly one attack target on the actual second-night queue without applying death', () => {
    let session = nextNight(typhonSession())
    const authority = projectCurrentPlayerStates(session)
    expect(current(session).state.nightType).toBe('other')
    expect(current(session).item.targetCount).toBe(1)
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(false)
    session = actNight(session, { type: 'target', seatId: 1 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).state.confirmedRecords[current(session).item.id].at(-1)?.snapshot.targets).toEqual([1])
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
  })

  it('keeps a persisted prior-version two-target queue and its confirmed snapshot unchanged', () => {
    let session = typhonSession()
    const run = session.nightRuns[session.activeNightRunId!], item = run.queue.find((entry) => entry.roleId === 'lordoftyphon')!
    // Explicitly replay the old generic players form, rather than pretending it came from new metadata.
    item.targetCount = 2
    item.targetKind = 'player_choice'
    item.outcomeOptions[0] = { id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}旧记录：{targets}。' }
    expect(current(session).item.targetCount).toBe(2)
    session = actNight(session, { type: 'target', seatId: 1 })
    session = actNight(session, { type: 'target', seatId: 2 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const before = JSON.stringify(session), saved = parseSessionBackup(before)
    expect(current(saved).item.targetCount).toBe(2)
    expect(current(saved).state.confirmedRecords[current(saved).item.id].at(-1)?.snapshot.targets).toEqual([1, 2])
    expect(JSON.stringify(saved)).toBe(before)
    const advanced = nextNight(saved)
    expect(current(advanced).item.targetCount).toBe(1)
    expect(JSON.stringify(advanced.nightRuns[run.id].queue.find((entry) => entry.id === item.id))).toBe(JSON.stringify(saved.nightRuns[run.id].queue.find((entry) => entry.id === item.id)))
    expect(advanced.timeline.filter((entry) => entry.kind === 'night_action')).toEqual(saved.timeline.filter((entry) => entry.kind === 'night_action'))
  })
})
