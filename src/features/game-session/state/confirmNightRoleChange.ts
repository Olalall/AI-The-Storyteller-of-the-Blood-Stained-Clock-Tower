import { getSmartScriptPack, roleSnapshotsForScript } from '../../../domain/scripts'
import type { WakeItem } from '../../night-workbench/types'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { roleChangeReasonLabel } from '../../night-workbench/state/roleChanges'
import type { GameSessionState, SetupChangedEntry } from '../types'
import { createSmartScriptNightQueue } from './createNextNightRun'
import { projectConfirmedSetup, projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import type { GameSessionAction } from './sessionActions'
import { projectKazaliAllocation } from './applyKazaliAllocation'
import { nightInteractionInputs } from '../../../domain/scripts/nightInteractionInputs'

/** 只构造可录入项；是否当晚发动、在哪个时点发动仍由主持确认。 */
export function changedRoleNightItems(session: GameSessionState, seatId: number, roleId: string, instanceId: string, timing: 'tonight' | 'initial' = 'tonight') {
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  const role = roleSnapshotsForScript(session.scriptId).find((candidate) => candidate.id === roleId)
  if (!run || !role) return []
  const assignments = [{ seatId, role }], states = projectCurrentPlayerStates(session)
  if (timing === 'initial') {
    const spec = nightInteractionInputs[roleId]?.midgameInitialization
    if (!spec || run.nightType !== 'other') return []
    return createSmartScriptNightQueue(session, assignments, states, instanceId, 1).map((item): WakeItem => ({
      ...item, abilityPhase: 'initial', ability: spec.prompt, storytellerPrompt: spec.prompt, targetLabel: spec.label,
      outcomeOptions: [{ id: 'record-initialization', label: `记录${spec.label}`, requiredInputs: ['targets'], resultTemplate: spec.resultTemplate }],
    }))
  }
  const regular = createSmartScriptNightQueue(session, assignments, states, instanceId, run.nightType === 'first' ? 1 : 2)
  if (regular.length || run.nightType === 'first') return regular
  // 仅首夜的能力在中途获得时也需要处理；不重新执行开局人数修正。
  return createSmartScriptNightQueue(session, assignments, states, instanceId, 1)
}

export function hasUnsyncedRoleChange(session: GameSessionState, seatId: number) {
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  const latest = session.timeline.findLast((entry) => entry.kind === 'setup_changed' && entry.seatId === seatId)
  return Boolean(run && latest?.kind === 'setup_changed' && latest.originNightRunId === run.id
    && latest.nightAbilityTiming === undefined && !latest.sourceNightActionId)
}

export function confirmNightRoleChange(session: GameSessionState, action: Extract<GameSessionAction, { type: 'confirm-night-role-change' }>) {
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  const setup = projectConfirmedSetup(session)
  const fromRole = projectCurrentAssignments(session).find((assignment) => assignment.seatId === action.seatId)?.role
  const toRole = roleSnapshotsForScript(session.scriptId).find((role) => role.id === action.roleId)
  const allocation = projectKazaliAllocation(session)
  if (!run || !setup || !fromRole || !toRole || run.id !== action.nightRunId
    || fromRole.id !== action.expectedRoleId || fromRole.id === toRole.id && !hasUnsyncedRoleChange(session, action.seatId)
    || action.expectedContextKey !== nightContextKey(session) || action.expectedRevision !== run.revision
    || run.privacyShielded || run.correctionItemId || allocation && !allocation.isApplied
    || run.phaseSegmentId && session.phaseSegments.some((phase) => phase.id === run.phaseSegmentId && phase.closedAt)
    || !['tonight', 'initial', 'later'].includes(action.timing) || !Object.hasOwn(roleChangeReasonLabel, action.reason)
    || !action.id.trim() || session.timeline.some((entry) => entry.id === action.id)
    || !Number.isFinite(Date.parse(action.confirmedAt))) return session
  const previous = session.timeline.filter((entry) => entry.kind === 'setup_changed' && entry.seatId === action.seatId)
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)).at(-1)
  const previousTime = Date.parse(previous?.createdAt ?? setup.confirmedAt), requestedTime = Date.parse(action.confirmedAt)
  if (requestedTime < previousTime) return session
  // 同毫秒换回时仍按追加顺序生效，不能让事件 ID 字典序决定当前身份。
  const minTime = previousTime + (previous && !previous.createdAt.includes('.') ? 1000 : 1)
  const createdAt = new Date(Math.max(requestedTime, minTime)).toISOString()
  const entry: SetupChangedEntry = {
    id: action.id, kind: 'setup_changed', segmentId: null, createdAt, confirmedBy: 'storyteller',
    baseSetupId: setup.id, originNightRunId: run.id, seatId: action.seatId,
    nightAbilityTiming: action.timing,
    fromRole: { ...fromRole }, toRole: { ...toRole }, effectiveFrom: 'future_workbenches',
    reason: `${roleChangeReasonLabel[action.reason]}；主持已核对${action.timing === 'initial' ? '当晚仅初始化新能力' : action.timing === 'tonight' ? '当晚处理新能力' : '本夜不再发动新能力'}`,
  }
  const next = { ...session, timeline: [...session.timeline, entry] }
  const additions = action.timing !== 'later' ? changedRoleNightItems(next, action.seatId, toRole.id, action.id, action.timing) : []
  if (action.timing !== 'later' && !additions.length) return session
  const queue: WakeItem[] = run.queue.map((item) => item.seatId !== action.seatId || item.progress === 'confirmed'
    ? item : { ...item, progress: 'not_applicable', applicability: 'not_applicable', reason: '主持已确认角色变化，原能力不再发动；原草稿保留。' })
  const orders = getSmartScriptPack(session.scriptId).nightOrders[run.nightType === 'first' ? 'firstNight' : 'otherNight']
  const order = new Map(orders.map((item) => [item.roleId, item.order]))
  for (const item of additions) {
    const rank = item.abilityPhase === 'initial' ? undefined : order.get(item.roleId)
    const index = rank === undefined ? queue.findIndex((known) => known.id === run.activeCursorId) + 1
      : queue.findIndex((known) => (order.get(known.roleId) ?? Infinity) > rank)
    queue.splice(index < 0 ? queue.length : index, 0, { ...item,
      reason: `${item.reason ? `${item.reason} ` : ''}主持已确认当晚处理新获得的能力；核对时点、旧持续效果及使用次数。`,
    })
  }
  const active = queue.find((item) => ['pending', 'draft'].includes(item.progress) && item.applicability !== 'not_applicable')
    ?? queue.find((item) => item.id === run.activeCursorId)!
  return { ...next, nightRuns: { ...next.nightRuns, [run.id]: {
    ...run, queue: queue.map((item, index) => ({ ...item, orderIndex: index + 1 })),
    revision: run.revision + 1, activeCursorId: active.id, previewEntryId: active.id,
    lastNotice: `${action.seatId}号已改为${toRole.name}；原未发动项已停用。${additions.length ? '新能力已加入当夜夜序，请核对时点后处理。' : '主持已确认本夜不再发动新能力。'}生死、阵营和毒醉仍需分别确认。`,
  } } }
}
