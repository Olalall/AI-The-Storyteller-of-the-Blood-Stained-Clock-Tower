import type { PlayerCount, ScriptId, SetupTemplate, SetupTemplateStyle, SmartScriptPack, SmartRoleDefinition } from '../../domain/scripts'
import { getSmartScriptPack, roleSnapshotsForScript, roleTeamByIdForScript, scriptKnowledgeVersion, smartScriptRegistry } from '../../domain/scripts'
import { selectSetupCandidates, type RandomSource } from '../../services/setup-candidates'
import type { DemonBluffAdvice, SetupAssignment, SetupRationale, SetupRuleSelection } from '../game-session/types'
import type { RoleSnapshot } from '../night-workbench/types'
import { baseDistributionByPlayerCount } from './baseDistribution'
import { evaluateSetupRules } from './setupRuleEvaluator'
import type {
  ScriptSetupRulePack,
  SetupLegalityCheck,
  SetupLegalityReport,
  SetupPrototypeCandidate,
  SetupSeatProfile,
  SetupTeam,
} from './types'

const playableCounts = new Set<PlayerCount>([7, 8, 9, 10, 11, 12, 13, 14, 15])

const experienceRank = {
  new: 0,
  regular: 1,
  veteran: 2,
} as const

export interface CreateSmartScriptCandidatesOptions {
  count?: number
  seed?: string | number
  random?: RandomSource
}

function playerCountFromSeatProfiles(seatProfiles: readonly SetupSeatProfile[]): PlayerCount {
  const playerCount = seatProfiles.length
  const seatIds = seatProfiles.map((profile) => profile.seatId)
  const expectedSeatIds = Array.from({ length: playerCount }, (_value, index) => index + 1)
  const actualSeatIds = [...new Set(seatIds)].sort((left, right) => left - right)

  if (!playableCounts.has(playerCount as PlayerCount) || actualSeatIds.join(',') !== expectedSeatIds.join(',')) {
    throw new Error(`智能板子开局需要 7—15 人，且座位必须为 1 至 ${playerCount} 号`)
  }
  return playerCount as PlayerCount
}

function complexityFor(role: SmartRoleDefinition) {
  const inputCost = role.inputKinds.filter((kind) => kind !== 'none').length
  const riskCost = role.research?.highRiskNotes.length ? 1 : 0
  const changeCost = (role.research?.identityChanges.length ?? 0) + (role.research?.teamChanges.length ?? 0)
  return inputCost + riskCost + changeCost
}

function assignRolesToSeats(
  roleIds: readonly string[],
  seatProfiles: readonly SetupSeatProfile[],
  pack: SmartScriptPack,
): SetupAssignment[] {
  const rolesById = new Map(pack.roles.map((role) => [role.id, role]))
  const snapshotsById = new Map(roleSnapshotsForScript(pack.scriptId).map((role) => [role.id, role]))
  const orderedRoles = roleIds
    .map((roleId, index) => {
      const role = rolesById.get(roleId)
      return { roleId, index, complexity: role ? complexityFor(role) : 1 }
    })
    .sort((left, right) => left.complexity - right.complexity || left.index - right.index)
  const orderedSeats = [...seatProfiles].sort((left, right) => (
    experienceRank[left.experience] - experienceRank[right.experience]
    || left.seatId - right.seatId
  ))

  return orderedRoles
    .map((role, index) => {
      const snapshot = snapshotsById.get(role.roleId)
      if (!snapshot) throw new Error(`智能板子 ${pack.scriptId} 缺少角色：${role.roleId}`)
      return {
        seatId: orderedSeats[index].seatId,
        role: { ...snapshot },
      }
    })
    .sort((left, right) => left.seatId - right.seatId)
}

function toSetupRuleSelections(template: SetupTemplate): SetupRuleSelection[] {
  return template.setupAdjustments
    ?.flatMap((adjustment) => adjustment.choiceId ? [{ ruleId: adjustment.ruleId, choiceId: adjustment.choiceId }] : [])
    ?? []
}

function candidateStyle(style: SetupTemplateStyle): SetupPrototypeCandidate['style'] {
  if (style === 'long-game') return 'participation'
  if (style === 'chaos' || style === 'bluff-heavy') return 'reversal'
  return 'balanced'
}

function candidatePace(style: SetupTemplateStyle): SetupRationale['pace'] {
  if (style === 'long-game') return 'long'
  if (style === 'chaos' || style === 'bluff-heavy') return 'swingy'
  return 'steady'
}

function styleLabel(style: SetupTemplateStyle) {
  if (style === 'beginner') return '新手友好'
  if (style === 'long-game') return '长线耐玩'
  if (style === 'chaos') return '高反转'
  if (style === 'bluff-heavy') return '伪装压力'
  return '均衡'
}

function titleForTemplate(template: SetupTemplate, pack: SmartScriptPack) {
  return `${pack.displayName.split('/').at(0)?.trim() ?? pack.displayName} · ${styleLabel(template.style)}`
}

function buildPlayerFit(seatProfiles: readonly SetupSeatProfile[]) {
  const newPlayerCount = seatProfiles.filter((profile) => profile.experience === 'new').length
  const veteranCount = seatProfiles.filter((profile) => profile.experience === 'veteran').length
  return `${newPlayerCount}个新手座优先低负担角色，${veteranCount}个熟练座承接复杂选择。`
}

function rationaleForTemplate(template: SetupTemplate, pack: SmartScriptPack, seatProfiles: readonly SetupSeatProfile[]): SetupRationale {
  const risk = template.setupAdjustments?.length
    ? '含开局人数修正；确认配板前先看人数核对。'
    : '无自动结算；夜晚结果仍由说书人确认。'
  return {
    summary: template.notes[0] ?? `${pack.displayName} ${template.playerCount}人已核对模板。`,
    pace: candidatePace(template.style),
    playerFit: `${buildPlayerFit(seatProfiles)}${styleLabel(template.style)}模板仅给提醒，不强制锁座。`,
    risk,
  }
}

function normalizedDemonBluffs(template: SetupTemplate, pack: SmartScriptPack) {
  const roleById = new Map(roleSnapshotsForScript(pack.scriptId).map((role) => [role.id, role]))
  const teamByRoleId = roleTeamByIdForScript(pack.scriptId)
  const inPlay = new Set(template.roles)
  const selected = new Set<string>()
  const eligibleTeams = new Set(pack.demonBluffPolicy?.eligibleTeams ?? ['townsfolk', 'outsider'])
  const requireNotInPlay = pack.demonBluffPolicy?.requireNotInPlay ?? true
  const count = pack.demonBluffPolicy?.count ?? 3

  function canUse(roleId: string) {
    if (selected.has(roleId)) return false
    if (!roleById.has(roleId)) return false
    if (!eligibleTeams.has(teamByRoleId[roleId])) return false
    return !requireNotInPlay || !inPlay.has(roleId)
  }

  const roleIds = [
    ...template.bluffs.filter(canUse),
    ...roleSnapshotsForScript(pack.scriptId).map((role) => role.id).filter(canUse),
  ]

  const output = []
  for (const roleId of roleIds) {
    if (!canUse(roleId)) continue
    const role = roleById.get(roleId)
    if (!role) continue
    selected.add(roleId)
    output.push({ ...role })
    if (output.length === count) return output
  }

  throw new Error(`\u677f\u5b50 ${pack.scriptId} / ${template.templateId} \u6ca1\u6709\u8db3\u591f\u5408\u6cd5\u4f2a\u88c5`)
}

function buildDemonBluffAdviceFromRoles(demonBluffs: ReturnType<typeof normalizedDemonBluffs>): DemonBluffAdvice {
  return {
    source: 'prototype',
    items: demonBluffs.map((role) => ({
      role: { ...role },
      reason: '\u672a\u5728\u573a\u4e14\u9635\u8425\u5408\u6cd5\uff0c\u9002\u5408\u4f5c\u4e3a\u6076\u9b54\u4f2a\u88c5\u3002',
      risk: '\u91c7\u7528\u524d\u8bf7\u8bf4\u4e66\u4eba\u624b\u52a8\u6838\u5bf9\u662f\u5426\u771f\u7684\u672a\u5728\u573a\u3002',
    })),
  }
}

function setupRuleChoiceLabel(ruleSummary: string, choiceId: string) {
  if (choiceId.includes('add-two')) return '增加2名外来者'
  if (choiceId.includes('add')) return '增加1名外来者'
  if (choiceId.includes('remove')) return '减少1名外来者'
  return ruleSummary
}

function normalizeRuleToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function inferModifierRoleId(ruleId: string, pack: SmartScriptPack) {
  const normalizedRuleId = normalizeRuleToken(ruleId)
  return pack.roles.find((role) => normalizedRuleId.includes(normalizeRuleToken(role.id)))?.id
}

export function createSetupRulePackForScript(pack: SmartScriptPack): ScriptSetupRulePack {
  const modifierByRule = new Map<string, ScriptSetupRulePack['modifiers'][number]>()
  for (const rule of pack.setupRules) {
    if (!rule.roleId) continue
    const adjustments = pack.setupTemplates
      .flatMap((template) => template.setupAdjustments ?? [])
      .filter((adjustment) => adjustment.ruleId === rule.id && adjustment.choiceId)
    if (!adjustments.length) continue
    const choices = [...new Map(adjustments.map((adjustment) => [adjustment.choiceId!, adjustment])).values()]
      .map((adjustment) => ({
        id: adjustment.choiceId!,
        label: setupRuleChoiceLabel(rule.summary, adjustment.choiceId!),
        delta: adjustment.compositionDelta,
      }))
    modifierByRule.set(rule.id, {
      id: rule.id,
      roleId: rule.roleId,
      label: rule.summary.split('：')[0] || rule.summary,
      choices,
      requiresStorytellerChoice: false,
      source: rule.summary,
    })
  }

  const setupRuleByRoleId = new Map(pack.setupRules
    .filter((rule) => rule.roleId)
    .map((rule) => [rule.roleId!, rule]))
  const adjustmentsByRuleId = new Map<string, NonNullable<SetupTemplate['setupAdjustments']>>()
  for (const template of pack.setupTemplates) {
    for (const adjustment of template.setupAdjustments ?? []) {
      adjustmentsByRuleId.set(adjustment.ruleId, [
        ...(adjustmentsByRuleId.get(adjustment.ruleId) ?? []),
        adjustment,
      ])
    }
  }
  for (const [ruleId, adjustments] of adjustmentsByRuleId) {
    if (modifierByRule.has(ruleId)) continue
    const roleId = inferModifierRoleId(ruleId, pack)
    if (!roleId) continue
    const role = pack.roles.find((item) => item.id === roleId)
    const sourceRule = setupRuleByRoleId.get(roleId)
    const choices = [...new Map(adjustments
      .filter((adjustment) => adjustment.choiceId)
      .map((adjustment) => [adjustment.choiceId!, adjustment])).values()]
      .map((adjustment) => ({
        id: adjustment.choiceId!,
        label: setupRuleChoiceLabel(sourceRule?.summary ?? adjustment.note ?? ruleId, adjustment.choiceId!),
        delta: adjustment.compositionDelta,
      }))
    if (!choices.length) continue
    modifierByRule.set(ruleId, {
      id: ruleId,
      roleId,
      label: role ? `${role.name}\u4eba\u6570\u4fee\u6b63` : ruleId,
      choices,
      requiresStorytellerChoice: false,
      source: sourceRule?.summary ?? adjustments.find((adjustment) => adjustment.note)?.note ?? ruleId,
    })
  }

  return {
    scriptId: pack.scriptId,
    version: `${pack.scriptId}/smart-setup-rules-v1`,
    baseDistributionByPlayerCount,
    modifiers: [...modifierByRule.values()],
    conflicts: [],
    demonBluffPolicy: {
      count: pack.demonBluffPolicy?.count ?? 3,
      eligibleTeam: pack.demonBluffPolicy?.eligibleTeams[0] ?? 'townsfolk',
      eligibleTeams: pack.demonBluffPolicy?.eligibleTeams ?? ['townsfolk', 'outsider'],
      requireNotInPlay: pack.demonBluffPolicy?.requireNotInPlay ?? true,
      summary: pack.demonBluffPolicy?.summary,
    },
  }
}

export function evaluateSmartScriptSetup(
  scriptId: ScriptId,
  assignments: readonly SetupAssignment[],
  demonBluffs: readonly RoleSnapshot[],
  expectedSeatIds: readonly number[],
  setupRuleSelections: readonly SetupRuleSelection[] = [],
  repeatableRoleIds: readonly string[] = [],
): SetupLegalityReport {
  const pack = getSmartScriptPack(scriptId)
  return evaluateSetupRules({
    assignments,
    demonBluffs,
    expectedSeatIds,
    playerCount: expectedSeatIds.length,
    rulePack: createSetupRulePackForScript(pack),
    selections: setupRuleSelections,
    teamForRole: roleTeamByIdForScript(pack.scriptId) as Readonly<Record<string, SetupTeam>>,
    repeatableRoleIds,
  })
}

export function validateSmartScriptSetup(
  scriptId: ScriptId,
  assignments: readonly SetupAssignment[],
  demonBluffs: readonly RoleSnapshot[],
  expectedSeatIds: readonly number[],
  setupRuleSelections: readonly SetupRuleSelection[] = [],
  repeatableRoleIds: readonly string[] = [],
): SetupLegalityCheck[] {
  return evaluateSmartScriptSetup(scriptId, assignments, demonBluffs, expectedSeatIds, setupRuleSelections, repeatableRoleIds).checks
}

function createCandidateFromTemplate(
  template: SetupTemplate,
  pack: SmartScriptPack,
  seatProfiles: readonly SetupSeatProfile[],
  expectedSeatIds: readonly number[],
  playerCount: PlayerCount,
): SetupPrototypeCandidate | null {
  const assignments = assignRolesToSeats(template.roles, seatProfiles, pack)
  const demonBluffs = normalizedDemonBluffs(template, pack)
  const setupRuleSelections = toSetupRuleSelections(template)
  const legalityChecks = validateSmartScriptSetup(
    pack.scriptId,
    assignments,
    demonBluffs,
    expectedSeatIds,
    setupRuleSelections,
    template.repeatableRoles ?? [],
  )
  const failedCheck = legalityChecks.find((check) => !check.passed && check.status !== 'review')
  if (failedCheck) return null

  return {
    id: template.templateId,
    style: candidateStyle(template.style),
    title: titleForTemplate(template, pack),
    scriptId: pack.scriptId,
    playerCount,
    knowledgeVersion: scriptKnowledgeVersion(pack),
    assignments,
    demonBluffs,
    repeatableRoleIds: template.repeatableRoles?.slice() ?? [],
    setupRuleSelections,
    setupRulePackVersion: `${pack.scriptId}/smart-setup-rules-v1`,
    demonBluffAdvice: buildDemonBluffAdviceFromRoles(demonBluffs),
    rationale: rationaleForTemplate(template, pack, seatProfiles),
    source: 'prototype',
    legalityChecks,
  }
}

export function createSmartScriptSetupCandidates(
  scriptId: ScriptId,
  seatProfiles: readonly SetupSeatProfile[],
  options: CreateSmartScriptCandidatesOptions = {},
): SetupPrototypeCandidate[] {
  const pack = getSmartScriptPack(scriptId)
  const playerCount = playerCountFromSeatProfiles(seatProfiles)
  const expectedSeatIds = Array.from({ length: playerCount }, (_value, index) => index + 1)
  const desiredCount = options.count ?? 3
  const candidates = selectSetupCandidates({
    registry: smartScriptRegistry,
    scriptId: pack.scriptId,
    playerCount,
    count: pack.setupTemplates.length,
    seed: options.seed,
    random: options.random,
  })

  const visibleCandidates = candidates
    .map(({ template }) => createCandidateFromTemplate(template, pack, seatProfiles, expectedSeatIds, playerCount))
    .filter((candidate): candidate is SetupPrototypeCandidate => Boolean(candidate))
    .slice(0, desiredCount)

  if (!visibleCandidates.length) {
    throw new Error(`智能板子 ${pack.scriptId} / ${playerCount} 人没有可显示的合法配板候选`)
  }

  return visibleCandidates
}
