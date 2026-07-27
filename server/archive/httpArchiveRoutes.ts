import type { GameArchiveRecord, GameWinner } from '../../src/services/archive/types'
import type { createArchiveHandlers } from './handlers'
import type { ArchiveErrorCode, ArchiveListQuery, ReviewStyle } from './types'

type ArchiveHandlers = ReturnType<typeof createArchiveHandlers>

interface ApiErrorBody {
  accepted: false
  error: {
    code: ArchiveErrorCode
    message: string
  }
}

const errorMessages: Record<ArchiveErrorCode, string> = {
  BAD_REQUEST: '请求字段缺失或格式错误',
  ARCHIVE_NOT_FOUND: '归档不存在',
  SESSION_MISMATCH: '归档不属于当前对局',
  RESET_NOT_CONFIRMED: '重置未确认',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function apiError(code: ArchiveErrorCode, status: number, message = errorMessages[code]) {
  return json({ accepted: false, error: { code, message } } satisfies ApiErrorBody, status)
}

async function readBody(request: Request) {
  try {
    const body: unknown = await request.json()
    return body && typeof body === 'object' ? body as Record<string, unknown> : null
  } catch {
    return null
  }
}

function commandIdFrom(body: Record<string, unknown>) {
  return typeof body.commandId === 'string' && body.commandId.trim() ? body.commandId : null
}

function payloadFrom(body: Record<string, unknown>) {
  return body.payload && typeof body.payload === 'object' ? body.payload as Record<string, unknown> : null
}

async function readOptionalBody(request: Request) {
  const text = await request.text()
  if (!text.trim()) return {}
  try {
    const body: unknown = JSON.parse(text)
    return body && typeof body === 'object' ? body as Record<string, unknown> : null
  } catch {
    return null
  }
}

function winnerFrom(value: string | null): GameWinner | undefined {
  return value === 'good' || value === 'evil' || value === 'undecided' ? value : undefined
}

function reviewStyleFrom(value: unknown): ReviewStyle | undefined {
  return value === 'neutral' || value === 'sharp' ? value : undefined
}

function queryFrom(url: URL): ArchiveListQuery {
  const playerCountText = url.searchParams.get('playerCount')
  const playerCount = playerCountText ? Number(playerCountText) : undefined
  return {
    dateFrom: url.searchParams.get('dateFrom') ?? undefined,
    dateTo: url.searchParams.get('dateTo') ?? undefined,
    winner: winnerFrom(url.searchParams.get('winner')),
    playerCount: Number.isFinite(playerCount) ? playerCount : undefined,
  }
}

async function postArchive(handlers: ArchiveHandlers, request: Request, sessionId: string) {
  const body = await readBody(request)
  if (!body) return apiError('BAD_REQUEST', 400)
  const commandId = commandIdFrom(body)
  const payload = payloadFrom(body)
  const archive = payload?.archive as GameArchiveRecord | undefined
  if (!commandId || !archive || typeof archive !== 'object') return apiError('BAD_REQUEST', 400)

  const result = await handlers.archiveGame({ commandId, sessionId, archive })
  return json(result)
}

async function postResetAfterArchive(handlers: ArchiveHandlers, request: Request, sessionId: string) {
  const body = await readBody(request)
  if (!body) return apiError('BAD_REQUEST', 400)
  const commandId = commandIdFrom(body)
  const payload = payloadFrom(body)
  const archiveId = payload?.archiveId
  if (!commandId || typeof archiveId !== 'string') return apiError('BAD_REQUEST', 400)

  const result = await handlers.resetAfterArchive({
    commandId,
    sessionId,
    archiveId,
    confirmReset: payload?.confirmReset === true,
  })
  if (result.accepted) return json(result)
  const status = result.error === 'ARCHIVE_NOT_FOUND' ? 404 : 400
  return apiError(result.error, status)
}

async function postReviewDraft(handlers: ArchiveHandlers, request: Request, archiveId: string) {
  const body = await readOptionalBody(request)
  if (!body) return apiError('BAD_REQUEST', 400)
  const includePlayerScores = body.includePlayerScores
  if (includePlayerScores !== undefined && typeof includePlayerScores !== 'boolean') return apiError('BAD_REQUEST', 400)
  const reviewStyle = reviewStyleFrom(body.reviewStyle)
  if (body.reviewStyle !== undefined && !reviewStyle) return apiError('BAD_REQUEST', 400)

  const result = await handlers.generateReviewDraft({
    archiveId,
    reviewStyle,
    includePlayerScores,
  })
  return result.accepted ? json(result) : apiError(result.error, 404)
}

export function createArchiveHttpRoutes(handlers: ArchiveHandlers) {
  return async function handleArchiveRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const archiveRoute = url.pathname.match(/^\/api\/archives\/([^/]+)$/)
    const reviewDraftRoute = url.pathname.match(/^\/api\/archives\/([^/]+)\/review-draft$/)
    const gameArchiveRoute = url.pathname.match(/^\/api\/games\/([^/]+)\/archive$/)
    const resetRoute = url.pathname.match(/^\/api\/games\/([^/]+)\/reset-after-archive$/)

    if (request.method === 'GET' && url.pathname === '/api/archives') {
      return json({ archives: await handlers.listArchives(queryFrom(url)) })
    }
    if (request.method === 'GET' && archiveRoute) {
      const archive = await handlers.getArchive(decodeURIComponent(archiveRoute[1]))
      return archive ? json({ archive }) : apiError('ARCHIVE_NOT_FOUND', 404)
    }
    if (request.method === 'POST' && reviewDraftRoute) {
      return postReviewDraft(handlers, request, decodeURIComponent(reviewDraftRoute[1]))
    }
    if (request.method === 'POST' && gameArchiveRoute) {
      return postArchive(handlers, request, decodeURIComponent(gameArchiveRoute[1]))
    }
    if (request.method === 'POST' && resetRoute) {
      return postResetAfterArchive(handlers, request, decodeURIComponent(resetRoute[1]))
    }
    return apiError('BAD_REQUEST', 404, '未匹配的归档接口')
  }
}
