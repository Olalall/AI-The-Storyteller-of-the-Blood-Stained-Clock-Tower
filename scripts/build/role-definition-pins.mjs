import { createHash } from 'node:crypto'

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, nested]) => [key, stableValue(nested)]))
  return value
}

export function roleDefinitionHashes(roles) {
  return Object.fromEntries(roles.map((role) => [role.id,
    'sha256:' + createHash('sha256').update(JSON.stringify(stableValue(role))).digest('hex')]))
}

// Source labels alone cannot detect a library definition edited after draft generation.
export function verifyRoleDefinitionPins(definition, roles) {
  const expected = definition.roleDefinitionHashes
  const actual = roleDefinitionHashes(roles)
  if (!expected || Object.keys(expected).length !== roles.length
    || Object.entries(actual).some(([id, hash]) => expected[id] !== hash)) {
    throw new Error('角色资料已变化或缺少指纹：' + definition.scriptId + '；请重新准备并核对板子。')
  }
}
