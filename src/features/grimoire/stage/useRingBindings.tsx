/**
 * 环上此刻承载什么语义。
 *
 * 抽出来不只是为了行数：夜、昼、座位操作三种语义的**优先级**是一条独立规则，
 * 混在舞台的渲染流程里，下一个人加第四种时会在 JSX 中间再插一个三元，
 * 而那正是「环上点一下到底会发生什么」变得没人说得清的开始。
 */
import { useEffect, useMemo, useRef } from 'react'
import { projectNightRing } from '../night/projectNightRing'
import { NightSeatOverlay } from '../night/NightSeatOverlay'
import { commitNightRingTargetFromState } from '../night/nightRingBridge'
import { nightSeatTapHint } from '../night/nightTargetTap'
import { useDayRing, type DayRingBinding } from '../day/useDayRing'
import { DayRingOverlay } from '../day/DayRingOverlay'
import type { RingLayout } from '../layout/ellipseRing'
import type { ReactNode } from 'react'
import type { ShieldLevel } from '../shield/shieldLevel'
import type { DeckNode } from '../../hosting-deck/deckNode'
import type { GameSessionState } from '../../game-session/types'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import { sessionInitialNightState, type NightWorkbenchSessionBinding } from '../../night-workbench/state/gameSessionAdapter'
import type { NightWorkbenchState } from '../../night-workbench/types'

export interface RingBindings {
  /** 座位角标层（夜序 ①②✓「缓」与草稿目标描边）。非夜间为 undefined。 */
  seatOverlays: Readonly<Record<number, ReactNode>> | undefined
  /** 点座位等于什么，进 token 的可访问名。 */
  actionHint: string
  /** 逐座位的提示语。已选中的那一座按下去是取消，不能与其它座位念同一句。 */
  actionHintFor?: (seatId: number) => string
  /** 夜间已被选为目标的座位。它们要拿到 aria-pressed，否则读屏听不出选了谁。 */
  nightTargetSeatIds: readonly number[]
  onSelectSeat: (seatId: number) => void
  day: DayRingBinding
  /** 环层叠加（提名弧、举手角标、处决帷幕）。拿到已解出的几何再画。 */
  renderRingOverlay: (layout: RingLayout) => ReactNode
  /**
   * 抽屉顶那行手势契约。null = 用节点的缺省文案。
   *
   * 它必须跟着 actionHint 同一个判据走：那行字是说书人唯一能读到的
   * 「此刻点座位会发生什么」，与实际行为不一致比不写更坏。
   */
  gestureContract: string | null
}

export interface UseRingBindingsInput {
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  deckNode: DeckNode
  seatIds: readonly number[]
  shield: ShieldLevel
  nightBinding: NightWorkbenchSessionBinding
  /** 环上点不动时要说的那句话。按下去毫无反应是最坏的反馈——他会以为自己点上了。 */
  notify: (message: string) => void
  /** 兜底：任何相位都能开的座位操作浮层。 */
  openActionBar: (seatId: number) => void
}

export function useRingBindings({
  session,
  dispatch,
  deckNode,
  seatIds,
  shield,
  nightBinding,
  notify,
  openActionBar,
}: UseRingBindingsInput): RingBindings {
  /* 夜：角标 + 点座位选目标。停在夜节点才生效——别的相位环上点座位仍是座位操作。 */
  const nightRing = deckNode === 'night' ? projectNightRing(session) : null
  const latestNightStateRef = useRef<NightWorkbenchState | null>(null)
  useEffect(() => {
    latestNightStateRef.current = nightRing ? sessionInitialNightState(nightBinding) : null
  }, [nightBinding, nightRing])
  const seatOverlays = useMemo(() => {
    if (!nightRing) return undefined
    return Object.fromEntries(seatIds.map((seatId) => [seatId, (
      <NightSeatOverlay
        key={seatId}
        badge={nightRing.badges.get(seatId) ?? null}
        targeted={nightRing.target.targets.includes(seatId)}
        targetOrdinal={nightRing.targetOrdinalBySeat.get(seatId) ?? null}
        shield={shield}
      />
    )]))
  }, [nightRing, seatIds, shield])

  /* 昼：提名弧、举手角标、处决帷幕。 */
  const day = useDayRing({
    session,
    dispatch,
    seatIds: seatIds,
    active: deckNode === 'day',
  })

  /**
   * 环上点座位此刻等于什么，只有一处判据。
   * 夜间选目标 > 白天记票型 > 座位操作——前两者是「这一步正在做的事」，
   * 座位操作是任何时候都在的兜底，所以它排最后。
   */
  /**
   * 夜环必须**先看闸门再动手**。
   *
   * 之前是先 commit 再判断，而 commitNightRingTarget 与 reducer 都不看 readOnly——
   * 于是已确认项、已暂缓项、以及「正在预览别的项」时，抽屉里那张卡是 fieldset disabled、
   * 环上却点得动，两块屏显示的是同一项。说书人回头看一条已确认的记录，
   * 目标已经被自己不小心改掉了，而读屏此刻正念着「本项此刻只读，点座位不写任何东西」。
   */
  const nightWritable = Boolean(nightRing) && nightRing!.target.targetCount > 0 && !nightRing!.target.readOnly

  const seatTap = nightRing && nightRing.target.targetCount > 0
    ? {
      /**
       * 提示语必须逐座位算，不能拿座位号 0 算一次贴给所有人。
       * 目标满员时，已选中的那一座按下去其实是**取消**，而全局那句话说的是
       * 「选为目标，替换X号」——读屏用户会以为自己重选了一次，于是再按一次
       * 把它又选回来，在同一枚目标上无限来回。
       */
      hintFor: (seatId: number) => nightSeatTapHint(nightRing.target, seatId),
      hint: nightRing.target.readOnly
        ? nightSeatTapHint(nightRing.target, 0)
        : `选${nightRing.target.targetLabel ?? '目标'}`,
      onSelect: (seatId: number) => {
        if (!nightWritable) return notify(nightSeatTapHint(nightRing.target, seatId))
        const latest = latestNightStateRef.current ?? sessionInitialNightState(nightBinding)
        const result = commitNightRingTargetFromState(nightBinding, latest, seatId)
        latestNightStateRef.current = result.next
        if (!result.committed) {
          notify(nightSeatTapHint(nightRing.target, seatId))
        }
      },
    }
    : day.onSelectSeat
      ? { hint: day.actionHint, onSelect: day.onSelectSeat }
      : { hint: '座位操作', onSelect: openActionBar }


  const renderRingOverlay = (layout: RingLayout) => (
    <DayRingOverlay
      layout={layout}
      seatIds={seatIds}
      shield={shield}
      nominatorSeatId={day.nominatorSeatId}
      nomineeSeatId={day.nomineeSeatId}
      emphasis={day.emphasis}
      badges={day.badges}
      execution={day.execution}
      onConfirmGhostVote={day.onConfirmGhostVote}
    />
  )

  const gestureContract = nightRing && nightRing.target.targetCount > 0
    ? `点座位 = 选${nightRing.target.targetLabel ?? '目标'}；确认仍在抽屉底栏`
    : day.onSelectSeat
      ? `点座位 = ${day.actionHint}；落账仍在抽屉里`
      : null

  return {
    seatOverlays,
    actionHint: seatTap.hint,
    actionHintFor: 'hintFor' in seatTap ? seatTap.hintFor : undefined,
    nightTargetSeatIds: nightRing?.target.targets ?? [],
    onSelectSeat: seatTap.onSelect,
    day,
    renderRingOverlay,
    gestureContract,
  }
}
