import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { guoJieXinYangSmartScriptPack } from './index'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('guo-jie-xin-yang smart script pack', () => {
  it('locks source metadata and role count', () => {
    expect(guoJieXinYangSmartScriptPack.source.contentHash).toBe("sha256:aae3b5e90dc59df98998d6e0ee8f3a30bf64a859abc802e7c19e9d92389d197a")
    expect(guoJieXinYangSmartScriptPack.roles).toHaveLength(22)
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of guoJieXinYangSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(guoJieXinYangSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count', () => {
    for (const playerCount of guoJieXinYangSmartScriptPack.playerCounts) {
      expect(createSmartScriptSetupCandidates('guo-jie-xin-yang', makeProfiles(playerCount)).length, String(playerCount)).toBeGreaterThan(0)
    }
  })

  it('keeps Atheist and Marionette out of first normal templates', () => {
    for (const template of guoJieXinYangSmartScriptPack.setupTemplates) {
      expect(template.roles).not.toContain('atheist')
      expect(template.roles).not.toContain('marionette')
    }
  })
})
