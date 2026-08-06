import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../game-session/types'
import { HostingModeSection } from './HostingModeSection'

function sessionIn(mode: GameSessionState['hostingMode']): GameSessionState {
  const base = createPrototypeGameSession()
  return {
    ...base,
    hostingMode: mode,
    phaseSegments: [{ id: 'n1', kind: 'night', sequence: 1, label: '第1夜', createdAt: '2026-01-01T20:00:00.000Z' }],
  }
}

describe('HostingModeSection', () => {
  it('upgrades to grimoire immediately, with no confirmation in the way', async () => {
    const dispatch = vi.fn()
    render(<HostingModeSection session={sessionIn('record')} dispatch={dispatch} />)

    await userEvent.click(screen.getByRole('radio', { name: /没有实体魔典/ }))

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'set-hosting-mode',
      mode: 'grimoire',
      phaseLabel: '第1夜',
    }))
  })

  it('never downgrades on the first click — the handoff card comes first', async () => {
    // 少了这一步，说书人切回纯记录之后仍以为工具在替他记状态，
    // 于是既没在实体魔典上补也没在工具里点，两边都空。
    const dispatch = vi.fn()
    render(<HostingModeSection session={sessionIn('grimoire')} dispatch={dispatch} />)

    await userEvent.click(screen.getByRole('radio', { name: /桌上有实体魔典/ }))

    expect(dispatch).not.toHaveBeenCalled()
    expect(screen.getByText('切回纯记录 · 状态由你和实体魔典负责')).toBeVisible()
  })

  it('keeps 留在魔典模式 truly non-destructive', async () => {
    const dispatch = vi.fn()
    render(<HostingModeSection session={sessionIn('grimoire')} dispatch={dispatch} />)

    await userEvent.click(screen.getByRole('radio', { name: /桌上有实体魔典/ }))
    await userEvent.click(screen.getByRole('button', { name: '留在魔典模式' }))

    expect(dispatch).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: /没有实体魔典/ })).toHaveAttribute('aria-checked', 'true')
  })

  it('commits the downgrade only after the storyteller says the list is copied', async () => {
    const dispatch = vi.fn()
    const onSwitched = vi.fn()
    render(<HostingModeSection session={sessionIn('grimoire')} dispatch={dispatch} onSwitched={onSwitched} />)

    await userEvent.click(screen.getByRole('radio', { name: /桌上有实体魔典/ }))
    await userEvent.click(screen.getByRole('button', { name: '已抄好，切回纯记录' }))

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'set-hosting-mode', mode: 'record' }))
    expect(onSwitched).toHaveBeenCalledWith('record')
  })

  it('does nothing at all when the current mode is picked again', async () => {
    // 重复写一次会往 hostingModeHistory 里追一条没发生过的变更，归档回放就多一次假切换。
    const dispatch = vi.fn()
    render(<HostingModeSection session={sessionIn('grimoire')} dispatch={dispatch} />)

    await userEvent.click(screen.getByRole('radio', { name: /没有实体魔典/ }))

    expect(dispatch).not.toHaveBeenCalled()
  })
})
