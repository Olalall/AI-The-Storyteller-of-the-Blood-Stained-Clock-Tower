import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { chouShenNaJiSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('chou-shen-na-ji smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(chouShenNaJiSmartScriptPack.source.contentHash).toBe('sha256:340fec7f269e1a8ad080965e223778b81ea711e1b96a4c5c56e5821c16cc7f22')
    expect(chouShenNaJiSmartScriptPack.roles).toHaveLength(29)
    expect(chouShenNaJiSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of chouShenNaJiSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(chouShenNaJiSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count with special bluff policy', () => {
    for (const playerCount of chouShenNaJiSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('chou-shen-na-ji', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
  })
})
