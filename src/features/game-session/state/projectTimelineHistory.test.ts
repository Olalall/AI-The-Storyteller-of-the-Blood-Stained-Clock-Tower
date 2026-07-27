import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import type { DayActionEntry, NightActionEntry, VoteRoundEntry } from '../types'
import {
  filterTimelineHistory,
  projectEffectiveTimelineEntries,
  projectTimelineHistory,
} from './projectTimelineHistory'

describe('timeline history projection', () => {
  it('keeps the audit chain while current projections use only the newest correction', () => {
    const session = createPrototypeGameSession()
    const original = session.timeline.find((entry): entry is NightActionEntry => entry.kind === 'night_action')
    if (!original) throw new Error('fixture is incomplete')
    const correction: NightActionEntry = {
      ...original,
      id: 'history-night-correction',
      createdAt: '2026-07-14T09:10:00.000Z',
      correctionOf: original.id,
      correctionReason: '目标手势看错',
      summary: '更正后的夜间结果',
      record: {
        revision: original.record.revision + 1,
        snapshot: { ...original.record.snapshot, targets: [6], storytellerResult: '更正后的夜间结果' },
      },
    }

    const history = projectTimelineHistory({ ...session, timeline: [...session.timeline, correction] })
    const originalHistory = history.find((entry) => entry.id === original.id)
    const correctionHistory = history.find((entry) => entry.id === correction.id)

    expect(originalHistory).toMatchObject({ isSuperseded: true, canCorrect: false })
    expect(correctionHistory).toMatchObject({ isCorrection: true, isSuperseded: false, canCorrect: true })
    expect(correctionHistory?.details).toContain('更正原因：目标手势看错')
    expect(projectEffectiveTimelineEntries([...session.timeline, correction]).some((entry) => entry.id === original.id)).toBe(false)
    expect(projectEffectiveTimelineEntries([...session.timeline, correction]).some((entry) => entry.id === correction.id)).toBe(true)
  })

  it('filters by structural player links instead of matching numbers in free text', () => {
    const session = createPrototypeGameSession()
    const dayAction: DayActionEntry = {
      id: 'day-action-history',
      kind: 'day_action',
      segmentId: 'day-1',
      createdAt: '2026-07-14T10:00:00.000Z',
      confirmedBy: 'storyteller',
      category: 'skill',
      actorSeatId: 3,
      targetSeatIds: [6],
      summary: '3号发动白天技能 → 6号',
      details: [],
    }
    const history = projectTimelineHistory({
      ...session,
      phaseSegments: [...session.phaseSegments, { id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: dayAction.createdAt }],
      timeline: [...session.timeline, dayAction],
    })

    const forSeatSix = filterTimelineHistory(history, { phaseKey: 'all', seatId: 6, category: 'all' })
    const forSeatSeven = filterTimelineHistory(history, { phaseKey: 'all', seatId: 7, category: 'day_skill' })

    expect(forSeatSix.some((entry) => entry.id === dayAction.id)).toBe(true)
    expect(forSeatSeven.some((entry) => entry.id === dayAction.id)).toBe(false)
  })

  it('uses the recorded day-skill identity snapshots instead of a later role projection', () => {
    const session = createPrototypeGameSession()
    const roleById = new Map(session.scriptRoles?.map((role) => [role.id, role]))
    const gambler = roleById.get('gambler')!
    const investigator = roleById.get('investigator')!
    const snakecharmer = roleById.get('snakecharmer')!
    const pithag = roleById.get('pithag')!
    const dayAction: DayActionEntry = {
      id: 'day-action-with-context',
      kind: 'day_action',
      segmentId: 'day-1',
      createdAt: '2026-07-14T10:00:00.000Z',
      confirmedBy: 'storyteller',
      category: 'skill',
      actorSeatId: 6,
      targetSeatIds: [5],
      skillContext: {
        abilityRole: { ...gambler },
        actor: { seatId: 6, actualRole: { ...gambler } },
        claimedRole: { ...investigator },
        targets: [{ seatId: 5, actualRole: { ...snakecharmer } }],
        outcome: { kind: 'no_effect' },
      },
      summary: '旧摘要不应参与当前投影',
      details: [],
    }
    const laterRoleChange = {
      id: 'later-role-change',
      kind: 'setup_changed' as const,
      segmentId: null,
      createdAt: '2026-07-14T11:00:00.000Z',
      confirmedBy: 'storyteller' as const,
      baseSetupId: 'prototype-setup-confirmed-1',
      originNightRunId: null,
      seatId: 6,
      fromRole: { ...gambler },
      toRole: { ...pithag },
      reason: '后续角色调整',
      effectiveFrom: 'future_workbenches' as const,
    }
    const history = projectTimelineHistory({
      ...session,
      phaseSegments: [...session.phaseSegments, { id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: dayAction.createdAt }],
      timeline: [...session.timeline, dayAction, laterRoleChange],
    })
    const entry = history.find((item) => item.id === dayAction.id)

    expect(entry).toMatchObject({
      summary: '赌徒 · 6号（赌徒）称调查员 → 5号（舞蛇人） · 无事发生',
      details: [
        '按此技能结算：赌徒',
        '发动者（实际）：6号（赌徒）',
        '公开声称：调查员',
        '目标（实际）：5号（舞蛇人）',
        '结果：无事发生',
      ],
    })
    expect(entry?.summary).not.toContain('麻脸巫婆')
  })

  it('marks vote records as read-only even when they are associated with the selected player', () => {
    const session = createPrototypeGameSession()
    const vote: VoteRoundEntry = {
      id: 'history-vote',
      kind: 'vote_round',
      segmentId: 'day-1',
      createdAt: '2026-07-14T11:00:00.000Z',
      confirmedBy: 'storyteller',
      roundId: 'round-1',
      nominatorSeatId: 1,
      nomineeSeatId: 4,
      threshold: 6,
      raisedSeatIds: [1, 2, 3, 4, 5, 6],
      ghostVoteSeatIds: [],
    }
    const history = projectTimelineHistory({
      ...session,
      phaseSegments: [...session.phaseSegments, { id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: vote.createdAt }],
      timeline: [...session.timeline, vote],
    })
    const entry = history.find((item) => item.id === vote.id)

    expect(entry).toMatchObject({
      canCorrect: false,
      correctionHelp: '票型影响暂列结果；从白天工作台重新记录。',
    })
  })
})
