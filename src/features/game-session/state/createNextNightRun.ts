import { sampleOtherNightQueue } from '../../night-workbench/data/catfishing'
import { getSmartScriptPack, roleAbilityForScript, rolePromptForScript, roleSnapshotsForScript } from '../../../domain/scripts'
import type { AbilityInputKind, NightOrderEntry, SmartRoleDefinition } from '../../../domain/scripts'
import type { OutcomeInput, PlayerStatusSnapshot, WakeItem, WakeRoleChoice } from '../../night-workbench/types'
import type { GameSessionState, NightRunState, PlayerState, SetupAssignment } from '../types'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { storytellerSeatLabel } from '../seatPresentation'

export function nextNightSequence(session: GameSessionState) {
  return Math.max(0, ...session.phaseSegments
    .filter((segment) => segment.kind === 'night')
    .map((segment) => segment.sequence)) + 1
}

/**
 * 当前仅为 Catfishing 12 人样例生成“其他夜”队列快照。
 * 它按已确认的身份投影填入座位，不根据角色结果自动改状态或裁定技能。
 */
export function createNextNightRun(session: GameSessionState): NightRunState | null {
  const sequence = nextNightSequence(session)
  const id = nextNightRunId(session, sequence)
  const assignments = projectCurrentAssignments(session)
  const playerStates = projectCurrentPlayerStates(session)
  const queue = session.scriptId === 'catfishing'
    ? createOtherNightQueue(session, assignments, playerStates, id)
    : createSmartScriptNightQueue(session, assignments, playerStates, id, sequence)
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

function createSmartScriptNightQueue(
  session: GameSessionState,
  assignments: SetupAssignment[],
  playerStates: Record<number, PlayerState>,
  runId: string,
  sequence: number,
) {
  const pack = getSmartScriptPack(session.scriptId)
  const orders = sequence === 1 ? pack.nightOrders.firstNight : pack.nightOrders.otherNight
  const roleById = new Map(pack.roles.map((role) => [role.id, role]))
  const assignmentByRole = new Map(assignments.map((assignment) => [assignment.role.id, assignment]))

  return orders.flatMap((order) => {
    const assignment = assignmentByRole.get(order.roleId)
    const role = roleById.get(order.roleId)
    const playerState = assignment ? playerStates[assignment.seatId] : undefined
    if (!assignment || !role || !playerState) return []
    return [createSmartWakeItem({ session, assignment, playerState, role, order, runId })]
  })
    .map((item, index) => ({ ...item, orderIndex: index + 1 }))
}

function createSmartWakeItem(input: {
  session: GameSessionState
  assignment: SetupAssignment
  playerState: PlayerState
  role: SmartRoleDefinition
  order: NightOrderEntry
  runId: string
}): WakeItem {
  const { session, assignment, playerState, role, order, runId } = input
  const roleChoices = createRoleChoices(session.scriptId, role.inputKinds)
  const targetCount = targetCountFor(role.inputKinds)
  const dead = playerState.life === 'dead'
  return {
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
    storytellerPrompt: order.note ?? rolePromptForScript(session.scriptId, role.id),
    progress: 'pending',
    applicability: dead ? 'needs_review' : 'applicable',
    status: toWakeStatus(playerState),
    reason: dead ? '玩家已死亡；请说书人核对是否需要唤醒。' : undefined,
    targetCount,
    targetLabel: targetCount > 1 ? '玩家' : targetCount === 1 ? '目标' : undefined,
    targetKind: targetCount > 0 ? 'player_choice' : undefined,
    roleChoices,
    roleLabel: roleChoices ? '角色' : undefined,
    interactionVersion: `${session.scriptId}/generic-night-v1`,
    outcomeOptions: createGenericOutcomeOptions(targetCount, Boolean(roleChoices)),
  }
}

function targetCountFor(inputKinds: readonly AbilityInputKind[]) {
  if (inputKinds.includes('players')) return 2
  if (inputKinds.includes('player')) return 1
  return 0
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

function createOtherNightQueue(
  session: GameSessionState,
  assignments: SetupAssignment[],
  playerStates: Record<number, PlayerState>,
  runId: string,
) {
  const assignmentsByRole = new Map<string, SetupAssignment[]>()
  for (const assignment of assignments) {
    assignmentsByRole.set(assignment.role.id, [...(assignmentsByRole.get(assignment.role.id) ?? []), assignment])
  }

  const queue: WakeItem[] = []
  for (const template of sampleOtherNightQueue) {
    const matches = assignmentsByRole.get(template.roleId) ?? []
    for (const assignment of matches) {
      const playerState = playerStates[assignment.seatId]
      if (!playerState) continue
      const dead = playerState.life === 'dead'
      queue.push({
        ...structuredClone(template),
        id: `${runId}-${assignment.role.id}-${assignment.seatId}`,
        orderIndex: queue.length + 1,
        seatId: assignment.seatId,
        playerLabel: session.seats[assignment.seatId]
          ? storytellerSeatLabel(session.seats[assignment.seatId])
          : `${assignment.seatId}号`,
        roleId: assignment.role.id,
        roleName: assignment.role.name,
        roleInitial: assignment.role.initial,
        iconPath: assignment.role.iconPath,
        progress: 'pending',
        applicability: dead ? 'needs_review' : 'applicable',
        status: toWakeStatus(playerState),
        history: undefined,
        reason: dead ? '玩家已死亡；请说书人核对是否需要唤醒。' : undefined,
      })
    }
  }
  return queue
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
