/**
 * 魔典完整度。
 *
 * 存在的理由是一条会说谎的文案：如果只看「有没有记过状态变更」，那么一局在桌面上
 * 配板、没在工具里录过身份的对局，切到魔典后会得到一圈空座位，而提示条却会说
 * 「身份齐全，只是还没录标记」。所以完整度必须分成两个互不推导的维度：
 *
 *   seatsWithRole / totalSeats —— 工具里知不知道谁是什么角色
 *   stateChangeCount           —— 工具里记没记过生死毒醉的变化
 *
 * 第一个维度为 0 时，问题不是「标记没录」而是「这局根本没在工具里配过板」，
 * 补救入口也不同：指向配板而不是状态补录。
 */
import type { GameSessionState } from '../../game-session/types'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../game-session/state/projectors'

export interface GrimoireCompleteness {
  seatsWithRole: number
  totalSeats: number
  stateChangeCount: number
  markerCount: number
}

/** 归档也用同一个函数：跨模式回看时的诚实条不能与实时提示条各算各的。 */
export function projectGrimoireCompleteness(session: GameSessionState): GrimoireCompleteness {
  // 没有身份的座位是**不在 assignments 里**，不是 role 为 null；
  // 而且要夹在 playerCount 内——缩减人数后旧配板里可能还留着已不存在的座位。
  const seatsWithRole = new Set(
    projectCurrentAssignments(session)
      .filter((assignment) => assignment.seatId >= 1 && assignment.seatId <= session.playerCount)
      .map((assignment) => assignment.seatId),
  ).size
  const states = Object.values(projectCurrentPlayerStates(session))
  return {
    seatsWithRole,
    totalSeats: session.playerCount,
    stateChangeCount: session.timeline.filter((entry) => entry.kind === 'player_state_changed').length,
    markerCount: states.reduce((total, state) => total + state.markers.length, 0),
  }
}

/** 覆盖度只由身份维度决定；标记记得再多也不能把「不知道谁是什么」补成 full。 */
export type GrimoireCoverage = 'none' | 'partial' | 'full'

export function grimoireCoverage({ seatsWithRole, totalSeats }: GrimoireCompleteness): GrimoireCoverage {
  if (totalSeats === 0 || seatsWithRole === 0) return 'none'
  return seatsWithRole >= totalSeats ? 'full' : 'partial'
}

export interface CompletenessNotice {
  tone: 'warning' | 'info' | 'success'
  message: string
  /** 补救动作指向哪里——身份缺失指向配板，状态缺失指向状态补录。 */
  action: 'setup' | 'state' | null
  actionLabel: string | null
}

export function completenessNotice(completeness: GrimoireCompleteness): CompletenessNotice {
  const { seatsWithRole, totalSeats, stateChangeCount, markerCount } = completeness

  if (totalSeats === 0) {
    return { tone: 'info', message: '还没有座位。确认配板后魔典才有内容。', action: 'setup', actionLabel: '去配板' }
  }

  if (seatsWithRole === 0) {
    return {
      tone: 'warning',
      message: `这局没有在工具里配过板——先补录 ${totalSeats} 个座位的身份，魔典才有内容。`,
      action: 'setup',
      actionLabel: '补录身份',
    }
  }

  if (seatsWithRole < totalSeats) {
    return {
      tone: 'warning',
      message: `${totalSeats} 个座位里有 ${totalSeats - seatsWithRole} 个还没有身份，魔典上会是空位。`,
      action: 'setup',
      actionLabel: '补齐身份',
    }
  }

  if (stateChangeCount === 0 && markerCount === 0) {
    return {
      tone: 'info',
      message: `${totalSeats} 个座位身份齐全，生死毒醉标记还没录过。`,
      action: 'state',
      actionLabel: '录入状态',
    }
  }

  return { tone: 'success', message: `${totalSeats} 个座位身份齐全，已记录 ${stateChangeCount} 次状态变更。`, action: null, actionLabel: null }
}
