import { describe, expect, it } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession, createSmartScriptSetupSession } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { createNightWorkbenchCommit, nightContextKey, sessionInitialNightState } from './gameSessionAdapter'
import { roleSnapshotsForScript } from '../../../domain/scripts'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../game-session/state/projectors'
import type { GameSessionState, NightActionEntry } from '../../game-session/types'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { actNight, projected } from './nightInformation.test-support'
import { applyOutcome, emptyWakeDraft } from './projectWakeDraft'
import { canConfirmDraft } from './workbenchGuards'
import { canAppendHistoryCorrection, canAppendNightActionEntry } from '../../game-session/state/sessionReducerGuards'
import { projectNightInteraction } from './projectNightInteraction'

const AT = '2026-10-21T00:00:00.000Z'

function farmerSession() {
  let session = createSmartScriptSetupSession('yi-cun-duan-yi-cun-xian', AT, { playerCount: 8 })
  const roles = roleSnapshotsForScript(session.scriptId)
  const role = (id: string) => ({ ...roles.find((candidate) => candidate.id === id)! })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'farmer-trigger-review', revision: 1, updatedAt: AT,
    assignments: ['virgin', 'pacifist', 'fool', 'soldier', 'farmer', 'saint', 'poisoner', 'pukka']
      .map((id, index) => ({ seatId: index + 1, role: role(id) })),
    demonBluffs: ['chef', 'knight', 'steward'].map(role),
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'farmer-setup', confirmedAt: AT })
  session.phaseSegments = [
    { id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: AT, closedAt: AT },
    { id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: AT, closedAt: AT },
  ]
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  const farmer = projected(session).queue.find((item) => item.roleId === 'farmer')!
  expect(farmer).toBeDefined()
  return actNight(actNight(session, { type: 'preview', id: farmer.id }), { type: 'activate-preview' })
}

function currentFarmer(session: GameSessionState) {
  const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

function changePoison(session: GameSessionState, seatId: number) {
  const before = projectCurrentPlayerStates(session)[seatId]
  return gameSessionReducer(session, { type: 'confirm-player-state-change', seatId, expectedBefore: before,
    after: { ...before, poisoned: !before.poisoned }, segmentId: null, entryId: `poison-${seatId}-${session.timeline.length}`,
    confirmedAt: AT, reason: '说书人明确核对状态。' })
}

function farmerRecord(session: GameSessionState): NightActionEntry {
  const { state, item } = currentFarmer(session)
  return { id: 'farmer-direct-record', kind: 'night_action', segmentId: null, createdAt: AT,
    confirmedBy: 'storyteller', nightRunId: state.nightRunId, wakeItemId: item.id,
    actorSeatId: item.seatId, roleId: item.roleId, summary: '说书人记录农夫继任候选。', details: [],
    record: { revision: 1, snapshot: applyOutcome(item, { ...emptyWakeDraft(), targets: [1] }, 'record') } }
}

describe('session night projection', () => {
  it('does not substitute a sample night or open a phase when the session has no night run', () => {
    const session = createEmptyGameSession()
    expect(sessionInitialNightState({ session, dispatchSession: () => undefined })).toBeNull()
    expect(gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: new Date().toISOString() })).toBe(session)
  })

  it.each(['missing', 'script', 'player-count', 'cursor', 'preview', 'empty-queue', 'missing-segment'])(
    'stops on a %s night binding without changing the stored run', (fault) => {
      const session = createPrototypeGameSession()
      const run = session.nightRuns[session.activeNightRunId!]
      if (fault === 'missing') session.activeNightRunId = 'missing-night'
      if (fault === 'script') run.scriptId = 'trouble-brewing'
      if (fault === 'player-count') run.playerCount = 7
      if (fault === 'cursor') run.activeCursorId = 'missing-item'
      if (fault === 'preview') run.previewEntryId = 'missing-item'
      if (fault === 'empty-queue') run.queue = []
      if (fault === 'missing-segment') run.phaseSegmentId = 'missing-segment'
      const before = structuredClone(session)

      expect(sessionInitialNightState({ session, dispatchSession: () => undefined })).toBeNull()
      expect(gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: new Date().toISOString() })).toBe(session)
      expect(session).toEqual(before)
    },
  )
})

describe('Farmer requires the host to confirm the actual trigger', () => {
  it('upgrades the real 391 living Farmer and a legacy pending queue before accepting a result', () => {
    let session = farmerSession()
    const run = session.nightRuns[session.activeNightRunId!]
    const stored = run.queue.find((item) => item.roleId === 'farmer')!
    stored.interactionVersion = 'generic-v1'
    stored.applicability = 'applicable'
    const original = structuredClone(session)
    expect(currentFarmer(session).item).toMatchObject({ applicability: 'needs_review', interactionVersion: 'farmer/trigger-review-v1' })
    expect(currentFarmer(session).item.reason).toContain('当夜死亡')
    expect(currentFarmer(session).item.reason).toContain('存活善良')
    session = actNight(session, { type: 'target', seatId: 1 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(currentFarmer(session).state, currentFarmer(session).item, currentFarmer(session).draft)).toBe(false)
    expect(session.timeline).toEqual(original.timeline)
  })

  it('persists explicit review across refresh and unrelated changes without changing roles or states', () => {
    let session = farmerSession()
    const states = projectCurrentPlayerStates(session), roles = projectCurrentAssignments(session)
    session = actNight(session, { type: 'resolve-applicability', value: 'applicable' })
    expect(currentFarmer(parseSessionBackup(JSON.stringify(session))).item.applicability).toBe('applicable')
    session = changePoison(session, 1)
    expect(currentFarmer(session).item.applicability).toBe('applicable')
    session = actNight(session, { type: 'target', seatId: 1 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    expect(canConfirmDraft(currentFarmer(session).state, currentFarmer(session).item, currentFarmer(session).draft)).toBe(true)
    session = actNight(session, { type: 'confirm', advance: false })
    expect(currentFarmer(session).item.progress).toBe('confirmed')
    expect(projectCurrentAssignments(session)).toEqual(roles)
    expect(projectCurrentPlayerStates(session)[5]).toEqual(states[5])
  })

  it('requires review again when the Farmer becomes impaired, but does not infer death eligibility', () => {
    let session = actNight(farmerSession(), { type: 'resolve-applicability', value: 'applicable' })
    session = changePoison(session, 5)
    expect(currentFarmer(session).item.applicability).toBe('needs_review')
    expect(currentFarmer(session).item.status.impairments).toContain('poisoned')
    const before = projectCurrentPlayerStates(session)[5]
    session = gameSessionReducer(session, { type: 'confirm-player-state-change', seatId: 5, expectedBefore: before,
      after: { ...before, life: 'dead' }, segmentId: null, entryId: 'farmer-death', confirmedAt: AT, reason: '主持确认本夜死亡。' })
    expect(currentFarmer(session).item.applicability).toBe('needs_review')
    session = actNight(session, { type: 'resolve-applicability', value: 'applicable' })
    expect(currentFarmer(session).item.applicability).toBe('applicable')
  })

  it.each(['riot', 'leviathan'])('allows an explicit living trigger review for a %s jinx without auto applying it', (roleId) => {
    const { item } = currentFarmer(farmerSession())
    const script = roleId === 'riot' ? 'xi-ji-er-qi' : 'guo-jie-xin-yang'
    const reviewed = projectNightInteraction({ ...item, interactionVersion: 'old', applicability: 'applicable' }, script, { nightType: 'other', playerCount: 8 })
    expect(reviewed.applicability).toBe('needs_review')
    expect(reviewed.reason).toContain('相克')
    const again = projectNightInteraction({ ...reviewed, applicability: 'applicable' }, script, { nightType: 'other', playerCount: 8 })
    expect(again.applicability).toBe('applicable')
  })

  it('rejects a forged new record even when the incoming queue claims the host already reviewed it', () => {
    const session = farmerSession(), entry = farmerRecord(session), { state, item } = currentFarmer(session)
    const forged = { ...state, queue: state.queue.map((candidate) => candidate.id === item.id
      ? { ...candidate, applicability: 'applicable' as const, progress: 'confirmed' as const } : candidate),
      confirmedRecords: { ...state.confirmedRecords, [item.id]: [{ id: entry.id, wakeItemId: item.id, revision: 1, confirmedAt: AT, snapshot: entry.record.snapshot }] } }
    expect(gameSessionReducer(session, createNightWorkbenchCommit(forged, { session, dispatchSession: () => {} }))).toBe(session)
    expect(canAppendNightActionEntry(session, entry)).toBe(false)
  })

  it('keeps not-applicable after restoration and reopens review on the next night', () => {
    let session = actNight(farmerSession(), { type: 'resolve-applicability', value: 'not_applicable' })
    expect(currentFarmer(parseSessionBackup(JSON.stringify(session))).item).toMatchObject({ applicability: 'not_applicable', progress: 'not_applicable' })
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: AT })
    for (const item of projected(session).queue) if (item.progress !== 'not_applicable') session = actNight(session, { type: 'skip-item', id: item.id, reason: '主持跳过其他项。' })
    session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: AT })
    session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: AT })
    session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: 'farmer-no-execution', confirmedAt: AT })
    session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: AT })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
    expect(projected(session).queue.find((item) => item.roleId === 'farmer')?.applicability).toBe('needs_review')
  })

  it('does not reuse review when a character changes away and later becomes a new Farmer', () => {
    let session = actNight(farmerSession(), { type: 'resolve-applicability', value: 'applicable' })
    const originalId = currentFarmer(session).item.id
    for (const [index, roleId] of ['pukka', 'farmer'].entries()) {
      const run = session.nightRuns[session.activeNightRunId!]
      const expectedRoleId = projectCurrentAssignments(session).find((entry) => entry.seatId === 5)!.role.id
      session = gameSessionReducer(session, { type: 'confirm-night-role-change', nightRunId: run.id, seatId: 5,
        expectedRoleId, roleId, timing: 'tonight', reason: 'gameplay', id: `farmer-change-${index}`,
        expectedContextKey: nightContextKey(session), expectedRevision: run.revision, confirmedAt: new Date(Date.parse(AT) + (index + 1) * 1000).toISOString() })
    }
    const queue = projected(session).queue
    expect(queue.find((item) => item.id === originalId)?.progress).toBe('not_applicable')
    expect(queue.find((item) => item.roleId === 'farmer' && item.id !== originalId)).toMatchObject({ applicability: 'needs_review', interactionVersion: 'farmer/trigger-review-v1' })
  })

  it('preserves legacy confirmed history, rechecks active corrections and restores the original confirmation on cancel', () => {
    let session = actNight(farmerSession(), { type: 'resolve-applicability', value: 'applicable' })
    session = actNight(session, { type: 'target', seatId: 1 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const saved = session.timeline.find((entry): entry is NightActionEntry => entry.kind === 'night_action' && entry.roleId === 'farmer')!
    session.nightRuns[session.activeNightRunId!].queue.find((item) => item.roleId === 'farmer')!.interactionVersion = 'legacy'
    const before = structuredClone(saved)
    expect(currentFarmer(session).item).toMatchObject({ progress: 'confirmed', applicability: 'applicable', interactionVersion: 'legacy' })
    expect(canAppendHistoryCorrection(session, { type: 'append-correction', originalEntryId: saved.id,
      entry: { ...saved, correctionReason: '修正主持文字。' }, input: { id: 'farmer-history-correction', createdAt: AT } })).toBe(true)
    session = actNight(session, { type: 'begin-correction' })
    expect(currentFarmer(session).item.applicability).toBe('needs_review')
    expect(canConfirmDraft(currentFarmer(session).state, currentFarmer(session).item, currentFarmer(session).draft)).toBe(false)
    session = actNight(session, { type: 'resolve-applicability', value: 'not_applicable' })
    session = actNight(session, { type: 'cancel-correction' })
    expect(currentFarmer(session).item).toMatchObject({ progress: 'confirmed', applicability: 'applicable' })
    expect(session.timeline.find((entry) => entry.id === saved.id)).toEqual(before)
    session = actNight(session, { type: 'begin-correction' })
    session = actNight(session, { type: 'resolve-applicability', value: 'applicable' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(session.timeline.filter((entry) => entry.kind === 'night_action' && entry.roleId === 'farmer')).toHaveLength(2)
    expect(session.timeline.find((entry) => entry.id === saved.id)).toEqual(before)
  })
})
