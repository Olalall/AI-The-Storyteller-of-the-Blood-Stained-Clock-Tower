import { describe, expect, it } from 'vitest'
import { roleSnapshotsForScript } from '../../../domain/scripts'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { createSmartScriptSetupSession } from '../../game-session/data/createPrototypeSession'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import { createSetupDraftFromCandidate } from '../../setup/setupDraft'
import { createSmartScriptSetupCandidates } from '../../setup/smartScriptSetupCandidates'
import { actNight, projected } from './nightInformation.test-support'
import { emptyWakeDraft } from './projectWakeDraft'
import { canConfirmDraft } from './workbenchGuards'

const at = '2026-10-16T12:30:00.000Z'

function activateKing(session: GameSessionState) {
  const item = projected(session).queue.find((entry) => entry.roleId === 'king')!
  expect(item).toBeDefined()
  return actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
}

function kingSession() {
  let session = createSmartScriptSetupSession('tong-xiao-da-dan', at, { playerCount: 10 })
  const candidate = createSmartScriptSetupCandidates(session.scriptId, Object.values(session.seats), { count: 99, seed: 'king-phase-regression' })
    .find((entry) => entry.assignments.some((assignment) => assignment.role.id === 'king')
      && entry.assignments.some((assignment) => assignment.role.id === 'imp'))!
  expect(candidate).toBeDefined()
  expect(candidate.legalityChecks.every((check) => check.passed)).toBe(true)
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'king-setup', confirmedAt: at })
  return activateKing(gameSessionReducer(session, { type: 'start-next-night-run' }))
}

function current(session: GameSessionState) {
  const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

function nextNight(session: GameSessionState) {
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: at })
  for (const item of projected(session).queue) {
    if (item.progress !== 'confirmed') session = actNight(session, { type: 'skip-item', id: item.id, reason: '其他角色不在本回归范围，主持跳过。' })
  }
  session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: at })
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: at })
  session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'king-no-execution', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: at })
  return activateKing(gameSessionReducer(session, { type: 'start-next-night-run' }))
}

describe('King first-night notification and later role-information recording', () => {
  it('confirms first-night notification to the Demon without asking the King to select a character', () => {
    let session = kingSession()
    const authority = projectCurrentPlayerStates(session), assignments = projectCurrentAssignments(session)
    expect(current(session).state.nightType).toBe('first')
    expect(current(session).item.targetCount).toBe(0)
    expect(current(session).item.roleCount).toBeUndefined()
    expect(current(session).item.roleChoices).toBeUndefined()
    expect(current(session).item.roleLabel).toBeUndefined()
    expect(current(session).item.storytellerPrompt).toContain('首夜只唤醒恶魔')
    expect(current(session).item.storytellerPrompt).toContain('国王此时不因本能力得知一个存活角色')
    expect(current(session).item.outcomeOptions.find((outcome) => outcome.id === 'record')?.requiredInputs).toEqual([])
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).item.progress).toBe('confirmed')
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
    expect(projectCurrentAssignments(session)).toEqual(assignments)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('keeps one required role choice on the real second-night queue and records only a draft', () => {
    let session = nextNight(kingSession())
    const authority = projectCurrentPlayerStates(session), assignments = projectCurrentAssignments(session)
    expect(current(session).state.nightType).toBe('other')
    expect(current(session).item.roleChoices?.some((choice) => choice.id === 'imp')).toBe(true)
    expect(current(session).item.outcomeOptions.find((outcome) => outcome.id === 'record')?.requiredInputs).toEqual(['role'])
    expect(current(session).item.storytellerPrompt).toContain('死者人数大于或等于活者')
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(false)
    // The host confirms timing and whether this is an alive character; this form never computes that rule itself.
    session = actNight(session, { type: 'role-choice', roleId: 'imp' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(current(session).item.progress).toBe('confirmed')
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
    expect(projectCurrentAssignments(session)).toEqual(assignments)
  })

  it('preserves a saved old first-night role form and confirmed record without migration', () => {
    let session = kingSession()
    const run = session.nightRuns[session.activeNightRunId!]
    const item = run.queue.find((entry) => entry.roleId === 'king')!
    item.roleCount = 1
    item.roleLabel = '旧角色记录'
    item.roleChoices = roleSnapshotsForScript(session.scriptId).map((role) => ({ id: role.id, label: role.name }))
    item.outcomeOptions[0] = { id: 'record', label: '旧结果', requiredInputs: ['role'], resultTemplate: '{actor}旧记录：{role}。' }
    session = actNight(session, { type: 'role-choice', roleId: 'king' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const before = JSON.stringify(session), restored = parseSessionBackup(before)
    expect(JSON.stringify(restored)).toBe(before)
    expect(current(restored).item.roleCount).toBe(1)
    expect(current(restored).item.roleLabel).toBe('旧角色记录')
    expect(current(restored).state.confirmedRecords[current(restored).item.id]).toHaveLength(1)
    const advanced = nextNight(restored)
    expect(advanced.nightRuns[run.id].queue.find((entry) => entry.id === item.id)).toEqual(restored.nightRuns[run.id].queue.find((entry) => entry.id === item.id))
    expect(advanced.timeline.filter((entry) => entry.kind === 'night_action')).toEqual(restored.timeline.filter((entry) => entry.kind === 'night_action'))
    expect(current(advanced).item.roleChoices?.length).toBeGreaterThan(0)
  })
})
