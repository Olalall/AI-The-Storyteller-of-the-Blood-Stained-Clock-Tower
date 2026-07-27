import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { yeBanKuangHuanSmartScriptPack } from './index'
function makeProfiles(playerCount: number) { return Array.from({ length: playerCount }, (_value, index) => ({ seatId: index + 1, experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const })) }
describe('ye-ban-kuang-huan smart script pack', () => {
  it('locks source metadata and role count', () => { expect(yeBanKuangHuanSmartScriptPack.source.contentHash).toBe("sha256:f512be8087e3f0b2caa971adc8d9b789cc96315f4c8bffef44423380107b3077"); expect(yeBanKuangHuanSmartScriptPack.roles).toHaveLength(25) })
  it('keeps all setup templates composition-valid', () => { for (const template of yeBanKuangHuanSmartScriptPack.setupTemplates) expect(validateTemplateComposition(yeBanKuangHuanSmartScriptPack, template), template.templateId).toMatchObject({ valid: true }) })
  it('provides playable candidates for every player count', () => { for (const playerCount of yeBanKuangHuanSmartScriptPack.playerCounts) expect(createSmartScriptSetupCandidates('ye-ban-kuang-huan', makeProfiles(playerCount)).length, String(playerCount)).toBeGreaterThan(0) })
  it('keeps fabled and special hidden setup paths out of first normal templates', () => { const templateRoles = new Set(yeBanKuangHuanSmartScriptPack.setupTemplates.flatMap((template) => template.roles)); expect(templateRoles.has('sentinel')).toBe(false); expect(templateRoles.has('spirit_of_ivory')).toBe(false); expect(templateRoles.has('atheist')).toBe(false); expect(templateRoles.has('huntsman')).toBe(false); expect(templateRoles.has('drunk')).toBe(false) })
})
