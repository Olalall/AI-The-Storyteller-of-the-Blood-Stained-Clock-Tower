import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { bingGongBanShiSmartScriptPack } from '.'

describe('bingGongBanShiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(bingGongBanShiSmartScriptPack.scriptId).toBe("bing-gong-ban-shi")
    expect(bingGongBanShiSmartScriptPack.displayName).toBe("秉公办事")
    expect(bingGongBanShiSmartScriptPack.source.contentHash).toBe("sha256:e6ddad5ff318ef98a6f597bf34f0a8a8064675f250ff60b8c38a3f91b0e341ca")
    expect(bingGongBanShiSmartScriptPack.roles.length).toBeGreaterThanOrEqual(22)
    expect(bingGongBanShiSmartScriptPack.roles.map((role) => role.id)).toContain('qianke')
    expect(bingGongBanShiSmartScriptPack.roles.map((role) => role.id)).toContain('jinyiwei')
    expect(bingGongBanShiSmartScriptPack.roles.map((role) => role.id)).toContain('spiritofivory')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(bingGongBanShiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('qianke')
    expect(bingGongBanShiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('pixie')
    expect(bingGongBanShiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('alhadikhia')
    expect(bingGongBanShiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of bingGongBanShiSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(bingGongBanShiSmartScriptPack, template).valid, template.templateId).toBe(true)
    }

    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
