import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { chuanQiZhiYeSmartScriptPack } from './index'

describe('chuanQiZhiYeSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(chuanQiZhiYeSmartScriptPack.scriptId).toBe("chuan-qi-zhi-ye")
    expect(chuanQiZhiYeSmartScriptPack.displayName).toBe("传奇之夜")
    expect(chuanQiZhiYeSmartScriptPack.source.contentHash).toBe('sha256:cc4c9bb6509aed6544f4cd7964ebb93bf092a5f6f31b57c0dca7913c7aeecb1d')
    expect(chuanQiZhiYeSmartScriptPack.roles).toHaveLength(25)
    const roleIds = chuanQiZhiYeSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('bountyhunter')
    expect(roleIds).toContain('towncrier')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).not.toContain('bounty_hunter')
    expect(roleIds).not.toContain('town_crier')
    expect(roleIds).not.toContain('pit-hag')
    expect(roleIds).not.toContain('no_dashii')
  })

  it('uses source night order for opening and later nights', () => {
    expect(chuanQiZhiYeSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('pixie')
    expect(chuanQiZhiYeSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('pukka')
    expect(chuanQiZhiYeSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gambler')
    expect(chuanQiZhiYeSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(chuanQiZhiYeSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(chuanQiZhiYeSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of chuanQiZhiYeSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(chuanQiZhiYeSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing roles out of first normal templates', () => {
    expect(chuanQiZhiYeSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('bountyhunter-extra-evil')
    expect(chuanQiZhiYeSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('vigormortis-outsider-setup')
    expect(chuanQiZhiYeSmartScriptPack.setupTemplates.some((template) => template.roles.includes('bountyhunter'))).toBe(false)
    expect(chuanQiZhiYeSmartScriptPack.setupTemplates.some((template) => template.roles.includes('vigormortis'))).toBe(false)
  })
})
