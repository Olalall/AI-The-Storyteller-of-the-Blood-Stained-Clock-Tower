/**
 * 降级交接清单：切回纯记录之前，把工具里现有的全部非默认状态摊开给说书人抄。
 *
 * 降级在数据层是绝对安全的——role/life/poisoned/drunk/markers 一个字段都不删，
 * 切回来全部还在。真正的风险是认知性的：说书人切回纯记录后可能仍以为工具在替他记，
 * 于是既没在实体魔典上补、也没在工具里点，两边都空。
 *
 * 所以两个方向的摩擦是**不对称的**：升级（记录 → 魔典）一点即可，
 * 降级要一次二次确认外加这张清单。
 */
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import type { GameSessionState } from '../../game-session/types'

export interface DowngradeGroup {
  /** 「死亡」「中毒」「醉酒」「标记」。 */
  label: string
  seats: readonly string[]
}

export interface DowngradeSummary {
  groups: readonly DowngradeGroup[]
  /** 一条非默认状态都没有时，这张卡就没有清单可列——但仍要确认。 */
  isEmpty: boolean
}

export function projectDowngradeSummary(session: GameSessionState): DowngradeSummary {
  const states = projectCurrentPlayerStates(session)
  const seatIds = Object.keys(states).map(Number).sort((left, right) => left - right)

  const dead: string[] = []
  const poisoned: string[] = []
  const drunk: string[] = []
  const markers: string[] = []

  for (const seatId of seatIds) {
    const state = states[seatId]
    if (state.life === 'dead') dead.push(`${seatId}号`)
    if (state.poisoned) poisoned.push(`${seatId}号`)
    if (state.drunk) drunk.push(`${seatId}号`)
    // 标记逐条列出并带 label：这张清单的用途就是照着往实体魔典上摆，
    // 只说「5号有 2 条标记」抄不出来。
    for (const marker of state.markers) markers.push(`${seatId}号「${marker.label}」`)
  }

  const groups = [
    { label: '死亡', seats: dead },
    { label: '中毒', seats: poisoned },
    { label: '醉酒', seats: drunk },
    { label: '标记', seats: markers },
  ].filter((group) => group.seats.length > 0)

  return { groups, isEmpty: groups.length === 0 }
}

/** 「复制清单」按钮的输出。纯文本，便于粘进任何地方。 */
export function formatDowngradeSummary(summary: DowngradeSummary): string {
  if (summary.isEmpty) return '当前没有任何非默认状态。'
  return summary.groups
    .map((group) => `${group.label} ${group.seats.length} 项：${group.seats.join(' ')}`)
    .join('\n')
}
