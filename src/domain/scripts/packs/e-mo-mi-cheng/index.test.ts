import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { eMoMiChengSmartScriptPack } from './index'

describe('eMoMiChengSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(eMoMiChengSmartScriptPack.scriptId).toBe("e-mo-mi-cheng")
    expect(eMoMiChengSmartScriptPack.displayName).toBe("恶魔谜城")
    expect(eMoMiChengSmartScriptPack.source.contentHash).toBe("sha256:0ecf691d816b1cb95b23d112e2512b691a8851f894bc1bab9c931d500edb7ab2")
    expect(eMoMiChengSmartScriptPack.roles).toHaveLength(25)
    const roleIds = eMoMiChengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('pithag')
    expect(roleIds).not.toContain('pit-hag')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = eMoMiChengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = eMoMiChengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('king')
    expect(firstNight).toContain('widow')
    expect(firstNight).toContain('cerenovus')
    expect(firstNight).toContain('pukka')
    expect(otherNight).toContain('innkeeper')
    expect(otherNight).toContain('courtier')
    expect(otherNight).toContain('pithag')
    expect(otherNight).toContain('vortox')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(eMoMiChengSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(eMoMiChengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of eMoMiChengSmartScriptPack.setupTemplates) expect(validateTemplateComposition(eMoMiChengSmartScriptPack, template).valid, template.templateId).toBe(true)
  })

  it('keeps disruptive setup and hidden identity paths out of first normal templates', () => {
    const templateRoles = new Set(eMoMiChengSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('huntsman')).toBe(false)
    expect(templateRoles.has('damsel')).toBe(false)
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('godfather')).toBe(false)
    expect(templateRoles.has('vigormortis')).toBe(false)
    expect(templateRoles.has('choirboy')).toBe(false)
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(eMoMiChengSmartScriptPack.roles.map((role) => role.id))
    for (const template of eMoMiChengSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
