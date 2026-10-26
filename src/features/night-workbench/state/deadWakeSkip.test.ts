import { describe, expect, it } from 'vitest'
import { initialNightWorkbenchState } from '../data/initialNightWorkbenchState'
import { nightWorkbenchReducer } from './nightWorkbenchReducer'

describe('explicit dead wake skip', () => {
  it('keeps special death triggers reviewable and advances only after explicit not-applicable confirmation', () => {
    const state = structuredClone(initialNightWorkbenchState)
    const item = state.queue[0]
    state.activeCursorId = state.previewEntryId = item.id
    item.status.life = 'dead'
    item.progress = 'pending'
    item.applicability = 'needs_review'
    const accepted = nightWorkbenchReducer(state, { type: 'resolve-applicability', value: 'not_applicable', advance: true, at: '2026-10-21T01:00:00Z' })
    expect(accepted.queue[0]).toMatchObject({ progress: 'not_applicable', applicability: 'not_applicable' })
    expect(accepted.activeCursorId).not.toBe(item.id)
    expect(accepted.drafts).toEqual(state.drafts)
    expect(accepted.confirmedRecords).toEqual(state.confirmedRecords)
    const special = nightWorkbenchReducer(state, { type: 'resolve-applicability', value: 'applicable', advance: true, at: '2026-10-21T01:00:00Z' })
    expect(special.activeCursorId).toBe(item.id)
    expect(special.queue[0].applicability).toBe('applicable')
    expect(state.queue[0].applicability).toBe('needs_review')
  })
})
