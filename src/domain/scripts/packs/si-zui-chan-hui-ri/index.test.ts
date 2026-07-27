import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { siZuiChanHuiRiSmartScriptPack } from './index'

describe('siZuiChanHuiRiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(siZuiChanHuiRiSmartScriptPack.scriptId).toBe("si-zui-chan-hui-ri")
    expect(siZuiChanHuiRiSmartScriptPack.displayName).toBe("死罪忏悔日")
    expect(siZuiChanHuiRiSmartScriptPack.source.contentHash).toBe("sha256:5c514b72a58b8b9beacbf8da767760c34a73f3b3f1f9e36b63c8fe0b01c384c3")
    expect(siZuiChanHuiRiSmartScriptPack.roles).toHaveLength(21)
    const roleIds = siZuiChanHuiRiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('towncrier')
    expect(roleIds).toContain('bountyhunter')
    expect(roleIds).toContain('cultleader')
    expect(roleIds).toContain('lilmonsta')
    expect(roleIds).not.toContain('town_crier')
    expect(roleIds).not.toContain('bounty_hunter')
    expect(roleIds).not.toContain('lil_monsta')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = siZuiChanHuiRiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = siZuiChanHuiRiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('sailor')
    expect(firstNight).toContain('lilmonsta')
    expect(firstNight).toContain('preacher')
    expect(firstNight).toContain('bountyhunter')
    expect(otherNight).toContain('sailor')
    expect(otherNight).toContain('witch')
    expect(otherNight).toContain('lilmonsta')
    expect(otherNight).toContain('towncrier')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(siZuiChanHuiRiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(siZuiChanHuiRiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of siZuiChanHuiRiSmartScriptPack.setupTemplates) expect(validateTemplateComposition(siZuiChanHuiRiSmartScriptPack, template).valid, template.templateId).toBe(true)
  })

  it('keeps disruptive setup paths explicit in every template', () => {
    expect(siZuiChanHuiRiSmartScriptPack.setupTemplates.every((template) => template.roles.includes('lilmonsta'))).toBe(true)
    expect(siZuiChanHuiRiSmartScriptPack.setupTemplates.every((template) => template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'lilmonsta-extra-minion'))).toBe(true)
    const baronTemplates = siZuiChanHuiRiSmartScriptPack.setupTemplates.filter((template) => template.roles.includes('baron'))
    expect(baronTemplates.length).toBeGreaterThan(0)
    expect(baronTemplates.every((template) => template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'baron-outsider-plus-two'))).toBe(true)
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(siZuiChanHuiRiSmartScriptPack.roles.map((role) => role.id))
    for (const template of siZuiChanHuiRiSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
