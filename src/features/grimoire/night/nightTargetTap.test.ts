import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { sessionInitialNightState } from '../../night-workbench/state/gameSessionAdapter'
import { nightWorkbenchReducer, type NightWorkbenchIntent } from '../../night-workbench/state/nightWorkbenchReducer'
import { nightSeatTap, nightSeatTapHint, nightTargetEchoState } from './nightTargetTap'
import type { NightWorkbenchState } from '../../night-workbench/types'

const AT = '2026-08-05T22:00:00.000Z'
/** 单目标项：10 号脑妖（targetCount 1，targetLabel「玩家」）。 */
const SINGLE = 'night-3-cerenovus'
/** 双目标项：4 号占卜师（targetCount 2）。 */
const DOUBLE = 'night-3-fortuneteller'

function reduce(state: NightWorkbenchState, intent: NightWorkbenchIntent): NightWorkbenchState {
  return nightWorkbenchReducer(state, { ...intent, at: AT })
}

function freshState(): NightWorkbenchState {
  return sessionInitialNightState({
    session: createPrototypeGameSession(),
    dispatchSession: () => undefined,
  })
}

/** 把光标真正挪到某一项上（只 preview 会落进只读态，那不是我们要测的路径）。 */
function focusOn(itemId: string): NightWorkbenchState {
  return reduce(reduce(freshState(), { type: 'preview', id: itemId }), { type: 'activate-preview' })
}

function targetsOf(state: NightWorkbenchState): readonly number[] {
  return state.drafts[state.previewEntryId]?.targets ?? []
}

function contextOf(state: NightWorkbenchState) {
  const item = state.queue.find((entry) => entry.id === state.previewEntryId)
  if (!item) throw new Error('夹具不完整：previewEntryId 不在队列里')
  return {
    targetCount: item.targetCount,
    targetLabel: item.targetLabel,
    targets: targetsOf(state),
    readOnly: false,
  }
}

describe('点座位选目标：分类必须与 reducer 的真实结果一致', () => {
  /**
   * 对拍。期望值来自 nightWorkbenchReducer 真正写出来的 targets——
   * 不是从 nightSeatTap 自己身上读的，所以把 nightSeatTap 改坏这里一定红。
   */
  function assertMatchesReducer(state: NightWorkbenchState, seatId: number, label: string) {
    const before = targetsOf(state)
    const tap = nightSeatTap(contextOf(state), seatId)
    const after = targetsOf(reduce(state, { type: 'target', seatId }))

    if (tap.kind === 'deselect') {
      expect(before, `${label} · 取消前应当已选中`).toContain(seatId)
      expect(after, label).toEqual(before.filter((id) => id !== seatId))
      return
    }
    if (tap.kind === 'select') {
      expect(after, label).toEqual([...before.filter((id) => id !== seatId), seatId])
      return
    }
    if (tap.kind === 'replace') {
      expect(tap.evicted.length, `${label} · 顶掉的必须真的有`).toBeGreaterThan(0)
      for (const evicted of tap.evicted) {
        expect(before, `${label} · 被顶掉的必须原本在里面`).toContain(evicted)
        expect(after, `${label} · 被顶掉的必须真的不在了`).not.toContain(evicted)
      }
      expect(after, label).toContain(seatId)
      expect(after, `${label} · 顶掉几个就少几个`).toHaveLength(before.length + 1 - tap.evicted.length)
      return
    }
    throw new Error(`${label} · 不该在这条路径上被判为 blocked：${tap.reason}`)
  }

  it('单目标项：选上 → 换人（顶掉原来那个）→ 再点一次取消', () => {
    const state = focusOn(SINGLE)
    expect(contextOf(state).targetCount).toBe(1)

    assertMatchesReducer(state, 2, '空草稿上选 2 号')
    const picked = reduce(state, { type: 'target', seatId: 2 })
    expect(targetsOf(picked)).toEqual([2])

    // 满了再点别人：这一下会顶掉 2 号，说书人按下之前就该知道。
    const tap = nightSeatTap(contextOf(picked), 5)
    expect(tap).toEqual({ kind: 'replace', seatId: 5, evicted: [2] })
    assertMatchesReducer(picked, 5, '满员时选 5 号')

    assertMatchesReducer(picked, 2, '再点 2 号取消')
  })

  it('双目标项：第二个是 select 而不是 replace，第三个才顶人', () => {
    const state = focusOn(DOUBLE)
    expect(contextOf(state).targetCount).toBe(2)

    assertMatchesReducer(state, 1, '第一个')
    const one = reduce(state, { type: 'target', seatId: 1 })

    expect(nightSeatTap(contextOf(one), 6).kind).toBe('select')
    assertMatchesReducer(one, 6, '第二个')
    const two = reduce(one, { type: 'target', seatId: 6 })
    expect(targetsOf(two)).toEqual([1, 6])

    // 顶掉的是**最早点的**那个，与 reducer 的 slice(-targetCount) 同构。
    expect(nightSeatTap(contextOf(two), 8)).toEqual({ kind: 'replace', seatId: 8, evicted: [1] })
    assertMatchesReducer(two, 8, '第三个')
    expect(targetsOf(reduce(two, { type: 'target', seatId: 8 }))).toEqual([6, 8])
  })

  it('取消中间一个之后再点，顺序仍与 reducer 一致', () => {
    let state = focusOn(DOUBLE)
    state = reduce(state, { type: 'target', seatId: 1 })
    state = reduce(state, { type: 'target', seatId: 6 })
    state = reduce(state, { type: 'target', seatId: 1 })
    expect(targetsOf(state)).toEqual([6])

    assertMatchesReducer(state, 11, '取消后补一个')
    expect(targetsOf(reduce(state, { type: 'target', seatId: 11 }))).toEqual([6, 11])
  })

  it('死亡座位照样可点：这一层根本拿不到生死', () => {
    // 很多能力能选死人（守鸦人、掘墓人、圣徒的处决判定……）。
    // 这里刻意用一个「已死」的假设去点：nightSeatTap 的入参里没有 life，
    // 所以任何人想加「死人不能选」都得先改签名，而改签名会撞上这条用例。
    const state = focusOn(SINGLE)
    const context = contextOf(state)
    expect(Object.keys(context)).not.toContain('life')
    expect(nightSeatTap(context, 3).kind).toBe('select')
  })
})

describe('点座位选目标：什么时候不写', () => {
  it('只读态一律 blocked，理由是要念出来的那句话', () => {
    const tap = nightSeatTap({ targetCount: 1, targets: [], readOnly: true }, 5)
    expect(tap).toEqual({ kind: 'blocked', reason: '本项此刻只读，点座位不写任何东西' })
  })

  it('本项不收目标时 blocked，措辞跟着 targetLabel 走', () => {
    expect(nightSeatTap({ targetCount: 0, targets: [], readOnly: false }, 5))
      .toEqual({ kind: 'blocked', reason: '本项不点目标' })
    expect(nightSeatTap({ targetCount: 0, targetLabel: '要保护的人', targets: [], readOnly: false }, 5))
      .toEqual({ kind: 'blocked', reason: '本项不点要保护的人' })
  })

  it('只读压过一切，包括已经选上的座位', () => {
    // 若把两个判断的顺序写反，只读态下点已选座位会变成「取消」——那是一次写入。
    expect(nightSeatTap({ targetCount: 1, targets: [5], readOnly: true }, 5).kind).toBe('blocked')
  })
})

describe('按下之前就说清楚这一下等于什么', () => {
  it('四种结果各有一句话，且用的是本项的措辞', () => {
    const base = { targetCount: 1, targetLabel: '玩家', readOnly: false }
    expect(nightSeatTapHint({ ...base, targets: [] }, 5)).toBe('选为玩家')
    expect(nightSeatTapHint({ ...base, targets: [5] }, 5)).toBe('取消选为玩家')
    expect(nightSeatTapHint({ ...base, targets: [2] }, 5)).toBe('选为玩家，替换2号')
    expect(nightSeatTapHint({ ...base, targets: [], readOnly: true }, 5)).toBe('本项此刻只读，点座位不写任何东西')
  })

  it('多目标被一次顶掉两个时，两个都要念出来', () => {
    // targetCount 被改小（换过角色）之后可能一次顶掉多个，写死「顶掉一个」就会漏报。
    expect(nightSeatTapHint({ targetCount: 1, targets: [2, 3], readOnly: false }, 5))
      .toBe('选为目标，替换2号、3号')
  })
})

describe('抽屉里那一行回显的事实来源', () => {
  it('还差几个是夹到 0 的，不会出现负数', () => {
    expect(nightTargetEchoState({ targetCount: 2, targets: [], readOnly: false }))
      .toEqual({ targets: [], targetCount: 2, label: '目标', remaining: 2 })
    expect(nightTargetEchoState({ targetCount: 1, targets: [2, 3], readOnly: false }).remaining).toBe(0)
    expect(nightTargetEchoState({ targetCount: 2, targetLabel: '告知', targets: [4], readOnly: false }))
      .toMatchObject({ label: '告知', remaining: 1 })
  })
})
