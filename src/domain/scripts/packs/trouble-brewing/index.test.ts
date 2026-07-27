import { describe, expect, it } from 'vitest'
import { createScriptRegistry } from '../../registry'
import { validateTemplateComposition } from '../../../setup-templates'
import { troubleBrewingSmartScriptPack } from '.'

describe('Trouble Brewing smart script pack', () => {
  it('registers as a playable confirmed official pack', () => {
    const registry = createScriptRegistry([troubleBrewingSmartScriptPack])

    expect(registry.get('trouble-brewing')).toBe(troubleBrewingSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([troubleBrewingSmartScriptPack])
    expect(troubleBrewingSmartScriptPack.knowledgeStatus).toBe('confirmed')
    expect(troubleBrewingSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts and setup rules confirmed from official data', () => {
    expect(troubleBrewingSmartScriptPack.roles).toHaveLength(27)
    expect(troubleBrewingSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)
    expect(troubleBrewingSmartScriptPack.setupRules.every((rule) => rule.knowledgeStatus === 'confirmed')).toBe(true)
    expect(troubleBrewingSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'baron-outsiders',
      'drunk-cover',
      'fortuneteller-red-herring',
    ])

    const byId = new Map(troubleBrewingSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('baron')?.research?.setupImpact).toContain('+2 外来者，通常替换 2 名镇民。')
    expect(byId.get('fortuneteller')?.research?.setupImpact).toContain('开局指定 1 名善良玩家作为红鲱鱼。')
    expect(byId.get('imp')?.research?.identityChanges).toContain('小恶魔自杀时，一名爪牙变成小恶魔。')
  })

  it('uses the official filtered night sheet order', () => {
    expect(troubleBrewingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'bureaucrat',
      'thief',
      'poisoner',
      'washerwoman',
      'librarian',
      'investigator',
      'chef',
      'empath',
      'fortuneteller',
      'butler',
      'spy',
    ])
    expect(troubleBrewingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'bureaucrat',
      'thief',
      'poisoner',
      'monk',
      'scarletwoman',
      'imp',
      'ravenkeeper',
      'empath',
      'fortuneteller',
      'undertaker',
      'butler',
      'spy',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = troubleBrewingSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(troubleBrewingSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(troubleBrewingSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(troubleBrewingSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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
    const roleIds = new Set(troubleBrewingSmartScriptPack.roles.map((role) => role.id))

    for (const template of troubleBrewingSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks every Baron template with the outsider setup adjustment', () => {
    const baronTemplates = troubleBrewingSmartScriptPack.setupTemplates.filter((template) => template.roles.includes('baron'))

    expect(baronTemplates).toHaveLength(4)
    expect(baronTemplates.every((template) => template.setupAdjustments?.[0]?.ruleId === 'baron-outsiders')).toBe(true)
  })
})
