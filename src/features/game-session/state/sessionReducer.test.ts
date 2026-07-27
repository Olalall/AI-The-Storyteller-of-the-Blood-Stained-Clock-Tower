import { describe, expect, it } from 'vitest'
import { catfishingRoleSnapshots } from '../../night-workbench/data/catfishing'
import { sessionInitialNightState } from '../../night-workbench/state/gameSessionAdapter'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { roleSnapshotFromWakeItem } from '../../night-workbench/state/roleChanges'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { closeOpenSegment } from './timeline'
import { projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'

const voteCreatedAt = '2026-07-13T09:00:00.000Z'

function recordVoteRound(session = createPrototypeGameSession(), nomineeSeatId = 4, voteCount = 6) {
  const raisedSeatIds = Array.from({ length: voteCount }, (_value, index) => index + 1)
  return gameSessionReducer(session, {
    type: 'append-phase-entry',
    phaseKind: 'day',
    entry: {
      kind: 'vote_round',
      roundId: `round-${nomineeSeatId}-${voteCount}`,
      nominatorSeatId: 1,
      nomineeSeatId,
      threshold: 6,
      raisedSeatIds,
      ghostVoteSeatIds: [],
    },
    input: { id: `vote-${nomineeSeatId}-${voteCount}`, createdAt: voteCreatedAt },
  })
}

function currentDayId(session: ReturnType<typeof createPrototypeGameSession>) {
  const day = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
  if (!day) throw new Error('day fixture was not created')
  return day.id
}

describe('day resolution reducer commands', () => {
  it('atomically appends the execution and player-state facts for the current standing', () => {
    const withVote = recordVoteRound()
    const daySegmentId = currentDayId(withVote)
    const resolved = gameSessionReducer(withVote, {
      type: 'confirm-day-execution',
      daySegmentId,
      nomineeSeatId: 4,
      sourceRoundId: 'round-4-6',
      executionEntryId: 'execution-4',
      playerStateEntryId: 'state-4',
      confirmedAt: '2026-07-13T09:01:00.000Z',
    })

    expect(resolved.phaseSegments.find((segment) => segment.id === daySegmentId)?.closedAt).toBeUndefined()
    expect(resolved.timeline.filter((entry) => entry.segmentId === daySegmentId && entry.kind === 'execution')).toHaveLength(1)
    expect(resolved.timeline.filter((entry) => entry.segmentId === daySegmentId && entry.kind === 'player_state_changed')).toHaveLength(1)
    expect(projectCurrentPlayerStates(resolved)[4].life).toBe('dead')
  })

  it('rejects a stale standing and any second resolution for the same open day', () => {
    const firstRound = recordVoteRound()
    const withNewLeader = recordVoteRound(firstRound, 5, 7)
    const daySegmentId = currentDayId(withNewLeader)
    const stale = gameSessionReducer(withNewLeader, {
      type: 'confirm-day-execution',
      daySegmentId,
      nomineeSeatId: 4,
      sourceRoundId: 'round-4-6',
      executionEntryId: 'execution-stale',
      playerStateEntryId: 'state-stale',
      confirmedAt: '2026-07-13T09:02:00.000Z',
    })
    expect(stale).toBe(withNewLeader)

    const resolved = gameSessionReducer(withNewLeader, {
      type: 'confirm-day-execution',
      daySegmentId,
      nomineeSeatId: 5,
      sourceRoundId: 'round-5-7',
      executionEntryId: 'execution-5',
      playerStateEntryId: 'state-5',
      confirmedAt: '2026-07-13T09:03:00.000Z',
    })
    const duplicate = gameSessionReducer(resolved, {
      type: 'confirm-day-no-execution',
      daySegmentId,
      entryId: 'no-execution-after-execution',
      confirmedAt: '2026-07-13T09:04:00.000Z',
    })
    expect(duplicate).toBe(resolved)
  })

  it('records no execution only through its explicit command and leaves player state unchanged', () => {
    const withVote = recordVoteRound()
    const daySegmentId = currentDayId(withVote)
    const resolved = gameSessionReducer(withVote, {
      type: 'confirm-day-no-execution',
      daySegmentId,
      entryId: 'no-execution-1',
      confirmedAt: '2026-07-13T09:05:00.000Z',
    })

    expect(resolved.timeline.some((entry) => entry.id === 'no-execution-1' && entry.kind === 'no_execution')).toBe(true)
    expect(resolved.timeline.some((entry) => entry.segmentId === daySegmentId && entry.kind === 'player_state_changed')).toBe(false)
    expect(projectCurrentPlayerStates(resolved)[4].life).toBe('alive')
    expect(gameSessionReducer(resolved, {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: { kind: 'execution', executedSeatId: 4 },
      input: { id: 'bypassed-execution', createdAt: '2026-07-13T09:06:00.000Z' },
    })).toBe(resolved)
    expect(gameSessionReducer(resolved, {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: { kind: 'no_execution' },
      input: { id: 'bypassed-no-execution', createdAt: '2026-07-13T09:07:00.000Z' },
    })).toBe(resolved)
  })
})

describe('dashboard player-state command', () => {
  it('appends a confirmed manual status change without creating a day or night', () => {
    const session = createPrototypeGameSession()
    const before = projectCurrentPlayerStates(session)[4]
    const changed = gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId: 4,
      expectedBefore: before,
      after: { ...before, poisoned: true },
      segmentId: null,
      entryId: 'dashboard-state-4',
      confirmedAt: '2026-07-14T12:00:00.000Z',
      reason: '说书人手动更新状态',
    })

    expect(projectCurrentPlayerStates(changed)[4].poisoned).toBe(true)
    expect(changed.timeline.find((entry) => entry.id === 'dashboard-state-4')).toMatchObject({ kind: 'player_state_changed', segmentId: null })
    expect(changed.phaseSegments).toHaveLength(session.phaseSegments.length)
  })

  it('rejects a stale status draft and generic state appends', () => {
    const session = createPrototypeGameSession()
    const before = projectCurrentPlayerStates(session)[4]
    const updated = gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId: 4,
      expectedBefore: before,
      after: { ...before, poisoned: true },
      segmentId: null,
      entryId: 'dashboard-state-first',
      confirmedAt: '2026-07-14T12:00:00.000Z',
      reason: '说书人手动更新状态',
    })

    expect(gameSessionReducer(updated, {
      type: 'confirm-player-state-change',
      seatId: 4,
      expectedBefore: before,
      after: { ...before, drunk: true },
      segmentId: null,
      entryId: 'dashboard-state-stale',
      confirmedAt: '2026-07-14T12:01:00.000Z',
      reason: '说书人手动更新状态',
    })).toBe(updated)
    expect(gameSessionReducer(updated, {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: { kind: 'player_state_changed', seatId: 4, before, after: { ...before, life: 'dead' }, reason: '绕过' },
      input: { id: 'bypassed-player-state', createdAt: '2026-07-14T12:02:00.000Z' },
    })).toBe(updated)
  })
})

describe('night workbench commit command', () => {
  it('commits the queue state and its first confirmed record in one reducer result', () => {
    const session = createPrototypeGameSession()
    const runId = session.activeNightRunId!
    const run = session.nightRuns[runId]
    const wakeItemId = run.activeCursorId
    const nextRun = {
      ...run,
      queue: run.queue.map((item) => item.id === wakeItemId ? { ...item, progress: 'confirmed' as const } : item),
      drafts: {
        ...run.drafts,
        [wakeItemId]: {
          ...emptyWakeDraft(),
          targets: [3],
          roleChoice: 'investigator',
          outcomeId: 'applied',
          playerChoice: '选择3号',
          storytellerResult: '已告知',
        },
      },
    }
    const committed = gameSessionReducer(session, {
      type: 'commit-night-workbench',
      nightRun: nextRun,
      records: [{
        id: 'night-commit-1',
        wakeItemId,
        revision: 1,
        confirmedAt: '2026-07-13T10:00:00.000Z',
        snapshot: nextRun.drafts[wakeItemId],
      }],
      roleChanges: [],
    })

    expect(committed.nightRuns[runId].queue.find((item) => item.id === wakeItemId)?.progress).toBe('confirmed')
    expect(committed.timeline.find((entry) => entry.id === 'night-commit-1')).toMatchObject({
      kind: 'night_action',
      nightRunId: runId,
      wakeItemId,
      segmentId: 'night-3',
    })
  })

  it('closes the active night and creates a separate next-night run only when explicitly started', () => {
    const session = createPrototypeGameSession()
    const originalRunId = session.activeNightRunId!
    const closed = gameSessionReducer(session, {
      type: 'close-active-night-run',
      nightRunId: originalRunId,
      closedAt: '2026-07-13T10:10:00.000Z',
    })
    const started = gameSessionReducer(closed, { type: 'start-next-night-run' })
    const nextRunId = started.activeNightRunId!
    const nextRun = started.nightRuns[nextRunId]

    expect(closed.phaseSegments.find((segment) => segment.id === 'night-3')?.closedAt).toBe('2026-07-13T10:10:00.000Z')
    expect(nextRunId).not.toBe(originalRunId)
    expect(nextRun.phaseSegmentId).toBeNull()
    expect(started.phaseSegments.filter((segment) => segment.kind === 'night')).toHaveLength(1)
    expect(nextRun.queue.every((item) => !item.id.startsWith('night-3-'))).toBe(true)

    const wakeItemId = nextRun.activeCursorId
    const nextNightRun = {
      ...nextRun,
      queue: nextRun.queue.map((item) => item.id === wakeItemId ? { ...item, progress: 'confirmed' as const } : item),
      drafts: {
        [wakeItemId]: { ...emptyWakeDraft(), outcomeId: 'hold', storytellerResult: '第4夜已记录。' },
      },
    }
    const committed = gameSessionReducer(started, {
      type: 'commit-night-workbench',
      nightRun: nextNightRun,
      records: [{
        id: 'night-4-commit-1',
        wakeItemId,
        revision: 1,
        confirmedAt: '2026-07-13T10:11:00.000Z',
        snapshot: nextNightRun.drafts[wakeItemId],
      }],
      roleChanges: [],
    })

    expect(committed.phaseSegments.find((segment) => segment.id === 'night-4')?.closedAt).toBeUndefined()
    expect(committed.timeline.find((entry) => entry.id === 'night-4-commit-1')).toMatchObject({
      kind: 'night_action',
      nightRunId: nextRunId,
      segmentId: 'night-4',
    })
    expect(committed.timeline.filter((entry) => entry.kind === 'night_action' && entry.nightRunId === originalRunId)).toHaveLength(3)
  })

  it('keeps a night role change in its original night record after the next night starts', () => {
    const session = createPrototypeGameSession()
    const originalRunId = session.activeNightRunId!
    const originalRun = session.nightRuns[originalRunId]
    const changedItem = originalRun.queue.find((item) => item.id === 'night-3-cerenovus')
    const replacement = catfishingRoleSnapshots.find((role) => role.id === 'pithag')
    if (!changedItem || !replacement) throw new Error('fixture is incomplete')

    const changed = gameSessionReducer(session, {
      type: 'commit-night-workbench',
      nightRun: originalRun,
      records: [],
      roleChanges: [{
        id: 'night-3-role-change-1',
        seatId: changedItem.seatId,
        revision: 1,
        changedAt: '2026-07-13T10:05:00.000Z',
        nightRunId: originalRunId,
        originNightRunId: originalRunId,
        phaseLabel: '第3夜',
        fromRole: roleSnapshotFromWakeItem(changedItem),
        toRole: replacement,
        reason: 'gameplay',
        confirmedBy: 'storyteller',
      }],
    })

    expect(changed.timeline.find((entry) => entry.id === 'night-3-role-change-1')).toMatchObject({
      kind: 'setup_changed',
      originNightRunId: originalRunId,
    })
    expect(sessionInitialNightState({ session: changed, dispatchSession: () => undefined }).roleChangeEvents).toHaveLength(1)

    const closed = gameSessionReducer(changed, {
      type: 'close-active-night-run',
      nightRunId: originalRunId,
      closedAt: '2026-07-13T10:06:00.000Z',
    })
    const nextNight = gameSessionReducer(closed, { type: 'start-next-night-run' })

    expect(sessionInitialNightState({ session: nextNight, dispatchSession: () => undefined }).roleChangeEvents).toEqual([])
  })

  it('keeps a correction in a closed original night without creating another night', () => {
    const session = closeOpenSegment(createPrototypeGameSession(), 'night', '2026-07-13T10:01:00.000Z')
    const runId = session.activeNightRunId!
    const run = session.nightRuns[runId]
    const original = session.timeline.find((entry) => entry.kind === 'night_action')
    if (!original || original.kind !== 'night_action') throw new Error('fixture is incomplete')

    const corrected = gameSessionReducer(session, {
      type: 'commit-night-workbench',
      nightRun: run,
      records: [{
        id: 'night-correction-1',
        wakeItemId: original.wakeItemId,
        revision: original.record.revision + 1,
        confirmedAt: '2026-07-13T10:02:00.000Z',
        correctionOf: original.id,
        snapshot: { ...original.record.snapshot, storytellerResult: '更正后信息' },
      }],
      roleChanges: [],
    })

    expect(corrected.timeline.find((entry) => entry.id === 'night-correction-1')).toMatchObject({
      correctionOf: original.id,
      segmentId: 'night-3',
    })
    expect(corrected.phaseSegments.filter((segment) => segment.kind === 'night')).toHaveLength(1)
  })

  it('accepts only a same-action history correction with a reason', () => {
    const session = createPrototypeGameSession()
    const original = session.timeline.find((entry) => entry.kind === 'night_action')
    if (!original || original.kind !== 'night_action') throw new Error('fixture is incomplete')
    const correctionEntry = {
      kind: 'night_action' as const,
      nightRunId: original.nightRunId,
      wakeItemId: original.wakeItemId,
      summary: '日记更正后的结果',
      details: [],
      record: { revision: original.record.revision + 1, snapshot: { ...original.record.snapshot, storytellerResult: '日记更正后的结果' } },
      correctionReason: '记录目标有误',
    }

    const corrected = gameSessionReducer(session, {
      type: 'append-correction',
      originalEntryId: original.id,
      entry: correctionEntry,
      input: { id: 'history-correction-1', createdAt: '2026-07-14T10:00:00.000Z' },
    })
    const mismatched = gameSessionReducer(session, {
      type: 'append-correction',
      originalEntryId: original.id,
      entry: { ...correctionEntry, wakeItemId: 'other-wake-item' },
      input: { id: 'history-correction-invalid', createdAt: '2026-07-14T10:00:00.000Z' },
    })
    const vote = session.timeline.find((entry) => entry.kind === 'vote_round')

    const dayAction = gameSessionReducer(session, {
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: {
        kind: 'day_action',
        category: 'skill',
        actorSeatId: 3,
        targetSeatIds: [5],
        summary: '3号发动白天技能 → 5号',
        details: [],
      },
      input: { id: 'day-action-to-protect', createdAt: '2026-07-14T10:01:00.000Z' },
    })
    const categoryMismatch = gameSessionReducer(dayAction, {
      type: 'append-correction',
      originalEntryId: 'day-action-to-protect',
      entry: {
        kind: 'day_action',
        category: 'public_event',
        actorSeatId: null,
        targetSeatIds: [5],
        summary: '公开事件：不应改变分类',
        details: [],
        correctionReason: '不应允许',
      },
      input: { id: 'day-action-category-mismatch', createdAt: '2026-07-14T10:02:00.000Z' },
    })

    expect(corrected.timeline.find((entry) => entry.id === 'history-correction-1')).toMatchObject({
      correctionOf: original.id,
      segmentId: original.segmentId,
      correctionReason: '记录目标有误',
    })
    expect(mismatched).toBe(session)
    expect(categoryMismatch).toBe(dayAction)
    if (vote?.kind === 'vote_round') {
      expect(gameSessionReducer(session, {
        type: 'append-correction',
        originalEntryId: vote.id,
        entry: { ...vote, correctionReason: '不应允许' },
        input: { id: 'vote-correction-invalid', createdAt: '2026-07-14T10:00:00.000Z' },
      })).toBe(session)
    }
  })
})
