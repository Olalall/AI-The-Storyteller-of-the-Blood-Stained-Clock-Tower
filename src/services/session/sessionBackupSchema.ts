type Check = (value: unknown) => boolean
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const string: Check = (v) => typeof v === 'string'
const contextText: Check = (v) => typeof v === 'string' && v.length <= 1000
const number: Check = (v) => typeof v === 'number' && Number.isFinite(v)
const boolean: Check = (v) => typeof v === 'boolean'
const oneOf = (...values: unknown[]): Check => (v) => values.includes(v)
const optional = (check: Check): Check => (v) => v === undefined || check(v)
const nullable = (check: Check): Check => (v) => v === null || check(v)
const array = (check: Check): Check => (v) => Array.isArray(v) && v.every(check)
const record = (check: Check): Check => (v) => object(v) && Object.values(v).every(check)
const shape = (fields: Record<string, Check>): Check => (v) => object(v) && Object.entries(fields).every(([key, check]) => check(v[key]))
const role = shape({ id: string, name: string, initial: string, iconPath: string })
const participant = shape({ seatId: number, actualRole: nullable(role) })
const skillContext = shape({ abilityRole: nullable(role), actor: nullable(participant), claimedRole: nullable(role), targets: array(participant), outcome: shape({ kind: oneOf('no_effect', 'applied', 'custom'), note: optional(string) }) })
const marker = shape({ id: string, label: string })
const state = shape({ life: oneOf('alive', 'dead'), poisoned: boolean, drunk: boolean, markers: array(marker) })
const extraRoleChoices: Check = (value) => Array.isArray(value) && value.length <= 2 && value.every(string)
const targetMode = oneOf(0, 1, 3)
const targetRoleChoices: Check = (value) => Array.isArray(value) && value.length <= 3 && value.every((choice) => object(choice) &&
  Number.isInteger(choice.seatId) && Number(choice.seatId) >= 0 && Number(choice.seatId) <= 15 && typeof choice.roleId === 'string' && choice.roleId.length <= 100)
const wakeDraft = shape({ targets: array(number), targetRoleChoices: optional(targetRoleChoices), targetCountChoice: optional(targetMode), roleChoice: string, secondRoleChoice: optional(string), additionalRoleChoices: optional(extraRoleChoices), storytellerContext: optional(contextText), outcomeId: string, playerChoice: string, storytellerResult: string, informationGiven: string, draftRevision: number })
const setup = shape({ candidateId: string, revision: number, updatedAt: string, assignments: array(shape({ seatId: number, role })), demonBluffs: array(role), repeatableRoleIds: optional(array(string)), setupRuleSelections: optional(array(shape({ ruleId: string, choiceId: string }))) })
const phase = shape({ id: string, kind: oneOf('night', 'day'), sequence: number, label: string, createdAt: string, closedAt: optional(string) })
const voteAdjustment = shape({ count: number, reason: string })
const wake = shape({
  abilityPhase: optional(oneOf('initial')),
  id: string, orderIndex: number, seatId: number, playerLabel: string, roleId: string, roleName: string, roleInitial: string,
  iconPath: string, ability: string, storytellerPrompt: string, progress: oneOf('pending', 'draft', 'confirmed', 'deferred', 'skipped', 'not_applicable'),
  reason: optional(string),
  applicability: oneOf('applicable', 'needs_review', 'not_applicable'), targetCount: number, targetRoleChoiceCount: optional(oneOf(1, 2, 3)), allowedTargetCounts: optional(array(targetMode)), roleCount: optional(oneOf(1, 2, 4)), interactionVersion: string,
  status: shape({ life: oneOf('alive', 'dead'), impairments: array(oneOf('poisoned', 'drunk')), markers: array(marker) }),
  outcomeOptions: array(shape({ id: string, label: string, requiredInputs: array(oneOf('targets', 'role')), resultTemplate: string })),
  roleChoices: optional(array(shape({ id: string, label: string, alignment: optional(oneOf('good', 'evil')) }))),
})
const advice = shape({ id: string, status: oneOf('answer', 'needs_input'), summary: string, facts: array(string), missing: array(string), journalDrafts: array(string), playerMessageDrafts: array(string), stateChangeDrafts: array(string), authorityWarnings: array(string) })
const night = shape({ id: string, phaseSegmentId: nullable(string), scriptId: string, nightType: oneOf('first', 'other'), playerCount: number, revision: number, knowledgeVersion: string, queue: array(wake), activeCursorId: string, previewEntryId: string, drafts: record(wakeDraft), privacyShielded: boolean, dimmed: boolean, aiAdviceLog: record(advice), correctionItemId: nullable(string), lastNotice: string })
const timelineVariants: Record<string, Check> = {
  setup_confirmed: shape({ setup: shape({ id: string, draft: setup, confirmedAt: string }) }),
  setup_changed: shape({ baseSetupId: string, originNightRunId: optional(nullable(string)), sourceNightActionId: optional(string), nightAbilityTiming: optional(oneOf('tonight', 'initial', 'later')), seatId: number, fromRole: role, toRole: role, reason: string, effectiveFrom: oneOf('future_workbenches') }),
  player_state_changed: shape({ seatId: number, before: state, after: state, reason: string }),
  night_action: shape({ nightRunId: string, wakeItemId: string, summary: string, details: array(string), record: shape({ revision: number, snapshot: wakeDraft }) }),
  day_action: shape({ category: oneOf('skill', 'public_event'), actorSeatId: nullable(number), targetSeatIds: array(number), summary: string, details: array(string), skillContext: optional(skillContext) }),
  vote_round: shape({ roundId: string, nominatorSeatId: number, nomineeSeatId: number, threshold: number, raisedSeatIds: array(number), ghostVoteSeatIds: array(number), voteAdjustment: optional(voteAdjustment), voided: optional(boolean) }),
  execution: shape({ executedSeatId: optional(number), causedDeath: optional(boolean), exceptionReason: optional(string) }),
  no_execution: shape({}),
}
const timeline: Check = (v) => object(v) && shape({ id: string, kind: string, segmentId: nullable(string), createdAt: string, confirmedBy: oneOf('storyteller'), correctionOf: optional(string) })(v) && Object.hasOwn(timelineVariants, String(v.kind)) && timelineVariants[String(v.kind)](v)
export const sessionBackupSchema = shape({
  identityPresentations: optional(record(shape({ actualRoleId: string, shownRole: role, confirmedAt: string }))),
  stateFollowups: optional(array(shape({ id: string, sourceEntryId: string, seatId: number, note: string, createdAt: string, resolution: optional(shape({ kind: oneOf('applied', 'dismissed'), at: string, reason: string, entryId: optional(string) })) }))),
  schemaVersion: oneOf(1), id: string, scriptId: string, playerCount: number, knowledgeVersion: string,
  scriptRoles: optional(array(role)), seats: record(shape({ seatId: number, label: string, nickname: string, experience: oneOf('new', 'regular', 'veteran') })),
  initialPlayerStates: record(state), phaseSegments: array(phase), timeline: array(timeline), nightRuns: record(night), activeNightRunId: nullable(string), setupDraft: nullable(setup),
  dayVoteDraft: nullable(shape({ segmentId: string, nominatorSeatId: nullable(number), nomineeSeatId: nullable(number), threshold: number, raisedSeatIds: array(number), ghostVoteSeatIds: array(number), voteAdjustment: optional(voteAdjustment) })),
  dayActionDraft: nullable(shape({ category: oneOf('skill', 'public_event'), skill: shape({ actorSeatId: nullable(number), actorActualRoleId: string, abilityRoleId: string, claimedRoleId: string, targetSeatIds: array(number), targetActualRoleIds: record(string), outcomeKind: nullable(oneOf('no_effect', 'applied', 'custom')), outcomeNote: string }), publicEvent: shape({ targetSeatIds: array(number), note: string }) })),
})
