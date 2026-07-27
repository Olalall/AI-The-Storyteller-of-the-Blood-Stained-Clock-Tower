import type { GameArchiveRecord } from '../../src/services/archive/types'
import type { AIReviewDraft, PlayerReviewDraft, ReviewStyle } from './types'

interface ReviewDraftOptions {
  reviewStyle?: ReviewStyle
  includePlayerScores?: boolean
  generatedAt?: string
}

function roleBySeat(archive: GameArchiveRecord) {
  const setup = archive.session.timeline.find((entry) => entry.kind === 'setup_confirmed')
  const assignments = setup?.setup.draft.assignments ?? []
  return new Map(assignments.map((assignment) => [assignment.seatId, assignment.role.name]))
}

function mentionCountBySeat(archive: GameArchiveRecord) {
  return archive.timeline.reduce<Record<number, number>>((counts, item) => {
    for (let seatId = 1; seatId <= archive.playerCount; seatId += 1) {
      if (item.summary.includes(`${seatId}号`)) counts[seatId] = (counts[seatId] ?? 0) + 1
    }
    return counts
  }, {})
}

function confidenceFor(records: number): AIReviewDraft['confidence'] {
  if (records >= 8) return 'medium'
  return 'low'
}

function scoreFor(mentions: number, includePlayerScores: boolean) {
  if (!includePlayerScores) return 0
  return Math.min(90, 45 + mentions * 10)
}

function commentFor(mentions: number) {
  if (mentions >= 4) return '日志存在感高，适合作为复盘重点。'
  if (mentions >= 2) return '留下了几处可回看的关键节点。'
  if (mentions === 1) return '有一次明确记录，复盘时需要补充发言背景。'
  return '日志痕迹较少，不能单靠记录判断表现。'
}

function sharpCommentFor(mentions: number) {
  if (mentions >= 4) return '高频上镜，但精彩还是失误要回看现场语境。'
  if (mentions >= 2) return '有戏份，但证据链还不够完整。'
  if (mentions === 1) return '只露了一下脸，复盘别硬夸也别硬喷。'
  return '记录里几乎隐身，锐评只能先按下不表。'
}

function playerReviewsFor(archive: GameArchiveRecord, style: ReviewStyle, includePlayerScores: boolean) {
  const roles = roleBySeat(archive)
  const mentions = mentionCountBySeat(archive)
  return Object.values(archive.session.seats)
    .sort((left, right) => left.seatId - right.seatId)
    .map<PlayerReviewDraft>((seat) => {
      const count = mentions[seat.seatId] ?? 0
      const basis = count
        ? [`日志中出现 ${count} 次`, `身份快照：${roles.get(seat.seatId) ?? '未知角色'}`]
        : ['日志中没有明确行动记录', `身份快照：${roles.get(seat.seatId) ?? '未知角色'}`]
      return {
        seatId: seat.seatId,
        nickname: seat.nickname,
        roleName: roles.get(seat.seatId) ?? '未知角色',
        score: scoreFor(count, includePlayerScores),
        basis,
        comment: commentFor(count),
        sharpComment: style === 'sharp' ? sharpCommentFor(count) : undefined,
        confidence: count >= 3 ? 'medium' : 'low',
      }
    })
}

function topTimeline(archive: GameArchiveRecord) {
  return archive.timeline
    .filter((item) => item.kind !== 'setup_confirmed')
    .slice(0, 6)
    .map((item) => `${item.phaseLabel}：${item.summary}`)
}

export function generateFakeReviewDraft(
  archive: GameArchiveRecord,
  options: ReviewDraftOptions = {},
): AIReviewDraft {
  const includePlayerScores = options.includePlayerScores ?? true
  const reviewStyle = options.reviewStyle ?? 'sharp'
  const records = archive.summary.records
  const confidence = confidenceFor(records)
  const highlights = [
    `${archive.summary.nightActions} 条夜间行动`,
    `${archive.summary.votes} 轮投票记录`,
    `${archive.summary.executions} 次处决记录`,
  ].filter((item) => !item.startsWith('0 '))
  const risks = [
    records < 8 ? '日志较少，玩家评语只能作为复盘提纲。' : '',
    archive.summary.corrections ? `存在 ${archive.summary.corrections} 条更正，需要复盘时说明。` : '',
  ].filter(Boolean)

  return {
    archiveId: archive.id,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    provider: 'fake',
    confidence,
    disclaimer: '本复盘草稿只基于已保存日志，不是客观玩家能力评分，也不会修改归档或当前局。',
    gameEvaluation: {
      summary: `${archive.scriptName}，${archive.playerCount} 人局，${archive.winnerLabel}。记录完整度：${confidence === 'medium' ? '可复盘' : '偏低'}。`,
      highlights: highlights.length ? highlights : ['暂无足够高置信亮点'],
      risks: risks.length ? risks : ['未发现明显记录缺口'],
    },
    fullReview: {
      summary: `本局共有 ${records} 条归档记录，可先按昼夜线回看，再补充现场发言和玩家动机。`,
      turningPoints: topTimeline(archive),
      suggestedReplayOrder: ['配板与身份', '夜间行动', '白天提名与投票', '处决与胜负声明'],
    },
    playerReviews: playerReviewsFor(archive, reviewStyle, includePlayerScores),
  }
}
