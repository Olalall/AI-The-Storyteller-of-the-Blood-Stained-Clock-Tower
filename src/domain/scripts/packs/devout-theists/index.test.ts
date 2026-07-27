import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates'
import { createScriptRegistry } from '../../registry'
import { devoutTheistsSmartScriptPack } from '.'

describe('Devout Theists smart script pack', () => {
  it('registers as a playable Carousel pack that still needs storyteller review', () => {
    const registry = createScriptRegistry([devoutTheistsSmartScriptPack])

    expect(registry.get('devout-theists')).toBe(devoutTheistsSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([devoutTheistsSmartScriptPack])
    expect(devoutTheistsSmartScriptPack.knowledgeStatus).toBe('needs-review')
    expect(devoutTheistsSmartScriptPack.source.author).toBe('Emerald')
    expect(devoutTheistsSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts confirmed and normalizes source IDs', () => {
    expect(devoutTheistsSmartScriptPack.roles).toHaveLength(25)
    expect(devoutTheistsSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(devoutTheistsSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.has('high_priestess')).toBe(false)
    expect(byId.has('fang_gu')).toBe(false)
    expect(byId.get('highpriestess')?.name).toBe('女祭司')
    expect(byId.get('fanggu')?.name).toBe('方古')
    expect(byId.get('legion')?.research?.highRiskNotes[0]).toContain('不自动生成多名军团')
    expect(byId.get('lleech')?.research?.highRiskNotes[0]).toContain('不能自动处理')
  })

  it('uses the official filtered night sheet order', () => {
    expect(devoutTheistsSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'kazali',
      'magician',
      'snitch',
      'marionette',
      'lleech',
      'widow',
      'pixie',
      'amnesiac',
      'chef',
      'noble',
      'highpriestess',
      'mathematician',
    ])
    expect(devoutTheistsSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'legion',
      'fanggu',
      'lleech',
      'kazali',
      'amnesiac',
      'farmer',
      'flowergirl',
      'juggler',
      'highpriestess',
      'mathematician',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = devoutTheistsSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(devoutTheistsSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(devoutTheistsSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(devoutTheistsSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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

  it('keeps bluffs out of play and keeps Legion out of verified setup templates', () => {
    const roleIds = new Set(devoutTheistsSmartScriptPack.roles.map((role) => role.id))

    for (const template of devoutTheistsSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.roles).not.toContain('legion')
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks setup adjustments and high-risk rules explicitly', () => {
    const adjustedRuleIds = new Set(
      devoutTheistsSmartScriptPack.setupTemplates.flatMap((template) =>
        template.setupAdjustments?.map((adjustment) => adjustment.ruleId) ?? [],
      ),
    )

    expect(adjustedRuleIds).toEqual(new Set(['fanggu-outsider']))
    expect(devoutTheistsSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'high-priestess-id-normalization',
      'fang-gu-id-normalization',
      'snitch-minion-bluffs',
      'marionette-neighbor-demon',
      'fanggu-outsider',
      'kazali-minion-selection',
      'lleech-host',
      'legion-majority-demon',
      'magician-demon-minion-info',
      'widow-poison',
    ])
  })
})
