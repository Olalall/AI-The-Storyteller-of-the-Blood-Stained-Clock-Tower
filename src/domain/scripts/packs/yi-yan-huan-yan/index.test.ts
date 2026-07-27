import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yiYanHuanYanSmartScriptPack } from '.'

describe('yiYanHuanYanSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(yiYanHuanYanSmartScriptPack.scriptId).toBe("yi-yan-huan-yan")
    expect(yiYanHuanYanSmartScriptPack.displayName).toBe("以眼还眼")
    expect(yiYanHuanYanSmartScriptPack.source.contentHash).toBe("sha256:7e7eb334f450d0595457bfc0f95a36e5b282c2137b2b4ca250b3c0d7cf010d23")
    expect(yiYanHuanYanSmartScriptPack.roles).toHaveLength(26)
    expect(yiYanHuanYanSmartScriptPack.roles.map((role) => role.id)).toContain("steward")
    expect(yiYanHuanYanSmartScriptPack.roles.map((role) => role.id)).toContain("grandmother")
    expect(yiYanHuanYanSmartScriptPack.roles.map((role) => role.id)).toContain("vigormortis")
    expect(yiYanHuanYanSmartScriptPack.roles.map((role) => role.id)).toContain("ojo")
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(yiYanHuanYanSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(yiYanHuanYanSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of yiYanHuanYanSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(yiYanHuanYanSmartScriptPack, template).valid, template.templateId).toBe(true)
    }

    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
