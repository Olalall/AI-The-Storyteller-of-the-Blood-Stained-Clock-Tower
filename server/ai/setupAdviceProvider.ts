import { AIProviderError, callOpenAICompatibleJSON, type FetchLike } from './aiProviderClient'
import { buildSetupAdviceProviderMessages } from './setupAdvicePromptBuilder'
import type { AIAdviceConfidence, SetupAdviceDraft, SetupAdviceProviderRequest } from './types'

interface ProviderSetupAdvicePayload {
  confidence?: unknown
  recommendedCandidateIds?: unknown
  warnings?: unknown
  reasons?: unknown
  balanceSummary?: unknown
  storytellerNotes?: unknown
  microAdjustments?: unknown
  qualityTags?: unknown
  disclaimer?: unknown
}

export interface SetupAdviceProviderResult {
  draft: SetupAdviceDraft
  warnings: string[]
}

export interface OpenAISetupAdviceProviderOptions {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function validCandidateIds(payloadIds: unknown, input: SetupAdviceProviderRequest) {
  const allowed = new Set(input.candidates.map((candidate) => candidate.id))
  const ids = stringArray(payloadIds, 5).filter((id) => allowed.has(id))
  return ids.length ? ids : input.candidates.slice(0, 3).map((candidate) => candidate.id)
}

function roleKnowledgeWarnings(input: SetupAdviceProviderRequest) {
  const warnings = new Set<string>()
  for (const candidate of input.candidates.slice(0, 3)) {
    for (const role of candidate.roles) {
      role.roleKnowledge?.reminders.slice(0, 1).forEach((reminder) => warnings.add(`${role.roleName}：${reminder}`))
      role.roleResearch?.setupImpact.slice(0, 1).forEach((note) => warnings.add(`${role.roleName}：${note}`))
      role.roleResearch?.highRiskNotes.slice(0, 1).forEach((note) => warnings.add(`${role.roleName}：${note}`))
      if (role.roleResearch && role.roleResearch.knowledgeStatus !== 'confirmed') {
        warnings.add(`${role.roleName}：规则知识需要复核`)
      }
    }
  }
  return [...warnings].slice(0, 5)
}

function normalizeMicroAdjustments(value: unknown, input: SetupAdviceProviderRequest) {
  if (!Array.isArray(value)) return []
  const candidatesById = new Map(input.candidates.map((candidate) => [candidate.id, candidate]))
  const rolePoolById = new Map((input.rolePool ?? []).map((role) => [role.roleId, role]))

  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    const candidateId = text(item.candidateId, '')
    const replaceOutRoleId = text(item.replaceOutRoleId, '')
    const replaceInRoleId = text(item.replaceInRoleId, '')
    const candidate = candidatesById.get(candidateId)
    const outRole = candidate?.roles.find((role) => role.roleId === replaceOutRoleId)
    const inRole = rolePoolById.get(replaceInRoleId)
    if (!candidate || !outRole || !inRole || replaceOutRoleId === replaceInRoleId) return []
    if (inRole.team === 'traveler' || inRole.team === 'fabled') return []
    return [{
      candidateId,
      candidateTitle: candidate.title,
      replaceOutRoleId,
      replaceOutRoleName: outRole.roleName,
      replaceInRoleId,
      replaceInRoleName: inRole.roleName,
      reason: text(item.reason, 'AI 未给出原因；采用前请人工复核。'),
      expectedEffect: text(item.expectedEffect, '用于微调信息量、误导量或节奏。'),
      risk: text(item.risk, '替换后必须重新核对人数、阵营分布、伪装和开局规则。'),
    }]
  }).slice(0, 4)
}

const qualityTones = new Set(['stable', 'swingy', 'good_favored', 'evil_favored', 'new_player_heavy', 'storyteller_heavy'])

function qualityTone(value: unknown) {
  return typeof value === 'string' && qualityTones.has(value) ? value : 'stable'
}

function normalizeQualityTags(value: unknown, input: SetupAdviceProviderRequest) {
  if (!Array.isArray(value)) return []
  const candidateIds = new Set(input.candidates.map((candidate) => candidate.id))
  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    const candidateId = text(item.candidateId, '')
    if (!candidateIds.has(candidateId)) return []
    return [{
      candidateId,
      label: text(item.label, '待复核').slice(0, 12),
      tone: qualityTone(item.tone),
      reason: text(item.reason, 'AI 未给出质量标签原因。'),
    }]
  }).slice(0, 12)
}

function teamCounts(candidate: SetupAdviceProviderRequest['candidates'][number]) {
  return candidate.roles.reduce<Record<string, number>>((acc, role) => {
    const team = role.team ?? 'unknown'
    acc[team] = (acc[team] ?? 0) + 1
    return acc
  }, {})
}

function fallbackBalanceSummary(input: SetupAdviceProviderRequest) {
  if (!input.candidates.length) return ['当前人数没有可用候选，先补模板或换 7-15 人开局。']
  const top = input.candidates[0]
  const counts = Object.entries(teamCounts(top)).map(([team, count]) => `${team} ${count}`).join(' / ')
  return [
    `本地平衡复核：首选 ${top.title}，阵营计数 ${counts || '未知'}，采用前仍需说书人确认。`,
    `请求已携带 ${input.rolePool?.length ?? 0} 个当前板子角色池条目；微调建议只允许从角色池替换。`,
    '重点看信息链是否过密、邪恶是否有伪装空间、死亡/中毒节奏是否压垮新手。',
  ]
}

function fallbackMicroAdjustments(input: SetupAdviceProviderRequest) {
  const rolePool = input.rolePool ?? []
  if (!rolePool.length) return []
  return input.candidates.slice(0, 2).flatMap((candidate) => {
    const inPlay = new Set(candidate.roles.map((role) => role.roleId))
    const riskyRole = candidate.roles.find((role) => (
      role.roleResearch?.highRiskNotes.length
      || role.roleKnowledge?.riskTags.length
      || (role.roleResearch && role.roleResearch.knowledgeStatus !== 'confirmed')
    ))
    if (!riskyRole?.team) return []
    const replacement = rolePool.find((role) => (
      role.team === riskyRole.team
      && !inPlay.has(role.roleId)
      && !role.highRiskNotes?.length
    )) ?? rolePool.find((role) => role.team === riskyRole.team && !inPlay.has(role.roleId))
    if (!replacement) return []
    return [{
      candidateId: candidate.id,
      candidateTitle: candidate.title,
      replaceOutRoleId: riskyRole.roleId,
      replaceOutRoleName: riskyRole.roleName,
      replaceInRoleId: replacement.roleId,
      replaceInRoleName: replacement.roleName,
      reason: '本地兜底建议：该角色有复杂/高风险提醒，可准备同阵营替换位供说书人手动微调。',
      expectedEffect: '降低裁量压力或信息噪音；不会自动应用到开局。',
      risk: '替换后必须重新核对人数、阵营分布、恶魔伪装和该板子的特殊开局规则。',
    }]
  }).slice(0, 3)
}

function fallbackQualityTags(input: SetupAdviceProviderRequest) {
  const newPlayerCount = input.seats.filter((seat) => seat.experience === 'new').length
  return input.candidates.flatMap((candidate) => {
    const riskyRoles = candidate.roles.filter((role) => (
      role.roleResearch?.highRiskNotes.length
      || role.roleKnowledge?.riskTags.length
      || (role.roleResearch && role.roleResearch.knowledgeStatus !== 'confirmed')
    )).length
    const tags = [{
      candidateId: candidate.id,
      label: candidate.style === 'chaos' || candidate.style === 'bluff-heavy' ? '高反转' : candidate.style === 'long-game' ? '长线耐玩' : '稳定',
      tone: candidate.style === 'chaos' || candidate.style === 'bluff-heavy' ? 'swingy' as const : 'stable' as const,
      reason: candidate.summary,
    }]
    if (riskyRoles >= 2) tags.push({
      candidateId: candidate.id,
      label: '裁量重',
      tone: 'storyteller_heavy',
      reason: '复杂/高风险角色较多，采用前建议说书人先准备口径。',
    })
    if (newPlayerCount >= Math.ceil(input.playerCount / 3) && riskyRoles > 0) tags.push({
      candidateId: candidate.id,
      label: '新手负担',
      tone: 'new_player_heavy',
      reason: '新手座较多且含复杂机制，可考虑降低信息噪音。',
    })
    return tags
  }).slice(0, 12)
}

function normalizeDraft(payload: ProviderSetupAdvicePayload, input: SetupAdviceProviderRequest): SetupAdviceDraft {
  const providerWarnings = stringArray(payload.warnings, 6)
  const balanceSummary = stringArray(payload.balanceSummary, 6)
  const storytellerNotes = stringArray(payload.storytellerNotes, 5)
  const qualityTags = normalizeQualityTags(payload.qualityTags, input)
  return {
    provider: 'openai-compatible',
    confidence: confidenceFrom(payload.confidence),
    draftOnly: true,
    recommendedCandidateIds: validCandidateIds(payload.recommendedCandidateIds, input),
    warnings: providerWarnings.length ? providerWarnings : roleKnowledgeWarnings(input),
    reasons: stringArray(payload.reasons, 6),
    balanceSummary: balanceSummary.length ? balanceSummary : fallbackBalanceSummary(input),
    storytellerNotes: storytellerNotes.length
      ? storytellerNotes
      : ['AI 只给最终配板复核和微调建议；身份、座位、状态仍由说书人确认。'],
    microAdjustments: normalizeMicroAdjustments(payload.microAdjustments, input),
    qualityTags: qualityTags.length ? qualityTags : fallbackQualityTags(input),
    disclaimer: text(payload.disclaimer, 'AI 配板建议只是草稿，采用前必须由说书人确认。'),
  }
}

export function fallbackSetupAdviceDraft(
  input: SetupAdviceProviderRequest,
  warning = 'AI 配板建议不可用，已使用本地模板顺序。',
): SetupAdviceDraft {
  const knowledgeWarnings = roleKnowledgeWarnings(input)
  return {
    provider: 'fake',
    confidence: input.candidates.length ? 'medium' : 'low',
    draftOnly: true,
    recommendedCandidateIds: input.candidates.slice(0, 3).map((candidate) => candidate.id),
    warnings: input.candidates.length ? [warning, ...knowledgeWarnings] : ['当前人数暂无已核对模板候选。'],
    reasons: input.candidates.slice(0, 3).map((candidate) => candidate.summary),
    balanceSummary: fallbackBalanceSummary(input),
    storytellerNotes: [
      'AI 平衡分析只用于最后配板复核；采用候选前仍由说书人确认。',
      '角色池微调建议不会自动改座位、身份或状态。',
    ],
    microAdjustments: fallbackMicroAdjustments(input),
    qualityTags: fallbackQualityTags(input),
    disclaimer: '本地配板草稿仅来自已核对模板；说书人确认前不生效。',
  }
}

export function createOpenAICompatibleSetupAdviceProvider(options: OpenAISetupAdviceProviderOptions) {
  return {
    async generateSetupAdvice(input: SetupAdviceProviderRequest): Promise<SetupAdviceProviderResult> {
      const payload = await callOpenAICompatibleJSON<ProviderSetupAdvicePayload>({
        baseUrl: options.baseUrl,
        model: options.model,
        apiKey: options.apiKey,
        timeoutSeconds: options.timeoutSeconds,
        fetcher: options.fetcher,
      }, buildSetupAdviceProviderMessages(input))
      const draft = normalizeDraft(payload, input)
      if (!draft.recommendedCandidateIds.length) {
        throw new AIProviderError('AI_PROVIDER_BAD_RESPONSE', 502)
      }
      return { draft, warnings: ['provider_setup_advice', 'draft_only'] }
    },
  }
}
