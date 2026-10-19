import { describe, expect, it, vi } from 'vitest'
import { createAIAccessGuard } from './aiAccess'
import { createAIProxyHandlers } from './aiProxyHandlers'
import { createAIProxyRoutes } from './aiProxyRoutes'

const passcode = 'test-only-access-secret-at-least-32-characters'
const env = { BOTC_AI_ACCESS_SECRET: passcode, BOTC_AI_PUBLIC_ORIGIN: 'https://botc.example.test' }
function request(method = 'POST', body: unknown = { passcode }, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/settings/ai/access', {
    method, headers: { 'Content-Type': 'application/json', ...headers },
    ...(method !== 'GET' && method !== 'DELETE' ? { body: JSON.stringify(body) } : {}),
  })
}
async function login(guard: ReturnType<typeof createAIAccessGuard>) {
  const response = await guard.handle(request())
  expect(response.status).toBe(200)
  return response.headers.get('set-cookie')!.split(';')[0]
}

describe('private AI browser access', () => {
  it('remembers a verified browser without exposing either secret or the cookie to page scripts', async () => {
    const guard = createAIAccessGuard(env)
    expect(guard.status(request())).toMatchObject({ required: true, authorized: false })
    const response = await guard.handle(request('POST', { passcode }, { Origin: env.BOTC_AI_PUBLIC_ORIGIN }))
    const cookie = response.headers.get('set-cookie')!
    expect(cookie).toMatch(/^__Host-botc-ai=/)
    for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', 'Max-Age=2592000']) expect(cookie).toContain(attribute)
    expect(cookie).not.toContain(passcode)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.text()).not.toContain(passcode)
    expect(guard.status(request('GET', undefined, { cookie: cookie.split(';')[0] }))).toEqual({ required: true, authorized: true, rememberDays: 30 })
    expect(createAIAccessGuard(env).status(request('GET', undefined, { cookie: cookie.split(';')[0] })).authorized).toBe(true)
  })

  it('rejects modified, expired, duplicate and rotated credentials', async () => {
    let time = 1_790_000_000_000
    const guard = createAIAccessGuard(env, () => time)
    const cookie = await login(guard)
    expect(guard.protect(request('POST', {}, { cookie }))).toBeNull()
    expect(guard.protect(request('POST', {}, { cookie: cookie.slice(0, -2) + 'aa' }))?.status).toBe(401)
    expect(guard.protect(request('POST', {}, { cookie: `${cookie}; ${cookie}` }))?.status).toBe(401)
    expect(createAIAccessGuard({ ...env, BOTC_AI_ACCESS_SECRET: passcode + '-rotated' }).protect(request('POST', {}, { cookie }))?.status).toBe(401)
    time += 30 * 24 * 60 * 60 * 1000
    expect(guard.protect(request('POST', {}, { cookie }))?.status).toBe(401)
  })

  it('blocks cross-site use and clears only this browser on logout', async () => {
    const guard = createAIAccessGuard(env)
    const cookie = await login(guard)
    for (const method of ['POST', 'DELETE']) {
      expect((await guard.handle(request(method, { passcode }, { Origin: 'https://untrusted.example' }))).status).toBe(403)
    }
    expect(guard.protect(request('POST', {}, { cookie, 'Sec-Fetch-Site': 'cross-site' }))?.status).toBe(403)
    const response = await guard.handle(request('DELETE', undefined, { Origin: env.BOTC_AI_PUBLIC_ORIGIN }))
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
    expect(guard.status(request('GET', undefined, { cookie })).authorized).toBe(true)
  })

  it('limits wrong guesses per client and allows retry after the window', async () => {
    let time = 1_790_000_000_000
    const guard = createAIAccessGuard(env, () => time)
    for (let n = 0; n < 10; n++) expect((await guard.handle(request('POST', { passcode: 'wrong' }, { 'CF-Connecting-IP': '192.0.2.1' }))).status).toBe(401)
    expect((await guard.handle(request('POST', { passcode }, { 'CF-Connecting-IP': '192.0.2.1' }))).status).toBe(429)
    expect((await guard.handle(request('POST', { passcode }, { 'CF-Connecting-IP': '192.0.2.2' }))).status).toBe(200)
    time += 15 * 60 * 1000
    expect((await guard.handle(request('POST', { passcode }, { 'CF-Connecting-IP': '192.0.2.1' }))).status).toBe(200)
  })

  it('rejects malformed and oversized input and fails closed for a weak server secret', async () => {
    const guard = createAIAccessGuard(env)
    for (const body of [null, [], 'text', {}, { passcode: 1 }, { passcode, model: 'override' }]) expect((await guard.handle(request('POST', body))).status).toBe(400)
    expect((await guard.handle(request('POST', { passcode: 'x'.repeat(2000) }))).status).toBe(413)
    expect((await guard.handle(request('POST', { passcode }, { 'Content-Type': 'text/plain' }))).status).toBe(400)
    const weak = createAIAccessGuard({ BOTC_AI_ACCESS_SECRET: 'short' })
    expect(weak.protect(request())?.status).toBe(401)
    expect((await weak.handle(request())).status).toBe(503)
  })

  it('keeps local-only development compatible without opening a configured private server', async () => {
    expect(createAIAccessGuard({}).protect(request())).toBeNull()
    const guard = createAIAccessGuard({ BOTC_AI_ACCESS_SECRET: passcode })
    const response = await guard.handle(request())
    expect(response.headers.get('set-cookie')).toMatch(/^botc-ai-local=/)
    expect(response.headers.get('set-cookie')).not.toContain('; Secure')
  })

  it('gates every paid route before a provider call, retains access across route restarts and never returns secrets', async () => {
    const settings = { ...env, BOTC_AI_ENABLED: 'true', BOTC_AI_BASE_URL: 'https://provider.example.test/v1', BOTC_AI_MODEL: 'server-model', BOTC_AI_API_KEY: 'fake-provider-secret' }
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] })))
    const route = createAIProxyRoutes(createAIProxyHandlers({ env: settings, fetcher }), { env: settings })
    for (const path of ['/api/settings/ai/live-test', '/api/ai/setup-advice', '/api/ai/night-settlement-advice']) {
      const response = await route(new Request(`https://botc.example.test${path}`, { method: 'POST', body: '{}' }))
      expect(response.status).toBe(401)
    }
    expect(fetcher).not.toHaveBeenCalled()
    const response = await route(request())
    const cookie = response.headers.get('set-cookie')!.split(';')[0]
    const restarted = createAIProxyRoutes(createAIProxyHandlers({ env: settings, fetcher }), { env: settings })
    const live = await restarted(new Request('https://botc.example.test/api/settings/ai/live-test', { method: 'POST', headers: { Cookie: cookie }, body: '{}' }))
    expect((await live.json()).ok).toBe(true)
    expect(fetcher).toHaveBeenCalledTimes(1)
    const status = await restarted(new Request('https://botc.example.test/api/settings/ai', { headers: { Cookie: cookie } }))
    const text = await status.text()
    expect(JSON.parse(text).access).toMatchObject({ required: true, authorized: true })
    expect(text).not.toContain(passcode)
    expect(text).not.toContain(settings.BOTC_AI_API_KEY)
    expect(status.headers.get('cache-control')).toBe('no-store')
  })
})
