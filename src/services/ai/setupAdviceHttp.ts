import {
  defaultArchiveRuntimeSettings,
  readArchiveRuntimeSettings,
  type ArchiveRuntimeSettings,
} from '../archive'
import type { SetupPrototypeCandidate } from '../../features/setup'
import { roleKnowledgeForAI } from '../../domain/role-knowledge'
import { getSmartScriptPack, roleResearchForAI } from '../../domain/scripts'
import type { AIConfidence, AIContextSeat, AIProviderKind, SetupAdviceRuntimeDraft, SetupBalanceMicroAdjustment, SetupQualityTag } from './types'

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface SetupAdviceBackendDraft {
  provider?: AIProviderKind
  confidence?: AIConfidence
  draftOnly?: boolean
  recommendedCandidateIds?: string[]
  warnings?: string[]
  reasons?: string[]
  balanceSummary?: string[]
  storytellerNotes?: string[]
  microAdjustments?: SetupBalanceMicroAdjustment[]
  qualityTags?: SetupQualityTag[]
  disclaimer?: string
}

interface SetupAdviceBackendResponse {
  accepted?: boolean
  data?: {
    draft?: SetupAdviceBackendDraft
  }
}

export interface CreateSetupAdviceDraftAsyncInput {
  scriptId: string
  scriptName: string
  knowledgeVersion: string
  playerCount: number
  seats: readonly AIContextSeat[]
  candidates: readonly SetupPrototypeCandidate[]
}

export interface CreateSetupAdviceDraftAsyncOptions {
  runtimeSettings?: ArchiveRuntimeSettings
  fetcher?: FetchLike
}

function urlFor(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/api/ai/setup-advice`
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

function roleFromPack(scriptId: string, roleId: string) {
  const pack = getSmartScriptPack(scriptId)
  const research = roleResearchForAI(scriptId, roleId)
  return pack.roles.find((role) => role.id === roleId || role.id === research?.roleId)
}

function rolePoolForScript(scriptId: string) {
  const pack = getSmartScriptPack(scriptId)
  return pack.roles
    .filter((role) => role.team !== 'traveler' && role.team !== 'fabled')
    .map((role) => {
      const research = roleResearchForAI(scriptId, role.id)
      return {
        roleId: role.id,
        roleName: role.name,
        team: role.team,
        abilityText: role.abilityText,
        knowledgeStatus: role.knowledgeStatus,
        inputKinds: role.inputKinds,
        setupImpact: research?.setupImpact ?? role.research?.setupImpact.slice(0, 3) ?? [],
        possibleOutcomes: research?.possibleOutcomes ?? role.research?.possibleOutcomes.slice(0, 5) ?? [],
        highRiskNotes: research?.highRiskNotes ?? role.research?.highRiskNotes.slice(0, 5) ?? [],
        roleKnowledge: roleKnowledgeForAI(role.id),
        roleResearch: research,
      }
    })
}

function localBalanceSummary(input: CreateSetupAdviceDraftAsyncInput) {
  if (!input.candidates.length) return ['当前人数没有可用候选，先补模板或换 7-15 人开局。']
  const top = input.candidates[0]
  const rolePool = rolePoolForScript(input.scriptId)
  const counts = top.assignments.reduce<Record<string, number>>((acc, assignment) => {
    const team = roleFromPack(input.scriptId, assignment.role.id)?.team ?? 'unknown'
    acc[team] = (acc[team] ?? 0) + 1
    return acc
  }, {})
  return [
    `首选候选 ${top.title}：阵营计数 ${Object.entries(counts).map(([team, count]) => `${team} ${count}`).join(' / ')}，仍需人工核对。`,
    `已随 AI 请求附带 ${rolePool.length} 个当前板子角色机制；微调只能从这个角色池提出。`,
    '平衡复核重点：信息强度、误导/中毒密度、邪恶伪装空间、死亡节奏和新手座位负担。',
  ]
}

function localMicroAdjustments(input: CreateSetupAdviceDraftAsyncInput): SetupBalanceMicroAdjustment[] {
  const rolePool = rolePoolForScript(input.scriptId)
  if (!rolePool.length) return []
  return input.candidates.slice(0, 2).flatMap((candidate) => {
    const inPlay = new Set(candidate.assignments.flatMap((assignment) => [
      assignment.role.id,
      roleFromPack(input.scriptId, assignment.role.id)?.id ?? assignment.role.id,
    ]))
    const riskyAssignment = candidate.assignments.find((assignment) => {
      const research = roleResearchForAI(input.scriptId, assignment.role.id)
      const knowledge = roleKnowledgeForAI(assignment.role.id)
      return Boolean(research?.highRiskNotes.length || knowledge?.riskTags.length)
    })
    if (!riskyAssignment) return []
    const outRole = roleFromPack(input.scriptId, riskyAssignment.role.id)
    const replacement = rolePool.find((role) => (
      role.team === outRole?.team
      && !inPlay.has(role.roleId)
      && !role.highRiskNotes?.length
    )) ?? rolePool.find((role) => role.team === outRole?.team && !inPlay.has(role.roleId))
    if (!replacement || !outRole) return []
    return [{
      candidateId: candidate.id,
      candidateTitle: candidate.title,
      replaceOutRoleId: riskyAssignment.role.id,
      replaceOutRoleName: riskyAssignment.role.name,
      replaceInRoleId: replacement.roleId,
      replaceInRoleName: replacement.roleName,
      reason: '本地兜底建议：发现高风险/复杂机制角色，可准备一个同阵营替换位给说书人手动选择。',
      expectedEffect: '降低裁量压力或信息噪音；不会自动应用。',
      risk: '替换后必须重新核对人数、阵营分布、伪装和该板子的特殊开局规则。',
    }]
  }).slice(0, 3)
}

function localQualityTags(input: CreateSetupAdviceDraftAsyncInput): SetupQualityTag[] {
  const newPlayerCount = input.seats.filter((seat) => seat.experience === 'new').length
  return input.candidates.flatMap((candidate) => {
    const riskyRoles = candidate.assignments.filter((assignment) => {
      const research = roleResearchForAI(input.scriptId, assignment.role.id)
      const knowledge = roleKnowledgeForAI(assignment.role.id)
      return Boolean(research?.highRiskNotes.length || knowledge?.riskTags.length)
    }).length
    const tags: SetupQualityTag[] = [{
      candidateId: candidate.id,
      label: candidate.rationale.pace === 'swingy' ? '高反转' : candidate.rationale.pace === 'long' ? '长线耐玩' : '稳定',
      tone: candidate.rationale.pace === 'swingy' ? 'swingy' : 'stable',
      reason: candidate.rationale.summary,
    }]
    if (riskyRoles >= 2) {
      tags.push({
        candidateId: candidate.id,
        label: '裁量重',
        tone: 'storyteller_heavy',
        reason: '在场复杂/高风险角色较多，建议说书人提前准备规则口径。',
      })
    }
    if (newPlayerCount >= Math.ceil(input.playerCount / 3) && riskyRoles > 0) {
      tags.push({
        candidateId: candidate.id,
        label: '新手负担',
        tone: 'new_player_heavy',
        reason: '新手座较多且候选含复杂机制，采用前可考虑更平滑的替换。',
      })
    }
    return tags
  }).slice(0, 12)
}

function localDraft(input: CreateSetupAdviceDraftAsyncInput, warning?: string): SetupAdviceRuntimeDraft {
  const roleWarnings = setupRoleKnowledgeWarnings(input)
  return {
    provider: 'fake',
    source: 'local',
    confidence: input.candidates.length ? 'medium' : 'low',
    draftOnly: true,
    recommendedCandidateIds: input.candidates.slice(0, 3).map((candidate) => candidate.id),
    warnings: warning ? [warning, ...roleWarnings] : roleWarnings,
    reasons: input.candidates.slice(0, 3).map((candidate) => candidate.rationale.summary),
    balanceSummary: localBalanceSummary(input),
    storytellerNotes: [
      '\u0041\u0049 \u5e73\u8861\u5206\u6790\u53ea\u7528\u4e8e\u6700\u540e\u914d\u677f\u590d\u6838\uff1b\u91c7\u7528\u5019\u9009\u524d\u4ecd\u7531\u8bf4\u4e66\u4eba\u786e\u8ba4\u3002',
      '\u5fae\u8c03\u5efa\u8bae\u53ea\u662f\u5728\u89d2\u8272\u6c60\u5185\u7ed9\u66ff\u6362\u65b9\u5411\uff0c\u4e0d\u4f1a\u81ea\u52a8\u6539\u5ea7\u4f4d\u3001\u8eab\u4efd\u6216\u72b6\u6001\u3002',
    ],
    microAdjustments: localMicroAdjustments(input),
    qualityTags: localQualityTags(input),
    disclaimer: '本地配板草稿仅来自已核对模板；说书人确认前不生效。',
    warning,
  }
}

function setupRoleKnowledgeWarnings(input: CreateSetupAdviceDraftAsyncInput) {
  const warnings = new Set<string>()
  for (const candidate of input.candidates.slice(0, 3)) {
    for (const assignment of candidate.assignments) {
      const knowledge = roleKnowledgeForAI(assignment.role.id)
      const research = roleResearchForAI(input.scriptId, assignment.role.id)
      knowledge?.reminders.slice(0, 1).forEach((reminder) => warnings.add(`${assignment.role.name}：${reminder}`))
      research?.highRiskNotes.slice(0, 1).forEach((note) => warnings.add(`${assignment.role.name}：${note}`))
    }
  }
  return [...warnings].slice(0, 5)
}

function requestBody(input: CreateSetupAdviceDraftAsyncInput) {
  return {
    scriptId: input.scriptId,
    scriptName: input.scriptName,
    knowledgeVersion: input.knowledgeVersion,
    playerCount: input.playerCount,
    seats: input.seats,
    rolePool: rolePoolForScript(input.scriptId),
    candidates: input.candidates.map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      style: candidate.style,
      summary: candidate.rationale.summary,
      playerFit: candidate.rationale.playerFit,
      risk: candidate.rationale.risk,
      roles: candidate.assignments.map((assignment) => ({
        seatId: assignment.seatId,
        roleId: assignment.role.id,
        roleName: assignment.role.name,
        team: roleFromPack(input.scriptId, assignment.role.id)?.team,
        abilityText: roleFromPack(input.scriptId, assignment.role.id)?.abilityText,
        roleKnowledge: roleKnowledgeForAI(assignment.role.id),
        roleResearch: roleResearchForAI(input.scriptId, assignment.role.id),
      })),
      demonBluffs: candidate.demonBluffs.map((role) => role.name),
      legalityChecks: candidate.legalityChecks.map((check) => ({
        id: check.id,
        status: check.status,
        summary: check.summary,
      })),
    })),
  }
}

function mapBackendDraft(draft: SetupAdviceBackendDraft, fallback: SetupAdviceRuntimeDraft): SetupAdviceRuntimeDraft {
  return {
    provider: draft.provider ?? 'openai-compatible',
    source: 'backend',
    confidence: draft.confidence ?? fallback.confidence,
    draftOnly: true,
    recommendedCandidateIds: draft.recommendedCandidateIds?.length
      ? draft.recommendedCandidateIds
      : fallback.recommendedCandidateIds,
    warnings: draft.warnings ?? fallback.warnings,
    reasons: draft.reasons ?? fallback.reasons,
    balanceSummary: draft.balanceSummary ?? fallback.balanceSummary,
    storytellerNotes: draft.storytellerNotes ?? fallback.storytellerNotes,
    microAdjustments: draft.microAdjustments ?? fallback.microAdjustments,
    qualityTags: draft.qualityTags ?? fallback.qualityTags,
    disclaimer: draft.disclaimer ?? fallback.disclaimer,
  }
}

export async function createSetupAdviceDraftAsync(
  input: CreateSetupAdviceDraftAsyncInput,
  options: CreateSetupAdviceDraftAsyncOptions = {},
): Promise<SetupAdviceRuntimeDraft> {
  const fallback = localDraft(input)
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
    const body = await response.json() as SetupAdviceBackendResponse
    if (!response.ok || body.accepted !== true || !body.data?.draft) throw new Error('setup advice failed')
    return mapBackendDraft(body.data.draft, fallback)
  } catch {
    return localDraft(input, '后端配板建议不可用，已使用本地模板。')
  }
}
