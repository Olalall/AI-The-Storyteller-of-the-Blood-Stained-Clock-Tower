import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { chouHaiNiXingSmartScriptPack } from '.'

describe('chouHaiNiXingSmartScriptPack', () => {
  it('keeps the locked GStone source hash and 24 role mapping', () => {
    expect(chouHaiNiXingSmartScriptPack.scriptId).toBe("chou-hai-ni-xing")
    expect(chouHaiNiXingSmartScriptPack.displayName).toBe("仇海溺行")
    expect(chouHaiNiXingSmartScriptPack.source.contentHash).toBe("sha256:28dda3d0141a34631580803abdbf90b32b39daae2b7ea9b89adfa3581dfc92ad")
    expect(chouHaiNiXingSmartScriptPack.roles).toHaveLength(24)
    expect(chouHaiNiXingSmartScriptPack.roles.map((role) => role.id)).toContain('snakecharmer')
    expect(chouHaiNiXingSmartScriptPack.roles.map((role) => role.id)).toContain('marionette')
    expect(chouHaiNiXingSmartScriptPack.roles.map((role) => role.id)).toContain('leviathan')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(chouHaiNiXingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('amnesiac')
    expect(chouHaiNiXingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('snakecharmer')
    expect(chouHaiNiXingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
    expect(chouHaiNiXingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('leviathan')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of chouHaiNiXingSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(chouHaiNiXingSmartScriptPack, template).valid, template.templateId).toBe(true)
    }

    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
