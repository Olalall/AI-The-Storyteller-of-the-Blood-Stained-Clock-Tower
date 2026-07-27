import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { feiFanYingTianSmartScriptPack } from './index'

describe('feiFanYingTianSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(feiFanYingTianSmartScriptPack.scriptId).toBe("fei-fan-ying-tian")
    expect(feiFanYingTianSmartScriptPack.displayName).toBe("沸反盈天")
    expect(feiFanYingTianSmartScriptPack.source.contentHash).toBe('sha256:8f67853940c9e36b4ea142426e5c4e51a5c671656f54939ff429b30745468900')
    expect(feiFanYingTianSmartScriptPack.roles).toHaveLength(25)
    const roleIds = feiFanYingTianSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('bountyhunter')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).toContain('devilsadvocate')
    expect(roleIds).toContain('tealady')
    expect(roleIds).toContain('highpriestess')
    expect(roleIds).not.toContain('fang_gu')
    expect(roleIds).not.toContain('high_priestess')
  })

  it('uses source night order for opening and later nights', () => {
    expect(feiFanYingTianSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('alchemist')
    expect(feiFanYingTianSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('bountyhunter')
    expect(feiFanYingTianSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('sailor')
    expect(feiFanYingTianSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('fanggu')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(feiFanYingTianSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(feiFanYingTianSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of feiFanYingTianSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(feiFanYingTianSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps setup-changing paths out of first normal templates', () => {
    expect(feiFanYingTianSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('bountyhunter-evil-townsfolk')
    expect(feiFanYingTianSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('fanggu-plus-outsider')
    expect(feiFanYingTianSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('godfather-outsider-delta')
    expect(feiFanYingTianSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('huntsman-adds-damsel')
    for (const roleId of ['bountyhunter', 'fanggu', 'godfather', 'huntsman']) {
      expect(feiFanYingTianSmartScriptPack.setupTemplates.some((template) => template.roles.includes(roleId))).toBe(false)
    }
  })
})
