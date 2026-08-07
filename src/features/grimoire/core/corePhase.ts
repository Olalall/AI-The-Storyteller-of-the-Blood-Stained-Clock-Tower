/**
 * 核（Town Info）的相位内容契约，外加三个只许出现在渲染路径上的算式。
 *
 * 为什么类型单独成文件：这几个形状是「接线批负责投影」与「核负责渲染」之间的合同。
 * 压在 tsx 里，调用方为了拿一个类型就得 import 一个组件文件。
 *
 * 裁决 10 的原话是「三个算式采纳但只出现在渲染路径，禁止任何算式结果进入 dispatch 的 payload」。
 * 所以这里的函数刻意不返回任何「达标了没有」的布尔：一旦有了那个布尔，
 * 下一步必然是有人拿它去自动暂列、自动处决，记录台就变成了规则引擎。
 */

/** idle 是底座（只有 Town Info），另外五个是文档第 148-168 行表格里的五种相位内容。 */
export type GrimoireCorePhase = 'idle' | 'night' | 'day-timer' | 'day-vote' | 'dusk' | 'dawn'

/** 没有数据源时统一写这个字符，绝不用 0 顶替。 */
export const CORE_UNKNOWN = '—'

/** 相位块的可访问名。核里同时挂着 Town Info 与相位块，读屏需要知道自己进了哪一块。 */
export const CORE_PHASE_LABEL: Record<Exclude<GrimoireCorePhase, 'idle'>, string> = {
  night: '夜序',
  'day-timer': '白天计时',
  'day-vote': '计票',
  dusk: '黄昏交接',
  dawn: '黎明播报',
}

/**
 * 「待处理」这一格的措辞随相位变化：夜里待处理的是夜序项，白天待处理的是白天步骤。
 * 一句「本阶段待处理」在两种语境下都对，但都不够快——说书人得先想一下现在是哪个阶段。
 */
export const CORE_PENDING_LABEL: Record<GrimoireCorePhase, string> = {
  idle: '本阶段待处理',
  night: '本夜待处理',
  'day-timer': '本白天待处理',
  'day-vote': '本白天待处理',
  dusk: '本夜待处理',
  dawn: '本白天待处理',
}

/** 核只需要画出一枚 RoleDisc 所需的三样东西，不需要 roleId，也不该拿到 roleId。 */
export interface CoreRoleFace {
  name: string
  initial: string
  imageSrc?: string
}

export interface NightCursorItem {
  seatId: number
  /** 该项要唤醒的角色面。遮蔽由核自己判定：传进来不等于会进 DOM。 */
  role: CoreRoleFace | null
}

export interface GrimoireNightCursor {
  current: NightCursorItem | null
  next: NightCursorItem | null
  /** ‹ 的座位号标签来源。没有上一项时按钮禁用而不是消失——位置恒定比少一个键重要。 */
  previousSeatId?: number | null
  onStepBack?: () => void
  onStepForward?: () => void
}

export interface GrimoireDayTimer {
  /** 剩余秒数，可为负（超时）。null = 没有计时源。 */
  remainingSeconds: number | null
  /** 「私聊」「公聊」这类阶段名。 */
  phaseName?: string
  /** null = 说书人没记过这一步，显示「—」而不是猜「还不能提名」。 */
  nominationsOpen?: boolean | null
}

export interface GrimoireVoteTally {
  /** 举手数。null = 还没进计票子态。 */
  raised: number | null
  /** 说书人手改过门槛时以传入值为准；不传则按存活数算。 */
  threshold?: number | null
  nomineeSeatId?: number | null
}

export interface GrimoireDuskBrief {
  /** 上一天的结论回执，例如「处决 5 号」。null = 没录过。 */
  dayOutcome: string | null
  /** 本夜队列预览。元素是角色名，因此在遮蔽态下只报枚数。 */
  nightQueue: readonly string[]
}

export interface GrimoireDawnRoll {
  /** null = 昨夜生死尚未录入；[] = 说书人确认过的平安夜。这两件事不是同一件事。 */
  deaths: readonly number[] | null
  revivals?: readonly number[]
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export interface ClockReadout {
  text: string
  overtime: boolean
}

/**
 * mm:ss。超时不夹回 00:00：夹了之后「刚好到点」与「超了三分钟」长得一模一样，
 * 而这两种情况说书人要做的事完全不同（一个催场，一个直接收）。
 */
export function clockReadout(remainingSeconds: number | null | undefined): ClockReadout {
  if (remainingSeconds === null || remainingSeconds === undefined || !Number.isFinite(remainingSeconds)) {
    return { text: CORE_UNKNOWN, overtime: false }
  }
  const whole = Math.trunc(remainingSeconds)
  const overtime = whole < 0
  const total = Math.abs(whole)
  return { text: `${overtime ? '-' : ''}${pad(Math.floor(total / 60))}:${pad(total % 60)}`, overtime }
}

export interface VoteTallyReadout {
  raised: number
  threshold: number
  /** 还差几票。达标后是 0，不是负数——负数会被读成「超了几票」，那是另一个意思。 */
  gap: number
}

/**
 * 举手 N / 门槛 M / 差 X。
 * 返回值里没有 passed、没有 onTheBlock、没有 winner：这三个数是给人看的，不是给流程用的。
 */
export function voteTallyReadout(raised: number, threshold: number): VoteTallyReadout {
  return { raised, threshold, gap: Math.max(0, threshold - raised) }
}
