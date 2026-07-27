import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { miaoShanFengXianSmartScriptPack } from '.'

describe('miaoShanFengXianSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(miaoShanFengXianSmartScriptPack.scriptId).toBe("miao-shan-feng-xian")
    expect(miaoShanFengXianSmartScriptPack.displayName).toBe("妙山封仙")
    expect(miaoShanFengXianSmartScriptPack.source.contentHash).toBe("sha256:0ac51f9b9b4b9ef27f06ce219cf378ecbf4516a3f5b1267e945343a84d5d152f")
    expect(miaoShanFengXianSmartScriptPack.roles).toHaveLength(26)
    expect(miaoShanFengXianSmartScriptPack.roles.map((role) => role.id)).toContain("shugenja")
    expect(miaoShanFengXianSmartScriptPack.roles.map((role) => role.id)).toContain("knight")
    expect(miaoShanFengXianSmartScriptPack.roles.map((role) => role.id)).toContain("vigormortis")
    expect(miaoShanFengXianSmartScriptPack.roles.map((role) => role.id)).toContain("vortox")
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(miaoShanFengXianSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(miaoShanFengXianSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of miaoShanFengXianSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(miaoShanFengXianSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
