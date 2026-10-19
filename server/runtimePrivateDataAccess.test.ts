import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createArchiveRuntime } from './runtime'

let temporary = ''
afterEach(async () => {
  vi.unstubAllEnvs()
  if (temporary) await rm(temporary, { recursive: true, force: true })
  temporary = ''
})

describe('fixed-server private data routes share the invited-device policy', () => {
  it('rejects anonymous archive/recovery reads and writes, while preserving the authorized cookie path', async () => {
    vi.stubEnv('BOTC_AI_ACCESS_SECRET', 'synthetic-runtime-invitation-passcode-for-test')
    vi.stubEnv('BOTC_AI_PUBLIC_ORIGIN', 'https://botc.example.test')
    temporary = await mkdtemp(path.join(os.tmpdir(), 'botc-data-guard-'))
    const route = createArchiveRuntime({ dataFile: path.join(temporary, 'archives.json'), recoveryDataFile: path.join(temporary, 'recovery.json') })
    const paths = ['/api/archives', '/api/recovery/snapshots', '/api/archives/missing', '/api/recovery/snapshots/missing']
    for (const pathname of paths) {
      const response = await route(new Request(`https://botc.example.test${pathname}`))
      expect(response.status).toBe(401)
      expect(response.headers.get('cache-control')).toBe('no-store')
    }
    for (const pathname of ['/api/games/test/archive', '/api/recovery/snapshots/test']) {
      const response = await route(new Request(`https://botc.example.test${pathname}`, { method: 'POST', body: '{}' }))
      expect(response.status).toBe(401)
    }
    const login = await route(new Request('https://botc.example.test/api/settings/ai/access', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: 'synthetic-runtime-invitation-passcode-for-test' }),
    }))
    const cookie = login.headers.get('set-cookie')!.split(';')[0]
    expect(login.status).toBe(200)
    for (const pathname of paths.slice(0, 2)) {
      const response = await route(new Request(`https://botc.example.test${pathname}`, { headers: { cookie } }))
      expect(response.status).toBe(200)
    }
    const crossSite = await route(new Request('https://botc.example.test/api/recovery/snapshots', {
      headers: { cookie, Origin: 'https://other.example.test', 'Sec-Fetch-Site': 'cross-site' },
    }))
    expect(crossSite.status).toBe(403)
  })
})
