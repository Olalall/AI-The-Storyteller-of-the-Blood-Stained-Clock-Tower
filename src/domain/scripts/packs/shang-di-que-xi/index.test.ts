import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { shangDiQueXiSmartScriptPack } from './index'

describe('shangDiQueXiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(shangDiQueXiSmartScriptPack.scriptId).toBe("shang-di-que-xi")
    expect(shangDiQueXiSmartScriptPack.displayName).toBe("上帝缺席")
    expect(shangDiQueXiSmartScriptPack.source.contentHash).toBe("sha256:b63d687ab9f3532b9aab1bff3a34e63421170138da782933204689a322b80176")
    expect(shangDiQueXiSmartScriptPack.roles).toHaveLength(25)
    const roleIds = shangDiQueXiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('nodashii')
    expect(roleIds).toContain('scarletwoman')
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('marionette')
    expect(roleIds).not.toContain('no_dashii')
    expect(roleIds).not.toContain('scarlet_woman')
    expect(roleIds).not.toContain('fortune_teller')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = shangDiQueXiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = shangDiQueXiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('marionette')
    expect(firstNight).toContain('poisoner')
    expect(firstNight).toContain('washerwoman')
    expect(firstNight).toContain('chambermaid')
    expect(otherNight).toContain('poisoner')
    expect(otherNight).toContain('gambler')
    expect(otherNight).toContain('pukka')
    expect(otherNight).toContain('nodashii')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(shangDiQueXiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(shangDiQueXiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of shangDiQueXiSmartScriptPack.setupTemplates) expect(validateTemplateComposition(shangDiQueXiSmartScriptPack, template).valid, template.templateId).toBe(true)
  })

  it('keeps hidden identity and disruptive setup paths out of first normal templates unless explicitly adjusted', () => {
    const templateRoles = new Set(shangDiQueXiSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('marionette')).toBe(false)
    expect(templateRoles.has('vigormortis')).toBe(false)
    const godfatherTemplates = shangDiQueXiSmartScriptPack.setupTemplates.filter((template) => template.roles.includes('godfather'))
    expect(godfatherTemplates.length).toBeGreaterThan(0)
    expect(godfatherTemplates.every((template) => template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'godfather-outsider-plus'))).toBe(true)
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(shangDiQueXiSmartScriptPack.roles.map((role) => role.id))
    for (const template of shangDiQueXiSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
