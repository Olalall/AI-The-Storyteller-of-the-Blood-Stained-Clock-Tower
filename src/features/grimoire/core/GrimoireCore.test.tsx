import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GrimoireCore } from './GrimoireCore'
import type { StorytellerSeatSummary } from '../../game-session/state/projectors'

const RING = { mode: 'ring' as const, centerX: 400, centerY: 400, radiusX: 300, radiusY: 300 }

function seats(alive: number, dead: number): StorytellerSeatSummary[] {
  return [
    ...Array.from({ length: alive }, (_v, i) => ({ seatId: i + 1, nickname: '', role: null, state: { life: 'alive' as const, poisoned: false, drunk: false, markers: [] } })),
    ...Array.from({ length: dead }, (_v, i) => ({ seatId: alive + i + 1, nickname: '', role: null, state: { life: 'dead' as const, poisoned: false, drunk: false, markers: [] } })),
  ]
}

describe('GrimoireCore', () => {
  it('shows the execution threshold without ever deciding it', () => {
    // 门槛是算得出的；是否处决是裁定。工具显示前者，绝不代替后者。
    const { container } = render(<GrimoireCore seats={seats(7, 0)} layout={RING} />)

    expect(container.querySelector('[data-stat="threshold"] dd')?.textContent).toBe('4')
    expect(screen.getByText('只显示 · 不裁定')).toBeVisible()
  })

  it('writes an em dash instead of inventing a number it has no source for', () => {
    const { container } = render(<GrimoireCore seats={seats(5, 1)} layout={RING} />)
    const ghost = container.querySelector('[data-stat="ghost-votes"] dd')

    expect(ghost?.textContent).toContain('—')
    expect(ghost).toHaveAttribute('data-empty', 'true')
  })

  it('uses the real number once a source exists', () => {
    const { container } = render(<GrimoireCore seats={seats(5, 1)} layout={RING} ghostVotesRemaining={2} />)
    expect(container.querySelector('[data-stat="ghost-votes"] dd')?.textContent).toBe('2')
  })

  it('accepts no pointer input — the core is an observation surface', () => {
    const { container } = render(<GrimoireCore seats={seats(7, 0)} layout={RING} />)
    const core = container.querySelector('.grimoire-core') as HTMLElement

    expect(core.style.pointerEvents).toBe('none')
    expect(core.querySelector('button')).toBeNull()
  })

  it('sits centred inside the ring', () => {
    const { container } = render(<GrimoireCore seats={seats(7, 0)} layout={RING} />)
    const core = container.querySelector('.grimoire-core') as HTMLElement

    const left = Number.parseFloat(core.style.left)
    const width = Number.parseFloat(core.style.width)
    expect(left + width / 2).toBeCloseTo(RING.centerX, 6)
  })

  it('stops positioning itself when the ring degrades to a grid', () => {
    const { container } = render(
      <GrimoireCore seats={seats(7, 0)} layout={{ ...RING, mode: 'grid', radiusX: 0, radiusY: 0 }} />,
    )
    const core = container.querySelector('.grimoire-core') as HTMLElement

    expect(core.className).toContain('grimoire-core--flow')
    expect(core.style.left).toBe('')
  })

  it('says the board is empty rather than showing five zeroes', () => {
    render(<GrimoireCore seats={[]} layout={RING} />)
    expect(screen.getByText('尚未配座')).toBeVisible()
  })
})
