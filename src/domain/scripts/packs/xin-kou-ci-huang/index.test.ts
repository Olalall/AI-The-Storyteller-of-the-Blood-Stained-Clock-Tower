import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { xinKouCiHuangSmartScriptPack } from './index'

describe('xinKouCiHuangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(xinKouCiHuangSmartScriptPack.source.contentHash).toBe('sha256:4397c0506ab8e254b135a0610c1b096a8304925c86694e953514adf67ab1cd69')
    expect(xinKouCiHuangSmartScriptPack.roles).toHaveLength(25)
    expect(xinKouCiHuangSmartScriptPack.roles.map((role) => role.id)).toContain('banshee')
    expect(xinKouCiHuangSmartScriptPack.roles.map((role) => role.id)).toContain('lordoftyphon')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(xinKouCiHuangSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(xinKouCiHuangSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
    expect(xinKouCiHuangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('boffin')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    for (const count of xinKouCiHuangSmartScriptPack.playerCounts) {
      const templates = xinKouCiHuangSmartScriptPack.setupTemplates.filter((template) => template.playerCount === count)
      expect(templates.length, `templates for ${count}`).toBeGreaterThanOrEqual(2)
      for (const template of templates) {
        expect(template.verified).toBe(true)
        expect(validateTemplateComposition(xinKouCiHuangSmartScriptPack, template).valid).toBe(true)
      }
    }
  })
})
