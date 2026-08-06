import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CompletenessBar } from './CompletenessBar'
import type { GrimoireCompleteness } from './grimoireCompleteness'

const BASE: GrimoireCompleteness = {
  seatsWithRole: 12,
  totalSeats: 12,
  stateChangeCount: 0,
  markerCount: 0,
  pendingStateHints: 0,
  pendingSince: null,
}

const FULL: GrimoireCompleteness = { ...BASE, stateChangeCount: 4, markerCount: 1 }
const DEALT_ON_TABLE: GrimoireCompleteness = { ...BASE, seatsWithRole: 0, stateChangeCount: 3 }
const SWITCHED_MID_GAME: GrimoireCompleteness = { ...BASE, pendingStateHints: 9, pendingSince: '第1夜' }

function handlers() {
  return { onOpenSetup: vi.fn(), onReview: vi.fn(), onDefer: vi.fn(), onSilence: vi.fn() }
}

describe('CompletenessBar', () => {
  it('sends a session that was dealt on the table to setup, not to state entry', async () => {
    const spies = handlers()
    render(<CompletenessBar completeness={DEALT_ON_TABLE} {...spies} />)

    await userEvent.click(screen.getByRole('button'))

    expect(spies.onOpenSetup).toHaveBeenCalledOnce()
    expect(spies.onReview).not.toHaveBeenCalled()
  })

  it('offers nothing to fix once the grimoire is actually in use', () => {
    // 它不是催办：什么都不缺的时候就不该再摆一个按钮在那里。
    render(<CompletenessBar completeness={FULL} {...handlers()} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('announces itself without stealing focus', () => {
    render(<CompletenessBar completeness={DEALT_ON_TABLE} {...handlers()} />)
    expect(screen.getByRole('status')).toBeVisible()
  })

  it('states the debt with a real number instead of the applied-change count', () => {
    // stateChangeCount 是 0、欠账是 9。写反了就会渲染出「有 0 条记录可能涉及状态变化」，
    // 而这恰好是最需要提示的那一刻。
    render(<CompletenessBar completeness={SWITCHED_MID_GAME} {...handlers()} />)

    expect(screen.getByRole('status')).toHaveTextContent('12 个座位身份齐全')
    expect(screen.getByRole('status')).toHaveTextContent('从第1夜到现在有 9 条记录可能涉及状态变化')
  })

  it('keeps 先这样 and 不再提示 as two different buttons wired to two different callbacks', async () => {
    // 合成一个键的话，说书人想让它「这一步别挡着」时会顺手把整局的提示都关掉。
    const spies = handlers()
    render(<CompletenessBar completeness={SWITCHED_MID_GAME} {...spies} />)

    await userEvent.click(screen.getByRole('button', { name: '逐条核对（约 1 分钟）' }))
    await userEvent.click(screen.getByRole('button', { name: '先这样，边走边补' }))
    await userEvent.click(screen.getByRole('button', { name: '不再提示' }))

    expect(spies.onReview).toHaveBeenCalledOnce()
    expect(spies.onDefer).toHaveBeenCalledOnce()
    expect(spies.onSilence).toHaveBeenCalledOnce()
    expect(spies.onOpenSetup).not.toHaveBeenCalled()
  })
})
