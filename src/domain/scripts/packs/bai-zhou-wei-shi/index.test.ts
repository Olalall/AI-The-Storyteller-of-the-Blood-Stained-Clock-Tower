import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { baiZhouWeiShiSmartScriptPack } from './index'

describe('baiZhouWeiShiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(baiZhouWeiShiSmartScriptPack.scriptId).toBe("bai-zhou-wei-shi")
    expect(baiZhouWeiShiSmartScriptPack.displayName).toBe("白昼为市")
    expect(baiZhouWeiShiSmartScriptPack.source.contentHash).toBe('sha256:fe227f4a0f84c11988524c39fdf76038f0fc7922c8e90a8fb07da30e379df27a')
    expect(baiZhouWeiShiSmartScriptPack.roles).toHaveLength(25)
    const roleIds = baiZhouWeiShiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('daoke')
    expect(roleIds).toContain('bingbi')
    expect(roleIds).toContain('chiren')
    expect(roleIds).toContain('kazali')
    expect(roleIds).toContain('yaggababble')
    expect(roleIds).toContain('scarletwoman')
    expect(roleIds).not.toContain('21285_11255')
    expect(roleIds).not.toContain('fortune_teller')
  })

  it('uses source night order for opening and later nights', () => {
    expect(baiZhouWeiShiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('kazali')
    expect(baiZhouWeiShiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('yaggababble')
    expect(baiZhouWeiShiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gudiao')
    expect(baiZhouWeiShiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('jinyiwei')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(baiZhouWeiShiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(baiZhouWeiShiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of baiZhouWeiShiSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(baiZhouWeiShiSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps special setup paths out of first normal templates', () => {
    expect(baiZhouWeiShiSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('atheist-special-setup')
    expect(baiZhouWeiShiSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('kazali-minion-outsider-setup')
    expect(baiZhouWeiShiSmartScriptPack.setupTemplates.some((template) => template.roles.includes('atheist'))).toBe(false)
    expect(baiZhouWeiShiSmartScriptPack.setupTemplates.some((template) => template.roles.includes('kazali'))).toBe(false)
  })
})
