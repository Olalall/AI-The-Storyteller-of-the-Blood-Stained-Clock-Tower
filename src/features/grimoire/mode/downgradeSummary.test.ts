import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { formatDowngradeSummary, projectDowngradeSummary } from './downgradeSummary'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'

function withState(session: GameSessionState, seatId: number, after: Partial<GameSessionState['initialPlayerStates'][number]>) {
  // 必须比对**当前**投影状态而不是初始状态：reducer 的乐观校验会拒绝
  // expectedBefore 对不上的变更，用 initialPlayerStates 会让第二次改动静默失效。
  const before = projectCurrentPlayerStates(session)[seatId]
  return gameSessionReducer(session, {
    type: 'confirm-player-state-change',
    seatId,
    expectedBefore: before,
    after: { ...before, ...after },
    segmentId: null,
    entryId: `t-${seatId}-${JSON.stringify(after)}`,
    confirmedAt: '2026-08-05T12:00:00.000Z',
    reason: '测试',
  })
}

/** 开发夹具出厂就带一个中毒的 3 号；这些用例要的是自己造的状态，先把它清掉。 */
function cleanBoard() {
  return withState(createPrototypeGameSession(), 3, { poisoned: false })
}

describe('降级交接清单', () => {
  it('lists nothing to copy on an untouched board', () => {
    expect(projectDowngradeSummary(cleanBoard()).isEmpty).toBe(true)
  })

  it('groups the non-default states by kind, seats in order', () => {
    let session = cleanBoard()
    session = withState(session, 7, { life: 'dead' })
    session = withState(session, 4, { life: 'dead' })
    session = withState(session, 3, { poisoned: true })

    const summary = projectDowngradeSummary(session)

    expect(summary.groups).toEqual([
      { label: '死亡', seats: ['4号', '7号'] },
      { label: '中毒', seats: ['3号'] },
    ])
  })

  it('spells out each marker with its label, not just a count', () => {
    // 这张清单的用途就是照着往实体魔典上摆；只说「5号有 2 条标记」抄不出来。
    const session = withState(cleanBoard(), 5, {
      markers: [{ id: 'm1', label: '僧侣保护' }, { id: 'm2', label: '已用死亡票' }],
    })

    const summary = projectDowngradeSummary(session)

    expect(summary.groups.find((group) => group.label === '标记')?.seats).toEqual([
      '5号「僧侣保护」',
      '5号「已用死亡票」',
    ])
  })

  it('omits a group entirely rather than showing it empty', () => {
    const session = withState(cleanBoard(), 2, { drunk: true })
    expect(projectDowngradeSummary(session).groups.map((group) => group.label)).toEqual(['醉酒'])
  })

  it('formats a copyable plain-text list', () => {
    let session = withState(cleanBoard(), 4, { life: 'dead' })
    session = withState(session, 3, { poisoned: true })

    expect(formatDowngradeSummary(projectDowngradeSummary(session)))
      .toBe('死亡 1 项：4号\n中毒 1 项：3号')
  })

  it('says so plainly when there is nothing to copy', () => {
    expect(formatDowngradeSummary({ groups: [], isEmpty: true })).toBe('当前没有任何非默认状态。')
  })
})
