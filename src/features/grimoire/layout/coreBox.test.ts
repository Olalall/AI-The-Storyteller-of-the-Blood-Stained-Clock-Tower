import { describe, expect, it } from 'vitest'
import { coreBoxForRing } from './coreBox'
import { solveRingLayout } from './ellipseRing'

describe('核的占位', () => {
  it('stays inside the ellipse it sits in', () => {
    const layout = solveRingLayout({ seatCount: 12, stageWidth: 820, stageHeight: 900 })
    const box = coreBoxForRing(layout)
    // 四角都要满足 (x/a)² + (y/b)² ≤ 1，否则核会蹭到 token 内缘。
    const halfW = box.width / 2
    const halfH = box.height / 2
    expect((halfW / layout.radiusX) ** 2 + (halfH / layout.radiusY) ** 2).toBeLessThanOrEqual(1)
  })

  it('is centred on the ring', () => {
    const layout = solveRingLayout({ seatCount: 12, stageWidth: 820, stageHeight: 900 })
    const box = coreBoxForRing(layout)
    expect(box.left + box.width / 2).toBeCloseTo(layout.centerX, 6)
    expect(box.top + box.height / 2).toBeCloseTo(layout.centerY, 6)
  })

  it('collapses to nothing when there is no ring', () => {
    const box = coreBoxForRing({ mode: 'grid', centerX: 100, centerY: 100, radiusX: 0, radiusY: 0 })
    expect(box.width).toBe(0)
    expect(box.height).toBe(0)
  })
})
