import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { xinNianJieLiPlusSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('xin-nian-jie-li-plus smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(xinNianJieLiPlusSmartScriptPack.source.contentHash).toBe('sha256:5dffd3b3cf38d01025742fdcdbf0de256375a04dcb7ba68090c7711bb1947dcc')
    expect(xinNianJieLiPlusSmartScriptPack.roles).toHaveLength(28)
    expect(xinNianJieLiPlusSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
    expect(xinNianJieLiPlusSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('meta-1')
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of xinNianJieLiPlusSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(xinNianJieLiPlusSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count without first-template Doppelganger', () => {
    for (const playerCount of xinNianJieLiPlusSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('xin-nian-jie-li-plus', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
    expect(xinNianJieLiPlusSmartScriptPack.setupTemplates.some((template) => template.roles.includes('er_chong_shen'))).toBe(false)
  })
})
