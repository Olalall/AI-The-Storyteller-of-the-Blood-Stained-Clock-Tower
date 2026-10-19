import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
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

  it('shows only one seat identity inside the spotlight and returns to a shielded state', () => {
    renderIdentityDealSheet()

    fireEvent.click(screen.getByRole('button', { name: '打开单人展示' }))
    const spotlight = screen.getByLabelText('1号单人身份展示')
    expect(screen.queryByRole('button', { name: '1号 酒鬼 未领取' })).not.toBeInTheDocument()
    expect(document.querySelector('.identity-deal')).toHaveAttribute('inert')
    expect(within(spotlight).getByText('身份已遮住')).toBeInTheDocument()
    expect(within(spotlight).queryByText('调查员')).not.toBeInTheDocument()

    fireEvent.click(within(spotlight).getByRole('button', { name: '显示身份' }))
    expect(within(spotlight).getByText('调查员')).toBeInTheDocument()
    expect(within(spotlight).queryByText('气球驾驶员')).not.toBeInTheDocument()

    fireEvent.click(within(spotlight).getByRole('button', { name: '返回遮蔽' }))
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
