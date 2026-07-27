import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates'
import { createScriptRegistry } from '../../registry'
import { uncertainDeathSmartScriptPack } from '.'

describe('Uncertain Death smart script pack', () => {
  it('registers as a playable second-batch community pack', () => {
    const registry = createScriptRegistry([uncertainDeathSmartScriptPack])

    expect(registry.get('uncertain-death')).toBe(uncertainDeathSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([uncertainDeathSmartScriptPack])
    expect(uncertainDeathSmartScriptPack.knowledgeStatus).toBe('needs-review')
    expect(uncertainDeathSmartScriptPack.source.contentHash).toBe(
      'sha256:05d854f75fb7ea6821b111368ad2c9d55ee5b736cc44578eea1bb84e8b0d6e2c',
    )
    expect(uncertainDeathSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('reuses confirmed base-edition role facts without copying a second role source', () => {
    expect(uncertainDeathSmartScriptPack.roles).toHaveLength(23)
    expect(uncertainDeathSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(uncertainDeathSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('pukka')?.research?.stateChanges.length).toBeGreaterThan(0)
    expect(byId.get('nodashii')?.research?.stateChanges.length).toBeGreaterThan(0)
    expect(byId.get('marionette')?.research?.setupImpact.length).toBeGreaterThan(0)
    expect(byId.get('marionette')?.research?.highRiskNotes.length).toBeGreaterThan(0)
    expect(byId.get('lunatic')?.research?.possibleOutcomes.length).toBeGreaterThan(0)
  })

  it('uses the official filtered night sheet order', () => {
    expect(uncertainDeathSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'lunatic',
      'marionette',
      'godfather',
      'pukka',
      'librarian',
      'empath',
      'fortuneteller',
      'grandmother',
      'clockmaker',
      'seamstress',
    ])
    expect(uncertainDeathSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'monk',
      'scarletwoman',
      'lunatic',
      'exorcist',
      'pukka',
      'nodashii',
      'assassin',
      'godfather',
      'sweetheart',
      'grandmother',
      'empath',
      'fortuneteller',
      'undertaker',
      'flowergirl',
      'oracle',
      'seamstress',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = uncertainDeathSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(uncertainDeathSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(uncertainDeathSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(uncertainDeathSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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
    const roleIds = new Set(uncertainDeathSmartScriptPack.roles.map((role) => role.id))

    for (const template of uncertainDeathSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks every Godfather template with an explicit outsider setup adjustment', () => {
    const godfatherTemplates = uncertainDeathSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('godfather'),
    )

    expect(godfatherTemplates).toHaveLength(11)
    expect(
      godfatherTemplates.every((template) => template.setupAdjustments?.[0]?.ruleId === 'godfather-outsider-adjustment'),
    ).toBe(true)
    expect(godfatherTemplates.some((template) => template.setupAdjustments?.[0]?.choiceId === 'add-one-outsider')).toBe(
      true,
    )
    expect(
      godfatherTemplates.some((template) => template.setupAdjustments?.[0]?.choiceId === 'remove-one-outsider'),
    ).toBe(true)
  })
})
