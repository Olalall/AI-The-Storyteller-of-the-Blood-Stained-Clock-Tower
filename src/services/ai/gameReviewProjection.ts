import { projectStorytellerSeatSummaries } from '../../features/game-session/state/projectors'
import type { GameArchiveRecord } from '../archive'
import type { GameAIPlayerReview, GameAIReviewDraft } from './types'

function timelineItemsForSeat(archive: GameArchiveRecord, seatId: number) {
  return archive.timeline.filter((entry) => entry.summary.includes(`${seatId}号`))
}

function entrySeatIds(archive: GameArchiveRecord) {
  const idsByEntry = new Map<string, number[]>()
  for (const entry of archive.session.timeline) {
    const ids = new Set<number>()
    switch (entry.kind) {
      case 'night_action': {
        const run = archive.session.nightRuns[entry.nightRunId]
        const wakeItem = run?.queue.find((item) => item.id === entry.wakeItemId)
        if (wakeItem) ids.add(wakeItem.seatId)
        entry.record.snapshot.targets.forEach((seatId) => ids.add(seatId))
        break
      }
      case 'day_action':
        if (entry.actorSeatId) ids.add(entry.actorSeatId)
        entry.targetSeatIds.forEach((seatId) => ids.add(seatId))
        break
      case 'vote_round':
        ids.add(entry.nominatorSeatId)
        ids.add(entry.nomineeSeatId)
        entry.raisedSeatIds.forEach((seatId) => ids.add(seatId))
        entry.ghostVoteSeatIds.forEach((seatId) => ids.add(seatId))
        break
      case 'execution':
      case 'no_execution':
        if (entry.executedSeatId) ids.add(entry.executedSeatId)
        break
      case 'player_state_changed':
      case 'setup_changed':
        ids.add(entry.seatId)
        break
      case 'setup_confirmed':
        break
    }
    idsByEntry.set(entry.id, [...ids])
  }
  return idsByEntry
}

function playerActivity(archive: GameArchiveRecord) {
  const activityBySeat = new Map<number, number>()
  for (const ids of entrySeatIds(archive).values()) {
    ids.forEach((seatId) => activityBySeat.set(seatId, (activityBySeat.get(seatId) ?? 0) + 1))
  }
  return activityBySeat
}

function noteFor(activity: number) {
  if (activity >= 5) return '日志参与度高，适合重点回看关键发言。'
  if (activity >= 2) return '有明确行动记录，可结合现场记忆补充判断。'
  return '日志信息偏少，评分可信度较低。'
}

function roastFor(activity: number, isAlive: boolean) {
  if (activity >= 5) return '镜头很多，锅也容易很多；复盘先查这里，基本不亏。'
  if (activity >= 2) {
    return isAlive
      ? '有事做，但还没到改写牌局的程度，现场发言要补证。'
      : '参与过关键回合，但退场后影响力断档，像把线索留在半路。'
  }
  return isAlive
    ? '活是活下来了，但记录里像隐身；复盘别给太高确定性。'
    : '日志里存在感偏低，死亡也没留下太多可追的线。'
}

function scorePlayers(archive: GameArchiveRecord): GameAIPlayerReview[] {
  const seats = projectStorytellerSeatSummaries(archive.session)
  const activityBySeat = playerActivity(archive)

  return seats.map((seat) => {
    const activity = activityBySeat.get(seat.seatId) ?? 0
    const survivedBonus = seat.state.life === 'alive' ? 4 : 0
    const score = Math.max(55, Math.min(92, 62 + activity * 4 + survivedBonus))
    const keyEvents = timelineItemsForSeat(archive, seat.seatId)
      .slice(0, 3)
      .map((entry) => `${entry.phaseLabel}：${entry.summary}`)

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
  const correction = summary.corrections > 0
    ? `出现${summary.corrections}条更正，复盘时应重点检查误操作来源。`
    : '无更正记录，流程稳定性较好。'
  return { density, vote, correction }
}

function topTimeline(archive: GameArchiveRecord) {
  return archive.timeline
    .filter((entry) => entry.kind !== 'setup_confirmed')
    .slice(0, 6)
    .map((entry) => `${entry.phaseLabel}：${entry.summary}`)
}

function fullReviewFor(archive: GameArchiveRecord) {
  const turningPoints = topTimeline(archive)
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
    evaluation: gameEvaluation(archive),
    fullReview: fullReviewFor(archive),
    playerScores,
    topPlayers: [...playerScores].sort((left, right) => right.score - left.score).slice(0, 4),
  }
}
