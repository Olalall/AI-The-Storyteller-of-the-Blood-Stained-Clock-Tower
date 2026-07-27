import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { wuYinCangShengSmartScriptPack } from './index'

describe('wuYinCangShengSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(wuYinCangShengSmartScriptPack.scriptId).toBe("wu-yin-cang-sheng")
    expect(wuYinCangShengSmartScriptPack.displayName).toBe("雾隐苍生")
    expect(wuYinCangShengSmartScriptPack.source.contentHash).toBe('sha256:82a7da8752a99d8ad0af28033db833457e66a1edcbbdc172df9f88011211e77d')
    expect(wuYinCangShengSmartScriptPack.roles).toHaveLength(26)
    const roleIds = wuYinCangShengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('highpriestess')
    expect(roleIds).toContain('harpy')
    expect(roleIds).toContain('plaguedoctor')
    expect(roleIds).toContain('kazali')
    expect(roleIds).toContain('spiritofivory')
    expect(roleIds).not.toContain('21529_11748')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(wuYinCangShengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('kazali')
    expect(wuYinCangShengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('mezepheles')
    expect(wuYinCangShengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
    expect(wuYinCangShengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('zhen')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(wuYinCangShengSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(wuYinCangShengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of wuYinCangShengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(wuYinCangShengSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps setup-changing and fabled roles as explicit reminders', () => {
    expect(wuYinCangShengSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('kazali-minion-outsider-setup')
    expect(wuYinCangShengSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('spirit-ivory-evil-cap')
    expect(wuYinCangShengSmartScriptPack.setupTemplates.some((template) => template.roles.includes('kazali'))).toBe(false)
    expect(wuYinCangShengSmartScriptPack.setupTemplates.some((template) => template.roles.includes('spiritofivory'))).toBe(false)
  })
})
