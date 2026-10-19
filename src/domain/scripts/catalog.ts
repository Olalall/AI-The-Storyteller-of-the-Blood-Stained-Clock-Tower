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
import { normalizeRoleId } from './roleId'
export { normalizeRoleId } from './roleId'

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
  return Object.fromEntries(setupRolesForScript(scriptId).flatMap((role) => [[role.id, role.team], [normalizeRoleId(role.id), role.team]]))
}

export function roleAbilityForScript(scriptId: ScriptId, roleId: string) {
  const role = findRoleForScript(scriptId, roleId)
  return role ? localizedRoleAbility(role) : '未找到角色资料；请先补齐项目中的角色说明。'
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
    sourceKind: role.sourceKind,
    inputKinds: role.inputKinds.slice(0, 4),
    setupImpact: role.research.setupImpact.slice(0, 3),
    possibleOutcomes: cleanRoleResearchItems(role.research.possibleOutcomes).slice(0, 5),
    stateChanges: cleanRoleResearchItems(role.research.stateChanges).slice(0, 4),
    identityChanges: cleanRoleResearchItems(role.research.identityChanges).slice(0, 4),
    teamChanges: cleanRoleResearchItems(role.research.teamChanges).slice(0, 4),
    playerMessageTemplates: cleanRoleResearchItems(role.research.playerMessageTemplates).slice(0, 4),
    highRiskNotes: cleanRoleResearchItems(role.research.highRiskNotes).slice(0, 5),
    sourceUrls: role.research.sourceUrls.slice(0, 4),
    reviewedAt: role.research.reviewedAt,
  }
}

function findRoleForScript(scriptId: ScriptId, roleId: RoleId) {
  const canonicalRoleId = normalizeRoleId(roleId)
  return getSmartScriptPack(scriptId).roles.find((candidate) => (
    candidate.id === roleId || candidate.id === canonicalRoleId || normalizeRoleId(candidate.id) === canonicalRoleId
  ))
}

const genericResearchPlaceholders = new Set([
  'Apply source ability only as an AI/ST-confirmed suggestion.',
  'Use source night reminder to record choices, results and player-facing information.',
])

function cleanRoleResearchItems(items: readonly string[]) {
  return items.filter((item) => !genericResearchPlaceholders.has(item)).map((item) => item
    .replace('AI only drafts reminders; storyteller confirms before changing authority state.', 'AI 只生成记录和提示草稿；改变权威状态前必须由说书人确认。')
    .replace('Do not auto-apply this role result; storyteller confirms before writing authority state.', '不要自动应用该角色结果；写入权威状态前必须由说书人确认。'))
}
