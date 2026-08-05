import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import { projectCurrentPlayerStates } from './projectors'
import type { GameSessionAction } from './sessionActions'

/**
 * 不变量测试 B（设计文档 G2 验收②）：
 * **除了那条专门用来改玩家状态的 action，没有任何 action 能改玩家状态。**
 *
 * 这条比「一次手势一条记录」更基础：它锁的是「谁有资格改」。
 * 级联写入最省事的藏身处不是 reducer 内部，而是某个看起来无关的 action
 * 顺手把生死改了——例如「确认本项」顺手标死、「关闭夜晚」顺手清中毒。
 * 那种改动不会有任何记录说明它发生过，复盘时只会看到状态莫名其妙变了。
 */
const NOW = '2026-08-06T12:00:00.000Z'

/** 白名单：这三条本来就该整局替换。 */
const REPLACES_THE_WHOLE_GAME = new Set(['reset-session', 'replace-session', 'start-setup-session', 'start-catfishing-setup-session'])

const PROBES: GameSessionAction[] = [
  { type: 'set-setup-draft', draft: null },
  { type: 'clear-day-vote-draft' },
  { type: 'clear-day-action-draft' },
  { type: 'update-seat-nickname', seatId: 3, nickname: '阿杰' },
  { type: 'open-phase-segment', phaseKind: 'day', createdAt: NOW },
  { type: 'close-open-segment', phaseKind: 'day', closedAt: NOW },
  { type: 'start-next-night-run' },
  { type: 'set-active-night-run', nightRunId: null },
  { type: 'set-hosting-mode', mode: 'grimoire', changedAt: NOW, phaseLabel: '第3夜' },
]

describe('不变量 B：只有一条 action 能改玩家状态', () => {
  for (const action of PROBES) {
    it(`${action.type} leaves every seat's state untouched`, () => {
      const before = createPrototypeGameSession()
      const after = gameSessionReducer(before, action)

      expect(REPLACES_THE_WHOLE_GAME.has(action.type)).toBe(false)
      expect(projectCurrentPlayerStates(after)).toEqual(projectCurrentPlayerStates(before))
    })
  }

  it('the one action that may change state actually does', () => {
    // 反面锚点：上面那一串若因为投影恒等而永远通过，这条会先红。
    const before = createPrototypeGameSession()
    const seat = projectCurrentPlayerStates(before)[3]
    const after = gameSessionReducer(before, {
      type: 'confirm-player-state-change',
      seatId: 3,
      expectedBefore: seat,
      after: { ...seat, drunk: !seat.drunk },
      segmentId: null,
      entryId: 'probe-1',
      confirmedAt: NOW,
      reason: '测试',
    })

    expect(projectCurrentPlayerStates(after)[3].drunk).toBe(!seat.drunk)
  })
})

describe('魔典写入的四个字段真的落进了归档', () => {
  it('carries ops, origin, batchId and backfill through to the timeline entry', () => {
    // 它们此前被唯一的 entry 构造处静默丢弃：action 类型宣告接受，实际一个都没写进去。
    // 没有任何类型错误或测试会发现，而「补录归属靠 backfill」这条验收就此永远不成立。
    const before = createPrototypeGameSession()
    const seat = projectCurrentPlayerStates(before)[3]
    const after = gameSessionReducer(before, {
      type: 'confirm-player-state-change',
      seatId: 3,
      expectedBefore: seat,
      after: { ...seat, life: 'dead' },
      segmentId: null,
      entryId: 'probe-ops',
      confirmedAt: NOW,
      reason: '测试',
      ops: [{ op: 'life_set', seatId: 3, life: 'dead' }],
      origin: 'grimoire',
      batchId: 'batch-1',
      backfill: { attributedPhaseSegmentId: 'night-2' },
    })

    expect(after.timeline.find((entry) => entry.id === 'probe-ops')).toMatchObject({
      ops: [{ op: 'life_set', seatId: 3, life: 'dead' }],
      origin: 'grimoire',
      batchId: 'batch-1',
      backfill: { attributedPhaseSegmentId: 'night-2' },
    })
  })

  it('writes no empty keys on the old path', () => {
    // 直接赋值而非条件展开的话，每一条历史记录都会多出四个 undefined 键。
    const before = createPrototypeGameSession()
    const seat = projectCurrentPlayerStates(before)[3]
    const after = gameSessionReducer(before, {
      type: 'confirm-player-state-change',
      seatId: 3,
      expectedBefore: seat,
      after: { ...seat, poisoned: !seat.poisoned },
      segmentId: null,
      entryId: 'probe-plain',
      confirmedAt: NOW,
      reason: '测试',
    })

    const entry = after.timeline.find((item) => item.id === 'probe-plain')!
    for (const key of ['ops', 'origin', 'batchId', 'backfill']) {
      expect(Object.hasOwn(entry, key), `旧路径不该写出 ${key} 键`).toBe(false)
    }
  })
})
