import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { shiSanHangSmartScriptPack } from './index'

describe('shiSanHangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(shiSanHangSmartScriptPack.source.contentHash).toBe('sha256:4537cee40664d86345fa1b20af1858768df3be233db1d41081e184dece91f0e5')
    expect(shiSanHangSmartScriptPack.roles).toHaveLength(25)
    expect(shiSanHangSmartScriptPack.roles.map((role) => role.id)).toContain('simin')
    expect(shiSanHangSmartScriptPack.roles.map((role) => role.id)).toContain('huapi')
  })
  it('uses the source-provided night order as the wake-up base', () => {
    expect(shiSanHangSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(shiSanHangSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
    expect(shiSanHangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('dianyuzhang')
  })
  it('provides verified setup templates for all 7-15 player counts', () => {
    for (const count of shiSanHangSmartScriptPack.playerCounts) {
      const templates = shiSanHangSmartScriptPack.setupTemplates.filter((template) => template.playerCount === count)
      expect(templates.length, `templates for ${count}`).toBeGreaterThanOrEqual(2)
      for (const template of templates) {
        expect(template.verified).toBe(true)
        expect(validateTemplateComposition(shiSanHangSmartScriptPack, template).valid).toBe(true)
      }
    }
  })
})
