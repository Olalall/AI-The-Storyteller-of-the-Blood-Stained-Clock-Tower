/**
 * 白天叠加层在每个 token 周围的落点。
 *
 * 一条规则贯穿全部：**白天的徽标永远落在卫星弧的对面**。
 * 卫星弧（中毒/醉酒/标记那一串状态点）的方位由 solveRingLayout 逐座位定下来，
 * 已经是这一圈最挤的地方；白天再往那儿堆举手徽标，会把「这个人中毒了」
 * 和「这个人举手了」压成一坨，而这两件事在计票那一刻都要一眼读到。
 *
 * 唯一的例外是死亡票 chip：文档指定它**独占整条卫星弧**（44px，取代 26px 药丸），
 * 所以它照 confirmationChipPlacement 落在卫星侧，由座位层在此期间让出那条弧。
 */
import { confirmationChipPlacement, type SatellitePlacement } from '../layout/satelliteArc'

/** 徽标中心离 token 边缘的距离。举手药丸高 22px，留 2px 呼吸。 */
export const RING_BADGE_REACH = 13

export interface RingBadgeOffset {
  /** 相对 token 圆心的偏移，调用方直接加到 token 中心上。 */
  dx: number
  dy: number
}

/**
 * 卫星弧对面的那一点。
 * satelliteInside 为真时卫星在内侧，徽标就去外侧；反之亦然。
 */
export function oppositeSatelliteOffset(
  tokenSize: number,
  radialAngle: number,
  satelliteInside: boolean,
  reach = RING_BADGE_REACH,
): RingBadgeOffset {
  const theta = satelliteInside ? radialAngle : radialAngle + Math.PI
  const radius = tokenSize / 2 + reach
  return { dx: radius * Math.cos(theta), dy: radius * Math.sin(theta) }
}

/**
 * 死亡票二次确认 chip 的落点。
 * 直接转发布局层已经准备好的那个函数——尺寸与半径由它说了算，这里不许自己算一份。
 */
export function ghostVoteChipPlacement(
  tokenSize: number,
  radialAngle: number,
  satelliteInside: boolean,
): SatellitePlacement {
  return confirmationChipPlacement(tokenSize, radialAngle, satelliteInside)
}
