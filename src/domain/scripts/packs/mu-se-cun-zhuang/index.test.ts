import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { muSeCunZhuangSmartScriptPack } from './index'

describe('muSeCunZhuangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(muSeCunZhuangSmartScriptPack.scriptId).toBe('mu-se-cun-zhuang')
    expect(muSeCunZhuangSmartScriptPack.displayName).toBe('暮色村庄')
    expect(muSeCunZhuangSmartScriptPack.source.contentHash).toBe('sha256:54c163464d9765d5504ff9f1f69e9c5ea2d929eb1c6233b59d48393bb6f7ec3b')
    expect(muSeCunZhuangSmartScriptPack.roles).toHaveLength(30)
    const roleIds = muSeCunZhuangSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('bai_du_ren')
    expect(roleIds).toContain('yin_jun_zi')
    expect(roleIds).toContain('yi_xiang_ren')
    expect(roleIds).toContain('ji_sheng_zhe')
    expect(roleIds).toContain('wen_yi_zhi_yuan')
  })

  it('uses source night order for opening and later nights', () => {
    expect(muSeCunZhuangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('jian_yu_shou_wei')
    expect(muSeCunZhuangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('ji_sheng_zhe')
    expect(muSeCunZhuangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('ji_xing_xiu_nv_zhu_jue')
    expect(muSeCunZhuangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('da_e_mo')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(muSeCunZhuangSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(muSeCunZhuangSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of muSeCunZhuangSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(muSeCunZhuangSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing and special paths out of first normal templates', () => {
    const templateRoles = new Set(muSeCunZhuangSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('bai_du_ren')).toBe(false)
    expect(templateRoles.has('yin_jun_zi')).toBe(false)
    expect(templateRoles.has('ji_xing_xiu_nv_zhu_jue')).toBe(false)
    expect(templateRoles.has('yi_xiang_ren')).toBe(false)
    expect(templateRoles.has('hong_yue_jiao_huang')).toBe(false)
    expect(templateRoles.has('wen_yi_zhi_yuan')).toBe(false)
  })
})
