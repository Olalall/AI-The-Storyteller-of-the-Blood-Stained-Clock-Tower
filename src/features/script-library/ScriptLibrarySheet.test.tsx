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

  it('routes a confirmed setup through save and reset instead of changing it in place', () => {
    const onRequestResetSwitch = vi.fn()
    render(
      <ScriptLibrarySheet
        open
        onOpenChange={() => undefined}
        session={createPrototypeGameSession()}
        onSelectScript={() => undefined}
        onRequestResetSwitch={onRequestResetSwitch}
      />,
    )

    const card = screen.getByRole('heading', { name: '暗度陈仓' }).closest('article')
    fireEvent.click(within(card as HTMLElement).getByRole('button', { name: '切换到此板子' }))
    expect(screen.getByText('当前配板已经确认')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '前往保存并重置' }))
    expect(onRequestResetSwitch).toHaveBeenCalledWith('an-du-chen-cang')
    expect(screen.getByText('当前使用')).toBeInTheDocument()
  })
})
