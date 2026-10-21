import { expect, it } from 'vitest'
import { smartScriptPacks } from './allPacks'
import { confirmedRoleFactsList } from './role-facts'
import { resolveCharacterIconPath } from './roleIconPaths'
import { createRoleDefinitionLibrary } from './roleDefinitionLibrary'

it('resolves every registered source exactly and every preferred shared role without modifying any pack', () => {
  const before = JSON.stringify(smartScriptPacks)
  const preferred = confirmedRoleFactsList().map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) }))
  const library = createRoleDefinitionLibrary(smartScriptPacks.map((pack) => ({
    sourceId: pack.scriptId, sourceVersion: pack.source.contentHash, roles: pack.roles,
  })), preferred)
  for (const pack of smartScriptPacks) for (const role of pack.roles) {
    expect(library.resolve({ id: role.id, sourceId: pack.scriptId, sourceVersion: pack.source.contentHash }).role).toEqual(role)
  }
  for (const role of preferred) expect(library.resolve(role.id).role).toEqual(role)
  expect(library.all()).toHaveLength(smartScriptPacks.reduce((count, pack) => count + pack.roles.length, 0))
  expect(JSON.stringify(smartScriptPacks)).toBe(before)
})
