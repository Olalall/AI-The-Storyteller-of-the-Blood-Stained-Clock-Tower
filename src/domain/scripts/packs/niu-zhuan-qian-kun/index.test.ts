import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { niuZhuanQianKunSmartScriptPack } from './index'

describe('niuZhuanQianKunSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(niuZhuanQianKunSmartScriptPack.scriptId).toBe('niu-zhuan-qian-kun')
    expect(niuZhuanQianKunSmartScriptPack.displayName).toBe("扭转乾坤")
    expect(niuZhuanQianKunSmartScriptPack.source.contentHash).toBe('sha256:db75793c58d8678f614a8f6aa2d990485c5e46aebe538b1ed1e566a8bd2543a0')
    expect(niuZhuanQianKunSmartScriptPack.roles).toHaveLength(34)
    const roleIds = niuZhuanQianKunSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('wendaoren')
    expect(roleIds).toContain('jingzhongmo')
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('barista')
  })

  it('keeps source night order and setup reminders available', () => {
    const firstNight = niuZhuanQianKunSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = niuZhuanQianKunSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('jingzhongmo')
    expect(firstNight).toContain('philosopher')
    expect(otherNight).toContain('snakecharmer')
    expect(otherNight).toContain('vigormortis')
    expect(niuZhuanQianKunSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('atheist')
    expect(niuZhuanQianKunSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('jingzhongmo')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(niuZhuanQianKunSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(niuZhuanQianKunSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of niuZhuanQianKunSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(niuZhuanQianKunSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('atheist')
      expect(template.roles).not.toContain('drunk')
      expect(template.roles).not.toContain('balloonist')
      expect(template.roles).not.toContain('jingzhongmo')
      expect(template.roles).not.toContain('vigormortis')
      expect(template.roles).not.toContain('thief')
    }
  })
})
