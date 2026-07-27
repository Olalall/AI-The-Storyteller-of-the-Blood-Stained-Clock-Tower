import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { tongYanWuJiSmartScriptPack } from './index'

describe('tongYanWuJiSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(tongYanWuJiSmartScriptPack.scriptId).toBe('tong-yan-wu-ji')
    expect(tongYanWuJiSmartScriptPack.displayName).toBe('童言无忌')
    expect(tongYanWuJiSmartScriptPack.source.contentHash).toBe('sha256:1fa9a250c28443fdf191650d76849fece7176f4445a2539aaa92eb3b4e6289c1')
    expect(tongYanWuJiSmartScriptPack.roles).toHaveLength(26)
    const roleIds = tongYanWuJiSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('xiong_hai_zi')
    expect(roleIds).toContain('tongyan_si_huo_shang_ren')
    expect(roleIds).toContain('mezepheles')
    expect(roleIds).toContain('qiongqi')
  })

  it('uses source night order for opening and later nights', () => {
    expect(tongYanWuJiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('poppygrower')
    expect(tongYanWuJiSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('clockmaker')
    expect(tongYanWuJiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('imp')
    expect(tongYanWuJiSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gossip')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(tongYanWuJiSmartScriptPack.setupTemplates).toHaveLength(27)
    expect(new Set(tongYanWuJiSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of tongYanWuJiSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(tongYanWuJiSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing and fabled paths out of first normal templates', () => {
    const templateRoles = new Set(tongYanWuJiSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('tongyan_si_huo_shang_ren')).toBe(false)
    expect(templateRoles.has('drunk')).toBe(false)
    expect(templateRoles.has('yao_seng')).toBe(false)
    expect(templateRoles.has('fanggu')).toBe(false)
    expect(templateRoles.has('taotie')).toBe(false)
    expect(templateRoles.has('qiongqi')).toBe(false)
  })
})
