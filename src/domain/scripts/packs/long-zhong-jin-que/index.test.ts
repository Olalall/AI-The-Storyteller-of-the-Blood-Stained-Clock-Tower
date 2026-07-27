import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { longZhongJinQueSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('long-zhong-jin-que smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(longZhongJinQueSmartScriptPack.source.contentHash).toBe('sha256:4422b1aab0f24afe598fd30b476f8471431b460a36d174bd66fa8fd269b4d0e3')
    expect(longZhongJinQueSmartScriptPack.roles).toHaveLength(25)
    expect(longZhongJinQueSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
    expect(longZhongJinQueSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('meta-1')
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of longZhongJinQueSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(longZhongJinQueSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count without first-template special setup roles', () => {
    for (const playerCount of longZhongJinQueSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('long-zhong-jin-que', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
    const firstTemplateRoles = longZhongJinQueSmartScriptPack.setupTemplates.flatMap((template) => template.roles)
    expect(firstTemplateRoles).not.toContain('mei_kuang_gong')
    expect(firstTemplateRoles).not.toContain('drunk')
    expect(firstTemplateRoles).not.toContain('baron')
    expect(firstTemplateRoles).not.toContain('marionette')
    expect(firstTemplateRoles).not.toContain('legion')
    expect(firstTemplateRoles).not.toContain('lilmonsta')
  })
})
