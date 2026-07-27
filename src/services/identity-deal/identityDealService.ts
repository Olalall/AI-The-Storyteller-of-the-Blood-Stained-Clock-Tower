import { localIdentityDealAdapter } from './localIdentityDealAdapter'
import type { IdentityDealReceipts } from './types'

export function loadIdentityDealReceipts(sessionId: string): IdentityDealReceipts {
  return localIdentityDealAdapter.load(sessionId)
}

export function saveIdentityDealReceipts(sessionId: string, receipts: IdentityDealReceipts) {
  localIdentityDealAdapter.save(sessionId, receipts)
}

export function clearIdentityDealReceipts(sessionId: string) {
  localIdentityDealAdapter.clear(sessionId)
}
