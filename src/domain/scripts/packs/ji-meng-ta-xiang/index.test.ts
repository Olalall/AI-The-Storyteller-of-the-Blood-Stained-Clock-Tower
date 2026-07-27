import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { jiMengTaXiangSmartScriptPack } from './index'

describe('jiMengTaXiangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(jiMengTaXiangSmartScriptPack.scriptId).toBe("ji-meng-ta-xiang")
    expect(jiMengTaXiangSmartScriptPack.displayName).toBe("寄梦他乡")
    expect(jiMengTaXiangSmartScriptPack.source.contentHash).toBe('sha256:417d353edf620992fb3822f81bf7e12fd1a722a91ee21cd230a9f04f3d9b4fd7')
    expect(jiMengTaXiangSmartScriptPack.roles).toHaveLength(26)
    const roleIds = jiMengTaXiangSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain("villageidiot")
    expect(roleIds).toContain("plaguedoctor")
    expect(roleIds).toContain("kazali")
    expect(roleIds).toContain("ganshiren")
    expect(roleIds).not.toContain("21263_11182")
    expect(roleIds).not.toContain("21263_11183")
    expect(roleIds).not.toContain("21263_11184")
  })

  it('uses source night order for opening and later nights', () => {
    expect(jiMengTaXiangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain("kazali")
    expect(jiMengTaXiangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain("villageidiot")
    expect(jiMengTaXiangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain("gudiao")
    expect(jiMengTaXiangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain("cerenovus")
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(jiMengTaXiangSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(jiMengTaXiangSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of jiMengTaXiangSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(jiMengTaXiangSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps special setup paths out of first normal templates', () => {
    expect(jiMengTaXiangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain("villageidiot-count-setup")
    expect(jiMengTaXiangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain("ganshiren-outsider-setup")
    expect(jiMengTaXiangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain("kazali-special-setup")
    expect(jiMengTaXiangSmartScriptPack.setupTemplates.some((template) => template.roles.includes("villageidiot"))).toBe(false)
    expect(jiMengTaXiangSmartScriptPack.setupTemplates.some((template) => template.roles.includes("ganshiren"))).toBe(false)
    expect(jiMengTaXiangSmartScriptPack.setupTemplates.some((template) => template.roles.includes("kazali"))).toBe(false)
  })
})
