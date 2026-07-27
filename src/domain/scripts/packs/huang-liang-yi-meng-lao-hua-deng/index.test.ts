import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { huangLiangYiMengLaoHuaDengSmartScriptPack } from './index'

describe('huangLiangYiMengLaoHuaDengSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.scriptId).toBe('huang-liang-yi-meng-lao-hua-deng')
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.displayName).toBe('黄粱一梦')
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.source.contentHash).toBe('sha256:fd3564ecc8a20be34b049873590d5e75beaa085e64445c8bae3f3104e5448350')
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.roles).toHaveLength(26)
    const roleIds = huangLiangYiMengLaoHuaDengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('langzhong')
    expect(roleIds).toContain('bianlianshi')
    expect(roleIds).toContain('wudaozhe')
    expect(roleIds).toContain('rumengren_fabled')
  })

  it('keeps source night order and setup reminders available', () => {
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('qianke')
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('wudaozhe')
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('fanggu')
  })

  it('offers verified 7-15 player templates without Fabled seats', () => {
    expect(huangLiangYiMengLaoHuaDengSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(huangLiangYiMengLaoHuaDengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of huangLiangYiMengLaoHuaDengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(huangLiangYiMengLaoHuaDengSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('rumengren_fabled')
      expect(template.bluffs).not.toContain('rumengren_fabled')
    }
  })
})
