import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { ziGuiQiMingSmartScriptPack } from './index'

describe('ziGuiQiMingSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(ziGuiQiMingSmartScriptPack.scriptId).toBe("zi-gui-qi-ming")
    expect(ziGuiQiMingSmartScriptPack.displayName).toBe("子规泣鸣")
    expect(ziGuiQiMingSmartScriptPack.source.contentHash).toBe('sha256:828c16539e3fb0a09778e3c281f5f9d93475279da9013dde1d753e9886c2c8a5')
    expect(ziGuiQiMingSmartScriptPack.roles).toHaveLength(25)
    const roleIds = ziGuiQiMingSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('bingbi')
    expect(roleIds).toContain('daoke')
    expect(roleIds).toContain('yanluo')
    expect(roleIds).toContain('guhuoniao')
    expect(roleIds).toContain('lilmonsta')
    expect(roleIds).not.toContain('21506_11731')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(ziGuiQiMingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('lilmonsta')
    expect(ziGuiQiMingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('yanluo')
    expect(ziGuiQiMingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('dianyuzhang')
    expect(ziGuiQiMingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('zhen')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(ziGuiQiMingSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(ziGuiQiMingSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of ziGuiQiMingSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(ziGuiQiMingSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps setup-changing roles as explicit reminders', () => {
    expect(ziGuiQiMingSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('lilmonsta-extra-minion')
    expect(ziGuiQiMingSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('godfather-outsider')
    expect(ziGuiQiMingSmartScriptPack.setupTemplates.some((template) => template.roles.includes('lilmonsta'))).toBe(false)
    expect(ziGuiQiMingSmartScriptPack.setupTemplates.some((template) => template.roles.includes('godfather'))).toBe(false)
  })
})
