import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { jingJueGuGuoShenHuaSmartScriptPack } from '.'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('jing-jue-gu-guo-shen-hua smart script pack', () => {
  it('keeps source metadata and role research available', () => {
    expect(jingJueGuGuoShenHuaSmartScriptPack.source.contentHash).toBe('sha256:541c3fc441a9ae4b1dfff154c2c47d53f653848dc0579ba688fefaba04c51c1c')
    expect(jingJueGuGuoShenHuaSmartScriptPack.roles).toHaveLength(26)
    expect(jingJueGuGuoShenHuaSmartScriptPack.roles.every((role) => role.research?.sourceUrls.length)).toBe(true)
  })

  it('keeps all setup templates composition-valid', () => {
    for (const template of jingJueGuGuoShenHuaSmartScriptPack.setupTemplates) {
      expect(validateTemplateComposition(jingJueGuGuoShenHuaSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
    }
  })

  it('provides playable candidates for every player count', () => {
    for (const playerCount of jingJueGuGuoShenHuaSmartScriptPack.playerCounts) {
      expect(createSmartScriptSetupCandidates('jing-jue-gu-guo-shen-hua', makeProfiles(playerCount)).length, String(playerCount)).toBeGreaterThan(0)
    }
  })
})
