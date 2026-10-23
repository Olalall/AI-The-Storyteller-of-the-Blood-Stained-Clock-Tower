import type { SetupTemplate, SmartScriptPack } from '../../domain/scripts'
import { inferModifierRoleId, isMandatorySetupCountRole } from '../../domain/setup-templates/setupCountChanges'

export const setupCombinationKey = (roles: readonly string[]) => [...roles].sort().join(',')

export function* setupCandidateVariants(pack: SmartScriptPack, templates: readonly SetupTemplate[]) {
  const teamById = new Map(pack.roles.map(role => [role.id, role.team]))
  const modifiers = new Set(pack.setupTemplates.flatMap(template => (template.setupAdjustments ?? [])
    .map(adjustment => inferModifierRoleId(adjustment.ruleId, pack))))
  for (const role of pack.roles) {
    const brackets = role.abilityText.match(/\[[^\]]+\]/g) ?? []
    const setupFacts = [...(role.research?.setupImpact ?? []), ...brackets].join(' ')
    if (!setupFacts) continue
    modifiers.add(role.id)
    for (const required of pack.roles) {
      if (setupFacts.includes(required.name) || required.officialName && setupFacts.includes(required.officialName)) modifiers.add(required.id)
    }
  }
  const canChange = (role: string) => !modifiers.has(role) && !isMandatorySetupCountRole(role)
    && ['townsfolk', 'outsider'].includes(teamById.get(role) ?? '')
  const rolePool = new Set(templates.flatMap(template => template.roles))
  // Keep evil roles and opening modifiers anchored; larger changes need separately verified templates.
  for (const template of templates) {
    for (const out of template.roles.filter(canChange)) {
      for (const into of rolePool) {
        if (!canChange(into) || template.roles.includes(into) || teamById.get(out) !== teamById.get(into)) continue
        yield {
          ...template,
          templateId: `${template.templateId}-swap-${out}-${into}`,
          roles: template.roles.map(role => role === out ? into : role),
          verified: false,
        }
      }
    }
  }
}
