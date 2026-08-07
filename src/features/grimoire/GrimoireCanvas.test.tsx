import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GrimoireCanvas, type GrimoireCanvasSeat } from './GrimoireCanvas'
import type { PlayerState } from '../game-session/model/playerTypes'

const ALIVE: PlayerState = { life: 'alive', poisoned: false, drunk: false, markers: [] }

/** jsdom 没有 ResizeObserver，也不做布局；用一个能立刻回报固定尺寸的替身喂给画布。 */
function stubResizeObserver(width: number, height: number) {
  const original = globalThis.ResizeObserver
  class Stub {
    // 不用参数属性：tsconfig 开了 erasableSyntaxOnly，那个语法要生成运行时代码。
    private readonly callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) { this.callback = callback }
    observe(target: Element) {
      this.callback(
        [{ target, contentRect: { width, height } } as unknown as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      )
    }
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = Stub as unknown as typeof ResizeObserver
  return () => { globalThis.ResizeObserver = original }
}

function seatsOf(count: number): GrimoireCanvasSeat[] {
  return Array.from({ length: count }, (_value, index) => ({
    seatId: index + 1,
    nickname: `玩家${index + 1}`,
    state: ALIVE,
    role: { roleId: `role-${index}`, name: `角色${index}`, initial: '角' },
  }))
}

describe('GrimoireCanvas', () => {
  let restore = () => {}
  beforeEach(() => { restore = stubResizeObserver(820, 900) })
  afterEach(() => restore())

  it('draws one token per seat', () => {
    render(<GrimoireCanvas seats={seatsOf(12)} shield="L1" />)
    expect(screen.getAllByRole('button')).toHaveLength(12)
  })

  it('never dispatches — a tap on the ring only reports the seat upward', async () => {
    // G1 的硬约束：环是观察面。环若能直接写状态，「点一下改了什么」就没有确认步骤，
    // 而这个工具的前提是说书人裁定、工具只记录。
    const onSelectSeat = vi.fn()
    render(<GrimoireCanvas seats={seatsOf(8)} shield="L1" onSelectSeat={onSelectSeat} />)

    for (const token of screen.getAllByRole('button')) {
      await userEvent.click(token)
    }

    expect(onSelectSeat).toHaveBeenCalledTimes(8)
    expect(onSelectSeat.mock.calls.map(([seatId]) => seatId)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('leaks no role identity anywhere on the canvas at the default L1', () => {
    const { container } = render(<GrimoireCanvas seats={seatsOf(12)} shield="L1" />)
    expect(container.innerHTML).not.toMatch(/角色\d/)
    expect(container.querySelector('img')).toBeNull()
  })

  it('renders no seats at all under a full blackout', () => {
    render(<GrimoireCanvas seats={seatsOf(12)} shield="L0" />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.getByText('魔典已盖上')).toBeVisible()
  })

  it('counts the living without ever seeing who they are', () => {
    const seats = seatsOf(5).map((seat, index) => (
      index < 2 ? { ...seat, state: { ...ALIVE, life: 'dead' as const } } : seat
    ))
    const { container } = render(<GrimoireCanvas seats={seats} shield="L1" />)

    expect(container.querySelector('[data-stat="alive"] dd')?.textContent).toBe('3')
    expect(container.querySelector('[data-stat="dead"] dd')?.textContent).toBe('2')
  })

  it('shows the seating prompt before anyone is seated', () => {
    render(<GrimoireCanvas seats={[]} shield="L1" />)
    expect(screen.getByText('尚未配座')).toBeVisible()
  })

  it('marks selected seats with the shared pressed contract', () => {
    render(<GrimoireCanvas seats={seatsOf(6)} shield="L1" selectedSeatIds={[2, 5]} />)
    const pressed = screen.getAllByRole('button').filter((node) => node.getAttribute('aria-pressed') === 'true')
    expect(pressed.map((node) => node.getAttribute('data-seat-id'))).toEqual(['2', '5'])
  })
})

describe('GrimoireCanvas 的窄屏退化', () => {
  let restore = () => {}
  afterEach(() => restore())

  it('falls back to a grid rather than drawing an unusable ring', () => {
    restore = stubResizeObserver(320, 420)
    const { container } = render(<GrimoireCanvas seats={seatsOf(20)} shield="L1" />)

    expect(container.querySelector('.grimoire-canvas')?.getAttribute('data-mode')).toBe('grid')
    expect(container.querySelector('.grimoire-canvas__grid')).not.toBeNull()
    // 退化态仍要每个座位都在，且不能全叠在原点。
    expect(screen.getAllByRole('button')).toHaveLength(20)
    for (const token of screen.getAllByRole('button')) {
      expect(token.getAttribute('style')).not.toContain('left')
    }
  })

  it('stays a ring when there is room for one', () => {
    restore = stubResizeObserver(1180, 620)
    const { container } = render(<GrimoireCanvas seats={seatsOf(15)} shield="L1" />)
    expect(container.querySelector('.grimoire-canvas')?.getAttribute('data-mode')).toBe('ring')
  })
})
