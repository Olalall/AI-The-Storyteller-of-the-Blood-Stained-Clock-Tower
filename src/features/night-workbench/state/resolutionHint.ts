/**
 * 赌徒的核对建议。
 *
 * 它只推荐一个结果按钮并写明理由，**绝不代为落账**——猜对猜错会直接导致死亡，
 * 而死亡必须是说书人按下的。中毒/醉酒时更要先停下来问人，所以那条分支不比对答案。
 */
import type { projectCurrentAssignments } from '../../game-session/state/projectors'
import type { projectWakePlayerStatus } from './projectWakePlayerStatus'
import type { OutcomeResolutionHint, WakeDraft, WakeItem } from '../types'

export function createResolutionHint(
  item: WakeItem,
  draft: WakeDraft,
  playerStatus: ReturnType<typeof projectWakePlayerStatus>,
  assignments: ReturnType<typeof projectCurrentAssignments>,
): OutcomeResolutionHint | undefined {
  if (item.roleId !== 'gambler' || draft.targets.length !== 1 || !draft.roleChoice) return undefined

  const selectedRole = item.roleChoices?.find((role) => role.id === draft.roleChoice)
  const actualRole = assignments.find((assignment) => assignment.seatId === draft.targets[0])?.role
  if (!selectedRole || !actualRole) return undefined

  if (playerStatus.impairments.includes('poisoned') || playerStatus.impairments.includes('drunk')) {
    return {
      recommendedOutcomeId: 'no-effect',
      title: '核对建议',
      detail: '赌徒当前中毒或醉酒；建议先选“未受影响”。是否另记死亡仍由说书人确认。',
    }
  }

  const correct = actualRole.id === draft.roleChoice
  return {
    recommendedOutcomeId: correct ? 'correct' : 'wrong',
    title: '核对建议',
    detail: `目标实际是${actualRole.name}，本次猜${selectedRole.label}；建议选“${correct ? '猜对 · 无事' : '猜错 · 待死亡'}”。不会自动改死亡状态。`,
  }
}
