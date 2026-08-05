import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { SNAPSHOT_SLOTS } from './snapshotRotation'
import type { GameSessionState } from '../../features/game-session/types'

/**
 * 耐久性闸门的第三条验收：实测一局 300 次操作的 JSON 体积并记录在案。
 *
 * 记录它的意义不是「现在够小」，而是给 G2 一个可对比的基线：
 * G2 会往每次手势上挂一条 GrimoireOp，届时这个数字的增长必须解释得清。
 */
function playThreeHundredOperations(): GameSessionState {
  let session = createPrototypeGameSession()
  for (let index = 0; index < 300; index += 1) {
    const seatId = (index % 12) + 1
    const before = session.initialPlayerStates[seatId]
    session = gameSessionReducer(session, {
      type: 'confirm-player-state-change',
      seatId,
      expectedBefore: before,
      after: { ...before, poisoned: index % 2 === 0 },
      segmentId: null,
      entryId: `bulk-${index}`,
      confirmedAt: new Date(Date.parse('2026-08-05T12:00:00.000Z') + index * 1000).toISOString(),
      reason: `批量操作 ${index}`,
    })
  }
  return session
}

describe('归档体积基线', () => {
  it('stays within a budget that leaves room for five snapshots', () => {
    const session = playThreeHundredOperations()
    const bytes = JSON.stringify(session).length
    const total = bytes * (SNAPSHOT_SLOTS + 1)

    // 记录在案（2026-08-05 实测）：300 次状态变更后单份 20.6KB，
    // 主副本 + 5 份快照共 123KB，远低于 localStorage 常见的 5MB 上限。
    // 上限设成实测值的两倍：宽到不会被正常改动误伤，紧到能抓住数量级的回归。
    expect(bytes).toBeLessThan(42_000)
    expect(total).toBeLessThan(260_000)
    console.log(`[归档体积] 300 次操作后单份 ${(bytes / 1024).toFixed(1)}KB，含 ${SNAPSHOT_SLOTS} 份快照共 ${(total / 1024).toFixed(1)}KB`)
  })

  it('grows roughly linearly rather than quadratically in the timeline', () => {
    // 二次增长会在一局中途撞上配额；线性才有预算可言。
    let session = createPrototypeGameSession()
    const sizeAt: number[] = []
    for (let index = 0; index < 200; index += 1) {
      const seatId = (index % 12) + 1
      const before = session.initialPlayerStates[seatId]
      session = gameSessionReducer(session, {
        type: 'confirm-player-state-change',
        seatId,
        expectedBefore: before,
        after: { ...before, drunk: index % 2 === 0 },
        segmentId: null,
        entryId: `growth-${index}`,
        confirmedAt: new Date(Date.parse('2026-08-05T12:00:00.000Z') + index * 1000).toISOString(),
        reason: '增长测量',
      })
      if (index === 99 || index === 199) sizeAt.push(JSON.stringify(session).length)
    }

    const [atHundred, atTwoHundred] = sizeAt
    expect(atTwoHundred / atHundred).toBeLessThan(2.2)
  })
})
