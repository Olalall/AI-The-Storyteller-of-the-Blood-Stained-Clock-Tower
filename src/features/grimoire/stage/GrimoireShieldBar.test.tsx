import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GrimoireShieldBar } from './GrimoireShieldBar'
import type { GrimoireShield } from '../shield/useGrimoireShield'
import type { ShieldLevel } from '../shield/shieldLevel'

function shieldAt(level: ShieldLevel): GrimoireShield & { spies: Record<string, ReturnType<typeof vi.fn>> } {
  const spies = {
    coverNow: vi.fn(),
    uncover: vi.fn(),
    beginReveal: vi.fn(),
    cancelReveal: vi.fn(),
    conceal: vi.fn(),
    noteActivity: vi.fn(),
  }
  return { level, revealProgress: 0, holding: false, ...spies, spies }
}

describe('GrimoireShieldBar', () => {
  it('never reveals on a single click — the reveal key only starts a hold', async () => {
    // 单击即揭示会让一次误触在满桌人面前掀开整局。600ms 的门槛由 useGrimoireShield 守，
    // 这一条守的是「这颗键根本没有一条一击到底的路径」。
    const shield = shieldAt('L1')
    render(<GrimoireShieldBar shield={shield} />)

    await userEvent.click(screen.getByRole('button', { name: '按住 600 毫秒揭示角色' }))

    expect(shield.spies.beginReveal).toHaveBeenCalled()
    // 松手（click 含 pointerup）必须撤销计时，否则手离开之后它还会自己掀开。
    expect(shield.spies.cancelReveal).toHaveBeenCalled()
  })

  it('offers exactly one big single-tap key to come back from a full cover', async () => {
    // 恢复只认单指点大按钮：慌乱中同一个双指手势不能既盖上又掀开。
    const shield = shieldAt('L0')
    render(<GrimoireShieldBar shield={shield} />)

    expect(screen.queryByRole('button', { name: '按住 600 毫秒揭示角色' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /恢复魔典/ }))
    expect(shield.spies.uncover).toHaveBeenCalledOnce()
  })

  it('keeps an immediate full cover reachable while the grimoire is open', async () => {
    const shield = shieldAt('L2')
    render(<GrimoireShieldBar shield={shield} />)

    await userEvent.click(screen.getByRole('button', { name: /全遮蔽/ }))
    expect(shield.spies.coverNow).toHaveBeenCalledOnce()
    // 「收起角色」回 L1，「全遮蔽」到 L0：两颗键的落点不同，合成一颗就少了一档。
    await userEvent.click(screen.getByRole('button', { name: /收起角色/ }))
    expect(shield.spies.conceal).toHaveBeenCalledOnce()
  })

  it('says which level the grimoire is at, because the ring alone does not', () => {
    render(<GrimoireShieldBar shield={shieldAt('L2')} />)
    expect(screen.getByText('魔典已揭示')).toBeVisible()
  })
})
