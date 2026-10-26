import { getSmartScriptPack, normalizeRoleId, roleAbilityForScript, rolePromptForScript } from '../../../domain/scripts'
import type { NightOrderEntry, SmartRoleDefinition } from '../../../domain/scripts'
import type { PlayerStatusSnapshot, WakeItem } from '../../night-workbench/types'
import type { GameSessionState, PlayerState, SetupAssignment } from '../types'
import { projectCurrentAssignments } from './projectors'
import { storytellerSeatLabel } from '../seatPresentation'
import { nextPhaseSequence } from './phaseSegments'
import { projectNightInteraction } from '../../night-workbench/state/projectNightInteraction'
import { createNightWakeInteraction } from './nightWakeInteraction'
import { applyWakeHistoricalContext } from './nightHistoricalContext'
import { createAudienceNoticeItem } from './firstNightSystemSteps'
import { playerFacingIdentity } from '../../identity-deal/identityProjection'
import { createLilMonstaItems, hasLilMonstaOpening } from './lilMonstaNight'
import { createSnitchNightItems } from './snitchNight'
import { createLunaticNightItems } from './lunaticNight'
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
    if (normalizeRoleId(role.id) === 'lunatic') return roleAssignments.flatMap(a => createLunaticNightItems(session, a, playerStates, runId, sequence === 1, order.order))
    if (role.id === 'snitch') return roleAssignments.flatMap(source => createSnitchNightItems(session, source, playerStates, runId, order.order))
    if (role.id === 'lilmonsta' && assignments.length === session.playerCount && !roleAssignments.length && hasLilMonstaOpening(session, assignments)) {
      return createLilMonstaItems(session, role, order, runId, sequence)
    }
    if (role.id === 'legion' && roleAssignments.length) {
      const assignment = roleAssignments.find(actor => playerStates[actor.seatId]?.life === 'alive') ?? roleAssignments[0]
      const state = playerStates[assignment.seatId]
      if (!state) return []
      return [{ ...createSmartWakeItem({ session, assignment, playerState:state, role, order, runId, isFirstNight:sequence === 1 }),
        playerLabel:'全体军团 · 说书人处理', targetCount:1, targetKind:'storyteller_info' as const, targetLabel:'死亡候选',
        interactionVersion:'legion/collective-night-v1',
        storytellerPrompt:'整组军团只处理一次可能死亡；由说书人选择，通常优先考虑军团，不逐名军团发动或分别杀人。状态与胜负另行确认。',
        outcomeOptions:[
          {id:'record',label:'记录死亡候选',requiredInputs:['targets' as const],resultTemplate:'军团：{target}为本夜死亡候选，由说书人另行确认生死。'},
          {id:'hold',label:'本夜无人死亡',requiredInputs:[],resultTemplate:'军团：本夜不造成死亡。'},
        ],
      }]
    }
    if (order.delivery?.kind === 'audience_notice') {
      return roleAssignments.length ? [createAudienceNoticeItem({ session, assignments: projectCurrentAssignments(session), playerStates, sourceAssignments: roleAssignments, role, order, runId })] : []
    }
    return roleAssignments.flatMap((assignment) => {
      const playerState = playerStates[assignment.seatId]
      return playerState ? [createSmartWakeItem({ session, assignment, playerState, role, order, runId, isFirstNight: sequence === 1 })] : []
    })
  })
  for (const assignment of assignments.filter((entry) => ['marionette', 'drunk'].includes(normalizeRoleId(entry.role.id)))) {
    const shown = playerFacingIdentity(session, assignment.seatId).role
    const role = shown && roleById.get(normalizeRoleId(shown.id))
    const order = role && orders.find((entry) => normalizeRoleId(entry.roleId) === normalizeRoleId(role.id))
    const playerState = playerStates[assignment.seatId]
    if (!role || !shown || !order || !playerState) continue
    if (normalizeRoleId(assignment.role.id) === 'drunk') {
      const prompt = `按对外身份“${shown.name}”的时点假装唤醒和反馈。酒鬼实际为外来者，不拥有该镇民能力；本项选择与告知仅记录假装流程，无真实效果，不向玩家展示酒鬼身份。`
      queue.push({
        ...createSmartWakeItem({ session, assignment: { ...assignment, role: shown }, playerState, role, order, runId, isFirstNight: sequence === 1 }),
        id: `${runId}-drunk-pretend-${shown.id}-${assignment.seatId}`,
        roleId: 'drunk', roleName: `酒鬼（假装${shown.name}）`, roleInitial: assignment.role.initial, iconPath: assignment.role.iconPath,
        ability: prompt, storytellerPrompt: prompt, reason: prompt,
        interactionVersion: `drunk/pretend-${shown.id}-v1`,
        aiAdviceEnabled: false,
      })
      continue
    }
    const prompt = `按对外身份“${shown.name}”的时点假装唤醒和反馈。原善良能力不生效，不执行其毒醉、死亡或身份效果，也不展示提线木偶身份。`
    queue.push({
      ...createSmartWakeItem({ session, assignment: { ...assignment, role: shown }, playerState, role, order, runId, isFirstNight: sequence === 1 }),
      id: `${runId}-marionette-pretend-${shown.id}-${assignment.seatId}`,
      roleId: 'marionette', roleName: `提线木偶（假装${shown.name}）`, roleInitial: assignment.role.initial, iconPath: assignment.role.iconPath,
      ability: prompt, storytellerPrompt: prompt, reason: prompt,
      targetCount: 0, targetRoleChoiceCount: undefined, allowedTargetCounts: undefined, targetKind: undefined,
      targetLabel: undefined, roleCount: undefined, roleChoices: undefined, roleLabel: undefined,
      informationInput: undefined,
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
  const interaction = createNightWakeInteraction(session.scriptId, role, isFirstNight, session.playerCount)
  const dead = playerState.life === 'dead'
  return applyWakeHistoricalContext(session, projectNightInteraction({
    ...interaction,
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
    storytellerPrompt: interaction.storytellerPrompt ?? order.note ?? rolePromptForScript(session.scriptId, role.id),
    progress: 'pending',
    applicability: dead ? 'needs_review' : 'applicable',
    status: toWakeStatus(playerState),
    reason: dead ? '玩家已死亡；请说书人核对是否需要唤醒。' : undefined,
  }, session.scriptId, { nightType: isFirstNight ? 'first' : 'other', playerCount: session.playerCount, inPlayRoleIds: projectCurrentAssignments(session).map(a => a.role.id) }), isFirstNight ? 1 : nextPhaseSequence(session, 'night'))
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
