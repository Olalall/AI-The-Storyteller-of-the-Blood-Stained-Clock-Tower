import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { sessionInitialNightState } from '../../night-workbench/state/gameSessionAdapter'
import { advanceFrom } from '../../night-workbench/state/nightWorkbenchDrafts'
import { nightWorkbenchReducer, type NightWorkbenchIntent } from '../../night-workbench/state/nightWorkbenchReducer'
import { isNightBadgeVisible, nightBadgeVisibility, nightRingBadges } from './nightRingCursor'
import type { NightWorkbenchState, WakeProgress } from '../../night-workbench/types'

const AT = '2026-08-05T22:00:00.000Z'

function freshState(): NightWorkbenchState {
  return sessionInitialNightState({
    session: createPrototypeGameSession(),
    dispatchSession: () => undefined,
  })
}

function reduce(state: NightWorkbenchState, intent: NightWorkbenchIntent): NightWorkbenchState {
  return nightWorkbenchReducer(state, { ...intent, at: AT })
}

function badgesFor(state: NightWorkbenchState) {
  return nightRingBadges({ queue: state.queue, focusItemId: state.activeCursorId })
}

/** 夹具：光标停在 10 号（cerenovus），前面三项已确认，后面依次 11 / 9 / 12 / 4 / 3 / 2 号。 */
const FOCUS_SEAT = 10

/** 把后续第一项（11 号）暂缓掉，再把光标挪回 10 号。 */
function deferNextThenReturn(): NightWorkbenchState {
  const deferred = reduce(
    reduce(reduce(freshState(), { type: 'preview', id: 'night-3-pithag' }), { type: 'activate-preview' }),
    { type: 'defer' },
  )
  const back = reduce(reduce(deferred, { type: 'preview', id: 'night-3-cerenovus' }), { type: 'activate-preview' })
  // 前置：这一支真的构造出来了，否则它会静悄悄地退化成「起始」那一支。
  if (back.activeCursorId !== 'night-3-cerenovus') throw new Error('夹具没构造出来：光标没挪回 10 号')
  if (back.queue.find((item) => item.id === 'night-3-pithag')?.progress !== 'deferred') {
    throw new Error('夹具没构造出来：11 号没被暂缓')
  }
  return back
}

describe('夜序光标的空间化', () => {
  it('当前项一枚焦点环、后续两项 ①②、已确认打 ✓', () => {
    const badges = badgesFor(freshState())

    expect(badges.get(FOCUS_SEAT)).toMatchObject({ kind: 'focus', ordinal: null })
    expect(badges.get(11)).toMatchObject({ kind: 'upcoming', ordinal: 1 })
    expect(badges.get(9)).toMatchObject({ kind: 'upcoming', ordinal: 2 })
    for (const seat of [7, 6, 5]) {
      expect(badges.get(seat), `${seat}号`).toMatchObject({ kind: 'confirmed' })
    }
    // 后续第三项起不打角标：环上一串序号没人读得完。
    expect(badges.get(12)).toBeUndefined()
    // 全屏只有一枚焦点环。这一条是设计文档的原话，也是这层唯一的强不变量。
    expect([...badges.values()].filter((badge) => badge.kind === 'focus')).toHaveLength(1)
  })

  it('①② 指的座位与「进入下一位」真正跳到的座位是同一个', () => {
    // 期望值来自 advanceFrom——工作台推进光标用的那份实现，不是本函数自己的输出。
    // 两份跳过规则一旦漂移，环上打 ① 的人和按下去真正跳到的人就是两个人。
    const scenarios: Record<string, NightWorkbenchState> = {
      起始: freshState(),
      暂缓当前项后: reduce(freshState(), { type: 'defer' }),
      把后续第一项判为本夜不适用后: reduce(
        reduce(reduce(freshState(), { type: 'preview', id: 'night-3-pithag' }), { type: 'activate-preview' }),
        { type: 'resolve-applicability', value: 'not_applicable' },
      ),
      // 关键一支：后续第一项是「已暂缓」。暂缓是待办不是过去，advanceFrom 照样走回它，
      // 所以 ① 必须还指着它。这一支若缺席，「跳过规则多写一个 deferred」不会被任何断言抓到。
      把后续第一项暂缓后再把光标挪回来: deferNextThenReturn(),
    }

    for (const [name, state] of Object.entries(scenarios)) {
      const cursor = state.queue.find((item) => item.id === state.activeCursorId)
      const advanced = advanceFrom(state)
      const nextItem = advanced.queue.find((item) => item.id === advanced.activeCursorId)
      // 前置：这一步真的挪动了光标，否则下面比的是同一项。
      expect(advanced.activeCursorId, name).not.toBe(state.activeCursorId)

      const badges = nightRingBadges({ queue: state.queue, focusItemId: state.activeCursorId })
      const first = [...badges.values()].find((badge) => badge.ordinal === 1)
      expect(first?.seatId, name).toBe(nextItem?.seatId)
      expect(badges.get(cursor?.seatId ?? -1)?.kind, name).toBe('focus')
    }
  })

  it('已暂缓打「缓」，而且它仍然是待办——不会被 ①② 跳过', () => {
    // 先暂缓后续第一项（11 号），光标仍停在 10 号。
    const deferredElsewhere = reduce(
      reduce(reduce(freshState(), { type: 'preview', id: 'night-3-pithag' }), { type: 'activate-preview' }),
      { type: 'defer' },
    )
    const backToFocus = { ...deferredElsewhere, activeCursorId: 'night-3-cerenovus', previewEntryId: 'night-3-cerenovus' }
    expect(backToFocus.queue.find((item) => item.id === 'night-3-pithag')?.progress).toBe('deferred')

    const badges = nightRingBadges({ queue: backToFocus.queue, focusItemId: 'night-3-cerenovus' })

    // 暂缓是「待办」，不是「过去」：它照样拿到 ①，而不是被跳过去让 9 号顶上来。
    expect(badges.get(11)).toMatchObject({ kind: 'upcoming', ordinal: 1 })
    expect(badges.get(9)).toMatchObject({ kind: 'upcoming', ordinal: 2 })
  })

  it('已确认与本夜不适用都算过去了，①② 跳过它们', () => {
    const queue = [
      { id: 'a', seatId: 1, progress: 'pending' as WakeProgress },
      { id: 'b', seatId: 2, progress: 'confirmed' as WakeProgress },
      { id: 'c', seatId: 3, progress: 'not_applicable' as WakeProgress },
      { id: 'd', seatId: 4, progress: 'deferred' as WakeProgress },
      { id: 'e', seatId: 5, progress: 'pending' as WakeProgress },
    ]

    const badges = nightRingBadges({ queue, focusItemId: 'a' })

    expect(badges.get(2)?.kind).toBe('confirmed')
    // not_applicable 不在四种角标里：它既不是待办也不值得在环上占一枚圆点。
    expect(badges.get(3)).toBeUndefined()
    expect(badges.get(4)).toMatchObject({ kind: 'upcoming', ordinal: 1 })
    expect(badges.get(5)).toMatchObject({ kind: 'upcoming', ordinal: 2 })
  })

  it('光标 id 在队列里找不到时不猜焦点，只保留 ✓ 与「缓」', () => {
    const queue = [
      { id: 'a', seatId: 1, progress: 'confirmed' as WakeProgress },
      { id: 'b', seatId: 2, progress: 'deferred' as WakeProgress },
      { id: 'c', seatId: 3, progress: 'pending' as WakeProgress },
    ]

    const badges = nightRingBadges({ queue, focusItemId: '不存在的项' })

    expect([...badges.values()].some((badge) => badge.kind === 'focus')).toBe(false)
    expect([...badges.values()].some((badge) => badge.kind === 'upcoming')).toBe(false)
    expect(badges.get(1)?.kind).toBe('confirmed')
    expect(badges.get(2)?.kind).toBe('deferred')
  })

  it('同一座位被两项命中时焦点最大，已确认最小', () => {
    const queue = [
      { id: 'a', seatId: 4, progress: 'confirmed' as WakeProgress },
      { id: 'b', seatId: 4, progress: 'pending' as WakeProgress },
      { id: 'c', seatId: 7, progress: 'deferred' as WakeProgress },
    ]

    // 焦点落在 b（4 号），而 4 号同时因为 a 拿到过 ✓。
    expect(nightRingBadges({ queue, focusItemId: 'b' }).get(4)?.kind).toBe('focus')
    // 焦点落在 a 时，4 号仍是焦点（focus 压过 confirmed）；被焦点压住的那一枚 ①
    // 不消耗序号，所以 7 号拿到的是 ① 而不是 ②——环上不会出现「只有②、找不到①」。
    const badges = nightRingBadges({ queue, focusItemId: 'a' })
    expect(badges.get(4)?.kind).toBe('focus')
    expect(badges.get(7)).toMatchObject({ kind: 'upcoming', ordinal: 1 })
  })
})

describe('夜序角标的遮蔽分档', () => {
  it('L0 一枚都不进 DOM', () => {
    expect(nightBadgeVisibility('L0')).toEqual({ focus: false, upcoming: false, settled: false })
  })

  it('L1 只放行滑动窗口那三枚，✓ 与「缓」推到 L2', () => {
    // 焦点与 ①② 是三座位的滑动窗口，看一眼只得到「这几个人前后行动」；
    // ✓ 与「缓」是累积的，一夜下来等于一张「谁有夜间能力」的完整地图。
    expect(nightBadgeVisibility('L1')).toEqual({ focus: true, upcoming: true, settled: false })
    expect(nightBadgeVisibility('L2')).toEqual({ focus: true, upcoming: true, settled: true })
  })

  it('isNightBadgeVisible 按 kind 分派，不是按级别一刀切', () => {
    const badges = badgesFor(freshState())
    const focus = badges.get(FOCUS_SEAT)
    const confirmed = badges.get(7)
    expect(focus && confirmed).toBeTruthy()

    expect(isNightBadgeVisible(focus!, 'L1')).toBe(true)
    expect(isNightBadgeVisible(confirmed!, 'L1')).toBe(false)
    expect(isNightBadgeVisible(confirmed!, 'L2')).toBe(true)
    expect(isNightBadgeVisible(focus!, 'L0')).toBe(false)
  })
})
