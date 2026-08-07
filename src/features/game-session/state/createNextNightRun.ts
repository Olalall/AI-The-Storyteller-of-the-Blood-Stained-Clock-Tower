import { sampleOtherNightQueue } from '../../night-workbench/data/catfishing'
import officialNightSheet from '../../night-workbench/data/official/nightsheet.json' with { type: 'json' }
import {
  getSmartScriptPack,
  normalizeRoleId,
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
import { applyWakeHistoricalContext } from './nightHistoricalContext'
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
  const systemSteps = sequence === 1 && !isSampleQueue
    ? createFirstNightSystemSteps(session, assignments, playerStates, id)
    : []
  const queue = mergeFirstNightSystemSteps(roleQueue, systemSteps)
    .map((item, index) => ({ ...item, orderIndex: index + 1 }))

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
  const teamById = roleTeamByIdForScript(session.scriptId)
  const assignmentsByRole = new Map<string, SetupAssignment[]>()
  for (const assignment of assignments) {
    assignmentsByRole.set(assignment.role.id, [
      ...(assignmentsByRole.get(assignment.role.id) ?? []),
      assignment,
    ])
  }

  return orders.flatMap((order) => {
    const role = roleById.get(order.roleId)
    if (!role) return []
    const roleAssignments = assignmentsByRole.get(order.roleId) ?? []
    if (order.delivery?.kind === 'audience_notice') {
      if (!roleAssignments.length) return []
      return [createAudienceNoticeItem({
        session,
        assignments,
        playerStates,
        sourceAssignments: roleAssignments,
        role,
        order,
        runId,
        teamById,
      })]
    }
    return roleAssignments.flatMap((assignment) => {
      const wakeAssignment = normalizeRoleId(role.id) === 'marionette'
        ? assignments.find((candidate) => teamById[candidate.role.id] === 'demon')
        : assignment
      if (!wakeAssignment) return []
      const playerState = playerStates[wakeAssignment.seatId]
      if (!playerState) return []
      return [createSmartWakeItem({
        session,
        assignment,
        wakeAssignment,
        playerState,
        role,
        order,
        runId,
        sequence,
      })]
    })
  })
    .map((item, index) => ({ ...item, orderIndex: index + 1 }))
}

function createSmartWakeItem(input: {
  session: GameSessionState
  assignment: SetupAssignment
  wakeAssignment: SetupAssignment
  playerState: PlayerState
  role: SmartRoleDefinition
  order: NightOrderEntry
  runId: string
  sequence: number
}): WakeItem {
  const { session, assignment, wakeAssignment, playerState, role, order, runId, sequence } = input
  const roleChoices = createRoleChoices(session.scriptId, role.inputKinds)
  const targetContract = targetContractFor(role, session.playerCount)
  const roleSpecificOutcomeOptions = createRoleSpecificOutcomeOptions(role.id, targetContract, Boolean(roleChoices))
  const isPlayerBooleanChoice = role.inputKinds.includes('boolean')
  const dead = playerState.life === 'dead'
  return applyWakeHistoricalContext(session, {
    id: `${runId}-${role.id}-${assignment.seatId}`,
    orderIndex: order.order,
    seatId: wakeAssignment.seatId,
    playerLabel: session.seats[wakeAssignment.seatId]
      ? storytellerSeatLabel(session.seats[wakeAssignment.seatId])
      : `${wakeAssignment.seatId}号`,
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
    targetCount: targetContract.targetCount,
    minimumTargetCount: targetContract.minimumTargetCount,
    targetLabel: targetContract.targetLabel ?? (targetContract.targetCount > 1 ? '玩家' : targetContract.targetCount === 1 ? '目标' : undefined),
    targetKind: targetContract.targetCount > 0 ? 'player_choice' : undefined,
    roleChoices,
    roleLabel: roleChoices ? '角色' : undefined,
    interactionVersion: `${session.scriptId}/generic-night-v1`,
    outcomeOptions: isPlayerBooleanChoice
      ? createBooleanOutcomeOptions()
      : roleSpecificOutcomeOptions ?? createGenericOutcomeOptions(targetContract.targetCount, Boolean(roleChoices)),
    aiAdviceEnabled: !isPlayerBooleanChoice,
  }, sequence)
}

function targetCountFor(inputKinds: readonly AbilityInputKind[]) {
  if (inputKinds.includes('players')) return 2
  if (inputKinds.includes('player')) return 1
  return 0
}

interface NightTargetContract {
  targetCount: number
  minimumTargetCount?: number
  targetLabel?: string
}

const threeTargetRoleIds = new Set([
  'noble',
  'alhadikhia',
  'pu_ren',
  'wu_ling_jun',
])

const twoTargetRoleIds = new Set([
  'seamstress',
  'fortuneteller',
  'barber',
  'investigator',
  'librarian',
  'washerwoman',
  'innkeeper',
  'chambermaid',
  'harpy',
  'shabaloth',
  'tian_ji_ge',
  'tou_ming_ren',
  'xi_mo_ren',
  'yi_zhen_huang_liang',
  'shi_mo',
])

const oneToThreeTargetRoleIds = new Set([
  'dianyuzhang',
])

const oneOrThreeTargetRoleIds = new Set([
  'wan_jun_zhi_li',
])

const anyNumberTargetRoleIds = new Set([
  'taotie',
  'zou_si_fan',
])

const atLeastThreeTargetRoleIds = new Set([
  'zhi_shi_fen_zi',
])

const oneOrTwoTargetRoleIds = new Set([
  'baojun',
  'shuangtoujiao',
  'zu_zhang',
])

const zeroOrOneTargetRoleIds = new Set([
  'wen_yi_zhi_yuan',
  'xue_zhi_nv',
  'ye_yan',
])

function targetContractFor(role: SmartRoleDefinition, playerCount: number): NightTargetContract {
  const roleId = normalizeRoleId(role.id)
  if (threeTargetRoleIds.has(roleId)) return { targetCount: 3, targetLabel: '三名目标' }
  if (twoTargetRoleIds.has(roleId)) return { targetCount: 2, targetLabel: '两名目标' }
  if (oneToThreeTargetRoleIds.has(roleId)) return { targetCount: 3, minimumTargetCount: 1, targetLabel: '1-3名目标' }
  if (oneOrThreeTargetRoleIds.has(roleId)) return { targetCount: 3, minimumTargetCount: 1, targetLabel: '一名或三名目标' }
  if (anyNumberTargetRoleIds.has(roleId)) return { targetCount: playerCount, minimumTargetCount: 0, targetLabel: '任意数量目标' }
  if (atLeastThreeTargetRoleIds.has(roleId)) return { targetCount: playerCount, minimumTargetCount: 3, targetLabel: '至少三名目标' }
  if (oneOrTwoTargetRoleIds.has(roleId)) return { targetCount: 2, minimumTargetCount: 1, targetLabel: '1-2名目标' }
  if (zeroOrOneTargetRoleIds.has(roleId)) return { targetCount: 1, minimumTargetCount: 0, targetLabel: '本夜选择' }
  const inferred = inferTargetContractFromAbility(role.abilityText, playerCount)
  if (inferred) return inferred
  return { targetCount: targetCountFor(role.inputKinds) }
}

function inferTargetContractFromAbility(abilityText: string, playerCount: number): NightTargetContract | undefined {
  if (/(任意名|任意数量|若干).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: playerCount, minimumTargetCount: 0, targetLabel: '任意数量目标' }
  if (/至少三名.{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: playerCount, minimumTargetCount: 3, targetLabel: '至少三名目标' }
  if (/(最多|至多).{0,4}(两名|2名|二名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 2, minimumTargetCount: 0, targetLabel: '至多两名目标' }
  if (/(一名|1名).{0,8}(或|或者).{0,8}(三名|3名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 3, minimumTargetCount: 1, targetLabel: '一名或三名目标' }
  if (/(一名|1名).{0,8}(或|或者).{0,8}(两名|2名|二名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 2, minimumTargetCount: 1, targetLabel: '一名或两名目标' }
  if (/(三名|3名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 3, targetLabel: '三名目标' }
  if (/(两名|2名|二名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 2, targetLabel: '两名目标' }
  return undefined
}

function createRoleChoices(scriptId: string, inputKinds: readonly AbilityInputKind[]): WakeRoleChoice[] | undefined {
  if (!inputKinds.includes('role')) return undefined
  return roleSnapshotsForScript(scriptId).map((role) => ({ id: role.id, label: role.name }))
}

function createBooleanOutcomeOptions() {
  return [
    {
      id: 'yes',
      label: '醉酒至下个黄昏',
      requiredInputs: [],
      resultTemplate: '{actor}选择醉酒至下个黄昏；仅记录选择，不自动改变醉酒状态。',
    },
    {
      id: 'no',
      label: '保持清醒',
      requiredInputs: [],
      resultTemplate: '{actor}选择保持清醒；仅记录选择，不自动改变状态。',
    },
  ]
}

function createRoleSpecificOutcomeOptions(roleId: string, targetContract: NightTargetContract, needsRole: boolean) {
  const canonicalRoleId = normalizeRoleId(roleId)
  if (canonicalRoleId === 'gambler') {
    return [
      {
        id: 'correct',
        label: '猜对 · 无事',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}并猜测为{role}；猜对，无死亡候选。',
      },
      {
        id: 'wrong',
        label: '猜错 · 待死亡',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}并猜测为{role}；猜错，仅生成赌徒死亡候选，仍需说书人确认状态。',
      },
      {
        id: 'no-effect',
        label: '未受影响',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}并猜测为{role}；因醉酒、中毒或其他原因未生效，不自动产生死亡。',
      },
    ]
  }
  if (canonicalRoleId === 'snakecharmer') {
    return [
      {
        id: 'swap',
        label: '选中恶魔 · 待交换',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；若目标确为恶魔，仅生成身份交换候选，仍需说书人确认。',
      },
      {
        id: 'miss',
        label: '未选中恶魔',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；未选中恶魔，不生成身份交换。',
      },
      {
        id: 'no-effect',
        label: '未受影响',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；因醉酒、中毒或其他原因未生效。',
      },
    ]
  }
  if (canonicalRoleId === 'fanggu') {
    return [
      {
        id: 'convert',
        label: '选中外来者 · 待转变',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；若目标登记为外来者，仅生成方古转变候选，仍需说书人确认。',
      },
      {
        id: 'kill',
        label: '普通击杀候选',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；未触发外来者转变时，仅生成死亡候选，仍需说书人确认。',
      },
      {
        id: 'no-effect',
        label: '未受影响',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；因醉酒、中毒或其他原因未生效。',
      },
    ]
  }
  if (canonicalRoleId === 'pithag') {
    return [
      {
        id: 'changed',
        label: '变更为新角色候选',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}变为{role}；仅生成身份变更候选，仍需说书人确认。',
      },
      {
        id: 'already-in-play',
        label: '目标角色已在场',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}变为{role}；该角色当前已在场，是否改为死亡或其他结果由说书人确认。',
      },
      {
        id: 'no-effect',
        label: '未受影响',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}变为{role}；因醉酒、中毒或其他原因未生效。',
      },
    ]
  }
  if (needsRole) return undefined
  if (canonicalRoleId === 'wan_jun_zhi_li') {
    return [
      {
        id: 'one-target',
        label: '记录一名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [1],
        resultTemplate: '{actor}本夜选择{targets}；按一名目标分支记录候选效果，仍由说书人确认状态变化。',
      },
      {
        id: 'three-targets',
        label: '记录三名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [3],
        resultTemplate: '{actor}本夜选择{targets}；按三名目标分支记录候选效果，仍由说书人确认状态变化。',
      },
      {
        id: 'skip',
        label: '不发动',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜不发动。',
      },
    ]
  }
  if (targetContract.targetLabel === '一名或三名目标') {
    return [
      {
        id: 'one-target',
        label: '记录一名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [1],
        resultTemplate: '{actor}本夜选择{targets}；按一名目标分支记录候选效果，仍由说书人确认状态变化。',
      },
      {
        id: 'three-targets',
        label: '记录三名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [3],
        resultTemplate: '{actor}本夜选择{targets}；按三名目标分支记录候选效果，仍由说书人确认状态变化。',
      },
      {
        id: 'skip',
        label: '不发动',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜不发动。',
      },
    ]
  }
  if (targetContract.targetLabel === '一名或两名目标') {
    return [
      {
        id: 'record',
        label: '记录一名或两名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [1, 2],
        resultTemplate: '{actor}本夜选择{targets}；条件和最终效果仍由说书人确认。',
      },
      {
        id: 'skip',
        label: '不发动',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜不发动。',
      },
    ]
  }
  if (oneOrTwoTargetRoleIds.has(canonicalRoleId)) {
    return [
      {
        id: 'record',
        label: '记录1-2名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [1, 2],
        resultTemplate: '{actor}本夜选择{targets}；条件和最终效果仍由说书人确认。',
      },
      {
        id: 'skip',
        label: '不发动',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜不发动。',
      },
    ]
  }
  if (targetContract.minimumTargetCount === 0 && targetContract.targetCount > 1) {
    return [
      {
        id: 'record',
        label: '记录目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；任意数量分支仅记录候选，仍由说书人确认。',
      },
      {
        id: 'skip',
        label: '选择无人',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜明确选择无人。',
      },
    ]
  }
  return undefined
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

function createAudienceNoticeItem(input: {
  session: GameSessionState
  assignments: SetupAssignment[]
  playerStates: Record<number, PlayerState>
  sourceAssignments: SetupAssignment[]
  role: SmartRoleDefinition
  order: NightOrderEntry
  runId: string
  teamById: Record<string, string>
}) {
  const delivery = input.order.delivery
  if (!delivery) throw new Error('audience notice requires delivery metadata')
  const excluded = new Set((delivery.audience.excludeRoleIds ?? []).map(normalizeRoleId))
  const recipients = input.assignments.filter((assignment) => (
    input.teamById[assignment.role.id] === delivery.audience.team
    && !excluded.has(normalizeRoleId(assignment.role.id))
  ))
  const recipientLabels = recipients.map((assignment) => seatLabel(input.session, assignment.seatId))
  const checks = recipients.map((assignment) => ({
    id: `notified-${assignment.seatId}`,
    label: `已向${seatLabel(input.session, assignment.seatId)}展示${delivery.infoToken}标记`,
  }))
  const noRecipients = recipients.length === 0
  const sourceAssignment = input.sourceAssignments[0]
  const sourceState = sourceAssignment ? input.playerStates[sourceAssignment.seatId] : undefined
  const sourceNeedsReview = Boolean(sourceState && (
    sourceState.life === 'dead' || sourceState.poisoned || sourceState.drunk
  ))
  const playerLabel = noRecipients
    ? '无需通知 · 没有可获知此信息的爪牙'
    : `逐个通知 · ${recipientLabels.join(' / ')}`

  return createSystemStepItem({
    session: input.session,
    playerStates: input.playerStates,
    runId: input.runId,
    anchorSeatId: recipients[0]?.seatId ?? 0,
    statusSeatId: sourceAssignment?.seatId,
    playerLabel,
    roleId: `system-audience-${input.role.id}`,
    roleName: `${input.role.name}信息`,
    roleInitial: '知',
    ability: input.order.note ?? rolePromptForScript(input.session.scriptId, input.role.id),
    storytellerPrompt: noRecipients
      ? '本局没有可获知这条信息的爪牙；提线木偶不能因此被唤醒。'
      : `${delivery.mode === 'sequential' ? '逐个' : '共同'}唤醒名单中的玩家，展示「${delivery.infoToken}」标记。`,
    applicability: sourceNeedsReview ? 'needs_review' : 'applicable',
    reason: sourceNeedsReview
      ? `${input.role.name}已死亡、醉酒或中毒；先由说书人确认其能力是否有效，再决定是否通知。`
      : undefined,
    step: {
      kind: 'audience_notice',
      minionLabels: [],
      demonLabel: '',
      audienceLabel: delivery.audience.team === 'minion' ? '接收爪牙' : '接收恶魔',
      recipientLabels,
      infoTokens: [delivery.infoToken],
      checks,
      sensitive: delivery.sensitive,
    },
    outcomeLabel: noRecipients ? '已确认无需通知' : '已完成逐个通知',
    resultTemplate: noRecipients
      ? `${input.role.name}信息：本局没有可获知此信息的爪牙。`
      : `${input.role.name}信息：已向${recipientLabels.join('、')}逐个展示「${delivery.infoToken}」标记。`,
  })
}

/** 《规则概要》二.2：七人及以上的首夜才走爪牙信息与恶魔信息。 */
const systemStepMinPlayers = 7

/** 《夜晚行动顺序一览》首夜段：这两个角色在场时整段跳过爪牙信息与恶魔信息。 */
const infoSuppressingRoleIds = ['poppygrower', 'poppy_grower', 'tor']

const firstNightSystemOrder = new Map(
  officialNightSheet.firstNight.map((roleId, index) => [roleId, index]),
)

function mergeFirstNightSystemSteps(roleQueue: WakeItem[], systemSteps: WakeItem[]) {
  if (!systemSteps.length) return roleQueue
  const queue = [...roleQueue]
  for (const systemStep of systemSteps) {
    const roleId = systemStep.roleId === 'system-minion-info' ? 'minioninfo' : 'demoninfo'
    const systemOrder = firstNightSystemOrder.get(roleId)
    if (systemOrder === undefined) {
      queue.unshift(systemStep)
      continue
    }
    const insertionIndex = queue.findIndex((item) => {
      const itemOrder = firstNightSystemOrder.get(normalizeRoleId(item.roleId))
      return itemOrder !== undefined && itemOrder > systemOrder
    })
    if (insertionIndex === -1) queue.push(systemStep)
    else queue.splice(insertionIndex, 0, systemStep)
  }
  return queue
}

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
  const minions = assignments.filter((assignment) => (
    teamById[assignment.role.id] === 'minion' && assignment.role.id !== 'marionette'
  ))
  const demon = assignments.find((assignment) => teamById[assignment.role.id] === 'demon')
  if (!demon) return []

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
    infoTokens: [...(minions.length ? ['他们是你的爪牙'] : []), '这些角色不在场'],
    checks: minions.length ? [{ id: 'pointed-minions', label: '已依次指认每一名爪牙' }] : [],
    bluffCount: 3,
    bluffChoices: createBluffChoices(session, assignments),
  }

  const steps: WakeItem[] = []
  if (minions.length) {
    steps.push(createSystemStepItem({
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
    }))
  }
  steps.push(createSystemStepItem({
    session,
    playerStates,
    runId,
    anchorSeatId: demon.seatId,
    playerLabel: `恶魔 · ${demonSeat}`,
    roleId: 'system-demon-info',
    roleName: '恶魔信息',
    roleInitial: '魔',
    ability: minions.length
      ? '唤醒恶魔：出示「他们是你的爪牙」并依次指认每一名爪牙；再出示「这些角色不在场」，展示三个不在场的善良角色。'
      : '唤醒恶魔：不指认提线木偶；出示「这些角色不在场」，展示三个不在场的善良角色。',
    storytellerPrompt: '记录本夜给出的三张伪装，后续几夜判断恶魔叙事空间要靠它。',
    step: demonStep,
    outcomeLabel: '已给出恶魔信息',
    resultTemplate: minions.length
      ? `恶魔信息：向${demonSeat}指认爪牙${minionSeats}；展示不在场善良角色{bluffs}。`
      : `恶魔信息：向${demonSeat}展示不在场善良角色{bluffs}。`,
  }))
  return steps
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
  statusSeatId?: number
  playerLabel: string
  roleId: string
  roleName: string
  roleInitial: string
  ability: string
  storytellerPrompt: string
  step: SystemStepSpec
  outcomeLabel: string
  resultTemplate: string
  applicability?: WakeItem['applicability']
  reason?: string
}): WakeItem {
  const playerState = input.playerStates[input.statusSeatId ?? input.anchorSeatId]
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
    applicability: input.applicability ?? 'applicable',
    status: playerState
      ? toWakeStatus(playerState)
      : { life: 'alive', impairments: [], markers: [] },
    reason: input.reason,
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
