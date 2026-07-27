import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { huaFuLeiMingSmartScriptPack } from './index'

describe('huaFuLeiMingSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(huaFuLeiMingSmartScriptPack.scriptId).toBe('hua-fu-lei-ming')
    expect(huaFuLeiMingSmartScriptPack.displayName).toBe('华府雷鸣')
    expect(huaFuLeiMingSmartScriptPack.source.contentHash).toBe('sha256:7f6034cb05123f9ea2949ebbd7e35e6895fe5cfbf7928f8878960e4c6f029fe5')
    expect(huaFuLeiMingSmartScriptPack.roles).toHaveLength(33)
    const roleIds = huaFuLeiMingSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('qianke')
    expect(roleIds).toContain('wushiren')
    expect(roleIds).toContain('gu_diao')
    expect(roleIds).toContain('qiongqi')
    expect(roleIds).toContain('he_bo_traveler')
  })

  it('uses source night order for opening and later nights', () => {
    expect(huaFuLeiMingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('philosopher')
    expect(huaFuLeiMingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('marionette')
    expect(huaFuLeiMingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('harlot')
    expect(huaFuLeiMingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(huaFuLeiMingSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(huaFuLeiMingSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of huaFuLeiMingSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(huaFuLeiMingSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing and special paths out of first normal templates', () => {
    const templateRoles = new Set(huaFuLeiMingSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('godfather')).toBe(false)
    expect(templateRoles.has('marionette')).toBe(false)
    expect(templateRoles.has('fanggu')).toBe(false)
    expect(templateRoles.has('vigormortis')).toBe(false)
  })
})
