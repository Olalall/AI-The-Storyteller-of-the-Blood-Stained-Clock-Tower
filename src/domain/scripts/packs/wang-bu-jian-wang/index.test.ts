import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { wangBuJianWangSmartScriptPack } from './index'

describe('wangBuJianWangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(wangBuJianWangSmartScriptPack.scriptId).toBe("wang-bu-jian-wang")
    expect(wangBuJianWangSmartScriptPack.displayName).toBe("王不见王")
    expect(wangBuJianWangSmartScriptPack.source.contentHash).toBe('sha256:822d7f78995c902f81e68b9eb2ed9779bfb00d0bb1905abaa6ba84192b8329c8')
    expect(wangBuJianWangSmartScriptPack.roles).toHaveLength(24)
    const roleIds = wangBuJianWangSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('alhadikhia')
    expect(roleIds).toContain('plaguedoctor')
    expect(roleIds).toContain('bountyhunter')
    expect(roleIds).not.toContain('al-hadikhia')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(wangBuJianWangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('marionette')
    expect(wangBuJianWangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('bountyhunter')
    expect(wangBuJianWangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('alhadikhia')
    expect(wangBuJianWangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('barber')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(wangBuJianWangSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(wangBuJianWangSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of wangBuJianWangSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(wangBuJianWangSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps setup-changing roles as explicit reminders', () => {
    expect(wangBuJianWangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('baron-extra-outsiders')
    expect(wangBuJianWangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('balloonist-extra-outsider')
    expect(wangBuJianWangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('bountyhunter-evil-townsfolk')
    expect(wangBuJianWangSmartScriptPack.setupTemplates.some((template) => template.roles.includes('baron'))).toBe(false)
    expect(wangBuJianWangSmartScriptPack.setupTemplates.some((template) => template.roles.includes('balloonist'))).toBe(false)
    expect(wangBuJianWangSmartScriptPack.setupTemplates.some((template) => template.roles.includes('bountyhunter'))).toBe(false)
  })
})
