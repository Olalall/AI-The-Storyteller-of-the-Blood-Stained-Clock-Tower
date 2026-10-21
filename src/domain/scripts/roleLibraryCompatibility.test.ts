import { expect, test } from 'vitest'
import { confirmedRoleFactsForScript, confirmedRoleFactsList } from './role-facts'

const legacy = import.meta.glob('./packs/*/roles.ts', { eager: true })
const shared = import.meta.glob('./role-library/*/roles.ts', { eager: true })

test('keeps all existing pack role exports as references to the shared definitions', () => {
  expect(Object.keys(legacy)).toHaveLength(138)
  expect(Object.keys(shared)).toHaveLength(138)
  for (const [path, oldModule] of Object.entries(legacy)) {
    const sharedModule = shared[path.replace('/packs/', '/role-library/')] as Record<string, unknown>
    expect(sharedModule, path).toBeDefined()
    expect(Object.keys(oldModule as object)).toEqual(Object.keys(sharedModule))
    for (const [key, value] of Object.entries(oldModule as Record<string, unknown>)) expect(value, path + ':' + key).toBe(sharedModule[key])
  }
})

test('exposes the shared core facts without exposing its mutable lookup map', () => {
  const facts = confirmedRoleFactsList()
  const next = confirmedRoleFactsList()
  expect(facts.length).toBeGreaterThan(100)
  expect(facts).not.toBe(next)
  expect(new Set(facts.map((role) => role.id)).size).toBe(facts.length)
  for (const role of facts) expect(confirmedRoleFactsForScript([role.id])[0]).toBe(role)
})
