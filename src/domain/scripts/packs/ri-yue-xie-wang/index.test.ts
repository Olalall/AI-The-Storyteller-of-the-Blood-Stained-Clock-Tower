import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { riYueXieWangSmartScriptPack } from './index'

describe('riYueXieWangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and role mapping', () => {
    expect(riYueXieWangSmartScriptPack.scriptId).toBe("ri-yue-xie-wang")
    expect(riYueXieWangSmartScriptPack.displayName).toBe("日月偕亡")
    expect(riYueXieWangSmartScriptPack.source.contentHash).toBe('sha256:51a82d06313ee171f3ead5735e2fc9590515af0a6224fb3b3615de65f5eda864')
    expect(riYueXieWangSmartScriptPack.roles).toHaveLength(25)
    const roleIds = riYueXieWangSmartScriptPack.roles.map((role) => role.id)
    expect(roleIds).toContain('fortuneteller')
    expect(roleIds).toContain('ranfangfangzhu')
    expect(roleIds).toContain('xuncha')
    expect(roleIds).toContain('aohe')
    expect(roleIds).toContain('baojun')
    expect(roleIds).not.toContain('21530_11755')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(riYueXieWangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('chef')
    expect(riYueXieWangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toContain('marionette')
    expect(riYueXieWangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('baojun')
    expect(riYueXieWangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('vortox')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    expect(riYueXieWangSmartScriptPack.setupTemplates).toHaveLength(22)
    expect(new Set(riYueXieWangSmartScriptPack.setupTemplates.map((template) => template.playerCount))).toEqual(new Set([7, 8, 9, 10, 11, 12, 13, 14, 15]))
    for (const template of riYueXieWangSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(riYueXieWangSmartScriptPack, template).valid, template.templateId).toBe(true)
      expect(template.verified).toBe(true)
    }
  })

  it('keeps high-risk role mechanics as reminders only', () => {
    expect(riYueXieWangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('marionette-demon-neighbor')
    expect(riYueXieWangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('baojun-night-death-count')
    expect(riYueXieWangSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('aohe-absent-role-fallback')
    expect(riYueXieWangSmartScriptPack.setupTemplates.some((template) => template.roles.includes('marionette'))).toBe(false)
  })
})
