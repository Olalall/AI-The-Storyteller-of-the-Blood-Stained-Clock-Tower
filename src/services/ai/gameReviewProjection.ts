import { projectStorytellerSeatSummaries } from '../../features/game-session/state/projectors'
import type { GameArchiveRecord } from '../archive'
import type { GameAIPlayerReview, GameAIReviewDraft } from './types'
import { gameReviewEvidence, keyGameReviewEvidence, reviewMissingInformation } from './gameReviewEvidence'

function playerActivity(archive: GameArchiveRecord) {
  const activityBySeat = new Map<number, number>()
  const setupIds = new Set(archive.session.timeline.filter((entry) => entry.kind === 'setup_confirmed').map((entry) => entry.id))
  for (const entry of gameReviewEvidence(archive).filter((item) => !item.superseded && !item.voided && !setupIds.has(item.recordId))) {
    entry.seatIds.forEach((seatId) => activityBySeat.set(seatId, (activityBySeat.get(seatId) ?? 0) + 1))
  }
  return activityBySeat
}

function noteFor(activity: number) {
  if (activity >= 5) return '日志关联记录多，适合核对这些记录与现场语境。'
  if (activity >= 2) return '有明确行动记录，可结合现场记忆补充判断。'
  return '日志信息偏少，评分可信度较低。'
}

function roastFor(activity: number, isAlive: boolean) {
  if (activity >= 5) return '镜头很多，锅也容易很多；复盘先查这里，基本不亏。'
  if (activity >= 2) {
    return isAlive
      ? '日志镜头够开个小剧场，精彩程度还得问现场。'
      : '记录里有戏份，退场后的故事得靠大家补讲。'
  }
  return isAlive
    ? '日志镜头少，可能只是摄影师忘了开机；先不评价表现。'
    : '记录给的镜头不够，故事还得听本人补充。'
}

function scorePlayers(archive: GameArchiveRecord): GameAIPlayerReview[] {
  const seats = projectStorytellerSeatSummaries(archive.session)
  const activityBySeat = playerActivity(archive)

  return seats.map((seat) => {
    const activity = activityBySeat.get(seat.seatId) ?? 0
    const survivedBonus = seat.state.life === 'alive' ? 4 : 0
    const score = Math.max(55, Math.min(92, 62 + activity * 4 + survivedBonus))
    const keyEvents = gameReviewEvidence(archive).filter((entry) => !entry.superseded && !entry.voided && entry.seatIds.includes(seat.seatId))
      .slice(0, 3)
      .map((entry) => `${entry.phaseLabel}：${entry.fact}［${entry.recordId}］`)

    return {
      seatId: seat.seatId,
      name: seat.nickname || `${seat.seatId}号`,
      roleName: seat.role?.name ?? '未知身份',
      activity,
      score,
      keyEvents,
      note: noteFor(activity),
      roast: roastFor(activity, seat.state.life === 'alive'),
    }
  })
}

function gameEvaluation(archive: GameArchiveRecord) {
  const { summary } = archive
  const density = summary.records >= 12 ? '记录较完整' : summary.records >= 6 ? '记录中等' : '记录偏少'
  const vote = summary.votes >= 3 ? '白天投票链较清晰' : '投票样本较少'
  const correctionCount = archive.session?.timeline
    ? archive.session.timeline.filter((entry) => Boolean(entry.correctionOf)).length : summary.corrections
  const correction = correctionCount > 0
    ? `出现${correctionCount}条更正（含撤销），可结合原因核对当时的记录和操作。`
    : '没有更正记录，仍需结合现场核对。'
  return { density, vote, correction }
}

function fullReviewFor(archive: GameArchiveRecord) {
  const turningPoints = keyGameReviewEvidence(archive).map((entry) => `${entry.phaseLabel}：${entry.fact}［${entry.recordId}］`)
  return {
    summary: `本局共有 ${archive.summary.records} 条记录。建议先按夜晚行动、白天提名、最终处决三段回看，再用现场记忆补足发言动机。`,
    turningPoints: turningPoints.length ? turningPoints : ['暂无足够日志，建议补充说书人手工备注。'],
    suggestedReplayOrder: ['配板与身份', '夜间行动', '白天提名与投票', '处决与胜负声明'],
  }
}

export function createLocalGameReviewDraft(archive: GameArchiveRecord): GameAIReviewDraft {
  const playerScores = scorePlayers(archive)
  return {
    provider: 'fake',
    source: 'local',
    disclaimer: '本地草稿只基于已保存日志，不是客观玩家能力评分。',
    keyEvents: keyGameReviewEvidence(archive),
    interpretations: [],
    missing: [...reviewMissingInformation],
    evaluation: gameEvaluation(archive),
    fullReview: fullReviewFor(archive),
    playerScores,
    topPlayers: [...playerScores].sort((left, right) => right.score - left.score).slice(0, 4),
  }
}
