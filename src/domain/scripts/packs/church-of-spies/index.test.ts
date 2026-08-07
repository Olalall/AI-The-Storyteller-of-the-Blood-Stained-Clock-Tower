import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates'
import { createScriptRegistry } from '../../registry'
import { churchOfSpiesSmartScriptPack } from '.'

describe('Church of Spies smart script pack', () => {
  it('registers as a playable second-batch community pack', () => {
    const registry = createScriptRegistry([churchOfSpiesSmartScriptPack])

    expect(registry.get('church-of-spies')).toBe(churchOfSpiesSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([churchOfSpiesSmartScriptPack])
    expect(churchOfSpiesSmartScriptPack.knowledgeStatus).toBe('confirmed')
    expect(churchOfSpiesSmartScriptPack.source.contentHash).toBe(
      'sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc',
    )
    expect(churchOfSpiesSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('reuses existing role facts and adds Cult Leader as a single local fact', () => {
    expect(churchOfSpiesSmartScriptPack.roles).toHaveLength(24)
    expect(churchOfSpiesSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(churchOfSpiesSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('cultleader')?.name).toBe('异教领袖')
    expect(byId.get('cultleader')?.research?.teamChanges).toContain('夜晚可能改变阵营。')
    expect(byId.get('baron')?.research?.setupImpact.length).toBeGreaterThan(0)
    expect(byId.get('marionette')?.research?.highRiskNotes.length).toBeGreaterThan(0)
  })

  it('uses the official filtered night sheet order', () => {
    expect(churchOfSpiesSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'marionette',
      'pukka',
      'pixie',
      'librarian',
      'fortuneteller',
      'steward',
      'nightwatchman',
      'cultleader',
      'spy',
      'highpriestess',
    ])
    expect(churchOfSpiesSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'monk',
      'scarletwoman',
      'exorcist',
      'pukka',
      'po',
      'nodashii',
      'ravenkeeper',
      'fortuneteller',
      'undertaker',
      'juggler',
      'nightwatchman',
      'cultleader',
      'spy',
      'highpriestess',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = churchOfSpiesSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(churchOfSpiesSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(churchOfSpiesSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(churchOfSpiesSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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
    const roleIds = new Set(churchOfSpiesSmartScriptPack.roles.map((role) => role.id))

    for (const template of churchOfSpiesSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks every Baron template with the outsider setup adjustment', () => {
    const baronTemplates = churchOfSpiesSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('baron'),
    )

    expect(baronTemplates).toHaveLength(9)
    expect(baronTemplates.every((template) => template.setupAdjustments?.[0]?.ruleId === 'baron-outsiders')).toBe(true)
  })
})
