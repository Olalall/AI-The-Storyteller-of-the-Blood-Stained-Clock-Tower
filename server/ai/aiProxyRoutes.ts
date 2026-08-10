import type { createAIProxyHandlers } from './aiProxyHandlers'
import { aiApiError, json } from './aiErrors'
import { isNightSettlementRequest, isSetupAdviceRequest } from './aiRequestValidators'
import type { AISettingsLiveTestRequest, ClientAIProviderSettings } from './types'

export type AIProxyHandlers = ReturnType<typeof createAIProxyHandlers>

function isLoopbackHostname(hostname: string) {
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1'
}

function clientProviderFrom(request: Request, body: Record<string, unknown>): ClientAIProviderSettings | undefined {
  if (!isLoopbackHostname(new URL(request.url).hostname)) return undefined
  const value = body.clientProvider
  if (!value || typeof value !== 'object') return undefined
  const candidate = value as Record<string, unknown>
  if (candidate.provider !== 'openai-compatible') return undefined
  if (typeof candidate.baseUrl !== 'string' || !candidate.baseUrl.trim()) return undefined
  if (typeof candidate.model !== 'string' || !candidate.model.trim()) return undefined
  if (typeof candidate.apiKey !== 'string' || !candidate.apiKey.trim()) return undefined
  if (typeof candidate.timeoutSeconds !== 'number' || !Number.isFinite(candidate.timeoutSeconds)) return undefined
  return {
    provider: 'openai-compatible',
    baseUrl: candidate.baseUrl.trim(),
    model: candidate.model.trim(),
    apiKey: candidate.apiKey.trim(),
    timeoutSeconds: Math.min(120, Math.max(5, Math.round(candidate.timeoutSeconds))),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function createAIProxyRoutes(handlers: AIProxyHandlers) {
  return async function handleAIProxyRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'GET' && url.pathname === '/api/settings/ai') {
      return json({ settings: handlers.getPublicSettings() })
    }
    if (request.method === 'POST' && url.pathname === '/api/settings/ai/test') {
      return json(handlers.testProviderSettings())
    }
    if (request.method === 'POST' && url.pathname === '/api/settings/ai/live-test') {
      try {
        const text = await request.text()
        const body = text.trim() ? JSON.parse(text) as AISettingsLiveTestRequest : undefined
        return json(await handlers.liveTestProviderSettings(body))
      } catch {
        return aiApiError('BAD_REQUEST', 400)
      }
    }
    if (request.method === 'POST' && url.pathname === '/api/ai/setup-advice') {
      try {
        const body = JSON.parse(await request.text()) as unknown
        if (!isSetupAdviceRequest(body)) return aiApiError('BAD_REQUEST', 400)
        const record = body as unknown as Record<string, unknown>
        return json({ accepted: true, data: { draft: await handlers.generateSetupAdvice(body, clientProviderFrom(request, record)) } })
      } catch {
        return aiApiError('BAD_REQUEST', 400)
      }
    }
    if (request.method === 'POST' && url.pathname === '/api/ai/night-settlement-advice') {
      try {
        const body = JSON.parse(await request.text()) as unknown
        if (!isNightSettlementRequest(body)) return aiApiError('BAD_REQUEST', 400)
        const record = body as unknown as Record<string, unknown>
        return json({ accepted: true, data: { draft: await handlers.generateNightSettlementAdvice(body, clientProviderFrom(request, record)) } })
      } catch {
        return aiApiError('BAD_REQUEST', 400)
      }
    }
    if (request.method === 'POST' && url.pathname === '/api/ai/review-draft') {
      try {
        const body = JSON.parse(await request.text()) as unknown
        if (!isRecord(body) || !isRecord(body.archive)) return aiApiError('BAD_REQUEST', 400)
        const reviewStyle = body.reviewStyle === 'neutral' || body.reviewStyle === 'sharp' ? body.reviewStyle : 'sharp'
        const includePlayerScores = body.includePlayerScores === undefined ? true : body.includePlayerScores === true
        const result = await handlers.generateReviewDraft(
          body.archive as never,
          { reviewStyle, includePlayerScores },
          clientProviderFrom(request, body),
        )
        return json({
          accepted: true,
          data: {
            draft: result.draft,
          },
          warnings: result.warnings,
        })
      } catch {
        return aiApiError('BAD_REQUEST', 400)
      }
    }
    return aiApiError('BAD_REQUEST', 404, '未匹配的 AI 接口')
  }
}
