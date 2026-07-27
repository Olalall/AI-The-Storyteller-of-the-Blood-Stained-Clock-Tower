import { describe, expect, it } from 'vitest'
import { createScriptRegistry } from '../../registry'
import { validateTemplateComposition } from '../../../setup-templates'
import { badMoonRisingSmartScriptPack } from '.'

describe('Bad Moon Rising smart script pack', () => {
  it('registers as a playable confirmed official pack', () => {
    const registry = createScriptRegistry([badMoonRisingSmartScriptPack])

    expect(registry.get('bad-moon-rising')).toBe(badMoonRisingSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([badMoonRisingSmartScriptPack])
    expect(badMoonRisingSmartScriptPack.knowledgeStatus).toBe('confirmed')
    expect(badMoonRisingSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts and high-risk setup rules confirmed from official data', () => {
    expect(badMoonRisingSmartScriptPack.roles).toHaveLength(30)
    expect(badMoonRisingSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)
    expect(badMoonRisingSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'godfather-outsider',
      'lunatic-fake-demon',
      'apprentice-first-night',
    ])

    const byId = new Map(badMoonRisingSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('godfather')?.research?.setupImpact).toContain('-1 或 +1 外来者。')
    expect(byId.get('goon')?.research?.teamChanges).toContain('莽夫可能因首次影响他的玩家阵营而改变阵营。')
    expect(byId.get('zombuul')?.research?.highRiskNotes).toContain('首次死亡后需要显示为死亡但仍可能存活行动。')
  })

  it('uses the official filtered night sheet order', () => {
    expect(badMoonRisingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'apprentice',
      'lunatic',
      'sailor',
      'courtier',
      'godfather',
      'devilsadvocate',
      'pukka',
      'grandmother',
      'chambermaid',
    ])
    expect(badMoonRisingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'sailor',
      'courtier',
      'innkeeper',
      'gambler',
      'devilsadvocate',
      'lunatic',
      'exorcist',
      'zombuul',
      'pukka',
      'shabaloth',
      'po',
      'assassin',
      'godfather',
      'gossip',
      'professor',
      'tinker',
      'moonchild',
      'grandmother',
      'chambermaid',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = badMoonRisingSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(badMoonRisingSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(badMoonRisingSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(badMoonRisingSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
      7,
      7,
      7,
      8,
      8,
      9,
      9,
      10,
      10,
      10,
      11,
      11,
      12,
      12,
      12,
      13,
      13,
      14,
      14,
      15,
      15,
      15,
    ])
  })

  it('keeps demon bluffs out of play and inside the script', () => {
    const roleIds = new Set(badMoonRisingSmartScriptPack.roles.map((role) => role.id))

    for (const template of badMoonRisingSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks Godfather outsider-change templates with an explicit setup adjustment', () => {
    const adjustedTemplates = badMoonRisingSmartScriptPack.setupTemplates.filter((template) =>
      template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'godfather-outsider'),
    )

    expect(adjustedTemplates).toHaveLength(5)
    expect(adjustedTemplates.every((template) => template.roles.includes('godfather'))).toBe(true)
  })
})

