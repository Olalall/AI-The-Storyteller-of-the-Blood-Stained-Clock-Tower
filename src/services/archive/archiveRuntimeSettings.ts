import { createHttpArchiveAdapter } from './httpArchiveAdapter'
import { resetAsyncArchiveAdapter, setAsyncArchiveAdapter } from './archiveService'

export type ArchiveRuntimeMode = 'local' | 'http'

export interface ArchiveRuntimeSettings {
  mode: ArchiveRuntimeMode
  baseUrl: string
  timeoutMs: number
}

export const archiveRuntimeSettingsStorageKey = 'botc-copilot-archive-runtime-settings-v1'

export const defaultArchiveRuntimeSettings: ArchiveRuntimeSettings = {
  mode: 'local',
  baseUrl: 'http://127.0.0.1:8787',
  timeoutMs: 8000,
}

function isArchiveRuntimeMode(value: unknown): value is ArchiveRuntimeMode {
  return value === 'local' || value === 'http'
}

function clampTimeout(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return defaultArchiveRuntimeSettings.timeoutMs
  return Math.min(180000, Math.max(2000, Math.round(numeric)))
}

export function normalizeArchiveRuntimeSettings(value: unknown): ArchiveRuntimeSettings {
  if (!value || typeof value !== 'object') return defaultArchiveRuntimeSettings
  const candidate = value as Partial<ArchiveRuntimeSettings>
  return {
    mode: isArchiveRuntimeMode(candidate.mode) ? candidate.mode : defaultArchiveRuntimeSettings.mode,
    baseUrl: typeof candidate.baseUrl === 'string' && candidate.baseUrl.trim()
      ? candidate.baseUrl.trim()
      : defaultArchiveRuntimeSettings.baseUrl,
    timeoutMs: clampTimeout(candidate.timeoutMs),
  }
}

export function readArchiveRuntimeSettings(): ArchiveRuntimeSettings {
  try {
    const stored = window.localStorage.getItem(archiveRuntimeSettingsStorageKey)
    return stored ? normalizeArchiveRuntimeSettings(JSON.parse(stored)) : defaultArchiveRuntimeSettings
  } catch {
    return defaultArchiveRuntimeSettings
  }
}

export function saveArchiveRuntimeSettings(settings: ArchiveRuntimeSettings) {
  window.localStorage.setItem(
    archiveRuntimeSettingsStorageKey,
    JSON.stringify(normalizeArchiveRuntimeSettings(settings)),
  )
}

export function resetArchiveRuntimeSettings() {
  window.localStorage.removeItem(archiveRuntimeSettingsStorageKey)
  resetAsyncArchiveAdapter()
  return defaultArchiveRuntimeSettings
}

function createTimeoutFetcher(timeoutMs: number) {
  return async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      window.clearTimeout(timeoutId)
    }
  }
}

export function applyArchiveRuntimeSettings(settings = readArchiveRuntimeSettings()) {
  const normalized = normalizeArchiveRuntimeSettings(settings)
  if (normalized.mode === 'http') {
    setAsyncArchiveAdapter(createHttpArchiveAdapter({
      baseUrl: normalized.baseUrl,
      fetcher: createTimeoutFetcher(normalized.timeoutMs),
    }))
  } else {
    resetAsyncArchiveAdapter()
  }
  return normalized
}
