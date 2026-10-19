import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { ScriptLibrarySheet } from './ScriptLibrarySheet'

describe('ScriptLibrarySheet', () => {
  it('allows choosing a board before setup is confirmed', () => {
    const onSelectScript = vi.fn()
    render(
      <ScriptLibrarySheet
        open
        onOpenChange={() => undefined}
        session={createEmptyGameSession('2026-09-02T00:00:00.000Z')}
        onSelectScript={onSelectScript}
        onRequestResetSwitch={() => undefined}
      />,
    )

    const card = screen.getByRole('heading', { name: '暗度陈仓' }).closest('article')
    expect(card).not.toBeNull()
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: '切换到此板子' }))
    expect(onSelectScript).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '确认切换' }))
    expect(onSelectScript).toHaveBeenCalledWith('an-du-chen-cang')
  })

  it('routes a confirmed setup through reset confirmation without changing it in place', () => {
    const onRequestResetSwitch = vi.fn()
    const onSelectScript = vi.fn()
    render(
      <ScriptLibrarySheet
        open
        onOpenChange={() => undefined}
        session={createPrototypeGameSession()}
        onSelectScript={onSelectScript}
        onRequestResetSwitch={onRequestResetSwitch}
      />,
    )

    const card = screen.getByRole('heading', { name: '暗度陈仓' }).closest('article')
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: '切换到此板子' }))
    expect(screen.getByText('当前配板已经确认')).toBeInTheDocument()
    expect(onRequestResetSwitch).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '前往重置确认' }))
    expect(onRequestResetSwitch).toHaveBeenCalledExactlyOnceWith('an-du-chen-cang')
    expect(onSelectScript).not.toHaveBeenCalled()
    expect(screen.getByText('当前使用')).toBeInTheDocument()
  })

  it('cancels a confirmed board switch without requesting either a reset or a direct change', () => {
    const onRequestResetSwitch = vi.fn()
    const onSelectScript = vi.fn()
    const session = createPrototypeGameSession()
    const snapshot = JSON.stringify(session)
    render(<ScriptLibrarySheet open onOpenChange={() => undefined} session={session} onSelectScript={onSelectScript} onRequestResetSwitch={onRequestResetSwitch} />)

    const card = screen.getByRole('heading', { name: '暗度陈仓' }).closest('article')
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: '切换到此板子' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: '确认切换板子' })).getByRole('button', { name: '取消' }))

    expect(screen.queryByRole('dialog', { name: '确认切换板子' })).not.toBeInTheDocument()
    expect(onRequestResetSwitch).not.toHaveBeenCalled()
    expect(onSelectScript).not.toHaveBeenCalled()
    expect(JSON.stringify(session)).toBe(snapshot)
    expect(screen.getByText('当前使用')).toBeInTheDocument()
  })
})
