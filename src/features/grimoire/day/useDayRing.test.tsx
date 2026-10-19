import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDayRing } from './useDayRing'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { DayRingFocusProvider } from '../../day-workbench/state/DayRingFocusProvider'
import { useDayRingFocus } from '../../day-workbench/state/dayRingFocus'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { GameSessionState } from '../../game-session/types'

const SEAT_IDS = Array.from({ length: 12 }, (_value, index) => index + 1)
/** DayVoteDraft 的完整字段集，手抄自 model/dayTypes.ts。多一个就说明有人往 payload 里塞了别的。 */
const DRAFT_KEYS = ['ghostVoteSeatIds', 'nomineeSeatId', 'nominatorSeatId', 'raisedSeatIds', 'segmentId', 'threshold']

/** 原型局停在第 3 夜。关掉夜、开一个白天，才有票型可写。 */
function sessionWithOpenDay(): GameSessionState {
  const closed = gameSessionReducer(createPrototypeGameSession(), {
    type: 'close-open-segment', phaseKind: 'night', closedAt: '2026-07-13T06:00:00.000Z',
  })
  return gameSessionReducer(closed, { type: 'open-phase-segment', phaseKind: 'day', createdAt: '2026-07-13T06:01:00.000Z' })
}

/** 环与抽屉共用同一个焦点，所以测试里也要能同时拿到两边——这正是被测的耦合。 */
function harness(initial = sessionWithOpenDay(), active = true) {
  const dispatched: GameSessionAction[] = []
  let session = initial
  const dispatch = (action: GameSessionAction) => {
    dispatched.push(action)
    session = gameSessionReducer(session, action)
  }
  const hook = renderHook(
    ({ current }: { current: GameSessionState }) => ({
      ring: useDayRing({ session: current, dispatch, seatIds: SEAT_IDS, active }),
      focus: useDayRingFocus(),
    }),
    { initialProps: { current: session }, wrapper: DayRingFocusProvider },
  )
  const sync = () => hook.rerender({ current: session })
  const tap = (seatId: number) => {
    act(() => hook.result.current.ring.onSelectSeat?.(seatId))
    sync()
  }
  return { dispatched, hook, sync, tap, current: () => session }
}

/** 走完「选提名双方 → 抽屉按下一步」，停在计票子态。 */
function reachVoteStep(kit: ReturnType<typeof harness>) {
  kit.tap(4)
  act(() => kit.hook.result.current.focus.setNominationTarget('nominee'))
  kit.sync()
  kit.tap(9)
  act(() => kit.hook.result.current.focus.setStepOverride('vote'))
  kit.sync()
}

describe('白天的环：点座位落到哪儿', () => {
  it('落进抽屉分段当前指着的那个槽，环自己不跳槽', () => {
    // 文档原话：「选人 = 点环，落到抽屉分段当前指向的槽」。
    // 环若自己往下跳，环与抽屉就各有一个「当前指向」，说书人看着抽屉、点在环上，两边对不上。
    const kit = harness()
    expect(kit.hook.result.current.ring.intent).toBe('nominator')

    kit.tap(4)
    expect(kit.hook.result.current.ring.nominatorSeatId).toBe(4)
    expect(kit.hook.result.current.ring.nomineeSeatId).toBeNull()
    expect(kit.hook.result.current.ring.intent).toBe('nominator')

    kit.tap(7)
    expect(kit.hook.result.current.ring.nominatorSeatId).toBe(7)

    act(() => kit.hook.result.current.focus.setNominationTarget('nominee'))
    kit.sync()
    kit.tap(9)
    expect(kit.hook.result.current.ring.nomineeSeatId).toBe(9)
    expect(kit.hook.result.current.ring.nominatorSeatId).toBe(7)
  })

  it('提名步三角实心、计票步降为空心——暖金始终只指「此刻的焦点」', () => {
    const kit = harness()
    expect(kit.hook.result.current.ring.emphasis).toBe('active')
    reachVoteStep(kit)
    expect(kit.hook.result.current.ring.emphasis).toBe('settled')
  })

  it('计票步点座位是打卡：只动 raisedSeatIds，门槛与全部玩家状态原样不动', () => {
    // G2 不变量 B：非 confirm-player-state-change 的 action，前后 projectCurrentPlayerStates 深等。
    const start = sessionWithOpenDay()
    // 期待值独立算：原型局 12 人全存活，百科的门槛是存活数的一半向上取整 = 6。
    // 拿「环点之前的那个值」当期待值就太松了——它自己也可能已经被环改坏。
    const beforeStates = projectCurrentPlayerStates(start)
    const kit = harness(start)
    reachVoteStep(kit)

    expect(kit.hook.result.current.ring.intent).toBe('raise')
    kit.tap(2)
    kit.tap(11)

    expect(kit.current().dayVoteDraft?.raisedSeatIds).toEqual([2, 11])
    expect(kit.current().dayVoteDraft?.threshold).toBe(6)
    expect(projectCurrentPlayerStates(kit.current())).toEqual(beforeStates)
    expect(kit.hook.result.current.ring.selectedSeatIds).toEqual([2, 11])
  })

  it('举手 N / 门槛 M / 差 X 一个都不进 payload', () => {
    // 裁决 10 的机器化版本：环上写出去的每一条 action，payload 的字段集必须
    // 恰好落在 DayVoteDraft 声明过的那六个名字里。有人把算出来的票数顺手带上，这条就红。
    const kit = harness()
    reachVoteStep(kit)
    kit.tap(2)

    expect(kit.dispatched.length).toBeGreaterThan(0)
    for (const action of kit.dispatched) {
      expect(action.type).toBe('set-day-vote-draft')
      const keys = Object.keys((action as Extract<GameSessionAction, { type: 'set-day-vote-draft' }>).draft)
      expect(keys.filter((key) => !DRAFT_KEYS.includes(key))).toEqual([])
    }
  })

  it('暂列步与非白天节点上，点座位一次 dispatch 都没有，session 引用都不换', () => {
    // 验收①的白天版：环上点不动的东西就该真的点不动，而不是「写了一份内容相同的新草稿」。
    const kit = harness()
    reachVoteStep(kit)
    act(() => kit.hook.result.current.focus.setStepOverride('standing'))
    kit.sync()

    const before = kit.current()
    expect(kit.hook.result.current.ring.intent).toBe('none')
    expect(kit.hook.result.current.ring.onSelectSeat).toBeNull()
    expect(kit.current()).toBe(before)

    const idle = harness(sessionWithOpenDay(), false)
    expect(idle.hook.result.current.ring.intent).toBe('none')
    expect(idle.hook.result.current.ring.onSelectSeat).toBeNull()
    expect(idle.dispatched).toHaveLength(0)
  })

  it('抽屉挂起确认条时环跟着锁死，死亡票 chip 也点不动', () => {
    const kit = harness()
    reachVoteStep(kit)
    kit.tap(2)

    act(() => kit.hook.result.current.focus.setWriteLocked(true))
    kit.sync()

    expect(kit.hook.result.current.ring.onSelectSeat).toBeNull()
    expect(kit.hook.result.current.ring.onConfirmGhostVote).toBeNull()
    // 锁住不等于票没了：描边仍在，否则看起来像票被清空。
    expect(kit.hook.result.current.ring.selectedSeatIds).toEqual([2])
  })
})

describe('白天的环：死亡票与处决角标', () => {
  /** 让 7 号死掉，好让他举手时长出那枚 44px 的二次确认 chip。 */
  function sessionWithDeadSeven(): GameSessionState {
    const open = sessionWithOpenDay()
    const before = projectCurrentPlayerStates(open)[7]
    return gameSessionReducer(open, {
      type: 'confirm-player-state-change',
      seatId: 7,
      expectedBefore: before,
      after: { ...before, life: 'dead' },
      segmentId: 'day-3',
      entryId: 'test-death-7',
      confirmedAt: '2026-07-13T06:02:00.000Z',
      reason: '测试夹具：7号已死',
    })
  }

  it('活人举手不长死亡票，死人举手才长', () => {
    const kit = harness(sessionWithDeadSeven())
    reachVoteStep(kit)
    kit.tap(2)
    kit.tap(7)

    const badges = kit.hook.result.current.ring.badges
    expect(badges.find((badge) => badge.seatId === 2)?.ghostVote).toBe('none')
    expect(badges.find((badge) => badge.seatId === 7)?.ghostVote).toBe('unconfirmed')
  })

  it('二次确认标上后转 confirmed，且只动 ghostVoteSeatIds', () => {
    const kit = harness(sessionWithDeadSeven())
    reachVoteStep(kit)
    kit.tap(7)

    const raisedBefore = kit.current().dayVoteDraft?.raisedSeatIds
    act(() => kit.hook.result.current.ring.onConfirmGhostVote?.(7))
    kit.sync()

    expect(kit.current().dayVoteDraft?.ghostVoteSeatIds).toEqual([7])
    expect(kit.current().dayVoteDraft?.raisedSeatIds).toEqual(raisedBefore)
    expect(kit.hook.result.current.ring.badges[0].ghostVote).toBe('confirmed')
  })

  it('没有处决记录时不挂角标', () => {
    const kit = harness()
    expect(kit.hook.result.current.ring.execution).toBeNull()
  })
})
