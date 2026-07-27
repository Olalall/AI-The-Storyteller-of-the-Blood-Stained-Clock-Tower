import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { xiaoErShangJiuSmartScriptPack } from './index'

describe('xiaoErShangJiuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(xiaoErShangJiuSmartScriptPack.scriptId).toBe('xiao-er-shang-jiu')
    expect(xiaoErShangJiuSmartScriptPack.displayName).toBe('小二，上酒！')
    expect(xiaoErShangJiuSmartScriptPack.source.contentHash).toBe('sha256:21d1f9c11c95d3150b183f409cb62bd83346d5caa15042ce346a32f0a8c37390')
    expect(xiaoErShangJiuSmartScriptPack.roles).toHaveLength(30)
    const roleIds = xiaoErShangJiuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('shen_suan_meng')
    expect(roleIds).toContain('tang_men')
    expect(roleIds).toContain('ri_yue_shen_jiao')
    expect(roleIds).toContain('bao_bu_tong')
  })

  it('uses source night order for opening and later nights', () => {
    expect(xiaoErShangJiuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('tian_long_jiao')
    expect(xiaoErShangJiuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('long_men_biao_ju')
    expect(xiaoErShangJiuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('yi_pin_tang')
    expect(xiaoErShangJiuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('hua_shan')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(xiaoErShangJiuSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(xiaoErShangJiuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of xiaoErShangJiuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(xiaoErShangJiuSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing, hidden-role and traveler paths out of first normal templates', () => {
    const templateRoles = new Set(xiaoErShangJiuSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('shao_lin')).toBe(false)
    expect(templateRoles.has('tang_men')).toBe(false)
    expect(templateRoles.has('zhong_yuan_miao_jia')).toBe(false)
    expect(templateRoles.has('qi_tu')).toBe(false)
    expect(templateRoles.has('ri_yue_shen_jiao')).toBe(false)
    expect(templateRoles.has('tian_long_jiao')).toBe(false)
    expect(templateRoles.has('mei_dao_wang')).toBe(false)
  })
})
