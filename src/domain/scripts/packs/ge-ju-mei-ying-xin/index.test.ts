import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { geJuMeiYingXinSmartScriptPack } from './index'

describe('geJuMeiYingXinSmartScriptPack', () => {
  it('keeps source metadata and role ids stable', () => {
    expect(geJuMeiYingXinSmartScriptPack.scriptId).toBe('ge-ju-mei-ying-xin')
    expect(geJuMeiYingXinSmartScriptPack.displayName).toBe("歌剧魅影-新")
    expect(geJuMeiYingXinSmartScriptPack.source.contentHash).toBe('sha256:fc2a22a523a094ee1d84c18a41cc0d7b10a6502672dd385912c9a4a32650111a')
    expect(geJuMeiYingXinSmartScriptPack.roles).toHaveLength(31)
    const roleIds = geJuMeiYingXinSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('pinuocao')
    expect(roleIds).toContain('jiaohuang')
    expect(roleIds).toContain('sishen13')
    expect(roleIds).toContain('benying')
    expect(roleIds).toContain('houpai_guanzhong')
  })

  it('keeps source night order and high-risk reminders available', () => {
    const firstNight = geJuMeiYingXinSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)
    const otherNight = geJuMeiYingXinSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)
    expect(firstNight).toContain('jiaohuang')
    expect(firstNight).toContain('daodiaoren')
    expect(otherNight).toContain('pinuocao')
    expect(otherNight).toContain('sishen13')
    expect(geJuMeiYingXinSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('xiaowangzi')
    expect(geJuMeiYingXinSmartScriptPack.setupRules.map((rule) => rule.roleId)).toContain('benying')
  })

  it('offers verified 7-15 player templates without excluded setup seats', () => {
    expect(geJuMeiYingXinSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(geJuMeiYingXinSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of geJuMeiYingXinSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(geJuMeiYingXinSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.roles).not.toContain('xiaowangzi')
      expect(template.roles).not.toContain('yuzhe')
      expect(template.roles).not.toContain('sishen13')
      expect(template.roles).not.toContain('benying')
      expect(template.roles).not.toContain('shouxi_geshou')
    }
  })
})
