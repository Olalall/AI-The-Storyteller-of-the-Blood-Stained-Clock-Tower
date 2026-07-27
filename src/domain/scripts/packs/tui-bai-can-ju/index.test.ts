import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { tuiBaiCanJuSmartScriptPack } from './index'

describe('tuiBaiCanJuSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(tuiBaiCanJuSmartScriptPack.scriptId).toBe("tui-bai-can-ju")
    expect(tuiBaiCanJuSmartScriptPack.displayName).toBe("颓败残局")
    expect(tuiBaiCanJuSmartScriptPack.source.contentHash).toBe("sha256:46081acf6345af84282789aabeb4c82cc2390268c06479f82321d8c82e1f3fd6")
    expect(tuiBaiCanJuSmartScriptPack.roles).toHaveLength(30)
    const roleIds = tuiBaiCanJuSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('wang')
    expect(roleIds).toContain('wang_hou')
    expect(roleIds).toContain('xiang')
    expect(roleIds).toContain('ma')
    expect(roleIds).toContain('che')
    expect(roleIds).toContain('shi_ke')
    expect(roleIds).toContain('wang_zi')
    expect(roleIds).toContain('wei_wang')
    expect(roleIds).toContain('cuan_wei_zhe')
    expect(roleIds).toContain('ju_ren')
    expect(roleIds).toContain('fei_long')
    expect(roleIds).toContain('yan_mo')
    expect(roleIds).toContain('mo_gan_na')
  })

  it('uses source night order for opening and later nights', () => {
    expect(tuiBaiCanJuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('mo_gan_na')
    expect(tuiBaiCanJuSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('wang')
    expect(tuiBaiCanJuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('qing_fu')
    expect(tuiBaiCanJuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('gong_fan')
    expect(tuiBaiCanJuSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('cuan_wei_zhe')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(tuiBaiCanJuSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(tuiBaiCanJuSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of tuiBaiCanJuSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(tuiBaiCanJuSmartScriptPack, template).valid, template.templateId).toBe(true)
    }
  })

  it('keeps setup-changing and special paths out of first normal templates', () => {
    const templateRoles = new Set(tuiBaiCanJuSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('wei_wang')).toBe(false)
    expect(templateRoles.has('cuan_wei_zhe')).toBe(false)
    expect(templateRoles.has('yan_mo')).toBe(false)
    expect(templateRoles.has('mo_gan_na')).toBe(false)
    expect(templateRoles.has('zhi_gao_wu_shang')).toBe(false)
  })
})
