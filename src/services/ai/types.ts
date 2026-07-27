import type { GameArchiveRecord } from '../archive'
import type { SetupPrototypeCandidate, SetupSeatProfile } from '../../features/setup'
import type { AIResultAdvice, NightWorkbenchState, WakeDraft, WakeItem } from '../../features/night-workbench/types'
import type { PlayerExperience } from '../../features/game-session/types'
import type { AIRoleKnowledgeBrief } from '../../domain/role-knowledge'
import type { AIRoleResearchBrief } from '../../domain/scripts'

export interface GenerateSetupCandidatesInput {
  scriptId: string
  seatProfiles: readonly SetupSeatProfile[]
}

export interface CreateNightResultAdviceInput {
  state: NightWorkbenchState
  item: WakeItem
  draft: WakeDraft
}

export interface GameAIPlayerReview {
  seatId: number
  name: string
  roleName: string
  activity: number
  score: number
  keyEvents: readonly string[]
  note: string
  roast: string
}

export interface GameAIReviewEvaluation {
  density: string
  vote: string
  correction: string
}

export interface GameAIReviewDraft {
  provider: AIProviderKind
  source: 'local' | 'backend'
  disclaimer?: string
  warning?: string
  evaluation: GameAIReviewEvaluation
  fullReview: {
    summary: string
    turningPoints: readonly string[]
    suggestedReplayOrder: readonly string[]
  }
  playerScores: GameAIPlayerReview[]
  topPlayers: GameAIPlayerReview[]
}

export interface AIAdapter {
  generateSetupCandidates(input: GenerateSetupCandidatesInput): SetupPrototypeCandidate[]
  createNightResultAdvice(input: CreateNightResultAdviceInput): AIResultAdvice | null
  createGameReviewDraft(archive: GameArchiveRecord): GameAIReviewDraft
}

export type AIContextLevel = 'minimal' | 'standard'
export type AIContractKind = 'setup_advice' | 'night_settlement' | 'review_draft'
export type AIProviderKind = 'fake' | 'openai-compatible'
export type AIContractStatus = 'answer' | 'needs_input'
export type AIConfidence = 'low' | 'medium' | 'high'

export interface AIContextSeat {
  seatId: number
  nickname: string
  experience: PlayerExperience
}

export interface AIContractBaseRequest<TKind extends AIContractKind, TContext> {
  requestId: string
  kind: TKind
  contextLevel: AIContextLevel
  createdAt: string
  knowledgeVersion: string
  context: TContext
  question: string
}

export interface SetupAdviceContext {
  scriptId: string
  playerCount: number
  seats: AIContextSeat[]
  candidateIds: string[]
}

export interface SetupBalanceMicroAdjustment {
  candidateId: string
  candidateTitle?: string
  replaceOutRoleId: string
  replaceOutRoleName?: string
  replaceInRoleId: string
  replaceInRoleName?: string
  reason: string
  expectedEffect: string
  risk: string
}

export type SetupQualityTone = 'stable' | 'swingy' | 'good_favored' | 'evil_favored' | 'new_player_heavy' | 'storyteller_heavy'

export interface SetupQualityTag {
  candidateId: string
  label: string
  tone: SetupQualityTone
  reason: string
}

export interface NightSettlementContext {
  scriptId: string
  nightRunId: string
  phaseLabel: string
  playerCount: number
  wakeItem: {
    id: string
    orderIndex: number
    seatId: number
      roleId: string
      roleName: string
      ability: string
      targetCount: number
      status: {
        life: string
        impairments: string[]
        markers: string[]
      }
    }
  draft: {
    targets: number[]
    roleChoice: string
    outcomeId: string
    draftRevision: number
  }
  selectedTargets: {
    seatId: number
    playerLabel: string
    roleId: string
    roleName: string
    status: {
      life: string
      impairments: string[]
      markers: string[]
    }
  }[]
  statusFacts: string[]
  roleKnowledge?: AIRoleKnowledgeBrief
  roleResearch?: AIRoleResearchBrief
}

export interface ReviewDraftContext {
  archiveId: string
  sessionId: string
  scriptName: string
  playerCount: number
  winnerLabel: string
  summary: GameArchiveRecord['summary']
}

export type SetupAdviceRequest = AIContractBaseRequest<'setup_advice', SetupAdviceContext>
export type NightSettlementRequest = AIContractBaseRequest<'night_settlement', NightSettlementContext>
export type ReviewDraftRequest = AIContractBaseRequest<'review_draft', ReviewDraftContext>
export type AIContractRequest = SetupAdviceRequest | NightSettlementRequest | ReviewDraftRequest

export interface SetupAdviceDraft {
  recommendedCandidateIds: string[]
  warnings: string[]
  balanceSummary: string[]
  storytellerNotes: string[]
  microAdjustments: SetupBalanceMicroAdjustment[]
  qualityTags: SetupQualityTag[]
}

export interface SetupAdviceRuntimeDraft {
  provider: AIProviderKind
  source: 'local' | 'backend'
  confidence: AIConfidence
  draftOnly: true
  recommendedCandidateIds: string[]
  warnings: string[]
  reasons: string[]
  balanceSummary: string[]
  storytellerNotes: string[]
  microAdjustments: SetupBalanceMicroAdjustment[]
  qualityTags: SetupQualityTag[]
  disclaimer: string
  warning?: string
}

export interface NightSettlementDraft {
  recommendedOutcomeId?: string
  summary: string
}

export interface ReviewDraftContract {
  summary: string
  playerReviewCount: number
  disclaimer: string
}

export type AIContractDraft = SetupAdviceDraft | NightSettlementDraft | ReviewDraftContract

export interface AIContractResponse<TDraft extends AIContractDraft = AIContractDraft> {
  requestId: string
  kind: AIContractKind
  provider: AIProviderKind
  status: AIContractStatus
  draftOnly: true
  confidence: AIConfidence
  ruleFacts: string[]
  assumptions: string[]
  missing: string[]
  result: TDraft
  suggestedJournalEntries: readonly []
}

export interface AIContractAdapter {
  request(request: AIContractRequest): AIContractResponse
}
