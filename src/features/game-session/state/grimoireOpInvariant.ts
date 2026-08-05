import type { PlayerState } from '../types'
import type { GrimoireOp } from '../model/grimoireOp'
import { grimoireOpMutableFields } from '../model/grimoireOp'

/**
 * 「电子魔典滑向规则引擎」这条最高风险的可执行形式。
 *
 * 它不会以「我们来做个规则引擎吧」的形式出现，而是一连串体贴的小优化：
 * 加中毒标记顺手把 poisoned 置真、确认夜杀顺手把人标死。这些都不需要改 reducer，
 * 只要构造 action 的组件里多改一个字段就成立，任何静态检查都抓不到——
 * 因为越界发生在数据里，不在语法里。
 *
 * 所以把判据变成运行时可比对的东西：一条 op 声明了自己叫什么，
 * after 与 before 的差异字段集就必须是这个名字的字面子集。
 */

export interface GrimoireOpInvariantInput {
  /** 被改的座位，用于校验 op 说的座位就是被改的那个。 */
  seatId: number
  before: PlayerState
  after: PlayerState
  /** 缺省 = 旧写入路径，不受本不变量约束（裁决 4 只约束带 ops 的写入）。 */
  ops?: GrimoireOp[]
}

export type GrimoireOpViolationCode = 'ops_not_single' | 'seat_mismatch' | 'field_out_of_scope'

export interface GrimoireOpViolation {
  code: GrimoireOpViolationCode
  message: string
}

/**
 * 纯函数，无副作用，可在任何地方复用（reducer 断言、测试、将来的导入校验）。
 * 返回 null = 合法。
 */
export function checkGrimoireOpInvariant(input: GrimoireOpInvariantInput): GrimoireOpViolation | null {
  const ops = input.ops
  if (ops === undefined) return null

  // 类型上保留数组是为了将来，但魔典路径上恒为 1。
  // 一旦允许两条，「加中毒标记」和「置 poisoned=true」就能合法地待在同一条 entry 里，
  // 级联写入从此有了一个通过评审的外壳。空数组同样越界：填了字段却没有意图，等于没填。
  if (ops.length !== 1) {
    return { code: 'ops_not_single', message: `一次手势必须恰好产生一条 op，本次是 ${ops.length} 条；多座位同手势请按座位各写一条 entry 共用 batchId` }
  }

  const op = ops[0]
  if (!opCoversSeat(op, input.seatId)) {
    return { code: 'seat_mismatch', message: `op「${op.op}」描述的不是座位 ${input.seatId}——记录与实际改动对不上账` }
  }

  const allowed = grimoireOpMutableFields(op) as readonly string[]
  const outOfScope = changedPlayerStateFields(input.before, input.after).filter((field) => !allowed.includes(field))
  if (outOfScope.length > 0) {
    const allowedText = allowed.length > 0 ? allowed.join('、') : '（无）'
    return {
      code: 'field_out_of_scope',
      message: `op「${op.op}」只允许改 ${allowedText}，本次却改了 ${outOfScope.join('、')}——这是级联写入`,
    }
  }

  return null
}

/**
 * 唯一写入路径上的运行时断言。
 *
 * 选 console.error 而不是抛错，理由是这条不变量保护的是审计链的诚实性，不是数据的可用性：
 * 在牌桌上抛错会让说书人这一次改动整个丢失，而「记录完整性是产品本体」——
 * 宁可留下一条越界但完整的记录，也不能因为记录不好看就把说书人的操作扔掉。
 * 真正的拦截点是 CI 里穷尽的单测；开发态刷屏只是把漂移在合入前推到眼前，
 * 与 Card.tsx 的过深嵌套护栏用的是同一套办法。
 */
export function assertGrimoireOpInvariant(input: GrimoireOpInvariantInput): void {
  if (!import.meta.env.DEV) return
  const violation = checkGrimoireOpInvariant(input)
  if (!violation) return
  console.error(
    `[grimoire-op] 座位 ${input.seatId}：${violation.message}\n`
    + '一次手势 = 恰好一条 player_state_changed，ops 长度恒为 1，系统不得因一条 op 派生第二条 op。\n'
    + '需要同时改另一个字段时，那是说书人的第二次显式操作，另发一条 confirm-player-state-change。',
  )
}

/** token_moved 天然横跨两个座位；按裁决 4 它拆成两条 entry，每条的座位必须是这两端之一。 */
function opCoversSeat(op: GrimoireOp, seatId: number): boolean {
  if (op.op === 'token_moved') return op.fromSeatId === seatId || op.toSeatId === seatId
  return op.seatId === seatId
}

/**
 * 取并集而不是只遍历 before 的键：新增一个字段（after 有、before 没有）同样是改动，
 * 只看 before 会让「悄悄多写一个字段」这种最典型的越界形态直接隐身。
 */
function changedPlayerStateFields(before: PlayerState, after: PlayerState): string[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])
  return [...keys].filter((key) => !deepEqual(
    (before as Record<string, unknown>)?.[key],
    (after as Record<string, unknown>)?.[key],
  ))
}

/**
 * 本地实现而不是复用 playerStateReducer 里的同名逻辑：那个是模块私有的，
 * 且它服务的是「有没有变化」这个判等，语义一旦分家（例如将来要忽略某些字段）
 * 两边应当独立演进，而不是被迫共用一个会被改坏的定义。
 * 缺失键与显式 undefined 视为相等，否则新增可选字段会把所有旧记录判成「改过」。
 */
function deepEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    return left.every((item, index) => deepEqual(item, right[index]))
  }
  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const definedKeys = (value: object) => Object.keys(value).filter((key) => (value as Record<string, unknown>)[key] !== undefined)
    const leftKeys = definedKeys(left)
    const rightKeys = definedKeys(right)
    if (leftKeys.length !== rightKeys.length) return false
    return leftKeys.every((key) => deepEqual((left as Record<string, unknown>)[key], (right as Record<string, unknown>)[key]))
  }
  return false
}
