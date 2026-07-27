import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yiHuaJieMuSmartScriptPack } from './index'

describe('yiHuaJieMuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(yiHuaJieMuSmartScriptPack.scriptId).toBe('yi-hua-jie-mu')
    expect(yiHuaJieMuSmartScriptPack.displayName).toBe('移花接木')
    expect(yiHuaJieMuSmartScriptPack.source.contentHash).toBe('sha256:9bbb3391e47daa2d60383a66c2bb2a1e3db97110131f1ee05e8c94285d88b3b4')
    expect(yiHuaJieMuSmartScriptPack.roles).toHaveLength(26)
    const roleIds = yiHuaJieMuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('villageidiot')
    expect(roleIds).toContain('harpy')
    expect(roleIds).toContain('djinn')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('21265_11186')
    expect(roleIds).not.toContain('21265_11187')
  })

  it('uses source night order for opening and later nights', () => {
    expect(yiHuaJieMuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('villageidiot')
    expect(yiHuaJieMuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('gudiao')
    expect(yiHuaJieMuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gambler')
    expect(yiHuaJieMuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('dianyuzhang')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(yiHuaJieMuSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(yiHuaJieMuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of yiHuaJieMuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(yiHuaJieMuSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps special setup paths explicit and out of first normal templates where needed', () => {
    expect(yiHuaJieMuSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('villageidiot-count-setup')
    expect(yiHuaJieMuSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('godfather-outsider-setup')
    expect(yiHuaJieMuSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('taotie-outsider-setup')
    expect(yiHuaJieMuSmartScriptPack.setupTemplates.some((template) => template.roles.includes('villageidiot'))).toBe(false)
    expect(yiHuaJieMuSmartScriptPack.setupTemplates.some((template) => template.roles.includes('taotie'))).toBe(false)
    expect(yiHuaJieMuSmartScriptPack.setupTemplates.some((template) => template.roles.includes('marionette'))).toBe(false)
    expect(yiHuaJieMuSmartScriptPack.setupTemplates.some((template) => template.roles.includes('djinn'))).toBe(false)
    expect(yiHuaJieMuSmartScriptPack.setupTemplates.filter((template) => template.roles.includes('godfather')).every((template) => template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'godfather-outsider-setup'))).toBe(true)
  })
})
