import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { huoShanJiaoTuanSmartScriptPack } from './index'

describe('huoShanJiaoTuanSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(huoShanJiaoTuanSmartScriptPack.scriptId).toBe("huo-shan-jiao-tuan")
    expect(huoShanJiaoTuanSmartScriptPack.displayName).toBe("火山教团")
    expect(huoShanJiaoTuanSmartScriptPack.source.contentHash).toBe('sha256:8762cec1b585af2fc9314cfa31c38a46e32099d215ebcc8159ec0ae945bac3f1')
    expect(huoShanJiaoTuanSmartScriptPack.roles).toHaveLength(25)
    const roleIds = huoShanJiaoTuanSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('towncrier')
    expect(roleIds).toContain('devilsadvocate')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).not.toContain('snake_charmer')
    expect(roleIds).not.toContain('town_crier')
    expect(roleIds).not.toContain('devils_advocate')
    expect(roleIds).not.toContain('fang_gu')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = huoShanJiaoTuanSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = huoShanJiaoTuanSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('king')
    expect(firstNight).toContain('snakecharmer')
    expect(firstNight).toContain('balloonist')
    expect(otherNight).toContain('devilsadvocate')
    expect(otherNight).toContain('cerenovus')
    expect(otherNight).toContain('vortox')
    expect(otherNight).toContain('lleech')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(huoShanJiaoTuanSmartScriptPack.setupTemplates).toHaveLength(23)
    expect(new Set(huoShanJiaoTuanSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of huoShanJiaoTuanSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(huoShanJiaoTuanSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup, hidden-identity and special demon paths out of first normal templates', () => {
    const templateRoles = new Set(huoShanJiaoTuanSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['balloonist', 'choirboy', 'drunk', 'fanggu', 'legion']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })
})
