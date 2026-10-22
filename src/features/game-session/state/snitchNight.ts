import { roleTeamByIdForScript } from '../../../domain/scripts'
import type { GameSessionState, PlayerState, SetupAssignment } from '../types'
import { projectCurrentAssignments } from './projectors'
import { createBluffChoices, createSystemStepItem } from './firstNightSystemSteps'

/** 每名爪牙单独保留三个伪装；可以相同，也可以不同，不唤醒告密者本人。 */
export function createSnitchNightItems(session: GameSessionState, source: SetupAssignment, playerStates: Record<number, PlayerState>, runId: string, order: number) {
  const assignments = projectCurrentAssignments(session), teams = roleTeamByIdForScript(session.scriptId)
  return assignments.filter(a => teams[a.role.id] === 'minion' && a.role.id !== 'marionette').map(a => ({ ...createSystemStepItem({
    session, playerStates, runId: `${runId}-snitch-${source.seatId}-recipient-${a.seatId}`, anchorSeatId: a.seatId, statusSeatId: source.seatId,
    playerLabel: `${a.seatId}号爪牙 · 告密者信息`, roleId: 'system-audience-snitch', roleName: '告密者信息', roleInitial: '知',
    ability: '每名爪牙获得三个不在场角色，可与恶魔或其他爪牙相同，也可以不同。',
    storytellerPrompt: `唤醒${a.seatId}号爪牙，展示三个不在场角色；不唤醒告密者本人。提线木偶不因此获知邪恶身份。`,
    applicability: playerStates[source.seatId]?.poisoned || playerStates[source.seatId]?.drunk ? 'needs_review' : 'applicable',
    step: { kind: 'audience_notice', minionLabels: [], demonLabel: '', infoTokens: ['这些角色不在场'],
      checks: [{ id: `snitch-delivered-${a.seatId}`, label: `已向${a.seatId}号爪牙展示三个角色` }], bluffCount: 3,
      bluffChoices: createBluffChoices(session, assignments), recipientLabels: [`${a.seatId}号爪牙`], sensitive: true },
    outcomeLabel: '已告知三个伪装角色', resultTemplate: `${a.seatId}号爪牙得知三个不在场角色：{bluffs}。`,
  }), orderIndex: order }))
}
