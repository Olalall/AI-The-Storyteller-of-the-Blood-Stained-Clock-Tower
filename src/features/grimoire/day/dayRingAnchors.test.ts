import { describe, expect, it } from 'vitest'
import { RING_BADGE_REACH, ghostVoteChipPlacement, oppositeSatelliteOffset } from './dayRingAnchors'
import { SATELLITE_MAX_CHIP } from '../layout/ellipseRing'
import { satellitePlacements } from '../layout/satelliteArc'

const TOKEN = 84
/** 3 点钟方向的一座：径向朝外就是 +x。 */
const ANGLE = 0

describe('白天徽标的落点', () => {
  it('卫星在外侧时徽标去内侧，卫星在内侧时徽标去外侧', () => {
    const satellitesOutside = oppositeSatelliteOffset(TOKEN, ANGLE, false)
    const satellitesInside = oppositeSatelliteOffset(TOKEN, ANGLE, true)

    // 卫星朝外（satelliteInside=false）→ 徽标必须朝内，dx 为负。
    expect(satellitesOutside.dx).toBeLessThan(0)
    expect(satellitesInside.dx).toBeGreaterThan(0)
    expect(satellitesOutside.dx).toBeCloseTo(-satellitesInside.dx, 10)
  })

  it('徽标与状态点分处两侧，两者的中心永远不重合', () => {
    // 「白天徽标永远落在卫星弧的对面」这条规矩，机器化成一句可以红的断言：
    // 拿布局层真的算出来的三枚状态点，逐一比对徽标中心。
    for (const inside of [true, false]) {
      const badge = oppositeSatelliteOffset(TOKEN, ANGLE, inside)
      const chips = satellitePlacements({ count: 3, tokenSize: TOKEN, radialAngle: ANGLE, inside })
      for (const chip of chips) {
        expect(Math.hypot(badge.dx - chip.dx, badge.dy - chip.dy)).toBeGreaterThan(TOKEN / 2)
      }
    }
  })

  it('徽标贴着 token 边缘，不飘在半空', () => {
    const badge = oppositeSatelliteOffset(TOKEN, ANGLE, true)
    expect(Math.hypot(badge.dx, badge.dy)).toBeCloseTo(TOKEN / 2 + RING_BADGE_REACH, 10)
  })

  it('死亡票 chip 原样转发布局层的落点，尺寸就是布局层预留的那 44px', () => {
    // 自己再算一份半径，迟早会与 satelliteArc 里的 CHIP_GAP 漂移，
    // 那时那枚 chip 会在最需要它的时候伸出舞台被裁掉。
    const placement = ghostVoteChipPlacement(TOKEN, ANGLE, false)
    expect(placement.size).toBe(SATELLITE_MAX_CHIP)
    expect(placement.dx).toBeGreaterThan(0)
    expect(placement.dy).toBeCloseTo(0, 10)
  })
})
