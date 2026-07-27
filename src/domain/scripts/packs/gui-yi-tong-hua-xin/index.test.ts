import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { guiYiTongHuaXinSmartScriptPack } from './index'

describe('guiYiTongHuaXinSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(guiYiTongHuaXinSmartScriptPack.scriptId).toBe('gui-yi-tong-hua-xin')
    expect(guiYiTongHuaXinSmartScriptPack.displayName).toBe("诡异童话-新")
    expect(guiYiTongHuaXinSmartScriptPack.source.contentHash).toBe('sha256:5f40f34c79c1208e1587e3f9bf7301c316c50f89452e23295398b992a716905b')
    expect(guiYiTongHuaXinSmartScriptPack.roles).toHaveLength(31)
    const roleIds = guiYiTongHuaXinSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('shuang_gongzhu')
    expect(roleIds).toContain('chuidiren')
    expect(roleIds).toContain('yaga_baba')
    expect(roleIds).toContain('mojing')
  })

  it('keeps source night order and setup reminders available', () => {
    const firstNight = guiYiTongHuaXinSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = guiYiTongHuaXinSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('yaga_baba')
    expect(firstNight).toContain('shuang_gongzhu')
    expect(otherNight).toContain('alice')
    expect(otherNight).toContain('hongtao_wanghou')
    expect(guiYiTongHuaXinSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('chuidiren')
    expect(guiYiTongHuaXinSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('yaga_baba')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(guiYiTongHuaXinSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(guiYiTongHuaXinSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of guiYiTongHuaXinSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(guiYiTongHuaXinSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('shuang_gongzhu')
      expect(template.roles).not.toContain('chuidiren')
      expect(template.roles).not.toContain('yaga_baba')
      expect(template.roles).not.toContain('wanghou_faling')
      expect(template.roles).not.toContain('shrek')
    }
  })
})
