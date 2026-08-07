/** 白天是一个时序：讨论 → 提名 → 举手 → 暂列 → 处决。同一时刻只展开一步。 */
import { voteDraftForSession } from './dayDraft'
import { hasVoteRoundDraftContent, type VoteRoundDraft } from './voteRound'
import type { DayVoteDraft, GameSessionState } from '../../game-session/types'

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

export interface DayStepContext extends DayStepInputs {
  draft: VoteRoundDraft
  /** 还开着的那个白天段。null = 此刻没有白天可写，草稿只是暂存。 */
  openDaySegmentId: string | null
  /** 本日已经有处决 / 无处决的结论。一天只有一次结论，落了就不再收票。 */
  hasResolution: boolean
  suggested: DayStep
}

/**
 * 白天时序的全部输入，一次算齐。
 *
 * 为什么要有这个函数：魔典模式下环与抽屉是两块屏，它们必须对「现在是第几步」
 * 有完全一致的判断。各自照着 session 推一遍，迟早会有一边漏掉某个条件，
 * 于是环以为在计票、抽屉还停在提名——那时说书人点一下座位，结果落在他没看着的地方。
 */
export function projectDayStepContext(session: GameSessionState): DayStepContext {
  const draft = voteDraftForSession(session)
  const openDaySegmentId = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)?.id ?? null
  const inputs: DayStepInputs = {
    hasRecordedRound: session.timeline.some(
      (entry) => entry.kind === 'vote_round' && entry.segmentId === openDaySegmentId,
    ),
    hasUnrecordedVote: hasVoteRoundDraftContent(draft),
    nominationReady: draft.nominatorSeatId !== null && draft.nomineeSeatId !== null,
    hasVoteMarks: draft.raisedSeatIds.length > 0 || draft.ghostVoteSeatIds.length > 0,
  }
  const hasResolution = openDaySegmentId !== null && session.timeline.some(
    (entry) => entry.segmentId === openDaySegmentId && (entry.kind === 'execution' || entry.kind === 'no_execution'),
  )
  return { ...inputs, draft, openDaySegmentId, hasResolution, suggested: suggestDayStep(inputs) }
}

export function roundStatusLabel(draft: DayVoteDraft): string {
  if (draft.nominatorSeatId === null) return '待选提名人'
  if (draft.nomineeSeatId === null) return '待选被提名人'
  return `${draft.nominatorSeatId}号提名 ${draft.nomineeSeatId}号`
}
