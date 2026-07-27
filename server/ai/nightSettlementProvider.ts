import { AIProviderError, callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import type { AIAdviceConfidence, NightSettlementAdviceDraft, NightSettlementProviderRequest } from './types'

interface ProviderNightSettlementPayload {
  status?: unknown
  confidence?: unknown
  recommendedOutcomeId?: unknown
  summary?: unknown
  ruleFacts?: unknown
  missing?: unknown
  warnings?: unknown
  journalDrafts?: unknown
  playerMessageDrafts?: unknown
  stateChangeDrafts?: unknown
  authorityWarnings?: unknown
  disclaimer?: unknown
}

export interface NightSettlementProviderResult {
  draft: NightSettlementAdviceDraft
  warnings: string[]
}

export interface OpenAINightSettlementProviderOptions {
  baseUrl: string
  model: string
  apiKey: string
  timeoutSeconds: number
  fetcher?: FetchLike
}

function confidenceFrom(value: unknown): AIAdviceConfidence {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'low'
}

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function stringArray(value: unknown, limit: number) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).slice(0, limit)
    : []
}

function readyOutcomeIds(input: NightSettlementProviderRequest) {
  return input.availableOutcomes.filter((outcome) => outcome.ready).map((outcome) => outcome.id)
}

function statusRiskWarnings(input: NightSettlementProviderRequest) {
  const warnings: string[] = []
  const { status } = input.wakeItem
  if (!status) return warnings
  if (status.life === 'dead') {
    warnings.push(`${input.wakeItem.seatId}号${input.wakeItem.roleName}当前死亡；采用结果前先核对该角色死亡后是否仍需行动。`)
  }
  if (status.impairments.includes('poisoned')) {
    warnings.push(`${input.wakeItem.seatId}号${input.wakeItem.roleName}当前中毒；结果是否影响玩家信息或状态需由说书人确认。`)
  }
  if (status.impairments.includes('drunk')) {
    warnings.push(`${input.wakeItem.seatId}号${input.wakeItem.roleName}当前醉酒；结果是否影响玩家信息或状态需由说书人确认。`)
  }
  if (status.markers.length) {
    warnings.push(`${input.wakeItem.seatId}号${input.wakeItem.roleName}带有标记：${status.markers.join('、')}；采用前先核对标记影响。`)
  }
  return warnings
}

function recommendedOutcomeId(value: unknown, input: NightSettlementProviderRequest) {
  const allowed = new Set(readyOutcomeIds(input))
  return typeof value === 'string' && allowed.has(value) ? value : undefined
}

function normalizeDraft(
  payload: ProviderNightSettlementPayload,
  input: NightSettlementProviderRequest,
): NightSettlementAdviceDraft {
  const missing = stringArray(payload.missing, 6)
  const outcomeId = recommendedOutcomeId(payload.recommendedOutcomeId, input)
  const status = payload.status === 'answer' && outcomeId && !missing.length ? 'answer' : 'needs_input'
  const roleFacts = stringArray(payload.ruleFacts, 6)
  const statusWarnings = statusRiskWarnings(input)
  const researchWarnings = input.roleResearch && input.roleResearch.knowledgeStatus !== 'confirmed'
    ? [`${input.roleResearch.name} 规则知识需要复核。`]
    : []
  const providerWarnings = stringArray(payload.warnings, 6)
  const authorityWarnings = [
    ...statusWarnings,
    ...providerWarnings,
    ...stringArray(payload.authorityWarnings, 5),
  ].slice(0, 6)
  return {
    provider: 'openai-compatible',
    confidence: confidenceFrom(payload.confidence),
    draftOnly: true,
    status,
    recommendedOutcomeId: status === 'answer' ? outcomeId : undefined,
    summary: text(payload.summary, status === 'answer' ? 'AI 已生成本项结果草稿。' : '请先补齐本项需要的信息。'),
    ruleFacts: roleFacts.length ? roleFacts : [
      `当前处理：${input.wakeItem.seatId}号 ${input.wakeItem.roleName}`,
      ...(input.statusFacts ?? []),
      ...(input.roleKnowledge?.reminders ?? []),
      ...(input.roleKnowledge?.aiCannot.length ? [`禁止自动执行：${input.roleKnowledge.aiCannot.join('、')}`] : []),
      ...(input.roleResearch?.possibleOutcomes ?? []),
      ...(input.roleResearch?.highRiskNotes ?? []),
    ].slice(0, 6),
    missing: missing.length ? missing : status === 'needs_input' ? ['缺少可直接采用的结果候选。'] : [],
    warnings: [...statusWarnings, ...providerWarnings, ...researchWarnings].slice(0, 6),
    journalDrafts: stringArray(payload.journalDrafts, 4),
    playerMessageDrafts: stringArray(payload.playerMessageDrafts, 4),
    stateChangeDrafts: stringArray(payload.stateChangeDrafts, 5),
    authorityWarnings: authorityWarnings.length ? authorityWarnings : ['确认本项前不写日志、不改状态。'],
    disclaimer: text(payload.disclaimer, 'AI 夜间建议只是草稿，确认本项前不生效。'),
  }
}

export function fallbackNightSettlementAdviceDraft(
  input: NightSettlementProviderRequest,
  warning = 'AI 夜间建议不可用，已使用本地结果候选。',
): NightSettlementAdviceDraft {
  const readyIds = readyOutcomeIds(input)
  const preferred = input.draft.outcomeId && readyIds.includes(input.draft.outcomeId)
    ? input.draft.outcomeId
    : readyIds[0]
  return {
    provider: 'fake',
    confidence: preferred ? 'medium' : 'low',
    draftOnly: true,
    status: preferred ? 'answer' : 'needs_input',
    recommendedOutcomeId: preferred,
    summary: preferred ? '可按当前录入生成结果草稿。' : '先补齐目标、角色或结果候选。',
    ruleFacts: [
      `当前处理：${input.wakeItem.seatId}号 ${input.wakeItem.roleName}`,
      ...(input.statusFacts ?? []),
      ...(input.roleKnowledge?.reminders ?? []),
      ...(input.roleKnowledge?.aiCannot.length ? [`禁止自动执行：${input.roleKnowledge.aiCannot.join('、')}`] : []),
      ...(input.roleResearch?.possibleOutcomes ?? []),
      ...(input.roleResearch?.highRiskNotes ?? []),
    ].slice(0, 6),
    missing: preferred ? [] : ['本项还没有可直接采用的结果。'],
    warnings: [warning, ...statusRiskWarnings(input)].slice(0, 6),
    journalDrafts: [],
    playerMessageDrafts: [],
    stateChangeDrafts: [],
    authorityWarnings: [
      ...statusRiskWarnings(input),
      '确认本项前不写日志、不改状态。',
      '死亡、身份、阵营、毒醉仍需说书人单独确认。',
    ].slice(0, 6),
    disclaimer: '本地夜间草稿只填入本项结果；说书人确认前不写日志、不改状态。',
  }
}

export function createOpenAICompatibleNightSettlementProvider(options: OpenAINightSettlementProviderOptions) {
  return {
    async generateNightSettlementAdvice(input: NightSettlementProviderRequest): Promise<NightSettlementProviderResult> {
      const payload = await callOpenAICompatibleJSON<ProviderNightSettlementPayload>({
        baseUrl: options.baseUrl,
        model: options.model,
        apiKey: options.apiKey,
        timeoutSeconds: options.timeoutSeconds,
        fetcher: options.fetcher,
      }, buildNightSettlementProviderMessages(input))
      const draft = normalizeDraft(payload, input)
      if (draft.status === 'answer' && !draft.recommendedOutcomeId) {
        throw new AIProviderError('AI_PROVIDER_BAD_RESPONSE', 502)
      }
      return { draft, warnings: ['provider_night_settlement', 'draft_only'] }
    },
  }
}
