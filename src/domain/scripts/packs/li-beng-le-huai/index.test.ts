import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { liBengLeHuaiSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('li-beng-le-huai smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(liBengLeHuaiSmartScriptPack.source.contentHash).toBe('sha256:af0f4ab26df993c8f6d68c422e12c5a87c8d063d9d06d95d2bab171f65a2d985')
    expect(liBengLeHuaiSmartScriptPack.roles).toHaveLength(29)
    expect(liBengLeHuaiSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
    expect(liBengLeHuaiSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('meta-1')
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of liBengLeHuaiSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(liBengLeHuaiSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count without first-template Godfather', () => {
    for (const playerCount of liBengLeHuaiSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('li-beng-le-huai', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
    expect(liBengLeHuaiSmartScriptPack.setupTemplates.some((template) => template.roles.includes('godfather'))).toBe(false)
  })
})
