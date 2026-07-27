import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yiYeYuLongWuSmartScriptPack } from './index'

describe('yiYeYuLongWuSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(yiYeYuLongWuSmartScriptPack.scriptId).toBe('yi-ye-yu-long-wu')
    expect(yiYeYuLongWuSmartScriptPack.displayName).toBe('一夜鱼龙舞')
    expect(yiYeYuLongWuSmartScriptPack.source.contentHash).toBe('sha256:586543e427e3cc065ad51b0ee2febe784de85058da5d60f83774c7a9b47b4ac1')
    expect(yiYeYuLongWuSmartScriptPack.roles).toHaveLength(27)
    const roleIds = yiYeYuLongWuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('wushiren')
    expect(roleIds).toContain('wulong_head')
    expect(roleIds).toContain('wulong_tail')
    expect(roleIds).toContain('wulong_body')
    expect(roleIds).toContain('changan_hongcha')
  })

  it('keeps source night order and setup reminders available', () => {
    expect(yiYeYuLongWuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('changan_hongcha')
    expect(yiYeYuLongWuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('wushiren')
    expect(yiYeYuLongWuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('yiye_fangshi')
    expect(yiYeYuLongWuSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('wulong_tail')
    expect(yiYeYuLongWuSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('zhu_yan')
  })

  it('offers verified 7-15 player templates without Traveler/Fabled seats', () => {
    expect(yiYeYuLongWuSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(yiYeYuLongWuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of yiYeYuLongWuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(yiYeYuLongWuSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('wulong_body')
      expect(template.bluffs).not.toContain('wulong_body')
    }
  })
})
