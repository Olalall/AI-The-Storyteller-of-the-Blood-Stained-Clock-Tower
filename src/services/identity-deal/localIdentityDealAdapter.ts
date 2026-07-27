import type { IdentityDealReceipts } from './types'

const storagePrefix = 'botc-identity-deal-receipts-v1:'

export function identityDealReceiptsStorageKey(sessionId: string) {
  return `${storagePrefix}${sessionId}`
}

function parseIdentityDealReceipts(value: unknown): IdentityDealReceipts {
  if (!value || typeof value !== 'object') return {}

  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, string] => Number.isInteger(Number(entry[0])) && typeof entry[1] === 'string')
    .map(([seatId, receivedAt]) => [Number(seatId), receivedAt]))
}

export const localIdentityDealAdapter = {
  load(sessionId: string): IdentityDealReceipts {
    try {
      const raw = window.localStorage.getItem(identityDealReceiptsStorageKey(sessionId))
      return raw ? parseIdentityDealReceipts(JSON.parse(raw)) : {}
    } catch {
      return {}
    }
  },

  save(sessionId: string, receipts: IdentityDealReceipts) {
    window.localStorage.setItem(identityDealReceiptsStorageKey(sessionId), JSON.stringify(receipts))
  },

  clear(sessionId: string) {
    window.localStorage.removeItem(identityDealReceiptsStorageKey(sessionId))
  },
}
