import type { SetupBalanceMicroAdjustment } from '../../services/ai'
import type { SetupDraft } from '../game-session/types'
import type { RoleSnapshot } from '../night-workbench/types'
import { replaceDraftRole } from './setupDraft'

export function previewDraftMicroAdjustment(
  draft: SetupDraft,
  adjustment: SetupBalanceMicroAdjustment,
  roles: readonly RoleSnapshot[],
  updatedAt: string,
) {
  if (draft.candidateId !== adjustment.candidateId) return null
  const target = draft.assignments.find((assignment) => assignment.role.id === adjustment.replaceOutRoleId)
  const replacement = roles.find((role) => role.id === adjustment.replaceInRoleId)
  if (!target || !replacement) return null
  const replacementAlreadyInPlay = draft.assignments.some((assignment) => (
    assignment.seatId !== target.seatId && assignment.role.id === replacement.id
  ))
  if (replacementAlreadyInPlay) return null

  return {
    draft: replaceDraftRole(draft, target.seatId, replacement, updatedAt),
    summary: `已预览 AI 微调：${target.seatId}号 ${target.role.name} → ${replacement.name}；确认前不生效`,
  }
}
