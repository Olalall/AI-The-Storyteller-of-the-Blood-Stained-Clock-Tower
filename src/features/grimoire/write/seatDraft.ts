/**
 * 魔典写入的草稿模型：一次手势 → 一份草稿 → 一条 op。
 *
 * 「点一下就改」在暗光的牌桌上等于误触即改死人，所以 SeatActionBar 上的点击
 * **永不 dispatch**：它只产生这里的一份 SeatStateDraft，环上以虚线幽灵呈现，
 * 抽屉里升起一条确认横条，按下确认才落账。这个文件是那两段之间的全部逻辑，
 * 且是纯函数——草稿能不能落成一条合法记录，必须在任何组件挂载之前就可单测。
 *
 * 三条硬约束都在这里执行：
 * 1. 一份草稿只对应**一个** GrimoireOp（裁决 4）。这里的返回类型是单数 op 而不是数组，
 *    「顺手多改一个字段」在类型上就写不出来。
 * 2. after 永远由 before 加一个字段算出，不由调用方给。让调用方自己拼 after，
 *    就等于把「记录说改了什么」和「实际改了什么」交给两个人各写一遍。
 * 3. before 必须是**当前局面投影**里的那一份，作为 expectedBefore 乐观锁。
 *    段落已关闭、或状态被别处改过时，reducer 会拒绝这条写入。
 */
import type { GrimoireOp } from '../../game-session/model/grimoireOp'
import type { PlayerState, PlayerStateBackfill, PlayerStateChangedEntry } from '../../game-session/model/playerTypes'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { ManualStatusMarker } from '../../night-workbench/types'

export type SeatDraftKind = 'life' | 'poisoned' | 'drunk' | 'marker-add' | 'marker-remove'

/**
 * 草稿来源。两者在环上用**同一种**幽灵样式（虚线 + 40% 不透明 + 「待确认」），
 * 只靠一枚 ✨ 角标区分——落账后写的是同一条记录，视觉上分成两种会让人以为
 * 「AI 那种」是另一类事实。
 */
export type SeatDraftSource = 'storyteller' | 'ai'

export interface SeatStateDraft {
  seatId: number
  kind: SeatDraftKind
  /** marker-add 专用：标记文字。 */
  markerLabel?: string
  /**
   * marker-add / marker-remove 专用：标记 id。
   * add 时由草稿携带而不是落账时现生成——环上那枚幽灵 chip 和最终 op 里的
   * token.id 必须是同一个，否则「幽灵变实体」这一下在数据上是换了一枚标记。
   */
  markerId?: string
  source: SeatDraftSource
}

export interface ProjectedSeatWrite {
  seatId: number
  before: PlayerState
  after: PlayerState
  op: GrimoireOp
  /** 确认条与回执上给人看的一句话，例如「3号 标记死亡」。 */
  label: string
  /** 死亡与删除标记走 danger 色。它是不可逆感最强的两下。 */
  danger: boolean
}

/**
 * 草稿落到这个座位上会变成什么。返回 null = 这份草稿此刻无事可做，确认条不出现。
 *
 * null 的几种来源都是有意的：座位不在局面里、要删的标记已经不在了、
 * 以及 marker-add 缺 label。放过任何一种都会写出一条 before 与 after 相同的记录——
 * 它在时间线上看起来像说书人做过一次操作，实际什么都没发生。
 */
export function projectSeatDraft(draft: SeatStateDraft, before: PlayerState | undefined): ProjectedSeatWrite | null {
  if (!before) return null
  const { seatId } = draft

  if (draft.kind === 'life') {
    const life = before.life === 'alive' ? 'dead' : 'alive'
    return {
      seatId,
      before,
      after: { ...before, life },
      op: { op: 'life_set', seatId, life },
      label: `${seatId}号 ${life === 'dead' ? '标记死亡' : '标记存活'}`,
      danger: life === 'dead',
    }
  }

  if (draft.kind === 'poisoned' || draft.kind === 'drunk') {
    const value = !before[draft.kind]
    return {
      seatId,
      before,
      // 两个字面量分支而不是计算键：计算键会把 after 的类型放宽成索引签名，
      // 「改醉酒时顺手把中毒也写了」这类笔误就不再是编译错误。
      after: draft.kind === 'poisoned' ? { ...before, poisoned: value } : { ...before, drunk: value },
      op: { op: 'impairment_set', seatId, impairment: draft.kind, value },
      label: `${seatId}号 ${draft.kind === 'poisoned' ? '中毒' : '醉酒'}${value ? '' : ' 解除'}`,
      danger: false,
    }
  }

  if (draft.kind === 'marker-add') {
    const label = draft.markerLabel?.trim()
    if (!label || !draft.markerId) return null
    const token: ManualStatusMarker = { id: draft.markerId, label }
    return {
      seatId,
      before,
      after: { ...before, markers: [...before.markers, token] },
      op: { op: 'token_added', seatId, token },
      label: `${seatId}号 标记+${label}`,
      danger: false,
    }
  }

  const target = before.markers.find((marker) => marker.id === draft.markerId)
  if (!target) return null
  return {
    seatId,
    before,
    after: { ...before, markers: before.markers.filter((marker) => marker.id !== target.id) },
    op: { op: 'token_removed', seatId, tokenId: target.id, tokenLabel: target.label },
    label: `${seatId}号 标记−${target.label}`,
    danger: true,
  }
}

export interface GrimoireWriteRequest {
  projected: ProjectedSeatWrite
  /** 记入哪个段。确认条上的下拉默认取当前相位；null = 不记入任何段。 */
  segmentId: string | null
  entryId: string
  /** 真实落账时刻。补录也用真实时刻，绝不回填（见 PlayerStateBackfill 注释）。 */
  confirmedAt: string
  reason: string
  backfill?: PlayerStateBackfill
}

/**
 * 构造魔典路径上唯一的写入 action。
 *
 * ops 恒为一条、origin 恒为 'grimoire'：这两样是 grimoireOpInvariant 与归档回放
 * 认得出「这一下是在环上做的」的全部依据。任何绕开这个函数自己拼 action 的地方，
 * 都会在某次重构里悄悄丢掉其中一个。
 */
export function buildGrimoireWrite(request: GrimoireWriteRequest): Extract<GameSessionAction, { type: 'confirm-player-state-change' }> {
  const { projected } = request
  return {
    type: 'confirm-player-state-change',
    seatId: projected.seatId,
    expectedBefore: projected.before,
    after: projected.after,
    segmentId: request.segmentId,
    entryId: request.entryId,
    confirmedAt: request.confirmedAt,
    reason: request.reason,
    ops: [projected.op],
    origin: 'grimoire',
    ...(request.backfill ? { backfill: request.backfill } : {}),
  }
}

/**
 * 撤销的逆向 op。
 *
 * 撤销**不是**回滚：它追加一条新的 player_state_changed，把 after 写回原来的 before，
 * 并用 revertOf 指向被撤销的那条。投影因此回到操作前，而历史里两条都在。
 * 逆向 op 必须自己重新算，不能照抄原 op——照抄的话 grimoireOpInvariant 的值一致检查
 * 会当场判 value_mismatch（记录写着「标记死亡」，实际把人标活了）。
 *
 * 返回 null = 这条记录不是魔典写的（没有 ops）或它的 op 类型在 G2 没有合法逆向，
 * 此时撤销键不该出现，说书人只能走本局记录的更正路径。
 */
export function invertGrimoireOp(op: GrimoireOp, restored: PlayerState): GrimoireOp | null {
  if (op.op === 'life_set') return { op: 'life_set', seatId: op.seatId, life: restored.life }
  if (op.op === 'impairment_set') {
    return {
      op: 'impairment_set',
      seatId: op.seatId,
      impairment: op.impairment,
      value: op.impairment === 'poisoned' ? restored.poisoned : restored.drunk,
    }
  }
  if (op.op === 'token_added') {
    return { op: 'token_removed', seatId: op.seatId, tokenId: op.token.id, tokenLabel: op.token.label }
  }
  if (op.op === 'token_removed') {
    // 被删掉的那一枚必须能在「撤销后应有的状态」里找回来，否则重建出的 token
    // 会丢掉 sourceRoleId / placedInSegmentId，撤销之后标记就换了一张。
    const token = restored.markers.find((marker) => marker.id === op.tokenId)
    return token ? { op: 'token_added', seatId: op.seatId, token } : null
  }
  return null
}

export interface GrimoireRevertRequest {
  entry: PlayerStateChangedEntry
  /** 该座位此刻的权威状态，作为 expectedBefore。 */
  current: PlayerState | undefined
  entryId: string
  confirmedAt: string
}

/**
 * 把一条魔典写入撤销掉。返回 null = 撤不了，调用方必须据此把撤销键收起来，
 * 而不是给一颗按下去什么都不发生的键——那正是「看起来成功了」的那种失败。
 */
export function buildGrimoireRevert(request: GrimoireRevertRequest): Extract<GameSessionAction, { type: 'confirm-player-state-change' }> | null {
  const { entry, current } = request
  if (!current) return null
  // 已经被撤销过的、以及撤销本身，都不再给第二次机会：那不是撤销，是一次新的状态变更。
  if (entry.revertOf !== undefined) return null
  const op = entry.ops?.[0]
  if (!op) return null
  const inverted = invertGrimoireOp(op, entry.before)
  if (!inverted) return null
  return {
    type: 'confirm-player-state-change',
    revertOf: entry.id,
    seatId: entry.seatId,
    expectedBefore: current,
    after: entry.before,
    segmentId: entry.segmentId,
    entryId: request.entryId,
    confirmedAt: request.confirmedAt,
    reason: `撤销：${entry.reason}`,
    ops: [inverted],
    origin: 'grimoire',
  }
}
