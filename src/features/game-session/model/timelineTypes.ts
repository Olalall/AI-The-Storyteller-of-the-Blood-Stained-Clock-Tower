import type { DayActionEntry } from './dayTypes'
import type { NightActionEntry } from './nightTypes'
import type { PlayerStateChangedEntry } from './playerTypes'
import type { SetupChangedEntry, SetupConfirmedEntry } from './setupTypes'
import type { TimelineBase } from './timelineBaseTypes'

export interface VoteRoundEntry extends TimelineBase {
  kind: 'vote_round'
  roundId: string
  nominatorSeatId: number
  nomineeSeatId: number
  threshold: number
  raisedSeatIds: number[]
  ghostVoteSeatIds: number[]
}

export interface ExecutionEntry extends TimelineBase {
  kind: 'execution' | 'no_execution'
  executedSeatId?: number
}

export type TimelineEntry =
  | SetupConfirmedEntry
  | SetupChangedEntry
  | PlayerStateChangedEntry
  | NightActionEntry
  | DayActionEntry
  | VoteRoundEntry
  | ExecutionEntry
