import { normalizeRoleId } from './roleId'
import type { SetupTemplate, SmartScriptPack } from './types'
import { inferModifierRoleId, isMandatorySetupCountRole, isValidSetupCountChangeForRole } from '../setup-templates/setupCountChanges'
import { isLilMonstaCountChange, isNonSeatedLilMonstaChoice } from '../setup-templates/lilMonstaOpening'

/** Shared structural guard. It does not infer character abilities or game outcomes. */
export function templateRoleSelectionValid(pack: Pick<SmartScriptPack, 'roles' | 'setupRules'>, template: SetupTemplate) {
  const byId = new Map(pack.roles.map((role) => [normalizeRoleId(role.id), role]))
  const repeatable = new Set((template.repeatableRoles ?? []).map(normalizeRoleId))
  const roles = template.roles.map(normalizeRoleId), bluffs = template.bluffs.map(normalizeRoleId)
  const seen = new Set<string>()
  for (const id of roles) {
    const role = byId.get(id)
    if (!role || !['townsfolk', 'outsider', 'minion', 'demon'].includes(role.team)
      || seen.has(id) && !repeatable.has(id)) return false
    seen.add(id)
  }
  if (!roles.filter(isMandatorySetupCountRole).every((roleId) => template.setupAdjustments?.some((adjustment) =>
    typeof adjustment.choiceId === 'string' && Boolean(adjustment.choiceId.trim())
    && pack.setupRules?.some((rule) => rule.id === adjustment.ruleId)
    && normalizeRoleId(inferModifierRoleId(adjustment.ruleId, pack) ?? '') === roleId
    && isValidSetupCountChangeForRole(roleId, adjustment.compositionDelta)))) return false
  const lilMonsta = template.setupAdjustments?.some(adjustment =>
    pack.setupRules.some(rule => rule.id === adjustment.ruleId && rule.roleId === 'lilmonsta' && rule.knowledgeStatus === 'confirmed')
    && isNonSeatedLilMonstaChoice(adjustment.ruleId, adjustment.choiceId) && isLilMonstaCountChange(adjustment.compositionDelta))
  const bluffCount = lilMonsta ? 0 : 3
  return bluffs.length === bluffCount && new Set(bluffs).size === bluffCount && bluffs.every((id) => {
    const role = byId.get(id)
    return role && (role.team === 'townsfolk' || role.team === 'outsider') && !seen.has(id)
  }) && [...repeatable].every((id) => byId.has(id))
}
