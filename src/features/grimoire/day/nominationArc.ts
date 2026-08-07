/**
 * 提名弧线的纯几何。
 *
 * 这是**环上唯一一处连线**。文档把这条限制写死是有原因的：环一旦允许画第二种线，
 * 它就从「一张局面图」变成了「一张关系图」，而关系图是推理工具的形状，不是笔录本的形状。
 * 所以这个模块只回答一个问题——这一次提名从哪儿到哪儿——不提供任何通用连线能力。
 *
 * ## 为什么弧贴着环走，而不是从环上拉一根弦横穿中央
 *
 * 核占的是椭圆的最大内接矩形（coreBoxForRing：半宽 a/√2×0.92），它的四个角
 * 正好顶到 token 内缘。也就是说**核与 token 环之间根本没有空环带**：
 * 任何一条连接两座的线，要么压在核上，要么压在 token 上，二选一。
 *
 * 选贴环：弧走在 token 内缘那一圈，只会在对角方向蹭到核那个矩形的四个角
 * （核内部是居中的 flex 列，角上通常是空的），而横穿中央的弦会直接划过
 * 「举手 N / 门槛 M / 差 X」这三个数——那三个数是说书人此刻唯一要读的东西。
 * 顺带还避开了两处冲突：与「计时进度弧」不同半径（进度弧在导轨上，提名弧在 token 内侧），
 * 与卫星 chip 不同侧（chip 在 token 外缘或翻到内侧的那一小段，弧是整段圆周）。
 *
 * 走短边而不是「从被提名者起顺时针」的唱票边：弧表达的是「这一次提名」这件事，
 * 不是唱票的行进路线。用最短的一段连线，墨最少、歧义最小。
 */

const TAU = Math.PI * 2

/** 弧与 token 边缘之间的呼吸量。 */
const ARC_GAP = 8
/** 弧半径相对环半轴的上下限；极端尺寸下也不让它塌进核心或糊在 token 上。 */
const MIN_ARC_FACTOR = 0.45
const MAX_ARC_FACTOR = 0.95

/** 三角标的边长（外接正方形）。44px 命中区不适用：它不可点，只是标记。 */
export const NOMINATION_MARKER_SIZE = 13

/** 座位角度：与 solveRingLayout 里 θ=-90°+offset+i·360/N 同一个公式。 */
export function seatRadialAngle(seatIndex: number, seatCount: number, startOffset = 0): number {
  if (seatCount <= 0) return 0
  return ((-90 + startOffset + (360 / seatCount) * seatIndex) * Math.PI) / 180
}

export interface RingArcGeometry {
  centerX: number
  centerY: number
  radiusX: number
  radiusY: number
  tokenSize: number
}

export interface NominationMarker {
  x: number
  y: number
  /** 度数，直接进 SVG 的 rotate()。0 = 指向 +x。 */
  rotation: number
}

export interface NominationArc {
  /** 提名人那一端；被提名人未选时它单独存在。 */
  from: NominationMarker | null
  /** 被提名人那一端。 */
  to: NominationMarker | null
  /** SVG path 的 d。两端没凑齐、或提名了自己时为 null——没有「之间」可画。 */
  path: string | null
  /** 自我提名（百科上不禁止）。此时只画一枚标记，不画弧。 */
  selfNomination: boolean
}

export interface NominationArcInput extends RingArcGeometry {
  /** 弧度。null = 这一端还没选。 */
  nominatorAngle: number | null
  nomineeAngle: number | null
}

/** 归一到 (-π, π]；恰好对座时取 +π（顺时针那一侧），保证同一组输入永远得到同一条弧。 */
function signedSeparation(from: number, to: number): number {
  const wrapped = (((to - from) % TAU) + TAU) % TAU
  return wrapped > Math.PI ? wrapped - TAU : wrapped
}

/** 弧所在的同心椭圆相对环半轴的比例。按较短半轴留 token 半径 + 呼吸量。 */
function arcFactor({ radiusX, radiusY, tokenSize }: RingArcGeometry): number {
  const shorter = Math.min(radiusX, radiusY)
  if (shorter <= 0) return 0
  const factor = 1 - (tokenSize / 2 + ARC_GAP) / shorter
  return Math.min(MAX_ARC_FACTOR, Math.max(MIN_ARC_FACTOR, factor))
}

function pointOnArc(geometry: RingArcGeometry, factor: number, angle: number) {
  return {
    x: geometry.centerX + geometry.radiusX * factor * Math.cos(angle),
    y: geometry.centerY + geometry.radiusY * factor * Math.sin(angle),
  }
}

function degrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * 指向自己 token 的方向（径向朝外）。
 * 用椭圆上的径向差分而不是 angle 本身：椭圆的「朝外」不等于极角方向，
 * 差一点点就会让三角标看起来没对准 token。
 */
function outwardRotation(geometry: RingArcGeometry, angle: number): number {
  return degrees(Math.atan2(geometry.radiusY * Math.sin(angle), geometry.radiusX * Math.cos(angle)))
}

/**
 * 沿弧前进方向的切线。
 * 椭圆 (rx·cosθ, ry·sinθ) 对 θ 求导得 (−rx·sinθ, ry·cosθ)；逆时针走时取反。
 */
function tangentRotation(geometry: RingArcGeometry, factor: number, angle: number, clockwise: boolean): number {
  const dx = -geometry.radiusX * factor * Math.sin(angle)
  const dy = geometry.radiusY * factor * Math.cos(angle)
  const sign = clockwise ? 1 : -1
  return degrees(Math.atan2(sign * dy, sign * dx))
}

function round(value: number): number {
  // path 字符串只留一位小数：亚像素精度对 1px 描边没有意义，却会让快照测试永远对不上。
  return Math.round(value * 10) / 10
}

/**
 * 一条提名弧 + 两枚三角标。
 *
 * 三角标的朝向刻意不同，好让「谁提名了谁」不依赖颜色也读得出来：
 * 起点三角沿弧的**去向**（离开提名人），终点三角**径向朝外扎进**被提名人的 token（落点）。
 */
export function nominationArc(input: NominationArcInput): NominationArc {
  const { nominatorAngle, nomineeAngle } = input
  const factor = arcFactor(input)
  if (factor <= 0) return { from: null, to: null, path: null, selfNomination: false }

  const selfNomination = nominatorAngle !== null && nominatorAngle === nomineeAngle
  const hasArc = nominatorAngle !== null && nomineeAngle !== null && !selfNomination
  // 顺时针 = 极角递增；y 轴向下，所以这与 solveRingLayout 的座位编号方向一致。
  const clockwise = hasArc && signedSeparation(nominatorAngle, nomineeAngle) > 0

  const from = nominatorAngle === null ? null : {
    ...pointOnArc(input, factor, nominatorAngle),
    // 有弧时沿去向（离开提名人），单独存在时退回径向朝外——没有弧就没有「去向」可指。
    rotation: hasArc
      ? tangentRotation(input, factor, nominatorAngle, clockwise)
      : outwardRotation(input, nominatorAngle),
  }
  const to = nomineeAngle === null || selfNomination ? null : {
    ...pointOnArc(input, factor, nomineeAngle),
    rotation: outwardRotation(input, nomineeAngle),
  }

  if (!hasArc || !from || !to) return { from, to, path: null, selfNomination }

  const rx = round(input.radiusX * factor)
  const ry = round(input.radiusY * factor)
  // large-arc-flag 恒 0：永远走短边。sweep-flag 1 = 极角递增方向，
  // 而 y 轴向下时极角递增就是顺时针，与 solveRingLayout 的座位编号方向一致。
  const path = `M ${round(from.x)} ${round(from.y)} A ${rx} ${ry} 0 0 ${clockwise ? 1 : 0} ${round(to.x)} ${round(to.y)}`

  return { from, to, path, selfNomination }
}

/** 三角标的三个顶点（局部坐标，指向 +x）。旋转与平移交给 SVG transform。 */
export function markerPoints(size = NOMINATION_MARKER_SIZE): string {
  const half = size / 2
  // 等腰：尖端在 +x，底边在 −x。高取 size 的 0.9，比正三角更尖一点，方向感更强。
  return `${round(half * 0.9)},0 ${round(-half * 0.9)},${round(-half)} ${round(-half * 0.9)},${round(half)}`
}
