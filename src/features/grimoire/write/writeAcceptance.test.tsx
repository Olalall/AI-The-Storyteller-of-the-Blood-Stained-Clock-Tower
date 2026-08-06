import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { useGrimoireWriteLayer } from './useGrimoireWriteLayer'
import type { GameSessionAction } from '../../game-session/state/sessionActions'

const SEAT = 5

/** 记下每一次 dispatch，用来数「有没有哪一次写入没配回执」。 */
function harness() {
  const dispatched: GameSessionAction[] = []
  let session = createPrototypeGameSession()
  const dispatch = (action: GameSessionAction) => {
    dispatched.push(action)
    session = gameSessionReducer(session, action)
  }
  const hook = renderHook(() => useGrimoireWriteLayer(session, dispatch))
  return { dispatched, hook, current: () => session }
}

describe('G2 验收③：魔典上无回执的静默写入数为 0', () => {
  it('leaves a receipt behind for every single write the layer can make', () => {
    // 「静默写入」的危害不是丢数据，是说书人不知道自己刚改了什么，
    // 因而也不知道该不该撤。所以这里数的是「dispatch 次数 vs 回执次数」，
    // 而不是抽查某一条路径——抽查会漏掉下一个人新加的写入口。
    const { dispatched, hook } = harness()

    act(() => hook.result.current.setDraft({ seatId: SEAT, kind: 'life', to: 'dead' }))
    expect(dispatched, '草稿阶段一次 dispatch 都不该有').toHaveLength(0)

    act(() => hook.result.current.confirmDraft())
    expect(dispatched).toHaveLength(1)
    expect(hook.result.current.receipt, '落账后必须有回执').not.toBeNull()
    expect(hook.result.current.receipt?.undoEntryId, '回执要指得出撤销哪一条').toBe(dispatched[0].entryId)

    const afterWrite = hook.result.current.receipt
    act(() => hook.result.current.undo())
    expect(dispatched).toHaveLength(2)
    expect(hook.result.current.receipt).not.toBe(afterWrite)
    // 撤销的回执自己不可再撤销——撤销的撤销不是撤销，是一次新的状态变更。
    expect(hook.result.current.receipt?.undoEntryId).toBeNull()
  })

  it('never offers an undo button for something it did not write', () => {
    // 一颗按下去什么都不发生的撤销键，比不给这颗键更坏。
    const { dispatched, hook } = harness()

    act(() => hook.result.current.notify('长按可删除这枚标记'))

    expect(dispatched).toHaveLength(0)
    expect(hook.result.current.receipt?.undoEntryId).toBeNull()
  })
})

describe('G2 验收④：补录的时间是真实补录时刻，归属靠 backfill 字段', () => {
  it('stamps the real moment and points the attribution elsewhere', () => {
    // 回填 createdAt 会让复盘时间线说谎：它会显示成「第 2 夜就记了」，
    // 而实际上说书人是第 4 天才想起来补的。那条时间线是用来复盘判断的，
    // 一旦它把事后补录伪装成当场记录，AI 与人都会据此推断说书人当时就知道。
    const { dispatched, hook } = harness()
    const beforeAt = new Date().toISOString()

    act(() => hook.result.current.commitBackfill({
      seatId: SEAT,
      draft: { seatId: SEAT, kind: 'life', to: 'dead' },
      backfill: { attributedPhaseSegmentId: 'night-2' },
      reason: '补录第2夜的死亡',
    }))

    const action = dispatched.at(-1)
    expect(action?.type).toBe('confirm-player-state-change')
    expect(action?.backfill).toEqual({ attributedPhaseSegmentId: 'night-2' })
    expect(action?.confirmedAt >= beforeAt, 'createdAt 必须是此刻，不是被归属的那一夜').toBe(true)
    expect(hook.result.current.receipt, '补录同样强制回执').not.toBeNull()
  })
})

describe('G2 验收⑤：带 ops 之后归档体积仍在闸门预算内', () => {
  /** 同一份工作量跑两遍，唯一差别是带不带 ops/origin——只有这样量到的才是 ops 的增量。 */
  function play(withOps: boolean) {
    let session = createPrototypeGameSession()
    for (let index = 0; index < 300; index += 1) {
      const seatId = (index % 12) + 1
      const before = projectCurrentPlayerStates(session)[seatId]
      session = gameSessionReducer(session, {
        type: 'confirm-player-state-change',
        seatId,
        expectedBefore: before,
        after: { ...before, poisoned: !before.poisoned },
        segmentId: null,
        entryId: `size-${index}`,
        confirmedAt: new Date(Date.parse('2026-08-06T12:00:00.000Z') + index * 1000).toISOString(),
        reason: '体积测量',
        ...(withOps
          ? { ops: [{ op: 'impairment_set' as const, seatId, impairment: 'poisoned' as const, value: !before.poisoned }], origin: 'grimoire' as const }
          : {}),
      })
    }
    return JSON.stringify(session).length
  }

  it('adds well under half again on top of the same workload without ops', () => {
    // 闸门批那条基线（20.6KB）用的是另一种工作量——它有一半迭代无变化、被 reducer 拒掉，
    // 实际只落了约一半记录。拿它直接对比会得出「涨了 6.8 倍」的假结论。
    // 真正要盯的是 ops/origin 本身占多少，所以同一循环跑两遍。
    const withoutOps = play(false)
    const withOps = play(true)
    const growth = withOps / withoutOps

    console.log(`[归档体积] 300 次状态变更：不带 ops ${(withoutOps / 1024).toFixed(1)}KB，带 ops ${(withOps / 1024).toFixed(1)}KB，增长 ${((growth - 1) * 100).toFixed(0)}%`)
    expect(growth).toBeLessThan(1.5)
  })

  it('leaves room for the main copy plus five snapshots inside a 5MB budget', () => {
    // 快照轮转会把这份体积再乘六。撞上 localStorage 配额是在牌桌上炸，不是在 CI 里炸。
    expect(play(true) * 6).toBeLessThan(5_000_000)
  })
})
