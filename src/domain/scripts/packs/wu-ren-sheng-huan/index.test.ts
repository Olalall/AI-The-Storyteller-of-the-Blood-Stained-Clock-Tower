import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupCandidates } from '../../../../features/setup/smartScriptSetupCandidates'
import { validateTemplateComposition } from '../../../setup-templates/composition'
import { wuRenShengHuanSmartScriptPack } from './index'

function makeProfiles(playerCount: number) { return Array.from({ length: playerCount }, (_value, index) => ({ seatId: index + 1, experience: index % 4 === 0 ? 'new' as const : index % 3 === 0 ? 'veteran' as const : 'regular' as const })) }

describe('wu-ren-sheng-huan smart script pack', () => {
  it('locks source metadata and role count', () => { expect(wuRenShengHuanSmartScriptPack.source.contentHash).toBe("sha256:424967d1c8999ba8c714e16ed4c922b56f2fe076897de7005a0c947fea808ce7"); expect(wuRenShengHuanSmartScriptPack.roles).toHaveLength(30) })
  it('keeps all setup templates composition-valid', () => { for (const template of wuRenShengHuanSmartScriptPack.setupTemplates) expect(validateTemplateComposition(wuRenShengHuanSmartScriptPack, template), template.templateId).toMatchObject({ valid: true }) })
  it('provides playable candidates for every player count', () => { for (const playerCount of wuRenShengHuanSmartScriptPack.playerCounts) expect(createSmartScriptSetupCandidates('wu-ren-sheng-huan', makeProfiles(playerCount)).length, String(playerCount)).toBeGreaterThan(0) })
  it('keeps travelers and variable hidden paths out of first normal templates', () => { const templateRoles = new Set(wuRenShengHuanSmartScriptPack.setupTemplates.flatMap((template) => template.roles)); expect(templateRoles.has('bin_ji')).toBe(false); expect(templateRoles.has('jing_du')).toBe(false) })
})
