import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { hengXingBaDaoSmartScriptPack } from './index'

describe('hengXingBaDaoSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(hengXingBaDaoSmartScriptPack.scriptId).toBe("heng-xing-ba-dao")
    expect(hengXingBaDaoSmartScriptPack.displayName).toBe("横行霸道")
    expect(hengXingBaDaoSmartScriptPack.source.contentHash).toBe("sha256:3143c0f142a7d5ebd609934396a50339f2b662c0e9dce81768197ab34230899b")
    expect(hengXingBaDaoSmartScriptPack.roles).toHaveLength(25)
    const roleIds = hengXingBaDaoSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('tealady')
    expect(roleIds).toContain('poppygrower')
    expect(roleIds).toContain('devilsadvocate')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('snake_charmer')
    expect(roleIds).not.toContain('tea_lady')
    expect(roleIds).not.toContain('poppy_grower')
    expect(roleIds).not.toContain('devils_advocate')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = hengXingBaDaoSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = hengXingBaDaoSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('alchemist')
    expect(firstNight).toContain('poppygrower')
    expect(firstNight).toContain('lleech')
    expect(firstNight).toContain('snakecharmer')
    expect(otherNight).toContain('sailor')
    expect(otherNight).toContain('poisoner')
    expect(otherNight).toContain('imp')
    expect(otherNight).toContain('juggler')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(hengXingBaDaoSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(hengXingBaDaoSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of hengXingBaDaoSmartScriptPack.setupTemplates) expect(validateTemplateComposition(hengXingBaDaoSmartScriptPack, template).valid, template.templateId).toBe(true)
  })

  it('keeps disruptive setup and reversal paths out of first normal templates', () => {
    const templateRoles = new Set(hengXingBaDaoSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('huntsman')).toBe(false)
    expect(templateRoles.has('damsel')).toBe(false)
    expect(templateRoles.has('heretic')).toBe(false)
    expect(templateRoles.has('poppygrower')).toBe(false)
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(hengXingBaDaoSmartScriptPack.roles.map((role) => role.id))
    for (const template of hengXingBaDaoSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
