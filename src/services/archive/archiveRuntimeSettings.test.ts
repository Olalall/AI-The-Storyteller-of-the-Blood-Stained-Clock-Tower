import { beforeEach, describe, expect, it, vi } from 'vitest'
import { archiveGameAsync, resetAsyncArchiveAdapter } from './archiveService'
import {
  archiveRuntimeSettingsStorageKey,
  applyArchiveRuntimeSettings,
  defaultArchiveRuntimeSettings,
  readArchiveRuntimeSettings,
  resetArchiveRuntimeSettings,
  saveArchiveRuntimeSettings,
} from './archiveRuntimeSettings'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'

describe('archive runtime settings', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetAsyncArchiveAdapter()
    vi.unstubAllGlobals()
  })

  it('defaults to local browser archive storage', () => {
    expect(readArchiveRuntimeSettings()).toEqual(defaultArchiveRuntimeSettings)
  })

  it('normalizes and persists the HTTP archive runtime settings', () => {
    saveArchiveRuntimeSettings({ mode: 'http', baseUrl: ' http://127.0.0.1:8787/ ', timeoutMs: 12345 })

    expect(window.localStorage.getItem(archiveRuntimeSettingsStorageKey)).toContain('127.0.0.1')
    expect(readArchiveRuntimeSettings()).toEqual({
      mode: 'http',
      baseUrl: 'http://127.0.0.1:8787/',
      timeoutMs: 12345,
    })
  })

  it('allows longer runtime timeouts for real AI provider smoke tests', () => {
    saveArchiveRuntimeSettings({ mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 180000 })

    expect(readArchiveRuntimeSettings().timeoutMs).toBe(180000)
  })

  it('can inject the HTTP adapter without changing the default local path', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      accepted: true,
      data: { archive: null, archives: [] },
    })))
    vi.stubGlobal('fetch', fetcher)

    saveArchiveRuntimeSettings({ ...defaultArchiveRuntimeSettings, mode: 'http' })
    applyArchiveRuntimeSettings()

    const session = createPrototypeGameSession()
    await expect(archiveGameAsync({ commandId: 'http', session, winner: 'good' })).rejects.toThrow()
    expect(fetcher).toHaveBeenCalled()
    expect(resetArchiveRuntimeSettings()).toEqual(defaultArchiveRuntimeSettings)
  })
})
