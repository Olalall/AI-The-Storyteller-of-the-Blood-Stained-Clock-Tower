import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import type { ExecutionEntry, GameSessionState, NightActionEntry } from '../types'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import type { WakeItem } from '../../night-workbench/types'
import { applyWakeHistoricalContext } from './nightHistoricalContext'

const AT = '2026-08-07T00:00:00.000Z'

function item(roleId: 'godfather' | 'fanggu'): WakeItem {
  return {
    id: `night-3-${roleId}-2`, orderIndex: 1, seatId: 2, playerLabel: '2号 玩家2',
    roleId, roleName: roleId === 'godfather' ? '教父' : '方古', roleInitial: roleId === 'godfather' ? '教' : '方', iconPath: '',
    ability: '测试能力', storytellerPrompt: '选择目标。', progress: 'pending', applicability: 'applicable',
    status: { life: 'alive', impairments: [], markers: [] }, targetCount: roleId === 'fanggu' ? 1 : 1,
    targetKind: 'player_choice', interactionVersion: 'test', outcomeOptions: roleId === 'fanggu'
      ? [
        { id: 'convert', label: '转化候选', requiredInputs: ['targets'], resultTemplate: '转化候选。' },
        { id: 'kill', label: '普通击杀候选', requiredInputs: ['targets'], resultTemplate: '击杀候选。' },
        { id: 'no-effect', label: '未生效', requiredInputs: ['targets'], resultTemplate: '未生效。' },
      ]
      : [{ id: 'record', label: '记录', requiredInputs: [], resultTemplate: '记录。' }],
  }
}

function executionEntry(id: string, executedSeatId: number, causedDeath = true): ExecutionEntry {
  return {
    id, kind: 'execution', segmentId: 'day-2', createdAt: AT, confirmedBy: 'storyteller', executedSeatId, causedDeath,
  }
}

function fangguConversionEntry(): NightActionEntry {
  return {
    id: 'fanggu-convert', kind: 'night_action', segmentId: 'night-2', createdAt: AT, confirmedBy: 'storyteller',
    nightRunId: 'night-2', wakeItemId: 'night-2-fanggu-2', actorSeatId: 2, roleId: 'fanggu', summary: '已确认方古转化', details: [],
    record: { revision: 1, snapshot: { ...emptyWakeDraft(), targets: [4], outcomeId: 'convert', storytellerResult: '已确认转化' } },
  }
}

function sessionWithSetup(overrides: { execution?: ExecutionEntry; conversion?: NightActionEntry } = {}): GameSessionState {
  const session = createPrototypeGameSession()
  session.scriptId = 'bad-moon-rising'
  session.phaseSegments = [
    { id: 'night-2', kind: 'night', sequence: 2, label: '第2夜', createdAt: AT },
    { id: 'day-2', kind: 'day', sequence: 2, label: '第2天', createdAt: AT },
    { id: 'night-3', kind: 'night', sequence: 3, label: '第3夜', createdAt: AT },
  ]
  const setup = session.timeline.find((entry) => entry.kind === 'setup_confirmed')
  if (setup?.kind === 'setup_confirmed') {
    setup.setup.draft.assignments = setup.setup.draft.assignments.map((assignment) => {
      if (assignment.seatId === 2) return { ...assignment, role: { id: 'professor', name: '教授', initial: '教', iconPath: '' } }
      if (assignment.seatId === 4) return { ...assignment, role: { id: 'tinker', name: '修补匠', initial: '修', iconPath: '' } }
      return assignment
    })
  }
  session.timeline = [
    ...session.timeline.filter((entry) => entry.kind === 'setup_confirmed'),
    ...(overrides.conversion ? [overrides.conversion] : []),
    ...(overrides.execution ? [overrides.execution] : []),
  ]
  return session
}

describe('教父与方古的夜间历史约束', () => {
  it('首夜只记录教父得知外来者，不产生击杀目标', () => {
    const projected = applyWakeHistoricalContext(sessionWithSetup(), item('godfather'), 1)

    expect(projected.historicalContext).toMatchObject({ kind: 'godfather_trigger', status: 'clear' })
    expect(projected.targetCount).toBe(0)
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['godfather-no-kill'])
  })

  it('外来者被白天处决且确实死亡时，教父生成额外击杀候选', () => {
    const projected = applyWakeHistoricalContext(
      sessionWithSetup({ execution: executionEntry('execution-outsider', 4) }),
      item('godfather'),
      3,
    )

    expect(projected.historicalContext).toMatchObject({ kind: 'godfather_trigger', status: 'ready', seatIds: [4] })
    expect(projected.targetCount).toBe(1)
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['godfather-kill'])
  })

  it('处决未造成死亡时，教父不触发', () => {
    const projected = applyWakeHistoricalContext(
      sessionWithSetup({ execution: executionEntry('execution-protected', 4, false) }),
      item('godfather'),
      3,
    )

    expect(projected.historicalContext).toMatchObject({ kind: 'godfather_trigger', status: 'clear' })
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['godfather-no-kill'])
  })

  it('方古已经成功转化后，后续夜晚不再给出转化建议', () => {
    const projected = applyWakeHistoricalContext(
      sessionWithSetup({ conversion: fangguConversionEntry() }),
      item('fanggu'),
      3,
    )

    expect(projected.historicalContext).toMatchObject({ kind: 'fanggu_conversion', status: 'ready', seatIds: [4] })
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['kill', 'no-effect'])
  })
})


// 官方 Godfather 的 Tinker 示例，以及 Fang Gu 的整局 ONCE 提醒。
// https://wiki.bloodontheclocktower.com/Godfather
// https://wiki.bloodontheclocktower.com/Fang_Gu
function outsiderDeath(segmentId = 'day-2') {
  const before = { life: 'alive' as const, poisoned: false, drunk: false, markers: [] }
  return { id: 'tinker-day-death', kind: 'player_state_changed' as const, segmentId, createdAt: AT, confirmedBy: 'storyteller' as const, seatId: 4, before, after: { ...before, life: 'dead' as const }, reason: '修补匠自身能力死亡，由说书人确认' }
}

it('includes a confirmed non-execution Outsider death during the day in Godfather candidates', () => {
  const session = sessionWithSetup()
  session.timeline.push({ id: 'no-execution', kind: 'no_execution', segmentId: 'day-2', createdAt: AT, confirmedBy: 'storyteller' }, outsiderDeath())
  const before = structuredClone(session)
  const projected = applyWakeHistoricalContext(session, item('godfather'), 3)
  expect(projected.historicalContext).toMatchObject({ status: 'ready', seatIds: [4] })
  expect(projected.targetCount).toBe(1)
  expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['godfather-kill'])
  expect(session).toEqual(before)
})

it('does not count an Outsider death at night as a Godfather day trigger', () => {
  const session = sessionWithSetup()
  session.timeline.push({ id: 'no-execution', kind: 'no_execution', segmentId: 'day-2', createdAt: AT, confirmedBy: 'storyteller' }, outsiderDeath('night-2'))
  expect(applyWakeHistoricalContext(session, item('godfather'), 3).historicalContext?.status).toBe('clear')
})

it('uses the character at the time of the death, preserving later role changes', () => {
  const session = sessionWithSetup(), setup = session.timeline.find((entry) => entry.kind === 'setup_confirmed')!
  if (setup.kind !== 'setup_confirmed') throw new Error('setup is required')
  session.timeline.push(outsiderDeath(), { id: 'later-role', kind: 'setup_changed', segmentId: null, createdAt: '2026-08-07T01:00:00Z', confirmedBy: 'storyteller', baseSetupId: setup.setup.id, originNightRunId: null, seatId: 4, fromRole: { id: 'tinker', name: '修补匠', initial: '修', iconPath: '' }, toRole: { id: 'professor', name: '教授', initial: '教', iconPath: '' }, reason: '死亡后的角色更正', effectiveFrom: 'future_workbenches' })
  expect(applyWakeHistoricalContext(session, item('godfather'), 3).historicalContext).toMatchObject({ status: 'ready', seatIds: [4] })
})

it('keeps Fang Gu conversion spent for a new host and when projecting the same night', () => {
  const session = sessionWithSetup({ conversion: fangguConversionEntry() })
  const nextHost = { ...item('fanggu'), seatId: 4 }
  for (const sequence of [2, 3]) {
    const projected = applyWakeHistoricalContext(session, nextHost, sequence)
    expect(projected.historicalContext?.status).toBe('ready')
    expect(projected.outcomeOptions.map((option) => option.id)).toEqual(['kill', 'no-effect'])
  }
})

it('does not reset the global Fang Gu use after the original actor changes character', () => {
  const session = sessionWithSetup({ conversion: fangguConversionEntry() }), setup = session.timeline.find((entry) => entry.kind === 'setup_confirmed')!
  if (setup.kind !== 'setup_confirmed') throw new Error('setup is required')
  session.timeline.push({ id: 'old-fanggu-changed', kind: 'setup_changed', segmentId: null, createdAt: '2026-08-07T01:00:00Z', confirmedBy: 'storyteller', baseSetupId: setup.setup.id, originNightRunId: null, seatId: 2, fromRole: { id: 'fanggu', name: '方古', initial: '方', iconPath: '' }, toRole: { id: 'imp', name: '小恶魔', initial: '小', iconPath: '' }, reason: '主持确认角色变化', effectiveFrom: 'future_workbenches' })
  expect(applyWakeHistoricalContext(session, { ...item('fanggu'), seatId: 4 }, 3).outcomeOptions.map((option) => option.id)).toEqual(['kill', 'no-effect'])
})

it('uses the effective Fang Gu history after a mistaken conversion is explicitly corrected', () => {
  const session = sessionWithSetup({ conversion: fangguConversionEntry() }), original = fangguConversionEntry()
  session.timeline.push({ ...original, id: 'fanggu-corrected', correctionOf: original.id, createdAt: '2026-08-07T01:00:00Z', record: { revision: 2, snapshot: { ...original.record.snapshot, outcomeId: 'no-effect' } } })
  expect(applyWakeHistoricalContext(session, { ...item('fanggu'), seatId: 4 }, 3).outcomeOptions.map((option) => option.id)).toContain('convert')
})
