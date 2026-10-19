import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { kuMuFengChunSmartScriptPack } from './index'

describe('kuMuFengChunSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(kuMuFengChunSmartScriptPack.scriptId).toBe("ku-mu-feng-chun")
    expect(kuMuFengChunSmartScriptPack.displayName).toBe("枯木逢春")
    expect(kuMuFengChunSmartScriptPack.source.contentHash).toBe('sha256:219a954bddff7d34db1947d630200fedb2e40e7475d809f20a435fc76943e810')
    expect(kuMuFengChunSmartScriptPack.roles).toHaveLength(24)
    const roleIds = kuMuFengChunSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('shugenja')
    expect(roleIds).toContain('banshee')
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('harpy')
    expect(roleIds).toContain('kazali')
    expect(roleIds).not.toContain('21365_11463')
    expect(roleIds).not.toContain('21365_11466')
  })

  it('uses source night order for opening and later nights', () => {
    expect(kuMuFengChunSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('kazali')
    expect(kuMuFengChunSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('philosopher')
    expect(kuMuFengChunSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('shugenja')
    expect(kuMuFengChunSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
    expect(kuMuFengChunSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('banshee')
    expect(kuMuFengChunSmartScriptPack.nightOrders.otherNight
      .map((entry) => entry.roleId)
      .filter((id) => ['barber', 'banshee', 'ravenkeeper'].includes(id))).toEqual([
        'barber',
        'banshee',
        'ravenkeeper',
      ])
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(kuMuFengChunSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(kuMuFengChunSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of kuMuFengChunSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(kuMuFengChunSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps setup-changing and authority-changing paths as reminders', () => {
    expect(kuMuFengChunSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('kazali-minion-outsider-setup')
    expect(kuMuFengChunSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('vigormortis-minus-outsider')
    expect(kuMuFengChunSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('snakecharmer-swap')
    expect(kuMuFengChunSmartScriptPack.setupTemplates.some((template) => template.roles.includes('kazali'))).toBe(false)
    expect(kuMuFengChunSmartScriptPack.setupTemplates.some((template) => template.roles.includes('vigormortis'))).toBe(false)
  })
})
