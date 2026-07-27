import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { gameSessionStorageKey } from '../game-session/data/createPrototypeSession'
import { projectNightConfirmedRecords } from '../game-session/state/projectors'
import { useGameSession } from '../game-session/state/useGameSession'
import type { GameSessionState } from '../game-session/types'
import { NightWorkbench } from './NightWorkbench'

describe('NightWorkbench records and role changes', () => {
  beforeEach(() => window.localStorage.clear())

  function NightWorkbenchHarness() {
    const { session, dispatch } = useGameSession()
    const sessionBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])
    return <NightWorkbench sessionBinding={sessionBinding} onExit={() => undefined} />
  }

  function storedState() {
    const session = JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
    const activeNightRunId = session.activeNightRunId
    const run = activeNightRunId ? session.nightRuns[activeNightRunId] : undefined
    return {
      ...run,
      confirmedRecords: activeNightRunId ? projectNightConfirmedRecords(session, activeNightRunId) : {},
      roleChangeEvents: session.timeline.filter((entry) => entry.kind === 'setup_changed'),
    } as any
  }

  it('opens a read-only projection of confirmed game records', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '本局记录，共3条' }))

    expect(screen.getByRole('heading', { name: '本局记录' })).toBeInTheDocument()
    expect(screen.getByText('5号舞蛇人选择2号，没有发生交换。')).toBeInTheDocument()
    expect(screen.getByText('6号赌徒猜测9号是疯子：正确。')).toBeInTheDocument()
    expect(screen.getByText('7号哲学家本夜不发动能力。')).toBeInTheDocument()
  })

  it('changes a role only after explicit confirmation and appends a record', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '更换角色' }))
    expect(screen.getByRole('heading', { name: '更换10号角色' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '确认更换' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '麻脸巫婆' }))
    await user.click(screen.getByRole('button', { name: '取消' }))
    await waitFor(() => expect(storedState().roleChangeEvents).toHaveLength(0))

    await user.click(screen.getByRole('button', { name: '更换角色' }))
    await user.click(screen.getByRole('button', { name: '麻脸巫婆' }))
    expect(screen.getByText('仅记录 · 不发送 · 夜序不自动调整')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '确认改为麻脸巫婆' }))

    expect(screen.getByText('已变更 · 原洗脑师')).toBeInTheDocument()
    expect(screen.getByText('本夜仍按洗脑师')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '本局记录，共4条' })).toBeInTheDocument()
    await waitFor(() => {
      const state = storedState()
      expect(state.queue.find((item: { id: string }) => item.id === 'night-3-cerenovus').roleId).toBe('cerenovus')
      expect(state.roleChangeEvents).toHaveLength(1)
      expect(state.roleChangeEvents[0].fromRole.id).toBe('cerenovus')
      expect(state.roleChangeEvents[0].toRole.id).toBe('pithag')
    })

    await user.click(screen.getByRole('button', { name: '本局记录，共4条' }))
    expect(screen.getByText('10号角色：洗脑师 → 麻脸巫婆')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /10号角色：洗脑师 → 麻脸巫婆/ }))
    expect(screen.getByText('当前夜序快照未自动重排')).toBeInTheDocument()
  })

  it('lets the storyteller clear an accidental draft before changing role', async () => {
    const user = userEvent.setup()
    render(<NightWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '选择3号玩家' }))

    expect(screen.getByRole('button', { name: '更换角色' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '清空重选' })).toBeEnabled()
    expect(storedState().roleChangeEvents).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: '清空重选' }))

    expect(screen.getByRole('button', { name: '更换角色' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: '清空重选' })).not.toBeInTheDocument()
    await waitFor(() => {
      const state = storedState()
      expect(state.drafts['night-3-cerenovus']).toBeUndefined()
      expect(state.queue.find((item: { id: string }) => item.id === 'night-3-cerenovus').progress).toBe('pending')
    })
  })

  it('does not leak a role-change marker after concealment', async () => {
    const user = userEvent.setup()
    const { container } = render(<NightWorkbenchHarness />)

    await user.click(screen.getByRole('button', { name: '更换角色' }))
    await user.click(screen.getByRole('button', { name: '麻脸巫婆' }))
    await user.click(screen.getByRole('button', { name: '确认改为麻脸巫婆' }))
    expect(container.querySelector('.role-disc__change-mark')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '选择3号玩家' }))
    await user.click(screen.getByRole('button', { name: '调查员' }))
    await user.click(screen.getByRole('button', { name: '展示信息' }))
    await user.click(screen.getByRole('button', { name: '收起并遮蔽' }))

    expect(container.querySelector('.role-disc__change-mark')).not.toBeInTheDocument()
    expect(screen.queryByText('已变更 · 原洗脑师')).not.toBeInTheDocument()
    expect(screen.queryByText('本夜仍按洗脑师')).not.toBeInTheDocument()
  })
})
