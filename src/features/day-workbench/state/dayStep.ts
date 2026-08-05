/** 白天是一个时序：讨论 → 提名 → 举手 → 暂列 → 处决。同一时刻只展开一步。 */
import type { DayVoteDraft } from '../../game-session/types'

export type DayStep = 'discussion' | 'nomination' | 'vote' | 'standing'

export interface DayStepInputs {
  hasRecordedRound: boolean
  hasUnrecordedVote: boolean
  nominationReady: boolean
  hasVoteMarks: boolean
}

/**
 * 建议展开哪一步——只是建议，说书人点摘要条随时可以回到任意一步。
 *
 * 关键在于**不自动跨越**：选完提名双方后仍停在提名步，由底栏的「下一步」显式推进。
 * 自动前进会让卡片在手指底下收起来，说书人来不及确认自己刚点了谁。
 */
export function suggestDayStep({
  hasRecordedRound,
  hasUnrecordedVote,
  nominationReady,
  hasVoteMarks,
}: DayStepInputs): DayStep {
  // 本轮已落账且没有新草稿：回到暂列，等下一次提名。
  if (hasRecordedRound && !hasUnrecordedVote) return 'standing'
  if (!nominationReady) return 'nomination'
  return hasVoteMarks ? 'vote' : 'nomination'
}

export function roundStatusLabel(draft: DayVoteDraft): string {
  if (draft.nominatorSeatId === null) return '待选提名人'
  if (draft.nomineeSeatId === null) return '待选被提名人'
  return `${draft.nominatorSeatId}号提名 ${draft.nomineeSeatId}号`
}
