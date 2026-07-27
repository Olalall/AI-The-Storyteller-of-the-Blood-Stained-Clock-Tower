import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { jiuZhuanQianCengSmartScriptPack } from './index'

describe('jiuZhuanQianCengSmartScriptPack', () => {
  it('keeps the locked GStone source hash and normalized role mapping', () => {
    expect(jiuZhuanQianCengSmartScriptPack.scriptId).toBe("jiu-zhuan-qian-ceng")
    expect(jiuZhuanQianCengSmartScriptPack.displayName).toBe("九转千层")
    expect(jiuZhuanQianCengSmartScriptPack.source.contentHash).toBe('sha256:5cb45033a75468c0ed9957b86f5b73b5a8bd5301f891cefd1723eb3bd3a7dd81')
    expect(jiuZhuanQianCengSmartScriptPack.roles).toHaveLength(30)
    const roleIds = jiuZhuanQianCengSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('bonecollector')
    expect(roleIds).not.toContain('bone_collector')
  })

  it('keeps travelers as reminders outside setup templates and bluffs', () => {
    const byId = new Map(jiuZhuanQianCengSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(byId.get('scapegoat')?.team).toBe('traveler')
    expect(byId.get('judge')?.team).toBe('traveler')
    expect(jiuZhuanQianCengSmartScriptPack.setupTemplates.some((template) => template.roles.some((roleId) => byId.get(roleId)?.team === 'traveler'))).toBe(false)
    expect(jiuZhuanQianCengSmartScriptPack.setupTemplates.some((template) => template.bluffs.some((roleId) => byId.get(roleId)?.team === 'traveler'))).toBe(false)
  })

  it('uses source night order for opening and later nights', () => {
    const firstNight = jiuZhuanQianCengSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = jiuZhuanQianCengSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('philosopher')
    expect(firstNight).toContain('snitch')
    expect(firstNight).toContain('balloonist')
    expect(otherNight).toContain('innkeeper')
    expect(otherNight).toContain('pukka')
    expect(otherNight).toContain('vigormortis')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(jiuZhuanQianCengSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(jiuZhuanQianCengSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of jiuZhuanQianCengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(jiuZhuanQianCengSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup and hidden-identity paths out of first normal templates', () => {
    const templateRoles = new Set(jiuZhuanQianCengSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    for (const roleId of ['balloonist', 'snitch', 'drunk', 'godfather', 'vigormortis']) {
      expect(templateRoles.has(roleId)).toBe(false)
    }
  })
})
