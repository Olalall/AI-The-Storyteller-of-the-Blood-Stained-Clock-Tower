import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { shenFenWeiJiSmartScriptPack } from './index'

describe('shenFenWeiJiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(shenFenWeiJiSmartScriptPack.scriptId).toBe("shen-fen-wei-ji")
    expect(shenFenWeiJiSmartScriptPack.displayName).toBe("身份危机")
    expect(shenFenWeiJiSmartScriptPack.source.contentHash).toBe("sha256:627eeec710a42b9e23055b40a99f6759e7eb3647e607fb77cc76239ea9382a95")
    expect(shenFenWeiJiSmartScriptPack.roles).toHaveLength(25)
    const roleIds = shenFenWeiJiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('lleech')
    expect(roleIds).toContain('lilmonsta')
    expect(roleIds).toContain('mezepheles')
    expect(roleIds).toContain('snakecharmer')
  })

  it('uses source night order for opening and later nights', () => {
    expect(shenFenWeiJiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('marionette')
    expect(shenFenWeiJiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('lleech')
    expect(shenFenWeiJiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('snakecharmer')
    expect(shenFenWeiJiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(shenFenWeiJiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(shenFenWeiJiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of shenFenWeiJiSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(shenFenWeiJiSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing paths out of first normal templates', () => {
    const templateRoles = new Set(shenFenWeiJiSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('fanggu')).toBe(false)
    expect(templateRoles.has('lilmonsta')).toBe(false)
    expect(templateRoles.has('bountyhunter')).toBe(false)
    expect(templateRoles.has('balloonist')).toBe(false)
  })
})
