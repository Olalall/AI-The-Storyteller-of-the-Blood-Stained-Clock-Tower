import { getSmartScriptPack, normalizeRoleId, roleSnapshotsForScript } from '../../../domain/scripts'
import type { GameSessionState, PlayerState, SetupAssignment } from '../types'
import type { WakeItem } from '../../night-workbench/types'
import { playerFacingIdentity } from '../../identity-deal/identityProjection'
import { openingChoiceForSeat } from './openingPreparation'
import { createSystemStepItem } from './firstNightSystemSteps'
import { createNightWakeInteraction } from './nightWakeInteraction'
import { projectNightInteraction } from '../../night-workbench/state/projectNightInteraction'

export function createLunaticNightItems(session: GameSessionState, assignment: SetupAssignment, states: Record<number, PlayerState>, runId: string, first: boolean, order: number): WakeItem[] {
  const shown = playerFacingIdentity(session, assignment.seatId).role
  const choice = openingChoiceForSeat(session, assignment.seatId)
  const pack = getSmartScriptPack(session.scriptId), state = states[assignment.seatId]
  if (!state) return []
  const role = shown && pack.roles.find(r => normalizeRoleId(r.id) === normalizeRoleId(shown.id))
  const missing = !shown || !role || first && (!choice?.minionSeatIds || choice.bluffRoleIds?.length !== 3)
  const info = createSystemStepItem({ session, playerStates: states, runId, anchorSeatId: assignment.seatId,
    roleId: 'lunatic', roleName: `疯子（假装${shown?.name ?? '身份待补齐'}）`, roleInitial: assignment.role.initial,
    playerLabel: `${assignment.seatId}号 · 只向本人展示假恶魔信息`,
    ability: '先假装唤醒疯子；假信息和选择不产生真实死亡。真恶魔在自己行动前获知疯子及其选择。',
    storytellerPrompt: missing ? '开局准备不完整。请从身份交接补对外恶魔，并核对假的爪牙与伪装；旧局不能自动猜填。' : '只给本人的假信息，不展示真实身份、真实爪牙或说书人备注。',
    step: { kind: 'audience_notice', audienceLabel: '疯子本人', recipientLabels: [`${assignment.seatId}号`], minionLabels: [], demonLabel: '',
      infoTokens: [`你是${shown?.name ?? '待定恶魔'}`, `假爪牙：${choice?.minionSeatIds?.map(s => `${s}号`).join('、') ?? '待核对'}`,
        `假伪装：${choice?.bluffRoleIds?.map(id => roleSnapshotsForScript(session.scriptId).find(r => r.id === id)?.name ?? id).join('、') ?? '待核对'}`],
      checks: [{ id: 'lunatic-fake-info-given', label: '已向疯子告知假恶魔、假爪牙及三张假伪装' }], sensitive: true },
    applicability: missing || state.life === 'dead' ? 'needs_review' : 'applicable',
    reason: missing ? '请先补齐秘密开局信息；可手动记录后核对，不能使用空名单当作已告知。' : undefined,
    outcomeLabel: '已完成假信息告知', resultTemplate: '{actor}已获知说书人确认的假恶魔、假爪牙及三张假伪装；没有真实技能效果。',
  })
  info.orderIndex = order
  if (missing) return [{ ...info, ...(first ? {} : { systemStep: undefined }), outcomeOptions: [] }]
  const orders = first ? pack.nightOrders.firstNight : pack.nightOrders.otherNight
  const demonOrder = orders.find(o => normalizeRoleId(o.roleId) === normalizeRoleId(shown.id))
  if (!demonOrder) return first ? [info] : []
  const interaction = projectNightInteraction({ ...createNightWakeInteraction(session.scriptId, role, first, session.playerCount),
    ...info, systemStep: undefined, ...createNightWakeInteraction(session.scriptId, role, first, session.playerCount), roleId: role.id,
  }, session.scriptId, { nightType: first ? 'first' : 'other', playerCount: session.playerCount })
  if (first && !interaction.targetCount && interaction.outcomeOptions.every(o => !o.requiredInputs.length)) return [info]
  const fake: WakeItem = { ...interaction, id: `${runId}-lunatic-choice-${assignment.seatId}`, roleId: 'lunatic',
    orderIndex: order + 0.01, roleName: info.roleName, roleInitial: assignment.role.initial, iconPath: assignment.role.iconPath,
    systemStep: undefined, interactionVersion: `lunatic/pretend-${shown.id}-v1`, aiAdviceEnabled: false,
    storytellerPrompt: `按${shown.name}的目标数和条件假装行动。选择仅记录，随后告知真恶魔；不更新任何玩家的生死。`,
    ability: info.ability, outcomeOptions: interaction.outcomeOptions.map(o => ({ ...o, resultTemplate: `疯子假装${shown.name}：${o.resultTemplate}【只记录假选择，无真实效果】` })),
  }
  return first ? [info, fake] : [fake]
}
