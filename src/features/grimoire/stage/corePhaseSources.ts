/**
 * 核的五个相位数据源。
 *
 * 这里全是**投影**，一个 dispatch 都没有：核是观察面，喂给它的数字只走渲染路径。
 * 裁决 10 的原话是「三个算式采纳但只出现在渲染路径，禁止任何算式结果进入 dispatch 的 payload」——
 * 把这些函数集中在一个没有 action 类型、没有 dispatch 形参的模块里，
 * 是让那条裁决在文件级别成为结构事实，而不是靠每个调用点自觉。
 *
 * 尽量复用既有投影（projectDawnReport / voteRound 的门槛算式 / voteDraftForSession /
 * createNextNightRun），只有两处不得不自己算，各自在函数上写明了原因。
 */
import { createNextNightRun } from '../../game-session/state/createNextNightRun'
import { projectDawnReport } from '../../game-session/state/projectDawnReport'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { voteDraftForSession } from '../../day-workbench/state/dayDraft'
import { hasVoteRoundDraftContent } from '../../day-workbench/state/voteRound'
import type { DiscussionStage, DiscussionTimerContextValue } from '../../day-workbench/state/discussionTimerTypes'
import type { DeckNode } from '../../hosting-deck/deckNode'
import type { GameSessionState } from '../../game-session/types'
import type {
  GrimoireCorePhase,
  GrimoireDawnRoll,
  GrimoireDayTimer,
  GrimoireDuskBrief,
  GrimoireNightCursor,
  GrimoireVoteTally,
  NightCursorItem,
} from '../core/corePhase'

/**
 * 主持台节点 → 核的相位。
 *
 * 白天分两态：一旦本轮票型草稿里有内容就换成计票读数。用草稿有没有内容而不是
 * 「白天走到第几步」来判，是因为步骤本身是 DayWorkbench 的本地 UI 态，
 * 核读不到也不该读——核跟着**对局里已经存在的东西**走。
 */
export function corePhaseFor(node: DeckNode, session: GameSessionState): GrimoireCorePhase {
  if (node === 'night') return 'night'
  if (node === 'dawn') return 'dawn'
  if (node === 'day') return hasVoteRoundDraftContent(voteDraftForSession(session)) ? 'day-vote' : 'day-timer'
  // 还没配过板的空局停在底座：黄昏是「上一天结论 + 本夜队列」，这两样此刻都不存在。
  return session.playerCount > 0 ? 'dusk' : 'idle'
}

/** 队列里还没有结论的项。confirmed/skipped/not_applicable 都算已经过去了。 */
const UNRESOLVED_PROGRESS = new Set(['pending', 'draft', 'deferred'])

export interface NightCursorSource {
  cursor: GrimoireNightCursor
  /** 「本夜待处理」那一格。 */
  pendingCount: number
}

function cursorItemOf(item: { seatId: number; roleName: string; roleInitial: string; iconPath: string } | undefined): NightCursorItem | null {
  if (!item) return null
  return {
    seatId: item.seatId,
    role: { name: item.roleName, initial: item.roleInitial, imageSrc: item.iconPath },
  }
}

/**
 * 夜序光标：当前 / 下一位 / 上一位座位号 + 本夜待处理数。
 *
 * 刻意不接 onStepBack / onStepForward。光标真值在夜间工作台的状态机里，
 * 从核里推它要走一次 commit-night-workbench——那是写入路径，本批（G1）画布内零 dispatch。
 * 不接的后果只是核上那两枚 ‹ › 保持禁用；抽屉里的转盘仍能翻页，功能没有丢。
 */
export function projectNightCursor(session: GameSessionState): NightCursorSource | null {
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  if (!run || run.queue.length === 0) return null

  const index = run.queue.findIndex((item) => item.id === run.activeCursorId)
  // 光标 id 对不上队列时按队首处理，而不是渲染一个空核：夜里最贵的信息是「现在叫谁」。
  const at = index === -1 ? 0 : index

  return {
    cursor: {
      current: cursorItemOf(run.queue[at]),
      next: cursorItemOf(run.queue[at + 1]),
      previousSeatId: run.queue[at - 1]?.seatId ?? null,
    },
    pendingCount: run.queue.filter((item) => UNRESOLVED_PROGRESS.has(item.progress)).length,
  }
}

const STAGE_LABEL: Record<DiscussionStage, string> = { private: '私聊', public: '公聊' }

/**
 * mm:ss 的秒数。
 *
 * 从 currentLabel 反解而不是另读一份计时状态：DiscussionTimerContextValue 只透出
 * 格式化后的标签，而 StageTimerState 是 Provider 的私有 state。再读一次 localStorage
 * 会长出第二个时钟，它按自己的节奏 tick，于是同一屏上白天工作台和核会显示两个不同的时间——
 * 那比不显示时间更糟。
 */
export function discussionRemainingSeconds(currentLabel: string, hasElapsed: boolean): number | null {
  if (hasElapsed) return 0
  const matched = /^(\d+):([0-5]\d)$/.exec(currentLabel.trim())
  if (!matched) return null
  return Number(matched[1]) * 60 + Number(matched[2])
}

/**
 * 白天计时读数。
 *
 * nominationsOpen 三态而不是布尔：计时器没跑过的时候工具**不知道**能不能提名，
 * 猜一个 false 会渲染成「尚不可提名」——一句说书人没说过的话。
 */
export function projectDayTimer(timer: DiscussionTimerContextValue): GrimoireDayTimer {
  return {
    remainingSeconds: discussionRemainingSeconds(timer.currentLabel, timer.hasElapsed),
    phaseName: STAGE_LABEL[timer.activeStage],
    nominationsOpen: timer.hasElapsed
      ? timer.activeStage === 'public'
      : timer.isRunning ? false : null,
  }
}

/**
 * 举手 N / 门槛 M / 差 X 的输入。
 * 三个数由 VoteTallyReadout 在渲染里算，这里只负责把「举手了几个」和「门槛是多少」摆出来。
 */
export function projectVoteTally(session: GameSessionState): GrimoireVoteTally {
  const draft = voteDraftForSession(session)
  // 草稿一片空白时不是「0 票」而是「还没开始计票」，两者显示成同一个 0 会让说书人
  // 以为自己已经点过一轮了。
  const started = hasVoteRoundDraftContent(draft)
  return {
    raised: started ? new Set(draft.raisedSeatIds).size : null,
    threshold: draft.threshold,
    nomineeSeatId: draft.nomineeSeatId,
  }
}

function lastClosedDayOutcome(session: GameSessionState): string | null {
  const day = [...session.phaseSegments]
    .filter((segment) => segment.kind === 'day' && segment.closedAt)
    .sort((left, right) => left.sequence - right.sequence)
    .at(-1)
  if (!day) return null

  const outcome = session.timeline
    .filter((entry) => entry.segmentId === day.id && (entry.kind === 'execution' || entry.kind === 'no_execution'))
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
    .at(-1)
  if (!outcome) return null
  if (outcome.kind !== 'execution') return `${day.label} · 无处决`
  if (outcome.executedSeatId === undefined) return `${day.label} · 处决结论缺席位`
  // 只写座位号，不写角色名也不写昵称：核是全屏最容易被玩家瞄到的一块。
  return `${day.label} · 处决 ${outcome.executedSeatId}号${outcome.causedDeath === false ? '（未死亡）' : ''}`
}

/**
 * 黄昏简报：上一天结论回执 + 本夜队列预览。
 *
 * 队列预览用 createNextNightRun 现算，因为黄昏这一刻下一夜的 NightRunState 还不存在
 * （它在「开始第 N 夜」按下去时才建）。预览失败一律降级成空队列——黄昏的主任务是推门，
 * 不该因为一段预览把整块画布带崩。
 */
export function projectDuskBrief(session: GameSessionState): GrimoireDuskBrief {
  let nightQueue: string[] = []
  try {
    nightQueue = createNextNightRun(session)?.queue.map((item) => item.roleName) ?? []
  } catch {
    nightQueue = []
  }
  return { dayOutcome: lastClosedDayOutcome(session), nightQueue }
}

/**
 * 黎明点名：相对黄昏快照发生了变化的座位号。
 *
 * 差分的两端都只取**说书人已手改的玩家状态**，绝不由夜间技能结果反推谁该死——
 * 那是自动结算，是产品明确排除的（projectDawnReport 本身就守着这条）。
 *
 * 「没录过」与「平安夜」必须分开：都渲染成平安夜，会把一次漏记变成一条看起来很确定的假事实。
 */
export function projectDawnRoll(session: GameSessionState, nightSegmentId: string): GrimoireDawnRoll {
  const report = projectDawnReport(session, nightSegmentId)
  const deaths = report.changes.filter((change) => change.kind === 'died').map((change) => change.seatId)
  const revivals = report.changes.filter((change) => change.kind === 'revived').map((change) => change.seatId)
  if (report.changes.length > 0) return { deaths, revivals }

  const hasNightRecords = session.timeline.some(
    (entry) => entry.kind === 'night_action' && entry.segmentId === nightSegmentId,
  )
  // 有记录宣称了死亡却没人更新状态，或整夜一条记录都没有：两种情况下工具都不知道昨夜发生了什么。
  if (report.unappliedDeathHints > 0 || !hasNightRecords) return { deaths: null }
  return { deaths: [], revivals: [] }
}

/**
 * 幽灵票余量 = 死亡人数 − 已经用掉幽灵票的人数。
 *
 * 只数**已落账**的票型：草稿里的勾选还能被取消，把它算进余量会让这个数在说书人
 * 改主意时来回跳，而这一格是他用来判断「还能不能再来一轮」的。
 */
export function projectGhostVotesRemaining(session: GameSessionState): number {
  const dead = Object.values(projectCurrentPlayerStates(session)).filter((state) => state.life === 'dead').length
  const spent = new Set(session.timeline.flatMap((entry) => entry.kind === 'vote_round' ? entry.ghostVoteSeatIds : []))
  return Math.max(0, dead - spent.size)
}
