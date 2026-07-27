import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { guDaoJiuWenSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('gu-dao-jiu-wen smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(guDaoJiuWenSmartScriptPack.source.contentHash).toBe('sha256:00a14a1b84973c1fb8625febb0ce3c190f2c73b26f065715486ae30052e81b92')
    expect(guDaoJiuWenSmartScriptPack.roles).toHaveLength(30)
    expect(guDaoJiuWenSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
    expect(guDaoJiuWenSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('meta-1')
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of guDaoJiuWenSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(guDaoJiuWenSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count without first-template special setup roles', () => {
    for (const playerCount of guDaoJiuWenSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('gu-dao-jiu-wen', makeProfiles(playerCount))
      expect(candidates.length, String(playerCount)).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
    const firstTemplateRoles = guDaoJiuWenSmartScriptPack.setupTemplates.flatMap((template) => template.roles)
    expect(firstTemplateRoles).not.toContain('zhu_ma_wu_cai')
    expect(firstTemplateRoles).not.toContain('qian_dao')
    expect(firstTemplateRoles).not.toContain('huan_meng')
    expect(firstTemplateRoles).not.toContain('suo_li_weng')
    expect(firstTemplateRoles).not.toContain('chun_qiu_bi')
  })
})
