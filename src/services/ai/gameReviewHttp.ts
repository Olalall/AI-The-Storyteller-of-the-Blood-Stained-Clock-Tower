import {
  defaultArchiveRuntimeSettings,
  readArchiveRuntimeSettings,
  type ArchiveRuntimeSettings,
} from '../archive'
import type { GameArchiveRecord } from '../archive'
import { localAIAdapter } from './localAIAdapter'
import { aiEnabledFor, aiTransportSettings, clientProviderSettingsFor } from './clientProviderSettings'
import { readAISettings } from '../settings'
import type { AIProviderKind, GameAIPlayerReview, GameAIReviewDraft } from './types'

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface BackendPlayerReview {
  seatId?: number
  nickname?: string
  roleName?: string
  score?: number
  basis?: string[]
  comment?: string
  sharpComment?: string
}

interface BackendReviewDraft {
  provider?: AIProviderKind
  disclaimer?: string
  gameEvaluation?: {
    summary?: string
    highlights?: string[]
    risks?: string[]
  }
  fullReview?: {
    summary?: string
    turningPoints?: string[]
    suggestedReplayOrder?: string[]
  }
  playerReviews?: BackendPlayerReview[]
}

interface BackendReviewResponse {
  accepted?: boolean
  data?: {
    draft?: BackendReviewDraft
  }
}

export interface CreateGameReviewDraftAsyncOptions {
  runtimeSettings?: ArchiveRuntimeSettings
  fetcher?: FetchLike
}

function urlFor(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/api/ai/review-draft`
}

async function fetchWithTimeout(fetcher: FetchLike, timeoutMs: number, input: string, init: RequestInit) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetcher(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function mapPlayerReviews(players: BackendPlayerReview[] | undefined): GameAIPlayerReview[] {
  return (players ?? []).map((player, index) => {
    const seatId = typeof player.seatId === 'number' ? player.seatId : index + 1
    const score = typeof player.score === 'number' ? Math.max(0, Math.min(100, Math.round(player.score))) : 0
    return {
      seatId,
      name: player.nickname?.trim() || `${seatId}号`,
      roleName: player.roleName?.trim() || '未知身份',
      activity: player.basis?.length ?? 0,
      score,
      keyEvents: player.basis?.slice(0, 3) ?? [],
      note: player.comment?.trim() || '后端草稿未提供有效评语。',
      roast: player.sharpComment?.trim() || player.comment?.trim() || '暂无锐评。',
    }
  })
}

function mapBackendDraft(draft: BackendReviewDraft, fallback: GameAIReviewDraft): GameAIReviewDraft {
  const playerScores = mapPlayerReviews(draft.playerReviews)
  return {
    provider: draft.provider ?? 'openai-compatible',
    source: 'backend',
    disclaimer: draft.disclaimer,
    evaluation: {
      density: draft.gameEvaluation?.summary?.trim() || fallback.evaluation.density,
      vote: draft.gameEvaluation?.highlights?.join('；') || fallback.evaluation.vote,
      correction: draft.gameEvaluation?.risks?.join('；') || fallback.evaluation.correction,
    },
    fullReview: {
      summary: draft.fullReview?.summary?.trim() || fallback.fullReview.summary,
      turningPoints: draft.fullReview?.turningPoints?.filter(Boolean) ?? fallback.fullReview.turningPoints,
      suggestedReplayOrder: draft.fullReview?.suggestedReplayOrder?.filter(Boolean) ?? fallback.fullReview.suggestedReplayOrder,
    },
    playerScores: playerScores.length ? playerScores : fallback.playerScores,
    topPlayers: (playerScores.length ? playerScores : fallback.playerScores)
      .slice()
      .sort((left, right) => right.score - left.score)
      .slice(0, 4),
  }
}

export async function createGameReviewDraftAsync(
  archive: GameArchiveRecord,
  options: CreateGameReviewDraftAsyncOptions = {},
): Promise<GameAIReviewDraft> {
  const fallback = localAIAdapter.createGameReviewDraft(archive)
  const runtimeSettings = options.runtimeSettings ?? readArchiveRuntimeSettings()
  const aiSettings = readAISettings()
  if (runtimeSettings.mode === 'local' && !aiEnabledFor(aiSettings)) return fallback
  const transportSettings = aiTransportSettings(runtimeSettings)
  const clientProvider = clientProviderSettingsFor(transportSettings, aiSettings)

  try {
    const response = await fetchWithTimeout(
      options.fetcher ?? fetch,
      transportSettings.timeoutMs || defaultArchiveRuntimeSettings.timeoutMs,
      urlFor(transportSettings.baseUrl || defaultArchiveRuntimeSettings.baseUrl),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archive,
          reviewStyle: 'sharp',
          includePlayerScores: true,
          ...(clientProvider ? { clientProvider } : {}),
        }),
      },
    )
    const body = await response.json() as BackendReviewResponse
    if (!response.ok || body.accepted !== true || !body.data?.draft) throw new Error('review draft failed')
    return mapBackendDraft(body.data.draft, fallback)
  } catch {
    return {
      ...fallback,
      warning: '后端复盘不可用，已使用本地草稿。',
    }
  }
}
