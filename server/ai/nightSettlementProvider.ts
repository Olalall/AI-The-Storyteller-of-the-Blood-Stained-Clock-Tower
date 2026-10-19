import { AIProviderError, callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { normalizeStateChangeDrafts, seatIdsInRequest } from './nightStateChangeDraft'
import { unknownSeatGap, unknownSeatQuestion } from './nightUnknownSeats'
import type { AIAdviceConfidence, NightSettlementAdviceDraft, NightSettlementProviderRequest } from './types'
import { missingKazaliTargetRoleChoices } from './kazaliTargetRoleChoices'

function missingNightInputs(input: NightSettlementProviderRequest): string[] {
  const missing = missingKazaliTargetRoleChoices(input)
  if (input.wakeItem.abilityPhase !== 'initial') return missing
  const seatId = input.draft.targets[0]
  const target = input.selectedTargets?.find((selected) => selected.seatId === seatId)
  if (input.wakeItem.roleId !== 'lleech' || input.nightType !== 'other'
    || input.draft.targets.length !== 1 || !Number.isInteger(seatId) || seatId < 1 || seatId > input.playerCount
    || input.selectedTargets?.length !== 1 || !target || target.status?.life !== 'alive') return [...missing, '痢蛭初始化须明确选择一名当前存活的宿主；这不是普通攻击。']
  return missing
}

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
  redirect?: RequestRedirect
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
  if (missingNightInputs(input).length) return []
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
  const { status } = input.currentActor ?? input.wakeItem
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
  const gap = unknownSeatGap(input)
  const missing = [...missingNightInputs(input), ...historicalTargetMissing(input), ...(gap.length ? [unknownSeatQuestion(gap)] : []), ...stringArray(payload.missing, 6)].slice(0, 6)
  const outcomeId = recommendedOutcomeId(payload.recommendedOutcomeId, input)
  const status = payload.status === 'answer' && outcomeId && !missing.length ? 'answer' : 'needs_input'
  const roleFacts = stringArray(payload.ruleFacts, 6)
  const statusWarnings = statusRiskWarnings(input)
  const researchWarnings = input.roleResearch && input.roleResearch.knowledgeStatus !== 'confirmed'
    ? [`${input.roleResearch.name} 规则知识需要复核。`]
    : []
  const providerWarnings = stringArray(payload.warnings, 6)
  const authorityWarnings = [
    ...(input.wakeItem.targetRoleChoiceCount ? ['爪牙配对只是待确认选择；身份与邪恶阵营须由说书人另行应用，再核对当晚新爪牙夜序、停用被替换的原技能。整张配对表不作为玩家告知。'] : []),
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
    playerMessageDrafts: status === 'answer' && !input.wakeItem.targetRoleChoiceCount ? stringArray(payload.playerMessageDrafts, 4) : [],
    stateChangeDrafts: normalizeStateChangeDrafts(payload.stateChangeDrafts, seatIdsInRequest(input)),
    authorityWarnings: authorityWarnings.length ? authorityWarnings : ['确认本项前不写日志、不改状态。'],
    disclaimer: text(payload.disclaimer, 'AI 夜间建议只是草稿，确认本项前不生效。'),
  }
}

export function fallbackNightSettlementAdviceDraft(
  input: NightSettlementProviderRequest,
  warning = 'AI 夜间建议不可用；只保留已有选择，不自动代选结果。',
): NightSettlementAdviceDraft {
  const readyIds = readyOutcomeIds(input)
  const preferred = !missingNightInputs(input).length && !historicalTargetMissing(input).length && !unknownSeatGap(input).length && input.draft.outcomeId && readyIds.includes(input.draft.outcomeId)
    ? input.draft.outcomeId
    : undefined
  return {
    provider: 'fake',
    confidence: preferred ? 'medium' : 'low',
    draftOnly: true,
    status: preferred ? 'answer' : 'needs_input',
    recommendedOutcomeId: preferred,
    summary: preferred ? '可按说书人已选结果保留草稿。' : '未获得可用的 AI 建议，请说书人选择本项结果。',
    ruleFacts: [
      `当前处理：${input.wakeItem.seatId}号 ${input.wakeItem.roleName}`,
      ...(input.statusFacts ?? []),
      ...(input.roleKnowledge?.reminders ?? []),
      ...(input.roleKnowledge?.aiCannot.length ? [`禁止自动执行：${input.roleKnowledge.aiCannot.join('、')}`] : []),
      ...(input.roleResearch?.possibleOutcomes ?? []),
      ...(input.roleResearch?.highRiskNotes ?? []),
    ].slice(0, 6),
    missing: preferred ? [] : missingNightInputs(input).length ? missingNightInputs(input) : ['请说书人选择本项结果；服务不可用时不会自动代选。'],
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
      if (missingNightInputs(input).length) {
        return { draft: fallbackNightSettlementAdviceDraft(input, '夜间输入未通过核对；未调用模型，也未更改身份或夜序。'), warnings: ['night_inputs_incomplete', 'draft_only'] }
      }
      const payload = await callOpenAICompatibleJSON<ProviderNightSettlementPayload>({
        baseUrl: options.baseUrl,
        model: options.model,
        apiKey: options.apiKey,
        timeoutSeconds: options.timeoutSeconds,
        fetcher: options.fetcher,
        redirect: options.redirect,
      }, buildNightSettlementProviderMessages(input))
      const draft = normalizeDraft(payload, input)
      if (draft.status === 'answer' && !draft.recommendedOutcomeId) {
        throw new AIProviderError('AI_PROVIDER_BAD_RESPONSE', 502)
      }
      return { draft, warnings: ['provider_night_settlement', 'draft_only'] }
    },
  }
}
