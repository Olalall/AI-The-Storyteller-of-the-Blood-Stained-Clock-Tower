import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yiChuHaoXiLaoHuaDengSmartScriptPack } from './index'

describe('yiChuHaoXiLaoHuaDengSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(yiChuHaoXiLaoHuaDengSmartScriptPack.scriptId).toBe('yi-chu-hao-xi-lao-hua-deng')
    expect(yiChuHaoXiLaoHuaDengSmartScriptPack.displayName).toBe('一出好戏（老华灯）')
    expect(yiChuHaoXiLaoHuaDengSmartScriptPack.source.contentHash).toBe('sha256:d8e42e8f8cbc2fe7104d09543c466cf4d2d9f5aa14708aa938882561f25cfe3d')
    expect(yiChuHaoXiLaoHuaDengSmartScriptPack.roles).toHaveLength(28)
    const roleIds = yiChuHaoXiLaoHuaDengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('diaoyuweng')
    expect(roleIds).toContain('xizi')
    expect(roleIds).toContain('hundun')
    expect(roleIds).toContain('sihuoshangren_fabled')
  })

  it('keeps source night order and high-risk reminders available', () => {
    const firstNight = yiChuHaoXiLaoHuaDengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = yiChuHaoXiLaoHuaDengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('diaoyuweng')
    expect(firstNight).toContain('xizi')
    expect(otherNight).toContain('qiongqi')
    expect(otherNight).toContain('hundun')
    expect(yiChuHaoXiLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('atheist')
    expect(yiChuHaoXiLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('legion')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(yiChuHaoXiLaoHuaDengSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(yiChuHaoXiLaoHuaDengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of yiChuHaoXiLaoHuaDengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(yiChuHaoXiLaoHuaDengSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('atheist')
      expect(template.roles).not.toContain('xizi')
      expect(template.roles).not.toContain('legion')
      expect(template.roles).not.toContain('sihuoshangren_fabled')
    }
  })
})
