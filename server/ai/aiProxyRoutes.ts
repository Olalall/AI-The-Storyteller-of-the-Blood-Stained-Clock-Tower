import type { createAIProxyHandlers } from './aiProxyHandlers'
import { aiApiError, json } from './aiErrors'
import { isNightSettlementRequest, isSetupAdviceRequest } from './aiRequestValidators'
import { createAIAccessGuard } from './aiAccess'

export type AIProxyHandlers = ReturnType<typeof createAIProxyHandlers>

export function createAIProxyRoutes(handlers: AIProxyHandlers, options: { env?: NodeJS.ProcessEnv } = {}) {
  const access = createAIAccessGuard(options.env)
  return async function handleAIProxyRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/settings/ai/access') return access.handle(request)
    if (request.method === 'GET' && url.pathname === '/api/settings/ai') {
      const response = json({ settings: handlers.getPublicSettings(), access: access.status(request) })
      response.headers.set('Cache-Control', 'no-store')
      return response
    }
    if (request.method === 'POST' && url.pathname === '/api/settings/ai/test') {
      return json(handlers.testProviderSettings())
    }
    if (request.method === 'POST' && (url.pathname.startsWith('/api/ai/') || url.pathname === '/api/settings/ai/live-test')) {
      const denied = access.protect(request)
      if (denied) return denied
    }
    if (request.method === 'POST' && url.pathname === '/api/settings/ai/live-test') {
      try {
        const text = await request.text()
        const body: unknown = text.trim() ? JSON.parse(text) : {}
        if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length) {
          return aiApiError('BAD_REQUEST', 400)
        }
        return json(await handlers.liveTestProviderSettings())
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
