import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { huiXuanMiZhenSmartScriptPack } from './index'

describe('huiXuanMiZhenSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(huiXuanMiZhenSmartScriptPack.scriptId).toBe("hui-xuan-mi-zhen")
    expect(huiXuanMiZhenSmartScriptPack.displayName).toBe("回旋迷阵")
    expect(huiXuanMiZhenSmartScriptPack.source.contentHash).toBe('sha256:af0a238cd7827215b5827a3a799d77d1761ef81ea30a74f0df5407d18b3f15c7')
    expect(huiXuanMiZhenSmartScriptPack.roles).toHaveLength(30)
    const roleIds = huiXuanMiZhenSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('towncrier')
    expect(roleIds).toContain('lilmonsta')
    expect(roleIds).not.toContain('fortune_teller')
    expect(roleIds).not.toContain('town_crier')
    expect(roleIds).not.toContain('lil_monsta')
  })

  it('keeps travelers as reminders outside setup templates and bluffs', () => {
    const byId = new Map(huiXuanMiZhenSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('barista')?.team).toBe('traveler')
    expect(byId.get('voudon')?.team).toBe('traveler')
    expect(huiXuanMiZhenSmartScriptPack.setupTemplates.some((template) => template.roles.some((roleId) => byId.get(roleId)?.team === 'traveler'))).toBe(false)
    expect(huiXuanMiZhenSmartScriptPack.setupTemplates.some((template) => template.bluffs.some((roleId) => byId.get(roleId)?.team === 'traveler'))).toBe(false)
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = huiXuanMiZhenSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = huiXuanMiZhenSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('philosopher')
    expect(firstNight).toContain('marionette')
    expect(firstNight).toContain('lilmonsta')
    expect(otherNight).toContain('cerenovus')
    expect(otherNight).toContain('vortox')
    expect(otherNight).toContain('legion')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(huiXuanMiZhenSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(huiXuanMiZhenSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of huiXuanMiZhenSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(huiXuanMiZhenSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps the riskiest setup paths out of first normal templates', () => {
    const templateRoles = new Set(huiXuanMiZhenSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['drunk', 'godfather', 'lilmonsta', 'vigormortis', 'legion']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })
})
