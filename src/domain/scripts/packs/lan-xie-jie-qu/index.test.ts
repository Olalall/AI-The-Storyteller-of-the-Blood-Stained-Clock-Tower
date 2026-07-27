import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { lanXieJieQuSmartScriptPack } from './index'

describe('lanXieJieQuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(lanXieJieQuSmartScriptPack.scriptId).toBe("lan-xie-jie-qu")
    expect(lanXieJieQuSmartScriptPack.displayName).toBe("蓝榭街区")
    expect(lanXieJieQuSmartScriptPack.source.contentHash).toBe("sha256:7964badba754c80e54378eac7670c6f7e5c3be4d547476dca58ea0d9f9417aa2")
    expect(lanXieJieQuSmartScriptPack.roles).toHaveLength(31)
    const roleIds = lanXieJieQuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('towncrier')
    expect(roleIds).toContain('tealady')
    expect(roleIds).toContain('devilsadvocate')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).not.toContain('town_crier')
    expect(roleIds).not.toContain('tea_lady')
    expect(roleIds).not.toContain('devils_advocate')
    expect(roleIds).not.toContain('no_dashii')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = lanXieJieQuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = lanXieJieQuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('bureaucrat')
    expect(firstNight).toContain('thief')
    expect(firstNight).toContain('lunatic')
    expect(firstNight).toContain('poisoner')
    expect(otherNight).toContain('monk')
    expect(otherNight).toContain('barber')
    expect(otherNight).toContain('towncrier')
    expect(otherNight).toContain('vortox')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(lanXieJieQuSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(lanXieJieQuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of lanXieJieQuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(lanXieJieQuSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps disruptive setup paths out of first normal templates', () => {
    const templateRoles = new Set(lanXieJieQuSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['drunk', 'godfather', 'vigormortis']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(lanXieJieQuSmartScriptPack.roles.map((role) => role.id))
    for (const template of lanXieJieQuSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), template.templateId).toBe(true)
        expect(template.roles.includes(bluff), template.templateId).toBe(false)
      }
    }
  })
})
