import { describe, expect, it } from 'vitest'
import { setupRolesForScript } from '../../catalog'
import { createScriptRegistry } from '../../registry'
import { validateTemplateComposition } from '../../../setup-templates'
import { oneInOneOutSmartScriptPack } from '.'

describe('One in one out smart script pack', () => {
  it('registers as a playable TPI Recommended pack that still needs storyteller review', () => {
    const registry = createScriptRegistry([oneInOneOutSmartScriptPack])

    expect(registry.get('one-in-one-out')).toBe(oneInOneOutSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([oneInOneOutSmartScriptPack])
    expect(oneInOneOutSmartScriptPack.knowledgeStatus).toBe('needs-review')
    expect(oneInOneOutSmartScriptPack.source.author).toBe('Baron von Klutz')
    expect(oneInOneOutSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts confirmed and excludes Spirit of Ivory from seat roles', () => {
    expect(oneInOneOutSmartScriptPack.roles).toHaveLength(26)
    expect(oneInOneOutSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(oneInOneOutSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('spiritofivory')?.team).toBe('fabled')
    expect(setupRolesForScript('one-in-one-out').map((role) => role.id)).not.toContain('spiritofivory')
    expect(byId.get('snakecharmer')?.research?.stateChanges).toContain('原恶魔成为新的舞蛇人后中毒。')
    expect(byId.get('ogre')?.research?.teamChanges[0]).toContain('即使醉酒或中毒')
    expect(byId.get('kazali')?.research?.identityChanges[0]).toContain('指定玩家成为具体爪牙')
  })

  it('uses the official filtered night sheet order', () => {
    expect(oneInOneOutSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'kazali',
      'poisoner',
      'snakecharmer',
      'harpy',
      'mezepheles',
      'amnesiac',
      'fortuneteller',
      'seamstress',
      'steward',
      'knight',
      'villageidiot',
      'spy',
      'ogre',
      'highpriestess',
    ])
    expect(oneInOneOutSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'poisoner',
      'snakecharmer',
      'monk',
      'harpy',
      'mezepheles',
      'imp',
      'fanggu',
      'ojo',
      'kazali',
      'amnesiac',
      'farmer',
      'fortuneteller',
      'oracle',
      'seamstress',
      'villageidiot',
      'spy',
      'highpriestess',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = oneInOneOutSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(oneInOneOutSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(oneInOneOutSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(oneInOneOutSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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
    const roleIds = new Set(oneInOneOutSmartScriptPack.roles.map((role) => role.id))

    for (const template of oneInOneOutSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.roles).not.toContain('spiritofivory')
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => roleId !== 'spiritofivory')).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks Fang Gu templates and high-risk setup rules explicitly', () => {
    const adjustedTemplates = oneInOneOutSmartScriptPack.setupTemplates.filter((template) =>
      template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'fanggu-outsider'),
    )

    expect(adjustedTemplates).toHaveLength(6)
    expect(adjustedTemplates.every((template) => template.roles.includes('fanggu'))).toBe(true)
    expect(oneInOneOutSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'village-idiot-extra',
      'ogre-alignment',
      'mezepheles-turns-evil',
      'kazali-minion-selection',
      'fanggu-outsider',
      'spirit-of-ivory-extra-evil-limit',
    ])
  })
})
