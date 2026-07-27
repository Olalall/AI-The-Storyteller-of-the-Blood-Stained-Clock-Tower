import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { guLaoMoFaSmartScriptPack } from './index'

describe('guLaoMoFaSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(guLaoMoFaSmartScriptPack.scriptId).toBe('gu-lao-mo-fa')
    expect(guLaoMoFaSmartScriptPack.displayName).toBe('古老魔法')
    expect(guLaoMoFaSmartScriptPack.source.contentHash).toBe('sha256:2d2bc11a6b99f56ab6da5aec51c9a68797a955be7d4021a4263242db5bc46924')
    expect(guLaoMoFaSmartScriptPack.roles).toHaveLength(25)
    const roleIds = guLaoMoFaSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('miao_si')
    expect(roleIds).toContain('sheng_xiang_shou_wei')
    expect(roleIds).toContain('ye_mo')
    expect(roleIds).toContain('feng_di_shou')
  })

  it('uses source night order for opening and later nights', () => {
    expect(guLaoMoFaSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('kui_lei_shi')
    expect(guLaoMoFaSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('miao_si')
    expect(guLaoMoFaSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('sheng_xiang_shou_wei')
    expect(guLaoMoFaSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('xie_shu_shi')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(guLaoMoFaSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(guLaoMoFaSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of guLaoMoFaSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(guLaoMoFaSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing demons out of first normal templates', () => {
    const templateRoles = new Set(guLaoMoFaSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('di_wang')).toBe(false)
    expect(templateRoles.has('feng_di_shou')).toBe(false)
  })
})
