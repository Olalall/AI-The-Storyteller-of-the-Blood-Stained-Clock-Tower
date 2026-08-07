import {
  defaultArchiveRuntimeSettings,
  readArchiveRuntimeSettings,
  type ArchiveRuntimeSettings,
} from '../archive'
import { outcomeReady } from '../../features/night-workbench/state/projectWakeDraft'
import type { AIResultAdvice } from '../../features/night-workbench/types'
import { localAIAdapter } from './localAIAdapter'
import type { AIConfidence, AIProviderKind, CreateNightResultAdviceInput } from './types'
import { roleKnowledgeForAI } from '../../domain/role-knowledge'
import { roleResearchForAI } from '../../domain/scripts'
import { nightContextLevel, unknownSeatIds } from './aiContextLevel'
import { normalizeStateChangeDrafts } from './aiStateChangeDraft'
import { nightStatusFactsForAI, selectedNightTargetsForAI } from './nightTargetContext'

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
  /**
   * unknown 而不是具体形状：这条响应可能来自还没升级的后端（纯 string[]），
   * 也可能来自一个代理。声明成结构化类型等于替对面担保，而担保的代价是运行时崩在渲染层。
   */
  stateChangeDrafts?: unknown
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
  runtimeSettings?: ArchiveRuntimeSettings
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

/**
 * 本次请求里出现过的座位号：发动者、已选目标、已展开状态的目标。
 * 与 server 端 seatIdsInRequest 同口径——白名单两边对不上时，一条建议会在后端过关、
 * 在前端被丢，而界面上只表现为「按钮有时候不出现」。
 */
function seatIdsInRequest({ state, item, draft }: CreateNightResultAdviceInput) {
  const seats = new Set<number>([item.seatId, ...draft.targets])
  for (const target of selectedNightTargetsForAI(state, draft)) seats.add(target.seatId)
  for (const seatId of item.historicalContext?.seatIds ?? []) seats.add(seatId)
  return seats
}

function requestBody({ state, item, draft }: CreateNightResultAdviceInput) {
  const selectedTargets = selectedNightTargetsForAI(state, draft)

  return {
    scriptId: state.scriptId,
    knowledgeVersion: state.knowledgeVersion,
    nightRunId: state.nightRunId,
    phaseLabel: state.nightLabel,
    playerCount: state.playerCount,
    // 这两个字段才是 contextLevel「真正接通」的那根线：只在 build 函数里推导出来
    // 而不发上去，单测会从 minimal 变成 standard，线上一个字节都不会变。
    contextLevel: nightContextLevel(state),
    unknownSeatIds: unknownSeatIds(state),
    wakeItem: {
      id: item.id,
      orderIndex: item.orderIndex,
      seatId: item.seatId,
      playerLabel: item.playerLabel,
      roleId: item.roleId,
      roleName: item.roleName,
      ability: item.ability,
      storytellerPrompt: item.storytellerPrompt,
      targetCount: item.targetCount,
      minimumTargetCount: item.minimumTargetCount,
      targetLabel: item.targetLabel,
      roleLabel: item.roleLabel,
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
      playerChoice: draft.playerChoice,
      draftRevision: draft.draftRevision,
      registration: draft.registration ? { ...draft.registration } : undefined,
    },
    availableOutcomes: item.outcomeOptions.map((outcome) => ({
      id: outcome.id,
      label: outcome.label,
      ready: outcomeReady(outcome, item, draft),
      requiredInputs: outcome.requiredInputs,
    })),
    selectedTargets,
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
    .filter((outcome) => outcomeReady(outcome, input.item, input.draft))
    .map((outcome) => outcome.id))
  const recommended = payload.recommendedOutcomeId && readyIds.has(payload.recommendedOutcomeId)
    ? payload.recommendedOutcomeId
    : undefined
  const status = payload.status === 'answer' && recommended ? 'answer' : 'needs_input'
  const adviceId = `${input.item.id}-ai-${input.state.revision}-${input.draft.draftRevision}-backend`
  // 后端已经过一次同判据的解析，这里再过一次不是重复：这条响应未必来自那个后端。
  const backendStateChanges = normalizeStateChangeDrafts(payload.stateChangeDrafts, seatIdsInRequest(input))
  const warningDrafts = stringArray(payload.warnings, 5)
  const authorityWarnings = [
    ...warningDrafts,
    ...stringArray(payload.authorityWarnings, 5),
  ].slice(0, 6)

  return {
    id: adviceId,
    adviceId,
    kind: 'result',
    nightRunId: input.state.nightRunId,
    wakeItemId: input.item.id,
    contextRevision: input.state.revision,
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
    journalDrafts: stringArray(payload.journalDrafts, 4).length
      ? stringArray(payload.journalDrafts, 4)
      : fallback?.journalDrafts ?? [],
    playerMessageDrafts: stringArray(payload.playerMessageDrafts, 4).length
      ? stringArray(payload.playerMessageDrafts, 4)
      : fallback?.playerMessageDrafts ?? [],
    stateChangeDrafts: backendStateChanges.length ? backendStateChanges : fallback?.stateChangeDrafts ?? [],
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
  const runtimeSettings = options.runtimeSettings ?? readArchiveRuntimeSettings()
  if (runtimeSettings.mode !== 'http') return fallback

  try {
    const response = await fetchWithTimeout(
      options.fetcher ?? fetch,
      runtimeSettings.timeoutMs || defaultArchiveRuntimeSettings.timeoutMs,
      urlFor(runtimeSettings.baseUrl || defaultArchiveRuntimeSettings.baseUrl),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody(input)),
      },
    )
    const body = await response.json() as BackendNightSettlementResponse
    if (!response.ok || body.accepted !== true || !body.data?.draft) throw new Error('night advice failed')
    return mapBackendDraft(body.data.draft, input, fallback)
  } catch {
    return localAdvice(input, '后端夜间建议不可用，已使用本地草稿。')
  }
}
