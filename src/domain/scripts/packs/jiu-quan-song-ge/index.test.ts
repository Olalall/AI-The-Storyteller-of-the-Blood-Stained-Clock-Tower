import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { jiuQuanSongGeSmartScriptPack } from './index'

describe('jiuQuanSongGeSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(jiuQuanSongGeSmartScriptPack.scriptId).toBe("jiu-quan-song-ge")
    expect(jiuQuanSongGeSmartScriptPack.displayName).toBe("九泉颂歌")
    expect(jiuQuanSongGeSmartScriptPack.source.contentHash).toBe('sha256:2d3564050b7fe17046197ff83836da240b2414dcedc00184da29dd0a81b6e30d')
    expect(jiuQuanSongGeSmartScriptPack.roles).toHaveLength(25)
    const roleIds = jiuQuanSongGeSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('simin')
    expect(roleIds).toContain('limao')
    expect(roleIds).toContain('yongjiang')
    expect(roleIds).toContain('yanluo')
    expect(roleIds).toContain('jinweijun2')
    expect(roleIds).toContain('aohe')
    expect(roleIds).not.toContain('21271_11213')
    expect(roleIds).not.toContain('21271_11219')
  })

  it('uses source night order for opening and later nights', () => {
    expect(jiuQuanSongGeSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('limao')
    expect(jiuQuanSongGeSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('yanluo')
    expect(jiuQuanSongGeSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('aohe')
    expect(jiuQuanSongGeSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('po')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(jiuQuanSongGeSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(jiuQuanSongGeSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of jiuQuanSongGeSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(jiuQuanSongGeSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps setup-changing demons and minions out of first normal templates', () => {
    expect(jiuQuanSongGeSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('godfather-outsider-setup')
    expect(jiuQuanSongGeSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('taotie-outsider-setup')
    expect(jiuQuanSongGeSmartScriptPack.setupTemplates.some((template) => template.roles.includes('godfather'))).toBe(false)
    expect(jiuQuanSongGeSmartScriptPack.setupTemplates.some((template) => template.roles.includes('taotie'))).toBe(false)
  })
})
