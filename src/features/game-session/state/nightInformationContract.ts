import { normalizeRoleId } from '../../../domain/scripts'
import { nightInteractionInputs } from '../../../domain/scripts/nightInteractionInputs'
import type { OutcomeInput, WakeItem, WakeOutcomeOption } from '../../night-workbench/types'

export function nightInformationRoleId(item: WakeItem) {
  const pretend = /^(?:drunk|marionette)\/pretend-(.+)-v1$/.exec(item.interactionVersion)
  return normalizeRoleId(pretend?.[1] ?? item.roleId)
}

/** 假能力只复用告知表单，真实身份和权威状态始终不变。 */
export function projectFormalNightInformation(item: WakeItem, playerCount = 15): WakeItem {
  const roleId = nightInformationRoleId(item)
  const pretend = roleId !== normalizeRoleId(item.roleId)
  const noAction = item.outcomeOptions.filter((option) => (option.id === 'skip' || option.id === 'hold') && !option.requiredInputs.length)
  if (roleId === 'librarian') return {
    ...item, targetCount: 2,
    interactionVersion: pretend ? item.interactionVersion : 'librarian/information-v1',
    outcomeOptions: [
      { id: 'record', label: '记录结果', requiredInputs: ['targets', 'role'], resultTemplate: '{actor}告知{targets}中有{role}。', informationTemplate: '{targets}中有{role}。' },
      { id: 'no-outsiders', label: '没有外来者', requiredInputs: [], targetCounts: [0], resultTemplate: '{actor}得知：没有外来者。', informationTemplate: '没有外来者。' },
      ...noAction,
    ],
  }
  const spec = nightInteractionInputs[roleId]?.informationInput
  if (!spec) return item
  const requiredInputs: OutcomeInput[] = [
    ...(item.targetCount > 0 ? ['targets' as const] : []),
    ...(item.roleChoices ? ['role' as const] : []),
  ]
  const selection = item.targetCount > 0 ? '选择{targets}，' : ''
  const options: WakeOutcomeOption[] = spec.kind === 'number'
    ? [{ id: 'record', label: '记录正式告知', requiredInputs: [...requiredInputs, 'information'], resultTemplate: `{actor}${selection}正式告知：{information}。`, informationTemplate: '{information}' }]
    : spec.choices.map((choice) => ({ id: choice.id, label: choice.label, requiredInputs, resultTemplate: `{actor}${selection}结果为“${choice.label}”。`, informationTemplate: choice.information }))
  return {
    ...item,
    interactionVersion: pretend ? item.interactionVersion : `${roleId}/formal-information-v1`,
    informationInput: spec.kind === 'number' ? { kind: 'number', minimum: 0, maximum: Math.min(spec.maximum ?? playerCount, playerCount) } : undefined,
    outcomeOptions: [...options, ...noAction],
  }
}
