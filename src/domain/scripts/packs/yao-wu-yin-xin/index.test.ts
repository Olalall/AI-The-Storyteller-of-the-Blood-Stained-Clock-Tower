import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yaoWuYinXinSmartScriptPack } from './index'

describe('yaoWuYinXinSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(yaoWuYinXinSmartScriptPack.scriptId).toBe("yao-wu-yin-xin")
    expect(yaoWuYinXinSmartScriptPack.displayName).toBe("杳无音信")
    expect(yaoWuYinXinSmartScriptPack.source.contentHash).toBe("sha256:13a59bdd0d3561ad90725defcfdbe1b2b07ff3cec30a471a518b1423b5394a69")
    expect(yaoWuYinXinSmartScriptPack.roles).toHaveLength(25)
    const roleIds = yaoWuYinXinSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('scarletwoman')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('pit-hag')
    expect(roleIds).not.toContain('scarlet_woman')
    expect(roleIds).not.toContain('no_dashii')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = yaoWuYinXinSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = yaoWuYinXinSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('snitch')
    expect(firstNight).toContain('lleech')
    expect(firstNight).toContain('godfather')
    expect(firstNight).toContain('fortuneteller')
    expect(otherNight).toContain('monk')
    expect(otherNight).toContain('pithag')
    expect(otherNight).toContain('pukka')
    expect(otherNight).toContain('vortox')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(yaoWuYinXinSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(yaoWuYinXinSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of yaoWuYinXinSmartScriptPack.setupTemplates) expect(validateTemplateComposition(yaoWuYinXinSmartScriptPack, template).valid, template.templateId).toBe(true)
  })

  it('keeps disruptive setup paths out of first normal templates', () => {
    const templateRoles = new Set(yaoWuYinXinSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('godfather')).toBe(false)
    expect(templateRoles.has('snitch')).toBe(false)
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(yaoWuYinXinSmartScriptPack.roles.map((role) => role.id))
    for (const template of yaoWuYinXinSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
