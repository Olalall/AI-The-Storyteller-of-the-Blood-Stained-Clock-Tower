import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { shengDanYeJingHunSmartScriptPack } from './index'

describe('shengDanYeJingHunSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(shengDanYeJingHunSmartScriptPack.scriptId).toBe("sheng-dan-ye-jing-hun")
    expect(shengDanYeJingHunSmartScriptPack.displayName).toBe("圣诞夜惊魂")
    expect(shengDanYeJingHunSmartScriptPack.source.contentHash).toBe("sha256:ac28f4bd2828f00386ad14d3854e919065a4de474365c410830bb48ee8e19b18")
    expect(shengDanYeJingHunSmartScriptPack.roles).toHaveLength(26)
    const roleIds = shengDanYeJingHunSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('noble')
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('balloonist')
    expect(roleIds).toContain('ban_shou_ren')
    expect(roleIds).toContain('shen_mi_xue_jia')
    expect(roleIds).toContain('goon')
    expect(roleIds).toContain('wei_zheng_tian_cai')
    expect(roleIds).toContain('guai_dao')
    expect(roleIds).toContain('ren_zhi_xian_sheng')
    expect(roleIds).toContain('kazali')
    expect(roleIds).toContain('leviathan')
  })

  it('uses source night order for opening and later nights', () => {
    expect(shengDanYeJingHunSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('kazali')
    expect(shengDanYeJingHunSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('balloonist')
    expect(shengDanYeJingHunSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('hatter')
    expect(shengDanYeJingHunSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('leviathan')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(shengDanYeJingHunSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(shengDanYeJingHunSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of shengDanYeJingHunSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(shengDanYeJingHunSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing paths out of first normal templates', () => {
    const templateRoles = new Set(shengDanYeJingHunSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('djinn')).toBe(false)
    expect(templateRoles.has('balloonist')).toBe(false)
    expect(templateRoles.has('shen_mi_xue_jia')).toBe(false)
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('ren_zhi_xian_sheng')).toBe(false)
    expect(templateRoles.has('kazali')).toBe(false)
  })
})
