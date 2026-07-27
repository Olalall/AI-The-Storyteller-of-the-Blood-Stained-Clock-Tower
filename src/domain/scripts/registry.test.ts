import { describe, expect, it } from 'vitest'
import { createScriptRegistry, type SmartScriptPack } from '.'

const testPack: SmartScriptPack = {
  scriptId: 'test-script',
  displayName: '测试板子',
  source: {
    author: '测试作者',
    version: 'test-v1',
    url: 'https://example.test/script',
    contentHash: 'sha256-test',
    verifiedAt: '2026-07-19',
  },
  playerCounts: [7, 12],
  roles: [
    {
      id: 'investigator',
      name: '调查员',
      team: 'townsfolk',
      abilityText: '首夜得知两名玩家中有一名爪牙。',
      inputKinds: ['none'],
      knowledgeStatus: 'confirmed',
    },
  ],
  nightOrders: {
    firstNight: [{ roleId: 'investigator', order: 10, knowledgeStatus: 'confirmed' }],
    otherNight: [],
  },
  setupTemplates: [
    {
      templateId: 'test-script-7-balanced',
      scriptId: 'test-script',
      playerCount: 7,
      style: 'balanced',
      roles: ['investigator'],
      bluffs: [],
      notes: ['测试模板'],
      verified: true,
    },
  ],
  setupRules: [],
  knowledgeStatus: 'confirmed',
}

describe('smart script registry', () => {
  it('registers and reads a smart script pack by stable id', () => {
    const registry = createScriptRegistry([testPack])

    expect(registry.get('test-script')).toBe(testPack)
    expect(registry.get('missing-script')).toBeNull()
    expect(registry.all()).toEqual([testPack])
  })

  it('does not allow duplicate script ids', () => {
    const registry = createScriptRegistry([testPack])

    expect(() => registry.register({ ...testPack })).toThrow('重复的智能板子ID：test-script')
  })

  it('filters playable scripts by player count without using display names', () => {
    const registry = createScriptRegistry([testPack])

    expect(registry.playableFor(7)).toEqual([testPack])
    expect(registry.playableFor(8)).toEqual([])
    expect(testPack.roles[0].id).toBe('investigator')
  })
})
