import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { manTangHongSmartScriptPack } from './index'

describe('manTangHongSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(manTangHongSmartScriptPack.scriptId).toBe("man-tang-hong")
    expect(manTangHongSmartScriptPack.displayName).toBe("满堂红")
    expect(manTangHongSmartScriptPack.source.contentHash).toBe('sha256:02e9b0b0559b4d5e755fd0e324e54c8aa5fa73d2d497b732e6ef75c5baeaa05f')
    expect(manTangHongSmartScriptPack.roles).toHaveLength(26)
    const roleIds = manTangHongSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain("yanshi")
    expect(roleIds).toContain("pithag")
    expect(roleIds).toContain("lilmonsta")
    expect(roleIds).toContain("towncrier")
    expect(roleIds).not.toContain("21264_11185")
    expect(roleIds).not.toContain("pit-hag")
    expect(roleIds).not.toContain("lil_monsta")
    expect(roleIds).not.toContain("town_crier")
  })

  it('uses source night order for opening and later nights', () => {
    expect(manTangHongSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain("noble")
    expect(manTangHongSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain("chef")
    expect(manTangHongSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain("towncrier")
    expect(manTangHongSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain("pithag")
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(manTangHongSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(manTangHongSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of manTangHongSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(manTangHongSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps special setup paths out of first normal templates', () => {
    expect(manTangHongSmartScriptPack.setupRules.map((rule) => rule.id)).toContain("godfather-outsider-setup")
    expect(manTangHongSmartScriptPack.setupRules.map((rule) => rule.id)).toContain("lilmonsta-special-setup")
    expect(manTangHongSmartScriptPack.setupTemplates.some((template) => template.roles.includes("godfather"))).toBe(false)
    expect(manTangHongSmartScriptPack.setupTemplates.some((template) => template.roles.includes("lilmonsta"))).toBe(false)
  })
})
