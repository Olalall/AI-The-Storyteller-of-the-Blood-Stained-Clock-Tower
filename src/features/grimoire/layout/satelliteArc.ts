/**
 * 卫星标记的计算附着。
 *
 * 「计算附着，永不拖拽」：标记记的是 seatId，位置每次由这里算出来。
 * 若允许拖拽并持久化坐标，标记归属就有两个真值（按坐标就近算 vs 按 seatId 记），
 * 不一致时无法判定谁对——那正是实体魔典最容易出错、而工具最该消灭的一类歧义。
 */
import { satelliteChipSize } from './ellipseRing'

/** 卫星弧张角。再宽就会蹭到相邻座位。 */
export const SATELLITE_ARC_DEGREES = 88
/** 超过这个数就折叠成 +N；一个座位同时挂四枚以上标记时，看清枚数比看清哪几枚更要紧。 */
export const MAX_VISIBLE_SATELLITES = 3
const CHIP_GAP = 4

export interface SatellitePlacement {
  /** 相对 token 圆心的偏移，调用方直接加到 token 中心上。 */
  dx: number
  dy: number
  size: number
}

export interface SatelliteArcInput {
  /** 本座位要挂的 chip 数（已含折叠后的 +N 那一枚）。 */
  count: number
  tokenSize: number
  /** token 圆心相对 core 圆心的方位角（弧度），由 solveRingLayout 的座位角度直接给出。 */
  radialAngle: number
  /** 弧距不足时翻到内侧朝向 core——N 越大外圈越挤、内圈越空。 */
  inside: boolean
}

/**
 * 顺序恒定：中毒 → 醉酒 → 具名标记，与现有 PlayerStatusBar 一致。
 * 顺序不随数据变化，说书人才能靠位置记住「左起第一枚是毒」。
 */
export function satellitePlacements({
  count,
  tokenSize,
  radialAngle,
  inside,
}: SatelliteArcInput): readonly SatellitePlacement[] {
  if (count <= 0) return []

  const size = satelliteChipSize(tokenSize)
  const radius = tokenSize / 2 + size / 2 + CHIP_GAP
  // 翻到内侧是把整条弧绕圆心转 180°，chip 之间的相对顺序保持不变。
  const centre = inside ? radialAngle + Math.PI : radialAngle
  const spread = (SATELLITE_ARC_DEGREES * Math.PI) / 180
  const step = count === 1 ? 0 : spread / (count - 1)
  const start = centre - (count === 1 ? 0 : spread / 2)

  return Array.from({ length: count }, (_value, index) => {
    const theta = start + step * index
    return { dx: radius * Math.cos(theta), dy: radius * Math.sin(theta), size }
  })
}

/** 超出 MAX_VISIBLE_SATELLITES 时最后一枚变成 +N；返回实际要画的 chip 数与折叠掉的枚数。 */
export function foldSatellites(total: number): { visible: number; folded: number } {
  if (total <= MAX_VISIBLE_SATELLITES) return { visible: total, folded: 0 }
  // 折叠位本身占一枚，所以实画 MAX 枚、其中最后一枚代表 total − (MAX − 1) 项。
  return { visible: MAX_VISIBLE_SATELLITES, folded: total - (MAX_VISIBLE_SATELLITES - 1) }
}
