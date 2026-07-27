import { roleAbilityForScript, roleSnapshotsForScript, roleTeamByIdForScript } from '../../domain/scripts'
import type { SetupAssignment } from '../game-session/types'

function cloneRole(scriptId: string, roleId: string) {
  const roleById = new Map(roleSnapshotsForScript(scriptId).map((role) => [role.id, role]))
  const role = roleById.get(roleId)
  return role ? { ...role } : null
}

function firstUnusedTownsfolk(scriptId: string, assignments: readonly SetupAssignment[]) {
  const teamByRoleId = roleTeamByIdForScript(scriptId)
  const inPlay = new Set(assignments.map((assignment) => assignment.role.id))
  return roleSnapshotsForScript(scriptId).find((role) => teamByRoleId[role.id] === 'townsfolk' && !inPlay.has(role.id))
    ?? null
}

function firstDemon(scriptId: string, assignments: readonly SetupAssignment[]) {
  const teamByRoleId = roleTeamByIdForScript(scriptId)
  return assignments.find((assignment) => teamByRoleId[assignment.role.id] === 'demon')?.role
    ?? cloneRole(scriptId, 'imp')
}

export function playerFacingIdentity(
  scriptId: string,
  seatId: number,
  assignments: readonly SetupAssignment[],
) {
  const actual = assignments.find((assignment) => assignment.seatId === seatId)?.role ?? null
  if (!actual) return { role: null, ability: '身份未确认。', privateNote: '' }
  const role = actual.id === 'drunk'
    ? firstUnusedTownsfolk(scriptId, assignments) ?? actual
    : actual.id === 'lunatic'
      ? firstDemon(scriptId, assignments) ?? actual
      : actual

  return {
    role,
    ability: roleAbilityForScript(scriptId, role.id),
    privateNote: actual.id === role.id ? '' : '对外展示身份',
  }
}
