import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { douShiQiYuanLaoHuaDengSmartScriptPack } from './index'

describe('douShiQiYuanLaoHuaDengSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(douShiQiYuanLaoHuaDengSmartScriptPack.scriptId).toBe('dou-shi-qi-yuan-lao-hua-deng')
    expect(douShiQiYuanLaoHuaDengSmartScriptPack.displayName).toBe('窦氏奇冤（老华灯）')
    expect(douShiQiYuanLaoHuaDengSmartScriptPack.source.contentHash).toBe('sha256:8d1bceb51afacb5482ccc601119550a03ae23044ae4217dad8fa2cfd68845e4e')
    expect(douShiQiYuanLaoHuaDengSmartScriptPack.roles).toHaveLength(32)
    const roleIds = douShiQiYuanLaoHuaDengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('dianyuzhang')
    expect(roleIds).toContain('taowu')
    expect(roleIds).toContain('gudiao')
    expect(roleIds).toContain('spiritofivory')
  })

  it('keeps source night order and setup reminders available', () => {
    const firstNight = douShiQiYuanLaoHuaDengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = douShiQiYuanLaoHuaDengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('lunatic')
    expect(firstNight).toContain('humeiniang')
    expect(otherNight).toContain('dianyuzhang')
    expect(otherNight).toContain('taowu')
    expect(douShiQiYuanLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('fanggu')
    expect(douShiQiYuanLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('spiritofivory')
  })

  it('offers verified 7-15 player templates without Travelers or Fabled seats', () => {
    expect(douShiQiYuanLaoHuaDengSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(douShiQiYuanLaoHuaDengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of douShiQiYuanLaoHuaDengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(douShiQiYuanLaoHuaDengSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('harlot')
      expect(template.roles).not.toContain('spiritofivory')
      expect(template.bluffs).not.toContain('djinn')
    }
  })
})
