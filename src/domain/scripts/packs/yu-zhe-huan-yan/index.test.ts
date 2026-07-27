import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { yuZheHuanYanSmartScriptPack } from './index'

describe('yuZheHuanYanSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(yuZheHuanYanSmartScriptPack.scriptId).toBe("yu-zhe-huan-yan")
    expect(yuZheHuanYanSmartScriptPack.displayName).toBe("愚者欢宴")
    expect(yuZheHuanYanSmartScriptPack.source.contentHash).toBe('sha256:4571db2ca9cfb548f5357a82e87a05a7c29b128678d43d4be427aa444b897e06')
    expect(yuZheHuanYanSmartScriptPack.roles).toHaveLength(25)
    const roleIds = yuZheHuanYanSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('organgrinder')
    expect(roleIds).toContain('vortex')
    expect(roleIds).toContain('vigormortis')
    expect(roleIds).toContain('heretic')
    expect(roleIds).toContain('snakecharmer')
  })

  it('uses source night order for opening and later nights', () => {
    expect(yuZheHuanYanSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('poppygrower')
    expect(yuZheHuanYanSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('fearmonger')
    expect(yuZheHuanYanSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('snakecharmer')
    expect(yuZheHuanYanSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('vortex')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(yuZheHuanYanSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(yuZheHuanYanSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of yuZheHuanYanSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(yuZheHuanYanSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing paths out of first normal templates', () => {
    const templateRoles = new Set(yuZheHuanYanSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('balloonist')).toBe(false)
    expect(templateRoles.has('baron')).toBe(false)
    expect(templateRoles.has('bountyhunter')).toBe(false)
    expect(templateRoles.has('vigormortis')).toBe(false)
  })
})
