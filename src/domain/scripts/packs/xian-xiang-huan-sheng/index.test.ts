import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { xianXiangHuanShengSmartScriptPack } from './index'

describe('xianXiangHuanShengSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(xianXiangHuanShengSmartScriptPack.scriptId).toBe("xian-xiang-huan-sheng")
    expect(xianXiangHuanShengSmartScriptPack.displayName).toBe("险象环生")
    expect(xianXiangHuanShengSmartScriptPack.source.contentHash).toBe("sha256:c79b41548a6737825911eac8c5244f972310ec8eeaad78bf13a4c926d98a5997")
    expect(xianXiangHuanShengSmartScriptPack.roles).toHaveLength(21)
    const roleIds = xianXiangHuanShengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('riot')
    expect(roleIds).toContain('marionette')
    expect(roleIds).toContain('balloonist')
    expect(roleIds).toContain('sentinel')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = xianXiangHuanShengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = xianXiangHuanShengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('alchemist')
    expect(firstNight).toContain('lunatic')
    expect(firstNight).toContain('king')
    expect(otherNight).toContain('oracle')
    expect(otherNight).toContain('general')
    expect(otherNight).toContain('balloonist')
  })

  it('provides verified Riot setup templates for all 7-15 player counts', () => {
    expect(xianXiangHuanShengSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(xianXiangHuanShengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of xianXiangHuanShengSmartScriptPack.setupTemplates) {
      expect(template.repeatableRoles).toContain('riot')
      expect(template.roles).toContain('riot')
      expect(template.roles).not.toContain('marionette')
      expect(template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'riot-all-minions')).toBe(true)
      expect(validateTemplateComposition(xianXiangHuanShengSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(xianXiangHuanShengSmartScriptPack.roles.map((role) => role.id))
    for (const template of xianXiangHuanShengSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), `${template.templateId} bluff ${bluff}`).toBe(true)
        expect(template.roles.includes(bluff), `${template.templateId} bluff ${bluff} in play`).toBe(false)
      }
    }
  })
})
