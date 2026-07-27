import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates'
import { createScriptRegistry } from '../../registry'
import { insanityAndIntuitionSmartScriptPack } from '.'

describe('Insanity and Intuition smart script pack', () => {
  it('registers as a playable second-batch community pack', () => {
    const registry = createScriptRegistry([insanityAndIntuitionSmartScriptPack])

    expect(registry.get('insanity-and-intuition')).toBe(insanityAndIntuitionSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([insanityAndIntuitionSmartScriptPack])
    expect(insanityAndIntuitionSmartScriptPack.knowledgeStatus).toBe('needs-review')
    expect(insanityAndIntuitionSmartScriptPack.source.contentHash).toBe(
      'sha256:227279b78329fb27c3b2690503a0dc929f3db34073b8db8bb5b2b0005b63f399',
    )
    expect(insanityAndIntuitionSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('reuses existing role facts and adds three local Carousel role facts', () => {
    expect(insanityAndIntuitionSmartScriptPack.roles).toHaveLength(25)
    expect(insanityAndIntuitionSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(insanityAndIntuitionSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('poppygrower')?.name).toBe('罂粟种植者')
    expect(byId.get('plaguedoctor')?.research?.possibleOutcomes[0]).toContain('说书人获得一个爪牙能力')
    expect(byId.get('boomdandy')?.research?.stateChanges[0]).toContain('大量玩家死亡')
    expect(byId.get('fanggu')?.research?.setupImpact.length).toBeGreaterThan(0)
  })

  it('uses the official filtered night sheet order', () => {
    expect(insanityAndIntuitionSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'poppygrower',
      'lunatic',
      'preacher',
      'poisoner',
      'cerenovus',
      'harpy',
      'pixie',
      'amnesiac',
      'fortuneteller',
      'knight',
      'shugenja',
      'highpriestess',
      'general',
    ])
    expect(insanityAndIntuitionSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'poppygrower',
      'preacher',
      'poisoner',
      'cerenovus',
      'harpy',
      'lunatic',
      'imp',
      'fanggu',
      'nodashii',
      'vigormortis',
      'plaguedoctor',
      'amnesiac',
      'ravenkeeper',
      'fortuneteller',
      'towncrier',
      'oracle',
      'highpriestess',
      'general',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = insanityAndIntuitionSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(insanityAndIntuitionSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(insanityAndIntuitionSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(insanityAndIntuitionSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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
    const roleIds = new Set(insanityAndIntuitionSmartScriptPack.roles.map((role) => role.id))

    for (const template of insanityAndIntuitionSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks Fang Gu and Vigormortis setup adjustments explicitly', () => {
    const fangGuTemplates = insanityAndIntuitionSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('fanggu'),
    )
    const vigormortisTemplates = insanityAndIntuitionSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('vigormortis'),
    )

    expect(fangGuTemplates).toHaveLength(5)
    expect(fangGuTemplates.every((template) => template.setupAdjustments?.[0]?.ruleId === 'fanggu-outsider')).toBe(true)
    expect(vigormortisTemplates).toHaveLength(3)
    expect(
      vigormortisTemplates.every((template) => template.setupAdjustments?.[0]?.ruleId === 'vigormortis-outsider'),
    ).toBe(true)
  })
})
