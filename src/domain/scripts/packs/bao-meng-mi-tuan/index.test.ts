import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { baoMengMiTuanSmartScriptPack } from './index'

describe('baoMengMiTuanSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(baoMengMiTuanSmartScriptPack.scriptId).toBe("bao-meng-mi-tuan")
    expect(baoMengMiTuanSmartScriptPack.displayName).toBe("宝梦谜团")
    expect(baoMengMiTuanSmartScriptPack.source.contentHash).toBe('sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f')
    expect(baoMengMiTuanSmartScriptPack.roles).toHaveLength(33)
    const roleIds = baoMengMiTuanSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('bountyhunter')
    expect(roleIds).toContain('towncrier')
    expect(roleIds).toContain('eviltwin')
    expect(roleIds).toContain('pithag')
    expect(roleIds).toContain('lilmonsta')
    expect(roleIds).toContain('bonecollector')
    expect(roleIds).not.toContain('bounty_hunter')
    expect(roleIds).not.toContain('town_crier')
    expect(roleIds).not.toContain('pit-hag')
    expect(roleIds).not.toContain('lil_monsta')
  })

  it('keeps travelers and fabled as reminders outside setup templates', () => {
    const byId = new Map(baoMengMiTuanSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('matron')?.team).toBe('traveler')
    expect(byId.get('djinn')?.team).toBe('fabled')
    expect(baoMengMiTuanSmartScriptPack.setupTemplates.some((template) => template.roles.some((roleId) => byId.get(roleId)?.team === 'traveler' || byId.get(roleId)?.team === 'fabled'))).toBe(false)
    expect(baoMengMiTuanSmartScriptPack.setupTemplates.some((template) => template.bluffs.some((roleId) => byId.get(roleId)?.team === 'traveler' || byId.get(roleId)?.team === 'fabled'))).toBe(false)
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(baoMengMiTuanSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(baoMengMiTuanSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of baoMengMiTuanSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(baoMengMiTuanSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps special setup paths out of first normal templates', () => {
    const templateRoles = new Set(baoMengMiTuanSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['bountyhunter', 'drunk', 'marionette', 'lilmonsta', 'legion']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })
})
