import { describe, expect, it } from 'vitest'
import type { SetupDraft } from '../game-session/types'
import { draftForActiveScript } from './setupSession'

const oldDraft = { candidateId: 'old-board' } as SetupDraft
const newDraft = { candidateId: 'new-board' } as SetupDraft

describe('draftForActiveScript', () => {
  it('does not reuse a draft after the storyteller switches to another board', () => {
    expect(draftForActiveScript('new-script', 'old-script', 'old-script', oldDraft, oldDraft, null)).toBeNull()
  })

  it('uses only the local draft created for the active board', () => {
    expect(draftForActiveScript('new-script', 'old-script', 'new-script', newDraft, oldDraft, null)).toBe(newDraft)
  })
})
