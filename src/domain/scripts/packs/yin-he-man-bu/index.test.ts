import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yinHeManBuSmartScriptPack } from './index'

describe('yinHeManBuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(yinHeManBuSmartScriptPack.scriptId).toBe("yin-he-man-bu")
    expect(yinHeManBuSmartScriptPack.displayName).toBe("银河漫步")
    expect(yinHeManBuSmartScriptPack.source.contentHash).toBe("sha256:edb443b035e3ceb1cd1dd2e9a6decc570369ef8eec5e17f6f3532122ad2f098c")
    expect(yinHeManBuSmartScriptPack.roles).toHaveLength(25)
    const roleIds = yinHeManBuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('pit-hag')
    expect(roleIds).not.toContain('fang_gu')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = yinHeManBuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = yinHeManBuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('poisoner')
    expect(firstNight).toContain('fortuneteller')
    expect(firstNight).toContain('nightwatchman')
    expect(otherNight).toContain('pithag')
    expect(otherNight).toContain('fanggu')
    expect(otherNight).toContain('barber')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(yinHeManBuSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(yinHeManBuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of yinHeManBuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(yinHeManBuSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-modifying roles out of first normal templates', () => {
    const templateRoles = new Set(yinHeManBuSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['godfather', 'fanggu', 'vigormortis']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(yinHeManBuSmartScriptPack.roles.map((role) => role.id))
    for (const template of yinHeManBuSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), template.templateId).toBe(true)
        expect(template.roles.includes(bluff), template.templateId).toBe(false)
      }
    }
  })
})
