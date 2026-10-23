import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, smartScriptPacks } from '../../domain/scripts'
import { setupCandidateVariants } from './setupCandidateVariants'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from './smartScriptSetupCandidates'

const profiles = (count: number) => Array.from({ length: count }, (_, i) => ({ seatId: i + 1, experience: 'regular' as const }))
const rolesKey = (candidate: ReturnType<typeof createSmartScriptSetupCandidates>[number]) => candidate.assignments.map(a => a.role.id).sort().join(',')

describe('expanded legal setup combinations', () => {
  it('keeps setup-added character pairs together instead of replacing their required character', () => {
    const source = getSmartScriptPack('trouble-brewing')
    const pack = { ...source, roles: [...source.roles,
      { ...source.roles[0], id: 'choirboy', name: '唱诗男孩', officialName: 'Choirboy', team: 'townsfolk' as const, abilityText: '测试技能。[+国王]' },
      { ...source.roles[0], id: 'king', name: '国王', officialName: 'King', team: 'townsfolk' as const, abilityText: '测试信息。' },
    ] }
    const anchor = source.setupTemplates.find(t => t.playerCount === 7)!
    const templates = [
      { ...anchor, roles: ['choirboy', 'king', 'chef', 'monk', 'soldier', 'poisoner', 'imp'] },
      { ...anchor, roles: ['washerwoman', 'librarian', 'chef', 'monk', 'ravenkeeper', 'poisoner', 'imp'] },
    ]
    const variants = [...setupCandidateVariants(pack, templates)]
    expect(variants.length).toBeGreaterThan(0)
    expect(variants.filter(t => t.roles.includes('choirboy')).every(t => t.roles.includes('king'))).toBe(true)
    expect(variants.every(t => t.verified === false)).toBe(true)
  })
  it.each(['shuo-shu-ren-zhi-nu', 'catfishing'])('offers many genuinely different combinations for %s at 12 players, reproducibly', (scriptId) => {
    const input = profiles(12)
    const candidates = createSmartScriptSetupCandidates(scriptId, input, { count: 36, seed: 'more', expand: true })
    expect(candidates.length).toBeGreaterThanOrEqual(12)
    expect(new Set(candidates.map(rolesKey)).size).toBe(candidates.length)
    expect(createSmartScriptSetupCandidates(scriptId, input, { count: 36, seed: 'more', expand: true })).toEqual(candidates)
  })

  it('keeps every expanded board legal at all supported counts without changing its source templates', () => {
    for (const source of smartScriptPacks) {
      const pack = getSmartScriptPack(source.scriptId)
      const before = JSON.stringify(source.setupTemplates)
      for (const count of [7, 8, 9, 10, 11, 12, 13, 14, 15]) {
        if (!pack.setupTemplates.some(template => template.playerCount === count && template.verified)) continue
        const seats = profiles(count)
        const candidates = createSmartScriptSetupCandidates(pack.scriptId, seats, { count: 36, seed: 'coverage', expand: true })
        expect(new Set(candidates.map(rolesKey)).size, `${pack.scriptId}/${count}`).toBe(candidates.length)
        for (const candidate of candidates) {
          const anchor = pack.setupTemplates.find(template => template.templateId === candidate.id || candidate.id.startsWith(template.templateId + '-swap-'))!
          expect(anchor, `${pack.scriptId}/${count}/${candidate.id}`).toBeDefined()
          const team = new Map(pack.roles.map(role => [role.id, role.team]))
          const evil = (roles: readonly string[]) => roles.filter(id => ['minion', 'demon'].includes(team.get(id) ?? '')).sort()
          expect(evil(candidate.assignments.map(a => a.role.id))).toEqual(evil(anchor.roles))
          expect(candidate.repeatableRoleIds).toEqual(anchor.repeatableRoles ?? [])
          const report = evaluateSmartScriptSetup(pack.scriptId, candidate.assignments, candidate.demonBluffs,
            seats.map(s => s.seatId), candidate.setupRuleSelections, candidate.repeatableRoleIds)
          expect(report.checks.filter(c => c.status === 'fail' || c.status === 'needs_choice'), `${pack.scriptId}/${count}/${candidate.id}`).toEqual([])
        }
      }
      expect(JSON.stringify(source.setupTemplates)).toBe(before)
    }
  }, 120_000)
})
