import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { liuGongFenDaiSmartScriptPack } from './index'
function makeProfiles(playerCount: number) { return Array.from({ length: playerCount }, (_value, index) => ({ seatId: index + 1, experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const })) }
describe('liu-gong-fen-dai smart script pack', () => {
  it('locks source metadata and role count', () => { expect(liuGongFenDaiSmartScriptPack.source.contentHash).toBe("sha256:1f3db312adda11b99ddee61096e4c7519aa25ab5ca742d8bfdf5bfc93f2b8a17"); expect(liuGongFenDaiSmartScriptPack.roles).toHaveLength(28) })
  it('keeps all setup templates composition-valid', () => { for (const template of liuGongFenDaiSmartScriptPack.setupTemplates) expect(validateTemplateComposition(liuGongFenDaiSmartScriptPack, template), template.templateId).toMatchObject({ valid: true }) })
  it('provides playable candidates for every player count', () => { for (const playerCount of liuGongFenDaiSmartScriptPack.playerCounts) expect(createSmartScriptSetupCandidates('liu-gong-fen-dai', makeProfiles(playerCount)).length, String(playerCount)).toBeGreaterThan(0) })
  it('keeps special setup and non-player roles out of first normal templates', () => { const templateRoles = new Set(liuGongFenDaiSmartScriptPack.setupTemplates.flatMap((template) => template.roles)); expect(templateRoles.has('legion')).toBe(false); expect(templateRoles.has('chang_an_hong_cha')).toBe(false); expect(templateRoles.has('gai_bang_zhang_lao')).toBe(false); expect(templateRoles.has('djinn')).toBe(false) })
})
