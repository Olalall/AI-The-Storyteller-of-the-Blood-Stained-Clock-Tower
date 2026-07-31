import { describe, expect, it } from 'vitest'
import { setupRolesForScript } from '../../catalog'
import { createScriptRegistry } from '../../registry'
import { validateTemplateComposition } from '../../../setup-templates'
import { hideAndSeekSmartScriptPack } from '.'

describe('Hide & Seek smart script pack', () => {
  it('registers as a playable TPI Recommended pack with a verified source', () => {
    const registry = createScriptRegistry([hideAndSeekSmartScriptPack])

    expect(registry.get('hide-and-seek')).toBe(hideAndSeekSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([hideAndSeekSmartScriptPack])
    expect(hideAndSeekSmartScriptPack.knowledgeStatus).toBe('confirmed')
    expect(hideAndSeekSmartScriptPack.source.contentHash).toBe(
      'sha256:d50e711952349f51adc87356c2a3a1e29991bc131b906a5c49a795fd50f9c823',
    )
    expect(hideAndSeekSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps all role facts confirmed and setup-counted', () => {
    expect(hideAndSeekSmartScriptPack.roles).toHaveLength(25)
    expect(hideAndSeekSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)
    expect(setupRolesForScript('hide-and-seek')).toHaveLength(25)

    const byId = new Map(hideAndSeekSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('pixie')?.research?.highRiskNotes[0]).toContain('不能泄漏')
    expect(byId.get('damsel')?.research?.highRiskNotes[0]).toContain('胜负必须由说书人确认')
    expect(byId.get('huntsman')?.research?.identityChanges[0]).toContain('落难少女')
    expect(byId.get('mezepheles')?.research?.teamChanges[0]).toContain('善良玩家变为邪恶')
  })

  it('uses the official filtered night sheet order', () => {
    expect(hideAndSeekSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'preacher',
      'poisoner',
      'godfather',
      'cerenovus',
      'mezepheles',
      'pukka',
      'pixie',
      'huntsman',
      'damsel',
      'librarian',
      'dreamer',
      'seamstress',
      'noble',
    ])
    expect(hideAndSeekSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'preacher',
      'poisoner',
      'cerenovus',
      'mezepheles',
      'imp',
      'pukka',
      'vigormortis',
      'ojo',
      'godfather',
      'huntsman',
      'damsel',
      'ravenkeeper',
      'undertaker',
      'dreamer',
      'towncrier',
      'oracle',
      'seamstress',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = hideAndSeekSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(hideAndSeekSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(hideAndSeekSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(hideAndSeekSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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

  it('keeps bluffs absent and marks high-risk setup adjustments explicitly', () => {
    const roleIds = new Set(hideAndSeekSmartScriptPack.roles.map((role) => role.id))

    for (const template of hideAndSeekSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }

    const huntsmanTemplates = hideAndSeekSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('huntsman'),
    )
    const godfatherTemplates = hideAndSeekSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('godfather'),
    )
    const vigormortisTemplates = hideAndSeekSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('vigormortis'),
    )

    expect(huntsmanTemplates.every((template) => template.roles.includes('damsel'))).toBe(true)
    expect(
      huntsmanTemplates.every((template) =>
        template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'huntsman-adds-damsel'),
      ),
    ).toBe(true)
    expect(
      godfatherTemplates.every((template) =>
        template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'godfather-outsider'),
      ),
    ).toBe(true)
    expect(
      vigormortisTemplates.every((template) =>
        template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'vigormortis-outsider'),
      ),
    ).toBe(true)
    expect(hideAndSeekSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'huntsman-adds-damsel',
      'godfather-outsider',
      'vigormortis-outsider',
      'pixie-in-play-townfolk',
      'mezepheles-turns-evil',
      'damsel-minion-guess',
    ])
  })
})
