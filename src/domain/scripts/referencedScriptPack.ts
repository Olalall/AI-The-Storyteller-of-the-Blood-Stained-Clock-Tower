import officialNightSheet from '../../features/night-workbench/data/official/nightsheet.json' with { type: 'json' }
import { officialRoleIds } from './officialRoleIds'
import { normalizeRoleId } from './roleId'
import { templateRoleSelectionValid } from './templateRoleSelection'
import type { RoleDefinitionLibrary, RoleDefinitionReference } from './roleDefinitionLibrary'
import type { NightOrderEntry, SmartRoleDefinition, SmartScriptPack } from './types'

export interface ReferencedScriptDefinition extends Omit<SmartScriptPack, 'roles' | 'nightOrders'> {
  roleRefs: readonly RoleDefinitionReference[]
  roleDefinitionHashes?: Readonly<Record<string, string>>
  nightOrders?: SmartScriptPack['nightOrders']
}

/** Knowledge-only assembly. Registration, human review and game state remain separate. */
export function createReferencedScriptPack(definition: ReferencedScriptDefinition, library: RoleDefinitionLibrary): SmartScriptPack {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(definition.scriptId) || definition.scriptId.length > 80) {
    throw new Error('板子ID必须使用稳定的小写英文、数字和短横线。')
  }
  if (!definition.roleRefs.length) throw new Error('板子必须声明角色引用。')
  if (!definition.displayName.trim() || !definition.source.contentHash.match(/^sha256:[a-f0-9]{64}$/i)) {
    throw new Error('板子名称或来源内容哈希不完整。')
  }
  const source = new URL(definition.source.url ?? '')
  if (source.protocol !== 'https:' || source.username || source.password) throw new Error('来源必须是无凭据的公开HTTPS链接。')
  if (!definition.playerCounts.length || new Set(definition.playerCounts).size !== definition.playerCounts.length
    || definition.playerCounts.some((count) => !Number.isInteger(count) || count < 7 || count > 15)) {
    throw new Error('支持人数必须在7至15人之间且不能重复。')
  }
  const roles = definition.roleRefs.map((reference) => {
    const role = library.resolve(reference).role
    const id = normalizeRoleId(role.id)
    return id === role.id ? role : { ...role, id }
  })
  if (roles.some((role) => officialRoleIds.has(role.id)
    && (role.sourceKind === 'community-or-custom' || /^(custom|自定义)$/i.test(role.officialName ?? '')))) {
    throw new Error('自制角色占用了官方角色ID；请先分配独立稳定ID并核对支持，不能套用官方技能。')
  }
  const ids = new Set(roles.map((role) => role.id))
  if (ids.size !== roles.length) throw new Error('板子含重复角色或重复别名。')
  const nightOrders = definition.nightOrders ?? deriveOfficialNightOrders(roles, library)
  for (const entries of [nightOrders.firstNight, nightOrders.otherNight]) {
    const seen = new Set<string>()
    for (const entry of entries) {
      const id = normalizeRoleId(entry.roleId)
      if (!ids.has(id) || seen.has(id) || !Number.isFinite(entry.order)) throw new Error('夜序含未知、重复角色或无效顺位。')
      seen.add(id)
    }
  }
  for (const template of definition.setupTemplates) {
    if (template.scriptId !== definition.scriptId || !definition.playerCounts.includes(template.playerCount)
      || template.roles.length !== template.playerCount || template.bluffs.length !== 3
      || [...template.roles, ...template.bluffs].some((id) => !ids.has(normalizeRoleId(id)))) {
      throw new Error('配板模板必须属于当前板子、人数正确且只引用板内角色。')
    }
    if (!templateRoleSelectionValid({ roles, setupRules: definition.setupRules }, template)) throw new Error('配板角色重复、类型不合法或恶魔伪装不合法。')
  }
  const { roleRefs: _references, roleDefinitionHashes: _hashes, ...metadata } = definition
  return { ...metadata, roles, nightOrders }
}

function deriveOfficialNightOrders(roles: readonly SmartRoleDefinition[], library: RoleDefinitionLibrary): SmartScriptPack['nightOrders'] {
  for (const role of roles) {
    const id = normalizeRoleId(role.id)
    if (!officialRoleIds.has(id) || role.sourceKind === 'community-or-custom' || /^(custom|自定义)$/i.test(role.officialName ?? '')) {
      throw new Error('自制角色或规则变体必须提供已经核对的首夜和其他夜顺序。')
    }
    const preferred = library.resolve(id).role
    if (preferred.abilityText !== role.abilityText || preferred.team !== role.team) {
      throw new Error('非默认规则版本必须明确提供夜序，不能套用当前官方顺序。')
    }
  }
  const byId = new Map(roles.map((role) => [normalizeRoleId(role.id), role]))
  const derive = (entries: readonly string[]): NightOrderEntry[] => entries.flatMap((id) => byId.has(id)
    ? [{ roleId: id, order: 0, knowledgeStatus: 'confirmed' as const, note: '复用项目已核实的官方夜表；结果仍由说书人确认。' }]
    : []).map((entry, index) => ({ ...entry, order: index + 1 }))
  return { firstNight: derive(officialNightSheet.firstNight), otherNight: derive(officialNightSheet.otherNight) }
}
