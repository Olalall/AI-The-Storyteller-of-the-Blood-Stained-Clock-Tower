/**
 * 环上点一下到底会发生什么，判据只有这一处。
 *
 * 此前它没有任何测试：复核实测把只读闸门整行删掉，425 条测试照样全绿。
 */
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DiscussionTimerProvider } from '../../day-workbench/state/discussionTimer'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { useRingBindings } from './useRingBindings'
import type { GameSessionState } from '../../game-session/types'

const SEATS = Array.from({ length: 12 }, (_v, index) => index + 1)

function mount(session: GameSessionState, dispatchSession = vi.fn()) {
  const notify = vi.fn()
  const view = renderHook(() => useRingBindings({
    session,
    dispatch: vi.fn(),
    deckNode: 'night',
    seatIds: SEATS,
    shield: 'L1',
    nightBinding: { session, dispatchSession },
    notify,
    openActionBar: vi.fn(),
  }), { wrapper: ({ children }) => <DiscussionTimerProvider sessionId={session.id}>{children}</DiscussionTimerProvider> })
  return { view, notify, dispatchSession }
}

/** 预览一条**已确认**的项：抽屉里那张卡此时是 fieldset disabled。 */
function previewingAnotherItem(): GameSessionState {
  const session = createPrototypeGameSession()
  const runId = session.activeNightRunId!
  const run = session.nightRuns[runId]
  // 必须是「已确认**且**真的收目标」的那种项：targetCount 为 0 的项走不到夜间分支，
  // 拿它当夹具会让这条测试恒绿——第一版就踩了这个坑（philosopher 的 targetCount 是 0）。
  const confirmed = run.queue.find((item) => item.progress === 'confirmed' && item.targetCount > 0)
  if (!confirmed) throw new Error('夹具里没有「已确认且收目标」的夜序项，这条测试失去了意义')
  return { ...session, nightRuns: { ...session.nightRuns, [runId]: { ...run, previewEntryId: confirmed.id } } }
}

describe('夜环的只读闸门', () => {
  it('writes while the current item is editable', () => {
    // 正面锚点。没有它，「永远不写」这种实现也能让下面那条通过。
    const { view, dispatchSession } = mount(createPrototypeGameSession())
    view.result.current.onSelectSeat(2)

    expect(dispatchSession).toHaveBeenCalled()
  })

  it('keeps earlier night targets during rapid multi-target ring taps', () => {
    const session = createPrototypeGameSession()
    const runId = session.activeNightRunId!
    const run = session.nightRuns[runId]
    const itemId = run.previewEntryId
    const multiTargetSession: GameSessionState = {
      ...session,
      nightRuns: {
        ...session.nightRuns,
        [runId]: {
          ...run,
          queue: run.queue.map((item) => item.id === itemId
            ? { ...item, targetCount: 2, minimumTargetCount: 2, targetLabel: '两名目标' }
            : item),
        },
      },
    }
    const { view, dispatchSession } = mount(multiTargetSession)

    view.result.current.onSelectSeat(6)
    view.result.current.onSelectSeat(7)

    const lastAction = dispatchSession.mock.calls.at(-1)?.[0]
    expect(lastAction?.nightRun.drafts[itemId].targets).toEqual([6, 7])
  })

  it('refuses to write while previewing another item, and says why', () => {
    // 抽屉里那张卡此刻是 fieldset disabled，而两块屏显示的是同一项。
    // 环上点得动的话，说书人回头看已确认的项会发现目标被自己改掉了。
    const { view, notify, dispatchSession } = mount(previewingAnotherItem())
    view.result.current.onSelectSeat(2)

    expect(dispatchSession).not.toHaveBeenCalled()
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('只读'))
  })

  it('never leaves a refused tap silent', () => {
    // 按下去毫无反应是本工具里最坏的一种反馈——他会以为自己点上了。
    const { view, notify } = mount(previewingAnotherItem())
    view.result.current.onSelectSeat(2)

    expect(notify).toHaveBeenCalledOnce()
  })
})

describe('逐座位的提示语', () => {
  it('tells a selected seat it will be cleared, not re-picked', () => {
    // 拿座位号 0 算一次贴给所有人的话，已选中那一座会念出与实际行为相反的提示：
    // 读屏用户以为自己重选了一次，于是再按一次又把它选回来。
    const session = createPrototypeGameSession()
    const runId = session.activeNightRunId!
    const run = session.nightRuns[runId]
    const withTarget: GameSessionState = {
      ...session,
      nightRuns: { ...session.nightRuns, [runId]: {
        ...run,
        drafts: { ...run.drafts, [run.previewEntryId]: { ...run.drafts[run.previewEntryId], targets: [3] } },
      } },
    }
    const { view } = mount(withTarget)
    const hintFor = view.result.current.actionHintFor

    expect(hintFor).toBeDefined()
    expect(hintFor!(3)).not.toBe(hintFor!(4))
    expect(hintFor!(3)).toContain('取消')
  })

  it('marks targeted seats so a screen reader can hear which ones are picked', () => {
    const session = createPrototypeGameSession()
    const runId = session.activeNightRunId!
    const run = session.nightRuns[runId]
    const withTarget: GameSessionState = {
      ...session,
      nightRuns: { ...session.nightRuns, [runId]: {
        ...run,
        drafts: { ...run.drafts, [run.previewEntryId]: { ...run.drafts[run.previewEntryId], targets: [3] } },
      } },
    }
    const { view } = mount(withTarget)

    expect([...view.result.current.nightTargetSeatIds]).toContain(3)
  })
})
