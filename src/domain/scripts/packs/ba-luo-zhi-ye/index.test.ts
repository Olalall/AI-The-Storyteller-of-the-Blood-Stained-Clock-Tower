import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { baLuoZhiYeSmartScriptPack } from './index'

describe('baLuoZhiYeSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(baLuoZhiYeSmartScriptPack.scriptId).toBe('ba-luo-zhi-ye')
    expect(baLuoZhiYeSmartScriptPack.displayName).toBe('魃罗之夜')
    expect(baLuoZhiYeSmartScriptPack.source.contentHash).toBe('sha256:7cfd7c804e28b32bb0f593ccf95d64bade2a8b695f12859f9ca4652a452d40bc')
    expect(baLuoZhiYeSmartScriptPack.roles).toHaveLength(27)
    const roleIds = baLuoZhiYeSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('ba_luo_wang')
    expect(roleIds).toContain('king')
    expect(roleIds).toContain('marionette')
    expect(roleIds).toContain('damsel')
    expect(roleIds).toContain('djinn')
  })

  it('uses source night order for opening and later nights', () => {
    expect(baLuoZhiYeSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('damsel')
    expect(baLuoZhiYeSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('king')
    expect(baLuoZhiYeSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('ba_luo_wang')
    expect(baLuoZhiYeSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('flowergirl')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(baLuoZhiYeSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(baLuoZhiYeSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of baLuoZhiYeSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(baLuoZhiYeSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps hidden/setup-changing paths out of first normal templates', () => {
    const templateRoles = new Set(baLuoZhiYeSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('huntsman')).toBe(false)
    expect(templateRoles.has('choirboy')).toBe(false)
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('damsel')).toBe(false)
    expect(templateRoles.has('marionette')).toBe(false)
    expect(templateRoles.has('baron')).toBe(false)
  })
})
