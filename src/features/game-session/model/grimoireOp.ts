import type { RoleTeam } from '../../../domain/scripts'
import type { ImpairmentState, LifeState, ManualStatusMarker, RoleSnapshot } from '../../night-workbench/types'
import type { PlayerState } from './playerTypes'

/**
 * 善恶阵营。仓库此前没有这个类型——阵营从未进过 PlayerState，现在也不进
 * （裁决 8：G1/G2 新增 PlayerState 字段 = 0）。它只出现在 op 的意图描述里。
 */
export type Alignment = 'good' | 'evil'

/**
 * 一次魔典手势的「意图描述」。
 * 它不是命令、永远不会被重放执行；权威事实始终是 before/after 两份完整快照。
 * 这样旧归档（没有 ops）与新归档投影出的当前局面完全一致。
 *
 * 设计文档里的 ReminderToken 与 RoleType 在这里写成 ManualStatusMarker 与 RoleTeam：
 * 裁决 9 要求就地放宽既有类型而不是另立平行类型，两个名字各只能有一个真身。
 */
export type GrimoireOp =
  | { op: 'token_added'; seatId: number; token: ManualStatusMarker }
  | { op: 'token_removed'; seatId: number; tokenId: string; tokenLabel: string }
  /** 跨座位移动：按裁决 4 拆成两条 entry（原座位删、新座位加）共用一个 batchId，不是一条 entry 改两个座位。 */
  | { op: 'token_moved'; fromSeatId: number; toSeatId: number; tokenId: string }
  | { op: 'token_inverted'; seatId: number; tokenId: string; inverted: boolean }
  | { op: 'life_set'; seatId: number; life: LifeState }
  | { op: 'impairment_set'; seatId: number; impairment: ImpairmentState; value: boolean }
  | { op: 'alignment_set'; seatId: number; alignment: Alignment; inverted: boolean }
  | { op: 'perceived_role_set'; seatId: number; role: RoleSnapshot | null }
  | { op: 'role_type_override_set'; seatId: number; roleType: RoleTeam | null }
  | { op: 'madness_issued'; seatId: number; directiveId: string }
  | { op: 'madness_lifted'; seatId: number; directiveId: string }
  | { op: 'ghost_vote_set'; seatId: number; available: boolean }
  | { op: 'private_note_set'; seatId: number } // 只记「改过」，不把私有笔记正文复制进记录标题

/** 所有 op 判别值，供穷尽性测试与调试文案使用。 */
export type GrimoireOpKind = GrimoireOp['op']

/**
 * 这条 op 按它自己的名字，最多允许 PlayerState 的哪几个字段发生变化。
 *
 * 这是「电子魔典滑向规则引擎」这条最高风险的可执行形式。级联写入不会以
 * 「我们来做个规则引擎吧」的形式出现，而是构造 action 的组件里顺手多改一个字段：
 * 加中毒标记顺手把 poisoned 置真、确认夜杀顺手把人标死。reducer 不需要改一行就成立，
 * 静态检查也抓不到。所以把「名字之外的字段不许动」变成一张可测的表，
 * 由 grimoireOpInvariant 在唯一写入路径上比对。
 */
export function grimoireOpMutableFields(op: GrimoireOp): readonly (keyof PlayerState)[] {
  switch (op.op) {
    case 'token_added':
    case 'token_removed':
    case 'token_moved':
    case 'token_inverted':
      // 标记只是贴纸：摆一张纸不得同时改生死毒醉。
      return ['markers']
    case 'life_set':
      return ['life']
    case 'impairment_set':
      // 用 op 自带的 impairment 而不是 ['poisoned', 'drunk']：中毒和醉酒是两件事，
      // 放宽成两个字段就允许「记录说改醉酒、实际改的是中毒」这种对不上账的写入。
      return [op.impairment]
    case 'alignment_set':
    case 'perceived_role_set':
    case 'role_type_override_set':
    case 'madness_issued':
    case 'madness_lifted':
    case 'ghost_vote_set':
    case 'private_note_set':
      // 这几类在 G2 没有任何合法写入目标：阵营、认知角色、角色类型覆盖、疯狂、幽灵票、
      // 私有笔记都不在 PlayerState 上（裁决 8 整批推到 G4，且允许永不实现）。
      // 返回空集 = 带这类 op 的状态变更一律判越界。这比默默放行安全：
      // 字段还没做出来就先有人写值，写进去的东西没有任何投影会读，只会变成假的审计链。
      return []
  }
}
