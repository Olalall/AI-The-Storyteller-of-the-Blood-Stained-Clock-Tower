import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { jiaoHuanRenShengSmartScriptPack } from './index'

describe('jiaoHuanRenShengSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(jiaoHuanRenShengSmartScriptPack.scriptId).toBe("jiao-huan-ren-sheng")
    expect(jiaoHuanRenShengSmartScriptPack.displayName).toBe("交换人生")
    expect(jiaoHuanRenShengSmartScriptPack.source.contentHash).toBe("sha256:5a8ffe9462255b6792c66e4c1267d26936c215b185cf37c613e51293e5380716")
    expect(jiaoHuanRenShengSmartScriptPack.roles).toHaveLength(27)
    const roleIds = jiaoHuanRenShengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('qianke')
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('rulianshi')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('gudiao')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).toContain('hundun')
    expect(roleIds).toContain('fanggu')
  })

  it('uses source night order for opening and later nights', () => {
    expect(jiaoHuanRenShengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('qianke')
    expect(jiaoHuanRenShengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('snakecharmer')
    expect(jiaoHuanRenShengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('pithag')
    expect(jiaoHuanRenShengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('nodashii')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(jiaoHuanRenShengSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(jiaoHuanRenShengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of jiaoHuanRenShengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(jiaoHuanRenShengSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing paths out of first normal templates', () => {
    const templateRoles = new Set(jiaoHuanRenShengSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('cun_fu')).toBe(false)
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('vigormortis')).toBe(false)
    expect(templateRoles.has('fanggu')).toBe(false)
  })
})
