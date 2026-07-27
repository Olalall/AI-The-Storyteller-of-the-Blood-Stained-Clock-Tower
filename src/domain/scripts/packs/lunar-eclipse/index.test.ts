import { describe, expect, it } from 'vitest'
import { setupRolesForScript } from '../../catalog'
import { createScriptRegistry } from '../../registry'
import { validateTemplateComposition } from '../../../setup-templates'
import { lunarEclipseSmartScriptPack } from '.'

const nonStandardRoleIds = ['barista', 'harlot', 'apprentice', 'beggar', 'voudon', 'spiritofivory']

describe('Lunar Eclipse smart script pack', () => {
  it('registers as a playable TPI Recommended pack that still needs storyteller review', () => {
    const registry = createScriptRegistry([lunarEclipseSmartScriptPack])

    expect(registry.get('lunar-eclipse')).toBe(lunarEclipseSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([lunarEclipseSmartScriptPack])
    expect(lunarEclipseSmartScriptPack.knowledgeStatus).toBe('needs-review')
    expect(lunarEclipseSmartScriptPack.source.contentHash).toBe(
      'sha256:070cb29f3835ee8b19312a6a7d19fe163cb1db3661d679c50f1d6296cbfcbe95',
    )
    expect(lunarEclipseSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts confirmed while excluding travellers and fabled from standard setup roles', () => {
    expect(lunarEclipseSmartScriptPack.roles).toHaveLength(31)
    expect(lunarEclipseSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)
    expect(setupRolesForScript('lunar-eclipse')).toHaveLength(25)

    const byId = new Map(lunarEclipseSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(nonStandardRoleIds.map((roleId) => byId.get(roleId)?.team)).toEqual([
      'traveler',
      'traveler',
      'traveler',
      'traveler',
      'traveler',
      'fabled',
    ])
    expect(setupRolesForScript('lunar-eclipse').map((role) => role.id)).not.toEqual(
      expect.arrayContaining(nonStandardRoleIds),
    )
    expect(byId.get('lunatic')?.research?.highRiskNotes[0]).toContain('不自动造成死亡')
    expect(byId.get('marionette')?.research?.setupImpact[0]).toContain('恶魔相邻')
    expect(byId.get('magician')?.research?.highRiskNotes[0]).toContain('不改变真实身份或阵营')
    expect(byId.get('spiritofivory')?.research?.highRiskNotes[0]).toContain('不进入座位身份')
  })

  it('uses the official filtered night sheet order', () => {
    expect(lunarEclipseSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'apprentice',
      'barista',
      'magician',
      'lunatic',
      'sailor',
      'marionette',
      'godfather',
      'devilsadvocate',
      'pixie',
      'grandmother',
      'spy',
      'chambermaid',
      'mathematician',
    ])
    expect(lunarEclipseSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'barista',
      'harlot',
      'sailor',
      'innkeeper',
      'devilsadvocate',
      'lunatic',
      'lycanthrope',
      'zombuul',
      'nodashii',
      'vigormortis',
      'assassin',
      'godfather',
      'barber',
      'grandmother',
      'spy',
      'chambermaid',
      'mathematician',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = lunarEclipseSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(lunarEclipseSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(lunarEclipseSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(lunarEclipseSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
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

  it('keeps travellers and fabled out of templates and bluffs', () => {
    const roleIds = new Set(lunarEclipseSmartScriptPack.roles.map((role) => role.id))

    for (const template of lunarEclipseSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.roles).not.toEqual(expect.arrayContaining(nonStandardRoleIds))
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs).not.toEqual(expect.arrayContaining(nonStandardRoleIds))
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks Godfather and Vigormortis setup adjustments explicitly', () => {
    const godfatherTemplates = lunarEclipseSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('godfather'),
    )
    const vigormortisTemplates = lunarEclipseSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('vigormortis'),
    )

    expect(godfatherTemplates.length).toBeGreaterThan(0)
    expect(vigormortisTemplates.length).toBeGreaterThan(0)
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
    expect(lunarEclipseSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'godfather-outsider',
      'vigormortis-outsider',
      'marionette-neighbor-demon',
      'magician-info-mask',
      'lunatic-fake-demon',
      'lycanthrope-demon-block',
      'puzzlemaster-drunk',
      'spirit-of-ivory-extra-evil',
      'traveler-fabled-template-exclusion',
    ])
  })
})
