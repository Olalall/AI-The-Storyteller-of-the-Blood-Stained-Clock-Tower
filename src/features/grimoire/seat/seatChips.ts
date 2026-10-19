/**
 * 座位卫星 chip 的组装：已落盘的状态 + 尚未落盘的草稿幽灵。
 *
 * 抽成纯函数是因为这里有两条容易在组件里被搅在一起的规则：
 *
 * 1. **遮蔽**。chip 的 label 本身就是角色信息（「僧侣保护」暴露场上有僧侣及其今晚保了谁），
 *    L1 下一律不进 DOM，只留无字圆点与计数。草稿幽灵同样受这条约束——
 *    「AI 建议给他加红鲱鱼」比已落盘的红鲱鱼更敏感，它连说书人自己都还没认。
 * 2. **草稿与实体必须一眼分得开**。虚线 + 40% 不透明 + 「待确认」三重区分，
 *    且幽灵永远画在实体之后（在实体层之上）。幽灵做得像实体，
 *    就变成了「AI 已经替我改了状态」。
 */
import { foldSatellites } from '../layout/satelliteArc'
import type { ManualStatusMarker } from '../../night-workbench/types'
import type { PlayerState } from '../../game-session/model/playerTypes'
import type { SeatDraftSource } from '../write/seatDraft'

export type SeatChipKind = 'poisoned' | 'drunk' | 'marker' | 'fold'

/** 一枚尚未落盘的草稿在环上的形态。 */
export interface SeatGhostChip {
  key: string
  /** 幽灵要表达的那句话，例如「毒」「亡」「红鲱鱼」。L1 下不进 DOM。 */
  label: string
  source: SeatDraftSource
}

export interface SeatChip {
  key: string
  kind: SeatChipKind
  /** L2 才进 DOM；L1 下为 null，chip 只是一枚无字圆点。 */
  label: string | null
  foldedCount?: number
  /** 草稿幽灵：虚线、40% 不透明、带「待确认」。 */
  draft?: boolean
  /** AI 来源的幽灵额外带一枚 ✨ 角标。说书人自己的草稿没有角标。 */
  fromAI?: boolean
  /** 已落盘的具名标记才有；长按删除认的就是它。 */
  markerId?: string
}

/** 顺序恒定 中毒 → 醉酒 → 具名标记 → 草稿幽灵，与 PlayerStatusBar 一致：靠位置记比靠读字快。 */
export function seatChips(
  state: PlayerState,
  markerDetail: boolean,
  ghosts: readonly SeatGhostChip[] = [],
): SeatChip[] {
  const chips: SeatChip[] = []
  if (state.poisoned) chips.push({ key: 'poisoned', kind: 'poisoned', label: '中毒' })
  if (state.drunk) chips.push({ key: 'drunk', kind: 'drunk', label: '醉酒' })
  for (const marker of state.markers as readonly ManualStatusMarker[]) {
    chips.push({
      key: `marker-${marker.id}`,
      kind: 'marker',
      label: markerDetail ? marker.label : null,
      markerId: marker.id,
    })
  }
  for (const ghost of ghosts) {
    chips.push({
      key: `ghost-${ghost.key}`,
      kind: 'marker',
      // 幽灵的文字与实体标记同一条遮蔽规则：L1 下不进 DOM。
      label: markerDetail ? ghost.label : null,
      draft: true,
      fromAI: ghost.source === 'ai',
    })
  }
  return chips
}

/**
 * 超出弧上容量的折成一枚 +N。
 *
 * 草稿幽灵不参与折叠：折进 +N 之后它就只剩一个数字，
 * 「有一条待确认的改动挂在这个座位上」这件事会彻底消失在一枚灰色圆点里。
 */
export function foldChips(chips: readonly SeatChip[]): SeatChip[] {
  const settled = chips.filter((chip) => !chip.draft)
  const drafts = chips.filter((chip) => chip.draft)
  const { visible, folded } = foldSatellites(settled.length)
  if (folded === 0) return [...settled, ...drafts]
  return [
    ...settled.slice(0, visible - 1),
    { key: 'fold', kind: 'fold', label: null, foldedCount: folded },
    ...drafts,
  ]
}
