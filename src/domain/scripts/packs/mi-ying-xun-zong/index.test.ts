import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { miYingXunZongSmartScriptPack } from './index'

describe('miYingXunZongSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(miYingXunZongSmartScriptPack.scriptId).toBe("mi-ying-xun-zong")
    expect(miYingXunZongSmartScriptPack.displayName).toBe("觅影寻踪")
    expect(miYingXunZongSmartScriptPack.source.contentHash).toBe("sha256:4a44da87af812886d77d55628a4b1f169e98ed1116df511e0e9bae5067191a61")
    expect(miYingXunZongSmartScriptPack.roles).toHaveLength(24)
    const roleIds = miYingXunZongSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('towncrier')
    expect(roleIds).not.toContain('town_crier')
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = miYingXunZongSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = miYingXunZongSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('mezepheles')
    expect(firstNight).toContain('damsel')
    expect(firstNight).toContain('librarian')
    expect(otherNight).toContain('towncrier')
    expect(otherNight).toContain('pukka')
    expect(otherNight).toContain('vigormortis')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(miYingXunZongSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(miYingXunZongSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of miYingXunZongSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(miYingXunZongSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup and hidden-identity paths out of first normal templates', () => {
    const templateRoles = new Set(miYingXunZongSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['huntsman', 'drunk', 'godfather', 'vigormortis']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })

  it('keeps demon bluffs out of play and inside the same pack', () => {
    const roleIds = new Set(miYingXunZongSmartScriptPack.roles.map((role) => role.id))
    for (const template of miYingXunZongSmartScriptPack.setupTemplates) {
      for (const bluff of template.bluffs) {
        expect(roleIds.has(bluff), template.templateId).toBe(true)
        expect(template.roles.includes(bluff), template.templateId).toBe(false)
      }
    }
  })
})
