import type { DayActionEntry } from './dayTypes'
import type { NightActionEntry } from './nightTypes'
import type { PlayerStateChangedEntry } from './playerTypes'
import type { SetupChangedEntry, SetupConfirmedEntry } from './setupTypes'
import type { TimelineBase } from './timelineBaseTypes'
import type { AbilityChangedEntry } from './abilityTypes'

export interface VoteRoundEntry extends TimelineBase {
  kind: 'vote_round'
  roundId: string
  nominatorSeatId: number
  nomineeSeatId: number
  threshold: number
  raisedSeatIds: number[]
  ghostVoteSeatIds: number[]
  voteAdjustment?: { count: number; reason: string }
  /** 撤销也追加同一条更正链，原票型始终保留。 */
  voided?: boolean
}

export interface ExecutionEntry extends TimelineBase {
  kind: 'execution' | 'no_execution'
  executedSeatId?: number
  /**
   * 处决是否造成死亡。百科《处决》明确二者可分离：被处决者可因弄臣、魔鬼代言人、
   * 精神病患者等能力存活；已死亡玩家也可被提名处决（仍消耗当天唯一的处决机会）。
   * 省略时按 true 解读，兼容此字段之前的历史归档。
   */
  causedDeath?: boolean
  /** 说书人显式确认的特殊处决依据；省略表示普通票面处决。 */
  exceptionReason?: string
}

export type TimelineEntry =
  | AbilityChangedEntry
  | SetupConfirmedEntry
  | SetupChangedEntry
  | PlayerStateChangedEntry
  | NightActionEntry
  | DayActionEntry
  | VoteRoundEntry
  | ExecutionEntry
