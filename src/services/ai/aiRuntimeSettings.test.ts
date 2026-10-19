import { beforeEach, describe, expect, it } from 'vitest'
import { archiveRuntimeSettingsStorageKey, defaultArchiveRuntimeSettings, readArchiveRuntimeSettings, saveArchiveRuntimeSettings } from '../archive/archiveRuntimeSettings'
import { readAIRuntimeSettings } from './aiRuntimeSettings'

describe('AI runtime routing independently of archive storage', () => {
  beforeEach(() => localStorage.clear())

  it('uses the public website backend on a fresh device without writing archive or session settings', () => {
    localStorage.setItem('botc-copilot-session-v1', 'existing-session-is-untouched')
    const before = JSON.stringify(localStorage)
    expect(readAIRuntimeSettings('https://botc.example.test/')).toEqual({ mode: 'http', baseUrl: 'https://botc.example.test', timeoutMs: 8000 })
    expect(readArchiveRuntimeSettings()).toEqual(defaultArchiveRuntimeSettings)
    expect(JSON.stringify(localStorage)).toBe(before)
  })

  it.each(['local', 'http'] as const)('keeps an existing %s archive selection without sending public AI to its backend', (mode) => {
    saveArchiveRuntimeSettings({ mode, baseUrl: 'https://archive.example.test', timeoutMs: 12000 })
    const before = localStorage.getItem(archiveRuntimeSettingsStorageKey)
    expect(readAIRuntimeSettings('https://botc.example.test/subpath')).toEqual({ mode: 'http', baseUrl: 'https://botc.example.test', timeoutMs: 12000 })
    expect(readArchiveRuntimeSettings()).toEqual({ mode, baseUrl: 'https://archive.example.test', timeoutMs: 12000 })
    expect(localStorage.getItem(archiveRuntimeSettingsStorageKey)).toBe(before)
  })

  it.each(['http://localhost:5173/', 'http://127.0.0.1:4197/', 'http://[::1]:5173/', 'file:///offline/index.html'])('retains local development/offline defaults for %s', (url) => {
    expect(readAIRuntimeSettings(url)).toEqual(defaultArchiveRuntimeSettings)
    const explicit = { mode: 'http' as const, baseUrl: 'http://127.0.0.1:8787', timeoutMs: 9000 }
    saveArchiveRuntimeSettings(explicit)
    expect(readAIRuntimeSettings(url)).toEqual(explicit)
    saveArchiveRuntimeSettings({ ...explicit, mode: 'local' })
    expect(readAIRuntimeSettings(url).mode).toBe('local')
  })

  it('still selects the public backend when old runtime storage is malformed', () => {
    localStorage.setItem(archiveRuntimeSettingsStorageKey, 'not-json')
    expect(readAIRuntimeSettings('https://botc.example.test')).toEqual({ mode: 'http', baseUrl: 'https://botc.example.test', timeoutMs: 8000 })
    expect(localStorage.getItem(archiveRuntimeSettingsStorageKey)).toBe('not-json')
  })
})
