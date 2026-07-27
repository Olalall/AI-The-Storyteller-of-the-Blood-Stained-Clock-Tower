import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupCandidates } from '../../features/setup/smartScriptSetupCandidates'
import { validateTemplateComposition } from '../setup-templates/composition'
import { smartScriptPacks } from './catalog'
import type { PlayerCount, SmartRoleDefinition, SmartScriptPack } from './types'

const allPlayerCounts: readonly PlayerCount[] = [7, 8, 9, 10, 11, 12, 13, 14, 15]

const minimumTemplatesByCount: Record<PlayerCount, number> = {
  7: 3,
  8: 2,
  9: 2,
  10: 3,
  11: 2,
  12: 3,
  13: 2,
  14: 2,
  15: 3,
}

describe('smart script pack quality gate', () => {
  it('keeps every registered smart script structurally complete for 7-15 player setup', () => {
    for (const pack of smartScriptPacks) {
      expect(pack.playerCounts, pack.scriptId).toEqual(allPlayerCounts)
      expect(pack.source.url, pack.scriptId).toBeTruthy()
      expect(pack.source.contentHash, pack.scriptId).toMatch(/^sha256:/)
      expect(pack.source.verifiedAt, pack.scriptId).toBeTruthy()
      expect(unique(pack.roles.map((role) => role.id)).length, pack.scriptId).toBe(pack.roles.length)
      expect(pack.roles.length, pack.scriptId).toBeGreaterThanOrEqual(18)
      expect(pack.nightOrders.firstNight.length + pack.nightOrders.otherNight.length, pack.scriptId).toBeGreaterThan(0)
      expect(pack.setupRules.every((rule) => rule.knowledgeStatus === 'confirmed'), pack.scriptId).toBe(true)
    }
  })

  it('keeps templates verified, composition-valid, and available for every supported player count', () => {
    for (const pack of smartScriptPacks) {
      const templatesByCount = groupTemplatesByCount(pack)

      for (const count of allPlayerCounts) {
        expect(templatesByCount.get(count)?.length ?? 0, `${pack.scriptId}/${count}`).toBeGreaterThanOrEqual(
          minimumTemplatesByCount[count],
        )
      }

      for (const template of pack.setupTemplates) {
        expect(template.verified, template.templateId).toBe(true)
        expect(template.roles, template.templateId).toHaveLength(template.playerCount)
        expect(template.bluffs, template.templateId).toHaveLength(3)
        const repeatableRoles = 'repeatableRoles' in template ? template.repeatableRoles ?? [] : []
        expect(hasOnlyAllowedDuplicateRoles(template.roles, repeatableRoles), template.templateId).toBe(true)
        expect(unique(template.bluffs).length, template.templateId).toBe(template.bluffs.length)
        expect(validateTemplateComposition(pack, template).valid, template.templateId).toBe(true)
      }
    }
  })

  it('keeps template roles and demon bluffs inside the same pack without using travelers or fabled roles', () => {
    for (const pack of smartScriptPacks) {
      const roleById = new Map(pack.roles.map((role) => [role.id, role]))

      for (const template of pack.setupTemplates) {
        for (const roleId of template.roles) {
          const role = roleById.get(roleId)
          expect(role, `${template.templateId}/${roleId}`).toBeTruthy()
          expect(role?.team, `${template.templateId}/${roleId}`).not.toBe('traveler')
          expect(role?.team, `${template.templateId}/${roleId}`).not.toBe('fabled')
        }

        for (const bluffId of template.bluffs) {
          const bluff = roleById.get(bluffId)
          expect(bluff, `${template.templateId}/${bluffId}`).toBeTruthy()
          expect(template.roles, `${template.templateId}/${bluffId}`).not.toContain(bluffId)
          expect(bluff?.team, `${template.templateId}/${bluffId}`).not.toBe('traveler')
          expect(bluff?.team, `${template.templateId}/${bluffId}`).not.toBe('fabled')
        }
      }
    }
  })

  it('can generate visible setup candidates for every registered script and player count', () => {
    for (const pack of smartScriptPacks) {
      for (const count of allPlayerCounts) {
        const seatProfiles = Array.from({ length: count }, (_value, index) => ({
          seatId: index + 1,
          experience: 'regular' as const,
        }))
        const candidates = createSmartScriptSetupCandidates(pack.scriptId, seatProfiles, {
          count: 3,
          random: () => 0.5,
        })
        expect(candidates.length, `${pack.scriptId}/${count}`).toBeGreaterThan(0)
      }
    }
  })

  it('keeps role logic metadata source-backed and explicit about high-risk effects', () => {
    const missingStructuredLogic: string[] = []
    const missingCategoryLogic: string[] = []
    const garbledResearchText: string[] = []

    for (const pack of smartScriptPacks) {
      for (const role of pack.roles) {
        expect(role.officialName, `${pack.scriptId}/${role.id}`).toBeTruthy()
        expect(role.abilityText, `${pack.scriptId}/${role.id}`).toBeTruthy()
        expect(role.inputKinds.length, `${pack.scriptId}/${role.id}`).toBeGreaterThan(0)
        expect(role.research?.sourceUrls.length, `${pack.scriptId}/${role.id}`).toBeGreaterThan(0)
        expect(role.research?.reviewedAt, `${pack.scriptId}/${role.id}`).toBeTruthy()

        if (role.research && hasGarbledPlaceholder(role.research)) {
          garbledResearchText.push(`${pack.scriptId}/${role.id}`)
        }

        if (role.team !== 'traveler' && role.team !== 'fabled' && isHighRiskAbility(role.abilityText)) {
          const research = role.research
          const hasStructuredLogic = Boolean(research && [
            research.setupImpact,
            research.possibleOutcomes,
            research.stateChanges,
            research.identityChanges,
            research.teamChanges,
            research.playerMessageTemplates,
            research.highRiskNotes,
          ].some((items) => items.length > 0))

          if (!hasStructuredLogic) missingStructuredLogic.push(`${pack.scriptId}/${role.id}`)

          for (const category of highRiskCategories(role.abilityText)) {
            if (!hasCategoryResearch(research, category)) {
              missingCategoryLogic.push(`${pack.scriptId}/${role.id}/${category}`)
            }
          }
        }
      }
    }

    expect(missingStructuredLogic).toEqual([])
    expect(missingCategoryLogic).toEqual([])
    expect(garbledResearchText).toEqual([])
  })
})

function groupTemplatesByCount(pack: SmartScriptPack) {
  const groups = new Map<PlayerCount, typeof pack.setupTemplates>()
  for (const count of allPlayerCounts) {
    groups.set(count, pack.setupTemplates.filter((template) => template.playerCount === count))
  }
  return groups
}

function unique<T>(items: readonly T[]) {
  return [...new Set(items)]
}

function hasOnlyAllowedDuplicateRoles(roleIds: readonly string[], repeatableRoles: readonly string[]) {
  const repeatable = new Set(repeatableRoles)
  const seen = new Set<string>()
  for (const roleId of roleIds) {
    if (!seen.has(roleId)) {
      seen.add(roleId)
      continue
    }

    if (!repeatable.has(roleId)) return false
  }

  return true
}

function isHighRiskAbility(abilityText: string) {
  return /\b(poisoned|drunk|die|dies|death|dead|mad|alignment|become|becomes|swap|register|executed|win|wins|lose|loses)\b/i.test(abilityText)
}

function hasGarbledPlaceholder(research: NonNullable<SmartRoleDefinition['research']>) {
  return JSON.stringify(research).includes('????')
}

type HighRiskCategory = 'death' | 'poison-drunk' | 'madness' | 'identity' | 'alignment' | 'win-loss'

function highRiskCategories(abilityText: string): HighRiskCategory[] {
  const categories: readonly [RegExp, HighRiskCategory][] = [
    [/\b(die|dies|death|dead|executed|execution|kill|kills|killed)\b/i, 'death'],
    [/\b(poisoned|poison|drunk|sober|healthy)\b/i, 'poison-drunk'],
    [/\b(mad|madness)\b/i, 'madness'],
    [/\b(become|becomes|swap|swaps|change character|changes character|changed character)\b/i, 'identity'],
    [/\b(alignment|alignments|become evil|becomes evil|become good|becomes good)\b/i, 'alignment'],
    [/\b(win|wins|lose|loses)\b/i, 'win-loss'],
  ]

  return categories.flatMap(([pattern, category]) => (pattern.test(abilityText) ? [category] : []))
}

function hasCategoryResearch(research: SmartRoleDefinition['research'], category: HighRiskCategory) {
  if (!research) return false

  const fieldsByCategory: Record<HighRiskCategory, readonly (readonly string[])[]> = {
    death: [research.possibleOutcomes, research.stateChanges, research.highRiskNotes],
    'poison-drunk': [research.stateChanges, research.highRiskNotes],
    madness: [research.stateChanges, research.playerMessageTemplates, research.highRiskNotes],
    identity: [research.identityChanges, research.playerMessageTemplates, research.highRiskNotes],
    alignment: [research.possibleOutcomes, research.teamChanges, research.playerMessageTemplates, research.highRiskNotes],
    'win-loss': [research.possibleOutcomes, research.highRiskNotes],
  }

  return fieldsByCategory[category].some((items) => items.length > 0)
}
