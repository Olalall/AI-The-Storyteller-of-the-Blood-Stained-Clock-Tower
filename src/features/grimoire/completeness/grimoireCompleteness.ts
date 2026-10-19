/**
 * 魔典完整度。
 *
 * 存在的理由是一条会说谎的文案：如果只看「有没有记过状态变更」，那么一局在桌面上
 * 配板、没在工具里录过身份的对局，切到魔典后会得到一圈空座位，而提示条却会说
 * 「身份齐全，只是还没录标记」。所以完整度必须分成三个互不推导的维度：
 *
 *   seatsWithRole / totalSeats —— 工具里知不知道谁是什么角色
 *   stateChangeCount           —— 工具里**已经**记过几次生死毒醉的变化
 *   pendingStateHints          —— 记录里**宣称过**状态变化、却没有对应状态更新的条数
 *
 * 第三个维度与第二个语义相反，绝不能互相顶替。纯记录模式主持了三夜再切过来的
 * 典型局面里，stateChangeCount 是 0 而 pendingStateHints 是 9——把前者填进
 * 「有 N 条记录可能涉及状态变化」这句话，就会在最需要提示的那一刻渲染出
 * 「有 0 条记录可能涉及状态变化」，即提示条在唯一该说话的时候闭嘴了。
 *
 * 第一个维度为 0 时，问题不是「标记没录」而是「这局根本没在工具里配过板」，
 * 补救入口也不同：指向配板而不是状态补录。
 */
import type { GameSessionState, TimelineEntry } from '../../game-session/types'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { projectEffectiveTimelineEntries } from '../../game-session/state/projectTimelineHistory'

export interface GrimoireCompleteness {
  seatsWithRole: number
  totalSeats: number
  /** 已经落账的 player_state_changed 条数。 */
  stateChangeCount: number
  markerCount: number
  /**
   * 宣称了状态类结果、但找不到对应状态更新的记录条数。
   * 它是「还欠多少」，stateChangeCount 是「已经还了多少」，两者不可互换。
   */
  pendingStateHints: number
  /** 最早那条待核对记录所在的相位段标签，用来说「从第 1 夜到现在」。没有时为 null。 */
  pendingSince: string | null
  /**
   * 上面那个数字逐条摊开的样子，补录建议卡直接读它。
   *
   * 刻意与 pendingStateHints 出自**同一次**计算而不是另写一个投影：
   * 提示条说「有 9 条」而逐条核对只列出 7 张卡，说书人没有任何办法知道
   * 是另外两条不用管、还是补录漏了它们——而这正是他点进来要确认的事。
   */
  pendingStateHintList: readonly PendingStateHint[]
}

/** 一条「记录宣称过状态变化、却找不到对应状态更新」的欠账。 */
export interface PendingStateHint {
  /** 依据条目的 id，补录时进 backfill.sourceEntryId，让复盘能点回去看来源。 */
  entryId: string
  createdAt: string
  segmentId: string | null
  /** 这条记录点到的座位。空数组 = 记录里没有座位可对，只能算「可能」。 */
  seatIds: readonly number[]
  /** 命中的那个状态词，建议卡据此说「建议标记为死亡」还是「建议加中毒」。 */
  word: StateWord
  /** 记录自己的那句话，卡片上原样引用——建议的来源必须显式可见。 */
  summary: string
}

/**
 * 记录文本里出现这些词，就说明这条记录本身宣称了一次状态变化。
 *
 * 这是**提示**不是判定：工具绝不由这些词反推谁死了、谁中毒了（那是自动结算，
 * 是产品明确排除的）。它只把「这里可能有一笔没记」摆到说书人眼前，由他自己去看。
 * 同源思路见 projectDawnReport 的 unappliedDeathHints，只是这里跨整局而不是单夜。
 */
const STATE_WORDS = ['死亡', '死去', '处决', '中毒', '下毒', '醉酒', '复活'] as const

export type StateWord = (typeof STATE_WORDS)[number]

function firstStateWord(text: string): StateWord | null {
  return STATE_WORDS.find((word) => text.includes(word)) ?? null
}

function hintCandidateOf(entry: TimelineEntry): PendingStateHint | null {
  if (entry.kind === 'night_action') {
    const text = `${entry.summary} ${entry.record.snapshot.storytellerResult}`
    const word = firstStateWord(text)
    if (!word) return null
    return {
      entryId: entry.id,
      createdAt: entry.createdAt,
      segmentId: entry.segmentId,
      seatIds: entry.record.snapshot.targets,
      word,
      summary: entry.summary,
    }
  }
  if (entry.kind === 'day_action') {
    const text = `${entry.summary} ${entry.details.join(' ')}`
    const word = firstStateWord(text)
    if (!word) return null
    return {
      entryId: entry.id,
      createdAt: entry.createdAt,
      segmentId: entry.segmentId,
      seatIds: entry.targetSeatIds,
      word,
      summary: entry.summary,
    }
  }
  if (entry.kind === 'execution' && entry.executedSeatId !== undefined) {
    // 处决本身就是死亡宣告，不必再从文本里找词；causedDeath === false 是弄臣一类的
    // 「处决了但没死」，那种情况本来就不该产生状态更新，不算欠账。
    if (entry.causedDeath === false) return null
    return {
      entryId: entry.id,
      createdAt: entry.createdAt,
      segmentId: entry.segmentId,
      seatIds: [entry.executedSeatId],
      word: '处决',
      summary: `处决了 ${entry.executedSeatId}号`,
    }
  }
  return null
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
  // 被更正掉的记录不算欠账：它已经不是本局的有效事实，为它催一次补录是纯噪音。
  const effective = projectEffectiveTimelineEntries(session.timeline)
  const stateChanges = effective.filter((entry) => entry.kind === 'player_state_changed')

  const pending = effective
    .map(hintCandidateOf)
    .filter((candidate): candidate is PendingStateHint => candidate !== null)
    // 「有没有人管过」的判据是时序而不是段落：说书人常常在下一段才想起来补，
    // 只要那次补录发生在这条记录之后并落在同一个座位上，这笔账就算平了。
    .filter((candidate) => !stateChanges.some((change) => (
      change.kind === 'player_state_changed'
      && change.createdAt >= candidate.createdAt
      && candidate.seatIds.includes(change.seatId)
    )))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))

  const firstSegmentId = pending[0]?.segmentId ?? null
  return {
    seatsWithRole,
    totalSeats: session.playerCount,
    stateChangeCount: stateChanges.length,
    markerCount: states.reduce((total, state) => total + state.markers.length, 0),
    pendingStateHints: pending.length,
    pendingSince: firstSegmentId
      ? session.phaseSegments.find((segment) => segment.id === firstSegmentId)?.label ?? null
      : null,
    pendingStateHintList: pending,
  }
}

/** 覆盖度只由身份维度决定；标记记得再多也不能把「不知道谁是什么」补成 full。 */
export type GrimoireCoverage = 'none' | 'partial' | 'full'

export function grimoireCoverage({ seatsWithRole, totalSeats }: GrimoireCompleteness): GrimoireCoverage {
  if (totalSeats === 0 || seatsWithRole === 0) return 'none'
  return seatsWithRole >= totalSeats ? 'full' : 'partial'
}

/**
 * 提示条上的一个控件。
 *
 * 从单动作换成动作数组，是因为文档第 675 行的形态有三个控件而不是一个：
 * 两个主张（逐条核对 / 先这样）加一个右侧的「不再提示」。单动作模型下
 * 「先这样」只能被塞成「不点按钮」，而「不点」与「明确说了不用管」在
 * 提示条要不要再出现这件事上是两种行为。
 */
export type CompletenessActionId = 'setup' | 'review' | 'defer' | 'silence'

export interface CompletenessAction {
  id: CompletenessActionId
  label: string
}

export interface CompletenessNotice {
  tone: 'warning' | 'info' | 'success'
  /** 主句。「魔典已按配板生成 · 12 个座位身份齐全 · 生死毒醉标记还没录过」。 */
  message: string
  /** 破折号之后那半句。没有待核对记录时为 null——没有就不许编一个数字出来。 */
  detail: string | null
  actions: readonly CompletenessAction[]
}

function stateLine(stateChangeCount: number, markerCount: number) {
  return stateChangeCount === 0 && markerCount === 0
    ? '生死毒醉标记还没录过'
    : `已记录 ${stateChangeCount} 次状态变更`
}

export function completenessNotice(completeness: GrimoireCompleteness): CompletenessNotice {
  const { seatsWithRole, totalSeats, stateChangeCount, markerCount, pendingStateHints, pendingSince } = completeness

  if (totalSeats === 0) {
    return {
      tone: 'info',
      message: '还没有座位。确认配板后魔典才有内容。',
      detail: null,
      actions: [{ id: 'setup', label: '去配板' }],
    }
  }

  if (seatsWithRole === 0) {
    return {
      tone: 'warning',
      message: `这局没有在工具里配过板——先补录 ${totalSeats} 个座位的身份，魔典才有内容。`,
      detail: null,
      actions: [{ id: 'setup', label: '补录身份' }],
    }
  }

  if (seatsWithRole < totalSeats) {
    return {
      tone: 'warning',
      message: `${totalSeats} 个座位里有 ${totalSeats - seatsWithRole} 个还没有身份，魔典上会是空位。`,
      detail: null,
      actions: [{ id: 'setup', label: '补齐身份' }],
    }
  }

  const message = `魔典已按配板生成 · ${totalSeats} 个座位身份齐全 · ${stateLine(stateChangeCount, markerCount)}`

  if (pendingStateHints === 0) {
    // 没有欠账就不摆按钮：这块不是催办，什么都不缺的时候多一个按钮只会被点。
    return {
      tone: stateChangeCount === 0 && markerCount === 0 ? 'info' : 'success',
      message,
      detail: null,
      actions: [],
    }
  }

  return {
    tone: 'warning',
    message,
    // 「可能涉及」这个措辞是护栏：工具没有、也不该有能力断言这些记录一定改了状态。
    detail: `从${pendingSince ?? '开局'}到现在有 ${pendingStateHints} 条记录可能涉及状态变化`,
    actions: [
      { id: 'review', label: '逐条核对（约 1 分钟）' },
      { id: 'defer', label: '先这样，边走边补' },
      { id: 'silence', label: '不再提示' },
    ],
  }
}

/**
 * 说书人对提示条的处置。两个「关掉」刻意不是同一件事：
 * 「先这样，边走边补」是对**当前这一份欠账**说不用管，欠账变了还得再提一次；
 * 「不再提示」是对整条提示条说不用管，此后不再出现。
 * 合成一个布尔的话，第一种会永久闭嘴，而说书人只是想让它别挡着眼前这一步。
 */
export interface CompletenessDismissal {
  silenced: boolean
  /** 按下「先这样」那一刻的欠账条数。null = 没按过。 */
  deferredAtHints: number | null
}

export const NO_COMPLETENESS_DISMISSAL: CompletenessDismissal = { silenced: false, deferredAtHints: null }

export function isCompletenessVisible(
  notice: CompletenessNotice,
  completeness: GrimoireCompleteness,
  dismissal: CompletenessDismissal,
): boolean {
  if (dismissal.silenced) return false
  // 没有任何动作可做时这条就没有内容。挂一行「一切正常」在画布顶上，
  // 会让说书人每局都先扫一遍它再确认没事——那是纯粹的注意力税。
  if (notice.actions.length === 0) return false
  if (dismissal.deferredAtHints === null) return true
  return completeness.pendingStateHints !== dismissal.deferredAtHints
}
