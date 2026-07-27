import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { zhuoYueBiFangSmartScriptPack } from '.'

describe('zhuoYueBiFangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and 25 role mapping', () => {
    expect(zhuoYueBiFangSmartScriptPack.scriptId).toBe("zhuo-yue-bi-fang")
    expect(zhuoYueBiFangSmartScriptPack.displayName).toBe("浊月毕方")
    expect(zhuoYueBiFangSmartScriptPack.source.contentHash).toBe("sha256:ffe246e86acbbd57f8c913d6ab04ac9798c2c80a34d9a8444ad60b73b3c7e18d")
    expect(zhuoYueBiFangSmartScriptPack.roles).toHaveLength(25)
    expect(zhuoYueBiFangSmartScriptPack.roles.map((role) => role.id)).toContain('yinyangshi')
    expect(zhuoYueBiFangSmartScriptPack.roles.map((role) => role.id)).toContain('dianyuzhang')
    expect(zhuoYueBiFangSmartScriptPack.roles.map((role) => role.id)).toContain('legion')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(zhuoYueBiFangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('harpy')
    expect(zhuoYueBiFangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('dianyuzhang')
    expect(zhuoYueBiFangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gambler')
    expect(zhuoYueBiFangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('legion')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of zhuoYueBiFangSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(zhuoYueBiFangSmartScriptPack, template).valid, template.templateId).toBe(true)
    }

    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
