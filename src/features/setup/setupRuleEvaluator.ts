import { isValidSetupCountChangeForRole, resolveSetupCountChanges } from '../../domain/setup-templates/setupCountChanges'
import { kazaliOpeningCounts } from '../../domain/setup-templates/kazaliOpening'
import { isLilMonstaCountChange, isNonSeatedLilMonstaChoice } from '../../domain/setup-templates/lilMonstaOpening'
import type { SetupAssignment, SetupRuleSelection } from '../game-session/types'
import type { RoleSnapshot } from '../night-workbench/types'
import { emptyTeamCounts } from './baseDistribution'
import type {
  ScriptSetupRulePack,
  SetupLegalityCheck,
  SetupLegalityReport,
  SetupModifierRule,
  SetupRuleChoice,
  SetupTeam,
  TeamCounts,
} from './types'

interface EvaluateSetupRulesInput {
  assignments: readonly SetupAssignment[]
  demonBluffs: readonly RoleSnapshot[]
  expectedSeatIds: readonly number[]
  playerCount: number
  rulePack: ScriptSetupRulePack
  selections?: readonly SetupRuleSelection[]
  teamForRole: Readonly<Record<string, SetupTeam>>
  repeatableRoleIds?: readonly string[]
  modifierSourceRoleIds?: readonly string[]
}

function check(id: string, status: SetupLegalityCheck['status'], summary: string, detail?: string, source?: string): SetupLegalityCheck {
  return { id, status, passed: status === 'pass' || status === 'review', summary, detail, source }
}

function cloneCounts(counts: TeamCounts): TeamCounts {
  return { ...counts }
}

function sameCounts(left: TeamCounts, right: TeamCounts) {
  return Object.keys(left).every((team) => left[team as SetupTeam] === right[team as SetupTeam])
}

function formatCounts(counts: TeamCounts) {
  return `镇民${counts.townsfolk} · 外来者${counts.outsider} · 爪牙${counts.minion} · 恶魔${counts.demon}`
}

function hasOnlyAllowedDuplicateRoles(roleIds: readonly string[], repeatableRoleIds: readonly string[]) {
  const repeatable = new Set(repeatableRoleIds)
  const seen = new Set<string>()
  for (const roleId of roleIds) {
    if (!seen.has(roleId)) {
      seen.add(roleId)
      continue
    }

    if (!repeatable.has(roleId)) return false
  }

  return true
}

function selectedChoice(
  rule: SetupModifierRule,
  selectionByRule: Map<string, SetupRuleSelection>,
  hasConfirmedSourceSnapshot: boolean,
): { choice: SetupRuleChoice | null; check: SetupLegalityCheck | null; selected?: SetupRuleSelection } {
  const selected = selectionByRule.get(rule.id)
  if (!selected && (rule.requiresStorytellerChoice || (rule.requiresSelectionForNewSetup && !hasConfirmedSourceSnapshot))) {
    return {
      choice: null,
      check: check('choice-required', 'needs_choice', `缺少配板修正：${rule.label}`, '当前草稿没有带入智能配板采用的人数修正；请重新生成候选。', rule.source),
    }
  }

  if (!selected) {
    return {
      choice: null,
      check: check(
        'choice-not-selected',
        'pass',
        `${rule.label}：不修正人数`,
        '当前模板未采用该角色的人数修正。',
        rule.source,
      ),
    }
  }

  const choice = rule.choices.find((option) => option.id === selected.choiceId)
  if (!choice) {
    return {
      choice: null,
      check: check('choice-invalid', 'fail', `开局修正无效：${rule.label}`, '当前草稿引用了规则包中不存在的选项。', rule.source),
      selected,
    }
  }

  return { choice, check: null, selected }
}

/**
 * 只校验配板快照：人数、明确录入的开局修正、冲突和恶魔伪装。
 * 这里绝不计算夜间结果、玩家状态或胜负。
 */
export function evaluateSetupRules({
  assignments,
  demonBluffs,
  expectedSeatIds,
  playerCount,
  rulePack,
  selections = [],
  teamForRole,
  repeatableRoleIds = [],
  modifierSourceRoleIds,
}: EvaluateSetupRulesInput): SetupLegalityReport {
  const roleIds = assignments.map((assignment) => assignment.role.id)
  const seatIds = assignments.map((assignment) => assignment.seatId)
  const inPlay = new Set(roleIds)
  const modifierSources = new Set(modifierSourceRoleIds ?? roleIds)
  const actualCounts = emptyTeamCounts()
  roleIds.forEach((roleId) => {
    const team = teamForRole[roleId]
    if (team) actualCounts[team] += 1
  })
  const checks: SetupLegalityCheck[] = []
  const expectedSeats = [...expectedSeatIds].sort((left, right) => left - right)
  const actualSeats = [...new Set(seatIds)].sort((left, right) => left - right)

  checks.push(check(
    'seats',
    assignments.length === expectedSeats.length && actualSeats.join(',') === expectedSeats.join(',') ? 'pass' : 'fail',
    '座位已一一分配',
    `当前 ${assignments.length}/${expectedSeats.length} 个座位。`,
  ))
  checks.push(check(
    'roles',
    roleIds.length === playerCount &&
      hasOnlyAllowedDuplicateRoles(roleIds, repeatableRoleIds) &&
      roleIds.every((roleId) => Boolean(teamForRole[roleId])) ? 'pass' : 'fail',
    '角色来自当前剧本，重复角色需显式允许',
  ))

  const baseCounts = rulePack.baseDistributionByPlayerCount[playerCount]
  if (!baseCounts) {
    checks.push(check('player-count', 'fail', `不支持 ${playerCount} 人基础人数`, '规则包只接受 7—15 人的标准阵营数量。'))
  }

  const selectionByRule = new Map(selections.map((selection) => [selection.ruleId, selection]))
  const activeSelections: SetupRuleSelection[] = []
  let expectedCounts = baseCounts ? cloneCounts(baseCounts) : null
  const appliedModifiers: { rule: SetupModifierRule; choice: SetupRuleChoice }[] = []
  rulePack.modifiers.forEach((rule) => {
    const hasExplicitSelection = selectionByRule.has(rule.id)
    if ((!modifierSources.has(rule.roleId) && (rule.requiresInPlay !== false || !hasExplicitSelection)) || !expectedCounts) return
    const result = selectedChoice(rule, selectionByRule, modifierSourceRoleIds !== undefined)
    if (result.check) {
      checks.push({ ...result.check, id: `modifier-${rule.id}` })
      return
    }
    if (!result.choice || !result.selected) return
    if (modifierSourceRoleIds === undefined && !isValidSetupCountChangeForRole(rule.roleId, result.choice.delta)) {
      checks.push(check(`modifier-${rule.id}`, 'fail', `开局人数修正无效：${rule.label}`, '当前选项与已核对的角色人数事实不符；请重新生成候选。', rule.source))
      return
    }
    appliedModifiers.push({ rule, choice: result.choice })
    activeSelections.push(result.selected)
  })

  if (expectedCounts) {
    const resolved = resolveSetupCountChanges(expectedCounts, appliedModifiers.map(({ choice }) => ({ delta: choice.delta, boundedTransfer: choice.boundedTransfer })))
    expectedCounts = resolved.counts
    const kazaliCounts = kazaliOpeningCounts(baseCounts, actualCounts, roleIds, teamForRole, modifierSourceRoleIds)
    if (kazaliCounts) {
      expectedCounts = kazaliCounts
      checks.push(check('modifier-kazali-opening', 'pass', modifierSourceRoleIds === undefined
        ? `卡扎力：无爪牙初始袋子，首夜选择 ${baseCounts.minion} 组玩家与爪牙角色`
        : '卡扎力：保留已确认的无爪牙开局来源',
      '外来者与镇民可由卡扎力设置调整；首夜选择不会由模板预定，身份与阵营仍须明确确认。',
      'https://wiki.bloodontheclocktower.com/Kazali'))
    }
    appliedModifiers.forEach(({ rule, choice }, index) => {
      const label = choice.boundedTransfer && resolved.effectiveDeltas[index].outsider === 0
        ? '无可移除外来者，不增加镇民' : choice.label
      checks.push({ id: `modifier-${rule.id}`, status: 'pass', passed: true,
        summary: `${rule.label}：${label}`, detail: `目标人数：${formatCounts(expectedCounts!)}`, source: rule.source })
    })
    checks.push(check(
      'team-counts',
      sameCounts(actualCounts, expectedCounts) ? 'pass' : 'fail',
      '阵营人数符合已选开局修正',
      `当前 ${formatCounts(actualCounts)}；目标 ${formatCounts(expectedCounts)}。`,
    ))
  }

  const conflictChecks = rulePack.conflicts.filter((conflict) => conflict.roleIds.every((roleId) => inPlay.has(roleId)))
  if (conflictChecks.length === 0) {
    checks.push(check(
      'role-conflicts',
      'review',
      '未录入专项冲突',
      '规则包不会根据角色名称猜冲突；导入带来源的剧本冲突资料后才会自动拦截。',
    ))
  } else {
    conflictChecks.forEach((conflict) => checks.push({
      id: `conflict-${conflict.id}`,
      status: conflict.severity,
      passed: conflict.severity !== 'fail',
      summary: conflict.summary,
      source: conflict.source,
    }))
  }

  const bluffIds = demonBluffs.map((role) => role.id)
  const bluffPolicy = rulePack.demonBluffPolicy
  const eligibleBluffTeams = new Set(bluffPolicy.eligibleTeams ?? [bluffPolicy.eligibleTeam])
  const bluffCount = appliedModifiers.some(({ rule, choice }) => rule.roleId === 'lilmonsta' && isNonSeatedLilMonstaChoice(rule.id, choice.id) && isLilMonstaCountChange(choice.delta)) ? 0 : bluffPolicy.count
  const validBluffs = bluffIds.length === bluffCount &&
    new Set(bluffIds).size === bluffCount &&
    bluffIds.every((roleId) => eligibleBluffTeams.has(teamForRole[roleId]) &&
      (!bluffPolicy.requireNotInPlay || !inPlay.has(roleId)))
  checks.push(check(
    'demon-bluffs',
    validBluffs ? 'pass' : 'fail',
    '恶魔伪装可用',
    bluffPolicy.summary ?? `${bluffPolicy.count} 个不同的未在场镇民角色。`,
  ))

  return {
    baseCounts: baseCounts ? cloneCounts(baseCounts) : null,
    expectedCounts,
    actualCounts,
    activeSelections,
    checks,
  }
}

export function hasBlockingSetupIssue(report: SetupLegalityReport) {
  return report.checks.some((item) => item.status === 'fail' || item.status === 'needs_choice')
}
