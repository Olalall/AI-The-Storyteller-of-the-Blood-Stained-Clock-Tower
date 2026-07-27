import { beforeEach, describe, expect, it } from 'vitest'
import { catfishingRoleSnapshots } from '../../night-workbench/data/catfishing'
import {
  initialNightWorkbenchState,
  legacyNightWorkbenchStorageKey,
} from '../../night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { createPrototypeGameSession, gameSessionStorageKey } from '../data/createPrototypeSession'
import { loadGameSession } from './persistence'

describe('loadGameSession', () => {
  beforeEach(() => window.localStorage.clear())

  it('migrates a complete v5 night snapshot to the v1 session once', () => {
    const legacy = structuredClone(initialNightWorkbenchState)
    const originalId = 'legacy-cerenovus-1'
    const correctionId = 'legacy-cerenovus-2'
    legacy.queue = legacy.queue.map((item) => item.id === 'night-3-cerenovus'
      ? { ...item, progress: 'confirmed' }
      : item)
    legacy.confirmedRecords['night-3-cerenovus'] = [
      {
        id: originalId,
        wakeItemId: 'night-3-cerenovus',
        revision: 1,
        confirmedAt: '2026-07-13T00:03:00.000Z',
        snapshot: { ...emptyWakeDraft(), outcomeId: 'applied', storytellerResult: '原记录' },
      },
      {
        id: correctionId,
        wakeItemId: 'night-3-cerenovus',
        revision: 2,
        confirmedAt: '2026-07-13T00:04:00.000Z',
        correctionOf: originalId,
        snapshot: { ...emptyWakeDraft(), outcomeId: 'not_applied', storytellerResult: '更正记录' },
      },
    ]
    const cerenovus = catfishingRoleSnapshots.find((role) => role.id === 'cerenovus')!
    const pithag = catfishingRoleSnapshots.find((role) => role.id === 'pithag')!
    legacy.roleChangeEvents = [{
      id: 'legacy-role-change-1',
      seatId: 10,
      revision: 1,
      changedAt: '2026-07-13T00:05:00.000Z',
      nightRunId: legacy.nightRunId,
      originNightRunId: legacy.nightRunId,
      phaseLabel: legacy.nightLabel,
      fromRole: { ...cerenovus },
      toRole: { ...pithag },
      reason: 'gameplay',
      confirmedBy: 'storyteller',
    }]
    window.localStorage.setItem(legacyNightWorkbenchStorageKey, JSON.stringify(legacy))

    const session = loadGameSession()
    const migratedRecords = session.timeline.filter((entry) => entry.kind === 'night_action')
    const correction = migratedRecords.find((entry) => entry.id === correctionId)

    expect(session.activeNightRunId).toBe(legacy.nightRunId)
    expect(session.nightRuns[legacy.nightRunId].activeCursorId).toBe(legacy.activeCursorId)
    expect(correction).toMatchObject({ correctionOf: originalId, segmentId: 'night-3' })
    expect(session.timeline.find((entry) => entry.id === 'legacy-role-change-1')).toMatchObject({
      kind: 'setup_changed',
      baseSetupId: 'prototype-setup-confirmed-1',
      originNightRunId: legacy.nightRunId,
      effectiveFrom: 'future_workbenches',
    })
    expect(window.localStorage.getItem(gameSessionStorageKey)).not.toBeNull()
    expect(window.localStorage.getItem(legacyNightWorkbenchStorageKey)).toBeNull()
  })

  it('keeps a valid v1 session authoritative when a legacy key also exists', () => {
    const v1 = createPrototypeGameSession()
    const legacy = structuredClone(initialNightWorkbenchState)
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(v1))
    window.localStorage.setItem(legacyNightWorkbenchStorageKey, JSON.stringify(legacy))

    const loaded = loadGameSession()

    expect(loaded.id).toBe(v1.id)
    expect(window.localStorage.getItem(legacyNightWorkbenchStorageKey)).not.toBeNull()
  })

  it('normalizes an older v1 role change without a night source to a non-night projection', () => {
    const legacyV1 = JSON.parse(JSON.stringify(createPrototypeGameSession())) as Record<string, unknown>
    const timeline = legacyV1.timeline as Array<Record<string, unknown>>
    timeline.push({
      id: 'old-v1-role-change',
      kind: 'setup_changed',
      segmentId: null,
      createdAt: '2026-07-13T01:00:00.000Z',
      confirmedBy: 'storyteller',
      baseSetupId: 'prototype-setup-confirmed-1',
      seatId: 10,
      fromRole: catfishingRoleSnapshots.find((role) => role.id === 'cerenovus'),
      toRole: catfishingRoleSnapshots.find((role) => role.id === 'pithag'),
      reason: '旧版本记录',
      effectiveFrom: 'future_workbenches',
    })
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(legacyV1))

    const session = loadGameSession()

    expect(session.timeline.find((entry) => entry.id === 'old-v1-role-change')).toMatchObject({
      kind: 'setup_changed',
      originNightRunId: null,
    })
  })

  it('migrates the old local player name into a storyteller-only nickname', () => {
    const legacyV1 = JSON.parse(JSON.stringify(createPrototypeGameSession())) as {
      seats: Record<string, Record<string, unknown>>
    }
    legacyV1.seats['3'] = { ...legacyV1.seats['3'], name: '阿杰' }
    delete legacyV1.seats['3'].nickname
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(legacyV1))

    const session = loadGameSession()

    expect(session.seats[3].nickname).toBe('阿杰')
    expect(session.seats[3]).not.toHaveProperty('name')
  })

  it('normalizes older day labels that lag behind an existing night segment', () => {
    const legacyV1 = JSON.parse(JSON.stringify(createPrototypeGameSession())) as {
      phaseSegments: Array<{ id: string; kind: 'night' | 'day'; sequence: number; label: string; createdAt: string }>
    }
    legacyV1.phaseSegments.push({
      id: 'day-1',
      kind: 'day',
      sequence: 1,
      label: '第1天',
      createdAt: '2026-07-13T09:00:00.000Z',
    })
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(legacyV1))

    const session = loadGameSession()

    expect(session.phaseSegments.find((segment) => segment.id === 'day-1')).toMatchObject({
      sequence: 3,
      label: '第3天',
    })
  })

  it('does not delete an invalid legacy snapshot', () => {
    window.localStorage.setItem(legacyNightWorkbenchStorageKey, JSON.stringify({ nightRunId: 'broken' }))

    const loaded = loadGameSession()

    expect(loaded.id).toBe('prototype-catfishing-12')
    expect(window.localStorage.getItem(legacyNightWorkbenchStorageKey)).not.toBeNull()
  })
})
