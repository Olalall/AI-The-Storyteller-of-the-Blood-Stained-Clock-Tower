/**
 * SeatActionBar 的六格。
 *
 * 顺序是**逐字**定死的（设计文档第 172 行）：存活/死亡、中毒、醉酒、加标记、更换角色、座位卡。
 * 定死顺序不是形式主义——暗光下说书人靠位置记键，不靠读字。任何一次「把常用的挪到前面」
 * 的优化，都会让所有已经形成肌肉记忆的人在下一局里点错格，而点错的第一格是死亡。
 *
 * 前四格产生草稿（永不 dispatch），后两格是导航（进抽屉的既有全屏页）。
 * 这条分界要在类型上看得见：navigate 那两格根本没有 draftKind 可填，
 * 于是「顺手让更换角色也写一条状态记录」这种事写不出来。
 */
import type { PlayerState } from '../../game-session/model/playerTypes'
import type { SeatDraftKind } from './seatDraft'

export type SeatActionId = 'life' | 'poisoned' | 'drunk' | 'add-marker' | 'role-change' | 'seat-card'

export interface SeatActionCell {
  id: SeatActionId
  /** 键面文字。它随座位当前状态变，例如已死亡的座位第一格是「标记存活」。 */
  label: string
  /** 这一格按下去会产生哪种草稿；导航格为 null。 */
  draftKind: SeatDraftKind | null
  /** danger 色。死亡是六格里唯一不可逆感强到需要变色的一下。 */
  danger: boolean
  /** 当前状态下这一格是不是「已经处于该状态」，用于给键面画开关态。 */
  active: boolean
}

/**
 * 按座位当前状态生成六格。
 *
 * 键面写「标记死亡 / 标记存活」而不是「生死」，是因为浮层里没有第二屏可以确认
 * 「点下去会变成哪一边」；只有一个字的开关在暗光下必然被点反。
 */
export function seatActionCells(state: PlayerState): readonly SeatActionCell[] {
  const dead = state.life === 'dead'
  return [
    { id: 'life', label: dead ? '标记存活' : '标记死亡', draftKind: 'life', danger: !dead, active: dead },
    { id: 'poisoned', label: state.poisoned ? '解除中毒' : '中毒', draftKind: 'poisoned', danger: false, active: state.poisoned },
    { id: 'drunk', label: state.drunk ? '解除醉酒' : '醉酒', draftKind: 'drunk', danger: false, active: state.drunk },
    { id: 'add-marker', label: '加标记', draftKind: 'marker-add', danger: false, active: false },
    { id: 'role-change', label: '更换角色', draftKind: null, danger: false, active: false },
    { id: 'seat-card', label: '座位卡', draftKind: null, danger: false, active: false },
  ]
}

/** 长按加速器的时长。400ms 是「明确按住了」与「手指没挪开」之间那条线。 */
export const SEAT_ACTION_HOLD_MS = 400

/**
 * 长按只是加速器，永不是唯一入口。
 *
 * 设计系统禁止隐藏式长按：键盘用户与读屏用户根本到不了环上的长按，
 * 而「改一个座位的状态」是魔典模式的核心动作，不能有一条只有指头够得着的路。
 * 所以每个入口都要能回答这句话——环上 idle 单击、环上长按、抽屉里的等价路径，
 * 三条都通到同一个 seatActionCells。
 */
export const SEAT_ACTION_EQUIVALENT_PATH_LABEL = '座位操作'
