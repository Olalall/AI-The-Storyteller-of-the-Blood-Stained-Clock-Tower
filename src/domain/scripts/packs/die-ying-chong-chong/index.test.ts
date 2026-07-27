import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { dieYingChongChongSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('die-ying-chong-chong smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(dieYingChongChongSmartScriptPack.source.contentHash).toBe('sha256:ac24d8ba6de769fb59287fa3fc141d610ab9f21c694978de8241064fe49b4762')
    expect(dieYingChongChongSmartScriptPack.roles).toHaveLength(30)
    expect(dieYingChongChongSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
    expect(dieYingChongChongSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('meta-1')
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of dieYingChongChongSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(dieYingChongChongSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count without first-template special setup roles', () => {
    for (const playerCount of dieYingChongChongSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('die-ying-chong-chong', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
    const firstTemplateRoles = dieYingChongChongSmartScriptPack.setupTemplates.flatMap((template) => template.roles)
    expect(firstTemplateRoles).not.toContain('ca_xie_jiang')
    expect(firstTemplateRoles).not.toContain('du_she')
    expect(firstTemplateRoles).not.toContain('san_wei_zhi_li')
  })
})
