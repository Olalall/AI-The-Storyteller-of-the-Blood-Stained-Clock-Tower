import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleAbilityForScript, roleResearchForAI } from './catalog'

describe('smart script role provenance', () => {
  it('keeps custom and unknown role provenance without blocking the script', () => {
    const customRole = getSmartScriptPack('bai-zhou-wei-shi').roles.find((role) => role.id === 'daoke')
    const officialRole = getSmartScriptPack('shi-san-hang').roles.find((role) => role.id === 'sailor')

    expect(customRole?.sourceKind).toBe('community-or-custom')
    expect(customRole?.knowledgeStatus).toBe('confirmed')
    expect(officialRole?.sourceKind).toBe('official-catalog')
    expect(officialRole?.knowledgeStatus).toBe('confirmed')
  })

  it('does not send generic source placeholders to the AI role brief', () => {
    const brief = roleResearchForAI('bao-meng-mi-tuan', 'noble')

    expect(brief).toBeTruthy()
    expect(JSON.stringify(brief)).not.toContain('Apply source ability only')
    expect(JSON.stringify(brief)).not.toContain('Use source night reminder')
    expect(brief?.highRiskNotes.join(' ')).not.toContain('AI only drafts reminders')
  })

  it('makes missing role material explicit instead of implying it is usable', () => {
    expect(roleAbilityForScript('bao-meng-mi-tuan', 'role-does-not-exist'))
      .toBe('未找到角色资料；请先补齐项目中的角色说明。')
  })
})
