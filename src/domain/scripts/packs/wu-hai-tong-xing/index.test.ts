import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { wuHaiTongXingSmartScriptPack } from './index'

describe('wu-hai-tong-xing smart script pack', () => {
  it('keeps locked source metadata and valid role list', () => {
    expect(wuHaiTongXingSmartScriptPack.scriptId).toBe('wu-hai-tong-xing')
    expect(wuHaiTongXingSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
    expect(wuHaiTongXingSmartScriptPack.roles.length).toBeGreaterThanOrEqual(18)
    expect(wuHaiTongXingSmartScriptPack.nightOrders.firstNight.length).toBeGreaterThan(0)
    expect(wuHaiTongXingSmartScriptPack.nightOrders.otherNight.length).toBeGreaterThan(0)
  })

  it('verifies setup templates are composition-valid for each count', () => {
    for (const template of wuHaiTongXingSmartScriptPack.setupTemplates) {
      const report = validateTemplateComposition(wuHaiTongXingSmartScriptPack, template)
      expect(template.verified, template.templateId).toBe(true)
      expect(template.bluffs.length).toBe(3)
      expect(template.roles.length).toBe(template.playerCount)
      expect(report.valid, template.templateId).toBe(true)
    }
  })
})
