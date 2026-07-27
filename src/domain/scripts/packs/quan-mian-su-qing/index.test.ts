import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { quanMianSuQingSmartScriptPack } from './index'

describe('quanMianSuQingSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(quanMianSuQingSmartScriptPack.scriptId).toBe("quan-mian-su-qing")
    expect(quanMianSuQingSmartScriptPack.displayName).toBe("全面肃清")
    expect(quanMianSuQingSmartScriptPack.source.contentHash).toBe('sha256:f83b3c5e5a3c14912b36fcdc4f38bdf0aeddb673855b78c124838bd6f6cca807')
    expect(quanMianSuQingSmartScriptPack.roles).toHaveLength(27)
    const roleIds = quanMianSuQingSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('scarletwoman')
    expect(roleIds).toContain('lilmonsta')
    expect(roleIds).toContain('fanggu')
    expect(roleIds).toContain('nodashii')
    expect(roleIds).toContain('spiritofivory')
    expect(roleIds).not.toContain('scarlet_woman')
    expect(roleIds).not.toContain('lil_monsta')
    expect(roleIds).not.toContain('no_dashii')
  })

  it('keeps fabled roles as reminders outside setup templates and bluffs', () => {
    const byId = new Map(quanMianSuQingSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('djinn')?.team).toBe('fabled')
    expect(byId.get('spiritofivory')?.team).toBe('fabled')
    expect(quanMianSuQingSmartScriptPack.setupTemplates.some((template) => template.roles.some((roleId) => byId.get(roleId)?.team === 'fabled'))).toBe(false)
    expect(quanMianSuQingSmartScriptPack.setupTemplates.some((template) => template.bluffs.some((roleId) => byId.get(roleId)?.team === 'fabled'))).toBe(false)
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = quanMianSuQingSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = quanMianSuQingSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('lilmonsta')
    expect(firstNight).toContain('widow')
    expect(firstNight).toContain('balloonist')
    expect(otherNight).toContain('cerenovus')
    expect(otherNight).toContain('nodashii')
    expect(otherNight).toContain('barber')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(quanMianSuQingSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(quanMianSuQingSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of quanMianSuQingSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(quanMianSuQingSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup and hidden/special paths out of first normal templates', () => {
    const templateRoles = new Set(quanMianSuQingSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['balloonist', 'drunk', 'fanggu', 'lilmonsta']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })
})
