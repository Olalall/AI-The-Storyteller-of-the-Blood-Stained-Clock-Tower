import { describe, expect, it } from 'vitest'
import { createScriptRegistry } from '../../registry'
import { validateTemplateComposition } from '../../../setup-templates'
import { sectsAndVioletsSmartScriptPack } from '.'

describe('Sects & Violets smart script pack', () => {
  it('registers as a playable confirmed official pack', () => {
    const registry = createScriptRegistry([sectsAndVioletsSmartScriptPack])

    expect(registry.get('sects-and-violets')).toBe(sectsAndVioletsSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([sectsAndVioletsSmartScriptPack])
    expect(sectsAndVioletsSmartScriptPack.knowledgeStatus).toBe('confirmed')
    expect(sectsAndVioletsSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts and high-risk rules confirmed from official data', () => {
    expect(sectsAndVioletsSmartScriptPack.roles).toHaveLength(30)
    expect(sectsAndVioletsSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)
    expect(sectsAndVioletsSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'fanggu-outsider',
      'vigormortis-outsider',
      'evil-twin-pair',
      'snakecharmer-swap',
    ])

    const byId = new Map(sectsAndVioletsSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('snakecharmer')?.name).toBe('舞蛇人')
    expect(byId.get('snakecharmer')?.research?.teamChanges).toContain('选择恶魔时，舞蛇人与恶魔交换阵营。')
    expect(byId.get('cerenovus')?.research?.playerMessageTemplates[0]).toContain('疯狂')
    expect(byId.get('fanggu')?.research?.identityChanges).toContain('首次被方古夜晚杀死的外来者变成邪恶方古，原方古死亡。')
  })

  it('uses the official filtered night sheet order', () => {
    expect(sectsAndVioletsSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'barista',
      'philosopher',
      'snakecharmer',
      'eviltwin',
      'witch',
      'cerenovus',
      'clockmaker',
      'dreamer',
      'seamstress',
      'mathematician',
    ])
    expect(sectsAndVioletsSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'barista',
      'harlot',
      'bonecollector',
      'philosopher',
      'snakecharmer',
      'witch',
      'cerenovus',
      'pithag',
      'fanggu',
      'nodashii',
      'vortox',
      'vigormortis',
      'barber',
      'sweetheart',
      'sage',
      'dreamer',
      'flowergirl',
      'towncrier',
      'oracle',
      'seamstress',
      'juggler',
      'mathematician',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = sectsAndVioletsSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(sectsAndVioletsSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(sectsAndVioletsSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(sectsAndVioletsSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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
    const roleIds = new Set(sectsAndVioletsSmartScriptPack.roles.map((role) => role.id))

    for (const template of sectsAndVioletsSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks Fang Gu and Vigormortis templates with explicit outsider adjustments', () => {
    const adjustedTemplates = sectsAndVioletsSmartScriptPack.setupTemplates.filter((template) =>
      template.setupAdjustments && template.setupAdjustments.length > 0,
    )

    expect(adjustedTemplates).toHaveLength(8)
    expect(adjustedTemplates.filter((template) => template.roles.includes('fanggu'))).toHaveLength(6)
    expect(adjustedTemplates.filter((template) => template.roles.includes('vigormortis'))).toHaveLength(2)
  })
})
