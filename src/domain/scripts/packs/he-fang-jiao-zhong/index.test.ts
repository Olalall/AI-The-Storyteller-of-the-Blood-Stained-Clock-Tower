import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { heFangJiaoZhongSmartScriptPack } from '.'

describe('heFangJiaoZhongSmartScriptPack', () => {
  it('locks the official grimoire source and role mapping', () => {
    expect(heFangJiaoZhongSmartScriptPack.scriptId).toBe('he-fang-jiao-zhong')
    expect(heFangJiaoZhongSmartScriptPack.displayName).toBe("何方教众")
    expect(heFangJiaoZhongSmartScriptPack.source.contentHash).toBe(
      'sha256:63e5b87f8058d6c25041fca52652806a894e24ad883e7a97fe07bc4925601da4',
    )
    expect(heFangJiaoZhongSmartScriptPack.roles).toHaveLength(26)
    expect(heFangJiaoZhongSmartScriptPack.roles.map((role) => role.id)).toContain('stormcatcher')
  })

  it('keeps fabled roles out of setup templates and bluffs', () => {
    for (const template of heFangJiaoZhongSmartScriptPack.setupTemplates) {
      expect(template.roles, template.templateId).not.toContain('stormcatcher')
      expect(template.bluffs, template.templateId).not.toContain('stormcatcher')
    }
  })

  it('keeps every setup template composition-valid', () => {
    for (const template of heFangJiaoZhongSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(heFangJiaoZhongSmartScriptPack, template), template.templateId).toMatchObject({
        valid: true,
      })
    }
  })
})
