import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { dengXiaHuiYingSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('deng-xia-hui-ying smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(dengXiaHuiYingSmartScriptPack.source.contentHash).toBe('sha256:1076f63140106930e1d21914d2f109397033e4d5aa9d8d0da756ace8f5835a6c')
    expect(dengXiaHuiYingSmartScriptPack.roles).toHaveLength(30)
    expect(dengXiaHuiYingSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of dengXiaHuiYingSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(dengXiaHuiYingSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count', () => {
    for (const playerCount of dengXiaHuiYingSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('deng-xia-hui-ying', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
  })
})
