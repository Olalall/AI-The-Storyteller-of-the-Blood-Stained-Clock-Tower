/**
 * 白天票型草稿的生命周期。
 *
 * 「暂存」不是自动保存：草稿留在 session 里是为了说书人中途退出后还能回来接着填，
 * 但它永远不会自己变成记录——落账只经由显式确认。
 */
import { createVoteRoundDraft, executionThresholdForAliveCount } from './voteRound'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import type { GameSessionState } from '../../game-session/types'

export function openDaySegmentId(session: GameSessionState) {
  return session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)?.id ?? 'day-pending'
}

export function aliveSeatCount(session: GameSessionState) {
  return Object.values(projectCurrentPlayerStates(session)).filter((state) => state.life === 'alive').length
}

export function newDraft(session: GameSessionState, threshold = executionThresholdForAliveCount(aliveSeatCount(session))) {
  return createVoteRoundDraft(openDaySegmentId(session), threshold)
}

export function voteDraftForSession(session: GameSessionState) {
  const openDayId = openDaySegmentId(session)
  const stored = session.dayVoteDraft
  if (stored && (stored.segmentId === 'day-pending' || stored.segmentId === openDayId)) return stored
  return newDraft(session)
}

export function leaveNoticeCopy(hasVoteDraft: boolean, dayActionKinds: readonly ('skill' | 'public_event')[]) {
  const actionLabel = dayActionKinds.length === 2
    ? '技能和公开事件'
    : dayActionKinds[0] === 'public_event'
      ? '公开事件'
      : '技能记录'
  if (hasVoteDraft && dayActionKinds.length) {
    return {
      title: `本轮票型与${actionLabel}已暂存`,
      description: '返回后可从本局重新进入白天，继续编辑或确认未完成记录。',
    }
  }
  if (hasVoteDraft) {
    return {
      title: '本轮票型已暂存',
      description: '返回后可从本局重新进入白天，继续记录本轮投票。',
    }
  }
  return {
    title: `${actionLabel}已暂存`,
    description: '返回后可从本局重新进入白天，继续编辑后再确认记录。',
  }
}
