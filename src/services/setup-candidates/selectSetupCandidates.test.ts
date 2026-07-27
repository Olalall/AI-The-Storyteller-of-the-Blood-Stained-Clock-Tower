import { describe, expect, it } from 'vitest'
import { createScriptRegistry, type SmartScriptPack } from '../../domain/scripts'
import { catfishingSmartScriptPack } from '../../domain/scripts/packs/catfishing'
import { selectSetupCandidates } from './selectSetupCandidates'

describe('setup candidate selection', () => {
  it('selects only verified composition-valid templates by script and player count', () => {
    const registry = createScriptRegistry([catfishingSmartScriptPack])

    const seven = selectSetupCandidates({ registry, scriptId: 'catfishing', playerCount: 7, seed: 'same-table' })
    const twelve = selectSetupCandidates({ registry, scriptId: 'catfishing', playerCount: 12, seed: 'same-table' })
    const fifteen = selectSetupCandidates({ registry, scriptId: 'catfishing', playerCount: 15, seed: 'same-table' })

    expect(seven).toHaveLength(3)
    expect(twelve).toHaveLength(3)
    expect(fifteen).toHaveLength(3)
    expect([...seven, ...twelve, ...fifteen].every((candidate) => candidate.template.verified)).toBe(true)
    expect(seven.every((candidate) => candidate.template.playerCount === 7)).toBe(true)
    expect(twelve.every((candidate) => candidate.template.playerCount === 12)).toBe(true)
    expect(fifteen.every((candidate) => candidate.template.playerCount === 15)).toBe(true)
  })

  it('is stable with a seed but does not require a seed for real use', () => {
    const registry = createScriptRegistry([catfishingSmartScriptPack])

    const firstRun = selectSetupCandidates({ registry, scriptId: 'catfishing', playerCount: 12, seed: 'table-001' })
    const secondRun = selectSetupCandidates({ registry, scriptId: 'catfishing', playerCount: 12, seed: 'table-001' })
    const unseeded = selectSetupCandidates({ registry, scriptId: 'catfishing', playerCount: 12, count: 2 })

    expect(firstRun.map((candidate) => candidate.template.templateId)).toEqual(
      secondRun.map((candidate) => candidate.template.templateId),
    )
    expect(unseeded).toHaveLength(2)
  })

  it('never returns unverified templates', () => {
    const unverifiedPack: SmartScriptPack = {
      ...catfishingSmartScriptPack,
      scriptId: 'unverified-only',
      setupTemplates: [
        {
          ...catfishingSmartScriptPack.setupTemplates[0],
          templateId: 'unverified-only-7',
          scriptId: 'unverified-only',
          verified: false,
        },
      ],
    }
    const registry = createScriptRegistry([unverifiedPack])

    expect(selectSetupCandidates({ registry, scriptId: 'unverified-only', playerCount: 7, seed: 'safe' })).toEqual([])
  })
})
