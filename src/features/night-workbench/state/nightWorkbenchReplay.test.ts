/**
 * reducer 必须是纯函数：同一组 (state, action) 无论什么时候跑，都要得到同一个 state。
 *
 * 这些用例的做法是把系统时钟拨到两个相距十几年的时刻各跑一遍再深比较。
 * 收敛前 confirm / 草稿更新 / 换角三处直接调 `new Date().toISOString()`，
 * 两遍的 confirmedAt / updatedAt / changedAt 一定不同，这里必然红；
 * 只有时间戳完全来自 action.at 才可能绿。归档回放依赖的就是这一条。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { sessionInitialNightState } from './gameSessionAdapter'
import { nightWorkbenchReducer, type NightWorkbenchAction, type NightWorkbenchIntent } from './nightWorkbenchReducer'
import type { NightWorkbenchState } from '../types'

/** 录下来的操作时刻。回放时原样传回去，结果必须逐字段相同。 */
const RECORDED = '2026-08-05T10:00:00.000Z'
/** 两个「回放当天」的墙上时钟，故意隔了十几年。 */
const EARLY_WALL_CLOCK = '2001-09-09T01:46:40.000Z'
const LATE_WALL_CLOCK = '2038-01-19T03:14:07.000Z'

const ACTIVE_ID = 'night-3-cerenovus'

function freshState(): NightWorkbenchState {
  return sessionInitialNightState({
    session: createPrototypeGameSession(),
    dispatchSession: () => undefined,
  })
}

function reduce(state: NightWorkbenchState, intent: NightWorkbenchIntent, at = RECORDED): NightWorkbenchState {
  return nightWorkbenchReducer(state, { ...intent, at })
}

function underClock<T>(iso: string, run: () => T): T {
  vi.setSystemTime(new Date(iso))
  return run()
}

/** 同一件事在两个墙上时钟下各做一遍；相同才算这条路径上没有藏时钟。 */
function sameUnderBothClocks(run: () => NightWorkbenchState) {
  const early = underClock(EARLY_WALL_CLOCK, run)
  const late = underClock(LATE_WALL_CLOCK, run)
  expect(late).toEqual(early)
  return early
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('reducer 对墙上时钟无感', () => {
  it('草稿的 updatedAt 来自 action.at 而不是当下时刻', () => {
    const base = freshState()

    const next = sameUnderBothClocks(() => reduce(base, { type: 'target', seatId: 3 }))

    expect(next.drafts[ACTIVE_ID]?.updatedAt).toBe(RECORDED)
    // 反面：这一刻的墙上时钟是 LATE，草稿里不能出现它。
    expect(next.drafts[ACTIVE_ID]?.updatedAt).not.toBe(new Date().toISOString())
  })

  it('确认记录的 confirmedAt 来自 action.at', () => {
    let base = freshState()
    base = reduce(base, { type: 'target', seatId: 3 })
    base = reduce(base, { type: 'role-choice', roleId: 'investigator' })
    // 前置：草稿真的可确认，否则下面确认的是一条「不能确认」的空转。
    expect(base.drafts[ACTIVE_ID]?.storytellerResult).toBeTruthy()

    const confirmed = sameUnderBothClocks(() => reduce(base, { type: 'confirm', advance: false }))

    const record = confirmed.confirmedRecords[ACTIVE_ID]?.at(-1)
    expect(record?.confirmedAt).toBe(RECORDED)
    expect(record?.confirmedAt).not.toBe(new Date().toISOString())
  })

  it('换角事件的 changedAt 来自 action.at', () => {
    const base = freshState()

    const changed = sameUnderBothClocks(() => reduce(base, {
      type: 'change-role',
      role: { id: 'chef', name: '厨师', initial: '厨', iconPath: '' },
      reason: 'gameplay',
    }))

    const event = changed.roleChangeEvents.at(-1)
    expect(event?.toRole.id).toBe('chef')
    expect(event?.changedAt).toBe(RECORDED)
    expect(event?.changedAt).not.toBe(new Date().toISOString())
  })

  it('每一种 action 单独跑都与墙上时钟无关', () => {
    // 覆盖全部 action 类型：将来谁在某个 case 里加时间字段又顺手取了时钟，这条会红。
    const intents: NightWorkbenchIntent[] = [
      { type: 'preview', id: 'night-3-pithag' },
      { type: 'return-current' },
      { type: 'target', seatId: 3 },
      { type: 'role-choice', roleId: 'investigator' },
      { type: 'system-check', checkId: 'pointed-demon' },
      { type: 'system-bluff', roleId: 'chef' },
      { type: 'outcome', outcomeId: 'no-effect' },
      { type: 'confirm', advance: false },
      { type: 'defer' },
      { type: 'advance' },
      { type: 'activate-preview' },
      { type: 'resume' },
      { type: 'begin-correction' },
      { type: 'cancel-correction' },
      { type: 'resolve-applicability', value: 'applicable' },
      { type: 'toggle-privacy' },
      { type: 'set-privacy', shielded: true },
      { type: 'toggle-dim' },
      { type: 'apply-ai-advice', advice: null },
      { type: 'change-role', role: { id: 'chef', name: '厨师', initial: '厨', iconPath: '' }, reason: 'gameplay' },
      { type: 'clear-draft' },
    ]
    const covered = new Set(intents.map((intent) => intent.type))
    expect(covered.size).toBe(intents.length)

    // 三种起点：空草稿（换角只在这里放行）、有草稿、可确认。
    // 只用其中一种会让另外两条路径的 action 全部在守卫处早退，等于什么都没测。
    const empty = freshState()
    const drafted = reduce(empty, { type: 'target', seatId: 3 })
    const confirmable = reduce(drafted, { type: 'role-choice', roleId: 'investigator' })
    expect(confirmable.drafts[ACTIVE_ID]?.storytellerResult).toBeTruthy()

    for (const [label, base] of Object.entries({ empty, drafted, confirmable })) {
      for (const intent of intents) {
        const early = underClock(EARLY_WALL_CLOCK, () => reduce(base, intent))
        const late = underClock(LATE_WALL_CLOCK, () => reduce(base, intent))
        expect(late, `${label} · ${intent.type}`).toEqual(early)
      }
    }
  })
})

describe('整段操作可以忠实回放', () => {
  it('把录下来的 (action, at) 序列重放一遍，得到逐字段相同的 state', () => {
    const script: NightWorkbenchAction[] = [
      { type: 'target', seatId: 3, at: '2026-08-05T10:00:01.000Z' },
      { type: 'role-choice', roleId: 'investigator', at: '2026-08-05T10:00:05.000Z' },
      { type: 'confirm', advance: true, at: '2026-08-05T10:00:09.000Z' },
      { type: 'target', seatId: 5, at: '2026-08-05T10:00:20.000Z' },
    ]
    const replay = () => script.reduce(
      (state, action) => nightWorkbenchReducer(state, action),
      freshState(),
    )

    const live = sameUnderBothClocks(replay)

    // 时间戳确实是脚本里那几个，不是回放当天的钟——否则上面的相等只说明两次都错得一样。
    expect(live.confirmedRecords[ACTIVE_ID]?.at(-1)?.confirmedAt).toBe('2026-08-05T10:00:09.000Z')
    expect(live.drafts[ACTIVE_ID]?.updatedAt).toBe('2026-08-05T10:00:05.000Z')
    // advance 之后光标已经挪走，第四步的草稿落在新的一项上。
    expect(live.activeCursorId).not.toBe(ACTIVE_ID)
    expect(live.drafts[live.activeCursorId]?.updatedAt).toBe('2026-08-05T10:00:20.000Z')
  })
})
