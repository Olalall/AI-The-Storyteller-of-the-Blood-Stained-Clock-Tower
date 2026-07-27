import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { daQuanZaiWoSmartScriptPack } from './index'

describe('daQuanZaiWoSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(daQuanZaiWoSmartScriptPack.scriptId).toBe("da-quan-zai-wo")
    expect(daQuanZaiWoSmartScriptPack.displayName).toBe("大权在握")
    expect(daQuanZaiWoSmartScriptPack.source.contentHash).toBe("sha256:11e225e196b7e2edc77bb6c7a67d3cc75ec9538c3abae4273f2f2b049f9e3950")
    expect(daQuanZaiWoSmartScriptPack.roles).toHaveLength(25)
    const roleIds = daQuanZaiWoSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('bountyhunter')
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).not.toContain('bounty_hunter')
    expect(roleIds).not.toContain('snake_charmer')
    expect(roleIds).not.toContain('pit-hag')
    expect(roleIds).not.toContain('no_dashii')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = daQuanZaiWoSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = daQuanZaiWoSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('lunatic')
    expect(firstNight).toContain('amnesiac')
    expect(firstNight).toContain('widow')
    expect(firstNight).toContain('bountyhunter')
    expect(otherNight).toContain('poisoner')
    expect(otherNight).toContain('snakecharmer')
    expect(otherNight).toContain('pithag')
    expect(otherNight).toContain('shabaloth')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(daQuanZaiWoSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(daQuanZaiWoSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of daQuanZaiWoSmartScriptPack.setupTemplates) expect(validateTemplateComposition(daQuanZaiWoSmartScriptPack, template).valid, template.templateId).toBe(true)
  })

  it('keeps disruptive setup and hidden identity paths out of first normal templates', () => {
    const templateRoles = new Set(daQuanZaiWoSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('bountyhunter')).toBe(false)
    expect(templateRoles.has('balloonist')).toBe(false)
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('lunatic')).toBe(false)
    expect(templateRoles.has('godfather')).toBe(false)
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(daQuanZaiWoSmartScriptPack.roles.map((role) => role.id))
    for (const template of daQuanZaiWoSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
