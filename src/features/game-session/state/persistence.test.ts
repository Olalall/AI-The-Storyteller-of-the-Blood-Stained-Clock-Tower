import { beforeEach, describe, expect, it } from 'vitest'
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

    // 首次落地已改为空对局（入口界面），不再回退到开发夹具。
    expect(loaded.playerCount).toBe(0)
    expect(loaded.phaseSegments).toEqual([])
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
    const recovery = readSessionRecovery()
    expect(recovery?.reason).toBe('parse-error')
    expect(recovery?.raw).toBe('{"id":"half-written"')
  })

  it('backs up a structurally invalid session instead of silently discarding it', () => {
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify({ schemaVersion: 1, id: 'no-timeline' }))

    const outcome = loadGameSessionOutcome()

    expect(outcome.kind).toBe('unreadable')
    const recovery = readSessionRecovery()
    expect(recovery?.reason).toBe('invalid')
    expect(JSON.parse(recovery!.raw)).toMatchObject({ id: 'no-timeline' })
  })

  it('survives the overwrite that follows a failed load', () => {
    const original = '{"id":"precious","timeline":[broken'
    window.localStorage.setItem(gameSessionStorageKey, original)

    const outcome = loadGameSessionOutcome()
    // 复现真实时序：useGameSession 会立刻把回退用的新对局写回主键。
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

describe('首次落地', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts from a blank session instead of the development fixture', () => {
    // 开发夹具是 12 人瓦釜雷鸣、冻结在第3夜、预填记录；
    // 把它当默认落地页会让新用户以为工具里已经有一局在进行。
    const outcome = loadGameSessionOutcome()

    expect(outcome.kind).toBe('fresh')
    expect(outcome.session.playerCount).toBe(0)
    expect(outcome.session.phaseSegments).toEqual([])
    expect(outcome.session.timeline).toEqual([])
  })

  it('falls back to a blank session — not the fixture — when a stored game cannot be read', () => {
    window.localStorage.setItem(gameSessionStorageKey, 'not json')

    const outcome = loadGameSessionOutcome()

    expect(outcome.kind).toBe('unreadable')
    expect(outcome.session.playerCount).toBe(0)
  })
})
