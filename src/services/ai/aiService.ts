import type { GameArchiveRecord } from '../archive'
import type { GenerateSetupCandidatesInput, CreateNightResultAdviceInput } from './types'
import { createGameReviewDraftAsync } from './gameReviewHttp'
import { createNightResultAdviceAsync } from './nightSettlementHttp'
import { createSetupAdviceDraftAsync } from './setupAdviceHttp'
import { localAIAdapter } from './localAIAdapter'

export function generateSetupCandidates(input: GenerateSetupCandidatesInput) {
  return localAIAdapter.generateSetupCandidates(input)
}

export function createNightResultAdvice(input: CreateNightResultAdviceInput) {
  return localAIAdapter.createNightResultAdvice(input)
}

export function createGameReviewDraft(archive: GameArchiveRecord) {
  return localAIAdapter.createGameReviewDraft(archive)
}

export { createGameReviewDraftAsync, createNightResultAdviceAsync, createSetupAdviceDraftAsync }
