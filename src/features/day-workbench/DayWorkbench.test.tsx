import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { useGameSession } from '../game-session/state/useGameSession'
import { createPrototypeGameSession, gameSessionStorageKey } from '../game-session/data/createPrototypeSession'
import type { GameSessionState } from '../game-session/types'
import { DiscussionTimerProvider } from './state/discussionTimer'
import { DayWorkbench } from './DayWorkbench'

function DayWorkbenchHarness() {
  const { session, dispatch } = useGameSession()
  return <DiscussionTimerProvider sessionId={session.id}><DayWorkbench session={session} dispatch={dispatch} onExit={() => undefined} /></DiscussionTimerProvider>
}

function storedState() {
  return JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
}


/**
 * 默认落地已改为空对局（首次打开显示入口界面），而这些用例测的是工作台本身，
 * 需要一局进行中的对局做夹具，所以显式播种。
 */
function seedPrototypeSession() {
  window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(createPrototypeGameSession()))
}

describe('DayWorkbench records', () => {
  beforeEach(() => { window.localStorage.clear(); seedPrototypeSession() })

  it('records a structured day skill only after the storyteller confirms it', async () => {
    const user = userEvent.setup()
    render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    await user.click(screen.getByRole('button', { name: '选择6号为发动者' }))
    await user.click(screen.getByRole('button', { name: '选择5号为目标' }))
    await user.selectOptions(screen.getByLabelText('公开声称'), 'investigator')
    await user.click(screen.getByRole('button', { name: '无事发生' }))
    expect(storedState().timeline.some((entry) => entry.kind === 'day_action')).toBe(false)

    await user.click(screen.getByRole('button', { name: '记录技能' }))
    await waitFor(() => {
      const state = storedState()
      const entry = state.timeline.find((item) => item.kind === 'day_action')
      expect(entry).toMatchObject({
        category: 'skill',
        actorSeatId: 6,
        targetSeatIds: [5],
        segmentId: 'day-3',
        skillContext: {
          abilityRole: { id: 'gambler' },
          actor: { seatId: 6, actualRole: { id: 'gambler' } },
          claimedRole: { id: 'investigator' },
          targets: [{ seatId: 5, actualRole: { id: 'snakecharmer' } }],
          outcome: { kind: 'no_effect' },
        },
      })
      expect(state.dayActionDraft).toBeNull()
    })
  })

  it('keeps an unconfirmed day skill form after leaving and reopening the day workbench', async () => {
    const user = userEvent.setup()
    const first = render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    await user.click(screen.getByRole('button', { name: '选择6号为发动者' }))
    await user.click(screen.getByRole('button', { name: '选择5号为目标' }))
    await user.selectOptions(screen.getByLabelText('公开声称'), 'investigator')
    await user.click(screen.getByRole('button', { name: '无事发生' }))

    await waitFor(() => {
      const state = storedState()
      expect(state.dayActionDraft).toMatchObject({
        category: 'skill',
        skill: {
          actorSeatId: 6,
          claimedRoleId: 'investigator',
          targetSeatIds: [5],
          outcomeKind: 'no_effect',
        },
      })
      expect(state.timeline.some((entry) => entry.kind === 'day_action')).toBe(false)
    })

    first.unmount()
    render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    expect(screen.getByRole('button', { name: '选择6号为发动者' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '选择5号为目标' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('公开声称')).toHaveValue('investigator')
    expect(screen.getByRole('button', { name: '无事发生' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: '清空草稿' }))
    await waitFor(() => {
      const state = storedState()
      expect(state.dayActionDraft).toBeNull()
      expect(state.timeline.some((entry) => entry.kind === 'day_action')).toBe(false)
    })
  })

  it('keeps an unconfirmed public event form after reopening the day workbench', async () => {
    const user = userEvent.setup()
    const first = render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    await user.click(screen.getByRole('tab', { name: '公开事件' }))
    await user.click(screen.getByRole('button', { name: '选择6号为涉及玩家' }))
    await user.type(screen.getByLabelText('公开内容'), '6号公开声明')

    await waitFor(() => expect(storedState().dayActionDraft).toMatchObject({
      category: 'public_event',
      publicEvent: { targetSeatIds: [6], note: '6号公开声明' },
    }))

    first.unmount()
    render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    expect(screen.getByRole('tab', { name: '公开事件' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: '选择6号为涉及玩家' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('公开内容')).toHaveValue('6号公开声明')

    await user.click(screen.getByRole('button', { name: '清空草稿' }))
    await waitFor(() => expect(storedState().dayActionDraft).toBeNull())
  })

  it('keeps the other unconfirmed day form after confirming one category', async () => {
    const user = userEvent.setup()
    render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    await user.click(screen.getByRole('button', { name: '选择6号为发动者' }))
    await user.click(screen.getByRole('tab', { name: '公开事件' }))
    await user.type(screen.getByLabelText('公开内容'), '6号公开声明')
    await user.click(screen.getByRole('button', { name: '记录事件' }))

    await waitFor(() => expect(storedState().dayActionDraft).toMatchObject({
      category: 'skill',
      skill: { actorSeatId: 6 },
      publicEvent: { targetSeatIds: [], note: '' },
    }))

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    expect(screen.getByRole('tab', { name: '技能' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: '选择6号为发动者' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('requires public content but allows an event without an actor', async () => {
    const user = userEvent.setup()
    render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    await user.click(screen.getByRole('tab', { name: '公开事件' }))
    expect(screen.getByRole('button', { name: '记录事件' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '选择6号为涉及玩家' }))
    await user.type(screen.getByLabelText('公开内容'), '6号公开声明')
    await user.click(screen.getByRole('button', { name: '记录事件' }))

    await waitFor(() => {
      const entry = storedState().timeline.find((item) => item.kind === 'day_action')
      expect(entry).toMatchObject({ category: 'public_event', actorSeatId: null, targetSeatIds: [6], summary: '公开事件：6号公开声明' })
    })
  })

  it('keeps an unrecorded vote round after leaving and reopening the day workbench', async () => {
    const user = userEvent.setup()
    const first = render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '选择1号为提名人' }))
    await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
    await user.click(screen.getByRole('button', { name: '选择4号为被提名人' }))
    await user.click(screen.getByRole('button', { name: '记录1号举手' }))

    await waitFor(() => expect(storedState().dayVoteDraft).toMatchObject({
      nominatorSeatId: 1,
      nomineeSeatId: 4,
      raisedSeatIds: [1],
    }))

    first.unmount()
    render(<DayWorkbenchHarness />)

    expect(screen.getByRole('tab', { name: '提名人 · 1号' })).toBeVisible()
    expect(screen.getByRole('tab', { name: '被提名人 · 4号' })).toBeVisible()
    expect(screen.getByLabelText('举手1票，死亡票0张，处决门槛6')).toBeVisible()
  })

  it('asks before closing a day that has an unconfirmed skill draft', async () => {
    const user = userEvent.setup()
    render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    await user.click(screen.getByRole('button', { name: '选择6号为发动者' }))
    await user.click(screen.getByRole('button', { name: '选择5号为目标' }))
    await user.click(screen.getByRole('button', { name: '无事发生' }))
    await user.click(screen.getByRole('button', { name: '记录技能' }))

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    await user.click(screen.getByRole('button', { name: '选择6号为发动者' }))
    await user.click(screen.getByRole('button', { name: '关闭白天记录' }))
    await user.click(screen.getByRole('button', { name: '结束今天' }))

    expect(screen.getByText('技能记录已暂存')).toBeVisible()
    expect(storedState().phaseSegments.find((segment) => segment.id === 'day-3')?.closedAt).toBeUndefined()

    await user.click(screen.getByRole('button', { name: '继续处理' }))
    expect(screen.queryByText('技能记录已暂存')).not.toBeInTheDocument()
    expect(storedState().dayActionDraft?.skill.actorSeatId).toBe(6)
  })

  it('asks before closing a day with an unrecorded vote and clears only after explicit confirmation', async () => {
    const user = userEvent.setup()
    render(<DayWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '记技能/事件' }))
    await user.click(screen.getByRole('button', { name: '选择6号为发动者' }))
    await user.click(screen.getByRole('button', { name: '选择5号为目标' }))
    await user.click(screen.getByRole('button', { name: '无事发生' }))
    await user.click(screen.getByRole('button', { name: '记录技能' }))
    await user.click(screen.getByRole('button', { name: '选择1号为提名人' }))
    await user.click(screen.getByRole('tab', { name: '被提名人 · 未选' }))
    await user.click(screen.getByRole('button', { name: '选择4号为被提名人' }))
    await user.click(screen.getByRole('button', { name: '记录1号举手' }))

    await user.click(screen.getByRole('button', { name: '结束今天' }))
    expect(screen.getByText('本轮票型已暂存')).toBeVisible()
    expect(screen.getByRole('button', { name: '继续处理' })).toBeVisible()
    expect(storedState().phaseSegments.find((segment) => segment.id === 'day-3')?.closedAt).toBeUndefined()

    await user.click(screen.getByRole('button', { name: '清空并结束' }))
    await waitFor(() => {
      const state = storedState()
      expect(state.phaseSegments.find((segment) => segment.id === 'day-3')?.closedAt).toBeTruthy()
      expect(state.dayVoteDraft).toBeNull()
      expect(state.timeline.some((entry) => entry.kind === 'vote_round')).toBe(false)
    })
  })
})

