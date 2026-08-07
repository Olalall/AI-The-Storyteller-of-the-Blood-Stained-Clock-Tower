import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession, gameSessionStorageKey } from '../game-session/data/createPrototypeSession'
import { projectNightConfirmedRecords } from '../game-session/state/projectors'
import { useGameSession } from '../game-session/state/useGameSession'
import type { GameSessionState } from '../game-session/types'
import { NightWorkbench } from './NightWorkbench'


/**
 * 默认落地已改为空对局（首次打开显示入口界面），而这些用例测的是工作台本身，
 * 需要一局进行中的对局做夹具，所以显式播种。
 */
function seedPrototypeSession() {
  window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(createPrototypeGameSession()))
}

describe('NightWorkbench 的 AI 与遮蔽', () => {
  beforeEach(() => { window.localStorage.clear(); seedPrototypeSession() })

  function NightWorkbenchHarness() {
    const { session, dispatch } = useGameSession()
    const sessionBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])
    return <NightWorkbench sessionBinding={sessionBinding} onExit={() => undefined} />
  }

  function storedState() {
    const session = storedSession()
    const activeNightRunId = session.activeNightRunId
    const run = activeNightRunId ? session.nightRuns[activeNightRunId] : undefined
    return {
      ...run,
      confirmedRecords: activeNightRunId ? projectNightConfirmedRecords(session, activeNightRunId) : {},
      roleChangeEvents: session.timeline.filter((entry) => entry.kind === 'setup_changed'),
    } as any
  }

  function storedSession() {
    return JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
  }

  async function completeCurrentDraft(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: '选择3号玩家' }))
    await user.click(screen.getByRole('button', { name: '调查员' }))
  }

  async function prepareCurrentAI(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: '选择3号玩家' }))
    await user.click(screen.getByRole('button', { name: '调查员' }))
  }
  it('applies an AI suggestion to the draft but keeps confirmation manual', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)
    await prepareCurrentAI(user)
    await user.click(screen.getByRole('button', { name: 'AI推荐' }))
    await waitFor(() => expect(screen.getAllByText('AI草稿').length).toBeGreaterThan(0))
    expect(screen.getByText('已采用到草稿。')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'AI推荐' })).not.toBeInTheDocument()
    expect(screen.getAllByText('AI建议').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: '受到影响，AI建议' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('明天请疯狂地声称自己是调查员。').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: '确认本项' })).toBeEnabled()
    await waitFor(() => {
      const state = storedState()
      expect(state.confirmedRecords['night-3-cerenovus']).toBeUndefined()
      expect(state.activeCursorId).toBe('night-3-cerenovus')
      expect(Object.keys(state.aiAdviceLog)).toHaveLength(1)
    })

    await user.click(screen.getByRole('button', { name: '确认本项' }))
    await waitFor(() => {
      const source = storedState().confirmedRecords['night-3-cerenovus'].at(-1).snapshot.outputSource
      expect(source.kind).toBe('ai')
      expect(source.adviceId).toContain('night-3-cerenovus-ai-')
      expect(source.knowledgeVersion).toBe('catfishing-11.1.1+nightsheet-99a2815b')
    })
  })

  it('keeps missing AI inputs visible on the current card until the draft changes', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)
    await user.click(screen.getByRole('button', { name: 'AI推荐' }))
    expect(await screen.findByText('AI缺少')).toBeInTheDocument()
    expect(screen.getAllByText(/缺少玩家、缺少声称角色/)).toHaveLength(2)
    expect(screen.getByText('补齐后可重新推荐')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '受到影响，AI建议' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认本项' })).toBeDisabled()
    await waitFor(() => expect(Object.keys(storedState().aiAdviceLog)).toHaveLength(1))
    expect(storedState().confirmedRecords['night-3-cerenovus']).toBeUndefined()
    await user.click(screen.getByRole('button', { name: '选择3号玩家' }))
    expect(screen.queryByText('AI缺少')).not.toBeInTheDocument()
  })

  it('marks an AI result when the storyteller overrides it', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)
    await prepareCurrentAI(user)
    await user.click(screen.getByRole('button', { name: 'AI推荐' }))
    await waitFor(() => expect(screen.getAllByText('AI建议').length).toBeGreaterThan(0))

    await user.click(screen.getByRole('button', { name: '未受影响' }))

    expect(screen.getByText('已改为手动结果')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AI推荐' })).toBeEnabled()
  })

  it('conceals role, draft, history and AI content together', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)
    await prepareCurrentAI(user)
    await user.click(screen.getByRole('button', { name: 'AI推荐' }))
    await waitFor(() => expect(screen.getAllByText('AI建议').length).toBeGreaterThan(0))

    await user.click(screen.getByRole('button', { name: '展示信息' }))
    await user.click(screen.getByRole('button', { name: '收起并遮蔽' }))
    expect(screen.getByText('已遮蔽')).toBeInTheDocument()
    expect(screen.queryByText('存活')).not.toBeInTheDocument()
    expect(screen.queryByText('10号洗脑师选择3号成为调查员，目标受到影响。')).not.toBeInTheDocument()
    expect(screen.queryAllByText('AI建议')).toHaveLength(0)
    expect(screen.queryByText('洗脑师', { exact: true })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '本局记录，共3条' }))
    expect(screen.getByText('记录已遮蔽')).toBeInTheDocument()
    expect(screen.queryByText('5号舞蛇人选择2号，没有发生交换。')).not.toBeInTheDocument()
  })

  it('focuses only the prepared player information and keeps the workspace shielded afterwards', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)
    await completeCurrentDraft(user)
    const before = storedState()
    const sessionBefore = JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState

    await user.click(screen.getByRole('button', { name: '展示信息' }))
    const reveal = screen.getByRole('dialog', { name: '请查看信息' })
    expect(reveal).toHaveTextContent('明天请疯狂地声称自己是调查员。')
    expect(reveal).not.toHaveTextContent('洗脑师')
    expect(reveal).not.toHaveTextContent('10号')
    expect(reveal).not.toHaveTextContent('AI建议')

    await user.click(screen.getByRole('button', { name: '收起并遮蔽' }))
    expect(screen.queryByRole('dialog', { name: '请查看信息' })).not.toBeInTheDocument()
    expect(screen.getByText('已遮蔽')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '解除遮蔽' })).toBeVisible()
    await waitFor(() => {
      const after = storedState()
      expect(after.activeCursorId).toBe(before.activeCursorId)
      expect(after.drafts['night-3-cerenovus']).toEqual(before.drafts['night-3-cerenovus'])
      expect(after.confirmedRecords).toEqual(before.confirmedRecords)
      const session = JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
      expect(session.timeline).toEqual(sessionBefore.timeline)
      expect(JSON.stringify(session)).not.toContain('privateInformation')
    })
  })
})
