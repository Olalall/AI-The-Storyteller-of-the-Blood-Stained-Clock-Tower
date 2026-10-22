import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupCandidates } from '../../features/setup/smartScriptSetupCandidates'
import { validateTemplateComposition } from '../setup-templates/composition'
import { lilMonstaOpeningSelected } from '../setup-templates/lilMonstaOpening'
import { smartScriptPacks, scriptManifest } from './catalog'
import type { PlayerCount, SmartRoleDefinition, SmartScriptPack } from './types'

describe('smart script pack quality gate', () => {
  it.each([
    ['一名玩家死亡或复活。', 'death'],
    ['目标中毒，你保持清醒。', 'poison-drunk'],
    ['他必须疯狂地声称是镇民。', 'madness'],
    ['你与他交换角色。', 'identity'],
    ['你变为邪恶阵营。', 'alignment'],
    ['善良阵营立即获胜。', 'win-loss'],
  ] as const)('does not skip Chinese high-risk rules: %s', (ability, category) => {
    expect(isHighRiskAbility(ability)).toBe(true)
    expect(highRiskCategories(ability)).toContain(category)
  })
  it('keeps every registered smart script structurally complete for 7-15 player setup', () => {
    for (const pack of smartScriptPacks) {
      expect(pack.playerCounts, pack.scriptId).toEqual(scriptManifest.find(entry => entry.scriptId === pack.scriptId)!.playerCounts)
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

      for (const count of pack.playerCounts) {
        expect(templatesByCount.get(count)?.length ?? 0, `${pack.scriptId}/${count}`).toBeGreaterThanOrEqual(
          1,
        )
      }

      for (const template of pack.setupTemplates) {
        expect(template.verified, template.templateId).toBe(true)
        expect(template.roles, template.templateId).toHaveLength(template.playerCount)
        const selections = template.setupAdjustments?.flatMap(a => a.choiceId ? [{ruleId:a.ruleId,choiceId:a.choiceId}] : []) ?? []
        expect(template.bluffs, template.templateId).toHaveLength(lilMonstaOpeningSelected({ ...pack, setupTemplates:[template] }, selections) ? 0 : 3)
        const repeatableRoles = 'repeatableRoles' in template ? template.repeatableRoles ?? [] : []
        expect(hasOnlyAllowedDuplicateRoles(template.roles, repeatableRoles), template.templateId).toBe(true)
        expect(unique(template.bluffs).length, template.templateId).toBe(template.bluffs.length)
        expect(validateTemplateComposition(pack, template).valid, template.templateId).toBe(true)
      }
    }
  })

  it('keeps template roles and demon bluffs inside the same pack without using traveler, fabled, or loric roles', () => {
    for (const pack of smartScriptPacks) {
      const roleById = new Map(pack.roles.map((role) => [role.id, role]))

      for (const template of pack.setupTemplates) {
        for (const roleId of template.roles) {
          const role = roleById.get(roleId)
          expect(role, `${template.templateId}/${roleId}`).toBeTruthy()
          expect(role?.team, `${template.templateId}/${roleId}`).not.toBe('traveler')
          expect(role?.team, `${template.templateId}/${roleId}`).not.toBe('fabled')
          expect(role?.team, `${template.templateId}/${roleId}`).not.toBe('loric')
        }

        for (const bluffId of template.bluffs) {
          const bluff = roleById.get(bluffId)
          expect(bluff, `${template.templateId}/${bluffId}`).toBeTruthy()
          expect(template.roles, `${template.templateId}/${bluffId}`).not.toContain(bluffId)
          expect(bluff?.team, `${template.templateId}/${bluffId}`).not.toBe('traveler')
          expect(bluff?.team, `${template.templateId}/${bluffId}`).not.toBe('fabled')
          expect(bluff?.team, `${template.templateId}/${bluffId}`).not.toBe('loric')
        }
      }
    }
  })

  it('can generate visible setup candidates for every registered script and player count', () => {
    for (const pack of smartScriptPacks) {
      for (const count of pack.playerCounts) {
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

        if (role.team !== 'traveler' && role.team !== 'fabled' && role.team !== 'loric' && isHighRiskAbility(role.abilityText)) {
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

    expect({ missingStructuredLogic, missingCategoryLogic, garbledResearchText }).toEqual({
      missingStructuredLogic: [], missingCategoryLogic: [], garbledResearchText: [],
    })
  })
})

function groupTemplatesByCount(pack: SmartScriptPack) {
  const groups = new Map<PlayerCount, typeof pack.setupTemplates>()
  for (const count of pack.playerCounts) {
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
  return highRiskCategories(abilityText).length > 0 || /\bregister\b/i.test(abilityText)
}

function hasGarbledPlaceholder(research: NonNullable<SmartRoleDefinition['research']>) {
  return JSON.stringify(research).includes('????')
}

type HighRiskCategory = 'death' | 'poison-drunk' | 'madness' | 'identity' | 'alignment' | 'win-loss'

function highRiskCategories(abilityText: string): HighRiskCategory[] {
  const categories: readonly [RegExp, HighRiskCategory][] = [
    [/\b(die|dies|death|dead|executed|execution|kill|kills|killed)\b|死亡|死去|处决|杀死|被杀|复活/i, 'death'],
    [/\b(poisoned|poison|drunk|sober|healthy)\b|中毒|醉酒|清醒|健康/i, 'poison-drunk'],
    [/\b(mad|madness)\b|疯狂/i, 'madness'],
    [/\b(become|becomes|swap|swaps|change character|changes character|changed character)\b|变成|变为|角色.*(?:变|交换)|(?:改变|交换).*角色/i, 'identity'],
    [/\b(alignment|alignments|become evil|becomes evil|become good|becomes good)\b|阵营|变成邪恶|变为邪恶|变成善良|变为善良/i, 'alignment'],
    [/\b(win|wins|lose|loses)\b|获胜|胜利|输掉|输赢|善良赢|邪恶赢/i, 'win-loss'],
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
