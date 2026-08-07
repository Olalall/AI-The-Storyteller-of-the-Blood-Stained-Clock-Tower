import { describe, expect, it } from 'vitest'
import { MAX_VISIBLE_SATELLITES, foldSatellites, satellitePlacements } from './satelliteArc'

const TOKEN = 96

describe('卫星标记附着', () => {
  it('puts a single chip straight out along the radius', () => {
    const [chip] = satellitePlacements({ count: 1, tokenSize: TOKEN, radialAngle: 0, inside: false })
    expect(chip.dy).toBeCloseTo(0, 6)
    expect(chip.dx).toBeGreaterThan(TOKEN / 2)
  })

  it('spreads chips over the arc without exceeding it', () => {
    const chips = satellitePlacements({ count: 3, tokenSize: TOKEN, radialAngle: 0, inside: false })
    const angles = chips.map((chip) => Math.atan2(chip.dy, chip.dx))
    const spreadDegrees = ((Math.max(...angles) - Math.min(...angles)) * 180) / Math.PI
    expect(spreadDegrees).toBeCloseTo(88, 6)
  })

  it('keeps every chip on the same radius', () => {
    const chips = satellitePlacements({ count: 3, tokenSize: TOKEN, radialAngle: 1.2, inside: false })
    const radii = chips.map((chip) => Math.hypot(chip.dx, chip.dy))
    expect(Math.max(...radii) - Math.min(...radii)).toBeLessThan(1e-6)
  })

  it('flips the whole arc to face the core when the ring is tight', () => {
    // N 越大外圈越挤、内圈越空，所以拥挤时标记该往里放而不是缩小。
    const [outward] = satellitePlacements({ count: 1, tokenSize: TOKEN, radialAngle: 0, inside: false })
    const [inward] = satellitePlacements({ count: 1, tokenSize: TOKEN, radialAngle: 0, inside: true })
    expect(inward.dx).toBeCloseTo(-outward.dx, 6)
    expect(Math.hypot(inward.dx, inward.dy)).toBeCloseTo(Math.hypot(outward.dx, outward.dy), 6)
  })

  it('renders nothing for an empty seat', () => {
    expect(satellitePlacements({ count: 0, tokenSize: TOKEN, radialAngle: 0, inside: false })).toEqual([])
  })

  it('folds past three so the count stays readable', () => {
    expect(foldSatellites(3)).toEqual({ visible: 3, folded: 0 })
    // 第 4、5 枚折进最后一格：实画 3 枚，末枚代表 3 项。
    expect(foldSatellites(5)).toEqual({ visible: MAX_VISIBLE_SATELLITES, folded: 3 })
  })
})
