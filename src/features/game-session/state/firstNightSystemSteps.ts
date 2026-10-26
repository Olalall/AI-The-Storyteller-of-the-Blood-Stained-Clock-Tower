import officialNightSheet from '../../night-workbench/data/official/nightsheet.json' with { type: 'json' }
import { normalizeRoleId, rolePromptForScript, roleSnapshotsForScript, roleTeamByIdForScript } from '../../../domain/scripts'
import type { NightOrderEntry, SmartRoleDefinition } from '../../../domain/scripts'
import type { SystemStepSpec, SystemStepBluffChoice, WakeItem } from '../../night-workbench/types'
import type { GameSessionState, PlayerState, SetupAssignment } from '../types'
import { storytellerSeatLabel } from '../seatPresentation'
import { projectConfirmedSetup } from './projectors'

export function createAudienceNoticeItem(input: {
  session: GameSessionState
  assignments: SetupAssignment[]
  playerStates: Record<number, PlayerState>
  sourceAssignments: SetupAssignment[]
  role: SmartRoleDefinition
  order: NightOrderEntry
  runId: string
}) {
  const delivery = input.order.delivery
  if (!delivery) throw new Error('audience notice requires delivery metadata')
  const excluded = new Set((delivery.audience.excludeRoleIds ?? []).map(normalizeRoleId))
  const recipients = input.assignments.filter((assignment) => (
    roleTeamByIdForScript(input.session.scriptId)[assignment.role.id] === delivery.audience.team
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

  return { ...createSystemStepItem({
    session: input.session,
    playerStates: input.playerStates,
    runId: allocationSystemRunId(input.session, input.runId),
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
  }), orderIndex: input.order.order }
}

/** 《规则概要》二.2：七人及以上的首夜才走爪牙信息与恶魔信息。 */
const systemStepMinPlayers = 7

const active = (state: PlayerState | undefined) => state?.life === 'alive' && !state.drunk && !state.poisoned

const firstNightSystemOrder = new Map(
  officialNightSheet.firstNight.map((roleId, index) => [roleId, index]),
)

export function mergeFirstNightSystemSteps(roleQueue: WakeItem[], systemSteps: WakeItem[]) {
  if (!systemSteps.length) return roleQueue
  const queue = [...roleQueue]
  for (const systemStep of systemSteps) {
    const roleId = systemStep.systemStep?.kind === 'audience_notice'
      ? systemStep.roleId.replace(/^system-audience-/, '')
      : systemStep.roleId === 'system-minion-info' ? 'minioninfo' : 'demoninfo'
    const systemOrder = firstNightSystemOrder.get(roleId)
    if (systemOrder === undefined) {
      queue.unshift(systemStep)
      continue
    }
    const insertionIndex = queue.findIndex((item) => {
      const itemRoleId = item.systemStep?.kind === 'audience_notice' ? item.roleId.replace(/^system-audience-/, '')
        : item.roleId === 'system-minion-info' ? 'minioninfo' : item.roleId === 'system-demon-info' ? 'demoninfo' : item.roleId
      const itemOrder = firstNightSystemOrder.get(normalizeRoleId(itemRoleId))
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
export function createFirstNightSystemSteps(
  session: GameSessionState,
  assignments: SetupAssignment[],
  playerStates: Record<number, PlayerState>,
  runId: string,
  recognitionOnly = false,
): WakeItem[] {
  const allocationSource = session.timeline.filter((entry) => entry.kind === 'setup_changed' && entry.originNightRunId === runId && entry.sourceNightActionId).at(-1)
  // 卡扎力先分配身份，再发送新名单；更正分配后用新步骤保留原确认记录。
  if (assignments.some((assignment) => normalizeRoleId(assignment.role.id) === 'kazali') && !allocationSource) return []
  const systemRunId = allocationSystemRunId(session, runId)
  if (session.playerCount < systemStepMinPlayers) return []
  if (assignments.some((assignment) => normalizeRoleId(assignment.role.id) === 'tor')) return []
  const hidden = assignments.some((assignment) => normalizeRoleId(assignment.role.id) === 'poppygrower' && active(playerStates[assignment.seatId]))

  const teamById = roleTeamByIdForScript(session.scriptId)
  const minions = assignments.filter((assignment) => (
    teamById[assignment.role.id] === 'minion' && normalizeRoleId(assignment.role.id) !== 'marionette'
  ))
  const demon = assignments.find((assignment) => teamById[assignment.role.id] === 'demon')
  if (!demon) return []
  const legion = assignments.filter(assignment => normalizeRoleId(assignment.role.id) === 'legion')
  const collectiveLegion = normalizeRoleId(demon.role.id) === 'legion' && legion.length > 1

  const minionSeats = minions.map((assignment) => `${assignment.seatId}号`).join('、')
  const demonSeat = collectiveLegion ? legion.map(assignment => `${assignment.seatId}号`).join('、') : `${demon.seatId}号`
  const minionLabels = minions.map((assignment) => seatLabel(session, assignment.seatId))
  const demonLabel = collectiveLegion ? `全体军团 · ${demonSeat}` : seatLabel(session, demon.seatId)
  const magicians = assignments.filter((assignment) => normalizeRoleId(assignment.role.id) === 'magician' && active(playerStates[assignment.seatId]))
  const pointed = (seats: SetupAssignment[]) => [...seats, ...magicians].sort((a, b) => a.seatId - b.seatId).map((a) => seatLabel(session, a.seatId))
  const lunatics = assignments.filter(a => normalizeRoleId(a.role.id) === 'lunatic')
  const hostNote = [hidden ? '罂粟种植者有效：不相认；恶魔仍获得三张不在场善良角色伪装。'
    : magicians.length ? '魔术师只混入指认名单，不唤醒魔术师。自由调整指认次序，不透露哪名候选是真的。特殊恶魔/提线木偶互动请另行核对。' : undefined
    , ...(lunatics.length ? [`仅真恶魔得知疯子：${lunatics.map(a => `${a.seatId}号`).join('、')}；先展示「你是」及真恶魔角色，再展示疯子身份。不能告诉疯子真实身份。`] : [])].filter(Boolean).join(' ') || undefined

  const minionStep: SystemStepSpec = {
    kind: 'minion_info',
    minionLabels,
    demonLabel,
    ...(magicians.length ? { pointedDemonLabels: pointed([demon]), hostNote } : {}),
    infoTokens: ['他是恶魔'],
    checks: [{ id: 'pointed-demon', label: '已逐个指认恶魔（每名爪牙都看清了）' }],
  }
  const demonStep: SystemStepSpec = {
    kind: 'demon_info',
    minionLabels: hidden ? [] : minionLabels,
    demonLabel,
    ...(!hidden && magicians.length ? { pointedMinionLabels: pointed(minions) } : {}),
    hostNote,
    infoTokens: [...(!hidden && minions.length ? ['他们是你的爪牙'] : []), '这些角色不在场'],
    checks: hidden ? [] : collectiveLegion ? [{ id:'legion-recognized',label:'已共同唤醒全体军团并完成互认' }] : minions.length ? [{ id: 'pointed-minions', label: magicians.length ? '已依次指认每一名候选（含有效魔术师）' : '已依次指认每一名爪牙' }] : [],
    bluffCount: 3,
    bluffChoices: createBluffChoices(session, assignments),
  }

  const steps: WakeItem[] = []
  if (recognitionOnly) {
    demonStep.bluffCount = undefined
    demonStep.bluffChoices = undefined
    demonStep.infoTokens = minions.length ? ['他们是你的爪牙'] : []
    demonStep.hostNote = '罂粟死亡后的相认：仅补告知名单，不重复发伪装。' + (magicians.length ? '仍须混入有效魔术师；不要唤醒魔术师。' : '')
  }
  if (lunatics.length && !recognitionOnly) demonStep.checks.push({ id: 'real-demon-knows-lunatic', label: '已向真恶魔确认其真实恶魔身份，并指出疯子' })
  if (minions.length && !hidden) {
    steps.push(createSystemStepItem({
      session,
      playerStates,
      runId: systemRunId,
      anchorSeatId: minions[0].seatId,
      playerLabel: `全体爪牙 · ${minionSeats}`,
      roleId: 'system-minion-info',
      roleName: '爪牙信息',
      roleInitial: '爪',
      ability: '同时唤醒实际爪牙，让他们互相看见；出示「他是恶魔」，指认名单中的恶魔候选（有魔术师时包含魔术师），再让爪牙闭眼。',
      storytellerPrompt: '只记录本步骤已完成，不改任何座位状态。',
      step: minionStep,
      outcomeLabel: '已给出爪牙信息',
      resultTemplate: `爪牙信息：向${minionSeats}出示「他是恶魔」，指认${pointed([demon]).join('、')}。`,
    }))
  }
  steps.push(createSystemStepItem({
    session,
    playerStates,
    runId: systemRunId,
    anchorSeatId: demon.seatId,
    playerLabel: collectiveLegion ? demonLabel : `恶魔 · ${demonSeat}`,
    roleId: 'system-demon-info',
    roleName: '恶魔信息',
    roleInitial: '魔',
    ability: recognitionOnly ? '逐个唤醒恶魔，告知当前爪牙候选（包含有效魔术师）；不再发放伪装。特殊恶魔和提线木偶互动须单独核对。' : hidden ? hostNote! : collectiveLegion ? '共同唤醒全体军团并完成互认。本模板采用三枚不在场善良角色伪装；不将一名军团当作唯一恶魔。' : minions.length
      ? '唤醒实际恶魔：出示「他们是你的爪牙」并指认候选名单（有魔术师时包含魔术师）；再展示三个不在场的善良角色。'
      : '唤醒恶魔：不指认提线木偶；出示「这些角色不在场」，展示三个不在场的善良角色。',
    storytellerPrompt: '记录本夜给出的三张伪装，后续几夜判断恶魔叙事空间要靠它。',
    step: demonStep,
    outcomeLabel: '已给出恶魔信息',
    resultTemplate: recognitionOnly ? `罂粟死亡后：向${demonSeat}指认当前爪牙候选${pointed(minions).join('、') || '无'}；未重复发放伪装。` : !hidden && minions.length
      ? `恶魔信息：向${demonSeat}指认爪牙候选${pointed(minions).join('、')}；展示不在场善良角色{bluffs}。`
      : `恶魔信息：向${demonSeat}展示不在场善良角色{bluffs}。`,
  }))
  return steps
}

/** 剧本里的善良角色减去在场角色；配板时预设过的三张只做「预设」提示，不做校验。 */
export function createBluffChoices(session: GameSessionState, assignments: SetupAssignment[]): SystemStepBluffChoice[] {
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


/** 新名单有自己的步骤实例；原确认、旧草稿及其引用保持可追溯。 */
function allocationSystemRunId(session: GameSessionState, runId: string) {
  const source = session.timeline.filter((entry) => entry.kind === 'setup_changed' && entry.originNightRunId === runId && entry.sourceNightActionId).at(-1)
  return source?.kind === 'setup_changed' ? `${runId}-allocation-${source.sourceNightActionId}` : runId
}

export function createSystemStepItem(input: {
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


function toWakeStatus(state: PlayerState): WakeItem['status'] {
  return { life: state.life, impairments: [...(state.poisoned ? ['poisoned' as const] : []), ...(state.drunk ? ['drunk' as const] : [])], markers: state.markers.map((marker) => ({ ...marker })) }
}
