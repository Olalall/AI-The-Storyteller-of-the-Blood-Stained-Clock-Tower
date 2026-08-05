/**
 * 座位环的布局求解。
 *
 * 刻意不做自由拖拽画布：坐标一旦持久化，标记归属就会有两个真值
 * （按坐标就近算出来的 vs 按 seatId 记下来的），不一致时无法判定谁对。
 * 这里座位角度由人数唯一决定，标记按计算附着到 seatId，session 内不存任何像素坐标。
 */

/** 让屏上的 1 号方位对齐说书人在真实桌边的朝向；只给四档，不提供自由旋转。 */
export type RingStartOffset = 0 | 90 | 180 | 270

export interface RingInput {
  seatCount: number
  stageWidth: number
  stageHeight: number
  startOffset?: RingStartOffset
}

export interface RingSeat {
  seatIndex: number
  /** token 左上角坐标；定位的是元素而不是圆心。 */
  x: number
  y: number
}

export interface RingLayout {
  mode: 'ring' | 'grid'
  tokenSize: number
  /** 弧距：相邻两座位沿椭圆的间隔，是尺寸档位与标记落位的唯一判据。 */
  pitch: number
  radiusX: number
  radiusY: number
  centerX: number
  centerY: number
  seats: readonly RingSeat[]
  /** 弧距太挤时把卫星标记翻到 token 内侧——N 越大外圈越挤、内圈越空。 */
  satelliteInside: boolean
}

const PAD_X = 16
const PAD_Y = 12
/** 超过这个长短轴比就不像一张桌子了。 */
const MAX_AXIS_RATIO = 1.45
/** 相邻 token 之间至少留出的空隙。 */
const MIN_GAP = 28
/** 卫星标记翻到内侧的阈值。 */
const SATELLITE_FLIP_GAP = 40

const SIZE_TIERS = [96, 84, 72, 64] as const

/** 离散四档，禁连续缩放：连续缩放会让同一个局在不同设备上长得都不一样。 */
export function tokenSizeTierForSeatCount(seatCount: number): number {
  if (seatCount <= 10) return 96
  if (seatCount <= 14) return 84
  if (seatCount <= 17) return 72
  return 64
}

/** Ramanujan 近似；只用来算弧距，不需要更高精度。 */
export function ellipseCircumference(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0
  const h = ((a - b) ** 2) / ((a + b) ** 2)
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)))
}

function axesFor(stageWidth: number, stageHeight: number, tokenSize: number) {
  let radiusX = (stageWidth - 2 * PAD_X - tokenSize) / 2
  const radiusY = (stageHeight - 2 * PAD_Y - tokenSize) / 2
  // 半轴由可用矩形反推，不是先定圆再塞；比例超上限时收窄长轴并左右留白。
  if (radiusY > 0 && radiusX / radiusY > MAX_AXIS_RATIO) radiusX = radiusY * MAX_AXIS_RATIO
  return { radiusX: Math.max(0, radiusX), radiusY: Math.max(0, radiusY) }
}

export function solveRingLayout({
  seatCount,
  stageWidth,
  stageHeight,
  startOffset = 0,
}: RingInput): RingLayout {
  const centerX = stageWidth / 2
  const centerY = stageHeight / 2

  if (seatCount <= 0) {
    return { mode: 'grid', tokenSize: 64, pitch: 0, radiusX: 0, radiusY: 0, centerX, centerY, seats: [], satelliteInside: false }
  }

  const startTier = SIZE_TIERS.indexOf(tokenSizeTierForSeatCount(seatCount) as typeof SIZE_TIERS[number])
  for (let tier = Math.max(0, startTier); tier < SIZE_TIERS.length; tier += 1) {
    const tokenSize = SIZE_TIERS[tier]
    const { radiusX, radiusY } = axesFor(stageWidth, stageHeight, tokenSize)
    const pitch = ellipseCircumference(radiusX, radiusY) / seatCount
    if (pitch - tokenSize < MIN_GAP) continue

    const seats = Array.from({ length: seatCount }, (_value, seatIndex) => {
      // y 轴向下，所以 θ 递增即顺时针——与说书人站圈中央顺时针唱票一致。
      const theta = ((-90 + startOffset + (360 / seatCount) * seatIndex) * Math.PI) / 180
      return {
        seatIndex,
        x: centerX + radiusX * Math.cos(theta) - tokenSize / 2,
        y: centerY + radiusY * Math.sin(theta) - tokenSize / 2,
      }
    })
    return {
      mode: 'ring',
      tokenSize,
      pitch,
      radiusX,
      radiusY,
      centerX,
      centerY,
      seats,
      satelliteInside: pitch - tokenSize < SATELLITE_FLIP_GAP,
    }
  }

  // 已到最小档仍挤不下：整块退化为网格，由调用方改用列表布局。
  const tokenSize = SIZE_TIERS[SIZE_TIERS.length - 1]
  return { mode: 'grid', tokenSize, pitch: 0, radiusX: 0, radiusY: 0, centerX, centerY, seats: [], satelliteInside: false }
}

/** 卫星标记 chip 的直径。 */
export function satelliteChipSize(tokenSize: number): number {
  return Math.min(28, Math.max(22, Math.round(tokenSize * 0.3)))
}
