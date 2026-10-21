import { describe, expect, it } from 'vitest'
import { createRoleDefinitionLibrary } from './roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from './referencedScriptPack'
import type { SmartRoleDefinition } from './types'

const role = (id: string, abilityText = 'A verified ability.'): SmartRoleDefinition => ({
  id, name: id, officialName: id, team: id === 'imp' ? 'demon' : 'townsfolk',
  abilityText, inputKinds: ['none'], knowledgeStatus: 'confirmed',
})
const roles = [role('chef'), role('empath'), role('imp'), role('monk')]
const library = createRoleDefinitionLibrary([{ sourceId: 'verified', sourceVersion: 'v1', roles }])
const definition = (): ReferencedScriptDefinition => ({
  scriptId: 'shared-role-example', displayName: 'Shared role example',
  source: { url: 'https://scripts.example.org/example', contentHash: 'sha256:' + 'a'.repeat(64), verifiedAt: '2026-10-21' },
  playerCounts: [7], roleRefs: ['chef', 'empath', 'imp', 'monk'],
  setupTemplates: [], setupRules: [], knowledgeStatus: 'needs-review',
})

describe('referenced script assembly', () => {
  it('reuses existing role objects and official phase order without page or skill code', () => {
    const input = definition(), before = structuredClone(input)
    const pack = createReferencedScriptPack(input, library)
    expect(pack.roles[0]).toBe(roles[0])
    expect(pack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('chef')
    expect(pack.nightOrders.firstNight.map((entry) => entry.roleId)).not.toContain('imp')
    expect(pack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('imp')
    expect(pack.nightOrders.otherNight.map((entry) => entry.roleId)).not.toContain('chef')
    expect(pack.knowledgeStatus).toBe('needs-review')
    expect(input).toEqual(before)
  })
  it('resolves aliases once and rejects duplicated aliases', () => {
    const aliasLibrary = createRoleDefinitionLibrary([{ sourceId: 'verified', sourceVersion: 'v1', roles: [role('pithag')] }])
    expect(createReferencedScriptPack({ ...definition(), roleRefs: ['pit_hag'] }, aliasLibrary).roles[0].id).toBe('pithag')
    expect(() => createReferencedScriptPack({ ...definition(), roleRefs: ['pit_hag', 'pithag'] }, aliasLibrary)).toThrow('重复')
  })
  it('rejects unknown roles and pinned versions that no longer match', () => {
    expect(() => createReferencedScriptPack({ ...definition(), roleRefs: ['not-in-library'] }, library)).toThrow()
    expect(() => createReferencedScriptPack({ ...definition(), roleRefs: [{ id: 'chef', sourceId: 'verified', sourceVersion: 'v2' }] }, library)).toThrow()
  })
  it('requires explicit night tables for custom roles, preserving their own order', () => {
    const custom = createRoleDefinitionLibrary([{ sourceId: 'author', sourceVersion: 'v1', roles: [role('author-role')] }])
    expect(() => createReferencedScriptPack({ ...definition(), roleRefs: ['author-role'] }, custom)).toThrow('自制')
    const order = { firstNight: [{ roleId: 'author-role', order: 1, knowledgeStatus: 'confirmed' as const }], otherNight: [] }
    expect(createReferencedScriptPack({ ...definition(), roleRefs: ['author-role'], nightOrders: order }, custom).nightOrders).toBe(order)
  })
  it('cannot reuse a default night table for an explicitly selected different ability version', () => {
    const original = role('empath'), variant = role('empath', 'A different author ability.')
    const variants = createRoleDefinitionLibrary([
      { sourceId: 'official', sourceVersion: 'v1', roles: [original] },
      { sourceId: 'author', sourceVersion: 'v2', roles: [variant] },
    ], [original])
    expect(() => createReferencedScriptPack({ ...definition(), roleRefs: [{ id: 'empath', sourceId: 'author' }] }, variants)).toThrow('版本')
  })
  it('rejects an author variant using an official ID even with explicit night tables', () => {
    const customChef = { ...role('chef', 'An unrelated author ability.'), officialName: 'custom' }
    const custom = createRoleDefinitionLibrary([{ sourceId: 'author', sourceVersion: 'v1', roles: [customChef] }])
    expect(() => createReferencedScriptPack({ ...definition(), roleRefs: [{ id: 'chef', sourceId: 'author' }],
      nightOrders: { firstNight: [{ roleId: 'chef', order: 1, knowledgeStatus: 'confirmed' }], otherNight: [] },
    }, custom)).toThrow('独立稳定ID')
  })
  it('does not mark templates or unfinished sources verified merely because roles resolve', () => {
    expect(createReferencedScriptPack(definition(), library).setupTemplates).toEqual([])
    expect(createReferencedScriptPack(definition(), library).knowledgeStatus).toBe('needs-review')
    expect(() => createReferencedScriptPack({ ...definition(), setupTemplates: [{
      templateId: 'wrong', scriptId: 'another-script', playerCount: 7, style: 'balanced', roles: ['chef'], bluffs: [],
      notes: [], verified: false,
    }] }, library)).toThrow('配板')
  })
  it('rejects malformed source, unsafe ID, duplicate counts and unknown night entries', () => {
    expect(() => createReferencedScriptPack({ ...definition(), scriptId: '../outside' }, library)).toThrow('ID')
    expect(() => createReferencedScriptPack({ ...definition(), source: { ...definition().source, url: 'https://user:secret@scripts.example.org' } }, library)).toThrow('凭据')
    expect(() => createReferencedScriptPack({ ...definition(), playerCounts: [7, 7] }, library)).toThrow('人数')
    expect(() => createReferencedScriptPack({ ...definition(), nightOrders: { firstNight: [{ roleId: 'unknown', order: 1, knowledgeStatus: 'confirmed' }], otherNight: [] } }, library)).toThrow('夜序')
  })
})
