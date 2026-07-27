import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { tianTangHuaYuanSmartScriptPack } from './index'

describe('tianTangHuaYuanSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(tianTangHuaYuanSmartScriptPack.scriptId).toBe("tian-tang-hua-yuan")
    expect(tianTangHuaYuanSmartScriptPack.displayName).toBe("天堂花园")
    expect(tianTangHuaYuanSmartScriptPack.source.contentHash).toBe('sha256:f70ddd0ffebd64bbfcc04b30ae9b6d54a91e5da61f55f20b4b8cec379486de39')
    expect(tianTangHuaYuanSmartScriptPack.roles).toHaveLength(24)
    const roleIds = tianTangHuaYuanSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('alhadikhia')
    expect(roleIds).toContain('vizier')
    expect(roleIds).toContain('marionette')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('al-hadikhia')
  })

  it('uses source night order for opening and later nights', () => {
    expect(tianTangHuaYuanSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('philosopher')
    expect(tianTangHuaYuanSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('marionette')
    expect(tianTangHuaYuanSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('vizier')
    expect(tianTangHuaYuanSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gambler')
    expect(tianTangHuaYuanSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('alhadikhia')
    expect(tianTangHuaYuanSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('king')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(tianTangHuaYuanSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(tianTangHuaYuanSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of tianTangHuaYuanSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(tianTangHuaYuanSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup and hidden-identity paths out of first normal templates', () => {
    const templateRoles = new Set(tianTangHuaYuanSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('choirboy')).toBe(false)
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('baron')).toBe(false)
    expect(templateRoles.has('marionette')).toBe(false)
  })
})
