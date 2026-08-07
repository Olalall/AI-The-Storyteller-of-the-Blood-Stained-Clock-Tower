/**
 * 「本日处决」角标的投影。
 *
 * 只读**已落账**的 execution 条目，绝不从票面暂列反推。暂列是算术，处决是说书人的一次
 * 显式动作（裁决 10：达标不自动处决）；把暂列画成处决，等于工具替他宣布了结果。
 *
 * 更正链按 projectEffectiveTimelineEntries 过一遍：被更正掉的那条处决不该继续在环上挂着，
 * 否则说书人改完记录抬眼一看，角标还在原来那个座位上。
 */
import { projectEffectiveTimelineEntries } from '../../game-session/state/projectTimelineHistory'
import type { ExecutionEntry, TimelineEntry } from '../../game-session/types'

export interface DayExecutionMark {
  seatId: number
  /**
   * 这次处决有没有造成死亡。false = 弄臣、魔鬼代言人这类活下来的处决。
   * 环上的帷幕跟着 PlayerState.life 走（GrimoireSeat 已经画了），不由这里补——
   * 给一个活着的人盖帷幕是**说了一句假话**，比少一层视觉强调严重得多。
   * 字段留在这里只供角标措辞用。
   */
  causedDeath: boolean
}

function isResolution(entry: TimelineEntry): entry is ExecutionEntry {
  return entry.kind === 'execution' || entry.kind === 'no_execution'
}

/**
 * 当前白天段里最后一条结论。
 * 「最后一条」而不是「第一条」：一天只该有一次结论，但记录被更正/补录时会出现两条，
 * 此时晚的那条才是说书人现在认的。
 */
export function projectDayExecutionMark(
  entries: readonly TimelineEntry[],
  daySegmentId: string | null,
): DayExecutionMark | null {
  if (!daySegmentId) return null

  const resolution = projectEffectiveTimelineEntries(entries)
    .filter((entry): entry is ExecutionEntry => entry.segmentId === daySegmentId && isResolution(entry))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
    .at(-1)

  if (!resolution || resolution.kind !== 'execution') return null
  if (resolution.executedSeatId === undefined) return null
  // 省略 causedDeath 的历史归档按 true 解读，与 ExecutionEntry 上写明的约定一致。
  return { seatId: resolution.executedSeatId, causedDeath: resolution.causedDeath !== false }
}
