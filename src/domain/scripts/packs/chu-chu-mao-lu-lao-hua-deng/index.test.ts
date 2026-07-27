import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { chuChuMaoLuLaoHuaDengSmartScriptPack } from './index'

describe('chuChuMaoLuLaoHuaDengSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(chuChuMaoLuLaoHuaDengSmartScriptPack.scriptId).toBe('chu-chu-mao-lu-lao-hua-deng')
    expect(chuChuMaoLuLaoHuaDengSmartScriptPack.displayName).toBe('初出茅庐（老华灯）')
    expect(chuChuMaoLuLaoHuaDengSmartScriptPack.source.contentHash).toBe('sha256:f00e5c089419461ed644735950f9f0cf03797d094ae4701368872e7e793a0ec6')
    expect(chuChuMaoLuLaoHuaDengSmartScriptPack.roles).toHaveLength(27)
    const roleIds = chuChuMaoLuLaoHuaDengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('daoshi')
    expect(roleIds).toContain('yangguren')
    expect(roleIds).toContain('taowu')
    expect(roleIds).toContain('huangchengsi_fabled')
  })

  it('keeps source night order and high-risk reminders available', () => {
    const firstNight = chuChuMaoLuLaoHuaDengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = chuChuMaoLuLaoHuaDengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('lleech')
    expect(firstNight).toContain('godfather')
    expect(otherNight).toContain('taowu')
    expect(otherNight).toContain('yangguren')
    expect(chuChuMaoLuLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('drunk')
    expect(chuChuMaoLuLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('godfather')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(chuChuMaoLuLaoHuaDengSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(chuChuMaoLuLaoHuaDengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of chuChuMaoLuLaoHuaDengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(chuChuMaoLuLaoHuaDengSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('drunk')
      expect(template.roles).not.toContain('taowu')
      expect(template.roles).not.toContain('sihuoshangren_fabled')
    }
  })
})
