import { normalizeRoleId } from './roleId'
import type { SmartRoleDefinition } from './types'

export interface RoleDefinitionSource {
  sourceId: string
  sourceVersion: string
  roles: readonly SmartRoleDefinition[]
}

export type RoleDefinitionReference = string | { id: string; sourceId?: string; sourceVersion?: string }

export interface ResolvedRoleDefinition {
  role: SmartRoleDefinition
  sourceId: string
  sourceVersion: string
}

export interface RoleDefinitionLibrary {
  resolve(reference: RoleDefinitionReference): ResolvedRoleDefinition
  all(): readonly ResolvedRoleDefinition[]
  variants(roleId: string): readonly ResolvedRoleDefinition[]
}

function checkedId(value: string, label: string) {
  if (typeof value !== 'string' || !value.trim() || value.length > 256) throw new Error(`${label}必须为 1-256 字符的非空字符串`)
  return value
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, nested]) => [key, stableValue(nested)]))
  return value
}

function definitionKey(role: SmartRoleDefinition) {
  return JSON.stringify(stableValue({ ...role, id: normalizeRoleId(role.id) }))
}

/** 只索引角色资料；不加载板子、不访问会话，也不解释或执行角色能力。 */
export function createRoleDefinitionLibrary(sources: readonly RoleDefinitionSource[], preferredRoles: readonly SmartRoleDefinition[] = []): RoleDefinitionLibrary {
  const byRole = new Map<string, Array<ResolvedRoleDefinition & { key: string }>>()
  const preferred = new Map<string, string>()
  for (const role of preferredRoles) {
    const id = normalizeRoleId(checkedId(role.id, '角色 ID')), key = definitionKey(role)
    if (preferred.has(id) && preferred.get(id) !== key) throw new Error(`默认角色定义冲突：${id}`)
    preferred.set(id, key)
  }
  for (const source of sources) {
    const sourceId = checkedId(source.sourceId, '角色来源 ID'), sourceVersion = checkedId(source.sourceVersion, '角色来源版本')
    for (const role of source.roles) {
      const id = normalizeRoleId(checkedId(role.id, '角色 ID')), key = definitionKey(role)
      const variants = byRole.get(id) ?? []
      const duplicate = variants.find((entry) => entry.sourceId === sourceId && entry.sourceVersion === sourceVersion)
      if (duplicate && duplicate.key !== key) throw new Error(`角色来源内定义冲突：${id} @ ${sourceId} / ${sourceVersion}`)
      if (!duplicate) variants.push({ role, sourceId, sourceVersion, key })
      byRole.set(id, variants)
    }
  }
  const compare = (a: ResolvedRoleDefinition, b: ResolvedRoleDefinition) => {
    const left = [normalizeRoleId(a.role.id), a.sourceId, a.sourceVersion].join('\0')
    const right = [normalizeRoleId(b.role.id), b.sourceId, b.sourceVersion].join('\0')
    return left < right ? -1 : left > right ? 1 : 0
  }
  for (const variants of byRole.values()) variants.sort(compare)
  const rows = [...byRole.values()].flat().sort(compare)
  const publicRow = ({ role, sourceId, sourceVersion }: ResolvedRoleDefinition): ResolvedRoleDefinition => ({ role, sourceId, sourceVersion })
  return {
    all: () => rows.map(publicRow),
    variants: (roleId) => (byRole.get(normalizeRoleId(checkedId(roleId, '角色 ID'))) ?? []).map(publicRow),
    resolve: (reference) => {
      if (!reference || typeof reference !== 'string' && typeof reference !== 'object') throw new Error('角色引用必须为角色 ID 或带来源的引用对象')
      const ref = typeof reference === 'string' ? { id: reference } : reference
      const id = normalizeRoleId(checkedId(ref.id, '角色 ID'))
      if (ref.sourceId !== undefined) checkedId(ref.sourceId, '角色来源 ID')
      if (ref.sourceVersion !== undefined) checkedId(ref.sourceVersion, '角色来源版本')
      let candidates = (byRole.get(id) ?? []).filter((row) => (ref.sourceId === undefined || row.sourceId === ref.sourceId)
        && (ref.sourceVersion === undefined || row.sourceVersion === ref.sourceVersion))
      if (!candidates.length) throw new Error(`未找到角色定义：${id}${ref.sourceId ? ` @ ${ref.sourceId}` : ''}${ref.sourceVersion ? ` / ${ref.sourceVersion}` : ''}`)
      if (ref.sourceId === undefined && ref.sourceVersion === undefined && preferred.has(id)) {
        candidates = candidates.filter((candidate) => candidate.key === preferred.get(id))
        if (!candidates.length) throw new Error(`默认角色定义没有匹配来源：${id}`)
      }
      if (new Set(candidates.map((candidate) => candidate.key)).size > 1) throw new Error(`角色定义有多个版本：${id}；请指定 sourceId 和 sourceVersion`)
      return publicRow(candidates[0])
    },
  }
}
