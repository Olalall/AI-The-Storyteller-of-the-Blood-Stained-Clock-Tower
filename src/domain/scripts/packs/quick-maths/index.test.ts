import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates'
import { createScriptRegistry } from '../../registry'
import { quickMathsSmartScriptPack } from '.'

describe('Quick Maths smart script pack', () => {
  it('registers as a playable Carousel pack with a verified source', () => {
    const registry = createScriptRegistry([quickMathsSmartScriptPack])

    expect(registry.get('quick-maths')).toBe(quickMathsSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([quickMathsSmartScriptPack])
    expect(quickMathsSmartScriptPack.knowledgeStatus).toBe('confirmed')
    expect(quickMathsSmartScriptPack.source.author).toBe('Fran')
    expect(quickMathsSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts confirmed and normalizes High Priestess', () => {
    expect(quickMathsSmartScriptPack.roles).toHaveLength(22)
    expect(quickMathsSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(quickMathsSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.has('high_priestess')).toBe(false)
    expect(byId.get('highpriestess')?.name).toBe('女祭司')
    expect(byId.get('xaan')?.research?.setupImpact[0]).toContain('外来者数量为 X')
    expect(byId.get('boffin')?.research?.highRiskNotes[0]).toContain('不自动执行')
    expect(byId.get('riot')?.research?.highRiskNotes[0]).toContain('必须由说书人确认')
  })

  it('uses the official filtered night sheet order', () => {
    expect(quickMathsSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'boffin',
      'philosopher',
      'snitch',
      'marionette',
      'xaan',
      'pixie',
      'dreamer',
      'seamstress',
      'noble',
      'shugenja',
      'nightwatchman',
      'spy',
      'ogre',
      'highpriestess',
      'general',
    ])
    expect(quickMathsSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'philosopher',
      'xaan',
      'dreamer',
      'seamstress',
      'juggler',
      'nightwatchman',
      'spy',
      'highpriestess',
      'general',
      'riot',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = quickMathsSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(quickMathsSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(quickMathsSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(quickMathsSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(quickMathsSmartScriptPack.roles.map((role) => role.id))

    for (const template of quickMathsSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('keeps Xaan out of zero-outsider templates', () => {
    const zeroOutsiderTemplates = new Set([
      'quick-maths-7-starter-count',
      'quick-maths-7-social-advice',
      'quick-maths-7-public-guess',
      'quick-maths-10-info-two-minions',
      'quick-maths-10-public-pressure',
      'quick-maths-10-boffin-marionette',
      'quick-maths-13-zero-outsider-riot',
      'quick-maths-13-public-zero-outsider',
    ])

    for (const template of quickMathsSmartScriptPack.setupTemplates) {
      if (zeroOutsiderTemplates.has(template.templateId)) expect(template.roles).not.toContain('xaan')
    }
  })

  it('marks setup and high-risk rules explicitly', () => {
    expect(quickMathsSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'snitch-minion-bluffs',
      'xaan-outsider-night',
      'marionette-neighbor-demon',
      'boffin-demon-good-ability',
      'riot-day-three-chain',
      'alsaahir-public-win',
    ])
  })
})
