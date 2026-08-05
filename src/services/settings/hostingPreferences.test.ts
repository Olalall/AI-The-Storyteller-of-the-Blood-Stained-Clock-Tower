import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  defaultHostingPreferences,
  hostingPreferencesStorageKey,
  normalizeHostingPreferences,
  readHostingPreferences,
  rememberHostingChoice,
  resetHostingPreferences,
  saveHostingPreferences,
} from './hostingPreferences'

describe('主持模式偏好', () => {
  beforeEach(() => window.localStorage.clear())

  it('defaults to the grimoire so a storyteller without a physical one is not stuck', () => {
    expect(defaultHostingPreferences.defaultHostingMode).toBe('grimoire')
    expect(defaultHostingPreferences.hasCompletedFirstRunChoice).toBe(false)
  })

  it('remembers the choice and that the question was asked', () => {
    rememberHostingChoice('record')

    const stored = readHostingPreferences()
    expect(stored.defaultHostingMode).toBe('record')
    expect(stored.hasCompletedFirstRunChoice).toBe(true)
  })

  it('falls back to the default rather than trusting a garbage value', () => {
    window.localStorage.setItem(hostingPreferencesStorageKey, JSON.stringify({ defaultHostingMode: 'wizard' }))
    expect(readHostingPreferences().defaultHostingMode).toBe('grimoire')
  })

  it('survives an unparseable preferences blob', () => {
    window.localStorage.setItem(hostingPreferencesStorageKey, 'not json')
    expect(readHostingPreferences()).toEqual(defaultHostingPreferences)
  })

  it('treats a missing first-run flag as not-yet-asked, never as asked', () => {
    // 反过来错的话，首次引导卡会被静默跳过，模式就替用户默认选了。
    expect(normalizeHostingPreferences({ defaultHostingMode: 'record' }).hasCompletedFirstRunChoice).toBe(false)
    expect(normalizeHostingPreferences({ hasCompletedFirstRunChoice: 'yes' }).hasCompletedFirstRunChoice).toBe(false)
  })

  it('does not block a game when storage refuses the write', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(() => saveHostingPreferences(defaultHostingPreferences)).not.toThrow()

    setItem.mockRestore()
  })

  it('clears back to the default on reset', () => {
    rememberHostingChoice('record')
    expect(resetHostingPreferences()).toEqual(defaultHostingPreferences)
    expect(window.localStorage.getItem(hostingPreferencesStorageKey)).toBeNull()
  })
})
