import type { SmartScriptPack, SetupTemplate } from '../scripts/types'

export const hereticForbiddenRoleIds = ['baron', 'godfather', 'lleech', 'pithag', 'spy', 'widow'] as const

export function hasHereticConflict(roles: readonly string[]) {
  return roles.includes('heretic') && hereticForbiddenRoleIds.some(id => roles.includes(id))
}

/** 推荐模板可换同类型角色；原文和已确认对局不改。硬冲突仍在确认入口校验。 */
export function normalizeHereticTemplate(template: SetupTemplate, pack: SmartScriptPack): SetupTemplate {
  if (!hasHereticConflict(template.roles)) return template
  const replacement = pack.roles.find(role => role.team === 'outsider' && !template.roles.includes(role.id))
  if (!replacement) return template
  const roles = template.roles.map(id => id === 'heretic' ? replacement.id : id)
  const bluffs = [...new Set([...template.bluffs, ...pack.roles.filter(role=>role.team==='townsfolk'||role.team==='outsider').map(role=>role.id)])]
    .filter(id=>!roles.includes(id)).slice(0,template.bluffs.length)
  return { ...template, roles, bluffs,
    notes: [...template.notes, '推荐配板避开异端的禁同场相克；同类型替换，不改变原始剧本或旧局。https://release.botc.app/resources/data/jinxes.json'] }
}
