import { sampleOtherNightQueue } from '../../night-workbench/data/catfishing'
import {
  getSmartScriptPack,
  roleAbilityForScript,
  rolePromptForScript,
  roleSnapshotsForScript,
  roleTeamByIdForScript,
} from '../../../domain/scripts'
import type { AbilityInputKind, NightOrderEntry, SmartRoleDefinition } from '../../../domain/scripts'
import type {
  OutcomeInput,
  PlayerStatusSnapshot,
  SystemStepBluffChoice,
  SystemStepSpec,
  WakeItem,
  WakeRoleChoice,
} from '../../night-workbench/types'
import type { GameSessionState, NightRunState, PlayerState, SetupAssignment } from '../types'
import { projectConfirmedSetup, projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
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
  // Catfishing 是原型样例：它连首夜都发「其他夜」样例队列，插首夜专属步骤只会自相矛盾。
  const isSampleQueue = session.scriptId === 'catfishing'
  const roleQueue = isSampleQueue
    ? createOtherNightQueue(session, assignments, playerStates, id)
    : createSmartScriptNightQueue(session, assignments, playerStates, id, sequence)
  if (!roleQueue.length) return null
  // 首夜真正的第一步不是任何角色，而是爪牙信息与恶魔信息；它们排在队首，其余项顺延。
  const queue = [
    ...(sequence === 1 && !isSampleQueue ? createFirstNightSystemSteps(session, assignments, playerStates, id) : []),
    ...roleQueue,
  ].map((item, index) => ({ ...item, orderIndex: index + 1 }))

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

/** 《规则概要》二.2：七人及以上的首夜才走爪牙信息与恶魔信息。 */
const systemStepMinPlayers = 7

/** 《夜晚行动顺序一览》首夜段：这两个角色在场时整段跳过爪牙信息与恶魔信息。 */
const infoSuppressingRoleIds = ['poppygrower', 'tor']

const bluffTeamLabels: Record<string, string> = {
  townsfolk: '镇民',
  outsider: '外来者',
}

/**
 * 首夜队首的两张系统步骤卡。人数不足、缺爪牙或缺恶魔、以及罂粟种植者/遗忘之门在场时都不插，
 * 与百科一致。这里只生成「无目标的纯记录卡」：名单是只读文案，指认只落勾选。
 */
function createFirstNightSystemSteps(
  session: GameSessionState,
  assignments: SetupAssignment[],
  playerStates: Record<number, PlayerState>,
  runId: string,
): WakeItem[] {
  if (session.playerCount < systemStepMinPlayers) return []
  if (assignments.some((assignment) => infoSuppressingRoleIds.includes(assignment.role.id))) return []

  const teamById = roleTeamByIdForScript(session.scriptId)
  const minions = assignments.filter((assignment) => teamById[assignment.role.id] === 'minion')
  const demon = assignments.find((assignment) => teamById[assignment.role.id] === 'demon')
  if (!minions.length || !demon) return []

  const minionSeats = minions.map((assignment) => `${assignment.seatId}号`).join('、')
  const demonSeat = `${demon.seatId}号`
  const minionLabels = minions.map((assignment) => seatLabel(session, assignment.seatId))
  const demonLabel = seatLabel(session, demon.seatId)

  const minionStep: SystemStepSpec = {
    kind: 'minion_info',
    minionLabels,
    demonLabel,
    infoTokens: ['他是恶魔'],
    checks: [{ id: 'pointed-demon', label: '已逐个指认恶魔（每名爪牙都看清了）' }],
  }
  const demonStep: SystemStepSpec = {
    kind: 'demon_info',
    minionLabels,
    demonLabel,
    infoTokens: ['他们是你的爪牙', '这些角色不在场'],
    checks: [{ id: 'pointed-minions', label: '已依次指认每一名爪牙' }],
    bluffCount: 3,
    bluffChoices: createBluffChoices(session, assignments),
  }

  return [
    createSystemStepItem({
      session,
      playerStates,
      runId,
      anchorSeatId: minions[0].seatId,
      playerLabel: `全体爪牙 · ${minionSeats}`,
      roleId: 'system-minion-info',
      roleName: '爪牙信息',
      roleInitial: '爪',
      ability: '同时唤醒所有爪牙，让他们互相看见；出示「他是恶魔」信息标记并指认恶魔，确认每名爪牙都看清后再让他们闭眼。',
      storytellerPrompt: '只记录本步骤已完成，不改任何座位状态。',
      step: minionStep,
      outcomeLabel: '已给出爪牙信息',
      resultTemplate: `爪牙信息：向${minionSeats}出示「他是恶魔」，指认${demonSeat}。`,
    }),
    createSystemStepItem({
      session,
      playerStates,
      runId,
      anchorSeatId: demon.seatId,
      playerLabel: `恶魔 · ${demonSeat}`,
      roleId: 'system-demon-info',
      roleName: '恶魔信息',
      roleInitial: '魔',
      ability: '唤醒恶魔：出示「他们是你的爪牙」并依次指认每一名爪牙；再出示「这些角色不在场」，展示三个不在场的善良角色。',
      storytellerPrompt: '记录本夜给出的三张伪装，后续几夜判断恶魔叙事空间要靠它。',
      step: demonStep,
      outcomeLabel: '已给出恶魔信息',
      resultTemplate: `恶魔信息：向${demonSeat}指认爪牙${minionSeats}；展示不在场善良角色{bluffs}。`,
    }),
  ]
}

/** 剧本里的善良角色减去在场角色；配板时预设过的三张只做「预设」提示，不做校验。 */
function createBluffChoices(session: GameSessionState, assignments: SetupAssignment[]): SystemStepBluffChoice[] {
  const teamById = roleTeamByIdForScript(session.scriptId)
  const inPlay = new Set(assignments.map((assignment) => assignment.role.id))
  const suggested = new Set(
    (projectConfirmedSetup(session)?.draft.demonBluffs ?? []).map((role) => role.id),
  )
  return roleSnapshotsForScript(session.scriptId)
    .filter((role) => !inPlay.has(role.id) && bluffTeamLabels[teamById[role.id]])
    .map((role) => ({
      id: role.id,
      label: role.name,
      teamLabel: bluffTeamLabels[teamById[role.id]],
      suggested: suggested.has(role.id),
    }))
}

function createSystemStepItem(input: {
  session: GameSessionState
  playerStates: Record<number, PlayerState>
  runId: string
  anchorSeatId: number
  playerLabel: string
  roleId: string
  roleName: string
  roleInitial: string
  ability: string
  storytellerPrompt: string
  step: SystemStepSpec
  outcomeLabel: string
  resultTemplate: string
}): WakeItem {
  const playerState = input.playerStates[input.anchorSeatId]
  return {
    id: `${input.runId}-${input.roleId}`,
    orderIndex: 0,
    seatId: input.anchorSeatId,
    playerLabel: input.playerLabel,
    roleId: input.roleId,
    roleName: input.roleName,
    roleInitial: input.roleInitial,
    iconPath: '',
    ability: input.ability,
    storytellerPrompt: input.storytellerPrompt,
    progress: 'pending',
    applicability: 'applicable',
    status: playerState
      ? toWakeStatus(playerState)
      : { life: 'alive', impairments: [], markers: [] },
    targetCount: 0,
    interactionVersion: `${input.session.scriptId}/system-step-v1`,
    outcomeOptions: [{
      id: 'given',
      label: input.outcomeLabel,
      requiredInputs: [],
      resultTemplate: input.resultTemplate,
    }],
    systemStep: input.step,
  }
}

function seatLabel(session: GameSessionState, seatId: number) {
  return session.seats[seatId] ? storytellerSeatLabel(session.seats[seatId]) : `${seatId}号`
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
