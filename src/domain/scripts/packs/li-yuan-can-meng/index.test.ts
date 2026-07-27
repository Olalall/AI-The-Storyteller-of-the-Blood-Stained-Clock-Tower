import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { liYuanCanMengSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('li-yuan-can-meng smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(liYuanCanMengSmartScriptPack.source.contentHash).toBe("sha256:bca991074703b037c0d6c1e08404b3a5102fc51c7c4ecfedca37718530184e04")
    expect(liYuanCanMengSmartScriptPack.roles).toHaveLength(31)
    expect(liYuanCanMengSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
    expect(liYuanCanMengSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('meta-1')
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of liYuanCanMengSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(liYuanCanMengSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count', () => {
    for (const playerCount of liYuanCanMengSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('li-yuan-can-meng', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
  })
})
