import type { PlayerCount, ScriptId, ScriptRegistry, SetupTemplate } from '../../domain/scripts'
import { validateTemplateComposition, type TemplateCompositionCheck } from '../../domain/setup-templates'
import { createSeededRandom, type RandomSource } from './random'

export interface SelectSetupCandidatesInput {
  registry: ScriptRegistry
  scriptId: ScriptId
  playerCount: PlayerCount
  count?: number
  seed?: string | number
  random?: RandomSource
}

export interface SetupCandidate {
  rank: number
  template: SetupTemplate
  composition: TemplateCompositionCheck
}

export function selectSetupCandidates(input: SelectSetupCandidatesInput): readonly SetupCandidate[] {
  const pack = input.registry.get(input.scriptId)
  if (!pack) throw new Error(`未找到智能板子：${input.scriptId}`)

  const desiredCount = input.count ?? 3
  if (desiredCount <= 0) return []

  const eligibleTemplates = pack.setupTemplates
    .filter((template) => template.playerCount === input.playerCount)
    .filter((template) => template.verified)
    .map((template) => ({ template, composition: validateTemplateComposition(pack, template) }))
    .filter((candidate) => candidate.composition.valid)

  const random = input.random ?? (input.seed === undefined ? Math.random : createSeededRandom(input.seed))
  return shuffle(eligibleTemplates, random)
    .slice(0, desiredCount)
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }))
}

function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const output = [...items]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    const current = output[index]
    output[index] = output[target]
    output[target] = current
  }
  return output
}
