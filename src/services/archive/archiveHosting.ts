/**
 * 归档卡片上的模式标签，以及被模式标注顺手修掉的一处误导。
 *
 * 纯函数，不碰存储：归档列表、复盘详情、跨模式回看的诚实条都读同一份判断，
 * 三处各写一遍的话，同一局会在列表里显示「魔典局」、在详情里显示「笔录局」。
 */
import type { HostingMode, HostingModeChange } from '../../features/game-session/types'
import type { GameArchiveRecord } from './types'

export type ArchiveHostingTagId = HostingMode | 'mixed'

export interface ArchiveHostingTag {
  id: ArchiveHostingTagId
  /** 卡片上那枚小标签：「魔典局」「笔录局」「混合 · 第3夜起开魔典」。 */
  label: string
  /** 详情里的整句轨迹；只有混合局才有。 */
  detail: string | null
}

const MODE_NOUN: Record<HostingMode, string> = { grimoire: '魔典', record: '笔录' }

function switchPhrase(change: HostingModeChange): string {
  return change.mode === 'grimoire'
    ? `${change.phaseLabel}起开魔典`
    : `${change.phaseLabel}起改回笔录`
}

/**
 * 一局只出现过一种模式时不叫「混合」。
 *
 * 判据取「历史里出现过的模式」并上「最终模式」，而不是「有没有切换记录」：
 * 开局前显式选一次魔典也会写进 hostingModeHistory，若按「有记录=切换过」判，
 * 每一局全程魔典的对局都会被标成混合，标签也就失去了它唯一的用处。
 */
export function archiveHostingTag(record: Pick<GameArchiveRecord, 'hostingMode' | 'hostingModeHistory'>): ArchiveHostingTag {
  const history = record.hostingModeHistory ?? []
  const modes = new Set<HostingMode>([record.hostingMode, ...history.map((change) => change.mode)])

  if (modes.size <= 1) {
    return { id: record.hostingMode, label: `${MODE_NOUN[record.hostingMode]}局`, detail: null }
  }

  // 取「最后一次切进当前模式」而不是「第一次切到魔典」：来回切过的局里，
  // 只有最后那一次才说得出「从这里到终局是什么样」，而那正是回看的人要知道的。
  const settled = [...history].reverse().find((change) => change.mode === record.hostingMode)
  const tail = settled ? ` · ${switchPhrase(settled)}` : ''
  return {
    id: 'mixed',
    label: `混合${tail}`,
    detail: history.map(switchPhrase).join(' → '),
  }
}

export interface ArchiveLifeSummary {
  /** false = 这局一次状态变更都没录过，摘要里的存活/死亡只是建局初值的回声。 */
  recorded: boolean
  aliveLabel: string
  deadLabel: string
}

/**
 * 「存活 12 / 死亡 0」在一局没录过状态的对局里是假的。
 *
 * 那两个数字来自 projectCurrentPlayerStates，而它在没有任何 player_state_changed 时
 * 原样返回建局初值——全员存活。于是一局死了六个人的对局，会因为说书人当时在实体魔典上
 * 记生死而在战绩里显示「无人死亡」。数字本身没错，错在它假装自己是对局事实。
 */
export function archiveLifeSummary(record: Pick<GameArchiveRecord, 'summary' | 'grimoireCompleteness'>): ArchiveLifeSummary {
  if (record.grimoireCompleteness.stateChangeCount === 0) {
    return { recorded: false, aliveLabel: '未录入', deadLabel: '未录入' }
  }
  return {
    recorded: true,
    aliveLabel: String(record.summary.alive),
    deadLabel: String(record.summary.dead),
  }
}
