/**
 * 「点环上这个座位，现在等于什么」。
 *
 * 这一层**不改任何状态**，只回答一句话。真正改草稿的仍然是
 * nightWorkbenchReducer 的 `target` 分支——环和抽屉里那张 6 列号码网格
 * 走的是同一条 dispatch，一个字都不多。
 *
 * 那为什么还要这个函数：环上没有网格那种「按下去哪一格亮了」的即时读数，
 * 说书人和读屏都需要在**按下之前**知道这一下会发生什么（选上？取消？顶掉谁？）。
 * 把这句话算出来的规则必须与 reducer 的规则逐字一致，所以它单独成函数、
 * 单独被一条对拍测试钉住（nightTargetTap.test.ts 里拿 reducer 的真实输出当期望值）。
 *
 * 刻意拿不到生死：很多能力能选死人，「死亡座位照样可点，只标注不 disable」。
 * 这一层看不见 life，就没有人能顺手加一条「死人不能选」的分支。
 */

export interface NightTargetContext {
  /** 本项要收几个目标。0 = 这一项根本不点目标（信息类、系统步骤卡）。 */
  targetCount: number
  /** 「目标」「要保护的人」这类措辞，进提示语。 */
  targetLabel?: string
  /** 已落进草稿的目标，顺序即点击顺序。 */
  targets: readonly number[]
  /** 唯一的写入闸门，由 useNightWorkbench 自上而下压下来。这一层不自行判断。 */
  readOnly: boolean
}

export type NightSeatTap =
  /** 这一下什么都不会发生，reason 是要念给说书人听的原因。 */
  | { kind: 'blocked'; reason: string }
  | { kind: 'select'; seatId: number }
  | { kind: 'deselect'; seatId: number }
  /** 目标已满，这一下会把最早点的那个（些）顶出去。 */
  | { kind: 'replace'; seatId: number; evicted: readonly number[] }

function label(context: NightTargetContext): string {
  return context.targetLabel ?? '目标'
}

/**
 * 与 reducer 的 `target` 分支同构：
 * `exists ? without : [...without, seatId].slice(-targetCount)`。
 *
 * 这里把那一行的三种后果分开命名，好让环上有话可说；计算结果本身仍然不产出，
 * 免得出现第二份「下一刻的 targets 是什么」的真值。
 */
export function nightSeatTap(context: NightTargetContext, seatId: number): NightSeatTap {
  if (context.readOnly) return { kind: 'blocked', reason: '本项此刻只读，点座位不写任何东西' }
  if (context.targetCount <= 0) return { kind: 'blocked', reason: `本项不点${label(context)}` }
  if (context.targets.includes(seatId)) return { kind: 'deselect', seatId }

  const without = context.targets.filter((id) => id !== seatId)
  // slice(-n) 保留末 n 个，所以被顶掉的是**最早点的**那几个。
  // 用同一个算式而不是「满了就顶掉第 0 个」：targets 长度理论上可能超过 targetCount
  // （换过角色、targetCount 被改小），那时会一次顶掉多个，写死 1 个就对不上了。
  const evicted = [...without, seatId].slice(0, Math.max(0, without.length + 1 - context.targetCount))
  if (evicted.length === 0) return { kind: 'select', seatId }
  return { kind: 'replace', seatId, evicted }
}

/**
 * 进 GrimoireSeat 可访问名的那句「此刻点下去等于什么」。
 * 环上一个座位就是一颗键，读屏用户在按下前只能听到这句。
 */
export function nightSeatTapHint(context: NightTargetContext, seatId: number): string {
  const tap = nightSeatTap(context, seatId)
  if (tap.kind === 'blocked') return tap.reason
  if (tap.kind === 'deselect') return `取消选为${label(context)}`
  if (tap.kind === 'replace') return `选为${label(context)}，替换${tap.evicted.map((id) => `${id}号`).join('、')}`
  return `选为${label(context)}`
}

/**
 * 抽屉里那一行回显：「已选：5号 ✕」。
 *
 * 返回的是**已选目标的进度**而不是一句成品文案，因为同一份数据在抽屉里是可点的 chip、
 * 在读屏里是一句话、在环上是虚线描边——三处各自成句，共用一份事实。
 */
export interface NightTargetEchoState {
  targets: readonly number[]
  targetCount: number
  label: string
  /** 还差几个。够了是 0，不是负数。 */
  remaining: number
}

export function nightTargetEchoState(context: NightTargetContext): NightTargetEchoState {
  return {
    targets: context.targets,
    targetCount: context.targetCount,
    label: label(context),
    remaining: Math.max(0, context.targetCount - context.targets.length),
  }
}
