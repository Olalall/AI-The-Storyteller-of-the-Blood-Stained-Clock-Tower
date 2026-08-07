import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import { projectCurrentPlayerStates } from './projectors'
import { projectEffectiveTimelineEntries, projectTimelineHistory } from './projectTimelineHistory'
import type { GameSessionState } from '../types'

const NOW = '2026-08-06T12:00:00.000Z'
const LATER = '2026-08-06T12:00:03.000Z'
const SEAT = 3

function change(session: GameSessionState, entryId: string, patch: Record<string, unknown>, extra = {}) {
  const before = projectCurrentPlayerStates(session)[SEAT]
  return gameSessionReducer(session, {
    type: 'confirm-player-state-change',
    seatId: SEAT,
    expectedBefore: before,
    after: { ...before, ...patch },
    segmentId: null,
    entryId,
    confirmedAt: NOW,
    reason: '测试',
    ...extra,
  })
}

/** 把 SEAT 标死，返回 [标死后的对局, 标死前的状态]。 */
function marked() {
  const base = createPrototypeGameSession()
  const before = projectCurrentPlayerStates(base)[SEAT]
  return [change(base, 'original', { life: 'dead' }), before] as const
}

describe('撤销：投影回到操作前，历史里两条都在', () => {
  it('puts the seat back exactly where it was', () => {
    const [dead, before] = marked()
    expect(projectCurrentPlayerStates(dead)[SEAT].life).toBe('dead')

    const reverted = gameSessionReducer(dead, {
      type: 'confirm-player-state-change',
      seatId: SEAT,
      expectedBefore: projectCurrentPlayerStates(dead)[SEAT],
      after: before,
      segmentId: null,
      entryId: 'undo',
      confirmedAt: LATER,
      reason: '撤销',
      revertOf: 'original',
      origin: 'grimoire',
      ops: [{ op: 'life_set', seatId: SEAT, life: before.life }],
    })

    expect(projectCurrentPlayerStates(reverted)[SEAT]).toEqual(before)
  })

  it('keeps both records — the undone one is not hidden', () => {
    // 这正是不复用 correctionOf 的原因：correctionOf 在本仓的含义是「取代」，
    // projectEffectiveTimelineEntries 会把被指向的原条目滤掉，
    // 那样撤销就会把它本该保住的那条记录藏起来。
    const [dead, before] = marked()
    const reverted = gameSessionReducer(dead, {
      type: 'confirm-player-state-change',
      seatId: SEAT,
      expectedBefore: projectCurrentPlayerStates(dead)[SEAT],
      after: before,
      segmentId: null,
      entryId: 'undo',
      confirmedAt: LATER,
      reason: '撤销',
      revertOf: 'original',
    })

    const effective = projectEffectiveTimelineEntries(reverted.timeline).map((entry) => entry.id)
    expect(effective).toContain('original')
    expect(effective).toContain('undo')

    const history = projectTimelineHistory(reverted).map((entry) => entry.id)
    expect(history).toContain('original')
    expect(history).toContain('undo')
  })

  it('records which entry it undid', () => {
    const [dead, before] = marked()
    const reverted = gameSessionReducer(dead, {
      type: 'confirm-player-state-change',
      seatId: SEAT,
      expectedBefore: projectCurrentPlayerStates(dead)[SEAT],
      after: before,
      segmentId: null,
      entryId: 'undo',
      confirmedAt: LATER,
      reason: '撤销',
      revertOf: 'original',
    })

    expect(reverted.timeline.find((entry) => entry.id === 'undo')).toMatchObject({ revertOf: 'original' })
  })
})

describe('撤销的守卫', () => {
  function undo(session: GameSessionState, entryId: string, revertOf: string, after: unknown) {
    return gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId: SEAT,
      expectedBefore: projectCurrentPlayerStates(session)[SEAT],
      after: after as never,
      segmentId: null,
      entryId,
      confirmedAt: LATER,
      reason: '撤销',
      revertOf,
    })
  }

  it('refuses to undo the same entry twice', () => {
    // 不挡的话两次撤销都会「成功」：第二条把状态又写回撤销前，
    // 局面在说书人眼里毫无征兆地跳回去，而两条记录看起来都合法。
    const [dead, before] = marked()
    const once = undo(dead, 'undo-1', 'original', before)
    const twice = undo(once, 'undo-2', 'original', { ...before, life: 'dead' })

    expect(twice).toBe(once)
  })

  it('refuses to undo an undo', () => {
    // 那不是撤销，是一次新的状态变更，该走正常路径留下正常理由。
    const [dead, before] = marked()
    const once = undo(dead, 'undo-1', 'original', before)
    const nested = undo(once, 'undo-2', 'undo-1', { ...before, life: 'dead' })

    expect(nested).toBe(once)
  })

  it('refuses to undo an entry that does not exist', () => {
    const [dead, before] = marked()
    expect(undo(dead, 'undo-1', 'no-such-entry', before)).toBe(dead)
  })

  it('refuses to undo something that is not a state change', () => {
    const [dead, before] = marked()
    const setupId = dead.timeline.find((entry) => entry.kind === 'setup_confirmed')!.id
    expect(undo(dead, 'undo-1', setupId, before)).toBe(dead)
  })

  it('leaves the ordinary path untouched when no revertOf is given', () => {
    const base = createPrototypeGameSession()
    const next = change(base, 'plain', { drunk: true })

    expect(next).not.toBe(base)
    expect(Object.hasOwn(next.timeline.at(-1)!, 'revertOf')).toBe(false)
  })
})

describe('撤销不绕过既有边界', () => {
  it('does not open the journal editor to player state', () => {
    // append-correction 的守卫刻意只放行 night_action / day_action：
    // 「状态调整必须走各自的显式工作台，不能被通用编辑器绕过」。
    // 撤销走的是 confirm-player-state-change，那道守卫一个字都没动。
    const [dead] = marked()
    const attempted = gameSessionReducer(dead, {
      type: 'append-correction',
      originalEntryId: 'original',
      entry: { kind: 'day_action', category: 'skill', summary: '试图绕过' } as never,
      input: { id: 'sneak', createdAt: LATER },
    })

    expect(attempted).toBe(dead)
  })
})
