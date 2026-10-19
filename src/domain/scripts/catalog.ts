import type { AIRoleResearchBrief, RoleId, RoleTeam, ScriptId, SmartRoleDefinition, SmartScriptPack } from './types'
import { resolveCharacterIconPath } from './roleIconPaths'
import { localizedRoleAbility, localizedRolePrompt } from './role-copy'
import { getSmartScriptPack } from './loadedCatalog'
export { getSmartScriptPack, smartScriptPacks, smartScriptRegistry, loadSmartScriptPack, loadAllSmartScriptPacks } from './loadedCatalog'
export { scriptManifest } from './scriptManifest.generated'
import { scriptManifest } from './scriptManifest.generated'
export function scriptDisplayName(scriptId: ScriptId) {
  return scriptManifest.find((entry) => entry.scriptId === scriptId)?.displayName ?? scriptManifest[0].displayName
}

const setupTeams = new Set<RoleTeam>(['townsfolk', 'outsider', 'minion', 'demon'])
const roleIdAliases: Readonly<Record<RoleId, RoleId>> = {
  snake_charmer: 'snakecharmer',
  pit_hag: 'pithag',
  poppy_grower: 'poppygrower',
  fang_gu: 'fanggu',
  scarlet_woman: 'scarletwoman',
  tea_lady: 'tealady',
  fortune_teller: 'fortuneteller',
  undertaker: 'undertaker',
  devils_advocate: 'devilsadvocate',
  devil_s_advocate: 'devilsadvocate',
  bounty_hunter: 'bountyhunter',
  town_crier: 'towncrier',
  evil_twin: 'eviltwin',
  'pit-hag': 'pithag',
  lil_monsta: 'lilmonsta',
  bone_collector: 'bonecollector',
  no_dashii: 'nodashii',
  al_hadikhia: 'alhadikhia',
  spirit_of_ivory: 'spiritofivory',
  high_priestess: 'highpriestess',
}

export function scriptKnowledgeVersion(pack: SmartScriptPack) {
  return `${pack.scriptId}/${pack.source.version ?? pack.source.contentHash}`
}

export function isSetupRole(role: SmartRoleDefinition) {
  return setupTeams.has(role.team)
}

export function setupRolesForScript(scriptId: ScriptId) {
  return getSmartScriptPack(scriptId).roles.filter(isSetupRole)
}

export function roleSnapshotsForScript(scriptId: ScriptId) {
  return setupRolesForScript(scriptId).map((role) => ({
    id: role.id,
    name: role.name,
    initial: role.name.slice(0, 1),
    iconPath: resolveCharacterIconPath(role),
  }))
}

export function roleTeamByIdForScript(scriptId: ScriptId) {
  return Object.fromEntries(setupRolesForScript(scriptId).map((role) => [role.id, role.team]))
}

export function roleAbilityForScript(scriptId: ScriptId, roleId: string) {
  const role = findRoleForScript(scriptId, roleId)
  return role ? localizedRoleAbility(role) : '角色能力待接入知识库。'
}

export function rolePromptForScript(scriptId: ScriptId, roleId: string) {
  const role = findRoleForScript(scriptId, roleId)
  return role ? localizedRolePrompt(role) : '记录选择与告知信息；不自动结算。'
}

export function roleResearchForAI(scriptId: ScriptId, roleId: RoleId): AIRoleResearchBrief | undefined {
  const role = findRoleForScript(scriptId, roleId)
  if (!role?.research) return undefined

  return {
    roleId: role.id,
    name: role.name,
    officialName: role.officialName,
    knowledgeStatus: role.knowledgeStatus,
    inputKinds: role.inputKinds.slice(0, 4),
    setupImpact: role.research.setupImpact.slice(0, 3),
    possibleOutcomes: role.research.possibleOutcomes.slice(0, 5),
    stateChanges: role.research.stateChanges.slice(0, 4),
    identityChanges: role.research.identityChanges.slice(0, 4),
    teamChanges: role.research.teamChanges.slice(0, 4),
    playerMessageTemplates: role.research.playerMessageTemplates.slice(0, 4),
    highRiskNotes: role.research.highRiskNotes.slice(0, 5),
    sourceUrls: role.research.sourceUrls.slice(0, 4),
    reviewedAt: role.research.reviewedAt,
  }
}

function findRoleForScript(scriptId: ScriptId, roleId: RoleId) {
  const canonicalRoleId = roleIdAliases[roleId] ?? roleId
  return getSmartScriptPack(scriptId).roles.find((candidate) => (
    candidate.id === roleId || candidate.id === canonicalRoleId
  ))
}
