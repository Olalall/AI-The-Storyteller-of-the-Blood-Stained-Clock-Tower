import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { wenWuShuangQuanSmartScriptPack } from '.'

describe('wenWuShuangQuanSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(wenWuShuangQuanSmartScriptPack.scriptId).toBe("wen-wu-shuang-quan")
    expect(wenWuShuangQuanSmartScriptPack.displayName).toBe("文武双全")
    expect(wenWuShuangQuanSmartScriptPack.source.contentHash).toBe("sha256:0704a881838a7f382d59c42a74cdee3def27604e8a608ef04eee56b60f3c56c8")
    expect(wenWuShuangQuanSmartScriptPack.roles).toHaveLength(25)
    expect(wenWuShuangQuanSmartScriptPack.roles.map((role) => role.id)).toContain("steward")
    expect(wenWuShuangQuanSmartScriptPack.roles.map((role) => role.id)).toContain("librarian")
    expect(wenWuShuangQuanSmartScriptPack.roles.map((role) => role.id)).toContain("imp")
    expect(wenWuShuangQuanSmartScriptPack.roles.map((role) => role.id)).toContain("pukka")
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(wenWuShuangQuanSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(wenWuShuangQuanSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of wenWuShuangQuanSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(wenWuShuangQuanSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
