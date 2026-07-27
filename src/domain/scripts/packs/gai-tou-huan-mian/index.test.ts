import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { gaiTouHuanMianSmartScriptPack } from './index'

describe('gaiTouHuanMianSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(gaiTouHuanMianSmartScriptPack.scriptId).toBe('gai-tou-huan-mian')
    expect(gaiTouHuanMianSmartScriptPack.displayName).toBe("改头换面")
    expect(gaiTouHuanMianSmartScriptPack.source.contentHash).toBe('sha256:d7833ff494f68c1819ee9ae7c2841c2e3a5b2d8a153d9301e522ba871352c05f')
    expect(gaiTouHuanMianSmartScriptPack.roles).toHaveLength(25)
    const roleIds = gaiTouHuanMianSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('ermu')
    expect(roleIds).toContain('qianmianren')
    expect(roleIds).toContain('shuangtoujiao')
    expect(roleIds).toContain('vigormortis')
  })

  it('keeps source night order and setup reminders available', () => {
    const firstNight = gaiTouHuanMianSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = gaiTouHuanMianSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('poppygrower')
    expect(firstNight).toContain('ermu')
    expect(otherNight).toContain('shuangtoujiao')
    expect(otherNight).toContain('pithag')
    const setupRuleRoleIds = gaiTouHuanMianSmartScriptPack.setupRules.map((rule) =>
      'roleId' in rule ? rule.roleId : undefined,
    )
    expect(setupRuleRoleIds).toContain('atheist')
    expect(setupRuleRoleIds).toContain('shuangtoujiao')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(gaiTouHuanMianSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(gaiTouHuanMianSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of gaiTouHuanMianSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(gaiTouHuanMianSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('atheist')
      expect(template.roles).not.toContain('balloonist')
      expect(template.roles).not.toContain('godfather')
    }
  })
})
