import { describe, expect, it } from 'vitest'
import { createGameArchiveRecord } from '../archive'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { initialNightWorkbenchState } from '../../features/night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { catfishingPrototypeSeatProfiles } from '../../features/setup'
import { createGameReviewDraft, createNightResultAdvice, generateSetupCandidates } from './index'

describe('ai service prototype adapter', () => {
  it('generates setup candidates as drafts, not confirmed state changes', () => {
    const candidates = generateSetupCandidates({ scriptId: 'catfishing', seatProfiles: catfishingPrototypeSeatProfiles })

    expect(candidates).toHaveLength(3)
    expect(candidates.every((candidate) => candidate.source === 'prototype')).toBe(true)
    expect(candidates[0].assignments).toHaveLength(12)
    expect(candidates[0].demonBluffs).toHaveLength(3)
  })

  it('uses imported smart script packs for non-Catfishing setup candidates', () => {
    const candidates = generateSetupCandidates({ scriptId: 'trouble-brewing', seatProfiles: catfishingPrototypeSeatProfiles })

    expect(candidates).toHaveLength(3)
    expect(candidates.every((candidate) => candidate.scriptId === 'trouble-brewing')).toBe(true)
    expect(candidates[0].assignments.some((assignment) => assignment.role.id === 'imp')).toBe(true)
  })

  it('creates night result advice without mutating the draft or queue', () => {
    const item = initialNightWorkbenchState.queue.find((entry) => entry.id === 'night-3-cerenovus')!
    const draft = { ...emptyWakeDraft(), targets: [4], roleChoice: 'madness' }

    const advice = createNightResultAdvice({ state: initialNightWorkbenchState, item, draft })

    expect(advice).toMatchObject({
      kind: 'result',
      status: 'answer',
      recommendedOutcomeId: 'applied',
      nightRunId: initialNightWorkbenchState.nightRunId,
      wakeItemId: item.id,
    })
    expect(draft.outcomeId).toBe('')
    expect(item.progress).toBe('pending')
  })

  it('creates a review draft from archived logs without changing the archive', () => {
    const archive = createGameArchiveRecord({
      session: createPrototypeGameSession(),
      winner: 'good',
      archiveId: 'review-test',
      archivedAt: '2026-07-17T00:00:00.000Z',
    })

    const review = createGameReviewDraft(archive)

    expect(review.playerScores).toHaveLength(archive.playerCount)
    expect(review.topPlayers.length).toBeLessThanOrEqual(4)
    expect(review.evaluation.density).toBeTruthy()
    expect(review.fullReview.summary).toContain('本局共有')
    expect(review.fullReview.suggestedReplayOrder).toContain('夜间行动')
    expect(review.playerScores[0]).toHaveProperty('keyEvents')
    expect(archive.id).toBe('review-test')
  })

  it('keeps every AI output detached from authoritative session state', () => {
    const session = createPrototypeGameSession()
    const sessionBefore = JSON.stringify(session)

    const candidates = generateSetupCandidates({ scriptId: 'catfishing', seatProfiles: catfishingPrototypeSeatProfiles })
    const item = initialNightWorkbenchState.queue.find((entry) => entry.id === 'night-3-gambler')!
    const draft = { ...emptyWakeDraft(), targets: [4], roleChoice: 'balloonist', outcomeId: 'missed' }
    const advice = createNightResultAdvice({ state: initialNightWorkbenchState, item, draft })
    const archive = createGameArchiveRecord({
      session,
      winner: 'evil',
      archiveId: 'ai-boundary-test',
      archivedAt: '2026-07-17T00:00:00.000Z',
    })
    const archiveBefore = JSON.stringify(archive)
    const review = createGameReviewDraft(archive)

    expect(JSON.stringify(session)).toBe(sessionBefore)
    expect(JSON.stringify(archive)).toBe(archiveBefore)
    expect(candidates.some((candidate) => 'confirmedAt' in candidate)).toBe(false)
    expect(advice && 'confirmedBy' in advice).toBe(false)
    expect('session' in review).toBe(false)
  })
})
