import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CompletenessBar } from './CompletenessBar'

const FULL = { seatsWithRole: 12, totalSeats: 12, stateChangeCount: 4, markerCount: 1 }
const DEALT_ON_TABLE = { seatsWithRole: 0, totalSeats: 12, stateChangeCount: 3, markerCount: 0 }

describe('CompletenessBar', () => {
  it('sends a session that was dealt on the table to setup, not to state entry', async () => {
    const onOpenSetup = vi.fn()
    const onOpenStateEntry = vi.fn()
    render(<CompletenessBar completeness={DEALT_ON_TABLE} onOpenSetup={onOpenSetup} onOpenStateEntry={onOpenStateEntry} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onOpenSetup).toHaveBeenCalledOnce()
    expect(onOpenStateEntry).not.toHaveBeenCalled()
  })

  it('offers nothing to fix once the grimoire is actually in use', () => {
    // 它不是催办：什么都不缺的时候就不该再摆一个按钮在那里。
    render(<CompletenessBar completeness={FULL} onOpenSetup={vi.fn()} onOpenStateEntry={vi.fn()} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('announces itself without stealing focus', () => {
    render(<CompletenessBar completeness={DEALT_ON_TABLE} onOpenSetup={vi.fn()} onOpenStateEntry={vi.fn()} />)
    expect(screen.getByRole('status')).toBeVisible()
  })

  it('routes a complete-but-unmarked board to state entry', async () => {
    const onOpenStateEntry = vi.fn()
    render(
      <CompletenessBar
        completeness={{ seatsWithRole: 12, totalSeats: 12, stateChangeCount: 0, markerCount: 0 }}
        onOpenSetup={vi.fn()}
        onOpenStateEntry={onOpenStateEntry}
      />,
    )

    await userEvent.click(screen.getByRole('button'))

    expect(onOpenStateEntry).toHaveBeenCalledOnce()
  })
})
