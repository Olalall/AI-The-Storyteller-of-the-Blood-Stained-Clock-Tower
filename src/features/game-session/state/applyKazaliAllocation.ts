import { getSmartScriptPack, roleSnapshotsForScript, roleTeamByIdForScript } from '../../../domain/scripts'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { projectNightInteraction } from '../../night-workbench/state/projectNightInteraction'
import { targetRoleChoicesSatisfied } from '../../night-workbench/state/projectWakeDraft'
import type { RoleSnapshot, WakeItem } from '../../night-workbench/types'
import type { GameSessionState, SetupChangedEntry } from '../types'
import { createFirstNightSystemSteps, mergeFirstNightSystemSteps } from './firstNightSystemSteps'
import { createSmartScriptNightQueue } from './createNextNightRun'
import { projectConfirmedSetup, projectCurrentAssignments, projectCurrentPlayerStates, projectNightConfirmedRecords } from './projectors'
import type { GameSessionAction } from './sessionActions'

/** 只生成显式确认的预览；录入、AI 和普通夜晚确认均不调用换角。 */
export function projectKazaliAllocation(session: GameSessionState) {
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  if (!run || run.nightType !== 'first') return null
  const original = run.queue.find((entry) => entry.roleId === 'kazali')
  const item = original && projectNightInteraction(original, run.scriptId, { nightType: run.nightType, playerCount: run.playerCount })
  if (!item?.targetRoleChoiceCount) return null
  const record = projectNightConfirmedRecords(session, run.id)[item.id]?.at(-1)
  const applied = session.timeline.filter((entry): entry is SetupChangedEntry => entry.kind === 'setup_changed'
    && entry.originNightRunId === run.id && Boolean(entry.sourceNightActionId)
    && session.timeline.some((source) => source.kind === 'night_action' && source.id === entry.sourceNightActionId && source.wakeItemId === item.id))
  const pairs = record?.snapshot.targetRoleChoices ?? []
  const assignments = projectCurrentAssignments(session)
  const roles = roleSnapshotsForScript(session.scriptId)
  const teams = roleTeamByIdForScript(session.scriptId)
  const baseline = new Map<number, RoleSnapshot>()
  for (const entry of applied) if (!baseline.has(entry.seatId)) baseline.set(entry.seatId, entry.fromRole)
  const desired = new Map(pairs.map((pair) => [pair.seatId, roles.find((role) => role.id === pair.roleId)]))
  const affected = new Set([...baseline.keys(), ...pairs.map((pair) => pair.seatId)])
  const isApplied = Boolean(record && pairs.length && [...affected].every((seatId) => applied.some((entry) =>
    entry.sourceNightActionId === record.id && entry.seatId === seatId && entry.toRole.id === (desired.get(seatId) ?? baseline.get(seatId))?.id)))
  const changes = [...affected].sort((a, b) => a - b).flatMap((seatId) => {
    const fromRole = assignments.find((assignment) => assignment.seatId === seatId)?.role
    const toRole = desired.get(seatId) ?? baseline.get(seatId)
    return fromRole && toRole ? [{ seatId, fromRole, toRole }] : []
  })
  const lastAppliedBySeat = new Map(applied.map((entry) => [entry.seatId, entry.toRole.id]))
  let blockedReason = ''
  if (!record || !targetRoleChoicesSatisfied(item, record.snapshot, session.playerCount)) blockedReason = '请先完整录入并确认本次首夜爪牙分配。'
  else if (run.phaseSegmentId && session.phaseSegments.find((segment) => segment.id === run.phaseSegmentId)?.closedAt) blockedReason = '本夜已关闭，不能重新应用首夜分配。'
  else if (run.correctionItemId) blockedReason = '请先完成或取消当前记录更正。'
  else if (assignments.find((assignment) => assignment.seatId === item.seatId)?.role.id !== 'kazali' && !baseline.has(item.seatId)) blockedReason = '卡扎力本人已有其他身份变更，请核对现场，不能应用失去能力前的旧分配。'
  else if (applied.some((entry) => assignments.find((assignment) => assignment.seatId === entry.seatId)?.role.id !== lastAppliedBySeat.get(entry.seatId))) blockedReason = '分配后已有其他身份变更，请先核对现场，不能覆盖后续换角。'
  else if ([...baseline].some(([seatId, role]) => teams[role.id] === 'minion' && !desired.has(seatId))) blockedReason = '旧局原先预配了爪牙，缺少该玩家的善良初始身份；请先人工核对，不能把旧爪牙自动恢复进局。'
  else if (assignments.some((assignment) => teams[assignment.role.id] === 'minion' && !affected.has(assignment.seatId))) blockedReason = '旧局已有未包含在本次分配中的爪牙，请先人工核对并调整这些身份。'
  else if (pairs.some((pair) => pair.roleId === 'marionette' && ![1, session.playerCount - 1].includes(Math.abs(pair.seatId - item.seatId)))) blockedReason = '提线木偶必须与恶魔相邻，请更正分配或核对现场。'
  return { run, item, record, pairs, changes, isApplied, blockedReason, baseline }
}

export function applyKazaliAllocation(session: GameSessionState, action: Extract<GameSessionAction, { type: 'apply-kazali-allocation' }>): GameSessionState {
  const plan = projectKazaliAllocation(session)
  const setup = projectConfirmedSetup(session)
  if (!plan || !setup || plan.run.id !== action.nightRunId || plan.record?.id !== action.sourceEntryId
    || action.expectedContextKey !== nightContextKey(session) || plan.blockedReason || plan.isApplied
    || plan.run.privacyShielded || !Number.isFinite(Date.parse(action.confirmedAt))) return session
  const entries: SetupChangedEntry[] = plan.changes.map((change) => ({
    id: `${plan.record!.id}-allocation-${change.seatId}`,
    kind: 'setup_changed', segmentId: null, createdAt: action.confirmedAt, confirmedBy: 'storyteller',
    baseSetupId: setup.id, originNightRunId: plan.run.id, sourceNightActionId: plan.record!.id,
    seatId: change.seatId, fromRole: { ...change.fromRole }, toRole: { ...change.toRole },
    reason: '说书人确认卡扎力首夜爪牙分配，并更新当夜夜序', effectiveFrom: 'future_workbenches',
  }))
  if (!entries.length || entries.some((entry) => session.timeline.some((known) => known.id === entry.id))) return session
  let next = { ...session, timeline: [...session.timeline, ...entries] }
  for (const change of plan.changes) {
    const shownRole = plan.baseline.get(change.seatId) ?? change.fromRole
    if (change.toRole.id === 'marionette' && ['townsfolk', 'outsider'].includes(roleTeamByIdForScript(session.scriptId)[shownRole.id])) {
      next = { ...next, identityPresentations: { ...next.identityPresentations, [change.seatId]: {
        actualRoleId: 'marionette', shownRole: { ...shownRole }, confirmedAt: action.confirmedAt,
      } } }
    }
  }
  const assignments = projectCurrentAssignments(next), playerStates = projectCurrentPlayerStates(next)
  const fresh = mergeFirstNightSystemSteps(createSmartScriptNightQueue(next, assignments, playerStates, plan.run.id, 1),
    createFirstNightSystemSteps(next, assignments, playerStates, plan.run.id))
  const freshById = new Map(fresh.map((item) => [item.id, item]))
  const affected = new Set(plan.changes.map((change) => change.seatId))
  const records = projectNightConfirmedRecords(next, plan.run.id)
  const queue: WakeItem[] = plan.run.queue.map((item) => {
    if (item.systemStep && !freshById.has(item.id)) return item.progress === 'confirmed' ? item : { ...item, progress: 'not_applicable', applicability: 'not_applicable', reason: replacedReason }
    if (!affected.has(item.seatId) || item.id === plan.item.id) return item
    if (freshById.has(item.id)) {
      return item.reason === replacedReason && !records[item.id]?.length ? freshById.get(item.id)! : item
    }
    // 已确认记录仍保留；失去角色的未发动项停用，旧草稿不删除。
    return item.progress === 'confirmed' ? item : { ...item, progress: 'not_applicable', applicability: 'not_applicable', reason: replacedReason }
  })
  const oldIds = new Set(queue.map((item) => item.id))
  queue.push(...fresh.filter((item) => !oldIds.has(item.id)))
  const order = new Map(getSmartScriptPack(session.scriptId).nightOrders.firstNight.map((item) => [item.roleId, item.order]))
  const position = (item: WakeItem) => order.get(item.interactionVersion === 'marionette/pretend-v1'
    ? next.identityPresentations?.[item.seatId]?.shownRole.id ?? ''
    : item.systemStep?.kind === 'audience_notice' ? item.roleId.replace(/^system-audience-/, '') : item.roleId) ?? Infinity
  queue.sort((a, b) => position(a) - position(b) || a.seatId - b.seatId)
  const ordered = mergeFirstNightSystemSteps(queue.filter((item) => !item.systemStep), queue.filter((item) => Boolean(item.systemStep)))
    .map((item, index) => ({ ...item, orderIndex: index + 1 }))
  const active = ordered.find((item) => ['pending', 'draft'].includes(item.progress) && item.applicability !== 'not_applicable') ?? ordered.find((item) => item.id === plan.item.id)!
  return { ...next, nightRuns: { ...next.nightRuns, [plan.run.id]: {
    ...plan.run, queue: ordered, activeCursorId: active.id, previewEntryId: active.id,
    revision: plan.run.revision + 1, correctionItemId: null,
    lastNotice: '已应用首夜爪牙分配；新爪牙已加入当晚夜序，原角色未发动项已停用。已确认记录和旧草稿均保留。',
  } } }
}

const replacedReason = '卡扎力首夜分配后已不再拥有此角色；旧草稿保留，不继续发动。'

/** 后续项目不能在爪牙身份和本夜夜序尚未确认时继续结算。 */
export function kazaliAllocationBlocksItem(session: GameSessionState, itemId: string) {
  const plan = projectKazaliAllocation(session)
  if (!plan || plan.isApplied || itemId === plan.item.id) return false
  const item = plan.run.queue.find((entry) => entry.id === itemId)
  return Boolean(item && item.orderIndex > plan.item.orderIndex)
}
