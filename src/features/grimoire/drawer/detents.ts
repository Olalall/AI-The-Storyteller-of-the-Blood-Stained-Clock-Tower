/**
 * 三档抽屉的高度计算。
 *
 * 三档取值只在这里算一次，CSS 里不再各写一遍——两处各写一遍时，
 * 拖动吸附判据和实际渲染高度会悄悄分叉。
 */

export type WorkDrawerDetent = 'peek' | 'half' | 'full'

/** 从矮到高，索引即 aria-valuenow。 */
export const WORK_DRAWER_DETENTS: readonly WorkDrawerDetent[] = ['peek', 'half', 'full']

/** peek 档高度：这一档不得遮住环的下半弧超过 96px（Mac 宽而矮，这是硬约束）。 */
export const WORK_DRAWER_PEEK_HEIGHT = 96
/** full 档给顶部阶段轨道留出的高度。 */
export const WORK_DRAWER_TRACK_RESERVE = 48
const HALF_VIEWPORT_PERCENT = 46
const HALF_MIN_HEIGHT = 240

export const DETENT_LABEL: Record<WorkDrawerDetent, string> = {
  peek: '窥视',
  half: '半屏',
  full: '全屏',
}

/** 拖动松手时的吸附判据也用它，所以必须是纯函数、可单测。 */
export function workDrawerHeightPx(detent: WorkDrawerDetent, viewportHeight: number): number {
  const max = Math.max(WORK_DRAWER_PEEK_HEIGHT, viewportHeight - WORK_DRAWER_TRACK_RESERVE)
  if (detent === 'peek') return Math.min(WORK_DRAWER_PEEK_HEIGHT, max)
  if (detent === 'full') return max
  return Math.min(max, Math.max(HALF_MIN_HEIGHT, Math.round((viewportHeight * HALF_VIEWPORT_PERCENT) / 100)))
}

/** 渲染时用 CSS 表达式而不是测量出来的像素，避免地址栏收缩时抽屉跳一下。 */
export function heightCssFor(detent: WorkDrawerDetent): string {
  if (detent === 'peek') return `${WORK_DRAWER_PEEK_HEIGHT}px`
  const full = `calc(100dvh - ${WORK_DRAWER_TRACK_RESERVE}px)`
  if (detent === 'full') return full
  return `clamp(${HALF_MIN_HEIGHT}px, ${HALF_VIEWPORT_PERCENT}dvh, ${full})`
}

/** 拖到哪算哪：按松手高度吸附到最近的一档。 */
export function nearestDetent(heightPx: number, viewportHeight: number): WorkDrawerDetent {
  return WORK_DRAWER_DETENTS.reduce((best, detent) => (
    Math.abs(workDrawerHeightPx(detent, viewportHeight) - heightPx)
      < Math.abs(workDrawerHeightPx(best, viewportHeight) - heightPx) ? detent : best
  ), WORK_DRAWER_DETENTS[0])
}

export function shiftDetent(detent: WorkDrawerDetent, step: number): WorkDrawerDetent {
  const index = WORK_DRAWER_DETENTS.indexOf(detent)
  const next = Math.min(WORK_DRAWER_DETENTS.length - 1, Math.max(0, index + step))
  return WORK_DRAWER_DETENTS[next]
}
