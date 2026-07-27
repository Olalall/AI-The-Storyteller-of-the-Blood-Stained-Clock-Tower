import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { shiYanJiaoChiSmartScriptPack } from './index'

describe('shiYanJiaoChiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(shiYanJiaoChiSmartScriptPack.scriptId).toBe("shi-yan-jiao-chi")
    expect(shiYanJiaoChiSmartScriptPack.displayName).toBe("势焰交炽")
    expect(shiYanJiaoChiSmartScriptPack.source.contentHash).toBe('sha256:e4284fb1045e416d1384aafca95e6e83fcc43cb3a2550910dee165a19f574ef9')
    expect(shiYanJiaoChiSmartScriptPack.roles).toHaveLength(25)
    const roleIds = shiYanJiaoChiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('snakecharmer')
    expect(roleIds).toContain('summoner')
    expect(roleIds).toContain('bingbi')
    expect(roleIds).toContain('ranfangfangzhu')
    expect(roleIds).not.toContain('21531_11761')
    expect(roleIds.filter((roleId) => roleId === 'cannibal')).toHaveLength(1)
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(shiYanJiaoChiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('ogre')
    expect(shiYanJiaoChiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('summoner')
    expect(shiYanJiaoChiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('qianke')
    expect(shiYanJiaoChiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('nodashii')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(shiYanJiaoChiSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(shiYanJiaoChiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of shiYanJiaoChiSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(shiYanJiaoChiSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps setup-changing roles as explicit reminders', () => {
    expect(shiYanJiaoChiSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('summoner-no-demon')
    expect(shiYanJiaoChiSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('taotie-extra-outsider')
    expect(shiYanJiaoChiSmartScriptPack.setupTemplates.some((template) => template.roles.includes('summoner'))).toBe(false)
    expect(shiYanJiaoChiSmartScriptPack.setupTemplates.some((template) => template.roles.includes('taotie'))).toBe(false)
    expect(shiYanJiaoChiSmartScriptPack.setupTemplates.filter((template) => template.roles.includes('godfather')).every((template) => template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'godfather-outsider'))).toBe(true)
  })
})
