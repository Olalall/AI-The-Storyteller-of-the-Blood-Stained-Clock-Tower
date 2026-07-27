import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { xueSeFengHuaSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('xue-se-feng-hua smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(xueSeFengHuaSmartScriptPack.source.contentHash).toBe('sha256:762a5e8d1712573ddbcd493ca3eb7efdf3fcf7d55b41a087c6ac1d36387720e7')
    expect(xueSeFengHuaSmartScriptPack.roles).toHaveLength(26)
    expect(xueSeFengHuaSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
    expect(xueSeFengHuaSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('meta-1')
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of xueSeFengHuaSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(xueSeFengHuaSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count without setup-altering Kan Shou Zhe', () => {
    for (const playerCount of xueSeFengHuaSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('xue-se-feng-hua', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
    expect(xueSeFengHuaSmartScriptPack.setupTemplates.some((template) => template.roles.includes('kan_shou_zhe'))).toBe(false)
  })
})
