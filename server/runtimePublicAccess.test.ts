import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { closeArchiveRuntime, createArchiveRuntime, startArchiveRuntime } from './runtime'

const tempDirs: string[] = []

async function runtime(publicAccessMode: boolean) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'botc-public-runtime-'))
  tempDirs.push(tempDir)
  return createArchiveRuntime({
    publicAccessMode,
    dataFile: path.join(tempDir, 'archives.json'),
    recoveryDataFile: path.join(tempDir, 'recovery.json'),
    staticDir: path.join(tempDir, 'static'),
  })
}

afterEach(async () => {
  vi.unstubAllEnvs()
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

describe('public access runtime boundary', () => {
  it('keeps health checks anonymous', async () => {
    const route = await runtime(true)

    const response = await route(new Request('http://public.example/healthz'))

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ ok: true })
  })

  it.each([
    ['GET', '/api/archives'],
    ['GET', '/api/archives/private-game'],
    ['POST', '/api/archives'],
    ['GET', '/api/recovery/private-game'],
    ['PUT', '/api/recovery/private-game'],
  ])('blocks %s %s before private repositories are reached', async (method, pathname) => {
    const route = await runtime(true)
    const response = await route(new Request(`http://public.example${pathname}`, {
      method,
      body: method === 'GET' ? undefined : JSON.stringify({}),
    }))

    expect(response.status).toBe(403)
    expect(await response.json()).toMatchObject({ error: { code: 'PUBLIC_API_FORBIDDEN' } })
  })

  it('preserves the existing local runtime behavior by default', async () => {
    const route = await runtime(false)

    const response = await route(new Request('http://127.0.0.1/api/archives'))

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ archives: [] })
  })

  it('wires public mode into AI routes so the VPS provider and key stay unavailable', async () => {
    vi.stubEnv('BOTC_AI_ENABLED', 'true')
    vi.stubEnv('BOTC_AI_PROVIDER', 'openai-compatible')
    vi.stubEnv('BOTC_AI_BASE_URL', 'https://server-provider.example.test/v1')
    vi.stubEnv('BOTC_AI_MODEL', 'server-private-model')
    vi.stubEnv('BOTC_AI_API_KEY', 'sk-server-private')
    const route = await runtime(true)

    const response = await route(new Request('http://public.example/api/settings/ai'))
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).not.toContain('sk-server-private')
    expect(text).not.toContain('server-provider.example.test')
    expect(text).not.toContain('server-private-model')
    expect(JSON.parse(text)).toMatchObject({
      settings: { mode: 'off', provider: 'fake', apiKeyConfigured: false },
    })
  })

  it('rejects streamed AI request bodies above 1 MiB through the real HTTP server', async () => {
    const server = startArchiveRuntime({ port: 0, publicAccessMode: true })
    await new Promise<void>((resolve) => server.once('listening', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('missing test server address')
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/ai/unknown`, {
        method: 'POST',
        body: 'x'.repeat(1024 * 1024 + 1),
      })

      expect(response.status).toBe(413)
      expect(await response.json()).toMatchObject({ error: { code: 'PAYLOAD_TOO_LARGE' } })
    } finally {
      await closeArchiveRuntime(server)
    }
  })

  it('rate limits repeated public AI requests through the real HTTP server', async () => {
    const server = startArchiveRuntime({ port: 0, publicAccessMode: true })
    await new Promise<void>((resolve) => server.once('listening', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('missing test server address')
    try {
      const url = `http://127.0.0.1:${address.port}/api/ai/unknown`
      for (let attempt = 0; attempt < 10; attempt += 1) {
        expect((await fetch(url, { method: 'POST', body: '{}' })).status).not.toBe(429)
      }
      const response = await fetch(url, { method: 'POST', body: '{}' })

      expect(response.status).toBe(429)
      expect(response.headers.get('retry-after')).toBe('60')
      expect(await response.json()).toMatchObject({ error: { code: 'RATE_LIMITED' } })
    } finally {
      await closeArchiveRuntime(server)
    }
  })
})
