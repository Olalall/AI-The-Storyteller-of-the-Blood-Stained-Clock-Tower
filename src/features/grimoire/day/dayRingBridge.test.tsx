/**
 * 环与抽屉共用同一个「当前指向」——把这句话当成一条可以红的断言。
 *
 * 这是 G3 白天最容易悄悄坏掉的地方：两块屏各自持有一份 nominationTarget 时，
 * 单看任何一边的单测都是绿的，只有把它们放进同一棵树里才暴露。
 * 所以这个文件刻意同时挂上真的 DayWorkbench 和一个走 useDayRing 的环探针。
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDayRing } from './useDayRing'
import { DayWorkbench } from '../../day-workbench/DayWorkbench'
import { DayRingFocusProvider } from '../../day-workbench/state/DayRingFocusProvider'
import { DiscussionTimerProvider } from '../../day-workbench/state/discussionTimer'
import { createPrototypeGameSession, gameSessionStorageKey } from '../../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { useGameSession } from '../../game-session/state/useGameSession'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { GameSessionState } from '../../game-session/types'

const SEAT_IDS = Array.from({ length: 12 }, (_value, index) => index + 1)

function seedSessionWithOpenDay() {
  const closed = gameSessionReducer(createPrototypeGameSession(), {
    type: 'close-open-segment', phaseKind: 'night', closedAt: '2026-07-13T06:00:00.000Z',
  })
  const opened = gameSessionReducer(closed, {
    type: 'open-phase-segment', phaseKind: 'day', createdAt: '2026-07-13T06:01:00.000Z',
  })
  window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(opened))
}

function storedState() {
  return JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
}

/** 环探针：只把 useDayRing 的产出摊成几颗可点的键，不复刻任何视觉。 */
function RingProbe({ session, dispatch }: { session: GameSessionState; dispatch: React.Dispatch<GameSessionAction> }) {
  const ring = useDayRing({ session, dispatch, seatIds: SEAT_IDS, active: true })
  return (
    <div>
      <span data-testid="ring-intent">{ring.intent}</span>
      <span data-testid="ring-hint">{ring.actionHint}</span>
      {SEAT_IDS.map((seatId) => (
        <button key={seatId} type="button" disabled={!ring.onSelectSeat} onClick={() => ring.onSelectSeat?.(seatId)}>
          环{seatId}
        </button>
      ))}
    </div>
  )
}

function Harness() {
  const { session, dispatch } = useGameSession()
  return (
    <DayRingFocusProvider>
      <RingProbe session={session} dispatch={dispatch} />
      <DiscussionTimerProvider sessionId={session.id}>
        <DayWorkbench session={session} dispatch={dispatch} onExit={() => undefined} />
      </DiscussionTimerProvider>
    </DayRingFocusProvider>
  )
}

describe('环与抽屉共用白天焦点', () => {
  beforeEach(() => { window.localStorage.clear(); seedSessionWithOpenDay() })

  it('抽屉切槽，环跟着换意思', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByTestId('ring-intent')).toHaveTextContent('nominator')
    await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
    expect(screen.getByTestId('ring-intent')).toHaveTextContent('nominee')
    expect(screen.getByTestId('ring-hint')).toHaveTextContent('选为被提名人')
  })

  it('点环落进抽屉此刻指着的那个槽，抽屉立刻显示出来', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: '环3' }))
    await waitFor(() => expect(screen.getByRole('tab', { name: '提名人 · 3号' })).toBeVisible())

    await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
    await user.click(screen.getByRole('button', { name: '环8' }))
    await waitFor(() => {
      expect(storedState().dayVoteDraft).toMatchObject({ nominatorSeatId: 3, nomineeSeatId: 8 })
    })
  })

  it('抽屉推进到举手步之后，环上的同一颗座位键改成打卡', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: '环3' }))
    await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
    await user.click(screen.getByRole('button', { name: '环8' }))
    await user.click(screen.getByRole('button', { name: '下一步：记录举手' }))

    expect(screen.getByTestId('ring-intent')).toHaveTextContent('raise')
    await user.click(screen.getByRole('button', { name: '环5' }))

    await waitFor(() => {
      const draft = storedState().dayVoteDraft
      expect(draft?.raisedSeatIds).toEqual([5])
      // 抽屉那份 6 列网格是等价路径，两边看到的是同一份票。
      expect(screen.getByRole('button', { name: '取消5号举手' })).toBeVisible()
    })
  })

  it('抽屉挂起确认条时环跟着锁死，收回后又能点', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: '环3' }))
    await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
    await user.click(screen.getByRole('button', { name: '环8' }))
    await user.click(screen.getByRole('button', { name: '下一步：记录举手' }))
    await user.click(screen.getByRole('button', { name: '环5' }))
    expect(screen.getByTestId('ring-intent')).toHaveTextContent('raise')

    // 「结束今天」的二次确认条挂起时，抽屉里的座位网格是 disabled 的。
    // 环若还能点，说书人就能一边读「结束今天会清空草稿」一边继续往草稿里加票。
    await user.click(screen.getByRole('button', { name: '结束今天' }))
    await waitFor(() => expect(screen.getByTestId('ring-intent')).toHaveTextContent('none'))
    expect(screen.getByRole('button', { name: '环1' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '继续处理' }))
    await waitFor(() => expect(screen.getByTestId('ring-intent')).toHaveTextContent('raise'))
    expect(storedState().dayVoteDraft?.raisedSeatIds).toEqual([5])
  })
})
