import { describe, expect, it } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession } from '../data/createPrototypeSession'
import { createCatfishingPrototypeCandidates, createSetupDraftFromCandidate } from '../../setup'
import { gameSessionReducer } from './sessionReducer'
import { projectConfirmedSetup, projectCurrentAssignments, projectCurrentPlayerStates, projectNightConfirmedRecords, projectStorytellerSeatSummaries } from './projectors'

describe('game-session projections', () => {
  it('can start a blank Catfishing setup shell after a reset without restoring old logs', () => {
    const blank = createEmptyGameSession('2026-07-18T10:00:00.000Z')
    const started = gameSessionReducer(blank, {
      type: 'start-catfishing-setup-session',
      createdAt: '2026-07-18T10:01:00.000Z',
    })

    expect(started.playerCount).toBe(12)
    expect(Object.keys(started.seats)).toHaveLength(12)
    expect(Object.keys(started.initialPlayerStates)).toHaveLength(12)
    expect(started.timeline).toEqual([])
    expect(started.phaseSegments).toEqual([])
    expect(started.nightRuns).toEqual({})
    expect(started.activeNightRunId).toBeNull()
    expect(projectStorytellerSeatSummaries(started)).toHaveLength(12)
    expect(projectCurrentAssignments(started)).toEqual([])
  })

  it('starts 7-15 player setup shells with nicknames and regular default experience', () => {
    const blank = createEmptyGameSession('2026-07-18T10:00:00.000Z')
    const seven = gameSessionReducer(blank, {
      type: 'start-catfishing-setup-session',
      createdAt: '2026-07-18T10:01:00.000Z',
      playerCount: 7,
      seats: [
        { seatId: 1, nickname: '阿一', experience: 'new' },
        { seatId: 2, nickname: '阿二' },
      ],
    })
    const fifteen = gameSessionReducer(createEmptyGameSession('2026-07-18T10:02:00.000Z'), {
      type: 'start-catfishing-setup-session',
      createdAt: '2026-07-18T10:03:00.000Z',
      playerCount: 15,
    })

    expect(seven.playerCount).toBe(7)
    expect(Object.keys(seven.seats)).toHaveLength(7)
    expect(seven.seats[1]).toMatchObject({ nickname: '阿一', experience: 'new' })
    expect(seven.seats[2]).toMatchObject({ nickname: '阿二', experience: 'regular' })
    expect(seven.seats[7]).toMatchObject({ nickname: '玩家7', experience: 'regular' })
    expect(seven.timeline).toEqual([])
    expect(seven.phaseSegments).toEqual([])
    expect(fifteen.playerCount).toBe(15)
    expect(Object.keys(fifteen.seats)).toHaveLength(15)
  })

  it('rejects out-of-range setup player counts without mutating the blank session', () => {
    const blank = createEmptyGameSession('2026-07-18T10:00:00.000Z')
    const rejected = gameSessionReducer(blank, {
      type: 'start-catfishing-setup-session',
      createdAt: '2026-07-18T10:01:00.000Z',
      playerCount: 16,
    })

    expect(rejected).toBe(blank)
  })

  it('does not replace an active session with a setup shell', () => {
    const session = createPrototypeGameSession()
    const unchanged = gameSessionReducer(session, {
      type: 'start-catfishing-setup-session',
      createdAt: '2026-07-18T10:01:00.000Z',
    })

    expect(unchanged).toBe(session)
  })

  it('creates the first night run from the confirmed setup projection', () => {
    const setupShell = gameSessionReducer(createEmptyGameSession('2026-07-18T10:00:00.000Z'), {
      type: 'start-catfishing-setup-session',
      createdAt: '2026-07-18T10:01:00.000Z',
    })
    const candidate = createCatfishingPrototypeCandidates()[1]
    const withDraft = gameSessionReducer(setupShell, {
      type: 'set-setup-draft',
      draft: createSetupDraftFromCandidate(candidate, '2026-07-18T10:02:00.000Z'),
    })
    const confirmed = gameSessionReducer(withDraft, {
      type: 'confirm-setup',
      id: 'setup-blank-flow',
      confirmedAt: '2026-07-18T10:03:00.000Z',
    })
    const withRun = gameSessionReducer(confirmed, { type: 'start-next-night-run' })
    const opened = gameSessionReducer(withRun, {
      type: 'open-phase-segment',
      phaseKind: 'night',
      createdAt: '2026-07-18T10:04:00.000Z',
    })
    const run = opened.activeNightRunId ? opened.nightRuns[opened.activeNightRunId] : null
    const confirmedRoleBySeat = new Map(projectCurrentAssignments(confirmed).map((assignment) => [assignment.seatId, assignment.role.id]))

    expect(run).not.toBeNull()
    expect(run?.phaseSegmentId).toBe(opened.phaseSegments.find((segment) => segment.kind === 'night')?.id)
    expect(run?.queue.length).toBeGreaterThan(0)
    expect(run?.queue.every((item) => confirmedRoleBySeat.get(item.seatId) === item.roleId)).toBe(true)
  })

  it('uses the timeline setup snapshot and preserves the current night records as projections', () => {
    const session = createPrototypeGameSession()

    expect(projectConfirmedSetup(session)?.draft.assignments).toHaveLength(12)
    expect(projectCurrentAssignments(session).find((assignment) => assignment.seatId === 10)?.role.id).toBe('cerenovus')
    expect(projectNightConfirmedRecords(session, session.activeNightRunId ?? '')['night-3-gambler']).toHaveLength(1)
  })

  it('applies a confirmed setup change only to future setup projections', () => {
    const session = createPrototypeGameSession()
    const assignments = projectCurrentAssignments(session)
    const seatTen = assignments.find((assignment) => assignment.seatId === 10)
    const replacement = assignments.find((assignment) => assignment.seatId === 11)
    if (!seatTen || !replacement) throw new Error('fixture is incomplete')

    const changed = gameSessionReducer(session, {
      type: 'append-setup-change',
      id: 'role-change-1',
      createdAt: '2026-07-13T03:00:00.000Z',
      seatId: 10,
      fromRole: seatTen.role,
      toRole: replacement.role,
      reason: '说书人微调',
    })

    expect(projectCurrentAssignments(changed).find((assignment) => assignment.seatId === 10)?.role.id).toBe('pithag')
    expect(changed.nightRuns[changed.activeNightRunId ?? ''].queue.find((item) => item.seatId === 10)?.roleId).toBe('cerenovus')
    expect(changed.timeline.find((entry) => entry.id === 'role-change-1')).toMatchObject({
      kind: 'setup_changed',
      originNightRunId: null,
    })
  })

  it('does not change player state until a confirmed player-state timeline entry is appended', () => {
    const session = createPrototypeGameSession()
    const before = projectCurrentPlayerStates(session)
    const after = { ...before[4], life: 'dead' as const }
    const changed = gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId: 4,
      expectedBefore: before[4],
      after,
      segmentId: null,
      entryId: 'state-change-1',
      confirmedAt: '2026-07-13T04:00:00.000Z',
      reason: '说书人手动更新状态',
    })

    expect(before[4].life).toBe('alive')
    expect(projectCurrentPlayerStates(changed)[4].life).toBe('dead')
    expect(changed.phaseSegments.find((segment) => segment.kind === 'day')).toBeUndefined()
  })
})
