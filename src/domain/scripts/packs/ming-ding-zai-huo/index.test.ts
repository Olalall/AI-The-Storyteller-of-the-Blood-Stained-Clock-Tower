import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { mingDingZaiHuoSmartScriptPack } from '.'

function makeProfiles(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('ming-ding-zai-huo smart script pack', () => {
  it('locks source identity and role research', () => {
    expect(mingDingZaiHuoSmartScriptPack.source.contentHash).toBe('sha256:f68714b8ba3c5e99964793ade4762ca4bf1b413f9048e1e6f06bb975f6142683')
    expect(mingDingZaiHuoSmartScriptPack.roles).toHaveLength(27)
    expect(mingDingZaiHuoSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
    expect(mingDingZaiHuoSmartScriptPack.setupRules.map((rule) => rule.id)).toContain('fu_shang-fabled')
  })

  it('keeps every setup template composition-valid', () => {
    for (const template of mingDingZaiHuoSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(mingDingZaiHuoSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('generates AI setup candidates for every supported player count', () => {
    for (const playerCount of mingDingZaiHuoSmartScriptPack.playerCounts) {
      const candidates = createSmartScriptSetupCandidates('ming-ding-zai-huo', makeProfiles(playerCount))
      expect(candidates.length, `${playerCount}`).toBeGreaterThan(0)
      expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
    }
  })

  it('keeps high-risk setup paths out of first normal templates', () => {
    const firstTemplateRoles = mingDingZaiHuoSmartScriptPack.setupTemplates.flatMap((template) => template.roles)
    expect(firstTemplateRoles).not.toContain('qiu_zhang')
    expect(firstTemplateRoles).not.toContain('bei_ju_jia')
    expect(firstTemplateRoles).not.toContain('ming_yun_zhi_zhen')
    expect(firstTemplateRoles).not.toContain('fu_shang')
  })
})
