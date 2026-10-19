import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom 不提供 IndexedDB。组件测试只替代浏览器租约，真实跨页事务由 Playwright 验证。
vi.mock('../services/session/sessionEditLock', async (importOriginal) => {
  const original = await importOriginal<typeof import('../services/session/sessionEditLock')>()
  const { persistGameSession, sessionRecoveryStorageKey } = await import('../services/session/localSessionAdapter')
  return { ...original, SessionEditLock: class {
    async acquire() { return true }
    async save(session: Parameters<typeof persistGameSession>[0], before?: Parameters<typeof persistGameSession>[0], recovery?: import('../services/session/localSessionAdapter').SessionRecoveryRecord) {
      if (recovery) localStorage.setItem(sessionRecoveryStorageKey, JSON.stringify(recovery))
      if (before) localStorage.setItem(original.beforeRestoreStorageKey, JSON.stringify(before))
      persistGameSession(session)
    }
    async release() {}
  } }
})

afterEach(() => cleanup())

// Existing synchronous domain fixtures explicitly need the full catalog. Production boot does not.
const { loadAllSmartScriptPacks } = await import('../domain/scripts/loadedCatalog')
await loadAllSmartScriptPacks()
