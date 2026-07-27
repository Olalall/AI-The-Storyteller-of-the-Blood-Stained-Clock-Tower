import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { zuiGeLuanWuSmartScriptPack } from './index'

describe('zuiGeLuanWuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(zuiGeLuanWuSmartScriptPack.scriptId).toBe("zui-ge-luan-wu")
    expect(zuiGeLuanWuSmartScriptPack.displayName).toBe("醉歌乱舞")
    expect(zuiGeLuanWuSmartScriptPack.source.contentHash).toBe("sha256:1d1b6109849cce24c4b48e0dbb4564900d65f13b8f3e588710d5d60f0915f08e")
    expect(zuiGeLuanWuSmartScriptPack.roles).toHaveLength(25)
    const roleIds = zuiGeLuanWuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('bountyhunter')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).not.toContain('bounty_hunter')
    expect(roleIds).not.toContain('pit-hag')
    expect(roleIds).not.toContain('no_dashii')
    expect(roleIds).not.toContain('fang_gu')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = zuiGeLuanWuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = zuiGeLuanWuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('philosopher')
    expect(firstNight).toContain('bountyhunter')
    expect(firstNight).toContain('damsel')
    expect(otherNight).toContain('pithag')
    expect(otherNight).toContain('nodashii')
    expect(otherNight).toContain('fanggu')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(zuiGeLuanWuSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(zuiGeLuanWuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of zuiGeLuanWuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(zuiGeLuanWuSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup and hidden-identity paths out of first normal templates', () => {
    const templateRoles = new Set(zuiGeLuanWuSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['bountyhunter', 'huntsman', 'drunk', 'godfather', 'vigormortis', 'fanggu']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(zuiGeLuanWuSmartScriptPack.roles.map((role) => role.id))
    for (const template of zuiGeLuanWuSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), template.templateId).toBe(true)
        expect(template.roles.includes(bluff), template.templateId).toBe(false)
      }
    }
  })
})
