import { describe, expect, it } from 'vitest'
import {
  ellipseCircumference,
  satelliteChipSize,
  solveRingLayout,
  tokenSizeTierForSeatCount,
} from './ellipseRing'

/** 可用舞台（已扣掉 48px 轨道与抽屉 peek 档）。Mac 是宽而矮，iPad 竖屏是窄而高。 */
const PORTRAIT = { stageWidth: 820, stageHeight: 900 }
const LANDSCAPE = { stageWidth: 1180, stageHeight: 620 }
const MAC_AIR = { stageWidth: 1440, stageHeight: 700 }
const MAC_14 = { stageWidth: 1512, stageHeight: 780 }
const MAC_16 = { stageWidth: 1728, stageHeight: 900 }
const ALL_STAGES = [PORTRAIT, LANDSCAPE, MAC_AIR, MAC_14, MAC_16]

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

describe('token 尺寸档位', () => {
  it('uses four discrete tiers rather than continuous scaling', () => {
    expect(tokenSizeTierForSeatCount(7)).toBe(96)
    expect(tokenSizeTierForSeatCount(10)).toBe(96)
    expect(tokenSizeTierForSeatCount(12)).toBe(84)
    expect(tokenSizeTierForSeatCount(15)).toBe(72)
    expect(tokenSizeTierForSeatCount(20)).toBe(64)
  })
})

describe('座位环求解', () => {
  it('puts seat 1 at twelve o’clock and walks clockwise', () => {
    const layout = solveRingLayout({ seatCount: 12, ...PORTRAIT })
    const [first, second] = layout.seats

    expect(first.y).toBeLessThan(layout.centerY)
    expect(Math.abs(first.x + layout.tokenSize / 2 - layout.centerX)).toBeLessThan(1)
    // 屏幕坐标 y 向下，顺时针的第二个座位应当偏右。
    expect(second.x).toBeGreaterThan(first.x)
  })

  it('honours the four discrete start offsets', () => {
    const base = solveRingLayout({ seatCount: 12, ...PORTRAIT })
    const rotated = solveRingLayout({ seatCount: 12, ...PORTRAIT, startOffset: 90 })

    expect(rotated.seats[0].x).toBeGreaterThan(base.seats[0].x)
    expect(Math.abs(rotated.seats[0].y + rotated.tokenSize / 2 - rotated.centerY)).toBeLessThan(1)
  })

  it('never lets neighbouring tokens overlap at any supported player count', () => {
    for (const seatCount of [7, 9, 12, 15, 18, 20]) {
      for (const stage of ALL_STAGES) {
        const layout = solveRingLayout({ seatCount, ...stage })
        if (layout.mode !== 'ring') continue
        for (let index = 0; index < layout.seats.length; index += 1) {
          const gap = distance(layout.seats[index], layout.seats[(index + 1) % layout.seats.length])
          expect(gap, `${seatCount}人 ${stage.stageWidth}×${stage.stageHeight} 第${index}位`)
            .toBeGreaterThanOrEqual(layout.tokenSize)
        }
      }
    }
  })

  it('keeps every token inside the stage', () => {
    for (const seatCount of [7, 12, 20]) {
      const layout = solveRingLayout({ seatCount, ...PORTRAIT })
      if (layout.mode !== 'ring') continue
      for (const seat of layout.seats) {
        expect(seat.x).toBeGreaterThanOrEqual(0)
        expect(seat.y).toBeGreaterThanOrEqual(0)
        expect(seat.x + layout.tokenSize).toBeLessThanOrEqual(PORTRAIT.stageWidth)
        expect(seat.y + layout.tokenSize).toBeLessThanOrEqual(PORTRAIT.stageHeight)
      }
    }
  })

  it('caps the axis ratio so the ring still reads as a table', () => {
    const layout = solveRingLayout({ seatCount: 12, stageWidth: 1600, stageHeight: 500 })
    expect(layout.radiusX / layout.radiusY).toBeLessThanOrEqual(1.45 + 1e-9)
  })

  it('keeps the ring usable on wide Mac screens without stretching it flat', () => {
    // Mac 是宽而矮：不设上限就会拉成一条横带，座位挤在左右两端、中间大片空白。
    for (const stage of [MAC_AIR, MAC_14, MAC_16]) {
      for (const seatCount of [7, 12, 15, 20]) {
        const layout = solveRingLayout({ seatCount, ...stage })
        expect(layout.mode, `${seatCount}人 ${stage.stageWidth}×${stage.stageHeight}`).toBe('ring')
        expect(layout.radiusX / layout.radiusY).toBeLessThanOrEqual(1.45 + 1e-9)
        // 宽屏应当拿到最大的 token 档位，而不是因为高度不足被迫降档。
        expect(layout.tokenSize).toBe(tokenSizeTierForSeatCount(seatCount))
      }
    }
  })

  it('centres the ring on wide screens instead of hugging one side', () => {
    const layout = solveRingLayout({ seatCount: 12, ...MAC_16 })
    const xs = layout.seats.map((seat) => seat.x + layout.tokenSize / 2)
    const midpoint = (Math.min(...xs) + Math.max(...xs)) / 2
    expect(Math.abs(midpoint - layout.centerX)).toBeLessThan(1)
  })

  it('drops a size tier before it lets tokens crowd', () => {
    const roomy = solveRingLayout({ seatCount: 12, ...PORTRAIT })
    const cramped = solveRingLayout({ seatCount: 12, stageWidth: 420, stageHeight: 520 })
    expect(cramped.tokenSize).toBeLessThan(roomy.tokenSize)
  })

  it('degrades to grid mode instead of drawing an unusable ring', () => {
    const layout = solveRingLayout({ seatCount: 20, stageWidth: 320, stageHeight: 420 })
    expect(layout.mode).toBe('grid')
    expect(layout.seats).toHaveLength(0)
  })

  it('flips the satellite arc inside once the ring gets tight', () => {
    // iPad 竖屏上 20 人仍有约 120px 弧距，不该翻内侧；真正挤的是小舞台。
    const roomy = solveRingLayout({ seatCount: 20, ...PORTRAIT })
    expect(roomy.satelliteInside).toBe(false)

    // 弧距落在 28–40px 的窗口里：还画得成环，但外圈已经挤到要把标记翻进内侧。
    const tight = solveRingLayout({ seatCount: 20, stageWidth: 720, stageHeight: 720 })
    expect(tight.mode).toBe('ring')
    expect(tight.satelliteInside).toBe(true)
  })

  it('is a pure function of its inputs', () => {
    const input = { seatCount: 12, ...PORTRAIT } as const
    expect(solveRingLayout(input)).toEqual(solveRingLayout(input))
  })
})

describe('辅助计算', () => {
  it('approximates the ellipse circumference within one percent of a circle', () => {
    const radius = 100
    expect(ellipseCircumference(radius, radius)).toBeCloseTo(2 * Math.PI * radius, 1)
  })

  it('keeps satellite chips inside the 22–28px band', () => {
    expect(satelliteChipSize(64)).toBeGreaterThanOrEqual(22)
    expect(satelliteChipSize(96)).toBeLessThanOrEqual(28)
  })
})
