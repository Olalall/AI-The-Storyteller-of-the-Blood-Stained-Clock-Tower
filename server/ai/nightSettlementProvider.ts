import { AIProviderError, callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { normalizeStateChangeDrafts, seatIdsInRequest } from './nightStateChangeDraft'
import { unknownSeatGap, unknownSeatQuestion } from './nightUnknownSeats'
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

function canonicalRoleId(roleId: string) {
  return roleId.replace(/[_-]/g, '')
}

function actorImpaired(input: NightSettlementProviderRequest) {
  return Boolean(input.wakeItem.status?.impairments.includes('poisoned') || input.wakeItem.status?.impairments.includes('drunk'))
}

function historicalTargetMissing(input: NightSettlementProviderRequest) {
  const missing: string[] = []
  if (input.wakeItem.previousTargetRequired && !input.wakeItem.previousTargets?.length) {
    missing.push('缺少上一夜已确认目标，不能核对连续选择限制。')
  }
  if (input.wakeItem.previousTargetRequired && input.draft.targets.some((seatId) => input.wakeItem.previousTargets?.includes(seatId))) {
    missing.push('本夜目标与上一夜已确认目标重复，请改选后再生成建议。')
  }
  if (input.wakeItem.historicalContext?.status === 'missing') {
    missing.push(input.wakeItem.historicalContext.summary)
  }
  if (input.draft.registration?.value && input.wakeItem.forbiddenRegistrationValues?.includes(input.draft.registration.value)) {
    missing.push('本夜登记值违反已确认历史限制，请改选登记或先记录醉酒/中毒等例外状态。')
  }
  if (canonicalRoleId(input.wakeItem.roleId) === 'balloonist' &&
    !actorImpaired(input) &&
    input.wakeItem.previousRegistration?.kind === 'role_type' &&
    input.draft.registration?.kind === 'role_type' &&
    input.wakeItem.previousRegistration.value === input.draft.registration.value) {
    missing.push('气球驾驶员健康时，本夜展示类型不能与上一夜相同；请改选展示类型或先记录醉酒/中毒状态。')
  }
  return missing
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
  // 知情缺口排在模型自己报的 missing 前面，并且直接参与 status 判定：
  // 只写进 warnings 的话，模型仍会返回 answer，说书人拿到的是一个「基于半张棋盘」
  // 却看起来完整的结论——那比不回答危险得多。
  const gap = unknownSeatGap(input)
  const missing = [
    ...(gap.length ? [unknownSeatQuestion(gap)] : []),
    ...historicalTargetMissing(input),
    ...stringArray(payload.missing, 6),
  ].slice(0, 6)
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
    stateChangeDrafts: normalizeStateChangeDrafts(payload.stateChangeDrafts, seatIdsInRequest(input)),
    authorityWarnings: authorityWarnings.length ? authorityWarnings : ['确认本项前不写日志、不改状态。'],
    disclaimer: text(payload.disclaimer, 'AI 夜间建议只是草稿，确认本项前不生效。'),
  }
}

export function fallbackNightSettlementAdviceDraft(
  input: NightSettlementProviderRequest,
  warning = 'AI 夜间建议不可用，已使用本地结果候选。',
): NightSettlementAdviceDraft {
  const readyIds = readyOutcomeIds(input)
  const historicalMissing = historicalTargetMissing(input)
  const preferred = historicalMissing.length
    ? undefined
    : input.draft.outcomeId && readyIds.includes(input.draft.outcomeId)
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
    missing: preferred ? [] : historicalMissing.length ? historicalMissing : ['本项还没有可直接采用的结果。'],
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
