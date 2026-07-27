import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { touTianHuanRiSmartScriptPack } from './index'

describe('touTianHuanRiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(touTianHuanRiSmartScriptPack.scriptId).toBe("tou-tian-huan-ri")
    expect(touTianHuanRiSmartScriptPack.displayName).toBe("偷天换日")
    expect(touTianHuanRiSmartScriptPack.source.contentHash).toBe('sha256:222d0ffb78fc4d10eb9eafa085e4913b030f50e72953dd2abdcaf90f1748f044')
    expect(touTianHuanRiSmartScriptPack.roles).toHaveLength(25)
    const roleIds = touTianHuanRiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('towncrier')
    expect(roleIds).toContain('scarletwoman')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('town_crier')
    expect(roleIds).not.toContain('scarlet_woman')
    expect(roleIds).not.toContain('fang_gu')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = touTianHuanRiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = touTianHuanRiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('lunatic')
    expect(firstNight).toContain('pixie')
    expect(firstNight).toContain('fortuneteller')
    expect(otherNight).toContain('poisoner')
    expect(otherNight).toContain('cerenovus')
    expect(otherNight).toContain('pukka')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(touTianHuanRiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(touTianHuanRiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of touTianHuanRiSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(touTianHuanRiSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps hidden/alignment/setup paths out of first normal templates', () => {
    const templateRoles = new Set(touTianHuanRiSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['drunk', 'lunatic', 'goon', 'fanggu']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })
})
