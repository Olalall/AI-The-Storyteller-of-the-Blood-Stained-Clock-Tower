import type { KnowledgeStatus, PlayerCount, SmartScriptPack } from './types'

const REQUIRED_PLAYER_COUNTS: readonly PlayerCount[] = [7, 8, 9, 10, 11, 12, 13, 14, 15]

export type ScriptReadiness = 'ready' | 'review' | 'blocked'

export interface KnowledgeStatusCounts {
  confirmed: number
  needsReview: number
  missing: number
  total: number
}

export interface ScriptQualitySummary {
  scriptId: string
  displayName: string
  readiness: ScriptReadiness
  readinessLabel: string
  aiQualityLabel: string
  roleStatus: KnowledgeStatusCounts
  setupRuleStatus: KnowledgeStatusCounts
  nightOrderStatus: KnowledgeStatusCounts
  roleResearch: {
    reviewed: number
    total: number
  }
  setupTemplates: {
    verified: number
    total: number
  }
  playerCounts: {
    covered: readonly PlayerCount[]
    missing: readonly PlayerCount[]
  }
  warnings: readonly string[]
}

export interface ScriptQualityReport {
  totals: {
    scripts: number
    ready: number
    review: number
    blocked: number
    roles: number
    templates: number
  }
  items: readonly ScriptQualitySummary[]
}

export function buildScriptQualityReport(packs: readonly SmartScriptPack[]): ScriptQualityReport {
  const items = packs.map(buildScriptQualitySummary)

  return {
    totals: {
      scripts: items.length,
      ready: items.filter((item) => item.readiness === 'ready').length,
      review: items.filter((item) => item.readiness === 'review').length,
      blocked: items.filter((item) => item.readiness === 'blocked').length,
      roles: items.reduce((sum, item) => sum + item.roleStatus.total, 0),
      templates: items.reduce((sum, item) => sum + item.setupTemplates.total, 0),
    },
    items,
  }
}

export function buildScriptQualitySummary(pack: SmartScriptPack): ScriptQualitySummary {
  const roleStatus = countKnowledgeStatuses(pack.roles.map((role) => role.knowledgeStatus))
  const setupRuleStatus = countKnowledgeStatuses(pack.setupRules.map((rule) => rule.knowledgeStatus))
  const nightEntries = [...pack.nightOrders.firstNight, ...pack.nightOrders.otherNight]
  const nightOrderStatus = countKnowledgeStatuses(nightEntries.map((entry) => entry.knowledgeStatus))
  const coveredPlayerCounts = REQUIRED_PLAYER_COUNTS.filter((count) => {
    const hasCount = pack.playerCounts.includes(count)
    const hasTemplate = pack.setupTemplates.some((template) => template.playerCount === count)
    return hasCount && hasTemplate
  })
  const missingPlayerCounts = REQUIRED_PLAYER_COUNTS.filter((count) => !coveredPlayerCounts.includes(count))
  const verifiedTemplateCount = pack.setupTemplates.filter((template) => template.verified).length
  const reviewedRoleCount = pack.roles.filter((role) => hasReviewedResearch(role.research)).length

  const warnings = buildWarnings({
    missingPlayerCounts,
    roleStatus,
    setupRuleStatus,
    nightOrderStatus,
    reviewedRoleCount,
    totalRoles: pack.roles.length,
    verifiedTemplateCount,
    totalTemplates: pack.setupTemplates.length,
    packStatus: pack.knowledgeStatus,
  })
  const readiness = decideReadiness({
    missingPlayerCounts,
    roleStatus,
    setupRuleStatus,
    nightOrderStatus,
    reviewedRoleCount,
    totalRoles: pack.roles.length,
    verifiedTemplateCount,
    totalTemplates: pack.setupTemplates.length,
    packStatus: pack.knowledgeStatus,
  })

  return {
    scriptId: pack.scriptId,
    displayName: pack.displayName,
    readiness,
    readinessLabel: readinessText(readiness),
    aiQualityLabel: aiQualityText(readiness),
    roleStatus,
    setupRuleStatus,
    nightOrderStatus,
    roleResearch: {
      reviewed: reviewedRoleCount,
      total: pack.roles.length,
    },
    setupTemplates: {
      verified: verifiedTemplateCount,
      total: pack.setupTemplates.length,
    },
    playerCounts: {
      covered: coveredPlayerCounts,
      missing: missingPlayerCounts,
    },
    warnings,
  }
}

function countKnowledgeStatuses(statuses: readonly KnowledgeStatus[]): KnowledgeStatusCounts {
  return {
    confirmed: statuses.filter((status) => status === 'confirmed').length,
    needsReview: statuses.filter((status) => status === 'needs-review').length,
    missing: statuses.filter((status) => status === 'missing').length,
    total: statuses.length,
  }
}

function hasReviewedResearch(research: SmartScriptPack['roles'][number]['research']) {
  return Boolean(research?.reviewedAt && research.sourceUrls.length > 0)
}

interface QualityDecisionInput {
  missingPlayerCounts: readonly PlayerCount[]
  roleStatus: KnowledgeStatusCounts
  setupRuleStatus: KnowledgeStatusCounts
  nightOrderStatus: KnowledgeStatusCounts
  reviewedRoleCount: number
  totalRoles: number
  verifiedTemplateCount: number
  totalTemplates: number
  packStatus: KnowledgeStatus
}

function decideReadiness(input: QualityDecisionInput): ScriptReadiness {
  if (
    input.missingPlayerCounts.length > 0 ||
    input.totalRoles === 0 ||
    input.totalTemplates === 0 ||
    input.nightOrderStatus.total === 0 ||
    input.roleStatus.missing > 0 ||
    input.setupRuleStatus.missing > 0 ||
    input.nightOrderStatus.missing > 0
  ) {
    return 'blocked'
  }

  if (
    input.packStatus !== 'confirmed' ||
    input.roleStatus.needsReview > 0 ||
    input.setupRuleStatus.needsReview > 0 ||
    input.nightOrderStatus.needsReview > 0 ||
    input.reviewedRoleCount < input.totalRoles ||
    input.verifiedTemplateCount < input.totalTemplates
  ) {
    return 'review'
  }

  return 'ready'
}

function buildWarnings(input: QualityDecisionInput) {
  const warnings: string[] = []
  if (input.missingPlayerCounts.length > 0) warnings.push(`缺人数 ${input.missingPlayerCounts.join('、')}`)
  if (input.roleStatus.missing > 0) warnings.push(`角色缺知识 ${input.roleStatus.missing}`)
  if (input.roleStatus.needsReview > 0) warnings.push(`角色待复核 ${input.roleStatus.needsReview}`)
  if (input.reviewedRoleCount < input.totalRoles) warnings.push(`调研 ${input.reviewedRoleCount}/${input.totalRoles}`)
  if (input.verifiedTemplateCount < input.totalTemplates) warnings.push(`模板 ${input.verifiedTemplateCount}/${input.totalTemplates}`)
  if (input.setupRuleStatus.missing > 0) warnings.push(`规则缺知识 ${input.setupRuleStatus.missing}`)
  if (input.setupRuleStatus.needsReview > 0) warnings.push(`规则待复核 ${input.setupRuleStatus.needsReview}`)
  if (input.nightOrderStatus.missing > 0) warnings.push(`夜序缺知识 ${input.nightOrderStatus.missing}`)
  if (input.nightOrderStatus.needsReview > 0) warnings.push(`夜序待复核 ${input.nightOrderStatus.needsReview}`)
  if (input.packStatus !== 'confirmed') warnings.push('板子待复核')
  return warnings.slice(0, 4)
}

function readinessText(readiness: ScriptReadiness) {
  if (readiness === 'ready') return '可开局'
  if (readiness === 'review') return '需复核'
  return '暂缓'
}

function aiQualityText(readiness: ScriptReadiness) {
  if (readiness === 'ready') return 'AI强'
  if (readiness === 'review') return 'AI可用'
  return 'AI偏弱'
}
