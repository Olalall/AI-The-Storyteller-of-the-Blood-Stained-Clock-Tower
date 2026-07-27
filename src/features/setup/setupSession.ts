import { projectCurrentAssignments } from '../game-session/state/projectors'
import type { GameSessionState, SetupDraft } from '../game-session/types'

export function createDraftFromCurrent(session: GameSessionState): SetupDraft | null {
  const currentAssignments = projectCurrentAssignments(session)
  if (!currentAssignments.length) return null
  const setupEntry = session.timeline.filter((entry) => entry.kind === 'setup_confirmed').at(-1)
  if (!setupEntry || setupEntry.kind !== 'setup_confirmed') return null
  return {
    candidateId: setupEntry.setup.draft.candidateId,
    baseSetupId: setupEntry.setup.id,
    revision: setupEntry.setup.draft.revision + 1,
    assignments: currentAssignments.map((assignment) => ({ seatId: assignment.seatId, role: { ...assignment.role } })),
    demonBluffs: setupEntry.setup.draft.demonBluffs.map((role) => ({ ...role })),
    repeatableRoleIds: setupEntry.setup.draft.repeatableRoleIds?.slice() ?? [],
    setupRuleSelections: setupEntry.setup.draft.setupRuleSelections?.map((selection) => ({ ...selection })) ?? [],
    setupRulePackVersion: setupEntry.setup.draft.setupRulePackVersion,
    updatedAt: new Date().toISOString(),
  }
}

export function currentConfirmedSetupId(session: GameSessionState) {
  const setupEntry = session.timeline.filter((entry) => entry.kind === 'setup_confirmed').at(-1)
  return setupEntry?.kind === 'setup_confirmed' ? setupEntry.setup.id : null
}

export function sessionHasStarted(session: GameSessionState) {
  return session.timeline.some((entry) => entry.kind === 'night_action' || entry.kind === 'day_action' || entry.kind === 'vote_round')
}
