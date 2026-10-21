import { getSmartScriptPack, normalizeRoleId, roleSnapshotsForScript } from '../../../domain/scripts'
import { lilMonstaOpeningSelected } from '../../../domain/setup-templates/lilMonstaOpening'
import type { GameSessionState, SetupAssignment } from '../types'
import type { NightOrderEntry, SmartRoleDefinition } from '../../../domain/scripts'
import type { WakeItem } from '../../night-workbench/types'
import { projectConfirmedSetup } from './projectors'

export function hasLilMonstaOpening(session: GameSessionState, assignments: readonly SetupAssignment[]) {
  return !assignments.some(assignment => getSmartScriptPack(session.scriptId).roles.find(role => role.id === assignment.role.id)?.team === 'demon')
    && lilMonstaOpeningSelected(getSmartScriptPack(session.scriptId), projectConfirmedSetup(session)?.draft.setupRuleSelections ?? [])
}

/** The token has no player seat. Recording its holder never replaces that player's role or alignment. */
export function createLilMonstaItems(session: GameSessionState, role: SmartRoleDefinition, order: NightOrderEntry, runId: string, sequence: number): WakeItem[] {
  const snapshot = roleSnapshotsForScript(session.scriptId).find(role => role.id === 'lilmonsta')!
  const base = {
    roleId:'lilmonsta', roleInitial:snapshot.initial, iconPath:snapshot.iconPath, seatId:0,
    playerLabel:'小怪宝 · 爪牙共同处理', ability:role.abilityText,
    status:{ life:'alive' as const, impairments:[], markers:[] }, progress:'pending' as const,
    applicability:'applicable' as const, targetCount:1, aiAdviceEnabled:false,
    storytellerPrompt:'照看者保留原角色与阵营；死爪牙仍参与决定。魔术师、罂粟种植者等相克由说书人核对。记录不会自动修改身份、登记、生死或胜负。',
  }
  return [{
    ...base, id:runId+'-lilmonsta-babysitter', orderIndex:order.order,
    roleName:'小怪宝·照看者', lilMonstaStep:'babysitter', targetLabel:'本夜照看者', targetKind:'player_choice',
    interactionVersion:'lilmonsta/non-seated-babysitter-v1',
    outcomeOptions:[{id:'record',label:'记录本夜照看者',requiredInputs:['targets'],resultTemplate:'{actor}：本夜由{target}照看；其原角色与阵营保持，登记及胜负由说书人确认。'}],
  }, ...(sequence === 1 ? [] : [{
    ...base, id:runId+'-lilmonsta-death', orderIndex:order.order+0.01,
    roleName:'小怪宝·死亡', lilMonstaStep:'death' as const, targetLabel:'死亡候选', targetKind:'storyteller_info' as const,
    interactionVersion:'lilmonsta/non-seated-death-v1',
    outcomeOptions:[
      {id:'record',label:'记录死亡候选',requiredInputs:['targets' as const],resultTemplate:'{actor}：{target}为本夜死亡候选，生死状态另行确认。'},
      {id:'hold',label:'本夜无人死亡',requiredInputs:[],resultTemplate:'{actor}：本夜不造成死亡。'},
    ],
  }])]
}
export function validLilMonstaItem(item: WakeItem, original: WakeItem | undefined) {
  return item.seatId === 0 && normalizeRoleId(item.roleId) === 'lilmonsta' && Boolean(item.lilMonstaStep)
    && original?.seatId === 0 && original.roleId === item.roleId && original.lilMonstaStep === item.lilMonstaStep
    && original.id === item.id && original.interactionVersion === item.interactionVersion
}
