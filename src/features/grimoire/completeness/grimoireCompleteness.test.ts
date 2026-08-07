import { describe, expect, it } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import type { GameSessionState, PlayerState, TimelineEntry } from '../../game-session/types'
import {
  completenessNotice,
  grimoireCoverage,
  isCompletenessVisible,
  projectGrimoireCompleteness,
  NO_COMPLETENESS_DISMISSAL,
  type GrimoireCompleteness,
} from './grimoireCompleteness'

const ALIVE: PlayerState = { life: 'alive', poisoned: false, drunk: false, markers: [] }
const DEAD: PlayerState = { life: 'dead', poisoned: false, drunk: false, markers: [] }

function nightAction(id: string, createdAt: string, result: string, targets: number[]): TimelineEntry {
  return {
    id,
    kind: 'night_action',
    segmentId: 'night-1',
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
        outcomeId: 'outcome',
        playerChoice: '',
        storytellerResult: result,
        informationGiven: '',
        draftRevision: 1,
      },
    },
  }
}

function stateChange(id: string, createdAt: string, seatId: number): TimelineEntry {
  return {
    id,
    kind: 'player_state_changed',
    segmentId: 'night-1',
    createdAt,
    confirmedBy: 'storyteller',
    seatId,
    before: ALIVE,
    after: DEAD,
    reason: '说书人裁定',
  }
}

/** 一局纯记录模式主持过的对局：夜里记了结果，但从没在工具里更新过玩家状态。 */
function recordedButUnapplied(entries: readonly TimelineEntry[]): GameSessionState {
  const base = createPrototypeGameSession()
  return {
    ...base,
    phaseSegments: [
      { id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: '2026-01-01T20:00:00.000Z' },
      { id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: '2026-01-01T21:00:00.000Z' },
    ],
    timeline: [...base.timeline.filter((entry) => entry.kind === 'setup_confirmed'), ...entries],
  }
}

describe('projectGrimoireCompleteness', () => {
  it('reports nothing known about a session that never reached setup', () => {
    const completeness = projectGrimoireCompleteness(createEmptyGameSession())
    expect(completeness).toMatchObject({ seatsWithRole: 0, totalSeats: 0 })
  })

  it('counts the seats the tool actually knows a role for', () => {
    const completeness = projectGrimoireCompleteness(createPrototypeGameSession())
    expect(completeness.totalSeats).toBe(12)
    expect(completeness.seatsWithRole).toBe(12)
  })

  it('ignores stale assignments left behind by a shrunken player count', () => {
    const session = { ...createPrototypeGameSession(), playerCount: 8 }
    expect(projectGrimoireCompleteness(session).seatsWithRole).toBe(8)
  })

  it('counts records that claim a state change but never got one — the opposite of stateChangeCount', () => {
    // 这是这个字段存在的全部理由。纯记录模式主持完切过来的典型局面里
    // stateChangeCount 是 0；把它填进「有 N 条记录可能涉及状态变化」这句话，
    // 提示条会在唯一该说话的时刻说出「有 0 条」。
    const session = recordedButUnapplied([
      nightAction('n1', '2026-01-01T20:10:00.000Z', '3号死亡', [3]),
      nightAction('n2', '2026-01-01T20:20:00.000Z', '5号中毒', [5]),
    ])
    const completeness = projectGrimoireCompleteness(session)

    expect(completeness.stateChangeCount).toBe(0)
    expect(completeness.pendingStateHints).toBe(2)
  })

  it('clears the debt once a state change lands on that seat afterwards', () => {
    const session = recordedButUnapplied([
      nightAction('n1', '2026-01-01T20:10:00.000Z', '3号死亡', [3]),
      stateChange('s1', '2026-01-01T20:15:00.000Z', 3),
    ])
    expect(projectGrimoireCompleteness(session).pendingStateHints).toBe(0)
  })

  it('does not let an earlier state change pay off a later record', () => {
    // 时序反过来就不算数：第 1 夜改的死亡，抵不了第 2 夜又记的一次中毒。
    const session = recordedButUnapplied([
      stateChange('s1', '2026-01-01T20:05:00.000Z', 3),
      nightAction('n1', '2026-01-01T20:10:00.000Z', '3号中毒', [3]),
    ])
    expect(projectGrimoireCompleteness(session).pendingStateHints).toBe(1)
  })

  it('leaves ordinary records alone — only state-class wording counts', () => {
    const session = recordedButUnapplied([
      nightAction('n1', '2026-01-01T20:10:00.000Z', '占卜师看了3号与5号，回答「否」', [3, 5]),
    ])
    expect(projectGrimoireCompleteness(session).pendingStateHints).toBe(0)
  })

  it('ignores records that were corrected away', () => {
    // 被更正掉的记录已经不是本局的有效事实；为它催一次补录是纯噪音。
    const superseded = nightAction('n1', '2026-01-01T20:10:00.000Z', '3号死亡', [3])
    const correction = { ...nightAction('n2', '2026-01-01T20:12:00.000Z', '看错了，恶魔选的是自己', [3]), correctionOf: 'n1' }
    const session = recordedButUnapplied([superseded, correction])
    expect(projectGrimoireCompleteness(session).pendingStateHints).toBe(0)
  })

  it('names the segment the oldest unapplied record sits in', () => {
    const session = recordedButUnapplied([
      nightAction('n1', '2026-01-01T20:10:00.000Z', '3号死亡', [3]),
    ])
    expect(projectGrimoireCompleteness(session).pendingSince).toBe('第1夜')
  })

  it('treats an execution that caused no death as nothing to reconcile', () => {
    // 弄臣被处决但没死：本来就不该有状态更新，算成欠账会让说书人去改一个不该改的字段。
    const session = recordedButUnapplied([{
      id: 'e1',
      kind: 'execution',
      segmentId: 'day-1',
      createdAt: '2026-01-01T21:10:00.000Z',
      confirmedBy: 'storyteller',
      executedSeatId: 7,
      causedDeath: false,
    }])
    expect(projectGrimoireCompleteness(session).pendingStateHints).toBe(0)
  })

  it('counts an execution that did cause death and was never applied', () => {
    const session = recordedButUnapplied([{
      id: 'e1',
      kind: 'execution',
      segmentId: 'day-1',
      createdAt: '2026-01-01T21:10:00.000Z',
      confirmedBy: 'storyteller',
      executedSeatId: 7,
      causedDeath: true,
    }])
    expect(projectGrimoireCompleteness(session).pendingStateHints).toBe(1)
    expect(projectGrimoireCompleteness(session).pendingSince).toBe('第1天')
  })
})

describe('grimoireCoverage', () => {
  const base = { stateChangeCount: 0, markerCount: 0, pendingStateHints: 0, pendingSince: null, pendingStateHintList: [] }

  it('stays none when the tool knows no roles, however many markers exist', () => {
    // 标记记得再多也补不上「不知道谁是什么」——AI 的上下文级别必须用同一套判据，
    // 否则会因为 stateChangeCount 大于 0 就误升到 standard。
    const coverage = grimoireCoverage({ ...base, seatsWithRole: 0, totalSeats: 12, stateChangeCount: 9, markerCount: 4 })
    expect(coverage).toBe('none')
  })

  it('is partial until every seat has a role', () => {
    expect(grimoireCoverage({ ...base, seatsWithRole: 11, totalSeats: 12 })).toBe('partial')
    expect(grimoireCoverage({ ...base, seatsWithRole: 12, totalSeats: 12 })).toBe('full')
  })
})

describe('completenessNotice', () => {
  const full: GrimoireCompleteness = {
    seatsWithRole: 12,
    totalSeats: 12,
    stateChangeCount: 0,
    markerCount: 0,
    pendingStateHints: 0,
    pendingSince: null,
    pendingStateHintList: [],
  }

  it('never claims the identities are complete when the board was dealt on the table', () => {
    // 这是这块存在的全部理由：不分两个维度的话，这句话会变成
    // 「12 个座位身份齐全，只是还没录标记」——一句彻头彻尾的谎话。
    const notice = completenessNotice({ ...full, seatsWithRole: 0, stateChangeCount: 5, markerCount: 2 })

    expect(notice.message).toContain('没有在工具里配过板')
    expect(notice.message).not.toContain('齐全')
    expect(notice.tone).toBe('warning')
  })

  it('points a missing-identity session at setup, not at state entry', () => {
    const notice = completenessNotice({ ...full, seatsWithRole: 0, stateChangeCount: 5 })
    expect(notice.actions.map((action) => action.id)).toEqual(['setup'])
  })

  it('names how many seats are still missing a role', () => {
    const notice = completenessNotice({ ...full, seatsWithRole: 9 })
    expect(notice.message).toContain('3 个还没有身份')
    expect(notice.actions.map((action) => action.id)).toEqual(['setup'])
  })

  it('renders the copy from the design doc verbatim once identities are complete but nothing is applied', () => {
    const notice = completenessNotice({ ...full, pendingStateHints: 9, pendingSince: '第1夜' })

    expect(notice.message).toBe('魔典已按配板生成 · 12 个座位身份齐全 · 生死毒醉标记还没录过')
    expect(notice.detail).toBe('从第1夜到现在有 9 条记录可能涉及状态变化')
    expect(notice.actions.map((action) => action.label)).toEqual([
      '逐条核对（约 1 分钟）',
      '先这样，边走边补',
      '不再提示',
    ])
  })

  it('never invents a number when there is nothing to reconcile', () => {
    // detail 若在 pendingStateHints 为 0 时也渲染，屏幕上会出现
    // 「有 0 条记录可能涉及状态变化」——一句在最需要提示时说反了的话。
    const notice = completenessNotice({ ...full, stateChangeCount: 4, markerCount: 1 })
    expect(notice.detail).toBeNull()
    expect(notice.actions).toEqual([])
  })

  it('asks for a board before anything else when there are no seats', () => {
    const notice = completenessNotice({ ...full, seatsWithRole: 0, totalSeats: 0 })
    expect(notice.actions.map((action) => action.id)).toEqual(['setup'])
    expect(notice.message).toContain('还没有座位')
  })
})

describe('isCompletenessVisible', () => {
  const withDebt: GrimoireCompleteness = {
    seatsWithRole: 12,
    totalSeats: 12,
    stateChangeCount: 0,
    markerCount: 0,
    pendingStateHints: 3,
    pendingSince: '第1夜',
    pendingStateHintList: [],
  }

  it('shows the bar while there is a debt nobody has answered', () => {
    expect(isCompletenessVisible(completenessNotice(withDebt), withDebt, NO_COMPLETENESS_DISMISSAL)).toBe(true)
  })

  it('stays quiet forever after 不再提示', () => {
    const notice = completenessNotice(withDebt)
    expect(isCompletenessVisible(notice, withDebt, { silenced: true, deferredAtHints: null })).toBe(false)
  })

  it('comes back after 先这样 once the debt itself changed', () => {
    // 「先这样，边走边补」是对**当前这一份**欠账说不用管。合成一个布尔的话，
    // 说书人只是想让它别挡着眼前这一步，却换来了整局闭嘴。
    const deferred = { silenced: false, deferredAtHints: 3 }
    expect(isCompletenessVisible(completenessNotice(withDebt), withDebt, deferred)).toBe(false)

    const grown = { ...withDebt, pendingStateHints: 4 }
    expect(isCompletenessVisible(completenessNotice(grown), grown, deferred)).toBe(true)
  })

  it('hides itself when there is nothing to say and nothing to press', () => {
    const clean: GrimoireCompleteness = { ...withDebt, stateChangeCount: 6, pendingStateHints: 0, pendingSince: null }
    expect(isCompletenessVisible(completenessNotice(clean), clean, NO_COMPLETENESS_DISMISSAL)).toBe(false)
  })

  it('stays out of the way at the start of a game that began in grimoire mode', () => {
    // 开局就用魔典时「标记还没录过」是废话，而这条会一直挂在画布顶上要人扫一眼。
    const fresh: GrimoireCompleteness = { ...withDebt, pendingStateHints: 0, pendingSince: null }
    expect(completenessNotice(fresh).tone).toBe('info')
    expect(isCompletenessVisible(completenessNotice(fresh), fresh, NO_COMPLETENESS_DISMISSAL)).toBe(false)
  })

  it('still shows up when the board itself was never configured', () => {
    const noBoard: GrimoireCompleteness = { ...withDebt, seatsWithRole: 0, pendingStateHints: 0, pendingSince: null }
    expect(isCompletenessVisible(completenessNotice(noBoard), noBoard, NO_COMPLETENESS_DISMISSAL)).toBe(true)
  })
})
