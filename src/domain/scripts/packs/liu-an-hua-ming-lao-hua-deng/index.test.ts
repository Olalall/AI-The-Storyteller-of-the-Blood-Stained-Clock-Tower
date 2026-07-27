import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { liuAnHuaMingLaoHuaDengSmartScriptPack } from './index'

describe('liuAnHuaMingLaoHuaDengSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(liuAnHuaMingLaoHuaDengSmartScriptPack.scriptId).toBe('liu-an-hua-ming-lao-hua-deng')
    expect(liuAnHuaMingLaoHuaDengSmartScriptPack.displayName).toBe("柳暗花明（老华灯）")
    expect(liuAnHuaMingLaoHuaDengSmartScriptPack.source.contentHash).toBe('sha256:f8447f29a882606496b4800d8b01ad0e805bd6378b8aa115bd287643f9af623a')
    expect(liuAnHuaMingLaoHuaDengSmartScriptPack.roles).toHaveLength(25)
    const roleIds = liuAnHuaMingLaoHuaDengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('yinluren')
    expect(roleIds).toContain('gudiao')
    expect(roleIds).toContain('vigormortis')
    expect(roleIds).toContain('vortox')
  })

  it('keeps source night order and setup reminders available', () => {
    const firstNight = liuAnHuaMingLaoHuaDengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = liuAnHuaMingLaoHuaDengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('gudiao')
    expect(firstNight).toContain('widow')
    expect(otherNight).toContain('pukka')
    expect(otherNight).toContain('yinluren')
    const setupRuleRoleIds = liuAnHuaMingLaoHuaDengSmartScriptPack.setupRules.map((rule) => 'roleId' in rule ? rule.roleId : undefined)
    expect(setupRuleRoleIds).toContain('godfather')
    expect(setupRuleRoleIds).toContain('vigormortis')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(liuAnHuaMingLaoHuaDengSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(liuAnHuaMingLaoHuaDengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of liuAnHuaMingLaoHuaDengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(liuAnHuaMingLaoHuaDengSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('drunk')
      expect(template.roles).not.toContain('godfather')
      expect(template.roles).not.toContain('vigormortis')
    }
  })
})
