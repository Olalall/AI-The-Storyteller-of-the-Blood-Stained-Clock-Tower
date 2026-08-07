import { describe, expect, it } from 'vitest'
import { roleTeamByIdForScript } from '../../domain/scripts'
import { createSmartScriptSetupSession } from '../game-session/data/createPrototypeSession'
import { createNextNightRun } from '../game-session/state/createNextNightRun'
import { createSmartScriptSetupCandidates } from '../setup/smartScriptSetupCandidates'
import type { SetupSeatProfile } from '../setup/types'
import type { GameSessionState } from '../game-session/types'
import { nightWorkbenchReducer, type NightWorkbenchIntent } from './state/nightWorkbenchReducer'
import type { NightWorkbenchState, WakeItem } from './types'

/**
 * reducer 现在要求调用方给时间戳。这里固定成一个常量正是想要的效果：
 * 同一组 (state, action) 必须每次跑出同一个 state，写死时间才测得出这一点。
 */
const AT = '2026-08-04T02:00:00.000Z'

function reduce(state: NightWorkbenchState, intent: NightWorkbenchIntent): NightWorkbenchState {
  return nightWorkbenchReducer(state, { ...intent, at: AT })
}

function makeProfiles(playerCount: number): SetupSeatProfile[] {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' : index % 3 === 0 ? 'veteran' : 'regular',
  }))
}

/** 一局已确认配板、还没进过夜的对局。 */
function confirmedSession(playerCount: number): GameSessionState {
  const profiles = makeProfiles(playerCount)
  const session = createSmartScriptSetupSession('trouble-brewing', '2026-08-04T00:00:00.000Z', {
    playerCount,
    seats: profiles,
  })
  const candidate = createSmartScriptSetupCandidates('trouble-brewing', profiles, { seed: `tb-${playerCount}` })[0]
  return {
    ...session,
    timeline: [{
      id: 'setup-entry',
      kind: 'setup_confirmed' as const,
      segmentId: null,
      createdAt: '2026-08-04T00:01:00.000Z',
      confirmedBy: 'storyteller' as const,
      setup: {
        id: 'setup-1',
        confirmedAt: '2026-08-04T00:01:00.000Z',
        draft: {
          candidateId: candidate.id,
          revision: 1,
          assignments: candidate.assignments,
          demonBluffs: candidate.demonBluffs,
          setupRuleSelections: candidate.setupRuleSelections,
          setupRulePackVersion: candidate.setupRulePackVersion,
          updatedAt: '2026-08-04T00:01:00.000Z',
        },
      },
    }],
  }
}

function firstNightQueue(playerCount = 12) {
  const run = createNextNightRun(confirmedSession(playerCount))
  if (!run) throw new Error('fixture is incomplete')
  return run
}

function workbenchState(queue: WakeItem[]): NightWorkbenchState {
  return {
    nightRunId: 'trouble-brewing-night-1',
    scriptId: 'trouble-brewing',
    nightLabel: '第1夜',
    nightType: 'first',
    playerCount: 12,
    revision: 0,
    knowledgeVersion: 'test',
    queue,
    seatSnapshots: {},
    activeCursorId: queue[0].id,
    previewEntryId: queue[0].id,
    drafts: {},
    privacyShielded: false,
    dimmed: false,
    aiAdviceLog: {},
    correctionItemId: null,
    confirmedRecords: {},
    roleChangeEvents: [],
    lastNotice: '',
  }
}

describe('首夜系统步骤卡', () => {
  it('puts 爪牙信息 and 恶魔信息 at the head of the first night and renumbers the rest', () => {
    const run = firstNightQueue()

    expect(run.nightType).toBe('first')
    expect(run.queue.slice(0, 2).map((item) => item.roleName)).toEqual(['爪牙信息', '恶魔信息'])
    expect(run.queue.map((item) => item.orderIndex)).toEqual(run.queue.map((_item, index) => index + 1))
    expect(run.activeCursorId).toBe(run.queue[0].id)
    expect(run.queue.slice(2).every((item) => !item.systemStep)).toBe(true)
  })

  it('lists every minion seat read-only and never turns them into targets', () => {
    const session = confirmedSession(12)
    const run = createNextNightRun(session)
    const teamById = roleTeamByIdForScript('trouble-brewing')
    const setup = session.timeline[0]
    if (!run || setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const minionSeats = setup.setup.draft.assignments
      .filter((assignment) => teamById[assignment.role.id] === 'minion')
      .map((assignment) => assignment.seatId)

    for (const item of run.queue.slice(0, 2)) {
      expect(item.targetCount).toBe(0)
      expect(item.roleChoices).toBeUndefined()
      expect(item.systemStep?.minionLabels).toHaveLength(minionSeats.length)
      for (const seatId of minionSeats) {
        expect(item.systemStep?.minionLabels.some((label) => label.startsWith(`${seatId}号`))).toBe(true)
      }
    }
    expect(run.queue[0].systemStep?.infoTokens).toEqual(['他是恶魔'])
    expect(run.queue[1].systemStep?.infoTokens).toEqual(['他们是你的爪牙', '这些角色不在场'])
  })

  it('offers only good roles that are not in play as demon bluffs', () => {
    const session = confirmedSession(12)
    const run = createNextNightRun(session)
    const setup = session.timeline[0]
    if (!run || setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const teamById = roleTeamByIdForScript('trouble-brewing')
    const inPlay = new Set(setup.setup.draft.assignments.map((assignment) => assignment.role.id))
    const choices = run.queue[1].systemStep?.bluffChoices ?? []

    expect(run.queue[1].systemStep?.bluffCount).toBe(3)
    expect(choices.length).toBeGreaterThan(0)
    for (const choice of choices) {
      expect(inPlay.has(choice.id)).toBe(false)
      expect(['townsfolk', 'outsider']).toContain(teamById[choice.id])
    }
    // 配板时预设的三张只当提示，不限制可选范围。
    expect(choices.some((choice) => choice.suggested)).toBe(true)
  })

  it('skips both steps below seven players', () => {
    // 智能板子配板本身就不接受 7 人以下，这里只钉住《规则概要》二.2 的人数门本身。
    const sixPlayers = createNextNightRun({ ...confirmedSession(12), playerCount: 6 })
    expect(sixPlayers?.queue.some((item) => item.systemStep)).toBe(false)
  })

  it('skips both steps when 罂粟种植者 is in play', () => {
    const session = confirmedSession(12)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const [first, ...rest] = setup.setup.draft.assignments
    const withPoppyGrower = {
      ...session,
      timeline: [{
        ...setup,
        setup: {
          ...setup.setup,
          draft: {
            ...setup.setup.draft,
            assignments: [
              { ...first, role: { id: 'poppygrower', name: '罂粟种植者', initial: '罂', iconPath: '' } },
              ...rest,
            ],
          },
        },
      }],
    }

    expect(createNextNightRun(withPoppyGrower)?.queue.some((item) => item.systemStep)).toBe(false)
  })

  it('skips both steps on later nights', () => {
    const session = confirmedSession(12)
    const withFirstNight = {
      ...session,
      phaseSegments: [{
        id: 'segment-night-1',
        kind: 'night' as const,
        sequence: 1,
        label: '第1夜',
        createdAt: '2026-08-04T00:02:00.000Z',
        openedAt: '2026-08-04T00:02:00.000Z',
        closedAt: '2026-08-04T00:30:00.000Z',
      }],
    }
    const secondNight = createNextNightRun(withFirstNight)
    expect(secondNight?.nightType).toBe('other')
    expect(secondNight?.queue.some((item) => item.systemStep)).toBe(false)
  })
})

describe('系统步骤卡的记录', () => {
  it('blocks the record until the checklist and all three bluffs are set', () => {
    const run = firstNightQueue()
    const demonInfo = run.queue[1]
    const choices = demonInfo.systemStep?.bluffChoices ?? []
    let state = workbenchState(run.queue)
    state = { ...state, activeCursorId: demonInfo.id, previewEntryId: demonInfo.id }

    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    expect(state.drafts[demonInfo.id]?.outcomeId ?? '').toBe('')

    state = reduce(state, { type: 'system-check', checkId: 'pointed-minions' })
    state = reduce(state, { type: 'system-bluff', roleId: choices[0].id })
    state = reduce(state, { type: 'system-bluff', roleId: choices[1].id })
    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    expect(state.drafts[demonInfo.id]?.outcomeId ?? '').toBe('')

    state = reduce(state, { type: 'system-bluff', roleId: choices[2].id })
    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    expect(state.drafts[demonInfo.id]?.outcomeId).toBe('given')
  })

  it('writes the three bluffs into a night_action snapshot that stays reviewable', () => {
    const run = firstNightQueue()
    const demonInfo = run.queue[1]
    const choices = demonInfo.systemStep?.bluffChoices ?? []
    let state = workbenchState(run.queue)
    state = { ...state, activeCursorId: demonInfo.id, previewEntryId: demonInfo.id }

    state = reduce(state, { type: 'system-check', checkId: 'pointed-minions' })
    for (const choice of choices.slice(0, 3)) {
      state = reduce(state, { type: 'system-bluff', roleId: choice.id })
    }
    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    state = reduce(state, { type: 'confirm', advance: false })

    const record = state.confirmedRecords[demonInfo.id]?.at(-1)
    expect(record).toBeDefined()
    expect(record?.snapshot.bluffRoleIds).toEqual(choices.slice(0, 3).map((choice) => choice.id))
    for (const choice of choices.slice(0, 3)) {
      expect(record?.snapshot.storytellerResult).toContain(choice.label)
    }
    expect(record?.snapshot.storytellerResult).toContain('恶魔信息')
    expect(record?.snapshot.playerChoice).toContain('不在场善良角色')
  })

  it('drops the outcome again when a check is undone, so no empty record can be confirmed', () => {
    const run = firstNightQueue()
    const minionInfo = run.queue[0]
    let state = workbenchState(run.queue)

    state = reduce(state, { type: 'system-check', checkId: 'pointed-demon' })
    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    expect(state.drafts[minionInfo.id]?.storytellerResult).toContain('爪牙信息')

    state = reduce(state, { type: 'system-check', checkId: 'pointed-demon' })
    expect(state.drafts[minionInfo.id]?.outcomeId).toBe('')
    state = reduce(state, { type: 'confirm', advance: false })
    expect(state.confirmedRecords[minionInfo.id]).toBeUndefined()
  })

  it('never lets a role change rename a system step', () => {
    const run = firstNightQueue()
    let state = workbenchState(run.queue)

    state = reduce(state, {
      type: 'change-role',
      role: { id: 'chef', name: '厨师', initial: '厨', iconPath: '' },
      reason: 'gameplay',
    })

    expect(state.roleChangeEvents).toHaveLength(0)
    expect(state.queue[0].roleName).toBe('爪牙信息')
  })
})
