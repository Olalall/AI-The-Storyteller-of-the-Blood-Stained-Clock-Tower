import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { weiNiDuZunSmartScriptPack } from './index'

describe('weiNiDuZunSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(weiNiDuZunSmartScriptPack.scriptId).toBe('wei-ni-du-zun')
    expect(weiNiDuZunSmartScriptPack.displayName).toBe("唯你独尊")
    expect(weiNiDuZunSmartScriptPack.source.contentHash).toBe('sha256:df85e0e63d8b7853cfc86e0702729d9e3154dfee111e4da02657aa33279f0bd5')
    expect(weiNiDuZunSmartScriptPack.roles).toHaveLength(26)
    const roleIds = weiNiDuZunSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('daoke')
    expect(roleIds).toContain('jingzhongmo')
    expect(roleIds).toContain('cailianjun')
    expect(roleIds).toContain('spiritofivory')
  })

  it('keeps source night order and setup reminders available', () => {
    const firstNight = weiNiDuZunSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = weiNiDuZunSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('jingzhongmo')
    expect(firstNight).toContain('daoke')
    expect(otherNight).toContain('cailianjun')
    expect(otherNight).toContain('cerenovus')
    const setupRuleRoleIds = weiNiDuZunSmartScriptPack.setupRules.map((rule) => 'roleId' in rule ? rule.roleId : undefined)
    expect(setupRuleRoleIds).toContain('atheist')
    expect(setupRuleRoleIds).toContain('jingzhongmo')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(weiNiDuZunSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(weiNiDuZunSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of weiNiDuZunSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(weiNiDuZunSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('atheist')
      expect(template.roles).not.toContain('drunk')
      expect(template.roles).not.toContain('jingzhongmo')
      expect(template.roles).not.toContain('spiritofivory')
    }
  })
})
