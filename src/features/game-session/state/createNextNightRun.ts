import { sampleOtherNightQueue } from '../../night-workbench/data/catfishing'
import { getSmartScriptPack, normalizeRoleId, roleAbilityForScript, rolePromptForScript, roleSnapshotsForScript } from '../../../domain/scripts'
import type { AbilityInputKind, NightOrderEntry, SmartRoleDefinition } from '../../../domain/scripts'
import type { OutcomeInput, PlayerStatusSnapshot, WakeItem, WakeRoleChoice } from '../../night-workbench/types'
import type { GameSessionState, NightRunState, PlayerState, SetupAssignment } from '../types'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { storytellerSeatLabel } from '../seatPresentation'
import { nextPhaseSequence } from './phaseSegments'
import { nightInteractionInputs, nightTargetCountForRole } from '../../../domain/scripts/nightInteractionInputs'
import { projectNightInteraction } from '../../night-workbench/state/projectNightInteraction'
import { targetContractFor, createRoleSpecificOutcomeOptions } from './nightWakeContract'
import { applyWakeHistoricalContext } from './nightHistoricalContext'
import { createAudienceNoticeItem, createFirstNightSystemSteps, mergeFirstNightSystemSteps } from './firstNightSystemSteps'
import { playerFacingIdentity } from '../../identity-deal/identityProjection'

export function nextNightSequence(session: GameSessionState) {
  return nextPhaseSequence(session, 'night')
}

/**
 * 按剧本首夜/后续夜表和已确认身份生成新夜序，已有夜序不重建。
 * 角色交互只描述录入表单，不根据结果自动修改状态或裁定技能。
 */
export function createNextNightRun(session: GameSessionState): NightRunState | null {
  const sequence = nextNightSequence(session)
  const id = nextNightRunId(session, sequence)
  const assignments = projectCurrentAssignments(session)
  const playerStates = projectCurrentPlayerStates(session)
  const roles = createSmartScriptNightQueue(session, assignments, playerStates, id, sequence)
  const queue = (sequence === 1 && session.scriptId !== 'catfishing'
    ? mergeFirstNightSystemSteps(roles, createFirstNightSystemSteps(session, assignments, playerStates, id)) : roles)
    .map((item, index) => ({ ...item, orderIndex: index + 1 }))
  if (!queue.length) return null

  return {
    id,
    phaseSegmentId: null,
    scriptId: session.scriptId,
    nightType: sequence === 1 ? 'first' : 'other',
    playerCount: session.playerCount,
    revision: 0,
    knowledgeVersion: session.knowledgeVersion,
    queue,
    activeCursorId: queue[0].id,
    previewEntryId: queue[0].id,
    drafts: {},
    privacyShielded: false,
    dimmed: false,
    aiAdviceLog: {},
    correctionItemId: null,
    lastNotice: `第${sequence}夜草稿已创建；首次确认后建立记录`,
  }
}

export function createSmartScriptNightQueue(
  session: GameSessionState,
  assignments: SetupAssignment[],
  playerStates: Record<number, PlayerState>,
  runId: string,
  sequence: number,
) {
  const pack = getSmartScriptPack(session.scriptId)
  const orders = sequence === 1 ? pack.nightOrders.firstNight : pack.nightOrders.otherNight
  const roleById = new Map(pack.roles.map((role) => [normalizeRoleId(role.id), role]))
  const queue = orders.flatMap((order) => {
    const role = roleById.get(normalizeRoleId(order.roleId))
    if (!role) return []
    const roleAssignments = assignments.filter((assignment) => normalizeRoleId(assignment.role.id) === normalizeRoleId(order.roleId))
    if (order.delivery?.kind === 'audience_notice') {
      return roleAssignments.length ? [createAudienceNoticeItem({ session, assignments: projectCurrentAssignments(session), playerStates, sourceAssignments: roleAssignments, role, order, runId })] : []
    }
    return roleAssignments.flatMap((assignment) => {
      const playerState = playerStates[assignment.seatId]
      return playerState ? [createSmartWakeItem({ session, assignment, playerState, role, order, runId, isFirstNight: sequence === 1 })] : []
    })
  })
  for (const assignment of assignments.filter((entry) => normalizeRoleId(entry.role.id) === 'marionette')) {
    const shown = playerFacingIdentity(session, assignment.seatId).role
    const role = shown && roleById.get(normalizeRoleId(shown.id))
    const order = role && orders.find((entry) => entry.roleId === role.id)
    const playerState = playerStates[assignment.seatId]
    if (!role || !shown || !order || !playerState) continue
    const prompt = `按对外身份“${shown.name}”的时点假装唤醒和反馈。原善良能力不生效，不执行其毒醉、死亡或身份效果，也不展示提线木偶身份。`
    queue.push({
      ...createSmartWakeItem({ session, assignment: { ...assignment, role: shown }, playerState, role, order, runId, isFirstNight: sequence === 1 }),
      id: `${runId}-marionette-pretend-${shown.id}-${assignment.seatId}`,
      roleId: 'marionette', roleName: `提线木偶（假装${shown.name}）`, roleInitial: assignment.role.initial, iconPath: assignment.role.iconPath,
      ability: prompt, storytellerPrompt: prompt, reason: prompt,
      targetCount: 0, targetRoleChoiceCount: undefined, allowedTargetCounts: undefined, targetKind: undefined,
      targetLabel: undefined, roleCount: undefined, roleChoices: undefined, roleLabel: undefined,
      interactionVersion: 'marionette/pretend-v1',
      outcomeOptions: [{ id: 'record', label: '已完成假装流程', requiredInputs: [], resultTemplate: `{actor}按对外身份“${shown.name}”完成假装流程，原善良技能无真实效果。` }],
    })
  }
  return queue.sort((a, b) => a.orderIndex - b.orderIndex || a.seatId - b.seatId).map((item, index) => ({ ...item, orderIndex: index + 1 }))
}

function createSmartWakeItem(input: {
  session: GameSessionState
  assignment: SetupAssignment
  playerState: PlayerState
  role: SmartRoleDefinition
  order: NightOrderEntry
  runId: string
  isFirstNight: boolean
}): WakeItem {
  const { session, assignment, playerState, role, order, runId, isFirstNight } = input
  const template = session.scriptId === 'catfishing' ? sampleOtherNightQueue.find((item) => item.roleId === role.id) : undefined
  const firstNightRoleCount = isFirstNight ? nightInteractionInputs[role.id]?.firstNightRoleCount : undefined
  const roleChoices = firstNightRoleCount === 0 ? undefined
    : template?.roleChoices ? structuredClone(template.roleChoices) : createRoleChoices(session.scriptId, role.inputKinds)
  const contract = targetContractFor(role, session.playerCount, roleAbilityForScript(session.scriptId, role.id))
  const explicit = nightInteractionInputs[role.id]
  const targetCount = template?.targetCount ?? (explicit ? nightTargetCountForRole(role, isFirstNight) : contract.targetCount)
  const genericOptions = createGenericOutcomeOptions(targetCount, Boolean(roleChoices))
  const specificOptions = createRoleSpecificOutcomeOptions(role.id, contract, Boolean(roleChoices))
  const outcomes = specificOptions ? [...specificOptions, ...genericOptions.filter((option) => !specificOptions.some((known) => known.id === option.id) && (option.id === 'skip' || !specificOptions.some((known) => known.targetCounts?.length)))] : genericOptions
  const dead = playerState.life === 'dead'
  return applyWakeHistoricalContext(session, projectNightInteraction({
    id: `${runId}-${role.id}-${assignment.seatId}`,
    orderIndex: order.order,
    seatId: assignment.seatId,
    playerLabel: session.seats[assignment.seatId]
      ? storytellerSeatLabel(session.seats[assignment.seatId])
      : `${assignment.seatId}号`,
    roleId: role.id,
    roleName: role.name,
    roleInitial: assignment.role.initial,
    iconPath: assignment.role.iconPath,
    ability: roleAbilityForScript(session.scriptId, role.id),
    storytellerPrompt: template?.storytellerPrompt ?? order.note ?? rolePromptForScript(session.scriptId, role.id),
    progress: 'pending',
    applicability: dead ? 'needs_review' : 'applicable',
    status: toWakeStatus(playerState),
    reason: dead ? '玩家已死亡；请说书人核对是否需要唤醒。' : undefined,
    targetCount,
    minimumTargetCount: explicit ? undefined : contract.minimumTargetCount,
    targetLabel: template?.targetLabel ?? contract.targetLabel ?? (targetCount > 1 ? '玩家' : targetCount === 1 ? '目标' : undefined),
    targetKind: template?.targetKind ?? (targetCount > 0 ? 'player_choice' : undefined),
    roleChoices,
    roleLabel: roleChoices ? template?.roleLabel ?? '角色' : undefined,
    interactionVersion: template?.interactionVersion ?? `${session.scriptId}/generic-night-v1`,
    outcomeOptions: template ? structuredClone(template.outcomeOptions) : outcomes,
  }, session.scriptId, { nightType: isFirstNight ? 'first' : 'other', playerCount: session.playerCount }), isFirstNight ? 1 : nextNightSequence(session))
}

function createRoleChoices(scriptId: string, inputKinds: readonly AbilityInputKind[]): WakeRoleChoice[] | undefined {
  if (!inputKinds.includes('role')) return undefined
  return roleSnapshotsForScript(scriptId).map((role) => ({ id: role.id, label: role.name }))
}

function createGenericOutcomeOptions(targetCount: number, needsRole: boolean) {
  const requiredInputs: OutcomeInput[] = [
    ...(targetCount > 0 ? ['targets' as const] : []),
    ...(needsRole ? ['role' as const] : []),
  ]
  const hasInput = requiredInputs.length > 0
  const resultTemplate = targetCount > 0 && needsRole
    ? '{actor}记录：{targets} · {role}。'
    : targetCount > 0
      ? '{actor}记录：{targets}。'
      : needsRole
        ? '{actor}记录：{role}。'
        : '{actor}本夜已记录。'
  return [
    {
      id: 'record',
      label: hasInput ? '记录结果' : '已记录',
      requiredInputs,
      resultTemplate,
    },
    {
      id: 'skip',
      label: '不发动',
      requiredInputs: [],
      resultTemplate: '{actor}本夜不发动。',
    },
  ]
}

function nextNightRunId(session: GameSessionState, sequence: number) {
  const base = `${session.scriptId}-night-${sequence}`
  if (!session.nightRuns[base]) return base
  let revision = 2
  while (session.nightRuns[`${base}-${revision}`]) revision += 1
  return `${base}-${revision}`
}

function toWakeStatus(state: PlayerState): PlayerStatusSnapshot {
  return {
    life: state.life,
    impairments: [
      ...(state.poisoned ? ['poisoned' as const] : []),
      ...(state.drunk ? ['drunk' as const] : []),
    ],
    markers: state.markers.map((marker) => ({ ...marker })),
  }
}
