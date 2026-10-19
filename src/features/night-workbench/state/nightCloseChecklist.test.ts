import { describe, expect, it } from 'vitest'
import { initialNightWorkbenchState } from '../data/initialNightWorkbenchState'
import { nightWorkbenchReducer } from './nightWorkbenchReducer'
import { canEditItem } from './workbenchGuards'

describe('night close checklist', () => {
  it('preserves cursor, drafts and records on explicit skip, and allows resuming', () => {
    const state = structuredClone(initialNightWorkbenchState)
    const item = state.queue.find((entry) => !['confirmed', 'not_applicable'].includes(entry.progress))!
    const action = { type: 'skip-item' as const, id: item.id, reason: '说书人确认本夜无需唤醒' }
    expect(nightWorkbenchReducer(state, { ...action, reason: '' })).toBe(state)
    const skipped = nightWorkbenchReducer(state, action)
    expect(skipped.activeCursorId).toBe(state.activeCursorId)
    expect(skipped.confirmedRecords).toEqual(state.confirmedRecords)
    expect(skipped.drafts).toEqual(state.drafts)
    const skippedItem = skipped.queue.find((entry) => entry.id === item.id)!
    expect(skippedItem.progress).toBe('skipped')
    expect(canEditItem(skipped, skippedItem)).toBe(false)
    const resumed = nightWorkbenchReducer({ ...skipped, activeCursorId: item.id, previewEntryId: item.id }, { type: 'resume' })
    expect(resumed.queue.find((entry) => entry.id === item.id)?.progress).not.toBe('skipped')
    const confirmed = state.queue.find((entry) => entry.progress === 'confirmed')!
    expect(nightWorkbenchReducer(state, { ...action, id: confirmed.id })).toBe(state)
  })
})
