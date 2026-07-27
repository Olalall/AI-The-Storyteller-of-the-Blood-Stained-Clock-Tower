import type { PlayerCount, SetupTemplate, SetupTemplateStyle } from '../../domain/scripts'
import { createScriptRegistry } from '../../domain/scripts'
import { catfishingSmartScriptPack } from '../../domain/scripts/packs/catfishing'
import { selectSetupCandidates, type RandomSource } from '../../services/setup-candidates'
import type { DemonBluffAdvice, SetupAssignment, SetupRationale, SetupRuleSelection } from '../game-session/types'
import { catfishingRoleSnapshots } from '../night-workbench/data/catfishing'
import type { RoleSnapshot } from '../night-workbench/types'
import { catfishingCandidateSpecs } from './catfishingCandidateSpecs'
import { catfishingSetupRulePack } from './catfishingSetupRules'
import { evaluateSetupRules } from './setupRuleEvaluator'
import type {
  CatfishingPrototypeCandidate,
  CatfishingSetupStyle,
  SetupLegalityCheck,
  SetupLegalityReport,
  SetupSeatProfile,
  SetupTeam,
} from './types'

const KNOWLEDGE_VERSION = 'catfishing-11.1.1/smart-setup-v1'
const defaultPlayerCount: PlayerCount = 12
const playableCounts = new Set<PlayerCount>([7, 8, 9, 10, 11, 12, 13, 14, 15])
const catfishingRegistry = createScriptRegistry([catfishingSmartScriptPack])
const specById = new Map(catfishingCandidateSpecs.map((spec) => [spec.id, spec]))

export const catfishingRoleTeamById: Readonly<Record<string, SetupTeam>> = {
  investigator: 'townsfolk',
  chef: 'townsfolk',
  grandmother: 'townsfolk',
  balloonist: 'townsfolk',
  dreamer: 'townsfolk',
  fortuneteller: 'townsfolk',
  snakecharmer: 'townsfolk',
  gambler: 'townsfolk',
  savant: 'townsfolk',
  philosopher: 'townsfolk',
  ravenkeeper: 'townsfolk',
  amnesiac: 'townsfolk',
  cannibal: 'townsfolk',
  drunk: 'outsider',
  recluse: 'outsider',
  sweetheart: 'outsider',
  mutant: 'outsider',
  lunatic: 'outsider',
  godfather: 'minion',
  cerenovus: 'minion',
  pithag: 'minion',
  widow: 'minion',
  imp: 'demon',
  vigormortis: 'demon',
  fanggu: 'demon',
}

const roleComplexity: Readonly<Record<string, number>> = {
  investigator: 0,
  chef: 0,
  grandmother: 1,
  balloonist: 1,
  dreamer: 2,
  fortuneteller: 1,
  snakecharmer: 2,
  gambler: 1,
  savant: 2,
  philosopher: 2,
  ravenkeeper: 1,
  amnesiac: 2,
  cannibal: 2,
  drunk: 0,
  recluse: 1,
  sweetheart: 0,
  mutant: 1,
  lunatic: 2,
  godfather: 1,
  cerenovus: 2,
  pithag: 2,
  widow: 2,
  imp: 1,
  vigormortis: 2,
  fanggu: 2,
}

const experienceRank = {
  new: 0,
  regular: 1,
  veteran: 2,
} as const

export const catfishingPrototypeSeatProfiles: readonly SetupSeatProfile[] = [
  { seatId: 1, experience: 'new' },
  { seatId: 2, experience: 'regular' },
  { seatId: 3, experience: 'veteran' },
  { seatId: 4, experience: 'regular' },
  { seatId: 5, experience: 'new' },
  { seatId: 6, experience: 'regular' },
  { seatId: 7, experience: 'veteran' },
  { seatId: 8, experience: 'regular' },
  { seatId: 9, experience: 'new' },
  { seatId: 10, experience: 'veteran' },
  { seatId: 11, experience: 'regular' },
  { seatId: 12, experience: 'veteran' },
]

export interface CreateCatfishingPrototypeCandidatesOptions {
  count?: number
  seed?: string | number
  random?: RandomSource
}

const roleById = new Map(catfishingRoleSnapshots.map((role) => [role.id, role]))

function cloneRole(roleId: string): RoleSnapshot {
  const role = roleById.get(roleId)
  if (!role) throw new Error(`Catfishing 原型缺少角色：${roleId}`)
  return { ...role }
}

function playerCountFromSeatProfiles(seatProfiles: readonly SetupSeatProfile[]): PlayerCount {
  const playerCount = seatProfiles.length
  const seatIds = seatProfiles.map((profile) => profile.seatId)
  const expectedSeatIds = Array.from({ length: playerCount }, (_value, index) => index + 1)
  const actualSeatIds = [...new Set(seatIds)].sort((left, right) => left - right)

  if (!playableCounts.has(playerCount as PlayerCount) || actualSeatIds.join(',') !== expectedSeatIds.join(',')) {
    throw new Error(`Catfishing 开局需要 7—15 人，且座位必须为 1 至 ${playerCount} 号`)
  }
  return playerCount as PlayerCount
}

function assignRolesToSeats(
  roleIds: readonly string[],
  seatProfiles: readonly SetupSeatProfile[],
): SetupAssignment[] {
  const orderedRoles = roleIds
    .map((roleId, index) => ({ roleId, index, complexity: roleComplexity[roleId] ?? 1 }))
    .sort((left, right) => left.complexity - right.complexity || left.index - right.index)
  const orderedSeats = [...seatProfiles].sort((left, right) => (
    experienceRank[left.experience] - experienceRank[right.experience]
    || left.seatId - right.seatId
  ))

  return orderedRoles
    .map((role, index) => ({
      seatId: orderedSeats[index].seatId,
      role: cloneRole(role.roleId),
    }))
    .sort((left, right) => left.seatId - right.seatId)
}

function buildPlayerFit(seatProfiles: readonly SetupSeatProfile[], stylePlayerFit: string) {
  const newPlayerCount = seatProfiles.filter((profile) => profile.experience === 'new').length
  const veteranCount = seatProfiles.filter((profile) => profile.experience === 'veteran').length
  return `${newPlayerCount}个新手座优先匹配低负担角色，${veteranCount}个熟练座承接复杂互动。${stylePlayerFit}`
}

function toSetupRuleSelections(template: SetupTemplate): SetupRuleSelection[] {
  return template.setupAdjustments
    ?.flatMap((adjustment) => adjustment.choiceId ? [{ ruleId: adjustment.ruleId, choiceId: adjustment.choiceId }] : [])
    ?? []
}

function candidateStyle(style: SetupTemplateStyle): CatfishingSetupStyle {
  if (style === 'long-game') return 'participation'
  if (style === 'chaos') return 'reversal'
  return 'balanced'
}

function candidatePace(style: SetupTemplateStyle): SetupRationale['pace'] {
  if (style === 'long-game') return 'long'
  if (style === 'chaos') return 'swingy'
  return 'steady'
}

function titleForTemplate(template: SetupTemplate) {
  const spec = specById.get(template.templateId)
  if (spec) return spec.title
  const templateTitles: Readonly<Record<string, string>> = {
    'catfishing-7-first-info': '新手首夜线',
    'catfishing-7-balanced': '七人均衡',
    'catfishing-7-fanggu-outsider': '七人反转',
    'catfishing-15-classic-pressure': '十五人稳压',
    'catfishing-15-long-game': '十五人长线',
    'catfishing-15-reversal': '十五人反转',
  }
  return templateTitles[template.templateId] ?? `${template.playerCount}人组合`
}

function rationaleForTemplate(template: SetupTemplate, seatProfiles: readonly SetupSeatProfile[]): SetupRationale {
  const spec = specById.get(template.templateId)
  if (spec) return { ...spec.rationale, playerFit: buildPlayerFit(seatProfiles, spec.rationale.playerFit) }
  const styleFit = template.style === 'beginner'
    ? '信息清晰，适合新手多的桌。'
    : template.style === 'long-game'
      ? '持续互动较多，适合想玩久一点的桌。'
      : template.style === 'chaos'
        ? '反转和身份错认更多，适合熟练玩家偏多。'
        : '信息与干扰较均衡，适合标准桌。'
  const risk = template.style === 'chaos'
    ? '波动较大；舞蛇人、疯子、方古等变化必须人工确认后再写状态。'
    : template.style === 'long-game'
      ? '夜间记录更多；主持时要把每次选择和信息分开保存。'
      : '信息给得过硬时可能缩短局时；必要时用毒醉和伪装解释矛盾。'

  return {
    summary: template.notes[0] ?? `${template.playerCount}人已核对模板。`,
    pace: candidatePace(template.style),
    playerFit: buildPlayerFit(seatProfiles, styleFit),
    risk,
  }
}

function buildDemonBluffAdvice(template: SetupTemplate): DemonBluffAdvice {
  const spec = specById.get(template.templateId)
  const items = spec
    ? spec.bluffAdvice.map((item) => ({
      role: cloneRole(item.roleId),
      reason: item.reason,
      risk: item.risk,
    }))
    : template.bluffs.map((roleId) => ({
      role: cloneRole(roleId),
      reason: '未在场镇民，方便邪恶方讲出可追但不锁死的身份线。',
      risk: '使用前核对本局已给出的信息，避免伪装与日志冲突。',
    }))

  return { source: 'prototype', items }
}

export function validateCatfishingSetup(
  assignments: readonly SetupAssignment[],
  demonBluffs: readonly RoleSnapshot[],
  expectedSeatIds: readonly number[] = Array.from({ length: defaultPlayerCount }, (_value, index) => index + 1),
  setupRuleSelections: readonly SetupRuleSelection[] = [],
): SetupLegalityCheck[] {
  return evaluateCatfishingSetup(assignments, demonBluffs, expectedSeatIds, setupRuleSelections).checks
}

export function evaluateCatfishingSetup(
  assignments: readonly SetupAssignment[],
  demonBluffs: readonly RoleSnapshot[],
  expectedSeatIds: readonly number[] = Array.from({ length: defaultPlayerCount }, (_value, index) => index + 1),
  setupRuleSelections: readonly SetupRuleSelection[] = [],
): SetupLegalityReport {
  return evaluateSetupRules({
    assignments,
    demonBluffs,
    expectedSeatIds,
    playerCount: expectedSeatIds.length,
    rulePack: catfishingSetupRulePack,
    selections: setupRuleSelections,
    teamForRole: catfishingRoleTeamById,
  })
}

export function createCatfishingPrototypeCandidates(
  seatProfiles: readonly SetupSeatProfile[] = catfishingPrototypeSeatProfiles,
  options: CreateCatfishingPrototypeCandidatesOptions = {},
): CatfishingPrototypeCandidate[] {
  const playerCount = playerCountFromSeatProfiles(seatProfiles)
  const expectedSeatIds = Array.from({ length: playerCount }, (_value, index) => index + 1)
  const candidates = selectSetupCandidates({
    registry: catfishingRegistry,
    scriptId: 'catfishing',
    playerCount,
    count: options.count ?? 3,
    seed: options.seed,
    random: options.random,
  })

  return candidates.map(({ template }) => {
    const assignments = assignRolesToSeats(template.roles, seatProfiles)
    const demonBluffs = template.bluffs.map(cloneRole)
    const setupRuleSelections = toSetupRuleSelections(template)
    const legalityChecks = validateCatfishingSetup(assignments, demonBluffs, expectedSeatIds, setupRuleSelections)
    const failedCheck = legalityChecks.find((check) => !check.passed)
    if (failedCheck) throw new Error(`非法配板模板：${template.templateId} / ${failedCheck.summary}`)

    return {
      id: template.templateId,
      style: candidateStyle(template.style),
      title: titleForTemplate(template),
      scriptId: 'catfishing',
      playerCount,
      knowledgeVersion: KNOWLEDGE_VERSION,
      assignments,
      demonBluffs,
      setupRuleSelections,
      setupRulePackVersion: catfishingSetupRulePack.version,
      demonBluffAdvice: buildDemonBluffAdvice(template),
      rationale: rationaleForTemplate(template, seatProfiles),
      source: 'prototype',
      legalityChecks,
    }
  })
}
