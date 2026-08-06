/**
 * 补录建议卡的数据层。
 *
 * 边界先说清楚，因为这一块离「自动结算」只有一步之遥：
 *
 * - 它**不判定**任何事。每张卡都是「这条记录里出现了『处决』两个字，而 7 号现在还活着——
 *   要不要标一下」，来源逐条显式引用，说书人一眼能看出建议是从哪句话来的。
 * - **没有「全部应用」**。批量按钮会让人不看内容直接按下去，那一刻工具就替说书人
 *   裁定了一整局的生死。逐条可跳过，跳完不影响使用。
 * - 数据源只有 grimoireCompleteness 的 pendingStateHintList 一处。另写一套启发式，
 *   提示条上的数字与这里列出的卡片会对不上，而说书人正是点着那个数字进来的。
 *
 * 已经对得上的不出卡：记录说「处决」而 7 号已经是死亡态时，这条账本来就平了，
 * 再出一张卡只会让人按一下、写一条 before 与 after 相同的记录（reducer 会静默拒绝）。
 */
import type { PlayerState, PlayerStateBackfill } from '../../game-session/model/playerTypes'
import type { GameSessionState } from '../../game-session/types'
import type { SeatStateDraft } from '../write/seatDraft'
import type { GrimoireCompleteness, PendingStateHint, StateWord } from '../completeness/grimoireCompleteness'

/** 状态词 → 这条记录宣称的是哪个字段变成了什么。 */
interface SuggestedChange {
  kind: 'life' | 'poisoned' | 'drunk'
  /** 目标值。life 用 'dead' / 'alive'，毒醉用布尔。 */
  to: 'dead' | 'alive' | true
  text: string
  danger: boolean
}

const SUGGESTION: Record<StateWord, SuggestedChange> = {
  死亡: { kind: 'life', to: 'dead', text: '标记为死亡', danger: true },
  死去: { kind: 'life', to: 'dead', text: '标记为死亡', danger: true },
  处决: { kind: 'life', to: 'dead', text: '标记为死亡', danger: true },
  复活: { kind: 'life', to: 'alive', text: '标记为存活', danger: false },
  中毒: { kind: 'poisoned', to: true, text: '加中毒', danger: false },
  下毒: { kind: 'poisoned', to: true, text: '加中毒', danger: false },
  醉酒: { kind: 'drunk', to: true, text: '加醉酒', danger: false },
}

export interface BackfillCard {
  id: string
  seatId: number
  /** 「第3夜 · 记录提到 3号被恶魔选中 · 建议标记为死亡」。 */
  message: string
  danger: boolean
  draft: SeatStateDraft
  /** 自动填的理由，进 PlayerStateChangedEntry.reason。 */
  reason: string
  backfill: PlayerStateBackfill
}

/** 这条建议是不是已经没事可做了（现状已经等于建议值）。 */
function alreadySettled(change: SuggestedChange, state: PlayerState): boolean {
  if (change.kind === 'life') return state.life === change.to
  return state[change.kind] === true
}

export function projectBackfillCards(
  session: GameSessionState,
  completeness: GrimoireCompleteness,
  playerStates: Readonly<Record<number, PlayerState>>,
): readonly BackfillCard[] {
  const labelOf = (segmentId: string | null) =>
    session.phaseSegments.find((segment) => segment.id === segmentId)?.label ?? null

  return completeness.pendingStateHintList.flatMap((hint) => hintCards(hint, playerStates, labelOf))
}

function hintCards(
  hint: PendingStateHint,
  playerStates: Readonly<Record<number, PlayerState>>,
  labelOf: (segmentId: string | null) => string | null,
): BackfillCard[] {
  const change = SUGGESTION[hint.word]
  const phaseLabel = labelOf(hint.segmentId)
  // 没有相位段就没有归属可写。backfill.attributedPhaseSegmentId 是必填的，
  // 编一个段号进去等于给复盘埋一条指向不存在段落的引用——那比不出这张卡更坏。
  if (!hint.segmentId || !phaseLabel) return []

  return hint.seatIds.flatMap((seatId) => {
    const state = playerStates[seatId]
    if (!state || alreadySettled(change, state)) return []
    return [{
      id: `${hint.entryId}-${seatId}-${change.kind}`,
      seatId,
      message: `${phaseLabel} · 记录提到「${hint.summary}」· 建议给 ${seatId}号 ${change.text}`,
      danger: change.danger,
      draft: { seatId, kind: change.kind, source: 'storyteller' } satisfies SeatStateDraft,
      reason: `魔典补录 · 依据 ${phaseLabel} 记录 ${hint.entryId}`,
      backfill: { attributedPhaseSegmentId: hint.segmentId, sourceEntryId: hint.entryId },
    }]
  })
}
