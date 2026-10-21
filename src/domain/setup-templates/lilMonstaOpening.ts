import type { SetupRule, SetupTemplate, SmartScriptPack } from '../scripts/types'
type Delta = NonNullable<SetupTemplate['setupAdjustments']>[number]['compositionDelta']
export function isLilMonstaCountChange(delta: Delta) {
  return delta.minion === 1 && delta.demon === -1 && (delta.townsfolk ?? 0) === 0 && (delta.outsider ?? 0) === 0
}
export function isNonSeatedLilMonstaChoice(ruleId: string, choiceId: string | undefined) {
  return ruleId === 'lilmonsta-extra-minion' && choiceId === 'extra-minion-no-demon'
}
/** Only an explicitly selected source-backed no-seat opening activates this path. */
export function lilMonstaOpeningSelected(
  pack: Pick<SmartScriptPack, 'roles' | 'setupRules' | 'setupTemplates'>,
  selections: readonly { ruleId: string; choiceId: string }[],
) {
  if (!pack.roles.some(role => role.id === 'lilmonsta')) return false
  const rules = pack.setupRules.filter((rule: SetupRule) => rule.roleId === 'lilmonsta' && rule.knowledgeStatus === 'confirmed')
  return selections.some(selection => isNonSeatedLilMonstaChoice(selection.ruleId, selection.choiceId) && rules.some(rule => rule.id === selection.ruleId)
    && pack.setupTemplates.some(template => template.setupAdjustments?.some(adjustment =>
      adjustment.ruleId === selection.ruleId && adjustment.choiceId === selection.choiceId && isLilMonstaCountChange(adjustment.compositionDelta))))
}
