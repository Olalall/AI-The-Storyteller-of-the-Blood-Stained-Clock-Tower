import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { moNiZhiJiaoSmartScriptPack } from './index'

describe('moNiZhiJiaoSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(moNiZhiJiaoSmartScriptPack.scriptId).toBe("mo-ni-zhi-jiao")
    expect(moNiZhiJiaoSmartScriptPack.displayName).toBe("莫逆之交")
    expect(moNiZhiJiaoSmartScriptPack.source.contentHash).toBe('sha256:ce05efb561f7a3acb70245b17aa904063d2ba9179f5726a52ca782eff643376f')
    expect(moNiZhiJiaoSmartScriptPack.roles).toHaveLength(25)
    const roleIds = moNiZhiJiaoSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('xiuxingzhe')
    expect(roleIds).toContain('ogre')
    expect(roleIds).toContain('plaguedoctor')
    expect(roleIds).toContain('harpy')
    expect(roleIds).toContain('aohe')
    expect(roleIds).not.toContain('21481_11713')
  })
  it('uses source night order', () => {
    expect(moNiZhiJiaoSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('philosopher')
    expect(moNiZhiJiaoSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('xiuxingzhe')
    expect(moNiZhiJiaoSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('aohe')
    expect(moNiZhiJiaoSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('ravenkeeper')
  })
  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(moNiZhiJiaoSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(moNiZhiJiaoSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of moNiZhiJiaoSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(moNiZhiJiaoSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })
  it('keeps setup-changing demons and minion paths as reminders', () => {
    expect(moNiZhiJiaoSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('baron-extra-outsiders')
    expect(moNiZhiJiaoSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('lilmonsta-babysitter')
    expect(moNiZhiJiaoSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('vigormortis-minus-outsider')
    expect(moNiZhiJiaoSmartScriptPack.setupTemplates.some((template) => template.roles.includes('baron'))).toBe(false)
    expect(moNiZhiJiaoSmartScriptPack.setupTemplates.some((template) => template.roles.includes('lilmonsta'))).toBe(false)
    expect(moNiZhiJiaoSmartScriptPack.setupTemplates.some((template) => template.roles.includes('vigormortis'))).toBe(false)
  })
})
