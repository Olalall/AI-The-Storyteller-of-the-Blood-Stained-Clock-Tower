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

export type GrimoireOpViolationCode =
  | 'ops_not_single'
  | 'seat_mismatch'
  | 'field_out_of_scope'
  | 'value_mismatch'
  | 'no_change'

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
  const changed = changedPlayerStateFields(input.before, input.after)

  // 只校验「改了哪几个字段」是不够的：life_set{life:'dead'} 配 after.life='alive'
  // 会顺利通过——记录写着「我把他标死了」，实际把人标活了。
  // 审计链的价值全在于记录与事实一致，字段对得上而值对不上是最坏的一种不一致：
  // 它看起来像一条正常记录，只有把两边逐字比对才看得出来。
  const valueMismatch = describeValueMismatch(op, input.after)
  if (valueMismatch) {
    return { code: 'value_mismatch', message: valueMismatch }
  }

  // 声明了意图却什么都没改：要么手势没生效，要么记录是凭空写的。
  // 两种都该在合入前被看见。token_moved 例外——它拆成两条 entry，
  // 移出的那一端 markers 变、移入的那一端也变，但用同一个 op 描述。
  if (changed.length === 0 && allowed.length > 0) {
    return { code: 'no_change', message: `op「${op.op}」声明改了 ${allowed.join('、')}，但 before 与 after 完全相同——记录与事实对不上账` }
  }

  const outOfScope = changed.filter((field) => !allowed.includes(field))
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
 * confirm-player-state-change 路径上的运行时断言。
 *
 * 注意它**不是**唯一写入路径：daySessionReducer 的 confirm-day-execution 也构造
 * player_state_changed（确认处决时直接写死亡），那条路径不带 ops、也不经过这里。
 * 文档第 1074 行称「唯一的写入路径」，与实现不符——那是既存偏差，记在这里以免被复制传播。
 *
 * 选 console.error 而不是抛错，理由是这条不变量保护的是审计链的诚实性，不是数据的可用性：
 * 在牌桌上抛错会让说书人这一次改动整个丢失，而「记录完整性是产品本体」——
 * 宁可留下一条越界但完整的记录，也不能因为记录不好看就把说书人的操作扔掉。
 * 真正的拦截点是 CI 里穷尽的单测；开发态刷屏只是把漂移在合入前推到眼前，
 * 与 Card.tsx 的过深嵌套护栏用的是同一套办法。
 */
export function assertGrimoireOpInvariant(input: GrimoireOpInvariantInput): void {
  // console.error 是一次副作用，严格说它让 reducer 不再是纯函数。
  // 接受这个代价的理由：它只在开发态发生、不改变任何返回值、不影响回放，
  // 而它换来的是漂移在合入前就被看见。生产态整段跳过，纯度完全恢复。
  if (!import.meta.env.DEV) return
  const violation = checkGrimoireOpInvariant(input)
  if (!violation) return
  console.error(
    `[grimoire-op] 座位 ${input.seatId}：${violation.message}\n`
    + '一次手势 = 恰好一条 player_state_changed，ops 长度恒为 1，系统不得因一条 op 派生第二条 op。\n'
    + '需要同时改另一个字段时，那是说书人的第二次显式操作，另发一条 confirm-player-state-change。',
  )
}

/**
 * op 自称改成了什么值，after 里就必须是那个值。
 * 只对「op 里带了目标值」的那几种成立；带 tokenId 之类引用的另说。
 */
function describeValueMismatch(op: GrimoireOp, after: PlayerState): string | null {
  if (op.op === 'life_set' && after.life !== op.life) {
    return `op「life_set」写的是 ${op.life}，after 里却是 ${after.life}`
  }
  if (op.op === 'impairment_set') {
    const actual = op.impairment === 'poisoned' ? after.poisoned : after.drunk
    if (actual !== op.value) {
      return `op「impairment_set」写的是 ${op.impairment}=${op.value}，after 里却是 ${actual}`
    }
  }
  if (op.op === 'token_added' && !after.markers.some((marker) => marker.id === op.token.id)) {
    return `op「token_added」写的是标记 ${op.token.id}，但 after 的标记里没有它`
  }
  if (op.op === 'token_removed' && after.markers.some((marker) => marker.id === op.tokenId)) {
    return `op「token_removed」写的是移除标记 ${op.tokenId}，但它还在 after 里`
  }
  return null
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
