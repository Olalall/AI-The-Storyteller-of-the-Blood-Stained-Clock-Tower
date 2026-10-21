import { roleAbilityForScript, roleSnapshotsForScript } from '../../../domain/scripts'
import type { AbilityInputKind, SmartRoleDefinition } from '../../../domain/scripts'
import { nightInteractionInputs, nightTargetCountForRole } from '../../../domain/scripts/nightInteractionInputs'
import { sampleOtherNightQueue } from '../../night-workbench/data/catfishing'
import type { OutcomeInput, WakeItem, WakeRoleChoice } from '../../night-workbench/types'
import { createRoleSpecificOutcomeOptions, targetContractFor } from './nightWakeContract'

/** 新夜序和历史更正后的恢复共用录入合同；不产生局面变化。 */
export function createNightWakeInteraction(scriptId: string, role: SmartRoleDefinition, isFirstNight: boolean, playerCount: number):
  Pick<WakeItem, 'targetCount' | 'minimumTargetCount' | 'targetLabel' | 'targetKind' | 'roleChoices' | 'roleLabel' | 'interactionVersion' | 'outcomeOptions'> & { storytellerPrompt?: string } {
  const template = scriptId === 'catfishing' ? sampleOtherNightQueue.find((item) => item.roleId === role.id) : undefined
  const firstNightRoleCount = isFirstNight ? nightInteractionInputs[role.id]?.firstNightRoleCount : undefined
  const roleChoices = firstNightRoleCount === 0 ? undefined
    : template?.roleChoices ? structuredClone(template.roleChoices) : createRoleChoices(scriptId, role.inputKinds)
  const contract = targetContractFor(role, playerCount, roleAbilityForScript(scriptId, role.id))
  const explicit = nightInteractionInputs[role.id]
  const targetCount = template?.targetCount ?? (explicit ? nightTargetCountForRole(role, isFirstNight) : contract.targetCount)
  const genericOptions = createGenericOutcomeOptions(targetCount, Boolean(roleChoices))
  const specificOptions = createRoleSpecificOutcomeOptions(role.id, contract, Boolean(roleChoices))
  const outcomes = specificOptions ? [...specificOptions, ...genericOptions.filter((option) => !specificOptions.some((known) => known.id === option.id) && (option.id === 'skip' || !specificOptions.some((known) => known.targetCounts?.length)))] : genericOptions
  return {
    targetCount,
    minimumTargetCount: explicit ? undefined : contract.minimumTargetCount,
    targetLabel: template?.targetLabel ?? contract.targetLabel ?? (targetCount > 1 ? '玩家' : targetCount === 1 ? '目标' : undefined),
    targetKind: template?.targetKind ?? (targetCount > 0 ? 'player_choice' : undefined),
    roleChoices,
    roleLabel: roleChoices ? template?.roleLabel ?? '角色' : undefined,
    interactionVersion: template?.interactionVersion ?? `${scriptId}/generic-night-v1`,
    outcomeOptions: template ? structuredClone(template.outcomeOptions) : outcomes,
    storytellerPrompt: template?.storytellerPrompt,
  }
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
  const resultTemplate = targetCount > 0 && needsRole
    ? '{actor}记录：{targets} · {role}。'
    : targetCount > 0
      ? '{actor}记录：{targets}。'
      : needsRole ? '{actor}记录：{role}。' : '{actor}本夜已记录。'
  return [
    { id: 'record', label: requiredInputs.length ? '记录结果' : '已记录', requiredInputs, resultTemplate },
    { id: 'skip', label: '不发动', requiredInputs: [], resultTemplate: '{actor}本夜不发动。' },
  ]
}
