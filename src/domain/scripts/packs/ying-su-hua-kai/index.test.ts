import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { yingSuHuaKaiSmartScriptPack } from './index'

function makeProfiles(playerCount: number) {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const,
  }))
}

describe('ying-su-hua-kai smart script pack', () => {
  it('locks source metadata and role count', () => {
    expect(yingSuHuaKaiSmartScriptPack.source.contentHash).toBe("sha256:8115ac32a50fcab7f93db0badc61a807a852d497568f995d4c5967c8d47d7305")
    expect(yingSuHuaKaiSmartScriptPack.roles).toHaveLength(25)
  })
  it('keeps all setup templates composition-valid', () => {
    for (const template of yingSuHuaKaiSmartScriptPack.setupTemplates) expect(validateTemplateComposition(yingSuHuaKaiSmartScriptPack, template), template.templateId).toMatchObject({ valid: true })
  })
  it('provides playable candidates for every player count', () => {
    for (const playerCount of yingSuHuaKaiSmartScriptPack.playerCounts) expect(createSmartScriptSetupCandidates('ying-su-hua-kai', makeProfiles(playerCount)).length, String(playerCount)).toBeGreaterThan(0)
  })
  it('keeps special hidden or majority setup paths out of first normal templates', () => {
    const templateRoles = new Set(yingSuHuaKaiSmartScriptPack.setupTemplates.flatMap((template) => template.roles))
    expect(templateRoles.has('legion')).toBe(false)
    expect(templateRoles.has('marionette')).toBe(false)
    expect(templateRoles.has('bounty_hunter')).toBe(false)
  })
})
