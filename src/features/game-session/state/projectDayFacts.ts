import type { GameSessionState } from '../types'
import { projectCurrentAssignments } from './projectors'

export interface DayFacts {
  /** 事实所属的白天段标签，例如「第3天」。没有已发生的白天时为 null。 */
  dayLabel: string | null
  /** 「7号（造成死亡）」「7号（未造成死亡）」；无处决时为 null。 */
  execution: string | null
  /** 「3→7」这样的提名对。 */
  nominations: readonly string[]
  /** 白天公开宣告与公开技能的一句话摘要。 */
  publicEvents: readonly string[]
}

/**
 * 汇总最近一个白天段里已确认的客观事实，供回溯型角色的唤醒卡就地查阅。
 *
 * 只陈述发生过什么，不做任何判断或建议：说书人可能因为红鲱鱼、登记异常或
 * 中毒醉酒而得出与字面事实不同的结论，工具替他推一步就会越界。
 * 因此这里不出现任何建议动词，也不返回「应该看谁」之类的字段。
 */
export function projectDayFacts(session: GameSessionState): DayFacts | null {
  const day = [...session.phaseSegments]
    .filter((segment) => segment.kind === 'day')
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .at(-1)
  if (!day) return null

  const entries = session.timeline.filter((entry) => entry.segmentId === day.id)
  const assignments = new Map(projectCurrentAssignments(session).map((item) => [item.seatId, item.role.name]))

  let execution: string | null = null
  for (const entry of entries) {
    if (entry.kind === 'execution' && entry.executedSeatId !== undefined) {
      const role = assignments.get(entry.executedSeatId)
      const died = entry.causedDeath ?? true
      execution = `${entry.executedSeatId}号${role ? `（${role}）` : ''}${died ? ' · 造成死亡' : ' · 未造成死亡'}`
    }
    if (entry.kind === 'no_execution') execution = '无处决'
  }

  const nominations = entries
    .filter((entry) => entry.kind === 'vote_round')
    .map((entry) => entry.kind === 'vote_round' ? `${entry.nominatorSeatId}→${entry.nomineeSeatId}` : '')
    .filter(Boolean)

  const publicEvents = entries
    .filter((entry) => entry.kind === 'day_action')
    .map((entry) => (entry.kind === 'day_action' ? entry.summary : ''))
    .filter(Boolean)

  return { dayLabel: day.label, execution, nominations, publicEvents }
}

/**
 * 回溯型角色：它们的结算需要回看白天发生的客观事实。
 * 名单出自百科《回溯型能力》与《夜晚行动顺序一览》其他夜晚各条目。
 */
export const RETROSPECTIVE_ROLE_IDS: ReadonlySet<string> = new Set([
  'undertaker',   // 送葬者：今天被处决者的角色
  'juggler',      // 杂耍艺人：首个白天的猜测结果
  'gossip',       // 造谣者：白天的公开陈述
  'flowergirl',   // 卖花女孩：恶魔今天是否投过票
  'towncrier',    // 城镇公告员：今天是否有爪牙提名
  'tixingguan',   // 提刑官
  'moonchild',    // 月之子：得知死亡后公开选择的目标
])

/**
 * 事实条是否应当出现。三个条件缺一不可，且遮蔽态优先于一切——
 * 秘密内容必须整块不进 DOM，不能只靠 CSS 隐藏。
 */
export function shouldShowDayFacts(
  roleId: string,
  concealed: boolean,
  facts: DayFacts | null | undefined,
): boolean {
  if (concealed || !facts) return false
  if (!RETROSPECTIVE_ROLE_IDS.has(roleId)) return false
  return Boolean(facts.execution || facts.nominations.length || facts.publicEvents.length)
}
