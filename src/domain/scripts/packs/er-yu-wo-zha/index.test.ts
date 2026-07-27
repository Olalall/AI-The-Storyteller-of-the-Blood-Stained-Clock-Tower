import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { erYuWoZhaSmartScriptPack } from './index'

describe('erYuWoZhaSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(erYuWoZhaSmartScriptPack.scriptId).toBe("er-yu-wo-zha")
    expect(erYuWoZhaSmartScriptPack.displayName).toBe("尔虞我诈")
    expect(erYuWoZhaSmartScriptPack.source.contentHash).toBe("sha256:7f808685e84f16b77b34a486fcf2548efbc5ef9feaa9215010ff563d742aca63")
    expect(erYuWoZhaSmartScriptPack.roles).toHaveLength(26)
    const roleIds = erYuWoZhaSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('snake_charmer')
    expect(roleIds).not.toContain('pit-hag')
    expect(roleIds).not.toContain('fang_gu')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = erYuWoZhaSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = erYuWoZhaSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('philosopher')
    expect(firstNight).toContain('amnesiac')
    expect(firstNight).toContain('snakecharmer')
    expect(firstNight).toContain('cerenovus')
    expect(otherNight).toContain('poisoner')
    expect(otherNight).toContain('monk')
    expect(otherNight).toContain('pithag')
    expect(otherNight).toContain('vigormortis')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(erYuWoZhaSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(erYuWoZhaSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of erYuWoZhaSmartScriptPack.setupTemplates) expect(validateTemplateComposition(erYuWoZhaSmartScriptPack, template).valid, template.templateId).toBe(true)
  })

  it('keeps disruptive setup and Fabled paths out of first normal templates', () => {
    const templateRoles = new Set(erYuWoZhaSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('heretic')).toBe(false)
    expect(templateRoles.has('fanggu')).toBe(false)
    expect(templateRoles.has('vigormortis')).toBe(false)
    expect(templateRoles.has('djinn')).toBe(false)
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(erYuWoZhaSmartScriptPack.roles.map((role) => role.id))
    for (const template of erYuWoZhaSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
