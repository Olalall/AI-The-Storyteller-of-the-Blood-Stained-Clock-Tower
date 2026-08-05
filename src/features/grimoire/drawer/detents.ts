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

/**
 * peek 档只有两个既定占用者，且二者必须在类型上分开：
 * - seat-state-confirm：座位草稿的单动作条「确认 5号 状态」，死亡时为 danger 色，
 *   高度由内容撑开（设计里它是一条按钮条，没有规定高度）；
 * - day-timer：白天计时的一条 88px 控制横条（开始/暂停/重置/时长/投屏）。
 *
 * 为什么不合成一个「peek 内容」：两者的生命周期、语义色与消失条件完全不同——
 * 前者随草稿出现、按下即消失，后者随白天相位常驻。合成一个之后，
 * 「按了确认之后倒计时条要不要回来」这种问题在类型上无法表达，只能靠调用点各自记着。
 */
export type WorkDrawerPeekSlotKind = 'seat-state-confirm' | 'day-timer'

/**
 * 白天计时控制横条的高度。
 *
 * 88 与 peek 档的 96 是两个不同的量，绝不能合成一个常量：
 * 96 是「抽屉遮住环下半弧的上限」，88 是「一条控制横条自己有多高」。
 * 合成之后，任何一次为了摆下第五枚按钮而抬高横条，都会同时抬高抽屉、
 * 多吃掉环的下半弧——而那条硬约束的来源（Mac 宽而矮）与横条毫无关系。
 */
export const DAY_TIMER_BAR_HEIGHT = 88

/** 0 表示不设下限、由内容撑开；这里只登记设计给过数的那一个。 */
export const PEEK_SLOT_MIN_HEIGHT: Record<WorkDrawerPeekSlotKind, number> = {
  'seat-state-confirm': 0,
  'day-timer': DAY_TIMER_BAR_HEIGHT,
}
