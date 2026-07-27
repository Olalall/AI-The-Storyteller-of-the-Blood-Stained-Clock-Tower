import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { shengRiYanHuiSmartScriptPack } from './index'

describe('shengRiYanHuiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(shengRiYanHuiSmartScriptPack.scriptId).toBe("sheng-ri-yan-hui")
    expect(shengRiYanHuiSmartScriptPack.displayName).toBe("生日宴会！")
    expect(shengRiYanHuiSmartScriptPack.source.contentHash).toBe("sha256:8fcf5a525879f75f451f2243f75499479f73481d1c2da667040f291b6f1e99f0")
    expect(shengRiYanHuiSmartScriptPack.roles).toHaveLength(25)
    const roleIds = shengRiYanHuiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('devilsadvocate')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).not.toContain('devils_advocate')
    expect(roleIds).not.toContain('fang_gu')
  })
  it('uses source night order for opening and later nights', () => {
    const firstNight = shengRiYanHuiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = shengRiYanHuiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('king')
    expect(firstNight).toContain('sailor')
    expect(firstNight).toContain('lleech')
    expect(firstNight).toContain('cerenovus')
    expect(otherNight).toContain('sailor')
    expect(otherNight).toContain('gambler')
    expect(otherNight).toContain('fanggu')
    expect(otherNight).toContain('oracle')
  })
  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(shengRiYanHuiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(shengRiYanHuiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of shengRiYanHuiSmartScriptPack.setupTemplates) expect(validateTemplateComposition(shengRiYanHuiSmartScriptPack, template).valid, template.templateId).toBe(true)
  })
  it('keeps disruptive setup paths out of first normal templates', () => {
    const templateRoles = new Set(shengRiYanHuiSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['choirboy', 'drunk', 'godfather', 'vigormortis', 'fanggu']) expect(templateRoles.has(roleId)).toBe(false)
  })
  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(shengRiYanHuiSmartScriptPack.roles.map((role) => role.id))
    for (const template of shengRiYanHuiSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), template.templateId).toBe(true)
        expect(template.roles.includes(bluff), template.templateId).toBe(false)
      }
    }
  })
})
