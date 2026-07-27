import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yuGaiMiZhangSmartScriptPack } from './index'

describe('yuGaiMiZhangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(yuGaiMiZhangSmartScriptPack.scriptId).toBe("yu-gai-mi-zhang")
    expect(yuGaiMiZhangSmartScriptPack.displayName).toBe("欲盖弥彰")
    expect(yuGaiMiZhangSmartScriptPack.source.contentHash).toBe("sha256:abd6bf76cb4565c25cc7d5feb3bac3eb79f06612c0f49121fed2dbba4e543c47")
    expect(yuGaiMiZhangSmartScriptPack.roles).toHaveLength(24)
    const roleIds = yuGaiMiZhangSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('eviltwin')
    expect(roleIds).toContain('lilmonsta')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('evil_twin')
    expect(roleIds).not.toContain('lil_monsta')
    expect(roleIds).not.toContain('fang_gu')
  })
  it('uses source night order for opening and later nights', () => {
    const firstNight = yuGaiMiZhangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = yuGaiMiZhangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('philosopher')
    expect(firstNight).toContain('lleech')
    expect(firstNight).toContain('widow')
    expect(firstNight).toContain('eviltwin')
    expect(otherNight).toContain('sailor')
    expect(otherNight).toContain('fanggu')
    expect(otherNight).toContain('lilmonsta')
    expect(otherNight).toContain('general')
  })
  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(yuGaiMiZhangSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(yuGaiMiZhangSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of yuGaiMiZhangSmartScriptPack.setupTemplates) expect(validateTemplateComposition(yuGaiMiZhangSmartScriptPack, template).valid, template.templateId).toBe(true)
  })
  it('keeps disruptive setup paths out of first normal templates', () => {
    const templateRoles = new Set(yuGaiMiZhangSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['balloonist', 'drunk', 'fanggu', 'lilmonsta']) expect(templateRoles.has(roleId)).toBe(false)
  })
  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(yuGaiMiZhangSmartScriptPack.roles.map((role) => role.id))
    for (const template of yuGaiMiZhangSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), template.templateId).toBe(true)
        expect(template.roles.includes(bluff), template.templateId).toBe(false)
      }
    }
  })
})
