/**
 * 魔典模式下的夜间工作台：目标选择搬到环上之后，抽屉里剩下什么。
 *
 * 这一组用例站在**整台工作台**上而不是单个组件上，因为要钉住的那条正是接线：
 * targetsOnRing 一路传到 CurrentWakeCard 再传到 NightTargetEcho，中间任何一段
 * 忘了透传，单个组件的用例都照样绿。
 */
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession, gameSessionStorageKey } from '../game-session/data/createPrototypeSession'
import { useGameSession } from '../game-session/state/useGameSession'
import { NightWorkbench } from './NightWorkbench'
import type { GameSessionState } from '../game-session/types'

function Harness({ targetsOnRing }: { targetsOnRing: boolean }) {
  const { session, dispatch } = useGameSession()
  const sessionBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])
  return (
    <NightWorkbench
      sessionBinding={sessionBinding}
      targetsOnRing={targetsOnRing}
      carouselElsewhere={targetsOnRing}
      onExit={() => undefined}
    />
  )
}

function storedSession(): GameSessionState {
  return JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
}

function storedTargets(): readonly number[] {
  const session = storedSession()
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  return run?.drafts[run.previewEntryId]?.targets ?? []
}

function nightActionCount(): number {
  return storedSession().timeline.filter((entry) => entry.kind === 'night_action').length
}

describe('魔典模式下的目标区', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(createPrototypeGameSession()))
  })

  it('纯记录模式仍然是那张摊开的 6 列号码网格，一个字没改', () => {
    render(<Harness targetsOnRing={false} />)

    // 摊开 = 不在任何 details 里。魔典那条路才折叠。
    const grid = screen.getByRole('button', { name: '选择3号玩家' })
    expect(grid.closest('details')).toBeNull()
    expect(screen.queryByText(/点环上的座位选/)).toBeNull()
  })

  it('魔典模式下网格折进 details，抽屉里只剩一行回显', () => {
    render(<Harness targetsOnRing />)

    const fallback = screen.getByRole('button', { name: '选择3号玩家' }).closest('details')
    expect(fallback).not.toBeNull()
    expect(fallback?.hasAttribute('open')).toBe(false)
    expect(screen.getByText(/点环上的座位选玩家/)).toBeTruthy()
  })

  it('折叠的号码网格仍然真的能写：它是无障碍通道，不是摆设', async () => {
    const user = userEvent.setup()
    render(<Harness targetsOnRing />)
    // 前置：还没选过。
    expect(storedTargets()).toEqual([])

    await user.click(screen.getByRole('button', { name: '选择3号玩家' }))

    expect(storedTargets()).toEqual([3])
    expect(screen.getByText('已选：3号')).toBeTruthy()
  })

  it('回显上的 ✕ 取消掉的是同一份草稿', async () => {
    const user = userEvent.setup()
    render(<Harness targetsOnRing />)
    await user.click(screen.getByRole('button', { name: '选择3号玩家' }))
    expect(storedTargets()).toEqual([3])

    await user.click(screen.getByRole('button', { name: '取消选择3号' }))

    expect(storedTargets()).toEqual([])
  })

  it('选目标只写草稿，不新增任何确认记录——落账仍在底栏', async () => {
    const user = userEvent.setup()
    render(<Harness targetsOnRing />)
    // 夹具本来就带 3 条已确认记录，所以比的是**增量**而不是绝对值。
    const before = nightActionCount()
    expect(before).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: '选择3号玩家' }))

    expect(storedTargets()).toEqual([3])
    expect(nightActionCount()).toBe(before)
    // 而底栏那条「确认后：停留 ⇄ 下一位」还在：落账的入口一处都没搬走。
    expect(within(screen.getByLabelText('确认本项')).getAllByRole('button', { name: /确认/ }).length)
      .toBeGreaterThan(0)
  })
})
