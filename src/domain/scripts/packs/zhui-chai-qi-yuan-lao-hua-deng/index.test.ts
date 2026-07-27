import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { zhuiChaiQiYuanLaoHuaDengSmartScriptPack } from './index'

describe('zhuiChaiQiYuanLaoHuaDengSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(zhuiChaiQiYuanLaoHuaDengSmartScriptPack.scriptId).toBe('zhui-chai-qi-yuan-lao-hua-deng')
    expect(zhuiChaiQiYuanLaoHuaDengSmartScriptPack.displayName).toBe("追钗奇缘（老华灯）")
    expect(zhuiChaiQiYuanLaoHuaDengSmartScriptPack.source.contentHash).toBe('sha256:01b45df6526338eccc06ee94ef771a4daaae2d8d33ddd2a88f2f4f1e719a2551')
    expect(zhuiChaiQiYuanLaoHuaDengSmartScriptPack.roles).toHaveLength(30)
    const roleIds = zhuiChaiQiYuanLaoHuaDengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('qintianjian')
    expect(roleIds).toContain('ganshiren')
    expect(roleIds).toContain('taotie')
    expect(roleIds).toContain('jiaohuazi')
  })

  it('keeps source night order and setup reminders available', () => {
    const firstNight = zhuiChaiQiYuanLaoHuaDengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = zhuiChaiQiYuanLaoHuaDengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('apprentice')
    expect(firstNight).toContain('qintianjian')
    expect(otherNight).toContain('daoshi')
    expect(otherNight).toContain('taotie')
    expect(zhuiChaiQiYuanLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('wudaozhe')
    expect(zhuiChaiQiYuanLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('ganshiren')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(zhuiChaiQiYuanLaoHuaDengSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(zhuiChaiQiYuanLaoHuaDengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of zhuiChaiQiYuanLaoHuaDengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(zhuiChaiQiYuanLaoHuaDengSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('wudaozhe')
      expect(template.roles).not.toContain('ganshiren')
      expect(template.roles).not.toContain('taotie')
      expect(template.roles).not.toContain('bonecollector')
    }
  })
})
