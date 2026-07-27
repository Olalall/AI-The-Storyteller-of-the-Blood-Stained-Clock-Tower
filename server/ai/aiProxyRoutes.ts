import type { createAIProxyHandlers } from './aiProxyHandlers'
import { aiApiError, json } from './aiErrors'
import { isNightSettlementRequest, isSetupAdviceRequest } from './aiRequestValidators'
import type { AISettingsLiveTestRequest } from './types'

export type AIProxyHandlers = ReturnType<typeof createAIProxyHandlers>

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
        return json({ accepted: true, data: { draft: await handlers.generateSetupAdvice(body) } })
      } catch {
        return aiApiError('BAD_REQUEST', 400)
      }
    }
    if (request.method === 'POST' && url.pathname === '/api/ai/night-settlement-advice') {
      try {
        const body = JSON.parse(await request.text()) as unknown
        if (!isNightSettlementRequest(body)) return aiApiError('BAD_REQUEST', 400)
        return json({ accepted: true, data: { draft: await handlers.generateNightSettlementAdvice(body) } })
      } catch {
        return aiApiError('BAD_REQUEST', 400)
      }
    }
    return aiApiError('BAD_REQUEST', 404, '未匹配的 AI 接口')
  }
}
