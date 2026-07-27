import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { shengShiQiWenSmartScriptPack } from './index'

describe('shengShiQiWenSmartScriptPack', () => {
  it('keeps the locked GStone source hash and custom role mapping', () => {
    expect(shengShiQiWenSmartScriptPack.scriptId).toBe("sheng-shi-qi-wen")
    expect(shengShiQiWenSmartScriptPack.displayName).toBe("盛世奇闻（测试中）")
    expect(shengShiQiWenSmartScriptPack.source.contentHash).toBe("sha256:756e333f2ca244ce903e7f4a51e49bc089f8a0bba5c7c4551787f83617f0d4a3")
    expect(shengShiQiWenSmartScriptPack.roles).toHaveLength(27)
    const roleIds = shengShiQiWenSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('jiubao')
    expect(roleIds).toContain('qiongqi')
    expect(roleIds).toContain('qianke')
    expect(roleIds).toContain('dianxiaoer')
  })

  it('uses source night order for opening and later nights', () => {
    expect(shengShiQiWenSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('heshang')
    expect(shengShiQiWenSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('yinyangshi')
    expect(shengShiQiWenSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('qianke')
    expect(shengShiQiWenSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('dianyuzhang')
  })

  it('provides verified setup templates for all 7-15 player counts without travelers', () => {
    expect(shengShiQiWenSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(shengShiQiWenSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    const roleById = new Map(shengShiQiWenSmartScriptPack.roles.map((role) => [role.id, role]))
    for (const template of shengShiQiWenSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(shengShiQiWenSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles.some((roleId) => roleById.get(roleId)?.team === 'traveler'), template.templateId).toBe(false)
    }
  })

  it('keeps setup-changing paths out of first normal templates', () => {
    const templateRoles = new Set(shengShiQiWenSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('xizi')).toBe(false)
    expect(templateRoles.has('taowu')).toBe(false)
    expect(templateRoles.has('shimengmo')).toBe(false)
    expect(templateRoles.has('niangjiushi')).toBe(false)
  })
})
