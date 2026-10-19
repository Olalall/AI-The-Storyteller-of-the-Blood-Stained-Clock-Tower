import { normalizeRoleId, roleSnapshotsForScript, roleTeamByIdForScript } from '../../../domain/scripts'
import { nightInteractionInputs } from '../../../domain/scripts/nightInteractionInputs'
import type { NightType, WakeItem } from '../types'

/** 只修正表单元数据；不重排旧夜序，也不重算已确认记录。 */
export function projectNightInteraction(item: WakeItem, scriptId: string, night?: { nightType: NightType; playerCount: number }): WakeItem {
  const roleId = normalizeRoleId(item.roleId)
  if (item.abilityPhase === 'initial' && night) night = { ...night, nightType: 'first' }
  if (roleId === 'marionette' && night?.nightType === 'first' && item.interactionVersion !== 'marionette/pretend-v1') return {
    ...item, targetCount: 0, roleCount: undefined, roleChoices: undefined, targetKind: undefined,
    ability: '说书人核对木偶邻座与身份隐瞒，仅向恶魔确认木偶位置；不在普通爪牙互认时唤醒木偶，仍需按其对外善良身份的时点假装行动。',
    reason: item.reason ?? '主持核对项，不是真实技能发动或向木偶告知邪恶身份。',
    interactionVersion: 'marionette/setup-v1',
    outcomeOptions: [{ id: 'record', label: '已核对木偶身份隐瞒', requiredInputs: [], resultTemplate: '{actor}的邻座与身份隐瞒已核对，仅向恶魔确认位置，未唤醒木偶；对外身份按相应时点假装行动，不执行善良技能效果。' }],
  }
  if (roleId === 'kazali' && night) {
    const count = night.nightType === 'first' ? Math.floor((night.playerCount - 7) / 3) + 1 : undefined
    const teams = roleTeamByIdForScript(scriptId)
    return {
      ...item,
      targetCount: count ?? 1,
      targetRoleChoiceCount: count,
      allowedTargetCounts: undefined,
      targetKind: 'player_choice',
      targetLabel: count ? '爪牙分配' : '攻击目标',
      roleCount: undefined,
      roleChoices: count ? roleSnapshotsForScript(scriptId).filter((role) => teams[role.id] === 'minion').map((role) => ({ id: role.id, label: role.name })) : undefined,
      roleLabel: count ? '爪牙' : undefined,
      interactionVersion: count ? 'kazali/first-night-pairs-v1' : 'kazali/other-night-target-v1',
      outcomeOptions: [{
        id: 'record', label: '记录结果', requiredInputs: count ? ['targets', 'role'] : ['targets'],
        resultTemplate: count ? '{actor}首夜指定：{targetRoles}。身份与阵营变化另行确认。' : '{actor}攻击{target}，死亡结果由说书人另行确认。',
      }],
    }
  }
  const spec = nightInteractionInputs[roleId]
  if (!spec) return item
  const roleCount = spec.roleCount ?? item.roleCount
  let roleChoices = item.roleChoices
  if (roleCount === 2 || roleCount === 4) {
    const teams = roleTeamByIdForScript(scriptId)
    const choices = roleChoices ?? roleSnapshotsForScript(scriptId).map((role) => ({ id: role.id, label: role.name }))
    roleChoices = choices.map((choice) => ({
      ...choice,
      alignment: teams[choice.id] === 'townsfolk' || teams[choice.id] === 'outsider'
        ? 'good' as const
        : teams[choice.id] === 'minion' || teams[choice.id] === 'demon' ? 'evil' as const : undefined,
    }))
  }
  let outcomeOptions = roleCount === 2 || roleCount === 4 ? item.outcomeOptions.map((option) => {
    if ((option.id === 'skip' || option.id === 'hold') && option.requiredInputs.length === 0) return option
    return {
      ...option,
      resultTemplate: option.resultTemplate.includes('{role}') ? option.resultTemplate : `${option.resultTemplate} 信息角色：{role}。`,
      informationTemplate: '{role}',
    }
  }) : item.outcomeOptions
  // 补齐旧导入缺失的表单要求；已确认记录仍读取原snapshot，不重新渲染。
  if (spec.targetCount && !item.targetCount) outcomeOptions = outcomeOptions.map((option) =>
    (option.id === 'skip' || option.id === 'hold') && !option.requiredInputs.length ? option : {
      ...option, requiredInputs: [...new Set([...option.requiredInputs, 'targets' as const])],
      resultTemplate: option.resultTemplate.includes('{targets}') ? option.resultTemplate : `${option.resultTemplate} 目标：{targets}。`,
    })
  if (spec.choiceResults) outcomeOptions = spec.choiceResults.map((choice) => ({ ...choice, requiredInputs: [], resultTemplate: `{actor}：${choice.label}。` }))
  return { ...item, aiAdviceEnabled: spec.aiAdviceEnabled ?? (spec.choiceResults ? false : item.aiAdviceEnabled), targetCount: spec.targetCount ?? item.targetCount, allowedTargetCounts: spec.allowedTargetCounts?.slice() ?? item.allowedTargetCounts, targetKind: spec.targetKind ?? item.targetKind, roleCount, roleChoices, outcomeOptions }
}
