import { cloneRoleSnapshot, formatDaySkillSummary } from '../../game-session/daySkillPresentation'
import { projectCurrentAssignments } from '../../game-session/state/projectors'
import { createDayActionSkillDraft } from '../../game-session/state/dayActionDraft'
import type { DayActionSkillDraft, DaySkillContext, GameSessionState } from '../../game-session/types'
import type { RoleSnapshot } from '../../night-workbench/types'

export type DaySkillDraft = DayActionSkillDraft

export function createDaySkillDraft(): DaySkillDraft {
  return createDayActionSkillDraft()
}

export function roleOptionsForSession(session: GameSessionState): RoleSnapshot[] {
  const fromScript = session.scriptRoles ?? []
  const fromAssignments = projectCurrentAssignments(session).map((assignment) => assignment.role)
  const roles = new Map<string, RoleSnapshot>()
  for (const role of [...fromScript, ...fromAssignments]) {
    if (!roles.has(role.id)) roles.set(role.id, { ...role })
  }
  return [...roles.values()].sort((left, right) => left.name.localeCompare(right.name, 'zh-Hans-CN'))
}

export function currentRoleBySeat(session: GameSessionState) {
  return new Map(projectCurrentAssignments(session).map((assignment) => [assignment.seatId, { ...assignment.role }]))
}

export function roleForId(roleOptions: readonly RoleSnapshot[], roleId: string) {
  return cloneRoleSnapshot(roleOptions.find((role) => role.id === roleId))
}

export function buildDaySkillContext(
  session: GameSessionState,
  draft: DaySkillDraft,
  roleOptions = roleOptionsForSession(session),
): DaySkillContext | null {
  if (draft.actorSeatId === null || !draft.abilityRoleId || !draft.outcomeKind) return null

  const currentRoles = currentRoleBySeat(session)
  const actorActualRole = roleForId(roleOptions, draft.actorActualRoleId) ?? cloneRoleSnapshot(currentRoles.get(draft.actorSeatId))
  const targets = draft.targetSeatIds.map((seatId) => ({
    seatId,
    actualRole: roleForId(roleOptions, draft.targetActualRoleIds[seatId]) ?? cloneRoleSnapshot(currentRoles.get(seatId)),
    registration: draft.abilityRoleId === 'moonchild' && draft.targetAlignments?.[seatId]
      ? { kind: 'alignment' as const, seatId, value: draft.targetAlignments[seatId] }
      : undefined,
  }))
  const context: DaySkillContext = {
    abilityRole: roleForId(roleOptions, draft.abilityRoleId),
    actor: { seatId: draft.actorSeatId, actualRole: actorActualRole },
    claimedRole: roleForId(roleOptions, draft.claimedRoleId),
    targets,
    outcome: draft.outcomeKind === 'custom'
      ? { kind: draft.outcomeKind, note: draft.outcomeNote.trim() }
      : { kind: draft.outcomeKind },
  }
  return context.abilityRole ? context : null
}

export function canRecordDaySkill(draft: DaySkillDraft) {
  const registrationReady = draft.abilityRoleId !== 'moonchild' || (
    draft.targetSeatIds.length === 1 && draft.targetSeatIds.every((seatId) => Boolean(draft.targetAlignments?.[seatId]))
  )
  return draft.actorSeatId !== null && Boolean(draft.abilityRoleId) && Boolean(draft.outcomeKind) && registrationReady &&
    (draft.outcomeKind !== 'custom' || Boolean(draft.outcomeNote.trim()))
}

export function summaryForDaySkillContext(context: DaySkillContext | null, draft: DaySkillDraft) {
  return formatDaySkillSummary(context ?? undefined, draft.actorSeatId, draft.targetSeatIds)
}
