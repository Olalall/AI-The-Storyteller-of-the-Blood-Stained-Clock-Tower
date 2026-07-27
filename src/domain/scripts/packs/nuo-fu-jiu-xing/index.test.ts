import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { nuoFuJiuXingSmartScriptPack } from './index'

describe('nuoFuJiuXingSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(nuoFuJiuXingSmartScriptPack.scriptId).toBe("nuo-fu-jiu-xing")
    expect(nuoFuJiuXingSmartScriptPack.displayName).toBe("懦夫救星")
    expect(nuoFuJiuXingSmartScriptPack.source.contentHash).toBe('sha256:69340c25aae5e3f6503b8210f5435a3eeccbcf92a11516157c6453cd44f11dcf')
    expect(nuoFuJiuXingSmartScriptPack.roles).toHaveLength(27)
    const roleIds = nuoFuJiuXingSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain("harpy")
    expect(roleIds).toContain("aohe")
    expect(roleIds).toContain("kazali")
    expect(roleIds).toContain("yaggababble")
    expect(roleIds).toContain("qilin")
    expect(roleIds).toContain("codyliar")
    expect(roleIds).not.toContain("21232_10810")
    expect(roleIds).not.toContain("21232_10811")
    expect(roleIds).not.toContain("21232_10812")
    expect(roleIds).not.toContain("21232_10813")
    expect(roleIds).not.toContain("21232_10814")
    expect(roleIds).not.toContain("21232_10815")
  })

  it('uses source night order for opening and later nights', () => {
    expect(nuoFuJiuXingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain("kazali")
    expect(nuoFuJiuXingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain("lleech")
    expect(nuoFuJiuXingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain("jinyiwei")
    expect(nuoFuJiuXingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain("harpy")
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(nuoFuJiuXingSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(nuoFuJiuXingSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of nuoFuJiuXingSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(nuoFuJiuXingSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps special setup paths out of first normal templates', () => {
    expect(nuoFuJiuXingSmartScriptPack.setupRules.map((rule) => rule.id)).toContain("kazali-special-setup")
    expect(nuoFuJiuXingSmartScriptPack.setupRules.map((rule) => rule.id)).toContain("lleech-host-poison")
    expect(nuoFuJiuXingSmartScriptPack.setupRules.map((rule) => rule.id)).toContain("harpy-madness-death")
    expect(nuoFuJiuXingSmartScriptPack.setupTemplates.some((template) => template.roles.includes("kazali"))).toBe(false)
    expect(nuoFuJiuXingSmartScriptPack.setupTemplates.some((template) => template.roles.includes("qilin"))).toBe(false)
    expect(nuoFuJiuXingSmartScriptPack.setupTemplates.some((template) => template.roles.includes("codyliar"))).toBe(false)
  })
})
