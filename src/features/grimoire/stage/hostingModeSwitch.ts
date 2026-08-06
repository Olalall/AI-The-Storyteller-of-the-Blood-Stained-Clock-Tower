/**
 * 模式切换的两条纯规则。
 *
 * 裁决 7：取消顶栏切换键，入口只有两处——core 顶行的本局信息浮层，与档案页的主持设置。
 * 两处共用这里的判据，否则「哪一次切换要过交接卡」会在两个入口上各写一遍，
 * 迟早有一处漏掉，而漏掉的那一次正是数据看起来凭空消失的那一次。
 */
import type { GameSessionState, HostingMode } from '../../game-session/types'

/**
 * 降级（魔典 → 纯记录）必须先过一次交接卡；升级零摩擦。
 *
 * 不对称是故意的：降级在数据层绝对安全（一个字段都不删），风险是认知性的——
 * 说书人切回去后仍以为工具在替他记，于是实体魔典和工具两边都空。
 * 从未选过模式（undefined）时选纯记录不算降级：那本来就是它的默认形态，没有东西需要交接。
 */
export function needsDowngradeHandoff(from: HostingMode | undefined, to: HostingMode): boolean {
  return from === 'grimoire' && to === 'record'
}

/**
 * 写进 hostingModeHistory 的相位标签。
 *
 * 归档回看要能说出「这局前两夜是纯记录、第三夜起才开了魔典」，没有这个标签，
 * 前两夜的空白会被误读成「说书人什么都没管」。
 */
export function hostingPhaseLabel(session: GameSessionState): string {
  const open = [...session.phaseSegments]
    .filter((segment) => !segment.closedAt)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .at(-1)
  if (open) return open.label

  const last = [...session.phaseSegments]
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .at(-1)
  // 段落之间（例如黄昏）也要能说清位置：「第2天后」比一个空字符串或「未知」有用得多。
  return last ? `${last.label}后` : '开局前'
}
