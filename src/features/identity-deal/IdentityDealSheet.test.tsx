import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { identityDealReceiptsStorageKey } from '../../services/identity-deal'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { IdentityDealSheet } from './IdentityDealSheet'
import { gameSessionReducer } from '../game-session/state/sessionReducer'

function renderIdentityDealSheet() {
  const session = gameSessionReducer(createPrototypeGameSession(), { type: 'confirm-identity-presentation', seatId: 1, actualRoleId: 'drunk', shownRoleId: 'investigator', confirmedAt: '2026-10-15T00:00:00.000Z' })
  render(<IdentityDealSheet open onOpenChange={() => undefined} session={session} />)
  return { session }
}

describe('IdentityDealSheet', () => {
  beforeEach(() => window.localStorage.clear())

  it.each(['已领取', '返回遮蔽'])('keeps all other identities hidden after the player chooses %s', (exit) => {
    const { session } = renderIdentityDealSheet()
    fireEvent.click(screen.getByRole('button', { name: '打开单人展示' }))
    fireEvent.click(screen.getByRole('button', { name: '显示身份' }))
    expect(document.querySelector('.identity-deal__seat-grid')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭发身份' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: exit }))
    const handoff = screen.getByRole('dialog', { name: '请交还设备给说书人' })
    expect(within(handoff).queryByText('调查员')).not.toBeInTheDocument()
    expect(document.querySelector('.identity-deal__seat-grid')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭发身份' })).not.toBeInTheDocument()
    fireEvent.click(within(handoff).getByRole('button', { name: '说书人继续发身份' }))
    expect(screen.getByRole('button', { name: /1号 酒鬼/ })).toBeInTheDocument()
    if (exit === '已领取') expect(window.localStorage.getItem(identityDealReceiptsStorageKey(session.id))).toContain('"1"')
  })

  it('Escape shields the identity instead of closing the host sheet', async () => {
    const onOpenChange = vi.fn()
    const session = gameSessionReducer(createPrototypeGameSession(), { type: 'confirm-identity-presentation', seatId: 1, actualRoleId: 'drunk', shownRoleId: 'investigator', confirmedAt: '2026-10-15T00:00:00.000Z' })
    const user = userEvent.setup()
    render(<IdentityDealSheet open onOpenChange={onOpenChange} session={session} />)
    await user.click(screen.getByRole('button', { name: '打开单人展示' }))
    await user.click(screen.getByRole('button', { name: '显示身份' }))
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog', { name: '请交还设备给说书人' })).toBeInTheDocument()
    expect(document.querySelector('.identity-deal__seat-grid')).not.toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog', { name: '请交还设备给说书人' })).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('shows only one seat identity inside the spotlight and returns to a shielded state', () => {
    renderIdentityDealSheet()

    fireEvent.click(screen.getByRole('button', { name: '打开单人展示' }))
    const spotlight = screen.getByLabelText('1号单人身份展示')
    expect(screen.queryByRole('button', { name: '1号 酒鬼 未领取' })).not.toBeInTheDocument()
    expect(document.querySelector('.identity-deal')).not.toBeInTheDocument()
    expect(within(spotlight).getByText('身份已遮住')).toBeInTheDocument()
    expect(within(spotlight).queryByText('调查员')).not.toBeInTheDocument()

    fireEvent.click(within(spotlight).getByRole('button', { name: '显示身份' }))
    expect(within(spotlight).getByText('调查员')).toBeInTheDocument()
    expect(within(spotlight).queryByText('气球驾驶员')).not.toBeInTheDocument()

    fireEvent.click(within(spotlight).getByRole('button', { name: '返回遮蔽' }))
    fireEvent.click(screen.getByRole('button', { name: '说书人继续发身份' }))
    fireEvent.click(screen.getByRole('button', { name: '打开单人展示' }))
    expect(within(screen.getByLabelText('1号单人身份展示')).getByText('身份已遮住')).toBeInTheDocument()
  })

  it('tracks physical-card receipts without showing role names in card mode', () => {
    const { session } = renderIdentityDealSheet()

    fireEvent.click(screen.getByRole('button', { name: '实体抽牌' }))
    expect(screen.queryByText('调查员')).not.toBeInTheDocument()
    expect(screen.queryByText('气球驾驶员')).not.toBeInTheDocument()
    expect(screen.getByText('只记录领取进度')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '标记已领取' }))
    expect(window.localStorage.getItem(identityDealReceiptsStorageKey(session.id))).toContain('"1"')
    expect(screen.getByText('1/12')).toBeInTheDocument()
  })
})
