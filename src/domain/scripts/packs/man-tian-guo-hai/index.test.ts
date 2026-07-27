import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { manTianGuoHaiSmartScriptPack } from './index'

describe('manTianGuoHaiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(manTianGuoHaiSmartScriptPack.scriptId).toBe("man-tian-guo-hai")
    expect(manTianGuoHaiSmartScriptPack.displayName).toBe("瞒天过海")
    expect(manTianGuoHaiSmartScriptPack.source.contentHash).toBe("sha256:48542895c7172cde5dda9a88f0ac8600e8a4a17f29a3a4c410070a5c174af841")
    expect(manTianGuoHaiSmartScriptPack.roles).toHaveLength(25)
    const roleIds = manTianGuoHaiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('scarletwoman')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('scarlet_woman')
    expect(roleIds).not.toContain('fang_gu')
    expect(roleIds).not.toContain('no_dashii')
  })
  it('uses source night order for opening and later nights', () => {
    const firstNight = manTianGuoHaiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = manTianGuoHaiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('marionette')
    expect(firstNight).toContain('cerenovus')
    expect(firstNight).toContain('damsel')
    expect(otherNight).toContain('imp')
    expect(otherNight).toContain('fanggu')
    expect(otherNight).toContain('fortuneteller')
    expect(otherNight).toContain('mathematician')
  })
  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(manTianGuoHaiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(manTianGuoHaiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of manTianGuoHaiSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(manTianGuoHaiSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })
  it('keeps disruptive setup paths out of first normal templates', () => {
    const templateRoles = new Set(manTianGuoHaiSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['balloonist', 'huntsman', 'drunk', 'baron', 'fanggu']) expect(templateRoles.has(roleId)).toBe(false)
  })
  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(manTianGuoHaiSmartScriptPack.roles.map((role) => role.id))
    for (const template of manTianGuoHaiSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), template.templateId).toBe(true)
        expect(template.roles.includes(bluff), template.templateId).toBe(false)
      }
    }
  })
})
