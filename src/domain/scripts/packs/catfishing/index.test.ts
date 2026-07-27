import { describe, expect, it } from 'vitest'
import { createScriptRegistry } from '../..'
import { catfishingSmartScriptPack } from '.'

describe('catfishing smart script pack draft', () => {
  it('is readable through the smart script registry', () => {
    const registry = createScriptRegistry([catfishingSmartScriptPack])

    expect(registry.get('catfishing')).toBe(catfishingSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([catfishingSmartScriptPack])
  })

  it('keeps the pack needs-review while role facts and template entries are confirmed', () => {
    expect(catfishingSmartScriptPack.knowledgeStatus).toBe('needs-review')
    expect(catfishingSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)
    expect(catfishingSmartScriptPack.setupRules.every((rule) => rule.knowledgeStatus === 'confirmed')).toBe(true)
    expect(catfishingSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
  })

  it('splits roles, night orders, templates, and setup rules in the pack', () => {
    expect(catfishingSmartScriptPack.roles.length).toBe(30)
    expect(catfishingSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(catfishingSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
    expect(catfishingSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
      7, 7, 7,
      8, 8, 8,
      9, 9, 9,
      10, 10, 10,
      11, 11, 11,
      12, 12, 12,
      13, 13, 13,
      14, 14, 14,
      15, 15, 15,
    ])
    expect(catfishingSmartScriptPack.setupRules).toHaveLength(5)
  })

  it('records source-backed high-risk role notes without enabling auto settlement', () => {
    const byId = new Map(catfishingSmartScriptPack.roles.map((role) => [role.id, role]))

    expect(byId.get('snakecharmer')?.abilityText).toContain('swaps characters & alignments')
    expect(byId.get('snakecharmer')?.research?.highRiskNotes).toEqual(
      expect.arrayContaining([expect.stringContaining('never auto-commit')]),
    )
    expect(byId.get('cerenovus')?.abilityText).toContain('mad')
    expect(byId.get('pithag')?.abilityText).toContain('arbitrary')
    expect(byId.get('gambler')?.research?.possibleOutcomes).toEqual(
      expect.arrayContaining([expect.stringContaining('Wrong guess')]),
    )
  })

  it('uses confirmed official night sheet order for Catfishing roles', () => {
    expect(catfishingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('cerenovus')
    expect(catfishingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('amnesiac')
    expect(catfishingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId).slice(0, 4)).toEqual([
      'barista',
      'harlot',
      'bonecollector',
      'philosopher',
    ])
    expect(catfishingSmartScriptPack.nightOrders.otherNight.every((entry) => entry.knowledgeStatus === 'confirmed')).toBe(
      true,
    )
  })
})
