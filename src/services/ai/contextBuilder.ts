import type { GameArchiveRecord } from '../archive'
import type { GameSessionState } from '../../features/game-session/types'
import type { NightWorkbenchState, WakeDraft, WakeItem } from '../../features/night-workbench/types'
import type {
  AIContextLevel,
  AIContextSeat,
  NightSettlementRequest,
  ReviewDraftRequest,
  SetupAdviceRequest,
} from './types'
import { roleKnowledgeForAI } from '../../domain/role-knowledge'
import { roleResearchForAI } from '../../domain/scripts'
import { nightContextLevel, sessionContextLevel } from './aiContextLevel'
import { nightStatusFactsForAI, selectedNightTargetsForAI } from './nightTargetContext'

interface BuildRequestOptions {
  /**
   * 只给测试和将来的显式降级用。缺省一律由 coverage 推导——写死 'minimal' 是这个字段
   * 过去只存在于类型里的原因：三个 build 函数都填同一个常量，收信的一端自然没有理由去读。
   */
  contextLevel?: AIContextLevel
  createdAt?: string
}

interface BuildSetupAdviceRequestOptions extends BuildRequestOptions {
  candidateIds?: readonly string[]
}

interface BuildNightSettlementRequestOptions extends BuildRequestOptions {
  state: NightWorkbenchState
  item: WakeItem
  draft: WakeDraft
}

function createdAtOrNow(createdAt?: string) {
  return createdAt ?? new Date().toISOString()
}

function requestId(prefix: string, createdAt: string) {
  return `${prefix}-${createdAt.replace(/[:.]/g, '-')}`
}

function contextSeats(session: GameSessionState): AIContextSeat[] {
  return Object.values(session.seats)
    .sort((left, right) => left.seatId - right.seatId)
    .map((seat) => ({
      seatId: seat.seatId,
      nickname: seat.nickname,
      experience: seat.experience,
    }))
}

export function buildSetupAdviceRequest(
  session: GameSessionState,
  options: BuildSetupAdviceRequestOptions = {},
): SetupAdviceRequest {
  const createdAt = createdAtOrNow(options.createdAt)
  return {
    requestId: requestId('ai-setup', createdAt),
    kind: 'setup_advice',
    contextLevel: options.contextLevel ?? sessionContextLevel(session),
    createdAt,
    knowledgeVersion: session.knowledgeVersion,
    question: '根据当前人数和玩家经验，给出配板候选排序和提醒。',
    context: {
      scriptId: session.scriptId,
      playerCount: session.playerCount,
      seats: contextSeats(session),
      candidateIds: [...(options.candidateIds ?? [])],
    },
  }
}

export function buildNightSettlementRequest({
  state,
  item,
  draft,
  contextLevel,
  createdAt,
}: BuildNightSettlementRequestOptions): NightSettlementRequest {
  const timestamp = createdAtOrNow(createdAt)
  const selectedTargets = selectedNightTargetsForAI(state, draft)
  return {
    requestId: requestId(`ai-night-${item.id}`, timestamp),
    kind: 'night_settlement',
    contextLevel: contextLevel ?? nightContextLevel(state),
    createdAt: timestamp,
    knowledgeVersion: state.knowledgeVersion,
    question: '根据当前唤醒项和说书人已录入选择，给出技能结果草稿。',
    context: {
      scriptId: state.scriptId,
      nightRunId: state.nightRunId,
      phaseLabel: state.nightLabel,
      playerCount: state.playerCount,
      wakeItem: {
        id: item.id,
        orderIndex: item.orderIndex,
        seatId: item.seatId,
        roleId: item.roleId,
        roleName: item.roleName,
        ability: item.ability,
        targetCount: item.targetCount,
        minimumTargetCount: item.minimumTargetCount,
        status: {
          life: item.status.life,
          impairments: [...item.status.impairments],
          markers: item.status.markers.map((marker) => marker.label),
        },
        previousRegistration: item.previousRegistration ? { ...item.previousRegistration } : undefined,
        forbiddenRegistrationValues: item.forbiddenRegistrationValues ? [...item.forbiddenRegistrationValues] : undefined,
        previousTargets: item.previousTargets ? [...item.previousTargets] : undefined,
        forbiddenTargetSeatIds: item.forbiddenTargetSeatIds ? [...item.forbiddenTargetSeatIds] : undefined,
        previousTargetRequired: item.previousTargetRequired,
        historicalContext: item.historicalContext ? structuredClone(item.historicalContext) : undefined,
      },
      draft: {
        targets: [...draft.targets],
        roleChoice: draft.roleChoice,
        outcomeId: draft.outcomeId,
        draftRevision: draft.draftRevision,
        registration: draft.registration ? { ...draft.registration } : undefined,
      },
      selectedTargets,
      statusFacts: nightStatusFactsForAI(item, selectedTargets),
      roleKnowledge: roleKnowledgeForAI(item.roleId),
      roleResearch: roleResearchForAI(state.scriptId, item.roleId),
    },
  }
}

export function buildReviewDraftRequest(
  archive: GameArchiveRecord,
  options: BuildRequestOptions = {},
): ReviewDraftRequest {
  const createdAt = createdAtOrNow(options.createdAt)
  return {
    requestId: requestId(`ai-review-${archive.id}`, createdAt),
    kind: 'review_draft',
    contextLevel: options.contextLevel ?? sessionContextLevel(archive.session),
    createdAt,
    knowledgeVersion: archive.session.knowledgeVersion,
    question: '基于归档摘要生成赛后复盘草稿。',
    context: {
      archiveId: archive.id,
      sessionId: archive.sessionId,
      scriptName: archive.scriptName,
      playerCount: archive.playerCount,
      winnerLabel: archive.winnerLabel,
      summary: { ...archive.summary },
    },
  }
}
