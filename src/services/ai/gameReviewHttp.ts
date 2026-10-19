import {
  defaultArchiveRuntimeSettings,
  readArchiveRuntimeSettings,
  type ArchiveRuntimeSettings,
} from '../archive'
import type { GameArchiveRecord } from '../archive'
import { localAIAdapter } from './localAIAdapter'
import { reviewEvidenceExcerpts, reviewModelMissing, validReviewInterpretations } from './gameReviewEvidence'
import type { AIProviderKind, GameAIReviewDraft } from './types'

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface BackendReviewDraft {
  provider?: AIProviderKind
  interpretations?: unknown
  missing?: unknown
}

interface BackendReviewResponse {
  accepted?: boolean
  data?: { draft?: BackendReviewDraft }
}

export interface CreateGameReviewDraftAsyncOptions {
  runtimeSettings?: ArchiveRuntimeSettings
  fetcher?: FetchLike
}

function urlFor(baseUrl: string, archiveId: string) {
  return `${baseUrl.replace(/\/$/, '')}/api/archives/${encodeURIComponent(archiveId)}/review-draft`
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

function mapBackendDraft(draft: BackendReviewDraft, fallback: GameAIReviewDraft): GameAIReviewDraft {
  const interpretations = validReviewInterpretations(draft.interpretations, reviewEvidenceExcerpts(fallback.keyEvents))
  const missing = reviewModelMissing(draft.missing)
  return {
    ...fallback,
    provider: draft.provider ?? 'openai-compatible',
    source: 'backend',
    interpretations,
    missing: [...new Set([...fallback.missing, ...missing])],
    warning: draft.provider === 'fake' ? '当前返回本地草稿，没有真实模型解释。'
      : interpretations.length ? undefined : '响应没有可核对的有效引用，已保留归档记录事实。',
  }
}

export async function createGameReviewDraftAsync(
  archive: GameArchiveRecord,
  options: CreateGameReviewDraftAsyncOptions = {},
): Promise<GameAIReviewDraft> {
  const fallback = localAIAdapter.createGameReviewDraft(archive)
  const runtimeSettings = options.runtimeSettings ?? readArchiveRuntimeSettings()
  if (runtimeSettings.mode !== 'http') return { ...fallback, warning: '当前使用本地草稿，尚未连接后端 AI。' }

  try {
    const response = await fetchWithTimeout(
      options.fetcher ?? fetch,
      runtimeSettings.timeoutMs || defaultArchiveRuntimeSettings.timeoutMs,
      urlFor(runtimeSettings.baseUrl || defaultArchiveRuntimeSettings.baseUrl, archive.id),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStyle: 'neutral', includePlayerScores: false }),
      },
    )
    const body = await response.json() as BackendReviewResponse
    if (!response.ok || body.accepted !== true || !body.data?.draft) throw new Error('review draft failed')
    return mapBackendDraft(body.data.draft, fallback)
  } catch {
    return { ...fallback, warning: '后端复盘不可用，已使用本地草稿。' }
  }
}
