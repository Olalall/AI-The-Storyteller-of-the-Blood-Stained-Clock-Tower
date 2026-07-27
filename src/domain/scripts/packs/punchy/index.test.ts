import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates'
import { setupRolesForScript } from '../../catalog'
import { createScriptRegistry } from '../../registry'
import { punchySmartScriptPack } from '.'

describe('Punchy smart script pack', () => {
  it('registers as a playable Carousel pack that still needs storyteller review', () => {
    const registry = createScriptRegistry([punchySmartScriptPack])

    expect(registry.get('punchy')).toBe(punchySmartScriptPack)
    expect(registry.playableFor(12)).toEqual([punchySmartScriptPack])
    expect(punchySmartScriptPack.knowledgeStatus).toBe('needs-review')
    expect(punchySmartScriptPack.source.author).toBe('Zets')
    expect(punchySmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts confirmed and normalizes Spirit of Ivory', () => {
    expect(punchySmartScriptPack.roles).toHaveLength(26)
    expect(punchySmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(punchySmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.has('spirit_of_ivory')).toBe(false)
    expect(byId.get('spiritofivory')?.team).toBe('fabled')
    expect(setupRolesForScript('punchy').map((role) => role.id)).not.toContain('spiritofivory')
    expect(byId.get('balloonist')?.research?.setupImpact[0]).toContain('外来者')
    expect(byId.get('alchemist')?.research?.highRiskNotes[0]).toContain('不自动执行爪牙逻辑')
    expect(byId.get('vizier')?.research?.stateChanges[0]).toContain('立即处决')
  })

  it('uses the official filtered night sheet order', () => {
    expect(punchySmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'kazali',
      'philosopher',
      'alchemist',
      'cerenovus',
      'harpy',
      'pukka',
      'pixie',
      'huntsman',
      'damsel',
      'amnesiac',
      'steward',
      'balloonist',
      'ogre',
      'general',
      'vizier',
    ])
    expect(punchySmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'philosopher',
      'monk',
      'cerenovus',
      'harpy',
      'princess',
      'pukka',
      'vigormortis',
      'ojo',
      'kazali',
      'huntsman',
      'damsel',
      'amnesiac',
      'balloonist',
      'general',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = punchySmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(punchySmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(punchySmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(punchySmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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

  it('keeps demon bluffs out of play and never uses the fabled role as a bluff', () => {
    const roleIds = new Set(punchySmartScriptPack.roles.map((role) => role.id))

    for (const template of punchySmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.roles).not.toContain('spiritofivory')
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => roleId !== 'spiritofivory')).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks setup adjustments and high-risk setup rules explicitly', () => {
    const adjustedRuleIds = new Set(
      punchySmartScriptPack.setupTemplates.flatMap((template) =>
        template.setupAdjustments?.map((adjustment) => adjustment.ruleId) ?? [],
      ),
    )

    expect(adjustedRuleIds).toEqual(new Set(['huntsman-damsel', 'balloonist-outsider', 'vigormortis-outsider']))
    expect(punchySmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'balloonist-outsider',
      'huntsman-damsel',
      'kazali-minion-selection',
      'vigormortis-outsider',
      'alchemist-minion-ability',
      'spirit-of-ivory-extra-evil',
    ])
  })
})
