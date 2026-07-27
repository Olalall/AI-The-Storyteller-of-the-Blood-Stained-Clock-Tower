import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { haoShiDuoMoSmartScriptPack } from './index'

describe('haoShiDuoMoSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(haoShiDuoMoSmartScriptPack.scriptId).toBe("hao-shi-duo-mo")
    expect(haoShiDuoMoSmartScriptPack.displayName).toBe("好事多磨")
    expect(haoShiDuoMoSmartScriptPack.source.contentHash).toBe("sha256:2ad57e09ee5edc0523bea8979d42431922e09cbf68182cd0ad041320d98657a5")
    expect(haoShiDuoMoSmartScriptPack.roles).toHaveLength(31)
    const roleIds = haoShiDuoMoSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('poppygrower')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).not.toContain('snake_charmer')
    expect(roleIds).not.toContain('poppy_grower')
    expect(roleIds).not.toContain('fang_gu')
  })

  it('keeps travelers and Sentinel outside setup templates and bluffs', () => {
    const byId = new Map(haoShiDuoMoSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('barista')?.team).toBe('traveler')
    expect(byId.get('sentinel')?.team).toBe('fabled')
    expect(haoShiDuoMoSmartScriptPack.setupTemplates.some((template) => template.roles.some((roleId) => byId.get(roleId)?.team === 'traveler' || byId.get(roleId)?.team === 'fabled'))).toBe(false)
    expect(haoShiDuoMoSmartScriptPack.setupTemplates.some((template) => template.bluffs.some((roleId) => byId.get(roleId)?.team === 'traveler' || byId.get(roleId)?.team === 'fabled'))).toBe(false)
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = haoShiDuoMoSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = haoShiDuoMoSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('poppygrower')
    expect(firstNight).toContain('snakecharmer')
    expect(firstNight).toContain('cerenovus')
    expect(otherNight).toContain('gambler')
    expect(otherNight).toContain('fanggu')
    expect(otherNight).toContain('gossip')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(haoShiDuoMoSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(haoShiDuoMoSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of haoShiDuoMoSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(haoShiDuoMoSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps the riskiest setup paths out of first normal templates', () => {
    const templateRoles = new Set(haoShiDuoMoSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['drunk', 'heretic', 'fanggu']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })
})
