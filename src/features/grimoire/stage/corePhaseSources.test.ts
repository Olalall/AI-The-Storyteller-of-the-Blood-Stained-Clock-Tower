import { describe, expect, it } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import type { GameSessionState, PlayerState, TimelineEntry } from '../../game-session/types'
import type { DiscussionTimerContextValue } from '../../day-workbench/state/discussionTimerTypes'
import {
  corePhaseFor,
  discussionRemainingSeconds,
  projectDawnRoll,
  projectDayTimer,
  projectDuskBrief,
  projectGhostVotesRemaining,
  projectNightCursor,
  projectVoteTally,
} from './corePhaseSources'

const ALIVE: PlayerState = { life: 'alive', poisoned: false, drunk: false, markers: [] }
const DEAD: PlayerState = { life: 'dead', poisoned: false, drunk: false, markers: [] }

function timerValue(overrides: Partial<DiscussionTimerContextValue>): DiscussionTimerContextValue {
  return {
    activeStage: 'private',
    currentLabel: '15:00',
    summary: '',
    isRunning: false,
    hasElapsed: false,
    privateMinutes: 15,
    publicMinutes: 10,
    setDurations: () => {},
    startOrPause: () => {},
    startPublic: () => {},
    resetCurrentStage: () => {},
    ...overrides,
  }
}

function nightAction(id: string, createdAt: string, segmentId: string, result: string, targets: number[]): TimelineEntry {
  return {
    id,
    kind: 'night_action',
    segmentId,
    createdAt,
    confirmedBy: 'storyteller',
    nightRunId: 'run-1',
    wakeItemId: `item-${id}`,
    summary: result,
    details: [],
    record: {
      revision: 1,
      snapshot: {
        targets,
        roleChoice: '',
        outcomeId: 'o',
        playerChoice: '',
        storytellerResult: result,
        informationGiven: '',
        draftRevision: 1,
      },
    },
  }
}

function stateChange(id: string, createdAt: string, seatId: number, after: PlayerState): TimelineEntry {
  return {
    id,
    kind: 'player_state_changed',
    segmentId: null,
    createdAt,
    confirmedBy: 'storyteller',
    seatId,
    before: ALIVE,
    after,
    reason: '说书人裁定',
  }
}

/** 一夜已经开着的对局，黄昏快照落在 20:00。 */
function sessionWithNight(entries: readonly TimelineEntry[]): GameSessionState {
  const base = createPrototypeGameSession()
  return {
    ...base,
    phaseSegments: [{ id: 'night-2', kind: 'night', sequence: 2, label: '第2夜', createdAt: '2026-01-01T20:00:00.000Z' }],
    timeline: [...base.timeline.filter((entry) => entry.kind === 'setup_confirmed'), ...entries],
  }
}

describe('corePhaseFor', () => {
  const session = createPrototypeGameSession()

  it('keeps an unconfigured session on the plinth instead of promising a dusk briefing', () => {
    // 空局的黄昏块里「上一天结论」和「本夜队列」都不存在，画出来是两个「—」，
    // 看上去像工具坏了，而真实情况只是还没配板。
    expect(corePhaseFor('dusk', createEmptyGameSession())).toBe('idle')
    expect(corePhaseFor('dusk', session)).toBe('dusk')
  })

  it('switches the day into tally readout only once the round draft has content', () => {
    expect(corePhaseFor('day', session)).toBe('day-timer')
    const voting = { ...session, dayVoteDraft: { segmentId: 'day-pending', nominatorSeatId: 3, nomineeSeatId: 7, threshold: 6, raisedSeatIds: [], ghostVoteSeatIds: [] } }
    expect(corePhaseFor('day', voting)).toBe('day-vote')
  })

  it('maps night and dawn one to one', () => {
    expect(corePhaseFor('night', session)).toBe('night')
    expect(corePhaseFor('dawn', session)).toBe('dawn')
  })
})

describe('projectNightCursor', () => {
  it('reports nothing when no night run is active — an empty core beats a fabricated one', () => {
    expect(projectNightCursor({ ...createPrototypeGameSession(), activeNightRunId: null })).toBeNull()
  })

  it('reads current, next and previous straight off the active run cursor', () => {
    const base = createPrototypeGameSession()
    const run = Object.values(base.nightRuns)[0]
    if (!run) throw new Error('原型局应当带一个夜间运行')
    const session = { ...base, activeNightRunId: run.id, nightRuns: { [run.id]: { ...run, activeCursorId: run.queue[1].id } } }

    const source = projectNightCursor(session)
    expect(source?.cursor.current?.seatId).toBe(run.queue[1].seatId)
    expect(source?.cursor.next?.seatId).toBe(run.queue[2].seatId)
    expect(source?.cursor.previousSeatId).toBe(run.queue[0].seatId)
  })

  it('falls back to the head of the queue when the cursor id points nowhere', () => {
    // 夜里最贵的信息是「现在叫谁」。光标失联时渲染一个空核，等于在最忙的时刻把它拿走。
    const base = createPrototypeGameSession()
    const run = Object.values(base.nightRuns)[0]
    if (!run) throw new Error('原型局应当带一个夜间运行')
    const session = { ...base, activeNightRunId: run.id, nightRuns: { [run.id]: { ...run, activeCursorId: '不存在的光标' } } }

    expect(projectNightCursor(session)?.cursor.current?.seatId).toBe(run.queue[0].seatId)
  })

  it('counts only the items that still have no conclusion', () => {
    const base = createPrototypeGameSession()
    const run = Object.values(base.nightRuns)[0]
    if (!run) throw new Error('原型局应当带一个夜间运行')
    const queue = run.queue.map((item, index) => ({ ...item, progress: index === 0 ? 'confirmed' as const : 'pending' as const }))
    const session = { ...base, activeNightRunId: run.id, nightRuns: { [run.id]: { ...run, queue, activeCursorId: queue[0].id } } }

    expect(projectNightCursor(session)?.pendingCount).toBe(queue.length - 1)
  })
})

describe('discussionRemainingSeconds', () => {
  it('turns the context label back into seconds', () => {
    expect(discussionRemainingSeconds('12:34', false)).toBe(754)
    expect(discussionRemainingSeconds('0:05', false)).toBe(5)
  })

  it('reads 结束 as zero, not as no data', () => {
    // hasElapsed 时 currentLabel 是「结束」；当成没有数据源会把大字换成「—」，
    // 而此刻恰恰是说书人最需要看到 00:00 的时候。
    expect(discussionRemainingSeconds('结束', true)).toBe(0)
  })

  it('returns null rather than guessing when the label is not a clock', () => {
    expect(discussionRemainingSeconds('结束', false)).toBeNull()
    expect(discussionRemainingSeconds('', false)).toBeNull()
  })
})

describe('projectDayTimer', () => {
  it('never claims nominations are closed when nobody has started a timer', () => {
    // 猜 false 会渲染成「尚不可提名」——一句说书人没说过的话。
    expect(projectDayTimer(timerValue({})).nominationsOpen).toBeNull()
  })

  it('opens nominations exactly when the public stage has run out', () => {
    expect(projectDayTimer(timerValue({ activeStage: 'public', hasElapsed: true, currentLabel: '结束' })).nominationsOpen).toBe(true)
    expect(projectDayTimer(timerValue({ activeStage: 'private', hasElapsed: true, currentLabel: '结束' })).nominationsOpen).toBe(false)
    expect(projectDayTimer(timerValue({ activeStage: 'public', isRunning: true, currentLabel: '02:00' })).nominationsOpen).toBe(false)
  })

  it('carries the stage name so the clock is not a bare number', () => {
    expect(projectDayTimer(timerValue({ activeStage: 'public' })).phaseName).toBe('公聊')
  })
})

describe('projectVoteTally', () => {
  it('distinguishes 还没开始计票 from 0 票', () => {
    // 两者都渲染成 0 会让说书人以为自己已经点过一轮了。
    expect(projectVoteTally(createPrototypeGameSession()).raised).toBeNull()
  })

  it('counts each raised seat once and passes the threshold through untouched', () => {
    const session = {
      ...createPrototypeGameSession(),
      dayVoteDraft: { segmentId: 'day-pending', nominatorSeatId: 1, nomineeSeatId: 4, threshold: 5, raisedSeatIds: [2, 3, 2], ghostVoteSeatIds: [] },
    }
    expect(projectVoteTally(session)).toMatchObject({ raised: 2, threshold: 5, nomineeSeatId: 4 })
  })
})

describe('projectDuskBrief', () => {
  it('reports the last closed day conclusion by seat number only', () => {
    // 核是全屏最容易被玩家瞄到的一块，回执里出现角色名等于一次泄密。
    const base = createPrototypeGameSession()
    const session: GameSessionState = {
      ...base,
      phaseSegments: [{ id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: '2026-01-01T09:00:00.000Z', closedAt: '2026-01-01T10:00:00.000Z' }],
      timeline: [{
        id: 'e1',
        kind: 'execution',
        segmentId: 'day-1',
        createdAt: '2026-01-01T09:50:00.000Z',
        confirmedBy: 'storyteller',
        executedSeatId: 5,
        causedDeath: true,
      }],
    }

    const brief = projectDuskBrief(session)
    expect(brief.dayOutcome).toBe('第1天 · 处决 5号')
    expect(brief.dayOutcome).not.toContain('玩家')
  })

  it('marks an execution that caused no death instead of flattening it into 处决', () => {
    const base = createPrototypeGameSession()
    const session: GameSessionState = {
      ...base,
      phaseSegments: [{ id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: '2026-01-01T09:00:00.000Z', closedAt: '2026-01-01T10:00:00.000Z' }],
      timeline: [{
        id: 'e1',
        kind: 'execution',
        segmentId: 'day-1',
        createdAt: '2026-01-01T09:50:00.000Z',
        confirmedBy: 'storyteller',
        executedSeatId: 5,
        causedDeath: false,
      }],
    }
    expect(projectDuskBrief(session).dayOutcome).toBe('第1天 · 处决 5号（未死亡）')
  })

  it('says nothing rather than inventing a conclusion before the first day', () => {
    expect(projectDuskBrief(createPrototypeGameSession()).dayOutcome).toBeNull()
  })
})

describe('projectDawnRoll', () => {
  it('lists the seats whose life the storyteller actually changed during the night', () => {
    const session = sessionWithNight([
      nightAction('n1', '2026-01-01T20:10:00.000Z', 'night-2', '恶魔选择了3号', [3]),
      stateChange('s1', '2026-01-01T20:20:00.000Z', 3, DEAD),
    ])
    expect(projectDawnRoll(session, 'night-2')).toMatchObject({ deaths: [3], revivals: [] })
  })

  it('says 不知道 instead of 平安夜 when a record claimed a death nobody applied', () => {
    // 把「工具不知道」渲染成「平安夜」，会让一次漏记变成一条看起来很确定的假事实，
    // 而说书人正要照着它当众念出口。
    const session = sessionWithNight([
      nightAction('n1', '2026-01-01T20:10:00.000Z', 'night-2', '3号死亡', [3]),
    ])
    expect(projectDawnRoll(session, 'night-2').deaths).toBeNull()
  })

  it('says 不知道 when the night has no records at all', () => {
    expect(projectDawnRoll(sessionWithNight([]), 'night-2').deaths).toBeNull()
  })

  it('reports a confirmed quiet night as an empty list, not as unknown', () => {
    const session = sessionWithNight([
      nightAction('n1', '2026-01-01T20:10:00.000Z', 'night-2', '占卜师得到「否」', [3, 5]),
    ])
    expect(projectDawnRoll(session, 'night-2').deaths).toEqual([])
  })
})

describe('projectGhostVotesRemaining', () => {
  it('spends one ghost vote per dead player who already used theirs', () => {
    const base = createPrototypeGameSession()
    const session: GameSessionState = {
      ...base,
      timeline: [
        ...base.timeline.filter((entry) => entry.kind === 'setup_confirmed'),
        stateChange('s1', '2026-01-01T20:20:00.000Z', 3, DEAD),
        stateChange('s2', '2026-01-01T20:21:00.000Z', 4, DEAD),
        {
          id: 'v1',
          kind: 'vote_round',
          segmentId: 'day-1',
          createdAt: '2026-01-02T09:00:00.000Z',
          confirmedBy: 'storyteller',
          roundId: 'round-1',
          nominatorSeatId: 1,
          nomineeSeatId: 2,
          threshold: 5,
          raisedSeatIds: [3],
          ghostVoteSeatIds: [3],
        },
      ],
    }
    expect(projectGhostVotesRemaining(session)).toBe(1)
  })

  it('never goes negative when the same seat shows up in two rounds', () => {
    const base = createPrototypeGameSession()
    const round = (id: string, createdAt: string): TimelineEntry => ({
      id,
      kind: 'vote_round',
      segmentId: 'day-1',
      createdAt,
      confirmedBy: 'storyteller',
      roundId: id,
      nominatorSeatId: 1,
      nomineeSeatId: 2,
      threshold: 5,
      raisedSeatIds: [3],
      ghostVoteSeatIds: [3],
    })
    const session: GameSessionState = {
      ...base,
      timeline: [
        ...base.timeline.filter((entry) => entry.kind === 'setup_confirmed'),
        stateChange('s1', '2026-01-01T20:20:00.000Z', 3, DEAD),
        round('v1', '2026-01-02T09:00:00.000Z'),
        round('v2', '2026-01-02T09:30:00.000Z'),
      ],
    }
    expect(projectGhostVotesRemaining(session)).toBe(0)
  })
})
