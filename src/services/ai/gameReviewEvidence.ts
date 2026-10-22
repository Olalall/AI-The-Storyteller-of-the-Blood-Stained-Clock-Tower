import { projectTimelineHistory } from '../../features/game-session/state/projectTimelineHistory'
import type { GameArchiveRecord } from '../archive/types'

export interface GameReviewEvidence {
  recordId: string
  phaseLabel: string
  fact: string
  details: string[]
  seatIds: number[]
  correctionOf?: string
  superseded: boolean
  voided?: boolean
}

export interface GameReviewInterpretation {
  recordIds: string[]
  explanation: string
}

/** 只投影说书人确认过的记录，AI 不重写事实或座位关联。 */
export function gameReviewEvidence(archive: GameArchiveRecord): GameReviewEvidence[] {
  const knownKinds = new Set(['setup_confirmed', 'setup_changed', 'ability_changed', 'player_state_changed', 'night_action', 'day_action', 'vote_round', 'execution', 'no_execution'])
  const timeline = archive.session.timeline.filter((entry) => knownKinds.has(entry.kind))
  return projectTimelineHistory({ ...archive.session, timeline }).map((entry) => ({
    recordId: entry.id,
    phaseLabel: entry.phaseLabel,
    fact: entry.summary,
    details: entry.source.kind === 'execution'
      ? [entry.source.causedDeath === false ? '本次处决未造成死亡'
        : entry.source.causedDeath === true ? '记录标记本次处决造成死亡' : '旧记录未单独标记是否死亡，请核对状态记录',
        ...(entry.source.exceptionReason ? [`特殊处决原因：${entry.source.exceptionReason}`] : []),
        ...entry.isCorrection ? [`更正原因：${entry.source.correctionReason?.trim() || '历史记录未填写原因'}`] : []]
      : entry.details,
    seatIds: entry.seatIds,
    correctionOf: entry.correctionOf,
    superseded: entry.isSuperseded,
    ...(entry.source.kind === 'vote_round' && entry.source.voided ? { voided: true } : {}),
  }))
}

export function keyGameReviewEvidence(archive: GameArchiveRecord): GameReviewEvidence[] {
  const entries = gameReviewEvidence(archive)
  const sourceById = new Map(archive.session.timeline.map((entry) => [entry.id, entry]))
  function priority(item: GameReviewEvidence) {
    const source = sourceById.get(item.recordId)
    if (item.correctionOf) return 6
    if (source?.kind === 'execution') return 5
    if (source?.kind === 'player_state_changed' || source?.kind === 'setup_changed' || source?.kind === 'ability_changed') return 4
    if (source?.kind === 'night_action' || source?.kind === 'day_action') return 3
    if (source?.kind === 'vote_round' || source?.kind === 'no_execution') return 2
    return 0
  }
  const selected = entries.filter((entry) => !entry.superseded && priority(entry) > 0)
    .sort((left, right) => priority(right) - priority(left))
    .slice(0, 6)
  const selectedIds = new Set(selected.map((entry) => entry.recordId))
  // 更正必须同时带上原记录；它可能不在归档的有效时间线中。
  for (const entry of selected) {
    let originalId = entry.correctionOf
    while (originalId && !selectedIds.has(originalId)) {
      const original = entries.find((item) => item.recordId === originalId)
      if (!original) break
      selectedIds.add(originalId)
      originalId = original.correctionOf
    }
  }
  return entries.filter((entry) => selectedIds.has(entry.recordId)).reverse()
}

/** 模型只能解释已存在的记录；缺失或伪造引用的整条解释不展示。 */
export function validReviewInterpretations(value: unknown, evidence: readonly GameReviewEvidence[]): GameReviewInterpretation[] {
  if (!Array.isArray(value)) return []
  const validIds = new Set(evidence.filter((entry) => !entry.superseded && !entry.voided).map((entry) => entry.recordId))
  return value.slice(0, 12).flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return []
    const candidate = item as Partial<GameReviewInterpretation>
    if (typeof candidate.explanation !== 'string' || !candidate.explanation.trim() || !Array.isArray(candidate.recordIds)) return []
    if (!candidate.recordIds.length || candidate.recordIds.length > 6 || !candidate.recordIds.every((id) => typeof id === 'string' && validIds.has(id))) return []
    return [{ recordIds: [...new Set(candidate.recordIds)], explanation: candidate.explanation.trim().slice(0, 1200) }]
  }).slice(0, 6)
}

export function reviewEvidenceExcerpts(evidence: readonly GameReviewEvidence[]): GameReviewEvidence[] {
  return evidence.filter((entry) => entry.recordId.length <= 200).slice(-12).map((entry) => ({
    ...entry,
    phaseLabel: entry.phaseLabel.slice(0, 80),
    fact: entry.fact.slice(0, 600),
    details: entry.details.slice(0, 6).map((detail) => detail.slice(0, 300)),
    seatIds: entry.seatIds.slice(0, 15),
    correctionOf: entry.correctionOf?.slice(0, 200),
  }))
}

export function reviewModelMissing(value: unknown): string[] {
  return Array.isArray(value) ? value.slice(0, 8).flatMap((item: unknown) =>
    typeof item === 'string' && item.trim() ? [item.trim().slice(0, 400)] : []) : []
}

export const reviewMissingInformation = [
  '日志未完整记录现场发言、私聊和玩家动机，不能据此判断玩家能力或还原完整因果。',
  '未记录不代表未发生；无更正记录也不能证明主持没有出错。',
  'AI 仅收到最多 12 条记录摘录，长文本会截短；更完整的原记录与更正链仍保留在本地归档中。',
]
