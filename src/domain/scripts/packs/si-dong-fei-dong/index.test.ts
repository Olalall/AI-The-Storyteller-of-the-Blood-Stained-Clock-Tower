import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { siDongFeiDongSmartScriptPack } from '.'

describe('siDongFeiDongSmartScriptPack', () => {
  it('keeps the locked GStone source hash and 41 role mapping', () => {
    expect(siDongFeiDongSmartScriptPack.scriptId).toBe('si-dong-fei-dong')
    expect(siDongFeiDongSmartScriptPack.displayName).toBe("似懂非懂")
    expect(siDongFeiDongSmartScriptPack.source.contentHash).toBe("sha256:9440c0157f79ecba0d6118d97f7ec390b0decdb4213e4feaae68196062505116")
    expect(siDongFeiDongSmartScriptPack.roles).toHaveLength(41)
    expect(siDongFeiDongSmartScriptPack.roles.map((role) => role.id)).toContain('bountyhunter')
    expect(siDongFeiDongSmartScriptPack.roles.map((role) => role.id)).toContain('bonecollector')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(siDongFeiDongSmartScriptPack.nightOrders.firstNight.at(0)?.roleId).toBe('thief')
    expect(siDongFeiDongSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('godfather')
    expect(siDongFeiDongSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('innkeeper')
    expect(siDongFeiDongSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pukka')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of siDongFeiDongSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(siDongFeiDongSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
