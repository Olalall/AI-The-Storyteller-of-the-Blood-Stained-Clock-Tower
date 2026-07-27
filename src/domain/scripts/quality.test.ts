import { describe, expect, it } from 'vitest'
import { buildScriptQualityReport, buildScriptQualitySummary } from './quality'
import type { SmartRoleDefinition, SmartScriptPack } from './types'

const baseResearch = {
  setupImpact: [],
  possibleOutcomes: ['给出信息'],
  stateChanges: [],
  identityChanges: [],
  teamChanges: [],
  playerMessageTemplates: ['你得到一个信息。'],
  highRiskNotes: [],
  sourceUrls: ['https://example.test/wiki'],
  reviewedAt: '2026-07-27',
}

function role(id: string, overrides: Partial<SmartRoleDefinition> = {}): SmartRoleDefinition {
  return {
    id,
    name: id,
    team: 'townsfolk',
    abilityText: '测试能力。',
    inputKinds: ['none'],
    knowledgeStatus: 'confirmed',
    research: baseResearch,
    ...overrides,
  }
}

function pack(overrides: Partial<SmartScriptPack> = {}): SmartScriptPack {
  return {
    scriptId: 'test-script',
    displayName: '测试板子',
    source: {
      contentHash: 'sha256:test',
      verifiedAt: '2026-07-27',
    },
    playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15],
    roles: [role('washerwoman'), role('chef')],
    nightOrders: {
      firstNight: [{ roleId: 'washerwoman', order: 1, knowledgeStatus: 'confirmed' }],
      otherNight: [{ roleId: 'chef', order: 1, knowledgeStatus: 'confirmed' }],
    },
    setupTemplates: [7, 8, 9, 10, 11, 12, 13, 14, 15].map((playerCount) => ({
      templateId: `test-${playerCount}`,
      scriptId: 'test-script',
      playerCount: playerCount as SmartScriptPack['playerCounts'][number],
      style: 'balanced',
      roles: ['washerwoman'],
      bluffs: ['chef'],
      notes: [],
      verified: true,
    })),
    setupRules: [{ id: 'base', summary: '基础规则', knowledgeStatus: 'confirmed' }],
    knowledgeStatus: 'confirmed',
    ...overrides,
  }
}

describe('script quality projector', () => {
  it('marks a fully reviewed smart script as ready', () => {
    const summary = buildScriptQualitySummary(pack())

    expect(summary.readiness).toBe('ready')
    expect(summary.readinessLabel).toBe('可开局')
    expect(summary.aiQualityLabel).toBe('AI强')
    expect(summary.playerCounts.missing).toEqual([])
    expect(summary.roleResearch).toEqual({ reviewed: 2, total: 2 })
  })

  it('marks playable scripts with weak AI knowledge as review', () => {
    const summary = buildScriptQualitySummary(pack({ roles: [role('gambler', { knowledgeStatus: 'needs-review' })] }))

    expect(summary.readiness).toBe('review')
    expect(summary.aiQualityLabel).toBe('AI可用')
    expect(summary.warnings).toContain('角色待复核 1')
  })

  it('blocks scripts that miss a player count template', () => {
    const templates = pack().setupTemplates.filter((template) => template.playerCount !== 15)
    const summary = buildScriptQualitySummary(pack({ setupTemplates: templates }))

    expect(summary.readiness).toBe('blocked')
    expect(summary.readinessLabel).toBe('暂缓')
    expect(summary.playerCounts.missing).toEqual([15])
    expect(summary.warnings).toContain('缺人数 15')
  })

  it('summarizes catalog totals for the UI panel', () => {
    const report = buildScriptQualityReport([
      pack({ scriptId: 'ready' }),
      pack({ scriptId: 'review', knowledgeStatus: 'needs-review' }),
      pack({ scriptId: 'blocked', playerCounts: [7, 8] }),
    ])

    expect(report.totals).toMatchObject({ scripts: 3, ready: 1, review: 1, blocked: 1 })
    expect(report.totals.roles).toBe(6)
  })
})
