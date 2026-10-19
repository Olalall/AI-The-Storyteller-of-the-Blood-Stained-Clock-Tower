import { roleAbilityForScript, roleSnapshotsForScript, roleTeamByIdForScript } from '../../domain/scripts'
import type { GameSessionState, SetupAssignment } from '../game-session/types'
import { projectCurrentAssignments } from '../game-session/state/projectors'

// 身份交接策略，只限定可展示身份，不判断技能或改变真实身份。
const shownTeams: Readonly<Record<string, readonly string[]>> = { drunk: ['townsfolk'], marionette: ['townsfolk', 'outsider'], lunatic: ['demon'] }

function eligibleIdentityRoles(scriptId: string, actualRoleId: string) {
  const eligibleTeams = shownTeams[actualRoleId]
  if (!eligibleTeams) return []
  const teams = roleTeamByIdForScript(scriptId)
  return roleSnapshotsForScript(scriptId).filter((role) => eligibleTeams.includes(teams[role.id]))
}

export function identityRoleChoices(scriptId: string, actualRoleId: string, assignments: readonly SetupAssignment[]) {
  const teams = roleTeamByIdForScript(scriptId)
  const inPlay = new Set(assignments.map((assignment) => assignment.role.id))
  return eligibleIdentityRoles(scriptId, actualRoleId).filter((role) => teams[role.id] === 'demon' || !inPlay.has(role.id))
}

function identityChanges(session: GameSessionState, seatId: number) {
  return session.timeline.filter((entry) => entry.kind === 'setup_confirmed' || (entry.kind === 'setup_changed' && entry.seatId === seatId))
}

export function playerFacingIdentity(session: GameSessionState, seatId: number) {
  const assignments = projectCurrentAssignments(session)
  const actual = assignments.find((assignment) => assignment.seatId === seatId)?.role ?? null
  const requiresPresentation = Boolean(actual && shownTeams[actual.id])
  const presentation = session.identityPresentations?.[seatId]
  const presentationAt = Date.parse(presentation?.confirmedAt ?? '')
  const role = requiresPresentation && actual
    ? presentation?.actualRoleId === actual.id && Number.isFinite(presentationAt) && identityChanges(session, seatId).every((entry) => Date.parse(entry.createdAt) <= presentationAt)
      ? eligibleIdentityRoles(session.scriptId, actual.id).find((option) => option.id === presentation.shownRole?.id) ?? null
      : null
    : actual

  return {
    role,
    ability: role ? roleAbilityForScript(session.scriptId, role.id) : '请先由说书人确认对外身份，或改用实体抽牌。',
    privateNote: requiresPresentation ? role ? '已确认的对外身份' : '对外身份待确认' : '',
    requiresPresentation,
  }
}

export function receiptMatchesCurrentIdentity(session: GameSessionState, seatId: number, receivedAt: string | undefined) {
  const received = Date.parse(receivedAt ?? '')
  if (!Number.isFinite(received)) return false
  const confirmedAt = session.identityPresentations?.[seatId]?.confirmedAt
  return [...identityChanges(session, seatId).map((entry) => entry.createdAt), ...(confirmedAt ? [confirmedAt] : [])].every((at) => Date.parse(at) <= received)
}
