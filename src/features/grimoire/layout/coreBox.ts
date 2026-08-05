/** 核（Town Info）在座位环正中央的占位计算。 */
import type { RingLayout } from './ellipseRing'

/** 核只需要中心与半轴；角度与尺寸一律来自 solveRingLayout，这里不自己算。 */
export type GrimoireCoreLayout = Pick<RingLayout, 'mode' | 'centerX' | 'centerY' | 'radiusX' | 'radiusY'>

/** 椭圆内接矩形（最大面积那一个）再收 8%，免得核蹭到 token 内缘。 */
export const CORE_INSCRIBED_SCALE = 0.92

export interface CoreBox {
  width: number
  height: number
  left: number
  top: number
}

/**
 * 椭圆内接矩形 ×0.92。
 * 半宽 a/√2、半高 b/√2 是最大内接矩形的解，所以边长是 √2·a × √2·b。
 */
export function coreBoxForRing(layout: GrimoireCoreLayout): CoreBox {
  const width = layout.radiusX * Math.SQRT2 * CORE_INSCRIBED_SCALE
  const height = layout.radiusY * Math.SQRT2 * CORE_INSCRIBED_SCALE
  return { width, height, left: layout.centerX - width / 2, top: layout.centerY - height / 2 }
}
