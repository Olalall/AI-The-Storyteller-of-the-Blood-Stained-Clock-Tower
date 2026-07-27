import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { baoYueChuShengSmartScriptPack } from './index'

describe('baoYueChuShengSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(baoYueChuShengSmartScriptPack.scriptId).toBe("bao-yue-chu-sheng")
    expect(baoYueChuShengSmartScriptPack.displayName).toBe("宝月初升")
    expect(baoYueChuShengSmartScriptPack.source.contentHash).toBe('sha256:73a0d102934967b66a455b6d8f5e012bcfb9fbd720efc38c2340240a7d7a7893')
    expect(baoYueChuShengSmartScriptPack.roles).toHaveLength(25)
    const roleIds = baoYueChuShengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('lilmonsta')
    expect(roleIds).toContain('shabaloth')
    expect(roleIds).toContain('po')
    expect(roleIds).not.toContain('snake_charmer')
    expect(roleIds).not.toContain('lil_monsta')
  })

  it('uses source night order for opening and later nights', () => {
    expect(baoYueChuShengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('lilmonsta')
    expect(baoYueChuShengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('widow')
    expect(baoYueChuShengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('snakecharmer')
    expect(baoYueChuShengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gambler')
    expect(baoYueChuShengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pukka')
    expect(baoYueChuShengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('shabaloth')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(baoYueChuShengSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(baoYueChuShengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of baoYueChuShengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(baoYueChuShengSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup and hidden-identity paths out of first normal templates', () => {
    const templateRoles = new Set(baoYueChuShengSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('balloonist')).toBe(false)
    expect(templateRoles.has('choirboy')).toBe(false)
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('godfather')).toBe(false)
    expect(templateRoles.has('lilmonsta')).toBe(false)
  })
})
