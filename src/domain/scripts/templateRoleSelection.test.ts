import { describe, expect, it } from 'vitest'
import { templateRoleSelectionValid } from './templateRoleSelection'
import type { SetupTemplate, SmartRoleDefinition, SmartScriptPack } from './types'

function fixture(modifier = 'fanggu') {
  const roles: SmartRoleDefinition[] = [
    ...['chef', 'empath', 'washerwoman', 'librarian', 'investigator', 'monk', 'ravenkeeper', 'undertaker'].map((id) => ({
      id, name: id, team: 'townsfolk' as const, abilityText: 'Public test fact.', inputKinds: ['none'] as const, knowledgeStatus: 'confirmed' as const,
    })),
    { id: 'poisoner', name: 'poisoner', team: 'minion', abilityText: 'Public test fact.', inputKinds: ['player'], knowledgeStatus: 'confirmed' },
    { id: modifier, name: modifier, team: 'demon', abilityText: 'Public test fact.', inputKinds: ['player'], knowledgeStatus: 'confirmed' },
  ]
  const pack: SmartScriptPack = { scriptId: 'mandatory-template-check', displayName: 'Mandatory template check',
    source: { contentHash: 'sha256:' + 'a'.repeat(64), verifiedAt: '2026-10-21' }, playerCounts: [7], roles,
    nightOrders: { firstNight: [], otherNight: [] }, setupTemplates: [], knowledgeStatus: 'needs-review',
    setupRules: [{ id: 'mandatory-source-rule', roleId: modifier, summary: 'Explicit source-backed count adjustment.', knowledgeStatus: 'confirmed' }],
  }
  const template: SetupTemplate = { templateId: 'missing-mandatory', scriptId: pack.scriptId, playerCount: 7, style: 'balanced',
    roles: ['chef', 'empath', 'washerwoman', 'librarian', 'investigator', 'poisoner', modifier],
    bluffs: ['monk', 'ravenkeeper', 'undertaker'], verified: false, notes: [],
  }
  return { pack, template }
}

describe('new referenced-template mandatory source guard', () => {
  it.each(['fanggu', 'baron', 'godfather', 'summoner', 'lordoftyphon', 'vigormortis'])(
    'rejects a missing mandatory %s setup selection', (id) => {
      const { pack, template } = fixture(id)
      expect(templateRoleSelectionValid(pack, template)).toBe(false)
    },
  )

  it('requires a nonblank explicit choice bound to the matching declared setup source', () => {
    const { pack, template } = fixture()
    const adjustment = { ruleId: 'mandatory-source-rule', choiceId: 'add-one-outsider', compositionDelta: { townsfolk: -1, outsider: 1 } }
    expect(templateRoleSelectionValid(pack, { ...template, setupAdjustments: [adjustment] })).toBe(true)
    for (const patch of [{ choiceId: undefined }, { choiceId: ' ' }, { ruleId: 'unknown-fanggu-source' }]) {
      expect(templateRoleSelectionValid(pack, { ...template, setupAdjustments: [{ ...adjustment, ...patch }] })).toBe(false)
    }
    expect(templateRoleSelectionValid({ ...pack, setupRules: [{ ...pack.setupRules[0], roleId: 'baron' }] },
      { ...template, setupAdjustments: [adjustment] })).toBe(false)
  })

  it('normalizes a legacy alias when associating the selected source and active role', () => {
    const { pack, template } = fixture()
    const aliased = { ...template, roles: template.roles.map((id) => id === 'fanggu' ? 'fang_gu' : id),
      setupAdjustments: [{ ruleId: 'mandatory-source-rule', choiceId: 'add-one-outsider', compositionDelta: { townsfolk: -1, outsider: 1 } }] }
    expect(templateRoleSelectionValid({ ...pack, setupRules: [{ ...pack.setupRules[0], roleId: 'fang_gu' }] }, aliased)).toBe(true)
  })

  it('reuses the existing sourced Vigormortis delta check instead of accepting a zero-removal placeholder', () => {
    const { pack, template } = fixture('vigormortis')
    expect(templateRoleSelectionValid(pack, { ...template, setupAdjustments: [{ ruleId: 'mandatory-source-rule', choiceId: 'remove-outsider', compositionDelta: {} }] })).toBe(false)
    expect(templateRoleSelectionValid(pack, { ...template, setupAdjustments: [{ ruleId: 'mandatory-source-rule', choiceId: 'remove-outsider', compositionDelta: { townsfolk: 1, outsider: -1 } }] })).toBe(true)
  })

  it('does not require optional modifiers or an unplayed mandatory role, and never mutates input', () => {
    const { pack, template } = fixture('balloonist')
    const extra = fixture('fanggu').pack.roles.at(-1)!
    pack.roles = [...pack.roles, extra]
    const before = structuredClone({ pack, template })
    expect(templateRoleSelectionValid(pack, template)).toBe(true)
    expect({ pack, template }).toEqual(before)
  })
})
