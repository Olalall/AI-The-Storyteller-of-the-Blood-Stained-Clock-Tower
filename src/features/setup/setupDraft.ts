import type {
  SetupCandidate,
  SetupDraft,
} from '../game-session/types'
import type { RoleSnapshot } from '../night-workbench/types'

export function createSetupDraftFromCandidate(
  candidate: SetupCandidate,
  updatedAt: string,
): SetupDraft {
  return {
    candidateId: candidate.id,
    revision: 1,
    assignments: candidate.assignments.map((assignment) => ({
      seatId: assignment.seatId,
      role: { ...assignment.role },
    })),
    demonBluffs: candidate.demonBluffs.map((role) => ({ ...role })),
    repeatableRoleIds: candidate.repeatableRoleIds?.slice() ?? [],
    setupRuleSelections: candidate.setupRuleSelections?.map((selection) => ({ ...selection })) ?? [],
    setupRulePackVersion: candidate.setupRulePackVersion,
    updatedAt,
  }
}

export function replaceDraftRole(
  draft: SetupDraft,
  seatId: number,
  role: RoleSnapshot,
  updatedAt: string,
): SetupDraft {
  return {
    ...draft,
    revision: draft.revision + 1,
    assignments: draft.assignments.map((assignment) => assignment.seatId === seatId
      ? { seatId, role: { ...role } }
      : { seatId: assignment.seatId, role: { ...assignment.role } }),
    demonBluffs: draft.demonBluffs.map((bluff) => ({ ...bluff })),
    repeatableRoleIds: draft.repeatableRoleIds?.slice(),
    setupRuleSelections: draft.setupRuleSelections?.map((selection) => ({ ...selection })),
    updatedAt,
  }
}

export function swapDraftSeats(draft: SetupDraft, firstSeatId: number, secondSeatId: number, updatedAt: string): SetupDraft {
  if (firstSeatId === secondSeatId) return draft
  const first = draft.assignments.find((assignment) => assignment.seatId === firstSeatId)
  const second = draft.assignments.find((assignment) => assignment.seatId === secondSeatId)
  if (!first || !second) return draft

  return {
    ...draft,
    revision: draft.revision + 1,
    assignments: draft.assignments.map((assignment) => {
      if (assignment.seatId === firstSeatId) return { seatId: firstSeatId, role: { ...second.role } }
      if (assignment.seatId === secondSeatId) return { seatId: secondSeatId, role: { ...first.role } }
      return { seatId: assignment.seatId, role: { ...assignment.role } }
    }),
    demonBluffs: draft.demonBluffs.map((bluff) => ({ ...bluff })),
    repeatableRoleIds: draft.repeatableRoleIds?.slice(),
    setupRuleSelections: draft.setupRuleSelections?.map((selection) => ({ ...selection })),
    updatedAt,
  }
}

export function selectSetupRuleChoice(
  draft: SetupDraft,
  ruleId: string,
  choiceId: string,
  updatedAt: string,
): SetupDraft {
  const previous = draft.setupRuleSelections ?? []
  const existing = previous.find((selection) => selection.ruleId === ruleId)
  if (existing?.choiceId === choiceId) return draft

  return {
    ...draft,
    revision: draft.revision + 1,
    assignments: draft.assignments.map((assignment) => ({ seatId: assignment.seatId, role: { ...assignment.role } })),
    demonBluffs: draft.demonBluffs.map((bluff) => ({ ...bluff })),
    repeatableRoleIds: draft.repeatableRoleIds?.slice(),
    setupRuleSelections: [
      ...previous.filter((selection) => selection.ruleId !== ruleId).map((selection) => ({ ...selection })),
      { ruleId, choiceId },
    ],
    updatedAt,
  }
}

export function replaceDraftDemonBluff(
  draft: SetupDraft,
  bluffIndex: number,
  role: RoleSnapshot,
  updatedAt: string,
): SetupDraft {
  if (bluffIndex < 0 || bluffIndex >= draft.demonBluffs.length) return draft
  return {
    ...draft,
    revision: draft.revision + 1,
    assignments: draft.assignments.map((assignment) => ({ seatId: assignment.seatId, role: { ...assignment.role } })),
    demonBluffs: draft.demonBluffs.map((bluff, index) => index === bluffIndex ? { ...role } : { ...bluff }),
    repeatableRoleIds: draft.repeatableRoleIds?.slice(),
    setupRuleSelections: draft.setupRuleSelections?.map((selection) => ({ ...selection })),
    updatedAt,
  }
}
