import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import type { NightSeatSnapshot } from '../../features/night-workbench/types'
import { aiContextLevelForCoverage, nightContextLevel, sessionContextLevel, unknownSeatIds } from './aiContextLevel'

function seat(seatId: number, roleId: string | null): NightSeatSnapshot {
  return {
    seatId,
    playerLabel: `${seatId}号`,
    nickname: `玩家${seatId}`,
    role: roleId ? { id: roleId, name: roleId, initial: roleId[0], iconPath: `/assets/characters/${roleId}.webp` } : null,
    status: { life: 'alive', impairments: [], markers: [] },
  }
}

function seatSource(playerCount: number, knownSeatIds: readonly number[]) {
  const seatSnapshots: Record<number, NightSeatSnapshot> = {}
  for (let seatId = 1; seatId <= playerCount; seatId += 1) {
    seatSnapshots[seatId] = seat(seatId, knownSeatIds.includes(seatId) ? 'washerwoman' : null)
  }
  return { playerCount, seatSnapshots }
}

describe('aiContextLevelForCoverage', () => {
  /*
   * partial 归 minimal，是这个函数唯一有争议的一格。
   * 违反的后果：请求体里缺席的座位没有任何标记，standard 等于告诉模型「这就是全部局面」，
   * 它会在一份看不出缺口的棋盘上给出自信且错的结论。
   */
  it('maps partial down to minimal, not up to standard', () => {
    expect(aiContextLevelForCoverage('full')).toBe('standard')
    expect(aiContextLevelForCoverage('partial')).toBe('minimal')
    expect(aiContextLevelForCoverage('none')).toBe('minimal')
  })
})

describe('unknownSeatIds', () => {
  /*
   * 提示词要点名座位，所以这里必须给出座位号本身而不是一个计数。
   * 违反的后果：模型只能回一句「信息不全」，说书人既不知道补什么，
   * 也无法判断这次拒答是不是模型在偷懒。
   */
  it('lists the seats the tool has no role for, ascending', () => {
    expect(unknownSeatIds(seatSource(5, [1, 3, 5]))).toEqual([2, 4])
    expect(unknownSeatIds(seatSource(3, [1, 2, 3]))).toEqual([])
  })

  /* 座位快照整条缺失（不只是 role 为 null）同样算未知。 */
  it('counts a missing snapshot as unknown', () => {
    expect(unknownSeatIds({ playerCount: 3, seatSnapshots: { 1: seat(1, 'chef') } })).toEqual([2, 3])
  })
})

describe('nightContextLevel', () => {
  /*
   * 全员身份齐全才升到 standard。
   * 违反的后果：少一个座位就当成完整局面，而那个座位可能正是中了毒的人。
   */
  it('only reaches standard when every seat has a role', () => {
    expect(nightContextLevel(seatSource(4, [1, 2, 3, 4]))).toBe('standard')
    expect(nightContextLevel(seatSource(4, [1, 2, 3]))).toBe('minimal')
    expect(nightContextLevel(seatSource(4, []))).toBe('minimal')
  })
})

describe('sessionContextLevel', () => {
  /*
   * 走的是 grimoireCoverage 同一套投影，而不是 AI 侧另算一遍。
   * 违反的后果：完整度提示条对说书人说「身份齐全」，AI 那边却仍按知情不全追问，
   * 两个数字都对不上任何一个人的直觉。
   */
  it('derives from the same projection the completeness bar uses', () => {
    const session = createPrototypeGameSession()

    expect(sessionContextLevel(session)).toBe('standard')
    expect(sessionContextLevel({ ...session, playerCount: session.playerCount + 1 })).toBe('minimal')
  })
})
