import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession, createSmartScriptSetupSession } from '../data/createPrototypeSession'
import type { DayActionEntry, GameSessionState, NightActionEntry, NightRunState } from '../types'
import { applyOutcome, emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { outcomeReady } from '../../night-workbench/state/projectWakeDraft'
import type { WakeItem } from '../../night-workbench/types'
import type { NightWorkbenchState } from '../../night-workbench/types'
import { nightWorkbenchReducer, type NightWorkbenchIntent } from '../../night-workbench/state/nightWorkbenchReducer'
import { sessionInitialNightState } from '../../night-workbench/state/gameSessionAdapter'
import { canConfirmDraft } from '../../night-workbench/state/workbenchGuards'
import { applyWakeHistoricalContext, refreshNightRunHistoricalContext } from './nightHistoricalContext'
import { appendCorrection } from './timeline'
import { roleSnapshotsForScript } from '../../../domain/scripts'
import { gameSessionReducer } from './sessionReducer'
import { projectCurrentPlayerStates } from './projectors'

const AT = '2026-08-07T00:00:00.000Z'

function item(roleId: 'exorcist' | 'devilsadvocate'): WakeItem {
  return {
    id: `night-3-${roleId}-2`, orderIndex: 1, seatId: 2, playerLabel: '2号 玩家2',
    roleId, roleName: roleId === 'exorcist' ? '驱魔人' : '魔鬼代言人', roleInitial: '测', iconPath: '',
    ability: '每晚选择一名与上夜不同的玩家。', storytellerPrompt: '选择目标。',
    progress: 'pending', applicability: 'applicable', status: { life: 'alive', impairments: [], markers: [] },
    targetCount: 0, interactionVersion: 'test', outcomeOptions: [{
      id: 'record', label: '已记录', requiredInputs: [], resultTemplate: '{actor}本夜已记录。',
    }],
  }
}

function complexItem(roleId: 'balloonist' | 'moonchild' | 'professor' | 'pukka' | 'shabaloth' | 'yanluo' | 'po' | 'zombuul'): WakeItem {
  return {
    ...item('exorcist'), id: `night-complex-${roleId}-2`, roleId,
    roleName: ({ balloonist: '气球驾驶员', moonchild: '月之子', professor: '教授', pukka: '普卡', shabaloth: '沙巴洛斯', yanluo: '阎罗', po: '珀', zombuul: '僵怖' })[roleId],
    ability: '复杂跨夜技能。', targetCount: 0,
  }
}

function nightEntry(id: string, target: number, correctionOf?: string): NightActionEntry {
  return {
    id, kind: 'night_action', segmentId: 'night-2', createdAt: correctionOf ? '2026-08-07T00:02:00.000Z' : AT,
    confirmedBy: 'storyteller', correctionOf, correctionReason: correctionOf ? '目标记录错误' : undefined,
    nightRunId: 'night-2', wakeItemId: 'night-2-exorcist-2', actorSeatId: 2, roleId: 'exorcist',
    summary: `选择${target}号`, details: [], record: {
      revision: correctionOf ? 2 : 1,
      snapshot: { ...emptyWakeDraft(), targets: [target], playerChoice: `选择${target}号`, storytellerResult: `选择${target}号` },
    },
  }
}

function roleEntry(
  id: string,
  roleId: 'pukka' | 'shabaloth' | 'yanluo' | 'po',
  targets: number[],
  outcomeId: string,
  segmentId = 'night-2',
): NightActionEntry {
  return {
    ...nightEntry(id, targets[0] ?? 0), segmentId, roleId, wakeItemId: `${segmentId}-${roleId}-2`,
    record: { revision: 1, snapshot: { ...emptyWakeDraft(), targets, outcomeId, storytellerResult: '已确认' } },
  }
}

function balloonistEntry(registration: 'townsfolk' | 'outsider' | 'minion' | 'demon'): NightActionEntry {
  return {
    ...nightEntry('balloonist-previous', 4),
    roleId: 'balloonist',
    wakeItemId: 'night-2-balloonist-2',
    record: {
      revision: 1,
      snapshot: {
        ...emptyWakeDraft(),
        targets: [4],
        registration: { kind: 'role_type', seatId: 4, value: registration },
        outcomeId: 'record',
        storytellerResult: '已登记气球驾驶员信息',
      },
    },
  }
}

function moonchildDayEntry(
  outcomeKind: 'applied' | 'no_effect' | 'custom',
  targetSeatId: number,
  registration?: 'good' | 'evil',
): DayActionEntry {
  return {
    id: `moonchild-${outcomeKind}-${targetSeatId}`,
    kind: 'day_action',
    category: 'skill',
    segmentId: 'day-2',
    createdAt: AT,
    confirmedBy: 'storyteller',
    actorSeatId: 2,
    targetSeatIds: [targetSeatId],
    summary: '月之子白天选择记录',
    details: [],
    skillContext: {
      abilityRole: { id: 'moonchild', name: '月之子', initial: '月', iconPath: '' },
      actor: { seatId: 2, actualRole: { id: 'moonchild', name: '月之子', initial: '月', iconPath: '' } },
      claimedRole: null,
      targets: [{
        seatId: targetSeatId,
        actualRole: null,
        registration: registration ? { kind: 'alignment', seatId: targetSeatId, value: registration } : undefined,
      }],
      outcome: { kind: outcomeKind },
    },
  }
}

function sessionWithHistory(entries: NightActionEntry[]): GameSessionState {
  const session = createPrototypeGameSession()
  return {
    ...session,
    phaseSegments: [
      { id: 'night-2', kind: 'night', sequence: 2, label: '第2夜', createdAt: AT, closedAt: AT },
      { id: 'night-3', kind: 'night', sequence: 3, label: '第3夜', createdAt: AT },
    ],
    timeline: [...session.timeline.filter((entry) => entry.kind === 'setup_confirmed'), ...entries],
  }
}

function sessionWithDayHistory(entries: DayActionEntry[]): GameSessionState {
  const session = sessionWithHistory([])
  return {
    ...session,
    phaseSegments: [
      ...session.phaseSegments,
      { id: 'day-2', kind: 'day', sequence: 2, label: '第2天', createdAt: AT, closedAt: AT },
    ],
    timeline: [...session.timeline, ...entries],
  }
}

describe('跨夜目标投影', () => {
  it('does not demand a Moonchild day choice before any death trigger', () => {
    const session = sessionWithDayHistory([])
    const before = structuredClone(session)
    const projected = applyWakeHistoricalContext(session, complexItem('moonchild'), 3)
    expect(projected.historicalContext).toMatchObject({ kind: 'moonchild_choice', status: 'clear', seatIds: [] })
    expect(projected.history).toContain('无需白天选择')
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['no-death-candidate'])
    expect(session).toEqual(before)
  })

  it('still flags a dead Moonchild with a missing choice for manual review', () => {
    const wake = { ...complexItem('moonchild'), status: { life: 'dead' as const, impairments: [], markers: [] } }
    const projected = applyWakeHistoricalContext(sessionWithDayHistory([]), wake, 3)
    expect(projected.historicalContext?.status).toBe('missing')
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['manual-review'])
  })

  it('does not conceal a recorded Moonchild death trigger merely because the actor is alive again', () => {
    const session = sessionWithDayHistory([])
    const before = { life: 'alive' as const, poisoned: false, drunk: false, markers: [] }
    session.timeline.push({ id: 'moonchild-death', kind: 'player_state_changed', segmentId: 'day-2', createdAt: AT,
      confirmedBy: 'storyteller', seatId: 2, before, after: { ...before, life: 'dead' }, reason: '主持确认死亡' })
    expect(applyWakeHistoricalContext(session, complexItem('moonchild'), 3).historicalContext?.status).toBe('missing')
  })

  it('reprojects unused once-per-game hints without accumulating duplicate text', () => {
    const session = sessionWithHistory([])
    const once = applyWakeHistoricalContext(session, complexItem('professor'), 3)
    expect(applyWakeHistoricalContext(session, once, 3)).toEqual(once)
  })

  it('restores the real input contract after an earlier Professor use is corrected to no action', () => {
    const used = { ...nightEntry('professor-used-then-corrected', 4), roleId: 'professor',
      record: { revision: 1, snapshot: { ...emptyWakeDraft(), targets: [4], outcomeId: 'record', storytellerResult: '教授使用能力' } } }
    const session = sessionWithHistory([used])
    session.scriptId = 'bad-moon-rising'
    const restricted = applyWakeHistoricalContext(session, complexItem('professor'), 3)
    expect(restricted.outcomeOptions[0].id).toBe('already-used')
    const before = structuredClone(used)
    session.timeline.push({ ...used, id: 'professor-use-corrected', correctionOf: used.id,
      createdAt: '2026-08-07T00:02:00.000Z', record: { revision: 2, snapshot: { ...emptyWakeDraft(), outcomeId: 'skip', storytellerResult: '更正为未发动' } } })
    const restored = applyWakeHistoricalContext(session, restricted, 3)
    expect(restored).toMatchObject({ id: restricted.id, targetCount: 1, applicability: 'applicable' })
    expect(restored.previousTargets).toBeUndefined()
    expect(restored.aiAdviceEnabled).not.toBe(false)
    expect(restored.outcomeOptions.some((option) => option.id === 'record' && option.requiredInputs.includes('targets'))).toBe(true)
    expect(restored.outcomeOptions.some((option) => option.id === 'already-used')).toBe(false)
    expect(applyWakeHistoricalContext(session, restored, 3)).toEqual(restored)
    expect(session.timeline.find((entry) => entry.id === used.id)).toEqual(before)
  })

  it('forbids a healthy Balloonist from recording the same shown type as last night', () => {
    const projected = applyWakeHistoricalContext(sessionWithHistory([
      balloonistEntry('outsider'),
    ]), complexItem('balloonist'), 3)

    expect(projected.historicalContext).toMatchObject({ kind: 'balloonist_role_type', status: 'ready', seatIds: [4] })
    expect(projected.forbiddenRegistrationValues).toEqual(['outsider'])
    expect(canConfirmDraft({
      nightRunId: 'night-3', scriptId: 'catfishing', nightLabel: '第3夜', nightType: 'other', playerCount: 12,
      revision: 0, knowledgeVersion: 'test', queue: [projected], seatSnapshots: {}, activeCursorId: projected.id,
      previewEntryId: projected.id, drafts: {}, privacyShielded: false, dimmed: false, aiAdviceLog: {},
      correctionItemId: null, confirmedRecords: {}, roleChangeEvents: [], lastNotice: '',
    }, projected, {
      ...emptyWakeDraft(),
      targets: [6],
      registration: { kind: 'role_type', seatId: 6, value: 'outsider' },
      outcomeId: 'record',
      storytellerResult: 'recorded',
      outputSource: { kind: 'preset', templateId: 'record', specVersion: projected.interactionVersion },
    })).toBe(false)
  })

  it('keeps a Moonchild no-effect day record from becoming a night death candidate', () => {
    const session = sessionWithHistory([])
    session.phaseSegments.push({ id: 'day-2', kind: 'day', sequence: 2, label: '第2天', createdAt: AT, closedAt: AT })
    session.timeline.push(moonchildDayEntry('no_effect', 5, 'good'))

    const projected = applyWakeHistoricalContext(session, complexItem('moonchild'), 3)

    expect(projected.historicalContext).toMatchObject({ kind: 'moonchild_choice', status: 'clear', seatIds: [5] })
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['no-death-candidate'])
  })

  it('does not create a Moonchild death candidate when Moonchild is drunk or poisoned at night', () => {
    const moonchild = complexItem('moonchild')
    moonchild.status = { life: 'dead', impairments: ['drunk'], markers: [] }
    const projected = applyWakeHistoricalContext(sessionWithDayHistory([
      moonchildDayEntry('applied', 5, 'good'),
    ]), moonchild, 3)

    expect(projected.historicalContext).toMatchObject({ kind: 'moonchild_choice', status: 'clear', seatIds: [5] })
    expect(projected.history).toContain('本夜醉酒或中毒')
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['no-death-candidate'])
  })

  it('marks Zombuul as not applicable after an actual daytime death', () => {
    const session = sessionWithDayHistory([])
    session.timeline.push({
      id: 'no-execution-2', kind: 'no_execution', segmentId: 'day-2', createdAt: AT, confirmedBy: 'storyteller',
    })
    session.timeline.push({
      id: 'zombuul-day-death', kind: 'player_state_changed', seatId: 5, before: { life: 'alive', poisoned: false, drunk: false, markers: [] }, after: { life: 'dead', poisoned: false, drunk: false, markers: [] }, reason: '白天技能造成死亡', segmentId: 'day-2', createdAt: AT, confirmedBy: 'storyteller',
    })

    const projected = applyWakeHistoricalContext(session, complexItem('zombuul'), 3)

    expect(projected.historicalContext).toMatchObject({ kind: 'zombuul_day_death', status: 'clear' })
    expect(projected.applicability).toBe('not_applicable')
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['zombuul-no-action'])
  })

  it('allows Zombuul to act when the day explicitly ended without a death', () => {
    const session = sessionWithDayHistory([])
    session.timeline.push({
      id: 'no-execution-2', kind: 'no_execution', segmentId: 'day-2', createdAt: AT, confirmedBy: 'storyteller',
    })

    const projected = applyWakeHistoricalContext(session, complexItem('zombuul'), 3)

    expect(projected.historicalContext).toMatchObject({ kind: 'zombuul_day_death', status: 'ready' })
    expect(projected.targetCount).toBe(0)
    expect(projected.applicability).toBe('applicable')
  })

  it('treats night 2 as the Exorcist first action but requires history from night 3 onward', () => {
    const session = sessionWithHistory([])
    expect(applyWakeHistoricalContext(session, item('exorcist'), 2)).toMatchObject({
      targetCount: 1, previousTargetRequired: false, history: '首次行动：没有上一夜目标限制。',
    })
    expect(applyWakeHistoricalContext(session, item('exorcist'), 3)).toMatchObject({
      targetCount: 1, previousTargetRequired: true,
    })
  })

  it('uses only the effective correction and forbids that previous target', () => {
    const original = nightEntry('original', 4)
    const correction = nightEntry('correction', 5, original.id)
    const projected = applyWakeHistoricalContext(sessionWithHistory([original, correction]), item('exorcist'), 3)
    expect(projected.previousTargets).toEqual([5])
    expect(projected.forbiddenTargetSeatIds).toEqual([5])
    expect(projected.history).toContain('上一夜目标：5号')
  })

  it('inherits actor and role metadata for old and newly appended corrections', () => {
    const original = nightEntry('original', 4)
    const session = sessionWithHistory([original])
    const result = appendCorrection(session, original.id, {
      kind: 'night_action', nightRunId: original.nightRunId, wakeItemId: original.wakeItemId,
      summary: '选择5号', details: [], correctionReason: '目标记录错误',
      record: { revision: 2, snapshot: { ...original.record.snapshot, targets: [5] } },
    }, { id: 'correction', createdAt: '2026-08-07T00:02:00.000Z' })
    expect(result?.entry).toMatchObject({ actorSeatId: 2, roleId: 'exorcist' })
    expect(applyWakeHistoricalContext(result!.state, item('exorcist'), 3).previousTargets).toEqual([5])

    const legacyCorrection = { ...nightEntry('legacy-correction', 6, original.id), actorSeatId: undefined, roleId: undefined }
    expect(applyWakeHistoricalContext(sessionWithHistory([original, legacyCorrection]), item('exorcist'), 3).previousTargets).toEqual([6])
  })

  it('recovers old v1 night identity from the saved run queue', () => {
    const legacy = { ...nightEntry('legacy-without-identity', 4), actorSeatId: undefined, roleId: undefined }
    const session = sessionWithHistory([legacy])
    session.nightRuns[legacy.nightRunId] = {
      id: legacy.nightRunId, phaseSegmentId: legacy.segmentId, scriptId: session.scriptId, nightType: 'other',
      playerCount: session.playerCount, revision: 0, knowledgeVersion: session.knowledgeVersion,
      queue: [{ ...item('exorcist'), id: legacy.wakeItemId }],
      activeCursorId: legacy.wakeItemId, previewEntryId: legacy.wakeItemId,
      drafts: {}, privacyShielded: false, dimmed: false, aiAdviceLog: {}, correctionItemId: null, lastNotice: '',
    }

    expect(applyWakeHistoricalContext(session, item('exorcist'), 3).previousTargets).toEqual([4])
    const corrected = appendCorrection(session, legacy.id, {
      kind: 'night_action', nightRunId: legacy.nightRunId, wakeItemId: legacy.wakeItemId,
      summary: '选择5号', details: [], correctionReason: '旧记录缺少身份字段',
      record: { revision: 2, snapshot: { ...legacy.record.snapshot, targets: [5] } },
    }, { id: 'legacy-correction-from-queue', createdAt: '2026-08-07T00:03:00.000Z' })
    expect(corrected?.entry).toMatchObject({ actorSeatId: 2, roleId: 'exorcist' })
  })

  it('normalizes legacy role aliases when matching previous actions', () => {
    const previous = { ...nightEntry('original', 4), roleId: 'devils_advocate' }
    expect(applyWakeHistoricalContext(sessionWithHistory([previous]), item('devilsadvocate'), 3).previousTargets).toEqual([4])
  })

  it('does not inherit an earlier ability instance after the seat changed role', () => {
    const session = sessionWithHistory([nightEntry('original', 4)])
    const setup = session.timeline.find((entry) => entry.kind === 'setup_confirmed')
    const assignments = setup?.kind === 'setup_confirmed' ? setup.setup.draft.assignments : []
    const fromRole = assignments.find((assignment) => assignment.seatId === 2)!.role
    const toRole = assignments.find((assignment) => assignment.seatId !== 2)!.role
    session.timeline.push({
      id: 'role-change', kind: 'setup_changed', segmentId: null, createdAt: '2026-08-07T00:01:00.000Z',
      confirmedBy: 'storyteller', baseSetupId: setup!.setup.id, originNightRunId: null, seatId: 2,
      fromRole, toRole, reason: '角色变化', effectiveFrom: 'future_workbenches',
    })
    const projected = applyWakeHistoricalContext(session, item('exorcist'), 3)
    expect(projected.previousTargets).toBeUndefined()
    expect(projected.history).toContain('上一夜目标未记录')
  })

  it('refreshes an already-created run instead of keeping stale cached history', () => {
    const original = nightEntry('original', 4)
    const correction = nightEntry('correction', 5, original.id)
    const session = sessionWithHistory([original, correction])
    const run: NightRunState = {
      id: 'night-3', phaseSegmentId: 'night-3', scriptId: session.scriptId, nightType: 'other',
      playerCount: session.playerCount, revision: 0, knowledgeVersion: session.knowledgeVersion,
      queue: [{ ...item('exorcist'), previousTargets: [4], forbiddenTargetSeatIds: [4] }],
      activeCursorId: item('exorcist').id, previewEntryId: item('exorcist').id, drafts: {},
      privacyShielded: false, dimmed: false, aiAdviceLog: {}, correctionItemId: null, lastNotice: '',
    }
    expect(refreshNightRunHistoricalContext(session, run)[0]).toMatchObject({
      previousTargets: [5], forbiddenTargetSeatIds: [5],
    })
  })

  it('requires the immediately previous target for Devil\'s Advocate from night 2', () => {
    expect(applyWakeHistoricalContext(sessionWithHistory([]), item('devilsadvocate'), 2).previousTargetRequired).toBe(true)
  })

  it('rejects a repeated target even when the click comes from the grimoire ring', () => {
    const wake = applyWakeHistoricalContext(sessionWithHistory([nightEntry('original', 4)]), item('exorcist'), 3)
    const state: NightWorkbenchState = {
      nightRunId: 'night-3', scriptId: 'catfishing', nightLabel: '第3夜', nightType: 'other', playerCount: 12,
      revision: 0, knowledgeVersion: 'test', queue: [wake], seatSnapshots: {}, activeCursorId: wake.id,
      previewEntryId: wake.id, drafts: {}, privacyShielded: false, dimmed: false, aiAdviceLog: {},
      correctionItemId: null, confirmedRecords: {}, roleChangeEvents: [], lastNotice: '',
    }
    const next = nightWorkbenchReducer(state, { type: 'target', seatId: 4, at: AT })
    expect(next.drafts[wake.id]).toBeUndefined()
    expect(next.lastNotice).toContain('上一夜目标')

    const staleDraft = {
      ...emptyWakeDraft(), targets: [4], outcomeId: 'record', storytellerResult: '旧草稿',
      outputSource: { kind: 'preset' as const, templateId: 'record', specVersion: wake.interactionVersion },
    }
    expect(canConfirmDraft(state, wake, staleDraft)).toBe(false)
  })

  it('does not let a read-only confirmed preview write a target draft', () => {
    const wake = applyWakeHistoricalContext(sessionWithHistory([]), item('exorcist'), 2)
    const state: NightWorkbenchState = {
      nightRunId: 'night-2', scriptId: 'catfishing', nightLabel: '第2夜', nightType: 'other', playerCount: 12,
      revision: 0, knowledgeVersion: 'test', queue: [{ ...wake, progress: 'confirmed' }], seatSnapshots: {},
      activeCursorId: wake.id, previewEntryId: wake.id, drafts: {}, privacyShielded: false, dimmed: false,
      aiAdviceLog: {}, correctionItemId: null, confirmedRecords: {}, roleChangeEvents: [], lastNotice: '',
    }

    expect(nightWorkbenchReducer(state, { type: 'target', seatId: 4, at: AT })).toBe(state)
  })

  it('drops a stale draft when a history correction makes its target forbidden', () => {
    const original = nightEntry('original', 4)
    const correction = nightEntry('correction', 5, original.id)
    const session = sessionWithHistory([original, correction])
    const wake = item('exorcist')
    const staleWake = { ...wake, targetCount: 1, forbiddenTargetSeatIds: [4], previousTargets: [4] }
    session.activeNightRunId = 'night-3'
    session.nightRuns['night-3'] = {
      id: 'night-3', phaseSegmentId: 'night-3', scriptId: session.scriptId, nightType: 'other',
      playerCount: session.playerCount, revision: 0, knowledgeVersion: session.knowledgeVersion,
      queue: [staleWake], activeCursorId: wake.id, previewEntryId: wake.id,
      drafts: {
        [wake.id]: {
          ...emptyWakeDraft(), targets: [5], outcomeId: 'record', storytellerResult: '旧草稿',
          outputSource: { kind: 'preset', templateId: 'record', specVersion: wake.interactionVersion },
        },
      },
      privacyShielded: false, dimmed: false, aiAdviceLog: {}, correctionItemId: null, lastNotice: '',
    }

    expect(sessionInitialNightState({ session, dispatchSession: () => undefined })!.drafts[wake.id]).toMatchObject({ targets: [5], outcomeId: '', storytellerResult: '' })
  })


  it('tracks only explicitly confirmed Pukka poison state and preserves it across a failed new poison', () => {
    const poisoned = roleEntry('pukka-1', 'pukka', [4], 'pukka-new-poison')
    const projected = applyWakeHistoricalContext(sessionWithHistory([poisoned]), complexItem('pukka'), 3)
    expect(projected.historicalContext).toMatchObject({ kind: 'pukka_poison', status: 'ready', seatIds: [4] })
    expect(projected.minimumTargetCount).toBe(0)
    expect(projected.outcomeOptions.map((option) => option.id)).toContain('pukka-old-resolved-no-new')

    const session = sessionWithHistory([poisoned, roleEntry('pukka-2', 'pukka', [5], 'pukka-no-new-poison', 'night-3')])
    session.phaseSegments.push({ id: 'night-4', kind: 'night', sequence: 4, label: '第4夜', createdAt: AT })
    expect(applyWakeHistoricalContext(session, complexItem('pukka'), 4).historicalContext?.seatIds).toEqual([4])
  })

  it('confirms an impaired Pukka choice without keeping its old target poisoned or losing the next-night tracking', () => {
    const scriptId = 'yi-cun-duan-yi-cun-xian'
    const roles = roleSnapshotsForScript(scriptId)
    const role = (id: string) => ({ ...roles.find((candidate) => candidate.id === id)! })
    let session = createSmartScriptSetupSession(scriptId, AT, { playerCount: 8 })
    session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
      candidateId: 'pukka-poison-suspension', revision: 1, updatedAt: AT,
      assignments: ['virgin', 'pacifist', 'fool', 'soldier', 'farmer', 'saint', 'poisoner', 'pukka']
        .map((id, index) => ({ seatId: index + 1, role: role(id) })),
      demonBluffs: ['chef', 'knight', 'steward'].map(role),
    } })
    session = gameSessionReducer(session, { type: 'confirm-setup', id: 'pukka-suspension-setup', confirmedAt: AT })
    const original = { ...roleEntry('pukka-first-poison', 'pukka', [1], 'pukka-new-poison', 'night-1'),
      actorSeatId: 8, nightRunId: 'night-1', wakeItemId: 'night-1-pukka-8' }
    session.timeline.push(original)
    session.phaseSegments = [
      { id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: AT, closedAt: AT },
      { id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: AT, closedAt: AT },
    ]
    // Explicit host changes: old poison first applied, then suspended when the Pukka is poisoned.
    for (const [index, [seatId, poisoned]] of ([[1, true], [8, true], [1, false]] as const).entries()) {
      const before = projectCurrentPlayerStates(session)[seatId]
      session = gameSessionReducer(session, { type: 'confirm-player-state-change', seatId, expectedBefore: before,
        after: { ...before, poisoned }, segmentId: null, entryId: `pukka-host-state-${index}`,
        confirmedAt: AT, reason: '说书人确认投毒者使普卡失能，旧目标的普卡毒暂时失效。' })
    }
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
    const act = (action: NightWorkbenchIntent) => {
      const state = sessionInitialNightState({ session, dispatchSession: () => undefined })!
      session = gameSessionReducer(session, { type: 'night-workbench-action', nightRunId: state.nightRunId,
        expectedWakeItemId: state.previewEntryId, expectedActiveCursorId: state.activeCursorId, action: { ...action, at: AT } })
    }
    const wake = sessionInitialNightState({ session, dispatchSession: () => undefined })!.queue.find((item) => item.roleId === 'pukka')!
    act({ type: 'preview', id: wake.id })
    act({ type: 'activate-preview' })
    act({ type: 'target', seatId: 2 })
    const facts = '投毒者先使普卡中毒；1号旧目标当前恢复健康并存活；普卡本夜选择2号，新毒不生效。'
    act({ type: 'storyteller-context', value: facts })
    const before = projectCurrentPlayerStates(session)
    expect(before[8].poisoned).toBe(true)
    expect(before[1]).toMatchObject({ life: 'alive', poisoned: false })
    act({ type: 'outcome', outcomeId: 'pukka-no-new-poison' })
    const selected = sessionInitialNightState({ session, dispatchSession: () => undefined })!
    const draft = selected.drafts[wake.id]
    expect(canConfirmDraft(selected, selected.queue.find((item) => item.id === wake.id)!, draft)).toBe(true)
    expect(draft.storytellerResult).toContain('追踪')
    expect(draft.storytellerResult).toContain('暂时失效')
    expect(draft.storytellerResult).not.toContain('旧毒继续保留')
    act({ type: 'confirm', advance: false })
    const saved = session.timeline.filter((entry): entry is NightActionEntry => entry.kind === 'night_action').at(-1)!
    expect(saved.record.snapshot).toMatchObject({ outcomeId: 'pukka-no-new-poison', targets: [2], storytellerContext: facts })
    expect(saved.details).toContain(`说书人已核对：${facts}`)
    expect(projectCurrentPlayerStates(session)).toEqual(before)
    expect(session.timeline.find((entry) => entry.id === original.id)).toEqual(original)
    session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: AT })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
    const nextWake = sessionInitialNightState({ session, dispatchSession: () => undefined })!.queue.find((item) => item.roleId === 'pukka')!
    expect(nextWake.historicalContext).toMatchObject({ kind: 'pukka_poison', status: 'ready', seatIds: [1] })
    expect(projectCurrentPlayerStates(session)).toEqual(before)
  })

  it.each([
    ['pukka-new-poison', [5], [5]],
    ['pukka-old-resolved-no-new', [], []],
  ] as const)('keeps a protected Pukka old target alive while %s records the end of its old poison', (outcomeId, targets, pending) => {
    const session = sessionWithHistory([roleEntry('pukka-old', 'pukka', [4], 'pukka-new-poison')])
    const before = projectCurrentPlayerStates(session)
    const projected = applyWakeHistoricalContext(session, complexItem('pukka'), 3)
    const facts = '4号旧毒目标被清醒旅店老板保护，未死亡；旧毒结束。是否有新目标由本次选择记录。'
    const draft = applyOutcome(projected, { ...emptyWakeDraft(), targets: [...targets], storytellerContext: facts }, outcomeId)
    expect(draft.outcomeId).toBe(outcomeId)
    expect(draft.storytellerResult).toContain('保护')
    expect(draft.storytellerResult).not.toContain('4号为死亡并恢复健康候选')
    session.timeline.push({ ...roleEntry('pukka-protected', 'pukka', [...targets], outcomeId, 'night-3'), record: { revision: 1, snapshot: draft } })
    expect(applyWakeHistoricalContext(session, complexItem('pukka'), 4).historicalContext?.seatIds).toEqual([...pending])
    expect(projectCurrentPlayerStates(session)).toEqual(before)
    expect(projectCurrentPlayerStates(session)[4].life).toBe('alive')
  })

  it('does not treat a legacy Pukka target as a successfully poisoned target', () => {
    const legacy = roleEntry('legacy', 'pukka', [4], 'record')
    expect(applyWakeHistoricalContext(sessionWithHistory([legacy]), complexItem('pukka'), 3).historicalContext)
      .toMatchObject({ status: 'missing', seatIds: [] })
  })

  it('offers only currently dead previous Shabaloth targets as regurgitation candidates', () => {
    const session = sessionWithHistory([roleEntry('shab', 'shabaloth', [4, 5], 'record')])
    session.initialPlayerStates[4] = { ...session.initialPlayerStates[4], life: 'dead' }
    const projected = applyWakeHistoricalContext(session, complexItem('shabaloth'), 3)
    expect(projected.targetCount).toBe(2)
    expect(projected.historicalContext?.seatIds).toEqual([4])
    expect(projected.outcomeOptions.map((option) => option.id)).toContain('shabaloth-regurgitate-4')
    expect(projected.outcomeOptions.map((option) => option.id)).not.toContain('shabaloth-regurgitate-5')
  })

  it('downgrades malformed corrected target counts instead of treating them as rule facts', () => {
    const shabaloth = sessionWithHistory([roleEntry('shab', 'shabaloth', [4], 'record')])
    shabaloth.initialPlayerStates[4] = { ...shabaloth.initialPlayerStates[4], life: 'dead' }
    expect(applyWakeHistoricalContext(shabaloth, complexItem('shabaloth'), 3).historicalContext)
      .toMatchObject({ status: 'missing', seatIds: [] })

    const po = sessionWithHistory([roleEntry('po', 'po', [4], 'po-charge')])
    expect(applyWakeHistoricalContext(po, complexItem('po'), 3).historicalContext?.status).toBe('missing')
  })

  it('keeps the special third-night Yanluo target scoped to its script', () => {
    const session = sessionWithHistory([
      roleEntry('yan-1', 'yanluo', [3], 'yanluo-record', 'night-1'),
      roleEntry('yan-2', 'yanluo', [4], 'yanluo-record', 'night-2'),
    ])
    session.phaseSegments.unshift({ id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: AT, closedAt: AT })
    session.scriptId = 'zi-gui-qi-ming'
    expect(applyWakeHistoricalContext(session, complexItem('yanluo'), 3).historicalContext?.seatIds).toEqual([3, 4])
    session.scriptId = 'jiu-quan-song-ge'
    expect(applyWakeHistoricalContext(session, complexItem('yanluo'), 3).historicalContext?.seatIds).toEqual([4])
  })

  it('turns an explicit Po no-target choice into a mandatory three-target next action', () => {
    const charged = roleEntry('po-charge', 'po', [], 'po-charge')
    const projected = applyWakeHistoricalContext(sessionWithHistory([charged]), complexItem('po'), 3)
    expect(projected).toMatchObject({ targetCount: 3, minimumTargetCount: 3, aiAdviceEnabled: false })
    const option = projected.outcomeOptions[0]
    expect(outcomeReady(option, projected, { ...emptyWakeDraft(), targets: [1, 2] })).toBe(false)
    expect(outcomeReady(option, projected, { ...emptyWakeDraft(), targets: [1, 2, 3] })).toBe(true)
  })

  it('does not mistake Po no-action for a charge and allows an explicit no-target charge choice', () => {
    const noAction = roleEntry('po-no-action', 'po', [], 'po-no-action')
    const session = sessionWithHistory([roleEntry('po-attack', 'po', [4], 'po-attack', 'night-1'), noAction])
    session.phaseSegments.unshift({ id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: AT, closedAt: AT })
    const projected = applyWakeHistoricalContext(session, complexItem('po'), 3)
    expect(projected).toMatchObject({ targetCount: 1, minimumTargetCount: 0 })
    const charge = projected.outcomeOptions.find((option) => option.id === 'po-charge')!
    expect(outcomeReady(charge, projected, { ...emptyWakeDraft(), targetCountChoice: 0 })).toBe(true)
  })

  it('forbids a healthy Balloonist from confirming the same role type on consecutive nights', () => {
    const projected = applyWakeHistoricalContext(sessionWithHistory([balloonistEntry('outsider')]), complexItem('balloonist'), 3)
    expect(projected.historicalContext).toMatchObject({ kind: 'balloonist_role_type', status: 'ready', seatIds: [4] })
    expect(projected.forbiddenRegistrationValues).toEqual(['outsider'])
    const option = projected.outcomeOptions[0]
    expect(outcomeReady(option, projected, {
      ...emptyWakeDraft(),
      targets: [5],
      registration: { kind: 'role_type', seatId: 5, value: 'outsider' },
    })).toBe(false)
    expect(outcomeReady(option, projected, {
      ...emptyWakeDraft(),
      targets: [5],
      registration: { kind: 'role_type', seatId: 5, value: 'minion' },
    })).toBe(true)
  })

  it('allows Balloonist same-type false information when the actor is impaired', () => {
    const impaired = {
      ...complexItem('balloonist'),
      status: { life: 'alive' as const, impairments: ['drunk' as const], markers: [] },
    }
    const projected = applyWakeHistoricalContext(sessionWithHistory([balloonistEntry('outsider')]), impaired, 3)
    expect(projected.historicalContext).toMatchObject({ kind: 'balloonist_role_type', status: 'clear' })
    expect(projected.forbiddenRegistrationValues).toBeUndefined()
  })

  it('does not turn a Moonchild no-effect day record into a night death candidate', () => {
    const projected = applyWakeHistoricalContext(sessionWithDayHistory([
      moonchildDayEntry('no_effect', 4, 'good'),
    ]), complexItem('moonchild'), 3)
    expect(projected.historicalContext).toMatchObject({ kind: 'moonchild_choice', status: 'clear', seatIds: [4] })
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['no-death-candidate'])
  })

  it('does not create a new Moonchild death candidate for a target that is already dead', () => {
    const session = sessionWithDayHistory([moonchildDayEntry('applied', 4, 'good')])
    session.initialPlayerStates[4] = { ...session.initialPlayerStates[4], life: 'dead' }
    const projected = applyWakeHistoricalContext(session, complexItem('moonchild'), 3)
    expect(projected.historicalContext).toMatchObject({ kind: 'moonchild_choice', status: 'clear', seatIds: [4] })
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['no-death-candidate'])
  })

  it('does not let AI recommend a once-per-game Professor ability after it was already used', () => {
    const used = {
      ...nightEntry('professor-used', 4),
      roleId: 'professor',
      wakeItemId: 'night-2-professor-2',
      record: { revision: 1, snapshot: { ...emptyWakeDraft(), targets: [4], outcomeId: 'record', storytellerResult: '教授已使用能力' } },
    }
    const projected = applyWakeHistoricalContext(sessionWithHistory([used]), complexItem('professor'), 3)
    expect(projected).toMatchObject({ targetCount: 0, minimumTargetCount: 0, aiAdviceEnabled: false, applicability: 'needs_review' })
    expect(projected.historicalContext).toMatchObject({ kind: 'once_per_game_use', status: 'ready', seatIds: [4] })
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['already-used'])
  })
})
