import { describe, expect, it } from 'vitest'
import type { SmartRoleDefinition } from './types'
import { resolveCharacterIconPath } from './roleIconPaths'

function role(patch: Partial<SmartRoleDefinition>): SmartRoleDefinition {
  return {
    id: 'test-role',
    name: '测试角色',
    team: 'townsfolk',
    abilityText: '测试能力',
    inputKinds: ['none'],
    knowledgeStatus: 'confirmed',
    ...patch,
  }
}

describe('resolveCharacterIconPath', () => {
  it('projects remote community images into the local asset pack', () => {
    expect(resolveCharacterIconPath(role({
      id: 'remote-role',
      iconPath: 'https://example.com/icons/remote-role.jpg',
    }))).toBe('/assets/characters/remote-role.jpg')
  })

  it('uses PNG for community roles whose old placeholder path was WebP', () => {
    expect(resolveCharacterIconPath(role({
      id: 'community-role',
      iconPath: '/assets/characters/community-role.webp',
      research: {
        setupImpact: [],
        possibleOutcomes: [],
        stateChanges: [],
        identityChanges: [],
        teamChanges: [],
        playerMessageTemplates: [],
        highRiskNotes: [],
        sourceUrls: ['https://oss.gstonegames.com/example.json'],
        reviewedAt: '2026-08-02',
      },
    }))).toBe('/assets/characters/community-role.png')
  })

  it('keeps official local WebP paths unchanged', () => {
    expect(resolveCharacterIconPath(role({
      id: 'chef',
      iconPath: '/assets/characters/chef.webp',
    }))).toBe('/assets/characters/chef.webp')
  })
})
