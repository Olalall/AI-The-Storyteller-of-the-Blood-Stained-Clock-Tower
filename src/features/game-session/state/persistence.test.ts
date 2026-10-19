import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { catfishingRoleSnapshots } from '../../night-workbench/data/catfishing'
import {
  initialNightWorkbenchState,
  legacyNightWorkbenchStorageKey,
} from '../../night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { createPrototypeGameSession, gameSessionStorageKey } from '../data/createPrototypeSession'
import { loadGameSession } from './persistence'
import { clearSessionRecovery, loadGameSessionOutcome, readSessionRecovery } from '../../../services/session'

describe('loadGameSession', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('returns the exact bytes parsed as its baseline before applying legacy normalization', () => {
    const legacy = { ...createPrototypeGameSession(), dayActionDraft: undefined }
    const raw = JSON.stringify(legacy, null, 2)
    localStorage.setItem(gameSessionStorageKey, raw)
    const outcome = loadGameSessionOutcome()
    expect(outcome.kind).toBe('restored')
    expect(outcome.baseline).toBe(raw)
    expect(outcome.session.dayActionDraft).toBeNull()
    expect(JSON.stringify(outcome.session)).not.toBe(raw)
    expect(localStorage.getItem(gameSessionStorageKey)).toBe(raw)
  })

  it('does not pair the parsed old session with a newer save written immediately after the read', () => {
    const original = createPrototypeGameSession()
    const raw = JSON.stringify(original)
    const newer = JSON.stringify({ ...original, id: 'other-tab-newer-session' })
    localStorage.setItem(gameSessionStorageKey, raw)
    const getItem = Storage.prototype.getItem
    let replaced = false
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key) {
      const value = getItem.call(this, key)
      if (key === gameSessionStorageKey && !replaced) {
        replaced = true
        localStorage.setItem(gameSessionStorageKey, newer)
      }
      return value
    })
    const outcome = loadGameSessionOutcome()
    expect(outcome.session.id).toBe(original.id)
    expect(outcome.baseline).toBe(raw)
    expect(localStorage.getItem(gameSessionStorageKey)).toBe(newer)
  })

  it.each([null, ''])('keeps an empty-storage baseline of %s without creating a current save', (raw) => {
    if (raw !== null) localStorage.setItem(gameSessionStorageKey, raw)
    const outcome = loadGameSessionOutcome()
    expect(outcome.kind).toBe('fresh')
    expect(outcome.baseline).toBe(raw)
    expect(localStorage.getItem(gameSessionStorageKey)).toBe(raw)
  })

  it('does not adopt an unknown current save as baseline after a failed read', () => {
    const raw = JSON.stringify(createPrototypeGameSession())
    localStorage.setItem(gameSessionStorageKey, raw)
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => { throw new DOMException('Denied', 'SecurityError') })
    const outcome = loadGameSessionOutcome()
    getItem.mockRestore()
    expect(outcome.kind).toBe('fresh')
    expect(outcome.baseline).toBeNull()
    expect(localStorage.getItem(gameSessionStorageKey)).toBe(raw)
  })

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

    const outcome = loadGameSessionOutcome()
    const session = outcome.session
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
    expect(outcome.kind).toBe('migrated')
    expect(outcome.baseline).toBe(window.localStorage.getItem(gameSessionStorageKey))
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

  it('keeps a session written by a newer schema version readable', () => {
    const session = { ...createPrototypeGameSession(), id: 'from-the-future', schemaVersion: 2 }
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(session))

    const outcome = loadGameSessionOutcome()

    expect(outcome.kind).toBe('restored')
    expect(outcome.session.id).toBe('from-the-future')
    expect(readSessionRecovery()).toBeNull()
  })

  it('keeps a session carrying unknown optional fields readable', () => {
    const session = { ...createPrototypeGameSession(), hostingMode: 'grimoire', someFutureField: { a: 1 } }
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(session))

    const outcome = loadGameSessionOutcome()

    expect(outcome.kind).toBe('restored')
    expect(readSessionRecovery()).toBeNull()
  })

  it('backs up an unparseable session instead of silently discarding it', () => {
    window.localStorage.setItem(gameSessionStorageKey, '{"id":"half-written"')

    const outcome = loadGameSessionOutcome()

    expect(outcome.kind).toBe('unreadable')
    expect(outcome.baseline).toBe('{"id":"half-written"')
    const recovery = readSessionRecovery()
    expect(recovery?.reason).toBe('parse-error')
    expect(recovery?.raw).toBe('{"id":"half-written"')
  })

  it('backs up a structurally invalid session instead of silently discarding it', () => {
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify({ schemaVersion: 1, id: 'no-timeline' }))

    const outcome = loadGameSessionOutcome()

    expect(outcome.kind).toBe('unreadable')
    expect(outcome.baseline).toBe(JSON.stringify({ schemaVersion: 1, id: 'no-timeline' }))
    const recovery = readSessionRecovery()
    expect(recovery?.reason).toBe('invalid')
    expect(JSON.parse(recovery!.raw)).toMatchObject({ id: 'no-timeline' })
  })

  it('survives the overwrite that follows a failed load', () => {
    const original = '{"id":"precious","timeline":[broken'
    window.localStorage.setItem(gameSessionStorageKey, original)

    const outcome = loadGameSessionOutcome()
    // 模拟已留档后显式新建；恢复副本不能随主键替换而消失。
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(outcome.session))

    expect(readSessionRecovery()?.raw).toBe(original)
  })

  it('clears the recovery record on request', () => {
    window.localStorage.setItem(gameSessionStorageKey, 'not json at all')
    loadGameSessionOutcome()
    expect(readSessionRecovery()).not.toBeNull()

    clearSessionRecovery()

    expect(readSessionRecovery()).toBeNull()
  })
})
