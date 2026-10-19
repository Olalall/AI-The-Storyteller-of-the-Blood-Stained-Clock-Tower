import {
  defaultArchiveRuntimeSettings,
} from '../archive'
import { readAIRuntimeSettings, type AIRuntimeSettings } from './aiRuntimeSettings'
import { outcomeReady, selectedTargetCount, targetRoleChoicesSatisfied } from '../../features/night-workbench/state/projectWakeDraft'
import type { AIResultAdvice } from '../../features/night-workbench/types'
import { localAIAdapter } from './localAIAdapter'
import type { AIConfidence, AIProviderKind, CreateNightResultAdviceInput } from './types'
import { roleKnowledgeForAI } from '../../domain/role-knowledge'
import { roleResearchForAI } from '../../domain/scripts'
import { modelRequestTimeoutMs } from './modelRequestTimeout'
import { currentNightActorForAI, inPlayNightRoleIdsForAI, nightHistoryForAI, nightStatusFactsForAI, selectedNightTargetsForAI } from './nightTargetContext'

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface BackendNightSettlementDraft {
  provider?: AIProviderKind
  confidence?: AIConfidence
  draftOnly?: boolean
  status?: 'answer' | 'needs_input'
  recommendedOutcomeId?: string
  summary?: string
  ruleFacts?: string[]
  missing?: string[]
  warnings?: string[]
  journalDrafts?: string[]
  playerMessageDrafts?: string[]
  stateChangeDrafts?: string[]
  authorityWarnings?: string[]
  disclaimer?: string
}

interface BackendNightSettlementResponse {
  accepted?: boolean
  data?: {
    draft?: BackendNightSettlementDraft
  }
}

export interface CreateNightResultAdviceAsyncOptions {
  runtimeSettings?: AIRuntimeSettings
  fetcher?: FetchLike
}

function urlFor(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/api/ai/night-settlement-advice`
}

async function fetchWithTimeout(fetcher: FetchLike, timeoutMs: number, input: string, init: RequestInit) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetcher(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function stringArray(value: unknown, limit: number) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).slice(0, limit)
    : []
}

function localAdvice(input: CreateNightResultAdviceInput, warning?: string) {
  const advice = localAIAdapter.createNightResultAdvice(input)
  if (!advice || !warning) return advice
  return {
    ...advice,
    facts: [...advice.facts, warning],
    authorityWarnings: [...advice.authorityWarnings, warning],
  }
}

function requestBody({ state, item, draft }: CreateNightResultAdviceInput) {
  const selectedTargets = selectedNightTargetsForAI(state, draft)

  return {
    scriptId: state.scriptId,
    knowledgeVersion: state.knowledgeVersion,
    nightRunId: state.nightRunId,
    nightType: state.nightType,
    phaseLabel: state.nightLabel,
    playerCount: state.playerCount,
    wakeItem: {
      id: item.id,
      orderIndex: item.orderIndex,
      seatId: item.seatId,
      playerLabel: item.playerLabel,
      roleId: item.roleId,
      roleName: item.roleName,
      ability: item.ability,
      storytellerPrompt: item.storytellerPrompt,
      history: nightHistoryForAI(item),
      targetCount: selectedTargetCount(item, draft),
      allowedTargetCounts: item.allowedTargetCounts,
      roleCount: item.roleCount,
      abilityPhase: item.abilityPhase,
      targetRoleChoiceCount: item.targetRoleChoiceCount,
      targetRoleChoiceRoleIds: item.targetRoleChoiceCount ? item.roleChoices?.map(role => role.id) : undefined,
      targetLabel: item.targetLabel,
      roleLabel: item.roleLabel,
      status: {
        life: item.status.life,
        impairments: [...item.status.impairments],
        markers: item.status.markers.map((marker) => marker.label),
      },
    },
    draft: {
      targets: [...draft.targets],
      roleChoice: draft.roleChoice,
      secondRoleChoice: draft.secondRoleChoice,
      additionalRoleChoices: draft.additionalRoleChoices ? [...draft.additionalRoleChoices] : undefined,
      targetRoleChoices: draft.targetRoleChoices?.map(choice => ({ ...choice })),
      targetCountChoice: draft.targetCountChoice,
      storytellerContext: draft.storytellerContext?.trim().slice(0, 1000) || undefined,
      outcomeId: draft.outcomeId,
      playerChoice: draft.playerChoice,
      draftRevision: draft.draftRevision,
    },
    availableOutcomes: item.outcomeOptions.map((outcome) => ({
      id: outcome.id,
      label: outcome.label,
      ready: outcomeReady(outcome, item, draft) && targetRoleChoicesSatisfied(item, draft, state.playerCount),
      requiredInputs: outcome.requiredInputs,
    })),
    selectedTargets: selectedTargets.map(target => ({ ...target, roleKnowledge: roleKnowledgeForAI(target.roleId) })),
    currentActor: currentNightActorForAI(state, item),
    inPlayRoleIds: inPlayNightRoleIdsForAI(state),
    statusFacts: nightStatusFactsForAI(item, selectedTargets),
    roleKnowledge: roleKnowledgeForAI(item.roleId),
    roleResearch: roleResearchForAI(state.scriptId, item.roleId),
  }
}

function mapBackendDraft(
  payload: BackendNightSettlementDraft,
  input: CreateNightResultAdviceInput,
  fallback: AIResultAdvice | null,
): AIResultAdvice {
  const readyIds = new Set(input.item.outcomeOptions
    .filter((outcome) => outcomeReady(outcome, input.item, input.draft) && targetRoleChoicesSatisfied(input.item, input.draft, input.state.playerCount))
    .map((outcome) => outcome.id))
  const recommended = payload.recommendedOutcomeId && readyIds.has(payload.recommendedOutcomeId)
    ? payload.recommendedOutcomeId
    : undefined
  const status = payload.status === 'answer' && recommended && !stringArray(payload.missing, 6).length ? 'answer' : 'needs_input'
  const adviceId = `${input.item.id}-ai-${input.state.revision}-${input.draft.draftRevision}-backend`
  const warningDrafts = stringArray(payload.warnings, 5)
  const authorityWarnings = [...new Set([
    ...warningDrafts,
    ...stringArray(payload.authorityWarnings, 5),
  ])].slice(0, 6)

  return {
    id: adviceId,
    adviceId,
    kind: 'result',
    nightRunId: input.state.nightRunId,
    wakeItemId: input.item.id,
    contextRevision: input.state.revision,
    contextKey: input.state.contextKey,
    sourceDraftRevision: input.draft.draftRevision,
    knowledgeVersion: input.state.knowledgeVersion,
    status,
    recommendedOutcomeId: status === 'answer' ? recommended : undefined,
    summary: payload.summary?.trim() || fallback?.summary || 'AI 已生成本项建议草稿。',
    facts: payload.ruleFacts?.length
      ? payload.ruleFacts
      : fallback?.facts ?? [`当前处理：${input.item.seatId}号 ${input.item.roleName}`],
    missing: payload.missing?.length
      ? payload.missing
      : status === 'needs_input' ? ['先补齐本项选择。'] : [],
    journalDrafts: Array.isArray(payload.journalDrafts)
      ? stringArray(payload.journalDrafts, 4)
      : fallback?.journalDrafts ?? [],
    playerMessageDrafts: status !== 'answer' || input.item.targetRoleChoiceCount ? [] : Array.isArray(payload.playerMessageDrafts)
      ? stringArray(payload.playerMessageDrafts, 4)
      : fallback?.playerMessageDrafts ?? [],
    stateChangeDrafts: Array.isArray(payload.stateChangeDrafts)
      ? stringArray(payload.stateChangeDrafts, 5)
      : fallback?.stateChangeDrafts ?? [],
    authorityWarnings: authorityWarnings.length
      ? authorityWarnings
      : fallback?.authorityWarnings ?? ['确认本项前不写日志、不改状态。'],
    confidence: payload.confidence ?? fallback?.confidence ?? 'low',
  }
}

export async function createNightResultAdviceAsync(
  input: CreateNightResultAdviceInput,
  options: CreateNightResultAdviceAsyncOptions = {},
): Promise<AIResultAdvice | null> {
  const fallback = localAIAdapter.createNightResultAdvice(input)
  const runtimeSettings = options.runtimeSettings ?? readAIRuntimeSettings()
  if (runtimeSettings.mode !== 'http') return fallback

  try {
    const response = await fetchWithTimeout(
      options.fetcher ?? fetch,
      modelRequestTimeoutMs(runtimeSettings.timeoutMs || defaultArchiveRuntimeSettings.timeoutMs),
      urlFor(runtimeSettings.baseUrl || defaultArchiveRuntimeSettings.baseUrl),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody(input)),
      },
    )
    if (response.status === 401) return localAdvice(input, '请先在 AI 设置中验证访问口令；当前保留本地草稿。')
    const body = await response.json() as BackendNightSettlementResponse
    if (!response.ok || body.accepted !== true || !body.data?.draft) throw new Error('night advice failed')
    return mapBackendDraft(body.data.draft, input, fallback)
  } catch {
    return localAdvice(input, '后端夜间建议不可用，已使用本地草稿。')
  }
}
