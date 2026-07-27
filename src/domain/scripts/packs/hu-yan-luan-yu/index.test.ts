import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { huYanLuanYuSmartScriptPack } from './index'

describe('huYanLuanYuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(huYanLuanYuSmartScriptPack.scriptId).toBe('hu-yan-luan-yu')
    expect(huYanLuanYuSmartScriptPack.displayName).toBe('胡言乱语')
    expect(huYanLuanYuSmartScriptPack.source.contentHash).toBe('sha256:cdbca64798fabca08e25147875ddf9456a3503ed06455dd3a870d8a668104237')
    expect(huYanLuanYuSmartScriptPack.roles).toHaveLength(26)
    const roleIds = huYanLuanYuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('highpriestess')
    expect(roleIds).toContain('villageidiot')
    expect(roleIds).toContain('poppygrower')
    expect(roleIds).toContain('yaggababble')
    expect(roleIds).toContain('djinn')
    expect(roleIds).not.toContain('high_priestess')
    expect(roleIds).not.toContain('21266_11189')
  })

  it('uses source night order for opening and later nights', () => {
    expect(huYanLuanYuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('poppygrower')
    expect(huYanLuanYuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('villageidiot')
    expect(huYanLuanYuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('cerenovus')
    expect(huYanLuanYuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gambler')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(huYanLuanYuSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(huYanLuanYuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of huYanLuanYuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(huYanLuanYuSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps setup-changing roles out of first normal templates', () => {
    expect(huYanLuanYuSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('villageidiot-count-setup')
    expect(huYanLuanYuSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('fanggu-outsider-setup')
    expect(huYanLuanYuSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('marionette-adjacent-demon')
    expect(huYanLuanYuSmartScriptPack.setupTemplates.some((template) => template.roles.includes('villageidiot'))).toBe(false)
    expect(huYanLuanYuSmartScriptPack.setupTemplates.some((template) => template.roles.includes('fanggu'))).toBe(false)
    expect(huYanLuanYuSmartScriptPack.setupTemplates.some((template) => template.roles.includes('marionette'))).toBe(false)
    expect(huYanLuanYuSmartScriptPack.setupTemplates.some((template) => template.roles.includes('djinn'))).toBe(false)
  })
})
