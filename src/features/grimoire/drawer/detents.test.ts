import { describe, expect, it } from 'vitest'
import {
  WORK_DRAWER_DETENTS,
  WORK_DRAWER_PEEK_HEIGHT,
  WORK_DRAWER_TRACK_RESERVE,
  heightCssFor,
  nearestDetent,
  shiftDetent,
  workDrawerHeightPx,
} from './detents'

const IPAD_PORTRAIT = 1180
const MAC_AIR = 900

describe('抽屉三档高度', () => {
  it('keeps peek at 96px so it never hides more than 96px of the lower arc', () => {
    // Mac 宽而矮，环的下半弧被遮住多少是硬约束，不能随视口浮动。
    expect(workDrawerHeightPx('peek', IPAD_PORTRAIT)).toBe(WORK_DRAWER_PEEK_HEIGHT)
    expect(workDrawerHeightPx('peek', MAC_AIR)).toBe(WORK_DRAWER_PEEK_HEIGHT)
  })

  it('leaves the phase track visible even at full', () => {
    expect(workDrawerHeightPx('full', MAC_AIR)).toBe(MAC_AIR - WORK_DRAWER_TRACK_RESERVE)
  })

  it('orders the three detents strictly by height', () => {
    for (const viewport of [MAC_AIR, IPAD_PORTRAIT, 620]) {
      const [peek, half, full] = WORK_DRAWER_DETENTS.map((d) => workDrawerHeightPx(d, viewport))
      expect(peek, `${viewport}px 视口`).toBeLessThan(half)
      expect(half, `${viewport}px 视口`).toBeLessThanOrEqual(full)
    }
  })

  it('never returns a height taller than full, even on a tiny viewport', () => {
    const viewport = 300
    const full = workDrawerHeightPx('full', viewport)
    for (const detent of WORK_DRAWER_DETENTS) {
      expect(workDrawerHeightPx(detent, viewport)).toBeLessThanOrEqual(full)
    }
  })

  it('snaps a released drag to the closest detent', () => {
    expect(nearestDetent(100, MAC_AIR)).toBe('peek')
    expect(nearestDetent(workDrawerHeightPx('half', MAC_AIR), MAC_AIR)).toBe('half')
    expect(nearestDetent(9999, MAC_AIR)).toBe('full')
  })

  it('clamps keyboard stepping at both ends instead of wrapping', () => {
    // 循环是把手点击的语义；键盘上要能停在两端，否则按住方向键会一直转。
    expect(shiftDetent('peek', -1)).toBe('peek')
    expect(shiftDetent('full', 1)).toBe('full')
    expect(shiftDetent('peek', 1)).toBe('half')
  })

  it('renders with viewport units so the drawer does not jump when the URL bar collapses', () => {
    expect(heightCssFor('full')).toContain('dvh')
    expect(heightCssFor('half')).toContain('dvh')
    expect(heightCssFor('peek')).toBe('96px')
  })
})
