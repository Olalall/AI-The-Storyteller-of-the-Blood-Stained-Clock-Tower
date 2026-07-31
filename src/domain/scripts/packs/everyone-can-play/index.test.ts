import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates'
import { createScriptRegistry } from '../../registry'
import { everyoneCanPlaySmartScriptPack } from '.'

describe('Everyone Can Play smart script pack', () => {
  it('registers as a playable second-batch community pack', () => {
    const registry = createScriptRegistry([everyoneCanPlaySmartScriptPack])

    expect(registry.get('everyone-can-play')).toBe(everyoneCanPlaySmartScriptPack)
    expect(registry.playableFor(12)).toEqual([everyoneCanPlaySmartScriptPack])
    expect(everyoneCanPlaySmartScriptPack.knowledgeStatus).toBe('confirmed')
    expect(everyoneCanPlaySmartScriptPack.source.contentHash).toBe(
      'sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35',
    )
    expect(everyoneCanPlaySmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('reuses confirmed base-edition role facts without copying a second role source', () => {
    expect(everyoneCanPlaySmartScriptPack.roles).toHaveLength(24)
    expect(everyoneCanPlaySmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(everyoneCanPlaySmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('clockmaker')?.name).toBe('钟表匠')
    expect(byId.get('devilsadvocate')?.research?.stateChanges.length).toBeGreaterThan(0)
    expect(byId.get('scarletwoman')?.research?.identityChanges.length).toBeGreaterThan(0)
    expect(byId.get('scarletwoman')?.research?.sourceUrls.length).toBeGreaterThan(0)
  })

  it('uses the official filtered night sheet order', () => {
    expect(everyoneCanPlaySmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'poisoner',
      'devilsadvocate',
      'librarian',
      'empath',
      'fortuneteller',
      'grandmother',
      'clockmaker',
      'spy',
    ])
    expect(everyoneCanPlaySmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'poisoner',
      'gambler',
      'monk',
      'devilsadvocate',
      'scarletwoman',
      'imp',
      'assassin',
      'moonchild',
      'grandmother',
      'ravenkeeper',
      'empath',
      'fortuneteller',
      'undertaker',
      'spy',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = everyoneCanPlaySmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(everyoneCanPlaySmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(everyoneCanPlaySmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(everyoneCanPlaySmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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
    const roleIds = new Set(everyoneCanPlaySmartScriptPack.roles.map((role) => role.id))

    for (const template of everyoneCanPlaySmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks every Baron template with the outsider setup adjustment', () => {
    const baronTemplates = everyoneCanPlaySmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('baron'),
    )

    expect(baronTemplates).toHaveLength(6)
    expect(baronTemplates.every((template) => template.setupAdjustments?.[0]?.ruleId === 'baron-outsiders')).toBe(true)
  })
})
