import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { anDuChenCangSmartScriptPack } from './index'
function makeProfiles(playerCount: number) { return Array.from({ length: playerCount }, (_value, index) => ({ seatId: index + 1, experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const })) }
describe('an-du-chen-cang smart script pack', () => {
  it('locks source metadata and role count', () => { expect(anDuChenCangSmartScriptPack.source.contentHash).toBe("sha256:cb73a1205b7295efa452a1cca1383a9e8bc74d558bae27fc1daba30562c4429a"); expect(anDuChenCangSmartScriptPack.roles).toHaveLength(24) })
  it('keeps all setup templates composition-valid', () => { for (const template of anDuChenCangSmartScriptPack.setupTemplates) expect(validateTemplateComposition(anDuChenCangSmartScriptPack, template), template.templateId).toMatchObject({ valid: true }) })
  it('provides playable candidates for every player count', () => { for (const playerCount of anDuChenCangSmartScriptPack.playerCounts) expect(createSmartScriptSetupCandidates('an-du-chen-cang', makeProfiles(playerCount)).length, String(playerCount)).toBeGreaterThan(0) })
  it('keeps hidden and variable setup paths out of first normal templates', () => { const templateRoles = new Set(anDuChenCangSmartScriptPack.setupTemplates.flatMap((template) => template.roles)); expect(templateRoles.has('drunk')).toBe(false); expect(templateRoles.has('godfather')).toBe(false) })
})
