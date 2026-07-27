import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { xinRenShiLianSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('xin-ren-shi-lian smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(xinRenShiLianSmartScriptPack.source.contentHash).toBe('sha256:f603b4fa9757330b5f9865fa87dfacc7435232fc17f5804638ac1c31571f1d75')
    expect(xinRenShiLianSmartScriptPack.roles).toHaveLength(27)
    expect(xinRenShiLianSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of xinRenShiLianSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(xinRenShiLianSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count', () => {
    for (const playerCount of xinRenShiLianSmartScriptPack.playerCounts) {
      expect(createSmartScriptSetupCandidates('xin-ren-shi-lian', makeProfiles(playerCount)).length, String(playerCount)).toBeGreaterThan(0)
    }
  })
})
