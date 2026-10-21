import { describe, expect, it } from 'vitest'
import { createRoleDefinitionLibrary, type RoleDefinitionSource } from './roleDefinitionLibrary'
import type { SmartRoleDefinition } from './types'

const original: SmartRoleDefinition = {
  id: 'fanggu', name: '方古', team: 'demon', abilityText: '每晚*选择一名玩家。首次外来者跳转仍由主持确认。',
  inputKinds: ['player'], knowledgeStatus: 'confirmed', sourceKind: 'official-catalog',
  research: { setupImpact: ['+1 外来者'], possibleOutcomes: ['击杀候选', '跳转候选'], stateChanges: [], identityChanges: ['方古'],
    teamChanges: ['邪恶'], playerMessageTemplates: [], highRiskNotes: ['整局一次'], sourceUrls: ['https://example.test/rules/fang-gu'], reviewedAt: '2026-10-21' },
}
const source = (sourceId: string, role = original, sourceVersion = 'sha256:public-test'): RoleDefinitionSource => ({ sourceId, sourceVersion, roles: [role] })

describe('shared role definition library', () => {
  it('resolves stable IDs and known aliases without changing stored definitions', () => {
    const sources = [source('official')], before = structuredClone(sources)
    const library = createRoleDefinitionLibrary(sources)
    expect(library.resolve('fang_gu')).toEqual({ role: original, sourceId: 'official', sourceVersion: 'sha256:public-test' })
    expect(library.variants('fang_gu')).toEqual(library.variants('fanggu'))
    expect(sources).toEqual(before)
    expect(library.resolve('fanggu').role).toBe(original)
  })

  it('retains identical definitions from all their sources and resolves them deterministically', () => {
    const reordered = Object.fromEntries(Object.entries(original).reverse()) as unknown as SmartRoleDefinition
    const sources = [source('z-copy'), source('a-copy', reordered), source('a-copy', structuredClone(original))]
    const library = createRoleDefinitionLibrary(sources)
    expect(library.all().map((row) => row.sourceId)).toEqual(['a-copy', 'z-copy'])
    expect(library.resolve('fanggu').sourceId).toBe('a-copy')
    expect(createRoleDefinitionLibrary([...sources].reverse()).all()).toEqual(library.all())
  })

  it.each([
    { abilityText: '不同规则版本。' }, { inputKinds: ['players'] as const }, { team: 'outsider' as const },
    { research: { ...original.research!, highRiskNotes: ['不同例外'] } },
    { research: { ...original.research!, possibleOutcomes: ['跳转候选', '击杀候选'] } },
  ])('does not silently merge a changed ability, input, team or research field: %j', (difference) => {
    const changed = { ...original, ...difference }
    const library = createRoleDefinitionLibrary([source('official'), source('custom', changed)])
    expect(() => library.resolve('fanggu')).toThrow('多个版本')
    expect(library.resolve({ id: 'fanggu', sourceId: 'custom' }).role).toEqual(changed)
    expect(library.variants('fanggu')).toHaveLength(2)
  })

  it('requires an explicit version when one source contains incompatible versions', () => {
    const changed = { ...original, abilityText: '另一个公开规则版本。' }
    const library = createRoleDefinitionLibrary([source('community', original, 'v1'), source('community', changed, 'v2')])
    expect(() => library.resolve({ id: 'fanggu', sourceId: 'community' })).toThrow('多个版本')
    expect(library.resolve({ id: 'fang_gu', sourceId: 'community', sourceVersion: 'v2' }).role).toBe(changed)
    expect(() => library.resolve({ id: 'fanggu', sourceId: 'community', sourceVersion: 'v3' })).toThrow('未找到角色定义')
  })

  it('uses a preferred definition only for an unqualified reference and never overrides explicit source/version', () => {
    const changed = { ...original, abilityText: '另一个规则。' }
    const library = createRoleDefinitionLibrary([source('custom', changed), source('official')], [structuredClone(original)])
    expect(library.resolve('fanggu').sourceId).toBe('official')
    expect(library.resolve({ id: 'fanggu', sourceId: 'custom' }).role).toBe(changed)
    expect(() => library.resolve({ id: 'fanggu', sourceVersion: 'missing' })).toThrow('未找到角色定义')
    expect(() => createRoleDefinitionLibrary([source('custom', changed)], [original]).resolve('fanggu')).toThrow('没有匹配来源')
  })

  it('rejects contradictory definitions at the same source/version and contradictory defaults', () => {
    const changed = { ...original, abilityText: '另一个规则。' }
    expect(() => createRoleDefinitionLibrary([source('same'), source('same', changed)])).toThrow('来源内定义冲突')
    expect(() => createRoleDefinitionLibrary([source('official')], [original, changed])).toThrow('默认角色定义冲突')
  })

  it('rejects unknown roles, blank IDs and missing explicit sources instead of inventing definitions', () => {
    const library = createRoleDefinitionLibrary([source('official')], [original])
    expect(() => library.resolve('unknown')).toThrow('未找到角色定义')
    expect(() => library.resolve(' ')).toThrow('角色 ID')
    expect(() => library.resolve({ id: 'fanggu', sourceId: 'missing' })).toThrow('未找到角色定义')
    expect(() => library.resolve({ id: 'fanggu', sourceVersion: '' })).toThrow('角色来源版本')
    expect(() => createRoleDefinitionLibrary([source('official', original, 'x'.repeat(257))])).toThrow('角色来源版本')
    expect(createRoleDefinitionLibrary([]).variants('unknown')).toEqual([])
  })

  it('keeps enumeration arrays detached from the index and leaves nested input values unchanged', () => {
    const sources = [source('official')], before = structuredClone(sources)
    const library = createRoleDefinitionLibrary(sources)
    const rows = [...library.all()]
    rows[0].sourceId = 'changed-view'
    expect(library.resolve('fanggu').sourceId).toBe('official')
    expect(sources).toEqual(before)
  })
})
