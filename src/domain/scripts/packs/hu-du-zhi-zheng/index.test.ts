import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { huDuZhiZhengSmartScriptPack } from '.'

describe('huDuZhiZhengSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(huDuZhiZhengSmartScriptPack.scriptId).toBe("hu-du-zhi-zheng")
    expect(huDuZhiZhengSmartScriptPack.displayName).toBe("护犊之征")
    expect(huDuZhiZhengSmartScriptPack.source.contentHash).toBe("sha256:1a2a4c25ac2cf7acb604462005954daab5157e3168b01c15e61a93c251d2ae4a")
    expect(huDuZhiZhengSmartScriptPack.roles).toHaveLength(27)
    expect(huDuZhiZhengSmartScriptPack.roles.map((role) => role.id)).toContain('lilmonsta')
    expect(huDuZhiZhengSmartScriptPack.roles.map((role) => role.id)).toContain('gudiao')
  })

  it('uses Lil Monsta composition adjustment instead of assigning a Demon player in templates', () => {
    for (const template of huDuZhiZhengSmartScriptPack.setupTemplates) {
      expect(template.roles).not.toContain('lilmonsta')
      expect(template.setupAdjustments?.[0]?.compositionDelta).toEqual({ minion: 1, demon: -1 })
    }
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of huDuZhiZhengSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(huDuZhiZhengSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
