/**
 * contextLevel 的唯一推导处。
 *
 * 在这之前三个 build 函数各自硬编码 'minimal'，server 端一处都不读——那等于这个字段
 * 只存在于类型里。接通它要同时改两头：这里负责「工具到底知道多少」，
 * server 的 promptBuilder / provider 负责「知道得不全时行为要不一样」。
 * 只改这一头会得到一份从 minimal 变 standard 的单测，而线上一个字节都不会变。
 */
import { grimoireCoverage, projectGrimoireCompleteness, type GrimoireCoverage } from '../../features/grimoire/completeness/grimoireCompleteness'
import type { GameSessionState } from '../../features/game-session/types'
import type { NightWorkbenchState } from '../../features/night-workbench/types'
import type { AIContextLevel } from './types'

/**
 * coverage 三档压到 contextLevel 两档，partial 归 minimal。
 *
 * 为什么不是 standard：请求体里没有「7 号身份未知」这一行，只是不出现 7 号。
 * 给 partial 发 standard，等于告诉模型「这就是全部局面」，而它拿到的是一份缺了几个座位
 * 却看不出缺口的棋盘——推出来的结论会自信且错，而说书人无从分辨。反过来低估只会让模型
 * 多问一句「3、7 号是谁」，多问一句是可恢复的，答错一次不是。
 *
 * 裁决 12 也把 partial 与 none 绑在同一侧：只有身份维度能升档，
 * stateChangeCount 再多也不行——记过一百次中毒也不代表工具知道谁是什么角色。
 */
export function aiContextLevelForCoverage(coverage: GrimoireCoverage): AIContextLevel {
  return coverage === 'full' ? 'standard' : 'minimal'
}

export function sessionContextLevel(session: GameSessionState): AIContextLevel {
  return aiContextLevelForCoverage(grimoireCoverage(projectGrimoireCompleteness(session)))
}

type SeatSource = Pick<NightWorkbenchState, 'playerCount' | 'seatSnapshots'>

/** 工具里还不知道身份的座位号，升序。给提示词点名用——「未列出等于未知」需要有名字可点。 */
export function unknownSeatIds({ playerCount, seatSnapshots }: SeatSource): number[] {
  const unknown: number[] = []
  for (let seatId = 1; seatId <= playerCount; seatId += 1) {
    if (!seatSnapshots[seatId]?.role) unknown.push(seatId)
  }
  return unknown
}

/**
 * 夜间路径手里只有 NightWorkbenchState，没有 GameSessionState，但 seatSnapshots 正是
 * 由 session 投影出的身份维度，判档所需的信息量与 projectGrimoireCompleteness 等价。
 *
 * 另外几维填 0 / null，因为 grimoireCoverage 按裁决 12 只看身份两维。这里刻意写成
 * 完整的对象字面量而不是断言：GrimoireCompleteness 将来加维度时这一行会编译失败，
 * 而那正是需要有人停下来判断「新维度要不要影响 contextLevel」的时刻。
 */
export function nightContextLevel(state: SeatSource): AIContextLevel {
  const totalSeats = state.playerCount
  const seatsWithRole = totalSeats - unknownSeatIds(state).length
  return aiContextLevelForCoverage(grimoireCoverage({
    seatsWithRole,
    totalSeats,
    stateChangeCount: 0,
    markerCount: 0,
    pendingStateHints: 0,
    pendingSince: null,
    pendingStateHintList: [],
  }))
}
