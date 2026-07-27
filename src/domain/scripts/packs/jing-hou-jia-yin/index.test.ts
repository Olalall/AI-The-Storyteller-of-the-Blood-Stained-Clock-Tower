import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { jingHouJiaYinSmartScriptPack } from './index'

describe('jingHouJiaYinSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(jingHouJiaYinSmartScriptPack.scriptId).toBe("jing-hou-jia-yin")
    expect(jingHouJiaYinSmartScriptPack.displayName).toBe("静候佳音")
    expect(jingHouJiaYinSmartScriptPack.source.contentHash).toBe('sha256:8b647260757e5a78781c454a5916c06129db2ac5a8f6f47b78bf69dc3ba260a5')
    expect(jingHouJiaYinSmartScriptPack.roles).toHaveLength(26)
    const roleIds = jingHouJiaYinSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('xiuxingzhe')
    expect(roleIds).toContain('alsaahir')
    expect(roleIds).toContain('plaguedoctor')
    expect(roleIds).toContain('hatter')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).not.toContain('21489_11720')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(jingHouJiaYinSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('xiuxingzhe')
    expect(jingHouJiaYinSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('damsel')
    expect(jingHouJiaYinSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
    expect(jingHouJiaYinSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('hatter')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(jingHouJiaYinSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(jingHouJiaYinSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of jingHouJiaYinSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(jingHouJiaYinSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps special setup and fabled paths as explicit reminders', () => {
    expect(jingHouJiaYinSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('balloonist-extra-outsider')
    expect(jingHouJiaYinSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('huntsman-adds-damsel')
    expect(jingHouJiaYinSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('legion-majority-setup')
    expect(jingHouJiaYinSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('djinn-jinxes')
    expect(jingHouJiaYinSmartScriptPack.setupTemplates.some((template) => template.roles.includes('balloonist'))).toBe(false)
    expect(jingHouJiaYinSmartScriptPack.setupTemplates.some((template) => template.roles.includes('huntsman'))).toBe(false)
    expect(jingHouJiaYinSmartScriptPack.setupTemplates.some((template) => template.roles.includes('legion'))).toBe(false)
    expect(jingHouJiaYinSmartScriptPack.setupTemplates.some((template) => template.roles.includes('djinn'))).toBe(false)
  })
})
