import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'

function openDay(session = createPrototypeGameSession()) {
  return gameSessionReducer(session, {
    type: 'open-phase-segment',
    phaseKind: 'day',
    createdAt: '2026-08-04T09:00:00.000Z',
  })
}

function openDayId(session: ReturnType<typeof createPrototypeGameSession>) {
  const day = session.phaseSegments.find((segment) => segment.kind === 'day' && !segment.closedAt)
  if (!day) throw new Error('day fixture was not created')
  return day.id
}

function changeState(
  session: ReturnType<typeof createPrototypeGameSession>,
  after: Record<string, unknown>,
  entryId = 'state-1',
) {
  const before = projectCurrentPlayerStates(session)[1]
  return gameSessionReducer(session, {
    type: 'confirm-player-state-change',
    seatId: 1,
    expectedBefore: before,
    after: { ...before, ...after } as typeof before,
    segmentId: openDayId(session),
    entryId,
    confirmedAt: '2026-08-04T09:01:00.000Z',
    reason: '说书人确认',
  })
}

describe('confirmPlayerStateChange 的状态判等与克隆', () => {
  it('records a change to a field outside the legacy comparison set', () => {
    const session = openDay()
    // 判等若只覆盖 life/poisoned/drunk 与 marker 的 id+label，这类变更会被判为「没变化」而静默拒绝。
    const next = changeState(session, { markers: [{ id: 'm1', label: '保护', active: false }] })

    expect(next).not.toBe(session)
    expect(next.timeline.some((entry) => entry.id === 'state-1')).toBe(true)
  })

  it('still rejects a genuinely identical state', () => {
    const session = openDay()
    const before = projectCurrentPlayerStates(session)[1]

    expect(changeState(session, { ...before })).toBe(session)
  })

  it('treats an absent optional field and an explicit undefined as identical', () => {
    const session = openDay()

    expect(changeState(session, { someOptionalField: undefined })).toBe(session)
  })

  it('detects a nested change inside a marker', () => {
    // 刻意使用尚未加入 ManualStatusMarker 的字段：这条测试要守的正是「将来扩字段时判等不会漏」。
    const withMarker = changeState(openDay(), { markers: [{ id: 'm1', label: '保护', note: 'A' }] })
    const before = projectCurrentPlayerStates(withMarker)[1]
    const next = gameSessionReducer(withMarker, {
      type: 'confirm-player-state-change',
      seatId: 1,
      expectedBefore: before,
      after: { ...before, markers: [{ id: 'm1', label: '保护', note: 'B' }] } as unknown as typeof before,
      segmentId: openDayId(withMarker),
      entryId: 'state-2',
      confirmedAt: '2026-08-04T09:02:00.000Z',
      reason: '说书人更正',
    })

    expect(next.timeline.some((entry) => entry.id === 'state-2')).toBe(true)
  })

  it('deep clones the recorded before/after so later mutations cannot rewrite history', () => {
    const session = openDay()
    const mutableAfter = { ...projectCurrentPlayerStates(session)[1], markers: [{ id: 'm1', label: '保护' }] }
    const next = gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId: 1,
      expectedBefore: projectCurrentPlayerStates(session)[1],
      after: mutableAfter,
      segmentId: openDayId(session),
      entryId: 'state-3',
      confirmedAt: '2026-08-04T09:03:00.000Z',
      reason: '说书人确认',
    })

    mutableAfter.markers[0].label = '被篡改'

    const recorded = next.timeline.find((entry) => entry.id === 'state-3')
    expect(recorded && 'after' in recorded ? recorded.after.markers[0].label : null).toBe('保护')
  })
})
