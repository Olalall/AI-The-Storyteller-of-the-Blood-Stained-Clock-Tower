import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yeMuJiangLinSmartScriptPack } from '.'

describe('yeMuJiangLinSmartScriptPack', () => {
  it('keeps the locked GStone source hash and 24 role mapping', () => {
    expect(yeMuJiangLinSmartScriptPack.scriptId).toBe("ye-mu-jiang-lin")
    expect(yeMuJiangLinSmartScriptPack.displayName).toBe("夜幕降临")
    expect(yeMuJiangLinSmartScriptPack.source.contentHash).toBe("sha256:7faddcacda1cd830df924b9dd2050fb707afc6532caa7ad2f6d696a47e92ec1a")
    expect(yeMuJiangLinSmartScriptPack.roles).toHaveLength(24)
    expect(yeMuJiangLinSmartScriptPack.roles.map((role) => role.id)).toContain('towncrier')
    expect(yeMuJiangLinSmartScriptPack.roles.map((role) => role.id)).toContain('scarletwoman')
    expect(yeMuJiangLinSmartScriptPack.roles.map((role) => role.id)).toContain('devilsadvocate')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(yeMuJiangLinSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('alchemist')
    expect(yeMuJiangLinSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('chef')
    expect(yeMuJiangLinSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gambler')
    expect(yeMuJiangLinSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('vortox')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of yeMuJiangLinSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(yeMuJiangLinSmartScriptPack, template).valid, template.templateId).toBe(true)
    }

    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
