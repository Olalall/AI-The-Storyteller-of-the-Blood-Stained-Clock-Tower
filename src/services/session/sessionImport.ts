import {
  createPrototypeGameSessionFromLegacyNight,
} from '../../features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../features/game-session/types'
import {
  initialNightWorkbenchState,
} from '../../features/night-workbench/data/initialNightWorkbenchState'
import type { NightWorkbenchState } from '../../features/night-workbench/types'

/** 正常对局远小于此值；先限流，避免把任意大文件送进 JSON.parse 卡住页面。 */
export const MAX_SESSION_IMPORT_BYTES = 2 * 1024 * 1024

export type SessionImportErrorCode =
  | 'empty'
  | 'too-large'
  | 'invalid-json'
  | 'invalid-root'
  | 'invalid-session'
  | 'file-read-failed'

export interface SessionImportPreview {
  sessionId: string
  scriptId: string
  playerCount: number
  phaseCount: number
  timelineCount: number
  nightRunCount: number
  updatedAt?: string
  source: 'game-session' | 'legacy-night-workbench'
}

export type SessionImportResult =
  | { ok: true; session: GameSessionState; preview: SessionImportPreview }
  | { ok: false; code: SessionImportErrorCode; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isInteger(value: unknown, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= maximum
}

function isNumberArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => isInteger(item, 1, 15))
}

function isStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === 'string'
}

function isRoleChoice(value: unknown) {
  return isRecord(value) && typeof value.id === 'string' && typeof value.label === 'string'
}

function isRegistration(value: unknown) {
  return isRecord(value) && (value.kind === 'role_type' || value.kind === 'alignment') &&
    isInteger(value.seatId, 1, 15) && typeof value.value === 'string'
}

function isRoleSnapshot(value: unknown) {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string' &&
    typeof value.initial === 'string' && typeof value.iconPath === 'string'
}

function isMarker(value: unknown) {
  return isRecord(value) && typeof value.id === 'string' && typeof value.label === 'string' &&
    (value.sourceRoleId === undefined || typeof value.sourceRoleId === 'string') &&
    (value.placedInSegmentId === undefined || value.placedInSegmentId === null || typeof value.placedInSegmentId === 'string')
}

function isPlayerState(value: unknown) {
  return isRecord(value) && (value.life === 'alive' || value.life === 'dead') &&
    typeof value.poisoned === 'boolean' && typeof value.drunk === 'boolean' &&
    Array.isArray(value.markers) && value.markers.every(isMarker)
}

function isSeat(value: unknown) {
  if (!isRecord(value)) return false
  const hasReadableNickname = typeof value.nickname === 'string' || typeof value.name === 'string'
  return isInteger(value.seatId, 1, 15) && typeof value.label === 'string' && hasReadableNickname &&
    (value.experience === 'new' || value.experience === 'regular' || value.experience === 'veteran')
}

function isWakeDraft(value: unknown) {
  return isRecord(value) && isNumberArray(value.targets) && typeof value.roleChoice === 'string' &&
    typeof value.outcomeId === 'string' && typeof value.playerChoice === 'string' &&
    typeof value.storytellerResult === 'string' && typeof value.informationGiven === 'string' &&
    (value.registration === undefined || isRegistration(value.registration)) &&
    (value.systemChecks === undefined || isStringArray(value.systemChecks)) &&
    (value.bluffRoleIds === undefined || isStringArray(value.bluffRoleIds)) &&
    isOptionalString(value.updatedAt) &&
    isInteger(value.draftRevision)
}

const wakeProgresses = new Set(['pending', 'draft', 'confirmed', 'deferred', 'skipped', 'not_applicable'])
const applicabilities = new Set(['applicable', 'needs_review', 'not_applicable'])

function isWakeStatus(value: unknown) {
  return isRecord(value) && (value.life === 'alive' || value.life === 'dead') &&
    Array.isArray(value.impairments) &&
    value.impairments.every((item) => item === 'poisoned' || item === 'drunk') &&
    Array.isArray(value.markers) && value.markers.every(isMarker)
}

function isOutcomeOption(value: unknown) {
  return isRecord(value) && typeof value.id === 'string' && typeof value.label === 'string' &&
    Array.isArray(value.requiredInputs) &&
    value.requiredInputs.every((item) => item === 'targets' || item === 'role') &&
    (value.targetCounts === undefined || (Array.isArray(value.targetCounts) &&
      value.targetCounts.every((item) => isInteger(item, 0, 15)))) &&
    typeof value.resultTemplate === 'string' && isOptionalString(value.informationTemplate)
}

function isRegistrationSpec(value: unknown) {
  return isRecord(value) && (value.kind === 'role_type' || value.kind === 'alignment') &&
    typeof value.label === 'string' && Array.isArray(value.choices) && value.choices.every(isRoleChoice)
}

function isHistoricalContext(value: unknown) {
  return isRecord(value) && typeof value.kind === 'string' &&
    (value.status === 'ready' || value.status === 'clear' || value.status === 'missing') &&
    isNumberArray(value.seatIds) && typeof value.summary === 'string'
}

function isSystemStep(value: unknown) {
  return isRecord(value) &&
    (value.kind === 'minion_info' || value.kind === 'demon_info' || value.kind === 'audience_notice') &&
    isStringArray(value.minionLabels) && typeof value.demonLabel === 'string' &&
    isStringArray(value.infoTokens) && Array.isArray(value.checks) &&
    value.checks.every((item) => isRecord(item) && typeof item.id === 'string' && typeof item.label === 'string') &&
    (value.bluffCount === undefined || isInteger(value.bluffCount, 0, 15)) &&
    (value.bluffChoices === undefined || (Array.isArray(value.bluffChoices) &&
      value.bluffChoices.every((item) => isRoleChoice(item) && typeof item.teamLabel === 'string' && typeof item.suggested === 'boolean'))) &&
    isOptionalString(value.audienceLabel) &&
    (value.recipientLabels === undefined || isStringArray(value.recipientLabels)) &&
    (value.sensitive === undefined || typeof value.sensitive === 'boolean')
}

function isWakeItem(value: unknown) {
  return isRecord(value) && typeof value.id === 'string' && isInteger(value.orderIndex) &&
    isInteger(value.seatId, 0, 15) && typeof value.playerLabel === 'string' &&
    typeof value.roleId === 'string' && typeof value.roleName === 'string' &&
    typeof value.roleInitial === 'string' && typeof value.iconPath === 'string' &&
    typeof value.ability === 'string' && typeof value.storytellerPrompt === 'string' &&
    typeof value.progress === 'string' && wakeProgresses.has(value.progress) &&
    typeof value.applicability === 'string' && applicabilities.has(value.applicability) &&
    isWakeStatus(value.status) && isOptionalString(value.history) && isOptionalString(value.reason) &&
    isInteger(value.targetCount, 0, 15) &&
    (value.minimumTargetCount === undefined || isInteger(value.minimumTargetCount, 0, 15)) &&
    isOptionalString(value.targetLabel) &&
    (value.targetKind === undefined || value.targetKind === 'player_choice' || value.targetKind === 'storyteller_info') &&
    (value.roleChoices === undefined || (Array.isArray(value.roleChoices) && value.roleChoices.every(isRoleChoice))) &&
    isOptionalString(value.roleLabel) &&
    (value.registrationSpec === undefined || isRegistrationSpec(value.registrationSpec)) &&
    (value.previousRegistration === undefined || isRegistration(value.previousRegistration)) &&
    (value.previousTargets === undefined || isNumberArray(value.previousTargets)) &&
    (value.forbiddenTargetSeatIds === undefined || isNumberArray(value.forbiddenTargetSeatIds)) &&
    (value.previousTargetRequired === undefined || typeof value.previousTargetRequired === 'boolean') &&
    (value.historicalContext === undefined || isHistoricalContext(value.historicalContext)) &&
    typeof value.interactionVersion === 'string' &&
    Array.isArray(value.outcomeOptions) && value.outcomeOptions.every(isOutcomeOption) &&
    (value.aiAdviceEnabled === undefined || typeof value.aiAdviceEnabled === 'boolean') &&
    (value.systemStep === undefined || isSystemStep(value.systemStep))
}

function isAIAdvice(value: unknown) {
  return isRecord(value) && typeof value.id === 'string' && value.kind === 'result' &&
    typeof value.nightRunId === 'string' && typeof value.wakeItemId === 'string' &&
    (value.status === 'answer' || value.status === 'needs_input') &&
    typeof value.contextRevision === 'number' && typeof value.sourceDraftRevision === 'number' &&
    typeof value.knowledgeVersion === 'string' && isOptionalString(value.recommendedOutcomeId) &&
    typeof value.summary === 'string' && isStringArray(value.facts) && isStringArray(value.missing) &&
    isStringArray(value.journalDrafts) && isStringArray(value.playerMessageDrafts) &&
    Array.isArray(value.stateChangeDrafts) && isStringArray(value.authorityWarnings) &&
    (value.confidence === 'low' || value.confidence === 'medium' || value.confidence === 'high')
}

function isNightRun(value: unknown) {
  if (!isRecord(value) || typeof value.id !== 'string' ||
    !(value.phaseSegmentId === null || typeof value.phaseSegmentId === 'string') ||
    typeof value.scriptId !== 'string' || (value.nightType !== 'first' && value.nightType !== 'other') ||
    !isInteger(value.playerCount, 0, 15) ||
    (value.revision !== undefined && !isInteger(value.revision)) ||
    (value.knowledgeVersion !== undefined && typeof value.knowledgeVersion !== 'string') ||
    !Array.isArray(value.queue) || value.queue.length === 0 || !value.queue.every(isWakeItem) ||
    typeof value.activeCursorId !== 'string' || typeof value.previewEntryId !== 'string' ||
    !isRecord(value.drafts) || !Object.values(value.drafts).every(isWakeDraft) ||
    typeof value.privacyShielded !== 'boolean' || typeof value.dimmed !== 'boolean' ||
    (value.aiAdviceLog !== undefined && (!isRecord(value.aiAdviceLog) || !Object.values(value.aiAdviceLog).every(isAIAdvice))) ||
    (value.correctionItemId !== undefined && value.correctionItemId !== null && typeof value.correctionItemId !== 'string') ||
    (value.lastNotice !== undefined && typeof value.lastNotice !== 'string')) return false
  const queueIds = new Set(value.queue.map((item) => item.id))
  return queueIds.size === value.queue.length && queueIds.has(value.activeCursorId) &&
    queueIds.has(value.previewEntryId) &&
    (value.correctionItemId === undefined || value.correctionItemId === null || queueIds.has(value.correctionItemId))
}

function isSetupDraft(value: unknown) {
  return isRecord(value) && typeof value.candidateId === 'string' && isInteger(value.revision) &&
    Array.isArray(value.assignments) && value.assignments.every((assignment) =>
      isRecord(assignment) && isInteger(assignment.seatId, 1, 15) && isRoleSnapshot(assignment.role)) &&
    Array.isArray(value.demonBluffs) && value.demonBluffs.every(isRoleSnapshot) && typeof value.updatedAt === 'string'
}

const timelineKinds = new Set([
  'setup_confirmed', 'setup_changed', 'player_state_changed', 'night_action',
  'day_action', 'vote_round', 'execution', 'no_execution',
])

function isTimelineEntry(value: unknown) {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.kind !== 'string' ||
    !timelineKinds.has(value.kind) || !(value.segmentId === null || typeof value.segmentId === 'string') ||
    typeof value.createdAt !== 'string') return false
  switch (value.kind) {
    case 'setup_confirmed':
      return isRecord(value.setup) && typeof value.setup.id === 'string' && isSetupDraft(value.setup.draft)
    case 'setup_changed':
      return isInteger(value.seatId, 1, 15) && isRoleSnapshot(value.fromRole) && isRoleSnapshot(value.toRole)
    case 'player_state_changed':
      return isInteger(value.seatId, 1, 15) && isPlayerState(value.before) && isPlayerState(value.after)
    case 'night_action':
      return typeof value.summary === 'string' && isStringArray(value.details) && isRecord(value.record) && isWakeDraft(value.record.snapshot)
    case 'day_action':
      return (value.category === 'skill' || value.category === 'public_event') &&
        (value.actorSeatId === null || isInteger(value.actorSeatId, 1, 15)) &&
        isNumberArray(value.targetSeatIds) && typeof value.summary === 'string' && isStringArray(value.details)
    case 'vote_round':
      return isInteger(value.nominatorSeatId, 1, 15) && isInteger(value.nomineeSeatId, 1, 15) &&
        isInteger(value.threshold) && isNumberArray(value.raisedSeatIds) && isNumberArray(value.ghostVoteSeatIds)
    case 'execution':
      return value.executedSeatId === undefined || isInteger(value.executedSeatId, 1, 15)
    case 'no_execution':
      return true
    default:
      return false
  }
}

function isDayVoteDraft(value: unknown) {
  return value === null || (isRecord(value) && typeof value.segmentId === 'string' &&
    (value.nominatorSeatId === null || isInteger(value.nominatorSeatId, 1, 15)) &&
    (value.nomineeSeatId === null || isInteger(value.nomineeSeatId, 1, 15)) &&
    isInteger(value.threshold) && isNumberArray(value.raisedSeatIds) && isNumberArray(value.ghostVoteSeatIds))
}

function isDayActionDraft(value: unknown) {
  if (value === null) return true
  if (!isRecord(value) || (value.category !== 'skill' && value.category !== 'public_event') ||
    !isRecord(value.skill) || !isRecord(value.publicEvent)) return false
  const skill = value.skill
  const actualRolesValid = skill.targetActualRoleIds === undefined ||
    (isRecord(skill.targetActualRoleIds) && Object.entries(skill.targetActualRoleIds).every(([seatId, roleId]) =>
      isInteger(Number(seatId), 1, 15) && typeof roleId === 'string'))
  const alignmentsValid = skill.targetAlignments === undefined ||
    (isRecord(skill.targetAlignments) && Object.entries(skill.targetAlignments).every(([seatId, alignment]) =>
      isInteger(Number(seatId), 1, 15) && (alignment === 'good' || alignment === 'evil')))
  return (skill.actorSeatId === null || isInteger(skill.actorSeatId, 1, 15)) &&
    typeof skill.actorActualRoleId === 'string' && typeof skill.abilityRoleId === 'string' &&
    typeof skill.claimedRoleId === 'string' && isNumberArray(skill.targetSeatIds) &&
    actualRolesValid && alignmentsValid &&
    (skill.outcomeKind === null || skill.outcomeKind === 'no_effect' || skill.outcomeKind === 'applied' || skill.outcomeKind === 'custom') &&
    typeof skill.outcomeNote === 'string' && isNumberArray(value.publicEvent.targetSeatIds) &&
    typeof value.publicEvent.note === 'string'
}

/**
 * 只校验读取所必需的骨架，且接受 schemaVersion ≥ 1 与未知字段。
 * 这是本机恢复与文件导入共用的兼容边界，不在导入功能里另建一套 GameSession 真值。
 */
export function isReadableGameSession(value: unknown): value is GameSessionState {
  if (!isRecord(value)) return false
  const playerCountValid = value.playerCount === 0 || isInteger(value.playerCount, 7, 15)
  if (!(typeof value.schemaVersion === 'number' && value.schemaVersion >= 1 &&
    typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.scriptId === 'string' &&
    playerCountValid &&
    typeof value.knowledgeVersion === 'string' &&
    isRecord(value.seats) &&
    Array.isArray(value.phaseSegments) &&
    value.phaseSegments.every((segment) => isRecord(segment) &&
      typeof segment.id === 'string' &&
      (segment.kind === 'night' || segment.kind === 'day') &&
      typeof segment.sequence === 'number' && Number.isFinite(segment.sequence) &&
      typeof segment.label === 'string' &&
      typeof segment.createdAt === 'string' &&
      (segment.closedAt === undefined || typeof segment.closedAt === 'string')) &&
    Array.isArray(value.timeline) && value.timeline.every(isTimelineEntry) &&
    isRecord(value.nightRuns) &&
    Object.values(value.nightRuns).every(isNightRun) &&
    isRecord(value.initialPlayerStates) &&
    (value.scriptRoles === undefined || (Array.isArray(value.scriptRoles) && value.scriptRoles.every(isRoleSnapshot))) &&
    (value.setupDraft === null || isSetupDraft(value.setupDraft)) &&
    (value.dayVoteDraft === undefined || isDayVoteDraft(value.dayVoteDraft)) &&
    (value.dayActionDraft === undefined || isDayActionDraft(value.dayActionDraft)) &&
    (value.activeNightRunId === null || (typeof value.activeNightRunId === 'string' && value.activeNightRunId in value.nightRuns)))) return false

  const seatRecord = value.seats as Record<string, unknown>
  const stateRecord = value.initialPlayerStates as Record<string, unknown>
  const seats = Object.values(seatRecord)
  const states = Object.values(stateRecord)
  if (!seats.every(isSeat) || !states.every(isPlayerState)) return false
  if (seats.length !== value.playerCount || states.length !== value.playerCount) return false
  const expectedSeatIds = Array.from({ length: value.playerCount }, (_, index) => String(index + 1))
  return expectedSeatIds.every((seatId) => seatId in seatRecord && seatId in stateRecord)
}

function phaseLabel(kind: 'night' | 'day', sequence: number) {
  return kind === 'night' ? `第${sequence}夜` : `第${sequence}天`
}

function normalizePhaseSegments(session: GameSessionState): GameSessionState {
  const ordered = [...session.phaseSegments]
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
  let highestNight = 0
  let highestDay = 0
  const normalizedById = new Map<string, GameSessionState['phaseSegments'][number]>()

  for (const segment of ordered) {
    const sequence = segment.kind === 'day'
      ? Math.max(segment.sequence, highestDay + 1, highestNight)
      : Math.max(segment.sequence, highestNight + 1, highestDay + 1)
    if (segment.kind === 'day') highestDay = sequence
    else highestNight = sequence

    const label = phaseLabel(segment.kind, sequence)
    normalizedById.set(segment.id, sequence === segment.sequence && label === segment.label
      ? segment
      : { ...segment, sequence, label })
  }

  const phaseSegments = session.phaseSegments.map((segment) => normalizedById.get(segment.id) ?? segment)
  return phaseSegments.every((segment, index) => segment === session.phaseSegments[index])
    ? session
    : { ...session, phaseSegments }
}

/** 复用旧 v1 的既有兼容规则，不写 localStorage。 */
export function normalizeReadableGameSession(session: GameSessionState): GameSessionState {
  const timeline = session.timeline.map((entry) => {
    const originNightRunId = (entry as { originNightRunId?: string | null }).originNightRunId
    if (entry.kind !== 'setup_changed' || originNightRunId !== undefined) return entry
    return { ...entry, originNightRunId: null }
  })
  const seats = Object.fromEntries(Object.entries(session.seats).map(([seatId, seat]) => {
    const legacySeat = seat as typeof seat & { name?: string; nickname?: string }
    const { name: _legacyName, ...seatWithoutLegacyName } = legacySeat
    const nickname = typeof legacySeat.nickname === 'string'
      ? legacySeat.nickname
      : typeof legacySeat.name === 'string'
        ? legacySeat.name.replace(/^\d+号/, '')
        : ''
    return [seatId, { ...seatWithoutLegacyName, nickname }]
  })) as GameSessionState['seats']
  const nightRuns = Object.fromEntries(Object.entries(session.nightRuns).map(([runId, run]) => {
    const legacyRun = run as typeof run & {
      revision?: number
      knowledgeVersion?: string
      aiAdviceLog?: typeof run.aiAdviceLog
      correctionItemId?: string | null
      lastNotice?: string
    }
    return [runId, {
      ...legacyRun,
      revision: legacyRun.revision ?? 0,
      knowledgeVersion: legacyRun.knowledgeVersion ?? session.knowledgeVersion,
      aiAdviceLog: legacyRun.aiAdviceLog ?? {},
      correctionItemId: legacyRun.correctionItemId ?? null,
      lastNotice: legacyRun.lastNotice ?? '',
    }]
  })) as GameSessionState['nightRuns']
  const dayActionDraft = session.dayActionDraft
    ? {
        ...session.dayActionDraft,
        skill: {
          ...session.dayActionDraft.skill,
          targetActualRoleIds: session.dayActionDraft.skill.targetActualRoleIds ?? {},
          targetAlignments: session.dayActionDraft.skill.targetAlignments ?? {},
        },
      }
    : null
  const timelineChanged = !timeline.every((entry, index) => entry === session.timeline[index])
  const normalized = normalizePhaseSegments(timelineChanged
    ? { ...session, timeline, seats, nightRuns }
    : { ...session, seats, nightRuns })
  return {
    ...normalized,
    dayVoteDraft: normalized.dayVoteDraft ?? null,
    dayActionDraft,
  }
}

export function isLegacyNightWorkbenchState(value: unknown): value is NightWorkbenchState {
  if (!isRecord(value)) return false
  const state = value as Partial<NightWorkbenchState>
  if (typeof state.nightRunId !== 'string' ||
    !Array.isArray(state.queue) ||
    typeof state.activeCursorId !== 'string' ||
    typeof state.previewEntryId !== 'string' ||
    !isRecord(state.drafts) ||
    !isRecord(state.confirmedRecords) ||
    !Array.isArray(state.roleChangeEvents)) return false

  const expectedItemIds = new Set(initialNightWorkbenchState.queue.map((item) => item.id))
  const queueItemIds = new Set(state.queue.map((item) => item.id))
  if (queueItemIds.size !== expectedItemIds.size ||
    [...expectedItemIds].some((itemId) => !queueItemIds.has(itemId)) ||
    !queueItemIds.has(state.activeCursorId) ||
    !queueItemIds.has(state.previewEntryId)) return false

  const records = Object.values(state.confirmedRecords).flat()
  const recordIds = new Set(records.map((record) => record.id))
  if (recordIds.size !== records.length || records.some((record) =>
    !queueItemIds.has(record.wakeItemId) ||
    typeof record.id !== 'string' ||
    typeof record.confirmedAt !== 'string' ||
    (record.correctionOf !== undefined && !recordIds.has(record.correctionOf)))) return false

  return state.queue.every((item) =>
    item.progress !== 'confirmed' || records.some((record) => record.wakeItemId === item.id))
}

function previewFor(session: GameSessionState, source: SessionImportPreview['source']): SessionImportPreview {
  const timestamps = [
    ...session.phaseSegments.flatMap((segment) => [segment.createdAt, segment.closedAt]),
    ...session.timeline.map((entry) => entry.createdAt),
    session.setupDraft?.updatedAt,
  ].filter((value): value is string => typeof value === 'string' && !Number.isNaN(Date.parse(value)))
  return {
    sessionId: session.id,
    scriptId: session.scriptId,
    playerCount: session.playerCount,
    phaseCount: session.phaseSegments.length,
    timelineCount: session.timeline.length,
    nightRunCount: Object.keys(session.nightRuns).length,
    updatedAt: timestamps.sort((left, right) => Date.parse(right) - Date.parse(left))[0],
    source,
  }
}

function textByteLength(text: string) {
  return new TextEncoder().encode(text).byteLength
}

/** 纯解析：只返回候选与预览，不读取或写入任何浏览器存储。 */
export function parseSessionImportText(text: string): SessionImportResult {
  if (textByteLength(text) > MAX_SESSION_IMPORT_BYTES) {
    return { ok: false, code: 'too-large', message: '文件超过 2 MB，无法作为单局对局备份导入。' }
  }
  if (!text.trim()) return { ok: false, code: 'empty', message: '文件内容为空。' }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, code: 'invalid-json', message: '文件不是有效的 JSON，可能已损坏或未完整下载。' }
  }

  if (!isRecord(parsed)) {
    return { ok: false, code: 'invalid-root', message: 'JSON 顶层必须是一份对局对象，不能是数组、文本或空值。' }
  }

  if (isReadableGameSession(parsed)) {
    const session = normalizeReadableGameSession(parsed)
    return { ok: true, session, preview: previewFor(session, 'game-session') }
  }

  if (isLegacyNightWorkbenchState(parsed)) {
    const session = createPrototypeGameSessionFromLegacyNight(parsed)
    return { ok: true, session, preview: previewFor(session, 'legacy-night-workbench') }
  }

  return {
    ok: false,
    code: 'invalid-session',
    message: '文件缺少对局必需字段，或不是当前工具兼容的旧版备份。',
  }
}

/** File 适配只负责限流和读文本；解析与兼容判断仍由纯函数完成。 */
export async function readSessionImportFile(file: File): Promise<SessionImportResult> {
  if (file.size > MAX_SESSION_IMPORT_BYTES) {
    return { ok: false, code: 'too-large', message: '文件超过 2 MB，无法作为单局对局备份导入。' }
  }
  try {
    return parseSessionImportText(await file.text())
  } catch {
    return { ok: false, code: 'file-read-failed', message: '无法读取这个文件，请重新选择或重新下载后再试。' }
  }
}
