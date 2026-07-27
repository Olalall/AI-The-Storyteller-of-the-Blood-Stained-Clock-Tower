import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { xinLiBoYiSmartScriptPack } from './index'

describe('xinLiBoYiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(xinLiBoYiSmartScriptPack.scriptId).toBe("xin-li-bo-yi")
    expect(xinLiBoYiSmartScriptPack.displayName).toBe("心理博弈")
    expect(xinLiBoYiSmartScriptPack.source.contentHash).toBe("sha256:e208bc31314b6faab9a17b6d74f5e93aa5ebba218fe9132402a46818ff1d2708")
    expect(xinLiBoYiSmartScriptPack.roles).toHaveLength(25)
    const roleIds = xinLiBoYiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('bountyhunter')
    expect(roleIds).toContain('pithag')
    expect(roleIds).not.toContain('bounty_hunter')
    expect(roleIds).not.toContain('pit-hag')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = xinLiBoYiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = xinLiBoYiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('preacher')
    expect(firstNight).toContain('widow')
    expect(firstNight).toContain('bountyhunter')
    expect(firstNight).toContain('leviathan')
    expect(otherNight).toContain('poisoner')
    expect(otherNight).toContain('gambler')
    expect(otherNight).toContain('lycanthrope')
    expect(otherNight).toContain('po')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(xinLiBoYiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(xinLiBoYiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of xinLiBoYiSmartScriptPack.setupTemplates) expect(validateTemplateComposition(xinLiBoYiSmartScriptPack, template).valid, template.templateId).toBe(true)
  })

  it('keeps disruptive setup and special Demon paths out of first normal templates', () => {
    const templateRoles = new Set(xinLiBoYiSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('bountyhunter')).toBe(false)
    expect(templateRoles.has('godfather')).toBe(false)
    expect(templateRoles.has('vigormortis')).toBe(false)
    expect(templateRoles.has('leviathan')).toBe(false)
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(xinLiBoYiSmartScriptPack.roles.map((role) => role.id))
    for (const template of xinLiBoYiSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
