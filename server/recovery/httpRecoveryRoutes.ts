import type { createRecoveryHandlers } from './handlers'
import type { RecoveryErrorCode } from './types'

type RecoveryHandlers = ReturnType<typeof createRecoveryHandlers>

/**
 * 恢复命名空间的全部路径都在 /api/recovery/ 下。
 *
 * 这个前缀必须在 runtime 的路由表里排在 `/api/` 兜底分支**之前**：兜底分支把一切
 * /api/ 开头的请求交给归档路由，注册晚了这里一条也收不到，而且失败得静悄悄——
 * 请求会拿到归档的 404，看起来像是「后端没这个接口」。
 */
export const recoveryRoutePrefix = '/api/recovery/'

const errorMessages: Record<RecoveryErrorCode, string> = {
  BAD_REQUEST: '请求字段缺失或格式错误',
  RECOVERY_NOT_FOUND: '没有这一局的半局快照',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function apiError(code: RecoveryErrorCode, status: number, message = errorMessages[code]) {
  return json({ accepted: false, error: { code, message } }, status)
}

async function readBody(request: Request) {
  try {
    const body: unknown = await request.json()
    return body && typeof body === 'object' ? body as Record<string, unknown> : null
  } catch {
    return null
  }
}

async function postSnapshot(handlers: RecoveryHandlers, request: Request, sessionId: string) {
  const body = await readBody(request)
  if (!body) return apiError('BAD_REQUEST', 400)
  const session = body.session
  const savedAt = body.savedAt
  if (!session || typeof session !== 'object' || typeof savedAt !== 'string') return apiError('BAD_REQUEST', 400)

  const result = await handlers.pushSnapshot({ sessionId, savedAt, session })
  return result.accepted ? json(result) : apiError(result.error, 400)
}

export function createRecoveryHttpRoutes(handlers: RecoveryHandlers) {
  return async function handleRecoveryRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const snapshotRoute = url.pathname.match(/^\/api\/recovery\/sessions\/([^/]+)\/snapshot$/)

    if (request.method === 'POST' && snapshotRoute) {
      return postSnapshot(handlers, request, decodeURIComponent(snapshotRoute[1]))
    }
    if (request.method === 'GET' && snapshotRoute) {
      const snapshot = await handlers.getSnapshot(decodeURIComponent(snapshotRoute[1]))
      return snapshot ? json({ snapshot }) : apiError('RECOVERY_NOT_FOUND', 404)
    }
    if (request.method === 'GET' && url.pathname === '/api/recovery/snapshots') {
      return json({ snapshots: await handlers.listSnapshots() })
    }
    // 这条 404 的措辞是有用的：它证明请求确实走进了恢复路由，而不是被归档兜底吞掉。
    return apiError('BAD_REQUEST', 404, '未匹配的恢复接口')
  }
}
