/**
 * 把白天的环接上去的那一根线。
 *
 * 主控只需要问它三件事：此刻点座位等于什么（onSelectSeat）、环上该画什么（overlay 的四组 props）、
 * token 的可访问名后缀是什么（actionHint）。除此之外它不暴露任何东西，
 * 尤其**不暴露任何算术结果**——举手 N / 门槛 M / 差 X 三个数在核里由 VoteTallyReadout
 * 从 projectVoteTally 现算，这里一个都不转手，免得有人顺手把它们塞进 payload（裁决 10）。
 *
 * 这里唯一的写入是 set-day-vote-draft：它只动票型草稿，不产生 timeline 条目、
 * 不改任何 PlayerState，所以 G2 的不变量测试 B（非 confirm-player-state-change 的 action
 * 前后 projectCurrentPlayerStates 深等）在这条路径上天然成立，并有单测钉着。
 *
 * 相位一步都不推：环上没有「开始白天」「结束白天」。处决与无处决仍然是抽屉里
 * 那条单列步骤序列的显式动作（守门规则 grimoire-no-phase-dispatch 也在盯着）。
 */
import { useCallback, useMemo } from 'react'
import { projectDayExecutionMark, type DayExecutionMark } from './executionMark'
import { voteRingBadges, type VoteRingBadge } from './voteRingBadges'
import {
  DAY_RING_ACTION_HINT,
  applyDayRingTap,
  applyGhostVoteTap,
  dayRingIntentFor,
  type DayRingIntent,
} from './dayRingIntent'
import { useDayRingFocus } from '../../day-workbench/state/dayRingFocus'
import { projectDayStepContext } from '../../day-workbench/state/dayStep'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { GameSessionState } from '../../game-session/types'

export interface DayRingBinding {
  intent: DayRingIntent
  /** 进 token 可访问名的后缀，让读屏也知道此刻点下去等于什么。 */
  actionHint: string
  /** 已举手的座位。与抽屉里的 SeatButton 共用同一套选中态契约，不另起语义。 */
  selectedSeatIds: readonly number[]
  nominatorSeatId: number | null
  nomineeSeatId: number | null
  emphasis: 'active' | 'settled'
  badges: readonly VoteRingBadge[]
  execution: DayExecutionMark | null
  /** null = 这一步环上不写票型；主控此时应退回既有的座位操作浮层。 */
  onSelectSeat: ((seatId: number) => void) | null
  /** null = 白天只读，死亡票 chip 退成不可点的展示态。 */
  onConfirmGhostVote: ((seatId: number) => void) | null
}

export interface UseDayRingInput {
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  /** 环上的座位号，顺序与环一致。 */
  seatIds: readonly number[]
  /** 只有停在白天节点时环才承载白天语义；别的相位一律 none。 */
  active: boolean
}

export function useDayRing({ session, dispatch, seatIds, active }: UseDayRingInput): DayRingBinding {
  const focus = useDayRingFocus()
  const context = useMemo(() => projectDayStepContext(session), [session])
  const step = focus.stepOverride ?? context.suggested
  // 三个来源合成同一个闸门：抽屉广播的确认态、已落结论、以及「此刻根本不在白天」。
  const readOnly = focus.writeLocked || context.hasResolution || !active
  const intent = dayRingIntentFor({ step, nominationTarget: focus.nominationTarget, readOnly })

  const draft = context.draft
  const deadSeatIds = useMemo(
    () => Object.entries(projectCurrentPlayerStates(session))
      .filter(([, state]) => state.life === 'dead')
      .map(([seatId]) => Number(seatId)),
    [session],
  )

  const badges = useMemo(
    () => (active && step === 'vote'
      ? voteRingBadges({
        seatIds,
        raisedSeatIds: draft.raisedSeatIds,
        ghostVoteSeatIds: draft.ghostVoteSeatIds,
        nomineeSeatId: draft.nomineeSeatId,
        deadSeatIds,
      })
      : []),
    [active, deadSeatIds, draft, seatIds, step],
  )

  const execution = useMemo(
    () => (active ? projectDayExecutionMark(session.timeline, context.openDaySegmentId) : null),
    [active, context.openDaySegmentId, session.timeline],
  )

  const onSelectSeat = useCallback((seatId: number) => {
    const next = applyDayRingTap(draft, seatId, intent)
    // 引用没变 = 这一步环上没有票型可写。不 dispatch，session 连引用都不动。
    if (next === draft) return
    dispatch({ type: 'set-day-vote-draft', draft: next })
  }, [dispatch, draft, intent])

  const onConfirmGhostVote = useCallback((seatId: number) => {
    const next = applyGhostVoteTap(draft, seatId, readOnly)
    if (next === draft) return
    dispatch({ type: 'set-day-vote-draft', draft: next })
  }, [dispatch, draft, readOnly])

  return {
    intent,
    actionHint: DAY_RING_ACTION_HINT[intent],
    // 只有计票子态才把举手的人标成选中：提名步里选中的是提名双方，而那两位由三角表达，
    // 再叠一圈暖金描边会让「暖金」在同一屏里指两样东西。
    // 判据用 step 而不是 intent：确认条挂着（只读）时票还在，描边不该跟着消失——
    // 那看起来像票被清空了。
    selectedSeatIds: active && step === 'vote' ? draft.raisedSeatIds : [],
    nominatorSeatId: draft.nominatorSeatId,
    nomineeSeatId: draft.nomineeSeatId,
    emphasis: step === 'nomination' ? 'active' : 'settled',
    badges,
    execution,
    onSelectSeat: intent === 'none' ? null : onSelectSeat,
    onConfirmGhostVote: readOnly ? null : onConfirmGhostVote,
  }
}
