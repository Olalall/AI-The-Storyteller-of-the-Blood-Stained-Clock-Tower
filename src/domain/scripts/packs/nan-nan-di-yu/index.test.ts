import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { nanNanDiYuSmartScriptPack } from '.'

describe('nanNanDiYuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(nanNanDiYuSmartScriptPack.scriptId).toBe("nan-nan-di-yu")
    expect(nanNanDiYuSmartScriptPack.displayName).toBe("喃喃低语")
    expect(nanNanDiYuSmartScriptPack.source.contentHash).toBe("sha256:1cb225d789548d3fd49fff3ab50c7d8d09eaa10670239da503d01e882966f3d5")
    expect(nanNanDiYuSmartScriptPack.roles).toHaveLength(26)
    expect(nanNanDiYuSmartScriptPack.roles.map((role) => role.id)).toContain("steward")
    expect(nanNanDiYuSmartScriptPack.roles.map((role) => role.id)).toContain("investigator")
    expect(nanNanDiYuSmartScriptPack.roles.map((role) => role.id)).toContain("fanggu")
    expect(nanNanDiYuSmartScriptPack.roles.map((role) => role.id)).toContain("imp")
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(nanNanDiYuSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(nanNanDiYuSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of nanNanDiYuSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(nanNanDiYuSmartScriptPack, template).valid, template.templateId).toBe(true)
    }

    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
