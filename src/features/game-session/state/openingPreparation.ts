import { normalizeRoleId, roleSnapshotsForScript, roleTeamByIdForScript } from '../../../domain/scripts'
import { openingRole } from '../../../domain/scripts/openingPreparation'
import type { GameSessionState, SetupAssignment } from '../types'
import type { OpeningChoice, OpeningPreparation } from '../model/openingTypes'
import { projectConfirmedSetup, projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { confirmPlayerStateChange } from './playerStateReducer'
import { confirmAbilityChange } from './abilityChanges'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { evaluateSmartScriptSetup } from '../../setup/smartScriptSetupCandidates'
import { hasBlockingSetupIssue } from '../../setup/setupRuleEvaluator'

export const openingAssignmentKey = (assignments: readonly SetupAssignment[]) =>
  assignments.map(a => `${a.seatId}:${a.role.id}`).sort().join('|')

export function openingPreparationIssues(scriptId: string, assignments: readonly SetupAssignment[], choices: readonly OpeningChoice[]) {
  const teams = roleTeamByIdForScript(scriptId), roles = roleSnapshotsForScript(scriptId)
  const seats = new Set(assignments.map(a => a.seatId))
  const issues: string[] = []
  for (const assignment of assignments) {
    const spec = openingRole(assignment.role.id)
    if (!spec) continue
    const prefix = `${assignment.seatId}号 ${assignment.role.name}：`
    const matches = choices.filter(c => c.seatId === assignment.seatId && c.roleId === assignment.role.id)
    const choice = matches[0]
    if (matches.length !== 1) { issues.push(prefix + '请完成开局准备'); continue }
    if (spec.kind === 'player' && !seats.has(choice.targetSeatId ?? 0)) issues.push(prefix + '请选择固定醉酒玩家')
    if (spec.kind === 'text' && (!choice.text?.trim() || choice.text.length > 400)) issues.push(prefix + '请填写' + spec.label)
    if (['minion', 'demon', 'townsfolk'].includes(spec.kind)) {
      const role = roles.find(r => r.id === choice.chosenRoleId)
      if (!role || teams[role.id] !== spec.kind) issues.push(prefix + '请选择' + spec.label)
      if (spec.kind === 'townsfolk' && !assignments.some(a => a.seatId === choice.targetSeatId && a.role.id === choice.sourceRoleId && teams[a.role.id] === 'townsfolk')) issues.push(prefix + '请选择实际标记的在场镇民玩家')
    }
    if (spec.kind === 'minion') {
      if (['marionette', 'mastermind', 'spy', 'widow', 'wraith'].includes(normalizeRoleId(choice.chosenRoleId ?? ''))) issues.push(prefix + '该爪牙没有可授予炼金术士的常规能力')
    }
    if (spec.kind === 'demon') {
      const minionCount = assignments.filter(a => teams[a.role.id] === 'minion').length
      if (!Array.isArray(choice.minionSeatIds) || choice.minionSeatIds.length !== minionCount || choice.minionSeatIds.length > 5
        || new Set(choice.minionSeatIds).size !== choice.minionSeatIds.length || choice.minionSeatIds.some(id => !seats.has(id) || id === choice.seatId)) issues.push(prefix + `请选择${minionCount}名假的爪牙`)
      if (choice.bluffRoleIds?.length !== 3 || new Set(choice.bluffRoleIds).size !== 3
        || choice.bluffRoleIds.some(id => !['townsfolk', 'outsider'].includes(teams[id]))) issues.push(prefix + '请选择三张不同的善良假伪装（允许在场）')
    }
  }
  if (choices.length > 15 || choices.some(c => !assignments.some(a => a.seatId === c.seatId && a.role.id === c.roleId && openingRole(a.role.id)))) issues.push('准备中含有已被替换的角色，请重新核对')
  return issues
}

export function currentOpeningPreparation(session: GameSessionState) {
  const setupId = projectConfirmedSetup(session)?.id
  return session.openingPreparations?.findLast(p => p.setupId === setupId)
}

export function openingChoiceForSeat(session: GameSessionState, seatId: number) {
  const actual = projectCurrentAssignments(session).find(a => a.seatId === seatId)
  return currentOpeningPreparation(session)?.choices.find(c => c.seatId === seatId && c.roleId === actual?.role.id)
}

/** 一个明确的人工确认同时留配置和既有状态/能力事件；失败时整批不写入。 */
export function confirmOpeningPreparation(session: GameSessionState, input: OpeningPreparation) {
  const assignments = projectCurrentAssignments(session)
  if (input.setupId !== projectConfirmedSetup(session)?.id || input.assignmentKey !== openingAssignmentKey(assignments)
    || !input.id.trim() || !Number.isFinite(Date.parse(input.confirmedAt))
    || session.openingPreparations?.some(p => p.setupId === input.setupId)
    || session.phaseSegments.length || Object.keys(session.nightRuns).length
    || openingPreparationIssues(session.scriptId, assignments, input.choices).length) return session
  const setup = projectConfirmedSetup(session)!
  const counts = evaluateSmartScriptSetup(session.scriptId, assignments, setup.draft.demonBluffs, Object.values(session.seats).map(s => s.seatId),
    setup.draft.setupRuleSelections, setup.draft.repeatableRoleIds, undefined, input.choices.filter(c => c.roleId === 'alchemist').flatMap(c => c.chosenRoleId ? [c.chosenRoleId] : []))
  if (hasBlockingSetupIssue(counts)) return session
  let next: GameSessionState = session
  const roles = roleSnapshotsForScript(session.scriptId)
  for (const [index, choice] of input.choices.entries()) {
    const kind = openingRole(choice.roleId)?.kind
    if (kind === 'demon') {
      const shownRole = roles.find(r => r.id === choice.chosenRoleId)!
      next = { ...next, identityPresentations: { ...next.identityPresentations, [choice.seatId]: { actualRoleId: choice.roleId, shownRole: { ...shownRole }, confirmedAt: input.confirmedAt } } }
    }
    if (kind === 'minion') {
      const applied = confirmAbilityChange(next, { type: 'confirm-ability-change', sourceSeatId: choice.seatId, sourceRoleId: choice.roleId,
        seatId: choice.seatId, expectedRoleId: choice.roleId, roleId: choice.chosenRoleId!, sourceEntryId: session.timeline.find(e => e.kind === 'setup_confirmed' && e.setup.id === input.setupId)?.id,
        timing: 'tonight', reason: '说书人确认开局炼金能力', id: `${input.id}-ability-${choice.seatId}`,
        expectedContextKey: nightContextKey(next), confirmedAt: input.confirmedAt })
      if (applied === next) return session
      next = applied
    }
    const targetId = kind === 'player' ? choice.targetSeatId! : choice.seatId
    const before = projectCurrentPlayerStates(next)[targetId]
    if (!before) return session
    const label = kind === 'player' ? `谜师醉酒 · ${choice.seatId}号来源（持续）`
      : kind === 'minion' ? `炼金能力：${roles.find(r => r.id === choice.chosenRoleId)?.name}`
      : kind === 'townsfolk' ? `小精灵标记${choice.targetSeatId}号（${roles.find(r => r.id === choice.sourceRoleId)?.name}）；计划告知${roles.find(r => r.id === choice.chosenRoleId)?.name}`
      : kind === 'text' ? `${assignments.find(a => a.seatId === choice.seatId)?.role.name}：${choice.text!.trim()}` : ''
    if (label) next = confirmPlayerStateChange(next, { type: 'confirm-player-state-change', seatId: targetId, expectedBefore: before,
      after: { ...before, ...(kind === 'player' ? { drunk: true } : {}), markers: [...before.markers, { id: `${input.id}-marker-${choice.seatId}`, label, sourceRoleId: choice.roleId, placedInSegmentId: null }] },
      segmentId: null, entryId: `${input.id}-state-${String(index).padStart(2, '0')}-${choice.seatId}`, confirmedAt: input.confirmedAt, reason: '说书人确认开局准备' })
    if (kind === 'townsfolk') {
      const source = projectCurrentPlayerStates(next)[choice.targetSeatId!]
      next = confirmPlayerStateChange(next, { type: 'confirm-player-state-change', seatId: choice.targetSeatId!, expectedBefore: source,
        after: { ...source, markers: [...source.markers, { id: `${input.id}-pixie-source-${choice.seatId}`, label: `小精灵MAD来源 · ${choice.seatId}号小精灵`, sourceRoleId: 'pixie', placedInSegmentId: null }] },
        segmentId: null, entryId: `${input.id}-state-${String(index).padStart(2, '0')}-source-${choice.seatId}`, confirmedAt: input.confirmedAt, reason: '说书人确认小精灵实际标记来源' })
    }
  }
  return { ...next, openingPreparations: [...(next.openingPreparations ?? []), structuredClone(input)] }
}
