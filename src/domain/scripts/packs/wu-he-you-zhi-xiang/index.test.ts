import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { wuHeYouZhiXiangSmartScriptPack } from '.'

describe('wuHeYouZhiXiangSmartScriptPack', () => {
  it('keeps the locked GStone source hash and 25 role mapping', () => {
    expect(wuHeYouZhiXiangSmartScriptPack.scriptId).toBe('wu-he-you-zhi-xiang')
    expect(wuHeYouZhiXiangSmartScriptPack.displayName).toBe("无何有之乡")
    expect(wuHeYouZhiXiangSmartScriptPack.source.contentHash).toBe("sha256:2339a029e70a71b16a7ecad56a64051f0852b7336b9e26d1708a046ed7b30a87")
    expect(wuHeYouZhiXiangSmartScriptPack.roles).toHaveLength(25)
    expect(wuHeYouZhiXiangSmartScriptPack.roles.map((role) => role.id)).toContain('villageidiot')
    expect(wuHeYouZhiXiangSmartScriptPack.roles.map((role) => role.id)).toContain('poppygrower')
    expect(wuHeYouZhiXiangSmartScriptPack.roles.map((role) => role.id)).toContain('plaguedoctor')
  })

  it('uses the source-provided night order as the wake-up base', () => {
    expect(wuHeYouZhiXiangSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'philosopher',
      'poppygrower',
      'kazali',
      'poisoner',
      'harpy',
      'mezepheles',
      'pixie',
      'seamstress',
      'villageidiot',
      'spy',
      'highpriestess',
      'shugenja',
    ])
    expect(wuHeYouZhiXiangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('hatter')
    expect(wuHeYouZhiXiangSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toContain('ojo')
  })

  it('provides verified setup templates for all 7-15 player counts', () => {
    const counts = new Map<number, number>()
    for (const template of wuHeYouZhiXiangSmartScriptPack.setupTemplates) {
      counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
      expect(template.verified, template.templateId).toBe(true)
      expect(validateTemplateComposition(wuHeYouZhiXiangSmartScriptPack, template).valid, template.templateId).toBe(true)
    }

    expect(Object.fromEntries(counts)).toEqual({"7": 3, "8": 2, "9": 2, "10": 3, "11": 2, "12": 3, "13": 2, "14": 2, "15": 3})
  })
})
