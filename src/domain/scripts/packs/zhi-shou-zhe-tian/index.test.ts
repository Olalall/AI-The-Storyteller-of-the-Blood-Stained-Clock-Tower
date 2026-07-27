import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { zhiShouZheTianSmartScriptPack } from './index'

describe('zhiShouZheTianSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(zhiShouZheTianSmartScriptPack.scriptId).toBe("zhi-shou-zhe-tian")
    expect(zhiShouZheTianSmartScriptPack.displayName).toBe("只手遮天")
    expect(zhiShouZheTianSmartScriptPack.source.contentHash).toBe('sha256:4238810a6fb68f2daa965e332d1be23dd5f61299b49bd179a6937dd2692e68d2')
    expect(zhiShouZheTianSmartScriptPack.roles).toHaveLength(25)
    const roleIds = zhiShouZheTianSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('nodashii')
    expect(roleIds).toContain('alhadikhia')
    expect(roleIds).toContain('lleech')
    expect(roleIds).toContain('pukka')
    expect(roleIds).toContain('vizier')
    expect(roleIds).toContain('devilsadvocate')
    expect(roleIds).toContain('tealady')
    expect(roleIds).not.toContain('no_dashii')
    expect(roleIds).not.toContain('al-hadikhia')
    expect(roleIds).not.toContain('devils_advocate')
    expect(roleIds).not.toContain('tea_lady')
  })

  it('uses source night order for opening and later nights', () => {
    expect(zhiShouZheTianSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('philosopher')
    expect(zhiShouZheTianSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('lleech')
    expect(zhiShouZheTianSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('vizier')
    expect(zhiShouZheTianSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gambler')
    expect(zhiShouZheTianSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pukka')
    expect(zhiShouZheTianSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('alhadikhia')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(zhiShouZheTianSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(zhiShouZheTianSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of zhiShouZheTianSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(zhiShouZheTianSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing paths out of first normal templates', () => {
    const templateRoles = new Set(zhiShouZheTianSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('godfather')).toBe(false)
  })
})
