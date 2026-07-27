import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { guiJueYiXiangSmartScriptPack } from './index'

describe('guiJueYiXiangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and custom role mapping', () => {
    expect(guiJueYiXiangSmartScriptPack.scriptId).toBe("gui-jue-yi-xiang")
    expect(guiJueYiXiangSmartScriptPack.displayName).toBe("诡谲异象（测试中）")
    expect(guiJueYiXiangSmartScriptPack.source.contentHash).toBe("sha256:b999d9d8d9a375152a41286362c7496ed3b0d68fd1e09230fd18c048cc7ad2e3")
    expect(guiJueYiXiangSmartScriptPack.roles).toHaveLength(27)
    const roleIds = guiJueYiXiangSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('nichen')
    expect(roleIds).toContain('hundun')
    expect(roleIds).toContain('gudiao')
    expect(roleIds).toContain('jinyiwei')
  })

  it('uses source night order for opening and later nights', () => {
    expect(guiJueYiXiangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('hundun')
    expect(guiJueYiXiangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('nichen')
    expect(guiJueYiXiangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gudiao')
    expect(guiJueYiXiangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('dianyuzhang')
  })

  it('provides verified setup templates for all 7-15 player counts without travelers', () => {
    expect(guiJueYiXiangSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(guiJueYiXiangSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    const roleById = new Map(guiJueYiXiangSmartScriptPack.roles.map((role) => [role.id, role]))
    for (const template of guiJueYiXiangSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(guiJueYiXiangSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles.some((roleId) => roleById.get(roleId)?.team === 'traveler'), template.templateId).toBe(false)
    }
  })

  it('keeps setup-changing paths out of first normal templates', () => {
    const templateRoles = new Set(guiJueYiXiangSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('hundun')).toBe(false)
    expect(templateRoles.has('taotie')).toBe(false)
    expect(templateRoles.has('niangjiushi')).toBe(false)
  })
})
