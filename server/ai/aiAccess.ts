import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { aiApiError, json } from './aiErrors'

const lifetimeSeconds = 30 * 24 * 60 * 60
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]'])

export function createAIAccessGuard(env: NodeJS.ProcessEnv = process.env, now = Date.now, allowAnonymous = false) {
  const secret = env.BOTC_AI_ACCESS_SECRET?.trim() ?? ''
  const failures = new Map<string, { count: number; until: number }>()
  const digest = (value: string) => createHmac('sha256', secret).update(`botc-ai-access-v1:${value}`).digest()
  const same = (left: string, right: string) => timingSafeEqual(digest(left), digest(right))
  const originFor = (request: Request) => new URL(env.BOTC_AI_PUBLIC_ORIGIN || request.url).origin
  const secureFor = (request: Request) => !localHosts.has(new URL(originFor(request)).hostname)
  const cookieName = (request: Request) => secureFor(request) ? '__Host-botc-ai' : 'botc-ai-local'
  function cookie(request: Request, value: string, seconds: number) {
    return `${cookieName(request)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${secureFor(request) ? '; Secure' : ''}`
  }
  function authorized(request: Request) {
    if (!secret) return true
    if (secret.length < 32) return false
    const cookies = (request.headers.get('cookie') ?? '').split(';').map(item => item.trim())
    const values = cookies.filter(item => item.startsWith(`${cookieName(request)}=`))
    if (values.length !== 1) return false
    const value = values[0].slice(cookieName(request).length + 1)
    const match = /^(\d{10})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(value)
    if (!match || Number(match[1]) <= Math.floor(now() / 1000)) return false
    return same(match[3], digest(`${match[1]}.${match[2]}`).toString('hex'))
  }
  function status(request: Request) {
    return { required: !allowAnonymous && Boolean(secret), authorized: allowAnonymous || authorized(request), rememberDays: 30 }
  }
  function trustedOrigin(request: Request) {
    const origin = request.headers.get('origin')
    return request.headers.get('sec-fetch-site') !== 'cross-site' && (!origin || origin === originFor(request))
  }
  function noStore(response: Response) {
    response.headers.set('Cache-Control', 'no-store')
    return response
  }
  function protect(request: Request) {
    if (!secret && !allowAnonymous) return null
    if (!trustedOrigin(request)) return noStore(aiApiError('BAD_REQUEST', 403, '请从本站使用 AI。'))
    if (!allowAnonymous && !authorized(request)) return noStore(aiApiError('AI_ACCESS_REQUIRED', 401))
    return null
  }
  async function handle(request: Request) {
    if (!trustedOrigin(request)) return noStore(aiApiError('BAD_REQUEST', 403))
    if (request.method === 'DELETE') {
      const response = noStore(json({ ok: true }))
      response.headers.set('Set-Cookie', cookie(request, '', 0))
      return response
    }
    if (request.method !== 'POST') return noStore(aiApiError('BAD_REQUEST', 405))
    if (!secret || secret.length < 32) return noStore(aiApiError('AI_PROVIDER_UNCONFIGURED', 503))
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return noStore(aiApiError('BAD_REQUEST', 400))
    const client = request.headers.get('cf-connecting-ip') ?? 'local'
    const previous = failures.get(client)
    if (previous && previous.until > now() && previous.count >= 10) return noStore(aiApiError('AI_PROVIDER_RATE_LIMITED', 429))
    try {
      const reader = request.body?.getReader()
      if (!reader) return noStore(aiApiError('BAD_REQUEST', 400))
      let text = '', bytes = 0
      const decoder = new TextDecoder()
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        bytes += chunk.value.length
        if (bytes > 1024) { await reader.cancel(); return noStore(aiApiError('BAD_REQUEST', 413)) }
        text += decoder.decode(chunk.value, { stream: true })
      }
      text += decoder.decode()
      const body: unknown = JSON.parse(text)
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => key !== 'passcode')) return noStore(aiApiError('BAD_REQUEST', 400))
      const passcode = (body as { passcode?: unknown }).passcode
      if (typeof passcode !== 'string' || passcode.length > 256) return noStore(aiApiError('BAD_REQUEST', 400))
      if (!same(passcode, secret)) {
        for (const [key, value] of failures) if (value.until <= now()) failures.delete(key)
        if (failures.size >= 1000 && !failures.has(client)) return noStore(aiApiError('AI_PROVIDER_RATE_LIMITED', 429))
        failures.set(client, { count: previous && previous.until > now() ? previous.count + 1 : 1, until: previous && previous.until > now() ? previous.until : now() + 15 * 60 * 1000 })
        return noStore(aiApiError('AI_ACCESS_REQUIRED', 401, '访问口令不正确。'))
      }
      failures.delete(client)
      const payload = `${Math.floor(now() / 1000) + lifetimeSeconds}.${randomBytes(16).toString('hex')}`
      const response = noStore(json({ ok: true, access: { required: true, authorized: true, rememberDays: 30 } }))
      response.headers.set('Set-Cookie', cookie(request, `${payload}.${digest(payload).toString('hex')}`, lifetimeSeconds))
      return response
    } catch {
      return noStore(aiApiError('BAD_REQUEST', 400))
    }
  }
  return { status, protect, handle }
}
