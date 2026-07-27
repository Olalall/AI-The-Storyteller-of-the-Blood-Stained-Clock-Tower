import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { shuoShuRenZhiNuSmartScriptPack } from './index'

describe('shuoShuRenZhiNuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(shuoShuRenZhiNuSmartScriptPack.scriptId).toBe("shuo-shu-ren-zhi-nu")
    expect(shuoShuRenZhiNuSmartScriptPack.displayName).toBe("说书人之怒")
    expect(shuoShuRenZhiNuSmartScriptPack.source.contentHash).toBe("sha256:6e26d3024bfd22e2268aa4713d718057a85ef4612956c4a5694c9a838939b0ca")
    expect(shuoShuRenZhiNuSmartScriptPack.roles).toHaveLength(25)
    const roleIds = shuoShuRenZhiNuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('vortex')
    expect(roleIds).toContain('zombuul')
    expect(roleIds).toContain('atheist')
    expect(roleIds).toContain('philosopher')
  })

  it('uses source night order for opening and later nights', () => {
    expect(shuoShuRenZhiNuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('marionette')
    expect(shuoShuRenZhiNuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('lilmonsta')
    expect(shuoShuRenZhiNuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('snakecharmer')
    expect(shuoShuRenZhiNuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('vortex')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(shuoShuRenZhiNuSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(shuoShuRenZhiNuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of shuoShuRenZhiNuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(shuoShuRenZhiNuSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-breaking paths out of first normal templates', () => {
    const templateRoles = new Set(shuoShuRenZhiNuSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('legion')).toBe(false)
    expect(templateRoles.has('lilmonsta')).toBe(false)
    expect(templateRoles.has('bountyhunter')).toBe(false)
    expect(templateRoles.has('atheist')).toBe(false)
  })
})
