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

describe('NightWorkbench', () => {
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
  it('opens the night order on the current game by default', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: /夜间顺序/ }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '夜间顺序' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '本局' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/本局 · 10项/)).toBeInTheDocument()
  })

  it('shows the official order read-only without moving the game cursor', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: /夜间顺序/ }))
    await user.click(screen.getByRole('tab', { name: '官方' }))

    expect(screen.getByText(/官方 · 其他夜 · 99项/)).toBeInTheDocument()
    expect(screen.getByText('Duchess')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /预览夜序第1项/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '关闭夜间顺序' }))
    await user.click(screen.getByRole('button', { name: /夜间顺序/ }))
    expect(screen.getByRole('tab', { name: '本局' })).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps every confirmed queue item backed by an immutable record snapshot', async () => {
    render(<NightWorkbenchHarness />)

    await waitFor(() => expect(window.localStorage.getItem(gameSessionStorageKey)).not.toBeNull())
    const state = storedState()
    const confirmedItems = state.queue.filter((item: { progress: string }) => item.progress === 'confirmed')

    expect(confirmedItems.length).toBeGreaterThan(0)
    for (const item of confirmedItems) {
      expect(state.confirmedRecords[item.id]?.length).toBeGreaterThan(0)
    }
  })

  it('previews the next role without moving the authoritative cursor', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '预览下一位' }))

    expect(screen.getByText('正在预览')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '夜间角色预览' })).toHaveTextContent('洗脑师')
    expect(screen.queryByRole('button', { name: '确认本项' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '确认并下一位' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '退出预览，回到正在处理的10号 洗脑师；夜间处理位置不变' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '将夜间处理位置切换到11号 麻脸巫婆；不确认或保存记录' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: '退出预览，回到正在处理的10号 洗脑师；夜间处理位置不变' }))
    expect(screen.queryByText('正在预览')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认本项' })).toBeInTheDocument()
  })

  it('uses the default next destination after confirmation', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await completeCurrentDraft(user)
    expect(screen.getByRole('button', { name: '确认并下一位' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: '确认并下一位' }))

    expect(screen.getByRole('region', { name: '夜间角色预览' })).toHaveTextContent('麻脸巫婆')
    expect(screen.getByText(/当前进入11号 · 玩家11/)).toBeInTheDocument()
    await waitFor(() => {
      const latest = storedState().confirmedRecords['night-3-cerenovus'].at(-1)
      expect(latest.snapshot.outputSource).toEqual({ kind: 'preset', templateId: 'applied', specVersion: 'click-flow-1' })
    })
  })

  it('can confirm and stay without creating a second completion action', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await completeCurrentDraft(user)
    await user.click(screen.getByRole('button', { name: '确认本项' }))

    expect(screen.getByRole('region', { name: '夜间角色预览' })).toHaveTextContent('洗脑师')
    expect(screen.getByRole('button', { name: /进入下一位/ })).toBeEnabled()
    await waitFor(() => expect(storedState().confirmedRecords['night-3-cerenovus']).toHaveLength(1))
  })

  it('generates the record from clicks and invalidates it when a selection changes', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await completeCurrentDraft(user)
    expect(screen.getByText('明天请疯狂地声称自己是调查员。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '受到影响' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('region', { name: '确认前预览' })).toHaveTextContent(/确认后写入.*不自动改身份、阵营、死亡、毒醉。/s)
    expect(screen.getByRole('button', { name: '确认本项' })).toBeEnabled()
    await waitFor(() => {
      const draft = storedState().drafts['night-3-cerenovus']
      expect(draft.playerChoice).toBe('选择3号 · 声称角色：调查员')
      expect(draft.storytellerResult).toBe('10号洗脑师选择3号成为调查员，目标受到影响。')
    })

    await user.click(screen.getByRole('button', { name: '选择4号玩家' }))
    expect(screen.getByRole('button', { name: '确认本项' })).toBeEnabled()
    await waitFor(() => expect(storedState().drafts['night-3-cerenovus'].storytellerResult).toBe('10号洗脑师选择4号成为调查员，目标受到影响。'))
  })

  it('locks a confirmed record and only allows an appended correction', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)
    await completeCurrentDraft(user)
    await user.click(screen.getByRole('button', { name: '确认本项' }))

    expect(screen.getByRole('button', { name: '受到影响' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /追加更正/ }))
    expect(screen.getByRole('button', { name: '确认更正' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: '选择4号玩家' }))
    await user.click(screen.getByRole('button', { name: '未受影响' }))
    await user.click(screen.getByRole('button', { name: '确认更正' }))

    expect(screen.getByText(/更正记录已追加/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '未受影响' })).toBeDisabled()
    await waitFor(() => {
      const records = storedState().confirmedRecords['night-3-cerenovus']
      expect(records).toHaveLength(2)
      expect(records[1].correctionOf).toBe(records[0].id)
      expect(records[1].snapshot.storytellerResult).toBe('10号洗脑师选择4号成为调查员，目标未受影响。')
    })
  })

  it('cancels a correction without changing the confirmed record', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)
    await completeCurrentDraft(user)
    await user.click(screen.getByRole('button', { name: '确认本项' }))
    await user.click(screen.getByRole('button', { name: /追加更正/ }))
    await user.click(screen.getByRole('button', { name: '选择4号玩家' }))

    await user.click(screen.getByRole('button', { name: '暂不更正' }))

    expect(screen.getByText(/原记录未变化/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '受到影响' })).toBeDisabled()
    await waitFor(() => {
      const state = storedState()
      expect(state.confirmedRecords['night-3-cerenovus']).toHaveLength(1)
      expect(state.drafts['night-3-cerenovus'].targets).toEqual([3])
      expect(state.correctionItemId).toBeNull()
      expect(state.queue.find((item: { id: string }) => item.id === 'night-3-cerenovus').progress).toBe('confirmed')
    })
  })

  it('defers without moving and can explicitly restore the deferred item', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '稍后处理' }))
    expect(screen.getByRole('region', { name: '夜间角色预览' })).toHaveTextContent('洗脑师')
    expect(screen.getByText(/夜间光标未移动/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /进入下一位/ }))
    expect(screen.getByRole('region', { name: '夜间角色预览' })).toHaveTextContent('麻脸巫婆')

    await user.click(screen.getByRole('button', { name: /夜间顺序/ }))
    await user.click(screen.getByRole('button', { name: '预览夜序第4项：10号洗脑师' }))
    await user.click(screen.getByRole('button', { name: '将夜间处理位置切换到10号 洗脑师；不确认或保存记录' }))
    expect(screen.getByRole('region', { name: '夜间角色预览' })).toHaveTextContent('洗脑师')
    expect(screen.getByRole('button', { name: '恢复处理' })).toBeEnabled()
    expect(storedState().queue.find((item: { id: string }) => item.id === 'night-3-cerenovus').progress).toBe('deferred')

    await user.click(screen.getByRole('button', { name: '恢复处理' }))
    expect(storedState().queue.find((item: { id: string }) => item.id === 'night-3-cerenovus').progress).toBe('pending')
  })
})
